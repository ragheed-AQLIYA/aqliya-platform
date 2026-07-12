# AQLIYA Authorization Consolidation — Wave 3 Report

**Date:** 2026-07-10
**Status:** COMPLETE
**Scope:** Cluster A — Decision Lifecycle Core (13 actions + 1 hybrid cleanup)

---

## Summary

Wave 3 migrated all 13 Cluster A DecisionOS actions from legacy `requireDecisionAccess()` to `getCurrentUser()` + `enforce()`. One additional hybrid cleanup was performed on `exportDecisionReport`. After Wave 3, `requireDecisionAccess` is called only 2 times in the entire codebase — both in `publishRecommendationAction` and `unpublishRecommendationAction`, deferred to Wave 4.

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| C1: All 13 Cluster A actions migrated | ✅ |
| C2: `requireDecisionAccess` calls in `decisions.ts` reduced from 16 → 2 | ✅ |
| C3: `requireUserContext` removed from `decisions.ts` import | ✅ |
| C4: TypeScript clean (`npx tsc --noEmit` — 0 errors) | ✅ |
| C5: All targeted tests pass (29/29 decision-actions, 26/26 decision-evidence) | ✅ |

## Actions Migrated

### VIEWER Read Actions (7)

| Action | Auth Pattern | Notes |
|--------|-------------|-------|
| `getDecisionById` | `getCurrentUser()` → `findUnique` → `enforce("read")` | findUnique returns full decision with includes |
| `getDecisionFramework` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("read")` | Added `organizationId` to select |
| `getDecisionIntake` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("read")` | Added `organizationId` to select |
| `getDecisionScenarios` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("read")` | Added `organizationId` to select |
| `getDecisionRiskAnalysis` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("read")` | Added `organizationId` to select |
| `getDecisionRecommendation` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("read")` | Preserved VIEWER role check for published-only view |
| `getWorkflowReadiness` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("read")` → second `findUnique` for full data | Two-lookup pattern: lightweight auth check, then full data fetch |

### OPERATOR Write Actions (6)

| Action | Auth Pattern | Notes |
|--------|-------------|-------|
| `updateDecisionFramework` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("update")` | Added lookup before upsert |
| `updateDecisionIntake` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("update")` | Added lookup before update |
| `updateDecisionScenarios` | `getCurrentUser()` → `findUnique(select: decisionScenarios, organizationId)` → `enforce("update")` | Combined with existing findUnique |
| `updateDecisionRiskAnalysis` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("update")` | Added lookup before loop |
| `updateDecisionRecommendation` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("update")` | Added lookup before upsert |
| `checkRecommendationGate` | `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("update")` | Added lookup before validation |

### Hybrid Cleanup (1)

| Action | Before | After |
|--------|--------|-------|
| `exportDecisionReport` | `requireDecisionAccess("OPERATOR")` + `enforce("export")` + redundant manual org check | `getCurrentUser()` → `findUnique` → `enforce("update")` → `enforce("export")` — removed redundant org check |

## Files Changed

| File | Change |
|------|--------|
| `src/actions/decisions.ts` | Migrated 14 actions; removed `requireUserContext` import; kept `requireDecisionAccess` import for 2 publication actions |
| `src/actions/__tests__/decision-actions.test.ts` | Updated 4 test suites: `getDecisionById`, `getDecisionFramework`, `exportDecisionReport`, `updateDecisionStatus` — changed `mockRequireDecisionAccess` assertions to `mockEnforce` assertions |

## Remaining requireDecisionAccess Calls

| Line | Action | Reason Deferred |
|------|--------|----------------|
| 808 | `publishRecommendationAction` | Complex snapshot logic (170 lines), no test coverage, requires separate design decision — Wave 4 |
| 980 | `unpublishRecommendationAction` | Same rationale as above — Wave 4 |

## Role-to-Action Mapping (Wave 3)

| Role | Action Used | Justification |
|------|------------|---------------|
| VIEWER | `"read"` | Exact match in ROLE_PERMISSIONS |
| OPERATOR | `"update"` | Exact match in ROLE_PERMISSIONS |
| Export | `"export"` | Exact match in ROLE_PERMISSIONS (for `exportDecisionReport` only) |

## Migration Pattern Used

### VIEWER Read (findUnique already present)
```ts
// Before:
await requireDecisionAccess(id, "VIEWER");
const decision = await prisma.decision.findUnique({ where: { id }, select: { ... } });

// After:
const user = await getCurrentUser();
const decision = await prisma.decision.findUnique({ where: { id }, select: { ..., organizationId: true } });
if (!decision) return { success: false, error: "Decision not found" };
await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");
```

### OPERATOR Write (no existing findUnique)
```ts
// Before:
await requireDecisionAccess(id, "OPERATOR");
await prisma.someModel.upsert({ ... });

// After:
const user = await getCurrentUser();
const decisionLookup = await prisma.decision.findUnique({ where: { id }, select: { organizationId: true } });
if (!decisionLookup) return { success: false, error: "Decision not found" };
await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");
await prisma.someModel.upsert({ ... });
```

### OPERATOR Write (findUnique already present)
```ts
// Before:
await requireDecisionAccess(id, "OPERATOR");
const decision = await prisma.decision.findUnique({ where: { id }, select: { ..., existingFields } });

// After:
const user = await getCurrentUser();
const decision = await prisma.decision.findUnique({ where: { id }, select: { ..., existingFields, organizationId: true } });
if (!decision) return { success: false, error: "Decision not found" };
await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "update");
```

## Validation Results

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | ✅ 0 errors |
| `npx jest --testPathPatterns="decision-actions"` | ✅ 29/29 passed |
| `npx jest --testPathPatterns="decision-evidence"` | ✅ 26/26 passed |

## Cumulative Progress

| Wave | Actions Migrated | requireDecisionAccess Remaining |
|------|------------------|-------------------------------|
| Wave 2A | 3 download routes | — |
| Wave 2B | 6 evidence actions | 16 in decisions.ts |
| Wave 3 | 14 decisions.ts actions | **2 in decisions.ts** |
| **Total** | **23 actions** | **2 (publication only)** |

## Next Step

**Wave 4:** Migrate `publishRecommendationAction` and `unpublishRecommendationAction` — requires design decision on snapshot logic, test coverage addition, and potential refactoring of the 170-line publication workflow.
