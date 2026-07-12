# AQLIYA Authorization — Target Model

> **Status:** Architecture design | **Date:** 2026-07-10  
> **Purpose:** Define the single, coherent authorization model for all AQLIYA governed products  
> **Basis:** Current-state analysis at `AQLIYA_AUTHORIZATION_CURRENT_STATE.md`  
> **Migration plan:** `AQLIYA_AUTHORIZATION_MIGRATION_PLAN.md`

---

## 1. Design Goals

1. **Single enforcement stack** — one way to authorize every action across the platform
2. **Product-neutral platform core** — authorization primitives live in platform, not products
3. **Resource-scoped decisions** — not just route-level or role-level, but per-resource (project, engagement, deal, document)
4. **Tenant isolation by default** — every authorization decision includes organization scoping
5. **Traceable decisions** — every allow/deny is loggable with reason and context
6. **Incremental viability** — each phase of migration improves the system independently
7. **Backward compatibility during migration** — existing product code not forced to rewrite overnight

---

## 2. Design Principles

### P1 — Authorization is a platform service, not a product concern

Products define what they need (resources, actions). The platform defines how authorization is evaluated.

### P2 — Middleware protects routes; authorization protects resources

Middleware is the first line (coarse). Authorization is the second line (fine-grained). They are not substitutes.

### P3 — Deny is the default; allow requires explicit policy

Every authorization path should default to deny unless a policy, role, or permission explicitly allows.

### P4 — Tenant scope is non-negotiable

Every cross-organization resource access must be explicitly authorized (admin override is explicit, not implicit).

### P5 — Authorization decisions are audit events

Every authorization decision (especially denies) should be recorded in `PlatformAuditLog` for operational analysis, not just mutation actions.

### P6 — Authorization is separate from business governance

"Can this user do this action?" is authorization.
"Is this workflow state valid for this transition?" is business governance.
These must remain separable, composable concerns.

---

## 3. Authorization Architecture Overview

```
                         ┌─────────────────────────────────────┐
                         │       Authentication Layer          │
                         │  NextAuth v5 → JWT → CurrentUser    │
                         └──────────────┬──────────────────────┘
                                        │
                         ┌──────────────▼──────────────────────┐
                         │     Middleware (Route Boundary)      │
                         │  auth check → role gate → MFA gate  │
                         │  routeMinRoles (coarse, fast)       │
                         └──────────────┬──────────────────────┘
                                        │
                         ┌──────────────▼──────────────────────┐
                         │     Authorize() — Single Entry      │
                         │  src/lib/authorization/authorize.ts │
                         └──────┬───────────────┬──────────────┘
                                │               │
                   ┌────────────▼───┐    ┌──────▼────────────┐
                   │  Tenant Guard  │    │  RBAC Permission  │
                   │  (always on)   │    │  (role→action map)│
                   └────────────────┘    └──────┬───────────┘
                                                │
                                     ┌──────────▼───────────┐
                                     │  Policy Evaluation   │
                                     │  RB-02 engine (6 stg)│
                                     │  9 policies active   │
                                     └──────────┬───────────┘
                                                │
                                     ┌──────────▼───────────┐
                                     │  ABAC Conditions     │
                                     │  (opt-in, attribute) │
                                     └──────────┬───────────┘
                                                │
                                     ┌──────────▼───────────┐
                                     │  Authorization Result │
                                     │  { allowed, reason,  │
                                     │    trace, audit }    │
                                     └──────────────────────┘
```

### Key architectural decisions

1. **`authorize()` is the single entry point** — all server action and API route authorization routes through it
2. **Middleware remains the first gate** — but only for route-level protection (is this user allowed on this route family?)
3. **Product guards remain as thin wrappers** — `guardEngagementAccess()` calls `enforce()`, but the logic lives in the platform
4. **RB-02 engine becomes primary enforcement** — promoted from shadow to active, behind a per-org feature flag rollout
5. **ABAC is an extension point** — opt-in, policy-based, not required for basic authorization

---

## 4. Layer Responsibilities

### 4.1 Authentication / Session Context

| Responsibility | Does | Does Not Do |
|--------------|------|-------------|
| Resolve session | Decode JWT, return `CurrentUser` | Check permissions |
| Provide identity | `getCurrentUser()` → `{ id, email, name, role, orgId }` | Make allow/deny decisions |
| Supply token role | JWT carries `role` from `UserRole` enum | Override stored role |
| Support MFA state | JWT carries `mfaEnabled`, `mfaVerified` | Enforce MFA (middleware does this) |

