# Wave 7 Report: WorkflowOS Action Layer — Full Migration

**Date:** 2026-07-10
**Status:** COMPLETE
**Wave:** 7 of Authorization Consolidation Program
**Scope:** All remaining `requireUserContext()` calls in WorkflowOS action files

---

## Executive Summary

Wave 7 completes the WorkflowOS action-layer migration. All 5 WorkflowOS action files now use `getCurrentUser()` + `enforce()` instead of `requireUserContext()`. Zero `requireUserContext` calls remain in any WorkflowOS action file.

**Combined Wave 6+7:** 24 `requireUserContext()` calls migrated to `getCurrentUser()` + `enforce()`.

---

## Inventory

### Files Migrated

| File | `requireUserContext` calls | `getCurrentUser` + `enforce` | Notes |
|------|--------------------------|------------------------------|-------|
| `workflowos-actions.ts` | 10 → 0 | 10 calls | Template CRUD, record CRUD, evidence, dashboard |
| `workflowos-template-actions.ts` | 8 → 0 | 8 calls | Wave 6 scope (completed previously) |
| `workflowos-admin-actions.ts` | 2 → 0 | 2 calls | Client CRUD, membership management |
| `workflowos-export-actions.ts` | 3 → 0 | 3 calls | `assertRecordAccess` helper + `getCurrentUserPendingExportCount` + `listExportableRecords` |
| `workflowos-sla-actions.ts` | 1 → 0 | 1 call | `escalateOverdueRecords` |
| **Total** | **24 → 0** | **24 calls** | |

### Manual Org Checks Removed

| File | Checks removed | Replacement |
|------|---------------|-------------|
| `workflowos-actions.ts` | 13 | `enforce(user, { type: "organization", id: X, tenantId: X }, "update")` |
| `workflowos-template-actions.ts` | 6 | Same pattern (Wave 6) |
| `workflowos-export-actions.ts` | 0 | Already delegated to `assertRecordAccess` → `enforce()` |
| **Total** | **19** | |

### Test Files Updated

| File | Change | Tests |
|------|--------|-------|
| `workflowos-expansion.test.ts` | Added `@/lib/authorization` mock with `enforce` | 11/11 pass |
| `workflowos-export.test.ts` | Added `@/lib/authorization` mock with `enforce` | 19/19 pass |
| `workflow-actions.test.ts` | Added `@/lib/authorization` mock with `enforce` | 44/44 pass |

---

## Migration Pattern

Every migration follows the same pattern:

```ts
// BEFORE (legacy)
const { user } = await requireUserContext();
if (user.organizationId !== targetOrgId) {
  throw new Error("Access denied");
}

// AFTER (shared)
const user = await getCurrentUser();
await enforce(user, { type: "organization", id: targetOrgId, tenantId: targetOrgId }, "update");
```

### Key behaviors:
- **Same-org access:** `enforce()` resolves (no-op)
- **Cross-org access:** `enforce()` throws `Error("Access denied: ...")`
- **Unauthenticated:** `getCurrentUser()` throws `Error("Unauthenticated")`
- **Role check:** delegated to RBAC via `authorize()` facade
- **Cross-tenant isolation:** enforced via `tenantId` parameter in `checkTenantAccess()`

---

## Test Mock Pattern

Test files that import from migrated actions must mock both `@/lib/auth` AND `@/lib/authorization`:

```ts
const mockGetCurrentUser = jest.fn();
jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  isExpectedAccessDeniedError: jest.fn((error) =>
    error instanceof Error &&
    (error.message.startsWith("Access denied:") || error.message === "Unauthenticated")
  ),
}));

const mockEnforce = jest.fn();
jest.mock("@/lib/authorization", () => ({
  enforce: mockEnforce,
}));

// In beforeEach:
mockEnforce.mockImplementation(
  async (user, resource, _action) => {
    if (resource.id && resource.id !== user.organizationId) {
      throw new Error("Access denied: cross-tenant");
    }
  },
);
```

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | PASS — 0 errors |
| `npm test` (full suite) | 366/367 suites pass, 4091/4092 tests pass |
| WorkflowOS tests | 64/64 pass across 6 suites |
| Workflow-actions tests | 44/44 pass |

**Pre-existing failure:** `api-smoke.test.ts` "denies when role is insufficient for a sensitive action" — unrelated to Wave 7.

---

## Risk Assessment

### Risk: Test mock drift
**Mitigation:** 3 test files now mock `@/lib/authorization` with `enforce`. Cross-tenant mock simulation uses same logic as real `checkTenantAccess()`.

### Risk: Error message changes for cross-org
**Status:** Some tests updated error expectations (e.g., `"لا تملك صلاحية الوصول لهذا النموذج"` → `"لا تملك صلاحية تنفيذ هذا الإجراء"`). The new messages go through `mapAuthError()` consistently.

---

## Remaining WorkflowOS Scope

### Action layer: COMPLETE
All 5 WorkflowOS action files use `getCurrentUser()` + `enforce()`.

### Service layer: NOT IN SCOPE (Wave 7)
~22 `requireClientAccess` calls remain in:
- `src/lib/workflowos/services.ts`
- `src/lib/workflowos/storage.ts`
- `src/lib/workflowos/audit.ts`
- `src/lib/workflowos/export/index.ts`

These are membership-based auth (client/workflow membership), not org-based. Migration requires membership-aware authorization strategy — deferred to future wave.

---

## Files Changed

### Production code (4 files)
- `src/actions/workflowos-actions.ts` — 10 migrations, 13 manual checks removed
- `src/actions/workflowos-admin-actions.ts` — 2 migrations
- `src/actions/workflowos-export-actions.ts` — 3 migrations, `assertRecordAccess` helper refactored
- `src/actions/workflowos-sla-actions.ts` — 1 migration

### Test code (3 files)
- `src/lib/sales/__tests__/workflowos-expansion.test.ts` — auth + authorization mock updated
- `src/__tests__/integration/workflowos-export.test.ts` — authorization mock added
- `src/actions/__tests__/workflow-actions.test.ts` — authorization mock added

---

## Recommended Next Steps

1. **Wave 8 — Membership Authorization Strategy:** Design how `requireClientAccess` (membership-based) migrates to the shared model. This requires either:
   - Extending `enforce()` to support membership resources, OR
   - Creating a membership-aware guard that wraps `authorize()`
2. **Wave 9 — SalesOS Migration:** Apply same action-layer migration pattern to SalesOS
3. **Wave 10 — AuditOS Migration:** Apply to AuditOS (careful — most complex product)
4. **Wave 11 — LocalContentOS Migration:** Apply to LocalContentOS
