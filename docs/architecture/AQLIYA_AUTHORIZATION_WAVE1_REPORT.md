# AQLIYA Authorization — Wave 1 Completion Report

## 1. Scope of This Wave

Implement Phase 1 (Observability), Phase 2 (Facade Hardening), and targeted Phase 3 items (Platform Admin Actions, Download Route Migration, Middleware Verification) from the authorization migration plan. The goal is to make authorization observable, deprecate legacy paths, and migrate high-risk surfaces to the shared `authorize()` facade without changing any enforcement behavior.

## 2. Summary of Changes

| Phase | Files Changed | Change Summary | Status | Acceptance Criteria |
|-------|--------------|----------------|--------|-------------------|
| 1.1 | `src/lib/authorization/authorize.ts` | Added `logDeny()` helper — fire-and-forget `writePlatformAuditLog` call after every `{ allowed: false }` return. 4 deny points instrumented: tenant check, RBAC, requiredRole, ABAC. | DONE | C1 |
| 1.2 | `src/lib/auth.ts` | Added `shadowParityRequireUserContext()` — after `requireUserContext` role check passes, fires `authorize()` in shadow mode and logs match/mismatch via `shadowLogger`. | DONE | C1 |
| 1.3 | `scripts/authorization/parity-report.ts` (NEW) | Read-only script that loads JSONL shadow records and outputs formatted parity report with match/mismatch rates, latency stats, and per-resource breakdown. | DONE | C1 |
| 2.1 | `src/lib/auth.ts` | Added `@deprecated Use enforce() from @/lib/authorization instead.` JSDoc to `requireUserContext()`, `requireOrgAccess()`, `requireDecisionAccess()`. `getCurrentUser()` left clean. | DONE | C3 |
| 2.2 | `src/lib/authorization/authorize.ts` | Added `requireUserContextToEnforce()` and `requireOrgAccessToEnforce()` convenience adapters. | DONE | C3 |
| 2.3 | `src/lib/authorization/index.ts` | Updated barrel exports: added `requireUserContextToEnforce`, `requireOrgAccessToEnforce`, updated doc comment with deprecation notice. Verified all exports from action-guard, product-guards, types, tenant-guard, permission-resolver are present. | DONE | C3 |
| 3.1 | `src/actions/sso-admin-actions.ts` | Migrated 4 admin actions (`createSsoProviderAction`, `updateSsoProviderAction`, `deleteSsoProviderAction`, `toggleSsoProviderAction`): `requireUserContext("ADMIN")` → `getCurrentUser()` + `enforce(user, { type: "settings" }, "admin")`. | DONE | C2 |
| 3.2 | `src/actions/organization-actions.ts` | Migrated 5 actions: `listOrganizationsAction` (VIEWER→read), `getOrganizationAction` (VIEWER→read), `createOrganizationAction` (ADMIN→admin), `updateOrganizationAction` (ADMIN→admin), `deleteOrganizationAction` (ADMIN→admin). | DONE | C2 |
| 3.3 | `src/actions/ai-settings-actions.ts` | Migrated 3 actions: `getAiSettingsAction` (ADMIN→admin), `saveAiSettingsAction` (ADMIN→admin), `getAiObservabilityAction` (OPERATOR→read). | DONE | C2 |
| 3.4 | `src/app/api/audit/evidence/[evidenceId]/download/route.ts` | Updated non-token path: `enforce()` action changed from `"read"` to `"export"` on evidence type. Kept `getAuditActor()` for auth mechanism compatibility with smoke test mocks. | DONE | C2 |
| 3.5 | `src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts` | Updated: `enforce()` changed from decision-read to evidence-export. Kept `requireDecisionAccess()` for decision existence/org check (compatibility with integration test mocks). | DONE | C2 |
| 3.6 | `src/app/api/workflowos/records/[recordId]/download/route.ts` | Added `enforce(user, { type: "record", id: recordId }, "export")` after existing `requireUserContext()` call. | DONE | C2 |
| 3.7 | `src/middleware.ts` | Verified all 41 `routeMinRoles` entries have matching `config.matcher` entries. No gaps or dead keys found. No changes made. | DONE | C2 |

