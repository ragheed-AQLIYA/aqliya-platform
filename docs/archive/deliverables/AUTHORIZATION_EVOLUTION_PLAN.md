# Phase 5 — Authorization Evolution Plan

**Date:** 2026-06-20  
**Scope:** RBAC → RBAC + ABAC evolution, organization/workspace/ownership/sensitivity/evidence rules  
**Data Sources:** `src/middleware.ts`, `src/lib/platform/access/`, `src/lib/platform/abac/`, `src/core/access/`, `src/lib/audit/tenant-guard.ts`, `src/lib/platform/guards/`

---

## Executive Summary

AQLIYA has a production-grade RBAC system with 4 roles, 55 permission slugs, Separation of Duties enforcement, and middleware integration. An ABAC policy engine exists but is completely disconnected from any authorization flow. Authorization decisions are made in 4 separate layers that don't compose, creating gaps and inconsistencies.

**Authorization Score: 6.5/10** — strong RBAC foundation, incomplete ABAC, no unified decision point

---

## 1. Current State Assessment

### 1.1 RBAC — Platform Access (`src/lib/platform/access/`)

**Strength:** L5 production-ready
- 4 roles: admin, manager, operator, viewer
- 55 permission slugs across 10 product groups
- SoD enforcement with HARD/SOFT conflict levels
- Database-backed with `RbacService` class
- Used by middleware for route-level access via `routeMinRoles`
- Has workspace-level access validation

**Weakness:** 
- Static role-permission mapping (not configurable per-org)
- No hierarchical roles (admin inherits all, but this is hardcoded not configurable)
- No custom roles
- Permissions are seeded, not created through an admin UI

### 1.2 ABAC — Attribute Access (`src/lib/platform/abac/`)

**Strength:** L3 prototype with real potential
- Full policy CRUD: createPolicy, updatePolicy, deletePolicy
- Policy evaluation engine: evaluateAccess() with condition matching
- 8 operators: EQUALS, NOT_EQUALS, IN, NOT_IN, GREATER_THAN, LESS_THAN, CONTAINS, EXISTS
- Context-aware: user attributes, resource attributes, time, role, custom

**Weakness:** 
- **NOT WIRED into any authorization flow** — no middleware integration, no API call
- No UI for policy management
- No default policies seeded
- No integration with the middleware's `routeMinRoles` map

### 1.3 Middleware Gate (`src/middleware.ts`)

- Static `routeMinRoles` map: route prefix → minimum role
- Checks session, maps role, compares to minimum
- Fast (no DB call), but rigid
- No product-specific permission awareness

### 1.4 Core Access (`src/core/access/`)

- `CoreAccessControl` class with deny-by-default
- `requireServerActionAccess()`, `requireReadAccess()`, `requireMutationAccess()`
- Thin layer over platform access — adds audit logging for denials
- Used by some server actions but not consistently

### 1.5 Tenant/Workspace Guards

- `src/lib/audit/tenant-guard.ts` — AuditOS-specific tenant check
- `src/lib/platform/guards/` — Platform-org guard + workspace guard (report-only diagnostic mode)
- `src/lib/workflowos/tenant-guard.ts` — WorkflowOS-specific
- Duplicated tenant isolation logic across products

---

## 2. Decision Point Gap

**Current authorization flow:**

```
Request
  │
  ├──→ Middleware (routeMinRoles)
  │     └──→ Checks role against static map
  │           └──→ If insufficient → 302 to /access-denied
  │
  ├──→ Server Action / API Route
  │     └──→ May call RbacService.hasPermission()
  │           └──→ May call SoD check
  │                 └──→ May call CoreAccessControl
  │                       └──→ May write audit log for denial
  │
  └──→ ABAC is NEVER called
```

**Missing:** A single `authorize()` function at the middleware level that composes:
1. **Route gate** (what routes can this role access?)
2. **Permission check** (what actions can this role perform?)  
3. **ABAC evaluation** (what resource-level policies apply?)
4. **Tenant isolation** (what organization/workspace does this user own?)
5. **Audit logging** (authorization decisions logged for forensics)

---

## 3. Target Architecture: Unified Authorization Framework

### 3.1 Authorization Pipeline

```typescript
// Unified authorization API
async function authorize(
  request: AuthorizeRequest
): Promise<AuthorizeResult> {
  // 1. Authentication gate
  const session = await getSession();
  if (!session) return DENIED('unauthenticated');

  // 2. Route-level gate (fast path, no DB)
  const routeGate = checkRouteAccess(session.role, request.route);
  if (!routeGate.allowed) return DENIED('route_restricted');

  // 3. Permission check (DB-backed)
  const permissionCheck = await checkPermission(session.userId, request.action);
  if (!permissionCheck.allowed) return DENIED('insufficient_permissions');

  // 4. ABAC evaluation (policy-backed)
  const abacResult = await evaluateAccess({
    resourceType: request.resourceType,
    userId: session.userId,
    organizationId: session.orgId,
    resource: request.resource,
    action: request.action
  });
  if (abacResult.effect === 'DENY') return DENIED('policy_blocked');

  // 5. Tenant isolation
  const tenantCheck = validateTenantAccess(session.orgId, request.resourceOrgId);
  if (!tenantCheck.allowed) return DENIED('cross_tenant_blocked');

  // 6. Audit trail
  await writeAuditLog({
    action: 'authorization_check',
    result: 'ALLOWED',
    context: { route, permission, abac, tenant }
  });

  return ALLOWED();
}
```

