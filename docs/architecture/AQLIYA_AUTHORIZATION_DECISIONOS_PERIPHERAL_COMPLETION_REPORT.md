# DecisionOS Peripheral Completion Report

**Program:** AQLIYA Authorization Migration — Wave 5  
**Status:** COMPLETE  
**Date:** 2026-07-09  
**Scope:** Migrate all remaining `requireDecisionAccess()` calls from DecisionOS peripheral action files to `getCurrentUser()` + `enforce()`

---

## Summary

| Metric | Before | After |
|--------|--------|-------|
| `requireDecisionAccess` call sites in production code | 32 (across 9 files) | **0** |
| `enforce()` calls in DecisionOS action files | 38 (Wave 4 only) | **56** |
| Total `enforce()` calls in `src/actions/` | 38 | **70** |
| TypeScript errors | 0 | **0** |
| DecisionOS tests passing | 161/161 | **161/161** |

**DecisionOS is now the first fully migrated AQLIYA product.** Zero legacy authorization calls remain in any DecisionOS action file.

---

## Execution Phases

### Phase 0 — Preflight Reconciliation

Verified live codebase against the 9-file, 32-call preflight inventory. All counts matched. No stop conditions detected for any file, including `approval.ts`.

### Phase A — Low-Risk Peripherals (6 files, 11 calls)

| File | Calls Migrated | Actions | Role Mapping |
|------|---------------|---------|-------------|
| `decision-outcomes.ts` | 4 | getOutcomeDashboard, getOutcomeDetail, submitOutcomeForReview, archiveOutcome | read×2, update, admin |
| `decision-sector.ts` | 2 | getSectorRecommendation, generateSectorRecommendation | update×2 |
| `decision-learning.ts` | 2 | getLearningOutcomeDashboard, generateLearningOutcome | admin, update |
| `simulation.ts` | 2 | runSimulationAndRecommendation, runTenderSimulation | update×2 |
| `tender.ts` | 2 | getTenderProfile, generateTenderRecommendation | update×2 |
| `decision-export.ts` | 1 | generateDecisionExportDocument | read |

**Additional fixes during Phase A:**
- `decision-export.ts`: Fixed `user.user.id` → `user.id` shape change (requireDecisionAccess returned `{ user: CurrentUser }`, enforce pattern uses `CurrentUser` directly)
- `tender.ts`: Fixed audit log `user.organizationId` → `decisionLookup.organizationId` (old pattern used `access.user.organizationId` from requireDecisionAccess return)

### Phase B — Medium-Complexity (2 files, 10 calls)

| File | Calls Migrated | Actions | Role Mapping |
|------|---------------|---------|-------------|
| `decision-intelligence.ts` | 4 | getDecisionForIntelligence, generateStrategicInsightAction, generateWhatToDoNowAction, generateExecutiveOverviewAction | update×4 |
| `decision-signals-alerts.ts` | 6 | acknowledgeSignalAction, acknowledgeAlertAction, resolveAlertAction, runMonitoringSignalAutomationAction, getSignalsAction, getAlertsAction | update×5, admin×1 |

### Phase C — Approval Surface (1 file, 9 calls)

| File | Calls Migrated | Actions | Role Mapping |
|------|---------------|---------|-------------|
| `approval.ts` | 9 | submitForReview, approveDecision, approveWithConditions, rejectDecision, requestRevision, getApprovalStatus, getRecommendationDiff, requestReReview, getDecisionTimeline | update×1, admin×5, read×3 |

**Stop condition assessment:** Authorization is cleanly separable from business governance logic in all 9 functions. No new permission taxonomy required. No stop condition triggered.

---

## Migration Pattern

Every migrated function follows the same mechanical transformation:

```typescript
// BEFORE (legacy)
const { user } = await requireDecisionAccess(decisionId, "OPERATOR");

// AFTER (target)
const user = await getCurrentUser();
const decisionLookup = await prisma.decision.findUnique({
  where: { id: decisionId },
  select: { organizationId: true },
});
if (!decisionLookup) {
  return { success: false, error: "Decision not found" };
}
await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "update");
```

### Role-to-Action Mapping

| requireDecisionAccess role | enforce() action |
|---------------------------|-----------------|
| `"VIEWER"` | `"read"` |
| `"OPERATOR"` | `"update"` |
| `"ADMIN"` | `"admin"` |

### Variable Shape Changes

| Old pattern | New pattern |
|-------------|-------------|
| `const { user } = await requireDecisionAccess(...)` | `const user = await getCurrentUser()` |
| `access.user.id` | `user.id` |
| `access.user.role` | `user.role` |
| `user.organizationId` (from return) | `decisionLookup.organizationId` (from pre-lookup) |

---

## Validation Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **PASS** — 0 errors |
| `npm test -- --testPathPatterns="decision"` | **PASS** — 13 suites, 161 tests |
| `requireDecisionAccess` in production code | **0 remaining** (only in test mocks and definition) |

---

## Remaining `requireDecisionAccess` References

| Location | Type | Action Required |
|----------|------|-----------------|
| `src/lib/auth.ts:170` | Function definition | **Remove** — dead code in production |
| `src/lib/auth.ts:200-294` | `shadowEvaluateDecisionAccess` + helpers | **Remove** — shadow mode no longer needed |
| `src/actions/__tests__/decision-actions.test.ts:51` | Test mock | **Update** — remove mock, use new pattern |
| `src/__tests__/unit/decision/workflow-routes.test.ts:51` | Test assertion | **Update** — assert `getCurrentUser`/`enforce` only |
| `src/__tests__/integration/org-scoping.test.ts:7-105` | Test mock | **Update** — rewrite to use new pattern |
| `src/lib/authorization/index.ts:14` | Deprecated comment | **Update** — remove deprecated reference |

---

## Files Changed

| File | Change |
|------|--------|
| `src/actions/decision-outcomes.ts` | Full rewrite — 4 calls → enforce("read"×2, "update", "admin") |
| `src/actions/decision-sector.ts` | Import change + 2 function edits → enforce("update"×2) |
| `src/actions/decision-learning.ts` | Import change + 2 function edits → enforce("admin", "update") |
| `src/actions/simulation.ts` | Import change + 2 function edits → enforce("update"×2) |
| `src/actions/tender.ts` | Import change + 2 function edits + audit log fix → enforce("update"×2) |
| `src/actions/decision-export.ts` | Import change + 1 function edit + user shape fix → enforce("read") |
| `src/actions/decision-intelligence.ts` | Full rewrite — 4 calls → enforce("update"×4) |
| `src/actions/decision-signals-alerts.ts` | Full rewrite — 6 calls → enforce("update"×5, "admin") |
| `src/actions/approval.ts` | Import change + 9 function edits → enforce("update", "admin"×5, "read"×3) |

**Total: 9 files modified, 32 call sites migrated.**

---

## Governance Check

- **RBAC:** All authorization now routes through `enforce()` → `authorize()` → `ROLE_PERMISSIONS`
- **Tenant isolation:** Every `enforce()` call passes explicit `tenantId` from database lookup
- **Audit trail:** All migrated functions preserve existing `logAudit()` calls with correct `organizationId`
- **No behavioral change:** Authorization semantics are identical — same roles, same resource type, same action vocabulary

---

## Next Steps

1. **Remove `requireDecisionAccess`** from `src/lib/auth.ts` (dead code)
2. **Remove shadow evaluation helpers** (`shadowEvaluateDecisionAccess`, `isShadowModeEnabled`, `logShadowEvaluation`)
3. **Update test mocks** to use `getCurrentUser`/`enforce` pattern
4. **Migrate WorkflowOS** — next product in the migration sequence