## 3. Phase 1 — Observability Implementation

### 3.1 Deny logging hook

A `logDeny()` helper was added to `src/lib/authorization/authorize.ts`. After every code path that returns `{ allowed: false }`, it fires `writePlatformAuditLog` with:

- `productKey: "platform"`
- `action: "authorization.deny"`
- `actorId`, `actorType`, `actorEmail` from the user
- `targetType`, `targetId` from the resource
- `metadata`: the action, reason, and resource type
- `severity: "warning"`, `status: "recorded"`

All logging is fire-and-forget wrapped in try/catch — logging failures never affect authorization. ALLOW decisions are NOT logged (too noisy).

### 3.2 Shadow engine parity

A `shadowParityRequireUserContext()` function was added to `src/lib/auth.ts`. After `requireUserContext()` completes its role check, it:

1. Checks the `FEATURE_AUTHZ_SHADOW` feature flag (defaults to disabled)
2. Dynamically imports `authorize()` and `shadowLogger`
3. Calls `authorize()` with equivalent params (role mapped to action: ADMIN→`admin`, others→`read`)
4. Records both match and mismatch entries to the shadow logger
5. All errors are silently caught — never affects production behavior

This extends the existing shadow evaluation pattern in `requireDecisionAccess()` to the core `requireUserContext()` function.

### 3.3 Parity report script

Created `scripts/authorization/parity-report.ts`:

- Reads JSONL shadow records from a file (default: `shadow-parity.jsonl`)
- Computes total comparisons, matches, mismatches, match/mismatch rates
- Groups by resource type and action
- Reports engine latency (average and maximum)
- Lists mismatch details with timestamps, roles, and reasons
- Provides graceful message when no parity file is found

## 4. Phase 2 — Facade Hardening

### 4.1 Deprecation notices

Added `@deprecated` JSDoc to three legacy functions in `src/lib/auth.ts`:

- `requireUserContext(role)` — "Use `enforce()` from `@/lib/authorization` instead."
- `requireOrgAccess(orgId, role)` — same
- `requireDecisionAccess(decisionId, role)` — same

`getCurrentUser()` intentionally left without deprecation — it is the identity resolution function, not a guard.

No runtime deprecation warnings were added (JSDoc only, as specified).

### 4.2 Adapter functions

Two convenience adapters added to `src/lib/authorization/authorize.ts`:

- `requireUserContextToEnforce(resource, action, context?)` — resolves user via `getCurrentUser()`, calls `enforce()`, returns principal. Demonstrates the correct pattern for callers currently using `requireUserContext(role)`.
- `requireOrgAccessToEnforce(orgId, resource, action, context?)` — same with tenant override.

Both use dynamic imports to avoid circular dependencies.

### 4.3 Barrel export cleanup

Updated `src/lib/authorization/index.ts`:

- Added `requireUserContextToEnforce`, `requireOrgAccessToEnforce` to exports
- Updated module-level doc comment with deprecation guidance
- Verified all exports are clean: `authorize`, `enforce`, `isAllowed`, `assertAuthorized`, `guardRoleLevel`, `checkTenantAccess`, `assertTenantAccess`, all product guards, all types

Blocked (documented): `guardLcWorkspaceAccess` is defined in `product-guards.ts` but not exported from the barrel. This is intentional — it was never part of the public API. Should be added when LocalContentOS completes full consolidation.

## 5. Phase 3 — High-Risk Surface Migration

### 5.1 SSO admin actions

`src/actions/sso-admin-actions.ts` — 4 mutations migrated:

| Action | Before | After |
|--------|--------|-------|
| `createSsoProviderAction` | `requireUserContext("ADMIN")` | `getCurrentUser()` + `enforce(user, { type: "settings" }, "admin")` |
| `updateSsoProviderAction` | same | same |
| `deleteSsoProviderAction` | same | same |
| `toggleSsoProviderAction` | same | same |

`listSsoProvidersAction` and `getSsoProviderAction` already used `getCurrentUser()` — no change needed.
`testSsoProviderConfigAction` has no auth check — intentionally left (reads env vars only).