**Target contract:**
```typescript
interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;          // Single canonical role (ADMIN | OPERATOR | VIEWER)
  organizationId: string;
  platformOrganizationId?: string;
  organization: { id: string; name: string };
}
```

**No changes needed** — `CurrentUser` in `src/lib/auth.ts` already provides this contract.

### 4.2 Middleware / Route Boundary Enforcement

| Responsibility | Does | Does Not Do |
|--------------|------|-------------|
| Authenticate | Redirect to `/login` if no valid JWT | Authorize resource access |
| Route gate | Check `routeMinRoles` map | Make per-resource decisions |
| MFA gate | Redirect to MFA setup/verify if required | Bypass product-level authz |
| Security headers | Set CORS, CSP, timing headers | Log authorization decisions |

**Target model:**
```typescript
// routeMinRoles remains the first gate — it is NOT authorization
const routeMinRoles: Record<string, string> = {
  "/audit": "viewer",
  "/decisions": "viewer",
  "/local-content": "viewer",
  // ... all governed routes
  "/institutional-memory": "viewer",  // added in hardening fix
};
```

The middleware continues to be **coarse and fast**. It does not replace the `authorize()` call at the action layer.

### 4.3 Action / API Authorization Enforcement

| Responsibility | Does | Does Not Do |
|--------------|------|-------------|
| Authorize action | Call `authorize()` with user, resource, action | Replace business governance |
| Enforce tenant | Always run tenant guard | Bypass for admin (explicit only) |
| Record decision | Log to `PlatformAuditLog` | Store in product tables |
| Return result | `{ allowed, reason, principal }` | Modify application state |

**Target contract — every protected action follows this pattern:**
```typescript
"use server";

export async function approveEngagement(engagementId: string) {
  // Step 1: Resolve identity (fast, no DB)
  const user = await getCurrentUser();

  // Step 2: Authorize (tenant + RBAC + policies + optional ABAC)
  await enforce(user, { type: "engagement", id: engagementId }, "approve");

  // Step 3: Business logic (only reached if authorized)
  const result = await engagementService.approve(engagementId, user.id);
  return { success: true, data: result };
}
```

**This is the target pattern for every mutation action across all products.**

### 4.4 Domain / Workflow / Governance Boundary

| Responsibility | Does | Does Not Do |
|--------------|------|-------------|
| Business governance | Enforce workflow state transitions | Check user permissions |
| Evidence gates | Verify required evidence exists | Authorize who can upload |
| Approval routing | Determine who must approve | Decide if approver has permission |

**Distinction rule:**
- If the question is **"can this person (role) do this?"** → it's authorization → use `authorize()`
- If the question is **"can this action happen in the current workflow state?"** → it's governance → use workflow engine
- If the question is **"has the required evidence been collected?"** → it's governance → check after authorization

Example — SalesOS transition guard pipeline (`src/lib/salesos/workflow/guards.ts`):
```typescript
// This is BUSINESS GOVERNANCE, not authorization
export function evidenceGate(deal: Deal, ctx: GuardContext): GuardResult {
  // Checks if required evidence exists for the transition
  // It does not check WHO the user is — authorization already happened
}
```

---

## 5. Authorization Decision Contract

The `authorize()` call is the single authorization contract. All layers must speak this contract.

### Input Contract

```typescript
interface AuthorizeOptions {
  user: CurrentUser;                    // Authenticated user
  resource: {
    type: ResourceType;                 // "engagement" | "project" | "deal" | "decision" | ...
    id?: string;                        // Specific resource instance
    tenantId?: string;                  // Override tenant context (defaults to user.orgId)
  };
  action: AccessAction;                 // "read" | "create" | "update" | "delete" | "approve" | "export" | ...
  context?: {
    requiredRole?: RequiredRole;        // Override minimum role for this action
    attributes?: Record<string, any>;   // ABAC attributes (optional)
    requireMfa?: boolean;
  };
}
```

### Output Contract

```typescript
interface AuthorizationResult {
  allowed: boolean;                     // true = proceed, false = deny
  reason?: string;                      // Human-readable explanation
  principal?: Principal;                // Resolved user principal
}
```