### 3.2 Rule Model

| Rule Type | Scope | Examples | Enforcement |
|-----------|-------|----------|-------------|
| **Role** | User-level | admin, manager, operator, viewer | Middleware |
| **Permission** | Resource-action level | audit.engagement.read, sales.deal.write | Server action guard |
| **ABAC Policy** | Resource-instance level | "Manager can read engagements they created" | Authorization middleware |
| **Tenant** | Organization-level | "User X belongs to Org Y" | All layers |
| **Ownership** | Record-level | "User can edit their own records" | ABAC condition |
| **Sensitivity** | Data-level | "Sensitivity HIGH requires admin" | ABAC policy |
| **SoD** | Cross-role | "Cannot be both creator and approver" | RBAC service |

### 3.3 Sample ABAC Policies

```typescript
// Organization-level policy: Managers in Org X can review engagements
{
  resourceType: 'audit_engagement',
  effect: 'ALLOW',
  conditions: [
    { field: 'user.organizationId', operator: 'EQUALS', value: '{orgId}' },
    { field: 'resource.status', operator: 'IN', value: ['under_review', 'ready_for_approval'] },
    { field: 'user.role', operator: 'EQUALS', value: 'manager' }
  ]
}

// Sensitivity policy: HIGH sensitivity requires admin or explicit delegation
{
  resourceType: 'sales_deal',
  effect: 'ALLOW',
  conditions: [
    { field: 'resource.sensitivity', operator: 'EQUALS', value: 'HIGH' },
    { field: 'user.role', operator: 'IN', value: ['admin', 'manager'] }
  ]
}

// Ownership policy: Users can edit their own draft records
{
  resourceType: 'decision',
  effect: 'ALLOW',
  conditions: [
    { field: 'resource.ownerId', operator: 'EQUALS', value: '{userId}' },
    { field: 'resource.status', operator: 'EQUALS', value: 'draft' }
  ]
}

// Evidence access policy: Only users who created or were assigned evidence can view
{
  resourceType: 'audit_evidence',
  effect: 'ALLOW',
  conditions: [
    { field: 'user.id', operator: 'IN', value: '{resource.assignedTo}' },
    { field: 'user.id', operator: 'EQUALS', value: '{resource.createdById}' }
  ]
}

// Deny policy: Contractors cannot access financial data
{
  resourceType: 'audit_engagement',
  effect: 'DENY',
  conditions: [
    { field: 'user.type', operator: 'EQUALS', value: 'contractor' },
    { field: 'resource.type', operator: 'EQUALS', value: 'financial_statement' }
  ]
}
```

---

## 4. Migration Plan

### Phase 1 — Unify Authorization Decision Point (Week 1-2)

| Step | Action | Effort |
|------|--------|--------|
| 1.1 | Create `authorize()` function in `src/lib/platform/access/` | 2 days |
| 1.2 | Wire middleware to call `authorize()` instead of static `routeMinRoles` | 3 days |
| 1.3 | Add audit logging to all authorization decisions | 1 day |
| 1.4 | Create `requireAuthorized()` for server actions | 1 day |

### Phase 2 — Wire ABAC into Authorization Pipeline (Week 3-4)

| Step | Action | Effort |
|------|--------|--------|
| 2.1 | Add ABAC evaluation step to `authorize()` | 2 days |
| 2.2 | Seed default ABAC policies (tenant isolation, sensitivity) | 2 days |
| 2.3 | Add ABAC policy management API | 3 days |
| 2.4 | Write comprehensive ABAC tests | 2 days |

### Phase 3 — Product-Level Rules (Week 5-8)

| Step | Action | Effort |
|------|--------|--------|
| 3.1 | Define ownership rules per product | 3 days |
| 3.2 | Define sensitivity rules per product | 3 days |
| 3.3 | Define evidence access rules | 2 days |
| 3.4 | Migrate product-specific guards to unified system | 5 days |

### Phase 4 — Admin UI & Self-Service (Week 9-10)

| Step | Action | Effort |
|------|--------|--------|
| 4.1 | Build ABAC policy management UI | 5 days |
| 4.2 | Build role/permission admin UI | 3 days |
| 4.3 | Build authorization audit log viewer | 2 days |

**Total Estimated Effort:** **10 weeks**

---

## 5. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Adding ABAC evaluation to every request increases latency | Performance impact | Cache policy evaluations per session, evaluate asynchronously |
| Complex policies make authorization unpredictable | User confusion | Document all policies, provide "why was I denied?" UI |
| Migration from static routeMinRoles breaks existing access | Auth failures | Ship with fallback to old system; test thoroughly |
| ABAC policies contradict RBAC permissions | Contradictory state | Policy DENY always wins; document priority rules |

---

## 6. Scoring

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Unified decision point | No (4 layers) | Yes | ✓ |
| ABAC wired into auth flow | No | Yes | ✓ |
| Ownership rules | None | Per-product | ✓ |
| Sensitivity rules | None | Per-data-classification | ✓ |
| Evidence access rules | None | Complete | ✓ |
| Self-service admin UI | None | Available | ✓ |
| Authorization audit log | Partial | Complete | ✓ |
| **Composite** | **6.5/10** | **9.5/10** | **3.0** |
