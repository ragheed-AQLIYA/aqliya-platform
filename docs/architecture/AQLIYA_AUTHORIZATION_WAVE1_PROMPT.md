# AQLIYA Authorization — Wave 1 Implementation Prompt

> **Purpose:** Standalone prompt for OpenCode to execute the first wave of authorization consolidation  
> **Basis:** `AQLIYA_AUTHORIZATION_CURRENT_STATE.md`, `AQLIYA_AUTHORIZATION_TARGET_MODEL.md`, `AQLIYA_AUTHORIZATION_MIGRATION_PLAN.md`  
> **Execution order:** Phase 1 → Phase 2 → Phase 3a → Phase 3c → Phase 3d  
> **Do NOT touch:** AuditOS actions, LocalContentOS guard, product-specific action migration

---

# AQLIYA Authorization Implementation Program — Wave 1

You are operating inside the **AQLIYA** repository as a **Principal Authorization Engineer + Platform Architect + Security Implementation Engineer**.

The analysis, verification, target model design, and migration planning phases are complete.
Your task now is to **implement the first wave** of the authorization consolidation program.

This is **not** an analysis or design mission.
This is an **execution mission** with specific, bounded deliverables.

---

# 0) Mission Objective

Implement **Phase 1 + Phase 2 + targeted Phase 3 items** from the authorization migration plan (`AQLIYA_AUTHORIZATION_MIGRATION_PLAN.md`).

These phases are safe, additive, and observable — they do NOT change any enforcement behavior, but they lay the foundation for all subsequent phases.

## What Wave 1 achieves

1. **Authorization becomes observable** — every deny is logged, shadow comparisons run
2. **`authorize()` becomes the official entry point** — deprecation notices guide new code
3. **High-risk admin/download/middleware surfaces are migrated first**
4. **Middleware gaps and dead keys are cleaned**

---

# 1) Verified Inputs — Treat as True

1. `src/lib/authorization/authorize.ts` is the target single entry point — already exists, ~15 call sites
2. `src/lib/authorization/action-guard.ts` provides `enforce()`, `isAllowed()`, `assertAuthorized()` — already exists
3. `src/lib/authorization/product-guards.ts` provides thin wrappers — already exists
4. `src/lib/auth.ts` provides `getCurrentUser()`, `requireUserContext()` — the latter is the dominant legacy pattern
5. `src/lib/authorization/engine/` has a 6-stage policy engine with 9 policies — currently in shadow mode
6. `src/middleware.ts` has `routeMinRoles` map and `config.matcher` — middleware is the first gate
7. Middleware dead key `/decision` was removed in hardening fix; `/institutional-memory` was added
8. 87+ files use `requireUserContext()` — ~15 use `authorize()` facade

---

# 2) Scope — Only These Items

## Phase 1 — Stabilization and Observability

### 1.1 Add authorization decision logging to `authorize()` facade

In `src/lib/authorization/authorize.ts`, add a logging hook after every `authorize()` call that returns `{ allowed: false }`.

**Requirements:**
- Every DENY decision writes to `PlatformAuditLog` with:
  - user ID and organization
  - resource type and optional resource ID
  - action attempted
  - reason for denial
  - timestamp
- Do NOT log ALLOW decisions (too noisy)
- Do NOT throw — logging failures must not affect authorization
- Use the existing `auditLogger` from `@/lib/platform/audit-logger`

**File to modify:** `src/lib/authorization/authorize.ts`

### 1.2 Activate shadow engine comparison on `requireUserContext()` calls

In `src/lib/auth.ts`, after the existing role check in `requireUserContext()`, add a fire-and-forget call to the RB-02 engine's shadow logger.

**Requirements:**
- After `hasRequiredRole(user, requiredRole)` passes, call `authorize()` in parallel with equivalent parameters
- Log a parity event if `requireUserContext()` allows but `authorize()` would deny (or vice versa)
- Do NOT affect production behavior — errors silently caught
- Use the existing `shadowLogger` from `@/lib/authorization/engine/migration/shadow-logger`

**File to modify:** `src/lib/auth.ts`

### 1.3 Create `scripts/authorization/parity-report.ts`

Create a simple script that:
- Reads shadow logger entries from the database (or log file)
- Computes: total comparisons, matches, mismatches, mismatch rate
- Outputs a formatted report
- Is safe to run any time (read-only)

**File to create:** `scripts/authorization/parity-report.ts`

---

## Phase 2 — Shared Authorization Facade

### 2.1 Mark `requireUserContext(role)` as deprecated

