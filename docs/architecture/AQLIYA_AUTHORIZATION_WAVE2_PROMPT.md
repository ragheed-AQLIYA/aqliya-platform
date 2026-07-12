# AQLIYA Authorization Implementation — Wave 2

> **Purpose:** Close legacy bridge in download routes + migrate first DecisionOS actions  
> **Basis:** `AQLIYA_AUTHORIZATION_WAVE1_REPORT.md`, `AQLIYA_AUTHORIZATION_CURRENT_STATE.md`, `AQLIYA_AUTHORIZATION_TARGET_MODEL.md`  
> **Do NOT touch:** AuditOS, LocalContentOS, SalesOS, WorkflowOS product actions (except the download routes already in scope from Wave 1), RB-02 engine promotion, middleware refactors, ABAC policies

---

# 0) Mission Objective

Complete two tightly-scoped work packages that build directly on Wave 1's foundation:

## Wave 2A — Legacy Bridge Removal

Take the 3 download routes that were placed in **compatibility migration state** during Wave 1 and finish their migration to the shared `authorize()` facade end-to-end.

## Wave 2B — DecisionOS First Action Migration

Migrate a bounded set of 4–6 DecisionOS server actions from `requireUserContext()` / `requireDecisionAccess()` to `getCurrentUser()` + `enforce()` — the first product-level adoption of the shared authorization facade.

---

# 1) Verified Inputs — Treat as True

1. **Wave 1 completed successfully**: deny logging in `authorize()`, shadow parity in `requireUserContext()`, parity report script at `scripts/authorization/parity-report.ts`
2. **Download routes are in hybrid state**: `enforce()` is active but legacy auth resolution still runs alongside it (`requireDecisionAccess`, `requireUserContext`, `getAuditActor`)
3. **DecisionOS has 22 routes and 55+ test files** — it is the least coupled product after platform admin
4. **DecisionOS already uses `requireDecisionAccess()`** which has built-in shadow RB-02 integration — it is closest to the target pattern
5. **`requireUserContext()` is NOT removed repo-wide** — only removed from the specific surfaces in this scope
6. **Tests must pass without modification** — any test that breaks must be updated to use the new facade path

---

# 2) Scope — Only These Two Workstreams

---

# 3) Workstream A — Full Download Route Migration

## Goal

Remove the legacy auth resolution from all 3 download/export routes that were partially migrated in Wave 1, making them use the shared authorization path end-to-end.

## Required targets

| Route | Current state (from Wave 1) | Target state |
|-------|----------------------------|-------------|
| `/api/audit/evidence/[evidenceId]/download` | `getAuditActor()` (AuditOS-specific) + `enforce(user, { type: "evidence" }, "export")` | `getCurrentUser()` + `enforce(user, { type: "evidence", id }, "export")` |
| `/api/decisions/[decisionId]/evidence/[evidenceId]/download` | `requireDecisionAccess()` (legacy) + `enforce(user, { type: "evidence" }, "export")` | `getCurrentUser()` + `enforce(user, { type: "evidence", id }, "export")` |
| `/api/workflowos/records/[recordId]/download` | `requireUserContext()` (legacy) + `enforce(user, { type: "record" }, "export")` | `getCurrentUser()` + `enforce(user, { type: "record", id }, "export")` |

## Required tasks

### A1 — Audit evidence download route

**File:** `src/app/api/audit/evidence/[evidenceId]/download/route.ts`

- Replace `getAuditActor()` (AuditOS-specific) with `getCurrentUser()` for user resolution
- Keep `enforce(user, { type: "evidence", id: evidenceId }, "export")` — already correct from Wave 1
- Remove AuditOS-specific auth helpers if no longer needed
- Keep the existing download gate (ticket/token validation) — that is a separate concern
- Ensure the route's existing integration/smoke tests still pass after the change

### A2 — Decisions evidence download route

**File:** `src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts`

- Replace `requireDecisionAccess()` with `getCurrentUser()` + `enforce(user, { type: "evidence", id: evidenceId }, "export")`
- The `requireDecisionAccess()` was doing double duty: user resolution + org check + shadow engine. Now:
  - User resolution: `getCurrentUser()`
  - Authorization: `enforce()` with evidence resource type and export action
  - Org check: handled by `tenant-guard.ts` inside `authorize()` facade
