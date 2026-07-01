# Authorization Unification Plan — Phase 1

**Generated:** 2026-06-24
**Based on:** Permission System Audit (PERMISSION_SYSTEM_AUDIT.md) and evidence from 30+ authorization files.

---

## 1. Current State

4+ authorization systems discovered + 7 product-specific guards + 30+ authorization-related files:

1. **Middleware Layer** — `src/middleware.ts` (Edge JWT + RBAC)
2. **Server Action Guard** — `src/core/access/server-action-guard.ts`
3. **Platform RBAC** — `src/lib/platform/access/rbac-service.ts` + 6 related files
4. **ABAC Engine** — `src/lib/platform/abac/` (disconnected)
5. **Product Guards** — 7 files across Audit, Sales, LocalContent, WorkflowOS, Platform

---

## 2. Target Architecture

```
Unified Authorization Facade (src/lib/authorization/)
├── authorize.ts          — Single authorize() entry point
├── types.ts              — Shared types (Principal, Permission, Resource)
├── middleware-bridge.ts  — Bridge to edge middleware
├── action-guard.ts       — Bridge to server actions
├── product-guards.ts     — Shared product guard logic
├── tenant-guard.ts       — Unified tenant isolation
├── permission-resolver.ts — Role → resolved permissions
└── abac-bridge.ts        — ABAC integration (future)
```

### Design Principles
1. **Single entry point** — Every authorization check routes through `authorize()`
2. **Product-specific guards become thin wrappers** — Product guard files import from shared service
3. **Tenant isolation is unified** — One tenant resolution path applies to all products
4. **ABAC is wired in** — Existing ABAC engine is connected through the facade
5. **Backward compatible** — Existing middleware and product guards continue working during migration

---

## 3. Migration Plan

### Phase 1A: Create Unified Facade (Days 1-2)
1. Create `src/lib/authorization/` directory
2. Implement `authorize.ts` — single entry point
3. Implement `types.ts` — shared types
4. Implement `tenant-guard.ts` — unified tenant isolation
5. Implement `permission-resolver.ts` — role → permission mapping
6. Write unit tests for authorize()

### Phase 1B: Migrate Product Guards (Days 3-5)
1. AuditOS: Rewrite `tenant-guard.ts` to use facade
2. SalesOS: Rewrite `guards.ts` + `permissions.ts` to use facade
3. LocalContentOS: Rewrite `guards.ts` to use facade
4. WorkflowOS: Rewrite `tenant-guard.ts` to use facade
5. Platform: Rewrite `platform-org-guard.ts`, `workspace-guard.ts`

### Phase 1C: Remove Duplication (Days 5-6)
1. Evaluate `src/lib/core/access/` — consolidate or remove
2. Evaluate `src/core/access/access-control.ts` — consolidate with new facade
3. Remove duplicate access control files

### Phase 1D: Wire ABAC (Day 7)
1. Connect `abac-service.ts` to the authorization facade
2. Add ABAC condition evaluation to `authorize()`

### Phase 1E: Tests (Days 7-8)
1. Role-based access tests
2. Tenant isolation tests (cross-product)
3. Permission resolution tests
4. ABAC integration tests
5. Middleware integration test

---

## 4. New File Structure

```
src/lib/authorization/
├── __tests__/
│   ├── authorize.test.ts
│   ├── tenant-guard.test.ts
│   ├── permission-resolver.test.ts
│   ├── abac-bridge.test.ts
│   └── cross-product-isolation.test.ts
├── index.ts              — Public API exports
├── authorize.ts          — authorize(session, resource, action) → boolean
├── types.ts              — Principal, Permission, Resource, Action types
├── middleware-bridge.ts  — Connects middleware routeMinRoles to facade
├── action-guard.ts       — enforceAuthorized() for server actions
├── tenant-guard.ts       — Unified tenant resolution
│   ├── resolveTenant(session) → tenantId
│   └── assertTenantAccess(session, resourceId)
├── permission-resolver.ts
│   └── resolvePermissions(role) → Permission[]
├── product-guards.ts     — Shared product guard logic
└── abac-bridge.ts        — Wire ABAC into authorization
    └── evaluateAbac(session, resource, action) → boolean
```

---

## 5. authorize() API Design

```typescript
// Single entry point for all authorization checks
type AuthorizeOptions = {
  session: Session;
  resource: {
    type: 'engagement' | 'project' | 'deal' | 'workspace' | 'organization' | 'record';
    id: string;
    tenantId?: string;
  };
  action: 'read' | 'write' | 'create' | 'delete' | 'approve' | 'export' | 'admin';
  context?: {
    requireMfa?: boolean;
    requireApproval?: boolean;
    bypassTenantCheck?: boolean;
  };
};

async function authorize(options: AuthorizeOptions): Promise<AuthorizationResult> {
  // 1. Resolve principal (role + user info)
  // 2. Check tenant isolation
  // 3. Resolve permissions from role
  // 4. Check ABAC conditions (if configured)
  // 5. Return result with reason on failure
}
```

---

## 6. Migration Sequence

| Step | Action | Files Affected | Risk |
|------|--------|---------------|------|
| 1 | Create `src/lib/authorization/` | New files | Low |
| 2 | Export facade from `src/lib/authorization/index.ts` | 1 new file | Low |
| 3 | Update `server-action-guard.ts` to use facade | `src/core/access/server-action-guard.ts` | Medium |
| 4 | Update AuditOS guard | `src/lib/audit/tenant-guard.ts` | Medium |
| 5 | Update SalesOS guards | `src/lib/sales/guards.ts`, `permissions.ts` | Medium |
| 6 | Update LocalContentOS guards | `src/lib/local-content/guards.ts` | Medium |
| 7 | Update WorkflowOS guard | `src/lib/workflowos/tenant-guard.ts` | Medium |
| 8 | Update Platform guards | `src/lib/platform/guards/*.ts` | Medium |
| 9 | Remove `src/lib/core/access/` | 1 file | Low |
| 10 | Wire ABAC | `src/lib/platform/abac/abac-service.ts` | Low |
| 11 | Full test suite | ~10 test files | Low |

---

## 7. Success Criteria

- [ ] Single `authorize()` function used by all products
- [ ] All product guard files become thin wrappers
- [ ] Tenant isolation logic consolidated in one place
- [ ] ABAC engine wired into authorization flow
- [ ] 100% of authorization paths have tests
- [ ] Middleware still works (backward compatible)
- [ ] No regression in existing functionality

---

*This plan is based on evidence from the Permission System Audit. All 30+ authorization-related files were inspected before producing this plan.*