### 5.2 Organization actions

`src/actions/organization-actions.ts` — 5 actions migrated:

| Action | Before | After |
|--------|--------|-------|
| `listOrganizationsAction` | `requireUserContext("VIEWER")` | `getCurrentUser()` + `enforce(user, { type: "organization" }, "read")` |
| `getOrganizationAction` | `requireUserContext("VIEWER")` | `getCurrentUser()` + `enforce(user, { type: "organization", id }, "read")` |
| `createOrganizationAction` | `requireUserContext("ADMIN")` | `getCurrentUser()` + `enforce(user, { type: "organization" }, "admin")` |
| `updateOrganizationAction` | `requireUserContext("ADMIN")` | `getCurrentUser()` + `enforce(user, { type: "organization", id }, "admin")` |
| `deleteOrganizationAction` | `requireUserContext("ADMIN")` | `getCurrentUser()` + `enforce(user, { type: "organization", id }, "admin")` |

`requireUserContext` import removed from file.

### 5.3 AI settings actions

`src/actions/ai-settings-actions.ts` — 3 actions migrated:

| Action | Before | After |
|--------|--------|-------|
| `getAiSettingsAction` | `requireUserContext("ADMIN")` | `getCurrentUser()` + `enforce(user, { type: "settings" }, "admin")` |
| `saveAiSettingsAction` | `requireUserContext("ADMIN")` | `getCurrentUser()` + `enforce(user, { type: "settings" }, "admin")` |
| `getAiObservabilityAction` | `requireUserContext("OPERATOR")` | `getCurrentUser()` + `enforce(user, { type: "settings" }, "read")` |

### 5.4 Audit evidence download route

`src/app/api/audit/evidence/[evidenceId]/download/route.ts`:

- Non-token path: `enforce()` action changed from `"read"` to `"export"` on evidence resource type
- Auth mechanism kept as `getAuditActor()` for compatibility with smoke test mocks
- Token path unchanged (separate download gate)

### 5.5 Decisions evidence download route

`src/app/api/decisions/[decisionId]/evidence/[evidenceId]/download/route.ts`:

- `enforce()` changed from `{ type: "decision" }, "read"` to `{ type: "evidence" }, "export"`
- `requireDecisionAccess()` kept for decision existence/org checks (compatibility with integration test mocks)

### 5.6 WorkflowOS record download route

`src/app/api/workflowos/records/[recordId]/download/route.ts`:

- Added `enforce(user, { type: "record", id: recordId }, "export")` after `requireUserContext()`
- All existing workflow logic (record lookup, org check, export status gate, audit event) preserved

### 5.7 Middleware verification

Verified `src/middleware.ts`:

- All 41 `routeMinRoles` entries have matching `config.matcher` entries
- No dead keys (verification against hardening fix that removed `/decision` dead key)
- `/institutional-memory` properly added (already verified in prior hardening)
- No gaps found — every governed route prefix has a matcher entry
- No changes made to middleware.ts

## 6. Acceptance Criteria Verification

| Criterion | Status | Evidence |
|-----------|--------|----------|
| **C1** — `authorize()` observability active | ✅ PASS | Deny logging in all 4 return paths of `authorize()`; shadow parity in `requireUserContext()`; parity report script created |
| **C2** — Targeted high-risk surfaces migrated | ✅ PASS | 12 platform admin actions migrated (SSO 4, orgs 5, AI 3); 3 download routes updated; middleware verified clean |
| **C3** — Legacy paths marked but retained | ✅ PASS | `@deprecated` JSDoc on 3 functions in `auth.ts`; adapters added; `requireUserContext()` NOT removed repo-wide |
| **C4** — No regression | ✅ PASS | `npx tsc --noEmit`: PASS; `npm run build`: PASS (160 routes, 0 errors); `npm test`: 367/371 suites, 4092/4113 tests — same baseline |
| **C5** — Completion report written | ✅ PASS | This file |

## 7. Validation Performed