- Remove the `requireDecisionAccess()` import
- Keep the existing download gate token/ticket validation

### A3 — WorkflowOS record download route

**File:** `src/app/api/workflowos/records/[recordId]/download/route.ts`

- Replace `requireUserContext()` with `getCurrentUser()` + `enforce(user, { type: "record", id: recordId }, "export")`
- Keep the existing record lookup, org check, export status gate, and audit event write — those are business logic, not auth

### A4 — Test compatibility updates

**Files:** Test files that mock `@/lib/auth` with the legacy helpers

- Find test files that mock `requireDecisionAccess`, `getAuditActor`, or `requireUserContext` for these specific routes
- Update mocks to provide `getCurrentUser` if not already provided
- Do NOT rewrite entire test suites — only update the mock signatures to match the new import paths
- If a test was specifically testing the legacy auth behavior (not the business logic), update it to test the facade path

**Search pattern for test files:**
```bash
rg -l "requireDecisionAccess|getAuditActor" --glob "*.test.*" src/ cypress/
```

### A5 — Parity verification after cutover

- Run the parity report script (`scripts/authorization/parity-report.ts`) on the migrated download routes
- Confirm no authorization behavioral divergence between the old and new paths
- Document any divergence found

---

# 4) Workstream B — DecisionOS First Action Migration

## Goal

Migrate 4–6 DecisionOS server actions from `requireDecisionAccess()` / `requireUserContext()` to the shared `authorize()` facade, establishing the pattern for the remaining product migration.

## Action selection criteria

Choose 4–6 DecisionOS actions that are:

1. **High governance value** — review, approval, evidence, export actions preferred
2. **Low coupling** — actions that don't require complex tenant / ownership context beyond what the facade provides
3. **Well-tested** — existing test coverage gives confidence in regression detection
4. **Representative** — covering a range of permission levels (read, approve, export, admin)

## Recommended action candidates

These are the best candidates based on the DecisionOS route structure and governance model (confirm by inspecting actual action files):

| Action | Resource Type | Action | Priority | Reason |
|--------|---------------|--------|----------|--------|
| Approve decision | `decision` | `approve` | **High** | Governance-critical; clear permission semantics |
| Reject decision | `decision` | `reject` | **High** | Governance-critical; same pattern as approve |
| Export decision report | `decision` | `export` | **High** | Export surface — already migrated pattern from Wave 1 |
| Review decision evidence | `evidence` | `review` | **Medium** | Evidence flow; cross-product resource type |
| Create decision | `decision` | `create` | **Medium** | Standard mutation; good baseline test |
| Delete decision (if action exists) | `decision` | `delete` | **Medium** | Admin-level action |

**Final list must be verified by reading the actual action files** — do not assume all these actions exist.

## Required tasks

### B1 — Read and inventory DecisionOS actions

**File:** `src/actions/decisions.ts` (or `src/actions/decision-*.ts` — check actual file structure)

- Read all DecisionOS server action files
- Identify which actions use `requireDecisionAccess()` vs `requireUserContext()` vs other patterns
- Select 4–6 actions matching the criteria above
- Document the selection rationale

### B2 — Migrate each selected action

For each action:

**Before (typical pattern):**
```typescript
const { user, organizationId } = await requireDecisionAccess(decisionId, "OPERATOR");
```

**After:**
```typescript
const user = await getCurrentUser();
await enforce(user, { type: "decision", id: decisionId }, "approve");
```

**Rules for each migration:**
- Replace `requireDecisionAccess()` with `getCurrentUser()` + `enforce()`
- Choose the correct `AccessAction` (approve, reject, export, read, create, delete)
- Keep ALL business logic unchanged
- Keep ALL return types unchanged
- Keep ALL existing error handling unchanged
- If the action collects evidence or does a download, use appropriate resource type

### B3 — Add observability