**Requirements:**
- Add `@deprecated Use `enforce()` from `@/lib/authorization` instead.` JSDoc to `requireUserContext()`, `requireOrgAccess()`, and `requireDecisionAccess()`
- Do NOT change behavior — deprecation is informational
- Keep `getCurrentUser()` as-is — it is the identity resolution function and is NOT deprecated
- Do NOT add runtime deprecation warnings (JavaScript console) — only JSDoc

**File to modify:** `src/lib/auth.ts`

### 2.2 Add convenience adapters for gradual migration

**Requirements:**
- `requireUserContextToEnforce(user, resource, action)` — calls `enforce()` after `getCurrentUser()`
- `requireOrgAccessToEnforce(user, orgId, resource, action)` — calls `enforce()` with tenant override
- These are **thin wrappers** that demonstrate the correct pattern, not permanent additions
- Export them from `src/lib/authorization/index.ts`

**Files to modify:** `src/lib/authorization/authorize.ts` (or a new `src/lib/authorization/adapters.ts`), `src/lib/authorization/index.ts`

### 2.3 Add `enforce` and related exports to main auth barrel for discoverability

Ensure that `@/lib/authorization` barrel (`src/lib/authorization/index.ts`) cleanly exports:
- `authorize`
- `enforce`, `isAllowed`, `assertAuthorized`, `guardRoleLevel`
- `checkTenantAccess`, `assertTenantAccess`
- All product guards from `product-guards.ts`
- All types (`AuthorizeOptions`, `AuthorizationResult`, `AccessAction`, `ResourceType`, etc.)

**Files to modify:** `src/lib/authorization/index.ts` (verify exports are complete)

---

## Phase 3a — High-Risk Surface: Platform Admin Actions

### 3.1 Migrate `src/actions/sso-admin-actions.ts`

**Requirements:**
- Replace `requireUserContext("ADMIN")` with:
  ```typescript
  const user = await getCurrentUser();
  await enforce(user, { type: "settings" }, "admin");
  ```
- All existing SSO admin action tests must pass unchanged
- Do NOT change function signatures or return types

**File to modify:** `src/actions/sso-admin-actions.ts`

### 3.2 Migrate `src/actions/organization-actions.ts`

**Requirements:**
- Same pattern as sso-admin-actions
- Replace role checks with `enforce(user, { type: "organization", id }, "admin")` where appropriate
- Organization management actions use `"admin"` action
- Read actions use `"read"` action

**File to modify:** `src/actions/organization-actions.ts`

### 3.3 Migrate `src/actions/ai-settings-actions.ts`

**Requirements:**
- Replace `requireUserContext("ADMIN")` with `enforce(user, { type: "settings" }, "admin")`
- AI model management actions

**File to modify:** `src/actions/ai-settings-actions.ts`

---

## Phase 3c — High-Risk Surface: Download / Export Routes

### 3.4 Migrate `/api/audit/evidence/[evidenceId]/download/route.ts`

**Requirements:**
- Replace `requireUserContext()` with:
  ```typescript
  const user = await getCurrentUser();
  await enforce(user, { type: "evidence", id: evidenceId }, "export");
  ```
- Keep the existing download gate (ticket/token validation) — that is a separate concern
- All existing download integration tests must pass

**File to modify:** `src/app/api/audit/evidence/[evidenceId]/download/route.ts`

### 3.5 Migrate `/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts`

**Requirements:**
- Same pattern: `getCurrentUser()` + `enforce(user, { type: "evidence", id }, "export")`
- Keep download gate

**File to modify:** `src/app/api/decisions/[decisionId]/evidence/[decisionId]/download/route.ts`

### 3.6 Migrate `/api/workflowos/records/[recordId]/download/route.ts`

**Requirements:**
- Same pattern: `getCurrentUser()` + `enforce(user, { type: "record", id }, "export")`

**File to modify:** `src/app/api/workflowos/records/[recordId]/download/route.ts`

---

## Phase 3d — Middleware Route Cleanup

### 3.7 Verify middleware matcher completeness