### Existing alignment

The current `authorize()` in `src/lib/authorization/authorize.ts` already implements this contract.
**No changes needed** to the contract itself — only adoption changes.

---

## 6. Permission Model

### 6.1 Roles — Single Normalized Model

The target model uses **one role representation** with clear hierarchy:

| Role | Level | Description |
|------|-------|-------------|
| `admin` | 3 | Full platform access, user management, settings |
| `manager` | 2 | Approve/reject, manage team, export |
| `operator` | 1 | Create/update, review, daily operations |
| `viewer` | 0 | Read-only, export permitted |

All code internal to the platform uses normalized lowercase roles. The JWT stores the Prisma enum (`ADMIN`/`OPERATOR`/`VIEWER`) and is normalized at the boundary.

### 6.2 Permission Model Structure

```
Role (admin|manager|operator|viewer)
  └── ROLE_PERMISSIONS[role] → Permission[]
        ├── "read"       — view resource
        ├── "create"     — create new resource
        ├── "update"     — modify existing
        ├── "delete"     — remove
        ├── "approve"    — approve workflow step
        ├── "reject"     — reject workflow step
        ├── "review"     — add review comments
        ├── "export"     — export/download
        ├── "admin"      — administrative operations
        └── "manage_users" — manage roles/assignments
```

### 6.3 Route Minimum Roles (Separate concept)

Route minimum roles remain a **coarse, edge-level concept** — they are NOT authorization:

| Route Class | Minimum Role |
|------------|-------------|
| Governed workspace routes | `viewer` |
| Platform operator routes | `admin` |
| Platform monitoring routes | `admin` |
| Settings — general | `viewer` |
| Settings — SSO | `admin` |
| Public/demo routes | None (public) |

### 6.4 Product Permission Namespaces

Products do NOT define custom role systems. Instead, they use the shared `AccessAction` enum with resource types:

| Product | Resource Types | Key Actions |
|---------|---------------|-------------|
| AuditOS | `engagement`, `evidence`, `report` | approve, review, export |
| LocalContentOS | `project`, `supplier`, `classification` | classify, review, approve |
| DecisionOS | `decision`, `recommendation` | approve, export, simulate |
| SalesOS | `deal`, `account`, `opportunity` | approve, review, export |
| WorkflowOS | `record`, `template` | execute, export |
| Platform | `settings`, `organization`, `workspace` | admin, manage_users |

**No product defines its own role hierarchy.** All use the shared `admin/manager/operator/viewer` roles. Product-specific distinctions go through the `AccessAction` on a resource type, not through custom roles.

---

## 7. Tenant / Ownership / Reviewer / Admin Semantics

### 7.1 Tenant Isolation (Always On)

**Rule:** A user may only access resources belonging to their own organization.

```typescript
// tenant-guard.ts — unified, always evaluated
async function checkTenantAccess(user: CurrentUser, resource: { tenantId?: string }): boolean {
  const targetTenant = resource.tenantId ?? user.organizationId;
  if (user.role === "ADMIN") return true;  // Explicit cross-tenant access for admin
  return user.organizationId === targetTenant;
}
```

**The target model has ONE tenant guard.** The AuditOS parallel `AuditOrganization` must converge on the platform `Organization` model. Until that happens, the bridge (`platformOrganizationId` on `AuditOrganization`) must be the sole tenant resolution path for AuditOS.

### 7.2 Ownership

Ownership is handled through the RB-02 engine's policy evaluation, not through separate checks:
- **POL-01 (Ownership Rule):** Confirms organization context
- **POL-02 (Creator Privilege):** Resource creators may have additional access
- Ownership is a policy input, not a separate authorization path

### 7.3 Reviewer / Approver Separation

Reviewer/approver roles are **not authorization roles** — they are workflow governance roles:
- Authorization determines: "can this user act as a reviewer?"
- Workflow determines: "is this user the assigned reviewer?"
- The target model keeps these separate

**Example authorization flow for approval:**
```typescript
// Authorization: can this user approve deals?
await enforce(user, { type: "deal", id: dealId }, "approve");

// Governance: is this user the assigned reviewer?
if (deal.assignedReviewerId !== user.id) {
  throw new Error("You are not the assigned reviewer for this deal");
}
```

### 7.4 Admin Override