- Ensure these migrated actions are covered by the deny logging hook (already in `authorize()` from Wave 1 — verify)
- Ensure shadow parity comparison runs (already in `requireUserContext()` from Wave 1 — verify coverage)
- If the action was using `requireDecisionAccess()` which had built-in shadow engine integration, verify the shadow path is not lost — the `authorize()` facade does NOT yet call the RB-02 engine in active mode (that's later), but the shadow parity in `requireUserContext()` only covers the path if the action FIRST calls `requireUserContext()` as a deprecated helper. Add shadow evaluation at the `enforce()` level if needed.

### B4 — Test verification

- Run the full DecisionOS test suite: `npm test -- --testPathPatterns="decision"`
- Confirm all DecisionOS tests pass with the migrated actions
- If any test fails, it should be because it mocks `requireDecisionAccess` — update the mock to provide `getCurrentUser` and `authorize` mocks instead

---

# 5) Explicit Non-Goals

Do NOT:

- Migrate AuditOS, LocalContentOS, SalesOS, or WorkflowOS product actions (except the download routes explicitly listed in Workstream A)
- Promote RB-02 engine from shadow to active
- Remove `requireUserContext()` from files outside this scope
- Refactor middleware / route protection beyond what's needed for these specific routes
- Add ABAC policies
- Rewrite DecisionOS test suites (update mocks only)
- Touch Prisma schema
- Change any file not listed in the scope above

---

# 6) Wave 2 Acceptance Criteria

Wave 2 is complete only if **all** of the following are true:

### C1 — Download routes are fully migrated (Wave 2A)

- [ ] All 3 download routes use `getCurrentUser()` + `enforce()` end-to-end
- [ ] No legacy auth helpers (`requireDecisionAccess`, `requireUserContext`, `getAuditActor`) called for authorization in these routes
- [ ] Download gate/ticket validation is preserved (separate concern)
- [ ] All existing integration/smoke tests for these routes pass

### C2 — DecisionOS actions are migrated (Wave 2B)

- [ ] 4–6 DecisionOS actions use `getCurrentUser()` + `enforce()` with appropriate resource types and actions
- [ ] No `requireDecisionAccess()` calls remain in the migrated actions
- [ ] All existing DecisionOS tests pass

### C3 — No regression

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes (160 routes, 0 errors matching baseline)
- [ ] `npm test` passes with the same baseline as pre-Wave-2 (367/371 suites, 4092/4113 tests)
- [ ] All targeted test suites pass

### C4 — Parity / divergence documented

- [ ] Any authorization behavior change on migrated download routes is documented
- [ ] Any DecisionOS authorization divergence is documented

### C5 — Completion report written

- [ ] `docs/architecture/AQLIYA_AUTHORIZATION_WAVE2_REPORT.md` exists

---

# 7) Required Validation

| Command | Expected | Criteria |
|---------|----------|----------|
| `npx tsc --noEmit` | PASS | C3 |
| `npm run build` | PASS (160 routes, 0 errors) | C3 |
| `npm test` | PASS (baseline match) | C3 |
| `npm test -- --testPathPatterns="download|decision"` | PASS (targeted) | C1, C2 |

---

# 8) Deliverables

## A) Code changes in the repository

Only the files listed in Sections 3 and 4. Each change must be minimal and surgical.

## B) Completion report at:

`docs/architecture/AQLIYA_AUTHORIZATION_WAVE2_REPORT.md`

### Required structure:

```
# AQLIYA Authorization — Wave 2 Completion Report

## 1. Scope of This Wave

## 2. Summary of Changes

Table: Workstream, Files Changed, Change Summary, Status, Acceptance Criteria

## 3. Workstream A — Download Route Full Migration

### A1 Audit evidence download
### A2 Decisions evidence download  
### A3 WorkflowOS record download
### A4 Test compatibility updates
### A5 Parity verification

## 4. Workstream B — DecisionOS First Action Migration

### B1 Action inventory and selection
### B2 Migrated actions table (action name, before, after, resource type, action)
### B3 Observability notes
### B4 Test results

## 5. Acceptance Criteria Verification

C1–C5 with evidence.

## 6. Validation Performed

Command | Result | Summary

## 7. Remaining Legacy Surfaces (cumulative)

List what is still NOT migrated after this wave.

## 8. Recommended Wave 3 Targets
```

---

# 9) Important Constraints

1. **No behavior changes** — these migrations must not alter authorization outcomes
2. **Tests must pass** — if a migration changes behavior, stop and investigate
3. **Minimal diffs** — each file change should be the smallest possible edit
4. **No dead code** — do not leave commented-out code or unused imports
5. **Do NOT remove `requireUserContext()` from files outside this scope**
6. **Do NOT promote RB-02 engine**

---

**Execute Workstream A first, then Workstream B. Validate after each workstream. Report results. Do not exceed scope.**