**Requirements:**
- Read `src/middleware.ts` config.matcher and routeMinRoles
- Verify that all governed workspace routes have matcher entries (already fixed for institutional-memory)
- Verify no dead keys remain (should be clean after hardening fix + this mission's /decision removal)
- If you find any missing governed routes, add them (surgically — do not broaden indiscriminately)

**File to modify:** `src/middleware.ts` (if needed — verify first)

---

# 3) Explicit Non-Goals

Do NOT:

- Migrate any AuditOS product actions
- Migrate any LocalContentOS product actions
- Migrate DecisionOS, SalesOS, WorkflowOS, Office AI product actions
- Change the RB-02 engine from shadow to active
- Rewrite `src/lib/local-content/guards.ts`
- Add ABAC policies
- Redesign tenant isolation
- Change any Prisma schema
- Modify any test file — existing tests must continue to pass as-is

---

# 4) Wave 1 Acceptance Criteria

Wave 1 is complete only if **all** of the following criteria are met:

### C1 — `authorize()` observability is active

- [ ] Deny decisions are logged with enough metadata to identify actor, surface, action, and reason
- [ ] Shadow/parity evaluation is recorded for the targeted migrated surfaces
- [ ] No sensitive secrets or raw PII are logged in authorization audit events

### C2 — Targeted high-risk surfaces are migrated to the shared authorization path

- [ ] Platform admin actions (SSO, organizations, AI settings) use `getCurrentUser()` + `enforce()` from the shared facade
- [ ] Download/export routes (audit, decisions, workflowos) use the shared authorization path
- [ ] Middleware changes, if any, do not widen public access or break demo/public surfaces

### C3 — Legacy paths remain operational but are clearly marked

- [ ] Deprecated helpers touched in this wave have `@deprecated` JSDoc notices
- [ ] Compatibility wrappers or adapters are in place where needed
- [ ] `requireUserContext()` is **not** removed repo-wide — it remains as an allowed compatibility path outside the migrated scope

### C4 — No regression is introduced

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes (160 routes, 0 errors)
- [ ] Targeted tests for touched areas pass (baseline: 367/371 suites, 4092/4113 tests)
- [ ] If parity/divergence logs reveal material mismatch on migrated surfaces, the wave is not complete until documented and resolved, or explicitly scoped out

### C5 — A completion report is written

- [ ] `docs/architecture/AQLIYA_AUTHORIZATION_WAVE1_REPORT.md` exists with files changed, migrated surfaces, remaining legacy surfaces, known divergences, and recommended Wave 2 targets

---

# 5) Required Validation After Changes

Run and report results for each criterion above:

| Command | Expected | Acceptance Criteria |
|---------|----------|-------------------|
| `npx tsc --noEmit` | PASS | C4 |
| `npm run build` | PASS (160 routes, 0 errors) | C4 |
| `npm test` | PASS (367/371 suites, 4092/4113 tests — same baseline) | C4 |
| `npm test -- --testPathPatterns="sso|organization|ai-settings|download|middleware|authorize"` | PASS (targeted) | C4 |

If any test fails, identify whether it is a regression caused by this mission or a pre-existing issue. Regressions must be fixed before the wave is considered complete.

### Parity / divergence check

| Check | Method | Acceptance Criteria |
|-------|--------|-------------------|
| Divergence detection | Run parity report script on migrated surfaces | C1, C4 — any material divergence must be documented |
| Shadow logging active | Verify shadow logger entries exist in target log/store | C1 |

---

# 6) Deliverables

## A) Code changes in the repository

Only the files listed in Section 2. Each file change must be minimal and surgical.

## B) Completion report at:

`docs/architecture/AQLIYA_AUTHORIZATION_WAVE1_REPORT.md`

### Required structure:

```
# AQLIYA Authorization — Wave 1 Completion Report

## 1. Scope of This Wave

## 2. Summary of Changes

Table: Wave, Files Changed, Change Summary, Status

## 3. Phase 1 — Observability Implementation

### 1.1 Deny logging hook
### 1.2 Shadow engine parity on requireUserContext
### 1.3 Parity report script

## 4. Phase 2 — Facade Hardening

### 2.1 Deprecation notices
### 2.2 Adapter functions
### 2.3 Barrel export cleanup

## 5. Phase 3 — High-Risk Surface Migration

### 3.1 SSO admin actions
### 3.2 Organization actions
### 3.3 AI settings actions
### 3.4–3.6 Download route migrations
### 3.7 Middleware verification

## 6. Validation Performed

Command | Result | Summary

## 7. Residual Risks

## 8. Ready for Wave 2? (YES / NO / Conditional)
```

---

# 6) Important Constraints

1. **No behavior changes** — these changes must not alter any existing authorization outcome
2. **Tests must pass** — if a migration changes behavior, stop and investigate
3. **Minimal diffs** — each file change should be the smallest possible edit
4. **No dead code** — do not leave commented-out code or unused imports
5. **Deprecation is documentation, not enforcement** — `@deprecated` JSDoc only, no runtime warnings

---

**Prepare and validate. Report results. Do not exceed scope.**
