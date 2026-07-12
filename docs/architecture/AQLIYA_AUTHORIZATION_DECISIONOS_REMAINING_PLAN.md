# AQLIYA Authorization — DecisionOS Remaining Migration Plan

## 1. Purpose of This Planning Note

After Wave 2, **8 DecisionOS actions** were migrated to `enforce()`:
- Wave 2B migrated 6 actions in `decisions.ts` and `decision-evidence-actions.ts`
- Wave 2A migrated 3 download routes

This document inventories what remains, proposes migration clusters, and defines a bounded Wave 3 scope.

---

## 2. DecisionOS Migration Status After Wave 2

### Already migrated (8 actions)

| File | Action | Auth Pattern |
|------|--------|-------------|
| `decisions.ts` | `getDecisions()` | `getCurrentUser()` ✅ |
| `decisions.ts` | `createDecision()` | `getCurrentUser()` + `enforce("create")` ✅ |
| `decisions.ts` | `updateDecisionStatus()` | `getCurrentUser()` + `enforce("update")` ✅ |
| `decisions.ts` | `getPublishedRecommendationViewAction()` | `getCurrentUser()` ✅ |
| `decisions.ts` | `getDashboardMetrics()` | `getCurrentUser()` ✅ |
| `decision-evidence-actions.ts` | All 5 actions | `getCurrentUser()` + `enforce()` ✅ |
| Route | `exportDecisionReport` (partially) | `requireDecisionAccess` + `enforce()` (hybrid) |

### Remaining on legacy paths (43 actions total)

- **40 actions** still use `requireDecisionAccess()`
- **5 actions** use `requireUserContext()` (no decision-level check)
- **1 action** is hybrid (`requireDecisionAccess` + `enforce()`)

---

## 3. Remaining Legacy DecisionOS Actions

### 3.1 File: `src/actions/decisions.ts` — 16 actions

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `getDecisionById(id)` | VIEWER | lifecycle-read | Core getter |
| `getDecisionFramework(id)` | VIEWER | lifecycle-read | |
| `updateDecisionFramework(id, form)` | OPERATOR | lifecycle-write | |
| `getDecisionIntake(id)` | VIEWER | lifecycle-read | |
| `updateDecisionIntake(id, data)` | OPERATOR | lifecycle-write | |
| `getDecisionScenarios(id)` | VIEWER | lifecycle-read | |
| `updateDecisionScenarios(id, input)` | OPERATOR | lifecycle-write | |
| `getDecisionRiskAnalysis(id)` | VIEWER | lifecycle-read | |
| `updateDecisionRiskAnalysis(id, input)` | OPERATOR | lifecycle-write | |
| `getDecisionRecommendation(id)` | VIEWER | lifecycle-read | **Special**: checks `user.role === "VIEWER"` to restrict data access |
| `updateDecisionRecommendation(id, data)` | OPERATOR | lifecycle-write | |
| `checkRecommendationGate(decisionId)` | OPERATOR | lifecycle-check | |
| `getWorkflowReadiness(decisionId)` | VIEWER | lifecycle-read | |
| `exportDecisionReport(decisionId)` | OPERATOR + `enforce("export")` | export | **Hybrid** — already has enforce() after requireDecisionAccess |
| `publishRecommendationAction(decisionId, ...)` | ADMIN | publication | Complex snapshot logic |
| `unpublishRecommendationAction(decisionId)` | ADMIN | publication | |

### 3.2 File: `src/actions/approval.ts` — 9 actions

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `submitForReview(decisionId)` | OPERATOR | governance | Status DRAFT → IN_REVIEW |
| `approveDecision(decisionId, ...)` | ADMIN | governance | Snapshot creation |
| `approveWithConditions(decisionId, ...)` | ADMIN | governance | Snapshot + conditions |
| `rejectDecision(decisionId, ...)` | ADMIN | governance | Snapshot creation |
| `requestRevision(decisionId, ...)` | ADMIN | governance | IN_REVIEW → DRAFT |
| `getApprovalStatus(decisionId)` | VIEWER | governance-read | |
| `getRecommendationDiff(decisionId)` | VIEWER | governance-read | |
| `requestReReview(decisionId, ...)` | ADMIN | governance | APPROVED/IN_REVIEW → DRAFT |
| `getDecisionTimeline(decisionId)` | VIEWER | governance-read | |