Admin override is **explicit and auditable**:
- Admin bypasses tenant isolation (by design — for platform operations)
- Admin does NOT bypass product-specific business rules
- Admin actions should be logged with the admin flag in the audit event
- Service/system actors (API keys, background jobs) must be explicitly configured for scoped access, not treated as "admin"

---

## 8. Product Integration Model

### 8.1 Platform Core Provides

| Primitive | Consumers |
|-----------|-----------|
| `getCurrentUser()` — identity resolution | All server actions |
| `authorize(options)` — single authorization call | All authorization decisions |
| `enforce(user, resource, action)` — throw on deny | Standard pattern |
| `isAllowed(user, resource, action)` — boolean check | Conditional access |
| `guardResourceAccess(user, resourceType, id, action)` — product guard template | Product guard wrappers |
| `tenant-guard.ts` — unified tenant isolation | All tenant checks |
| RB-02 engine + policies | Policy evaluation |

### 8.2 Products Provide

| Artifact | Examples |
|----------|----------|
| Resource type identifiers | `"engagement"`, `"project"`, `"deal"` |
| Action requirements | `{ type: "engagement", action: "approve" }` |
| Policy context (optional) | Workflow state, sensitivity, attributes |
| Thin guard wrappers (optional) | `guardEngagementAccess()` → calls `enforce()` |

### 8.3 Products Do NOT

- Define their own role systems
- Implement their own tenant isolation
- Create their own permission check functions
- Bypass `authorize()` for operations that affect platform resources

### 8.4 What Stays Product-Specific (Legitimate)

- Workflow governance rules (transition guards, evidence requirements)
- Business logic validations (e.g., "can this engagement be published?")
- Notification routing for approval requests
- These are NOT authorization — they are governance, implemented in the product domain

---

## 9. Policy Evaluation Patterns

### 9.1 Standard Flow (No Policies)

```
authorize()
  → Tenant Guard              (organization check)
  → RBAC Permission Check     (role → action permission)
  → ALLOW or DENY
```

This covers ~80% of actions. No RB-02 engine needed for simple role-based access.

### 9.2 Policy-Enhanced Flow

```
authorize()
  → Tenant Guard
  → RBAC Permission Check
  → RB-02 Engine              (active mode — not shadow)
      → POL-01 Ownership
      → POL-02 Creator Privilege
      → POL-03 Project Scope
      → ... up to 9 policies
  → ABAC Conditions           (optional)
  → ALLOW | DENY | REQUIRE_APPROVAL | READ_ONLY
```

This covers complex cases: ownership, time-based access, approval gates, resource sensitivity, external auditor restrictions.

### 9.3 When to Use Which

| Situation | Flow Type |
|-----------|-----------|
| Simple CRUD on user-owned resource | Standard (RBAC only) |
| Cross-organization access | Standard + tenant guard |
| Approval workflow | Policy-enhanced |
| Time-sensitive access | Policy-enhanced (POL-06) |
| Sensitive resource handling | Policy-enhanced (POL-08) |
| External auditor | Policy-enhanced (POL-05) |
| Bulk operations | Policy-enhanced (POL-09) |

### 9.4 Policy Engine Activation Strategy

The RB-02 engine is:
- **OFF by default** (shadow mode) — Phase 1–2 of migration
- **ON for specific orgs via feature flag** — Phase 3 of migration
- **ON platform-wide** — Phase 5 of migration (final state)

---

## 10. Logging / Auditability Expectations for Authorization Decisions

### What must be logged

| Event | Log target | Priority |
|-------|-----------|----------|
| Authorization DENY | `PlatformAuditLog` | Required |
| Authorization ALLOW (unusual context) | `PlatformAuditLog` | Recommended |
| Tenant isolation violation | `PlatformAuditLog` | Required |
| Admin cross-tenant access | `PlatformAuditLog` | Required |
| Shadow engine parity mismatch | Shadow logger | Migration aid |

### What is NOT logged (by authorization layer)

- Successful read authorizations (too noisy)
- Business governance denials (logged by workflow engine)
- Authentication failures (logged by auth layer)

---

## 11. Anti-Patterns to Prohibit