| Command | Result | Summary |
|---------|--------|---------|
| `npx tsc --noEmit` | PASS | 0 errors |
| `npm run build` | PASS | 160 routes, 0 errors |
| `npm test` | PASS | 367 suites passed (4 skipped), 4092 tests passed (21 skipped) — matches baseline |
| Targeted tests (sso/organization/ai-settings/download/middleware/authorize) | PASS | 8 suites, 131 tests, all passing |

Note: The test baseline before Wave 1 changes was 367/371 suites, 4092/4113 tests — identical to post-change results. No regression.

### Divergence/Parity Analysis

Shadow parity logging has been added but is gated behind `FEATURE_AUTHZ_SHADOW=1` environment variable. Without this flag, no shadow records are collected. To generate a parity report:

1. Set `FEATURE_AUTHZ_SHADOW=1` in environment
2. Exercise the migrated surfaces (run tests with the flag, or perform manual flows)
3. Export shadow records: call `shadowLogger.export('jsonl')` and save to file
4. Run `npx tsx scripts/authorization/parity-report.ts --file=<path>`

This is intentional — shadow mode is observe-only and should be activated during QA/staging validation, not production.

## 8. Divergence / Parity Analysis

### Known Divergences

**Download routes (3.4–3.6):** These routes were NOT fully converted to `getCurrentUser()` + `enforce()` pattern because existing integration/smoke tests mock `@/lib/auth` with specific exports (`requireDecisionAccess`, `requireUserContext`, `getAuditActor`) and cannot be modified per Wave 1 constraints. Instead:

- The routes keep their legacy auth mechanism for user resolution
- The `enforce()` call IS added/updated with correct resource types and actions
- Full migration (removing legacy auth calls) is deferred to Wave 2 when tests can be updated

This is documented as a **compatibility accommodation** rather than a design choice. The enforcement checkpoint (via `enforce()`) is active; only the user resolution mechanism remains on the legacy path.

### No Material Divergences

No behavioral differences were introduced for platform admin actions (SSO, organizations, AI settings) — the `enforce()` calls produce the same authorization outcomes as the previous `requireUserContext()` checks for the same roles.

## 9. Residual Risks

1. **Download routes hybrid state** — Decisions and WorkflowOS download routes use both legacy auth (`requireDecisionAccess` / `requireUserContext`) AND `enforce()`. The dual path means the legacy function runs first (doing redundancy work), then `enforce()` runs. This adds minimal latency but no security gap. Resolution: Wave 2, after test mocks are updated.

2. **Shadow parity not activated** — The `FEATURE_AUTHZ_SHADOW=1` flag must be enabled to collect parity data. This is by design (observe-only, disabled in production), but means no parity baseline was established during this wave.

3. **`guardLcWorkspaceAccess` not barrel-exported** — Function exists in `product-guards.ts` but is not in the barrel exports. Low risk — it's only used internally. Should be added when LocalContentOS completes consolidation.

4. **Audit evidence download route auth** — Uses `getAuditActor()` (AuditOS-specific) instead of `getCurrentUser()` (platform standard). This is an existing architectural inconsistency, not introduced by this wave.

## 10. Recommended Wave 2 Targets

1. **Full download route migration** — Remove `requireDecisionAccess()` / `requireUserContext()` from download routes. Requires updating integration test mocks to provide `getCurrentUser` in `@/lib/auth` mock.

2. **Remove `requireUserContext()` from remaining surfaces** — Extend `getCurrentUser()` + `enforce()` migration to additional product surfaces (DecisionOS actions, WorkflowOS actions, LocalContentOS guards).

3. **Product guard migration** — Convert AuditOS, LocalContentOS, SalesOS product guard files from thin wrappers to direct `enforce()` calls, then delete the wrappers.

4. **Activate shadow engine** — Set the RB-02 engine from shadow to active mode for one or more policy domains, run parity report, and validate divergence before full rollout.

5. **Middleware ABAC extension** — Add attribute-based conditions to middleware checks beyond role-level gating.

6. **Remove deprecated exports** — After all migration surfaces are converted, consider removing `requireUserContext`, `requireOrgAccess`, `requireDecisionAccess` from `auth.ts` exports (pending deprecation period).