### 3.3 File: `src/actions/decision-outcomes.ts` — 4 actions (excl. pure utility)

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `getDecisionOutcome(decisionId)` | VIEWER | outcome-read | |
| `upsertDecisionOutcome(data)` | OPERATOR | outcome-write | |
| `reviewDecisionOutcome(decisionId)` | ADMIN | outcome-review | |
| `getOutcomeSummaryForDecision(decisionId)` | VIEWER | outcome-read | |

**Note**: `calculateOutcomeVariance()` is a pure utility (no auth). `getOrganizationOutcomeMetrics()` already uses `getCurrentUser()`.

### 3.4 File: `src/actions/decision-signals-alerts.ts` — 6 actions

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `acknowledgeSignalAction(decisionId, signalId)` | OPERATOR | signals | |
| `acknowledgeAlertAction(decisionId, alertId)` | OPERATOR | alerts | |
| `resolveAlertAction(decisionId, alertId, ...)` | ADMIN | alerts | |
| `runMonitoringSignalAutomationAction(decisionId)` | OPERATOR | signals | D3-02 automation |
| `getSignalsAction(decisionId)` | OPERATOR | signals-read | |
| `getAlertsAction(decisionId)` | OPERATOR | alerts-read | |

### 3.5 File: `src/actions/simulation.ts` — 2 actions

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `runSimulationAndRecommendation(decisionId)` | OPERATOR | simulation | Heavy: writes scenarios + recommendations |
| `getSimulationResults(decisionId)` | OPERATOR | simulation-read | |

### 3.6 File: `src/actions/decision-intelligence.ts` — 4 actions

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `getDecisionForIntelligence(decisionId)` | OPERATOR | intelligence-read | |
| `generateStrategicInsightAction(decisionId)` | OPERATOR | intelligence-ai | Uses `access.user.id` and `access.user.role` for AI bridge |
| `generateWhatToDoNowAction(decisionId)` | OPERATOR | intelligence-ai | |
| `generateExecutiveOverviewAction(decisionId)` | OPERATOR | intelligence-ai | |

### 3.7 File: `src/actions/tender.ts` — 2 actions

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `getTenderProfile(decisionId)` | OPERATOR | tender-read | |
| `createOrUpdateTenderProfile(decisionId, data)` | OPERATOR | tender-write | |

### 3.8 File: `src/actions/decision-export.ts` — 1 action

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `getDecisionExportData(decisionId, ...)` | VIEWER | export-read | Uses `user.user.name` — destructure pattern |

### 3.9 File: `src/actions/decision-sector.ts` — 2 actions on `requireDecisionAccess`

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `assignSectorToDecisionAction(decisionId, sectorId)` | OPERATOR | sector-write | |
| `getDecisionSectorAction(decisionId)` | OPERATOR | sector-read | |

**Note**: The other 5 actions in this file use `requireUserContext()`, not `requireDecisionAccess()`.

### 3.10 File: `src/actions/decision-learning.ts` — 2 actions on `requireDecisionAccess`

| Action | Role | Category | Notes |
|--------|------|----------|-------|
| `extractPatternsFromDecisionAction(decisionId)` | ADMIN | learning-write | |
| `getDecisionPatternAction(decisionId)` | OPERATOR | learning-read | |

**Note**: `getSectorPatternsAction()` uses `requireUserContext()`.

---

## 4. Proposed Migration Clusters

### Cluster A: Decision Lifecycle Core (13 actions in `decisions.ts`)

**Actions**: `getDecisionById`, `getDecisionFramework`, `updateDecisionFramework`, `getDecisionIntake`, `updateDecisionIntake`, `getDecisionScenarios`, `updateDecisionScenarios`, `getDecisionRiskAnalysis`, `updateDecisionRiskAnalysis`, `getDecisionRecommendation`, `updateDecisionRecommendation`, `checkRecommendationGate`, `getWorkflowReadiness`