| Anti-Pattern | Why | Replacement |
|-------------|-----|-------------|
| `requireUserContext("ADMIN")` for resource-scoped authorization | Skips tenant check, permission model | `enforce(user, { type, id }, "admin")` |
| Product-specific `canPerformAction()` | Duplicates role logic | Use shared `ROLE_PERMISSIONS` |
| Inline role string comparison in actions | Role vocabulary fragmentation | Normalize at facade boundary |
| Bypassing tenant guard with admin | Works but logs missing | Use `context.bypassTenantCheck: true` only when necessary AND logged |
| Authz decision without audit trail | Unrecoverable if questioned | Always call `writePlatformAuditLog` on deny |
| Product-local guard doing both authz AND business logic | Coupled concerns | Separate into `authorize()` + workflow guard |
| Silent catch on authorization | Hides denial reason | Let `enforce()` throw; handle at action boundary |

---

## 12. Target-State Verdict

**The target authorization model is NOT a new invention — it is a discipline-enforcing wrapper around the system that already exists in `src/lib/authorization/`.**

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Authorization entry point | `requireUserContext()` (87 files) + `authorize()` (15 files) | `authorize()` for all (single entry) | Migration needed |
| Role model | 3 vocabularies | 1 normalized vocabulary | Implementation alignment |
| Tenant isolation | Fragmented (AuditOS separate) | Unified `tenant-guard.ts` everywhere | AuditOS convergence needed |
| Policy engine | Shadow mode only | Active (with gradual rollout) | Feature flag promotion |
| Authz audit trail | Not centralized | All denials logged to `PlatformAuditLog` | Audit hook addition |
| Product guards | Some use facade, some independent | All use `authorize()` under thin wrappers | Migration per product |
| Authorization documentation | Emergent | Documented architecture | This document |

**Target maturity: L5** (documented, unified, auditable, product-independent).

**Irreducible complexity:** The target model does NOT attempt to make authorization "simple" — resource-scoped, tenant-aware, policy-evaluated authorization is inherently non-trivial. What it achieves is **coherence**: one way to reason about authorization across all products.

---

## Model Limitations and Known Gaps

### 1. AuditOS Tenant Isolation

The target model assumes a single `tenant-guard.ts` for all products. **This is not currently achievable** because AuditOS uses a parallel identity graph (`AuditOrganization`/`AuditUser`) that is separate from the platform `Organization`/`User` model. Until an ADR and implementation program converge these models, `authorize()` for AuditOS resources must route through `guardEngagementAccess()` which understands the AuditOS tenant context. The `platformOrganizationId` bridge on `AuditOrganization` is the canonical resolution path.

**Current workaround:** `product-guards.ts` → `guardEngagementAccess()` wraps the tenant context appropriately for AuditOS. The unified `tenant-guard.ts` is the target; this bridge is the interim.

### 2. LocalContentOS Custom Action Model

The target model states products define resource types but NOT custom action/role systems. LocalContentOS currently has a complete custom guard (`canPerformAction()` with `ProjectAction` enum in `src/lib/local-content/guards.ts`). This cannot be replaced by a simple `enforce()` call because:
- `ProjectAction` has 9 actions that map differently to roles than the global `AccessAction` → `ROLE_PERMISSIONS` mapping
- The custom system includes its own role logic (`ADMIN`/`OPERATOR` → create_supplier, etc.)
- It predates the `authorize()` facade and was built before the shared permission model existed

**Migration path:** Requires a direct mapping from `ProjectAction` values to `AccessAction` values, and possibly a temporary extended permission set. See `AQLIYA_AUTHORIZATION_MIGRATION_PLAN.md` Phase 4c for the parallel evaluation strategy.

### 3. Performance Overhead of Full Pipeline

The target model routes every authorization through `authorize()` which may include tenant guard + RBAC check + optional ABAC + optional RB-02 policy pipeline. The standard flow (tenant guard + RBAC) is lightweight (no DB calls after JWT resolution). The policy-enhanced flow (with RB-02 engine) adds measurable latency.

**Guideline:**
- Standard flow (no engine): always — use for all CRUD and simple role checks
- Policy-enhanced flow (with engine): when the action involves ownership, time windows, sensitivity, approval gates, external restrictions, or bulk operations
- The action type determines which flow: `approve`, `reject` → policy-enhanced; `read`, `create`, `update` → standard

---

**Evidence basis:** `AQLIYA_AUTHORIZATION_CURRENT_STATE.md`, full code inventory, existing `authorize()` facade, RB-02 engine, product guard patterns  
**Status:** DONE
