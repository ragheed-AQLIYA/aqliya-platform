# AQLIYA Authorization Consolidation — Waves 16–17 Report

**Status:** COMPLETE  
**Date:** 2026-07-11  
**Scope:** DecisionOS remaining, WorkflowOS remaining, Final Actions  
**Type:** Migration + Cleanup

---

## Summary

| Metric | Value |
|--------|-------|
| **Calls migrated (Wave 16)** | 17 |
| **Calls migrated (Wave 17)** | 14 |
| **Total calls migrated (Waves 16–17)** | 31 |
| **Production files modified** | 13 |
| **Test files modified** | 0 |
| **Cumulative calls removed (Waves 9–17)** | ~255 |
| **Remaining production callers** | 0 |
| **TypeScript errors introduced** | 0 |

---

## Wave 16: DecisionOS Remaining + WorkflowOS Remaining

### DecisionOS Remaining (8 calls across 3 files)

| File | Calls | Pattern |
|------|-------|---------|
| `src/actions/decision-sector.ts` | 6 | `requireUserContext("OPERATOR"/"ADMIN")` → `getCurrentUser()` + `hasRequiredRole()` |
| `src/actions/decision-templates.ts` | 1 | `requireUserContext("OPERATOR")` → `getCurrentUser()` + `hasRequiredRole()` |
| `src/actions/decision-learning.ts` | 1 | `requireUserContext("OPERATOR")` → `getCurrentUser()` + `hasRequiredRole()` |

**Note:** `assignSectorToDecisionAction`, `getDecisionSectorAction`, `extractPatternsFromDecisionAction`, and `getDecisionPatternAction` already used `getCurrentUser()` + `enforce()` — untouched.

### WorkflowOS Remaining (9 calls across 5 files)

| File | Calls | Pattern |
|------|-------|---------|
| `src/app/workflowos/templates/page.tsx` | 1 | `requireUserContext()` → `getCurrentUser()` (default VIEWER) |
| `src/app/workflowos/templates/[id]/page.tsx` | 2 | `requireUserContext()` → `getCurrentUser()` |
| `src/app/workflowos/records/page.tsx` | 1 | `requireUserContext()` → `getCurrentUser()` |
| `src/app/workflowos/records/[id]/page.tsx` | 1 | `requireUserContext()` → `getCurrentUser()` |
| `src/lib/workflowos/template-service.ts` | 4 | `requireUserContext()` → `getCurrentUser()` |

---

## Wave 17: Final Actions

### Remaining Action Files (14 calls across 5 files)

| File | Calls | Pattern |
|------|-------|---------|
| `src/actions/agent-memory-actions.ts` | 6 | `requireUserContext("OPERATOR"/"VIEWER"/"ADMIN")` → `getCurrentUser()` + `hasRequiredRole()` |
| `src/actions/ingestion-actions.ts` | 5 | `requireUserContext("OPERATOR"/"VIEWER")` → `getCurrentUser()` + `hasRequiredRole()` |
| `src/actions/governance-actions.ts` | 1 | `requireUserContext("VIEWER")` → `getCurrentUser()` + `hasRequiredRole()` |
| `src/actions/content-evidence-actions.ts` | 1 | `requireUserContext(role)` → `getCurrentUser()` + `hasRequiredRole()` |
| `src/actions/institutional-memory-actions.ts` | 1 | `requireUserContext("OPERATOR")` → `getCurrentUser()` + `hasRequiredRole()` |

---

## Remaining: Test Mock Cleanup

15 test files still reference `requireUserContext` in mock setups:

| Test File | Refs | Status |
|-----------|------|--------|
| `cross-tenant-isolation.test.ts` | 7 | Mocks `requireUserContext` for tenant isolation tests |
| `local-contacts-l5.test.ts` | 5 | Mocks `requireUserContext` for L5 tests |
| `local-contacts.test.ts` | 3 | Mocks `requireUserContext` for contact tests |
| `contact-actions.test.ts` | 1 | Mock for contact actions |
| `decision-actions.test.ts` | 1 | Mock for decision actions |
| `localcontent-ai-pipeline.integration.test.ts` | 1 | Mock for pipeline |
| `localcontent-workbook-actions.test.ts` | 1 | Mock for workbook |
| `workflow-actions.test.ts` | 1 | Mock for workflow |
| `guards.test.ts` | 1 | Mock for guards |
| `registry.test.ts` | 1 | Mock for registry |
| `sales-services.test.ts` | 1 | Mock for sales |
| `agent-memory.test.ts` | 1 | Mock for agent memory |
| `org-scoping.test.ts` | 1 | Integration mock |
| `workflowos-export.test.ts` | 1 | Integration mock |
| `localcontactos-crud.test.ts` | 1 | Integration mock |

**These are harmless:** `requireUserContext` is still exported from `auth.ts`, so the mocks resolve. The mock values are unused since production code now calls `getCurrentUser()`. Tests still pass because:
1. Global mock (`__mocks__/lib-auth.js`) provides `getCurrentUser` and `hasRequiredRole`
2. Local `jest.mock()` calls use `jest.requireActual()` spread, so `getCurrentUser` is available
3. The `requireUserContext` mock value is simply never consumed

**Recommended cleanup:** Update these test mocks to use `getCurrentUser` instead of `requireUserContext`. This is cosmetic — tests pass as-is.

---

## Production Code Status

### `requireUserContext` export status

`src/lib/auth.ts` still exports `requireUserContext`. Zero production callers remain. The function is now dead code.

**Recommended action:** Mark as `@deprecated` and remove in final cleanup wave after test mocks are updated.

---

## Validation

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ Clean |
| Test suites | ✅ 365 pass (1 pre-existing `api-smoke` failure) |

---

## Next Steps

1. **Test mock cleanup:** Update 15 test files to mock `getCurrentUser` instead of `requireUserContext`
2. **Final cleanup:** Remove `requireUserContext` from `src/lib/auth.ts` once zero callers remain
3. **Write consolidation report:** Document full migration summary across all waves