**Why together**: All are in the same file, follow identical read(VIEWER)/write(OPERATOR) patterns, and represent the core decision editing workflow. Migration is mechanical — each action needs `getCurrentUser()` + `prisma.decision.findUnique()` + `enforce()`.

**Special semantics**:
- `getDecisionRecommendation` has a VIEWER role check for data access (`user.role === "VIEWER"` → published-only). After migration, this must be preserved as a post-authz data filter.
- `exportDecisionReport` is hybrid — has `requireDecisionAccess` + `enforce()`. The legacy bridge should be removed to complete the migration.

**Semantic risk**: LOW. All actions are homogeneous.

### Cluster B: Approval & Governance (9 actions in `approval.ts`)

**Actions**: `submitForReview`, `approveDecision`, `approveWithConditions`, `rejectDecision`, `requestRevision`, `getApprovalStatus`, `getRecommendationDiff`, `requestReReview`, `getDecisionTimeline`

**Why together**: Same file, approval workflow semantics. All 4 admin actions create approval snapshots.

**Special semantics**:
- `approveDecision`, `approveWithConditions`, `rejectDecision` create `prisma.approval.create()` with snapshot data. They use `user.id` from `requireDecisionAccess`.
- `submitForReview` is OPERATOR-level (status gate: DRAFT → IN_REVIEW).
- Read actions are VIEWER-level.

**Semantic risk**: MEDIUM. Snapshot creation uses `access.user` and `access.organizationId`.

### Cluster C: Recommendation Publication (2 actions in `decisions.ts`)

**Actions**: `publishRecommendationAction`, `unpublishRecommendationAction`

**Why together**: Both are ADMIN-only publication gates with complex snapshot logic.

**Special semantics**:
- `publishRecommendationAction` is ~170 lines with immutable snapshot diffing, `forcePublishCurrent` override, and multi-path audit logging.
- Uses `access.user.id`, `access.organizationId` extensively.
- Requires snapshot-vs-current comparison with approval records.

**Semantic risk**: HIGH. The most complex auth→biz-logic coupling in DecisionOS. Errors here could expose unpublished recommendations or bypass approval gates.

### Cluster D: Decision Outcomes (4 actions in `decision-outcomes.ts`)

**Actions**: `getDecisionOutcome`, `upsertDecisionOutcome`, `reviewDecisionOutcome`, `getOutcomeSummaryForDecision`

**Why together**: Same file, same entity domain, same role patterns.

**Special semantics**:
- `upsertDecisionOutcome` uses `access.user` and `access.organizationId` for audit logging.
- `reviewDecisionOutcome` is ADMIN-only.

**Semantic risk**: LOW. Clean, small file.

### Cluster E: Signals, Alerts & Intelligence (10 actions across 2 files)

**Files**: `decision-signals-alerts.ts` (6), `decision-intelligence.ts` (4)

**Why together**: Both files share `validateIntelligenceGate()` as a pre-condition. Intelligence actions use `access.user` for AI bridge calls.

**Special semantics**:
- `generateStrategicInsightAction` destructures `access.user.id` and `access.user.role` for `runGovernedDecisionAI`.
- `resolveAlertAction` is ADMIN-only.
- All intelligence actions have a gate check (`validateIntelligenceGate`).

**Semantic risk**: MEDIUM. AI bridge integration needs careful user context passthrough.

### Cluster F: Simulation (2 actions in `simulation.ts`)

**Actions**: `runSimulationAndRecommendation`, `getSimulationResults`

**Why together**: Same file, coupled functionality (run + read results).

**Special semantics**:
- `runSimulationAndRecommendation` is a heavy action — writes scenarios, simulation results, and recommendations.
- Auth is straightforward OPERATOR.

**Semantic risk**: LOW. Simple role pattern.

### Cluster G: Tender Profile (2 actions in `tender.ts`)

**Actions**: `getTenderProfile`, `createOrUpdateTenderProfile`

**Why together**: Same file, same entity, same OPERATOR role.

**Special semantics**:
- `createOrUpdateTenderProfile` destructures `access.user` for audit logging.

**Semantic risk**: LOW. Simple and self-contained.

### Cluster H: Sector & Learning (4 actions across 2 files)

**Files**: `decision-sector.ts` (2 on requireDecisionAccess), `decision-learning.ts` (2 on requireDecisionAccess)

**Why together**: Both are decision-adjacent metadata domains. `extractPatternsFromDecisionAction` is ADMIN.

**Special semantics**:
- `extractPatternsFromDecisionAction` uses `access.user` for audit and triggers `revalidatePath`.
- `assignSectorToDecisionAction` uses `access.user` for audit.

**Semantic risk**: LOW. Small scope.

### Cluster I: Export (1 action in `decision-export.ts`)

**Action**: `getDecisionExportData`

**Special semantics**:
- Uses `user.user.name` (double destructuring from `requireDecisionAccess`).
- Has platform audit logger integration.

**Semantic risk**: LOW. Single action, straightforward.

---

## 5. Recommended Wave 3 Scope

### In Scope for Wave 3

**Cluster A: Decision Lifecycle Core** (13 actions)

This is the highest-value bounded migration:

- **13 actions** in a single file (`decisions.ts`)
- Homogeneous patterns (VIEWER read / OPERATOR write)
- Includes the hybrid `exportDecisionReport` that needs its legacy bridge removed
- Leaves `decisions.ts` with only 3 remaining legacy actions (publication cluster) after Wave 3
- Establishes the full migration template for the most common DecisionOS pattern

**Includes**:
1. `getDecisionById`
2. `getDecisionFramework` / `updateDecisionFramework`
3. `getDecisionIntake` / `updateDecisionIntake`
4. `getDecisionScenarios` / `updateDecisionScenarios`
5. `getDecisionRiskAnalysis` / `updateDecisionRiskAnalysis`
6. `getDecisionRecommendation` / `updateDecisionRecommendation`
7. `checkRecommendationGate`
8. `getWorkflowReadiness`
9. Clean up `exportDecisionReport` hybrid (remove `requireDecisionAccess` bridge, keep `enforce()` only)

**After Wave 3**: `decisions.ts` will have `requireDecisionAccess` in only 2 actions (`publishRecommendationAction`, `unpublishRecommendationAction`).

### Defer to Later Wave

| Cluster | Actions | File | Rationale |
|---------|---------|------|-----------|
| B: Approval & Governance | 9 | `approval.ts` | Snapshot creation semantics; admin-heavy; separate file |
| C: Recommendation Publication | 2 | `decisions.ts` | Most complex auth→biz coupling; needs separate design decision |
| D: Decision Outcomes | 4 | `decision-outcomes.ts` | Clean but separate file; lower priority than lifecycle core |
| E: Signals, Alerts, Intelligence | 10 | 2 files | AI bridge coupling; intelligence gate pre-conditions |
| F: Simulation | 2 | `simulation.ts` | Heavy write action; separate file |
| G: Tender Profile | 2 | `tender.ts` | Small, clean; can be batched with another product |
| H: Sector & Learning | 4 | 2 files | Separate domain; lower priority |
| I: Export | 1 | `decision-export.ts` | Single action; platform audit integration |

### Requires Separate Design Decision

| Cluster | Why |
|---------|-----|
| C: Publication (`publishRecommendationAction` / `unpublishRecommendationAction`) | These are ADMIN-only with complex snapshot-diff logic. The `requireDecisionAccess(id, "ADMIN")` return value is destructured as `access.user` and `access.organizationId` throughout ~170 lines of code. Migration to `enforce()` must ensure the same `user` object is available. Additionally, `publishRecommendationAction` has a `forcePublishCurrent` override path that needs careful review. Recommend: defer until after Wave 3 validates the pattern, then migrate in a focused Wave 4. |

---

## 6. Recommendation on `publishRecommendationAction` / `unpublishRecommendationAction`

**Verdict: Defer to Wave 4.**

**Rationale**:

1. **Complexity**: `publishRecommendationAction` is ~170 lines with 3 distinct code paths (snapshot-publish, force-publish, no-snapshot publish). Each path uses `access.user.id`, `access.organizationId`, and `user.id` from the `requireDecisionAccess` return value.

2. **Governance sensitivity**: These are ADMIN-only publication gates. A migration error could expose unpublished recommendations or bypass the immutable snapshot mechanism.

3. **Dependency on Cluster A success**: Wave 3 will establish the migration pattern for `decisions.ts`. Publication actions should be migrated only after that pattern is validated in tests and production.

4. **Semantic mismatch**: The `enforce()` API signature is `enforce(user, resource, action)` — it does not return `{ user, organizationId }`. After migration, the `user` object comes from `getCurrentUser()`, and `organizationId` comes from `prisma.decision.findUnique()`. This is a different destructuring pattern than `requireDecisionAccess` returns, and the publication code heavily relies on `access.organizationId` for audit logging.

5. **Test coverage gap**: No existing test file covers `publishRecommendationAction` or `unpublishRecommendationAction`. Wave 3 will not add test coverage for these — better to migrate them in a wave with dedicated test support.

---

## 7. Recommended Wave 3 Goal

**Goal: "Complete the decision lifecycle core migration and retire `requireDecisionAccess` from all non-admin DecisionOS getters/setters in `decisions.ts`."**

**Justification**:

- **Bounded**: 13 actions in one file, one migration pattern.
- **Measurable**: After Wave 3, `requireDecisionAccess` appears only twice in `decisions.ts` (publication actions).
- **Reusable**: Establishes the full template for `getCurrentUser()` + `prisma.decision.findUnique()` + `enforce()` in DecisionOS.
- **High-impact**: These 13 actions cover the entire decision editing workflow — intake, framework, scenarios, risks, recommendation editing, workflow readiness.
- **Safe**: All actions follow the same VIEWER/OPERATOR pattern. No snapshot semantics, no admin gates, no AI bridge coupling.

---

## 8. Risks of Over-Scoping Wave 3

1. **File proliferation**: Adding `approval.ts`, `decision-outcomes.ts`, and `simulation.ts` to Wave 3 would touch 4+ files simultaneously, increasing merge conflict risk with parallel work.

2. **Role mapping complexity**: Cluster B (Approval) has 4 ADMIN actions with snapshot creation. Mixing these with the simple VIEWER/OPERATOR pattern of Cluster A increases cognitive load and error surface.

3. **AI bridge coupling**: Cluster E (Intelligence) uses `access.user.id` and `access.user.role` for `runGovernedDecisionAI`. This is a different migration pattern than the standard `enforce()` call.

4. **Test coverage gaps**: Only `decisions.ts` has a test file (`decision-actions.test.ts`). Other files have no test coverage. Migrating untested files increases risk without a safety net.

5. **Wave discipline**: The Authorization Consolidation Program's strength is disciplined, bounded waves. Expanding Wave 3 beyond Cluster A violates this principle.

---

## 9. Final Recommended Wave 3 Boundary

**Wave 3 scope**: Migrate all 13 remaining `requireDecisionAccess` actions in `src/actions/decisions.ts` to `getCurrentUser()` + `enforce()` (excluding `publishRecommendationAction` and `unpublishRecommendationAction`).

**Included**:
- 13 lifecycle actions (read/write/check)
- Cleanup of `exportDecisionReport` hybrid (remove `requireDecisionAccess` bridge)
- Update `src/actions/__tests__/decision-actions.test.ts` for all migrated actions
- Remove `requireDecisionAccess` import from `decisions.ts` (if only publication actions remain, keep import; otherwise remove)

**Excluded**:
- `publishRecommendationAction` (deferred)
- `unpublishRecommendationAction` (deferred)
- All other DecisionOS files (`approval.ts`, `decision-outcomes.ts`, etc.)
- Any SalesOS / AuditOS / other product work

**Validation**:
- `npx tsc --noEmit` — clean
- `npm run test -- decision-actions` — all existing tests pass
- `npm run test -- decision-evidence` — evidence tests unaffected
- `npm run build` — full build passes
- Manual: no `requireDecisionAccess` calls remain in `decisions.ts` except publication actions

**Estimated scope**: 13 actions × ~5 min migration each = ~65 min implementation + ~30 min test updates = ~1.5 hours total.

---

*Document generated: 2026-07-10*
*Scope: Planning only — no implementation*
*Next action: Convert this plan into Wave 3 implementation prompt*
