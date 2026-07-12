# AQLIYA Authorization — Migration Plan

> **Status:** Staged migration design | **Date:** 2026-07-10  
> **Purpose:** Incremental, safe migration from 6-path fragmented authorization to unified `authorize()` facade  
> **Prerequisites:** `AQLIYA_AUTHORIZATION_CURRENT_STATE.md`, `AQLIYA_AUTHORIZATION_TARGET_MODEL.md`

---

## 1. Migration Goals

1. **Establish `authorize()` as the single authorization entry point** across all AQLIYA governed products
2. **Promote RB-02 engine from shadow to active**, with feature-flag rollout for safety
3. **Retire product-specific guard systems** in favor of thin wrappers on the unified facade
4. **Unify authorization decision audit logging** — every deny is recorded
5. **Reduce role vocabulary from 3 to 1 normalized representation**
6. **Zero regression** — no product behavior changes during migration

---

## 2. Non-Goals

| What is NOT in scope | Why |
|---------------------|-----|
| AuditOS tenant convergence (`AuditOrganization` → `Organization`) | Deep schema change; requires separate ADR and program |
| Full ABAC policy authoring | ABAC exists as extension point; not required for basic authz consolidation |
| Rewriting or replacing the RB-02 engine | Engine is production-ready; promotion is the goal |
| Adding per-route middleware authorization | Middleware stays coarse; resource authorization stays in actions |
| User-interface permission management | Backend authorization consolidation only |

---

## 3. Migration Strategy Overview

### Strategy: Incremental facade adoption with shadow monitoring

The migration is **not a rewrite**. It is a **gradual path-switching** operation:

1. **Phase 1:** Make the existing facade observable — know what's happening
2. **Phase 2:** Build the bridge — make it easy to use the facade
3. **Phase 3:** Switch high-risk paths — where the blast radius is smallest
4. **Phase 4:** Switch product paths — product-by-product consolidation
5. **Phase 5:** Retire legacy paths — remove the old mechanisms

**Key insight:** The `authorize()` facade already exists. The RB-02 engine already exists. The migration infra (shadow logger, parity reporter) already exists. **The code is ready — the adoption is not.**

### Dependency graph

```
Phase 1 (Observability)
    │
    ▼
Phase 2 (Facade bridge + compatibility layer)
    │
    ├────────────┬────────────┬──────────────┐
    ▼            ▼            ▼              ▼
Phase 3a   Phase 3b    Phase 3c       Phase 3d
(Platform   (Auth      (Download      (Middleware
 admin)     events)     routes)        role cleanup)
    │            │            │              │
    └────────────┴────────────┴──────────────┘
                     │
                     ▼
            Phase 4a       Phase 4b       Phase 4c
            (AuditOS)      (DecisionOS)   (LCOS)
                     │
                     ▼
            Phase 4d       Phase 4e
            (SalesOS)      (WorkflowOS)
                     │
                     ▼
            Phase 5 (Legacy retirement)
```

---

## 4. Phased Plan

### Phase 1 — Stabilization and Inventory Hardening

**Objective:** Make the current authorization system measurable without changing any behavior.

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 1.1 | Add authorization decision logging hook to `authorize()` facade — every deny writes to `PlatformAuditLog` | Low | Logs appear after denied action |
| 1.2 | Activate shadow logger on RB-02 engine for ALL product paths (not just DecisionOS) that use `requireUserContext()` | Low | Parity report shows match rate |
| 1.3 | Run parity report between `requireUserContext()` decisions and `authorize()` facade decisions for 1 week | Low | Report with decision-mismatch rate |
| 1.4 | Identify all `requireUserContext()` call sites (87+ files) and classify each as "facade-ready" or "needs analysis" | Low | Inventory spreadsheet |
| 1.5 | Create `scripts/authorization/` directory with a parity-analysis script that replays recent decisions through both paths | Low | Script runs without side effects |

**Files touched:** `src/lib/authorization/authorize.ts` (add audit logging hook), `src/lib/authorization/engine/migration/` (activate shadow logger for more paths)

**Risk:** Low — all changes are additive (logging, shadow monitoring, not enforcement)

**Exit criteria:** Parity report exists; shadow logging runs on all auth paths; deny audit hook deployed

---

### Phase 2 — Shared Authorization Facade

**Objective:** Make the `authorize()` facade the natural, idiomatic choice for new code and trivial to adopt for existing code.

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 2.1 | Add `enforce` and `isAllowed` exports to `@/lib/auth` barrel for discoverability | Low | Existing imports work |
| 2.2 | Create thin adapters: `requireUserContextToEnforce()`, `requireOrgAccessToEnforce()` — one-line wrappers that call `getCurrentUser()` + `enforce()` | Low | Drop-in replacement |
| 2.3 | Add deprecation JSDoc `@deprecated Use authorize() facade instead` on `requireUserContext(role)` and `requireOrgAccess()` | Low | Console warnings on usage |
| 2.4 | Create `scripts/authorization/facade-usage-report.ts` that counts authorize vs requireUserContext call sites | Low | Running report |
| 2.5 | Publish ADR-R-03: "Authorization Facade is the Single Entry Point" | None | Architecture document |

**Files touched:** `src/lib/auth.ts` (deprecation notices, adapter functions), `src/lib/authorization/index.ts` (ensure clean exports)

**Risk:** Low — additive changes only; no behavior change

**Exit criteria:** Deprecation notices on legacy helpers; facade adapters available; ADR published

---

### Phase 3 — High-Risk Surface Migration

**Objective:** Migrate the highest-risk authorization paths first — platform admin actions, audit events, download routes, and middleware cleanup.

#### Phase 3a — Platform Admin Actions

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 3a.1 | Migrate `src/actions/sso-admin-actions.ts` — replace `requireUserContext("ADMIN")` with `enforce(user, { type: "settings" }, "admin")` | **Low-Medium** | SSO tests pass (4 suites) |
| 3a.2 | Migrate `src/actions/organization-actions.ts` — admin org management | **Low-Medium** | Org tests pass |
| 3a.3 | Migrate `src/actions/tenant-actions.ts` — cross-tenant operations | **Medium** | Tenant isolation tests pass |
| 3a.4 | Migrate `src/actions/platform-overview-actions.ts` | Low | Platform tests pass |

**Risk rationale:** Platform admin actions have the simplest auth pattern (ADMIN only) and the highest security benefit from unified audit logging.

#### Phase 3b — Audit Event / Logging Paths

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 3b.1 | Migrate audit trail read actions to use `authorize()` | Low | Audit log tests pass |
| 3b.2 | Ensure `PlatformAuditLog` write always includes authorization context (user, org, resource type) | Low | Log inspection |

#### Phase 3c — Download / Export Routes

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 3c.1 | Migrate `/api/audit/evidence/[evidenceId]/download` — verify download gate + authorize() | **Medium** | Download integration tests pass |
| 3c.2 | Migrate `/api/decisions/[decisionId]/evidence/[evidenceId]/download` | **Medium** | Decision download tests pass |
| 3c.3 | Migrate `/api/workflowos/records/[recordId]/download` | **Medium** | Workflow record tests pass |

**Risk rationale:** Download routes are externally facing and have existing tests; any regression is caught by integration tests.

#### Phase 3d — Middleware Route Minimal Role Cleanup

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 3d.1 | Remove dead `/decision` key from `routeMinRoles` | **Done** (hardening fix) | Already verified |
| 3d.2 | Audit middleware matcher for any remaining route gaps | Low | Route inventory check |

**Files touched:** Multiple action files, 2–3 API route handlers

**Risk:** Medium — individual changes are small; cumulative blast radius is contained by per-file tests

**Exit criteria:** All platform admin actions use `authorize()`; download routes use unified facade; middleware clean

---

### Phase 4 — Product-by-Product Consolidation

**Objective:** Each governed product migrates its authorization to the `authorize()` facade.

#### Phase 4a — AuditOS

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 4a.1 | Migrate engagement actions that use `requireUserContext()` directly: replace with `guardEngagementAccess()` (which already calls `enforce()`) | **Medium** | Engagement workflow tests (section 8 of audit) |
| 4a.2 | Ensure all engagement mutation actions use `guardEngagementAccess()` | **Medium** | Action-by-action audit |
| 4a.3 | Remove direct `requireUserContext()` calls from audit actions where `guardEngagementAccess()` handles it | **Medium** | No regression in 174 test files |
| 4a.4 | Document AuditOS tenant bridge: `platformOrganizationId` on `AuditOrganization` as the canonical AUDIT→PLATFORM tenant resolution | None | Architecture note |

**Priority:** AuditOS is the deepest product with 174 test files and the pilot engagement workflow. Migrate with care.

**Files touched:** ~10 audit action files

#### Phase 4b — DecisionOS

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 4b.1 | Migrate `src/actions/decisions.ts` actions to `guardDecisionAccess()` (via `product-guards.ts`) | **Medium** | Decision action tests |
| 4b.2 | Replace `requireUserContext()` in decision actions with `getCurrentUser()` + `enforce()` | **Medium** | 55 test files pass |
| 4b.3 | Remove duplicate `requireDecisionAccess()` shadow logic; push shadow responsibility to `authorize()` facade-level hook | **Medium** | Shadow parity report confirms match |

**Note:** DecisionOS already has the most progressive auth pattern (shadow engine in `requireDecisionAccess()`). Phase 4b should be the smoothest migration.

#### Phase 4c — LocalContentOS

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 4c.1 | **Retire custom `canPerformAction()`** in `src/lib/local-content/guards.ts` | **High** | 23 test files must pass |
| 4c.2 | Replace `assertProjectAccess()` with `guardProjectAccess()` (which calls `enforce()` with appropriate action) | **High** | LC workflow tests |
| 4c.3 | Map `ProjectAction` enum to `AccessAction` enum values (view→read, classify→update, approve→approve, etc.) | **Medium** | No semantic drift |
| 4c.4 | Remove duplicate tenant check from `assertProjectAccess()` — handled by `tenant-guard.ts` in facade | **Medium** | Tenant isolation tests |

**Risk rationale:** LocalContentOS has its own complete guard system (`canPerformAction()`, `assertProjectAccess()`, custom `ProjectAction` enum). This is the HIGHEST risk migration because it replaces a self-contained system with a shared one. Requires thorough regression testing.

**Mitigation:** Use feature-flag parallel run during migration. Both guard systems run; the facade's decision is compared to the legacy decision. Live behavior uses legacy until parity is confirmed.

#### Phase 4d — SalesOS

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 4d.1 | Migrate sales actions that use `requireUserContext()` to `guardDealAccess()` or `guardAccountAccess()` | **Medium** | 75 test files pass |
| 4d.2 | Ensure `sales-actions.ts` and `sales-dashboard-actions.ts` use facade guard | **Medium** | Sales pipeline tests |
| 4d.3 | Do NOT touch `src/lib/salesos/workflow/guards.ts` — this is business governance, correctly placed | None | Document as governance |

**Note:** SalesOS has v02/vnext parallel debt. Migrate only the authorization layer; do not attempt to consolidate v02/vnext as part of this program.

#### Phase 4e — WorkflowOS / Office AI / Contacts

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 4e.1 | Migrate WorkflowOS actions: `requireUserContext()` → `guardRecordAccess()` | Low-Medium | 31 action tests |
| 4e.2 | Migrate Office AI actions: `requireUserContext()` → `enforce()` with appropriate resource | Low-Medium | 248 tests claimed |
| 4e.3 | Migrate Contacts actions: `requireUserContext()` → `enforce()` | Low | 7 pages; integration tests mock Prisma |

**Risk:** Low to Medium — these products have thinner guard systems

**Files touched:** ~20 action files across all products

**Exit criteria for Phase 4:** Zero `requireUserContext(role)` calls in product action code (only `getCurrentUser()` for identity); zero product-specific guard files that bypass `authorize()`

---

### Phase 5 — Legacy Retirement and Enforcement Tightening

**Objective:** Remove legacy authorization paths and enable the RB-02 engine platform-wide.

| # | Action | Risk | Validation |
|---|--------|------|------------|
| 5.1 | **Promote RB-02 engine from shadow to active** — set `FEATURE_AUTHZ_SHADOW=1` in staging, monitor parity report for 2 weeks | **High** | Parity report: 99.9%+ match |
| 5.2 | Enable RB-02 engine for pilot orgs via per-org feature flag | **High** | Pilot feedback |
| 5.3 | Enable RB-02 engine platform-wide; remove shadow mode | **High** | Full regression suite |
| 5.4 | Remove deprecated `requireUserContext(role)` overloads — keep `getCurrentUser()` only for identity | **Medium** | All tests pass |
| 5.5 | Remove `@deprecated` annotations after all call sites migrated | Low | Grep shows zero usage |
| 5.6 | Remove `src/lib/local-content/guards.ts` (retired) | Medium | LC tests pass via facade |
| 5.7 | Delete shadow migration infra or archive to `docs/archive/` | Low | Not needed after promotion |

**Risk:** Phase 5 carries the highest risk because it changes enforcement. All prior phases must complete first.

**Exit criteria:** RB-02 engine active; `requireUserContext(role)` removed; product guards retired; shadow infra archived

---

## 5. Recommended First Migration Targets

### Why these first

| Target | Reason | Phase |
|--------|--------|-------|
| Platform admin actions (SSO, orgs, tenants) | Simplest auth pattern (ADMIN only); highest security value | 3a |
| DecisionOS actions | Already uses `requireDecisionAccess()` with shadow engine — smoothest transition | 4b |
| Download/export routes | Already tested, externally facing, high risk if misconfigured | 3c |
| Office AI / Contacts | Lower blast radius if regression occurs | 4e |

### Why delayed

| Target | Reason | Phase |
|--------|--------|-------|
| LocalContentOS `assertProjectAccess()` | Self-contained system — needs parallel run parity check | 4c |
| AuditOS engagement actions | Deepest workflow — any regression blocks pilot | 4a |
| RB-02 engine promotion | Highest risk — requires all prior phases complete | 5 |

---

## 6. Compatibility / Adapter Strategy

### During migration, three compatibility mechanisms are available:

**Mechanism 1 — Deprecation wrappers (Phase 2+)**
```typescript
/** @deprecated Use `enforce(user, resource, action)` from @/lib/authorization */
export async function requireUserContext(role: RequiredRole): Promise<CurrentUser> {
  const user = await getCurrentUser();
  // Shadow mode: compare with authorize() facade result
  shadowCompareRoleCheck(user, role);
  if (!hasRequiredRole(user, role)) {
    throw new Error(`Access denied: ${role} role required`);
  }
  return user;
}
```
- Keeps existing behavior
- Adds parallel facade evaluation for parity monitoring
- No downstream code changes

**Mechanism 2 — Parallel guard evaluation (Phase 4c for LCOS)**
```typescript
// During migration, both guards run
const oldResult = oldGuardSystem(user, action);  // Legacy
const newResult = await enforce(user, resource, action);  // Facade

// Log parity mismatch but don't fail
if (oldResult !== newResult) {
  await logParityMismatch("local-content", user.id, action, oldResult, newResult);
}

// Still throw based on legacy behavior
if (!oldResult) throw new Error("Access denied");
```
- Zero behavior change during migration
- Collects parity data to prove readiness
- Switches when parity confidence > 99.9%

**Mechanism 3 — Per-org feature flag rollout (Phase 5)**
```typescript
if (await isFeatureEnabled("authorization.engine-active", organizationId)) {
  return await engine.authorize(request);
} else {
  return legacyFallback(request);
}
```
- Gradual RB-02 engine rollout per organization
- Failover to legacy path if engine errors
- Monitored through parity logging

### Migration state machine for each action:

```
[Legacy] ──→ [Legacy + Shadow Facade] ──→ [Facade + Shadow Legacy] ──→ [Facade Only]
                Phase 1–2                    Phase 3–4                   Phase 5
                (monitoring)                 (parallel run,              (retired legacy)
                                              legacy authority)
```

---

## 7. Testing and Verification Strategy

### 7.0 LocalContentOS Parallel Evaluation Mechanism

For Phase 4c (LocalContentOS migration), the product guard `assertProjectAccess()` in `src/lib/local-content/guards.ts` is a self-contained system that cannot be replaced atomically. The parallel evaluation strategy:

**Inside `assertProjectAccess()`, during migration:**
```
1. Resolve user via getCurrentUser()
2. Run legacy check: canPerformAction(user, action)          → legacyAllowed: boolean
3. Run facade check: enforce(user, { type: "project", ... }, action)  → facadeAllowed: boolean
4. If legacyAllowed ≠ facadeAllowed:
     log divergence to shadow logger (user, action, resource, both results)
5. THROW based on legacyAllowed only  ← behavior unchanged
6. After 99.9% match rate for 14 days:
     SWAP: throw based on facadeAllowed instead
7. After 99.9% match rate for another 14 days:
     REMOVE: replace assertProjectAccess() inline with guardProjectAccess()
     DELETE: src/lib/local-content/guards.ts
```

**Implementation note:** This does NOT require a feature flag on the action. Both paths run every time; the legacy path controls behavior. The swap is a one-line change (`if (!facadeAllowed)` instead of `if (!legacyAllowed)`).

### 7.1 Automated testing

| Test type | What it covers | When |
|-----------|---------------|------|
| Existing unit tests | Individual action behavior | Every migration — must pass |
| Existing integration tests | Multi-step flows | Every migration — must pass |
| Parity report | Facade decision vs legacy decision match rate | Weekly during Phases 3–4 |
| Shadow logger diff | RB-02 engine vs production decision | Daily during Phase 4–5 |
| Full regression suite (367 suites, 4092 tests) | No regression | Before each phase gate |

### 7.2 Manual verification gates

| Gate | What to verify | Phase |
|------|---------------|-------|
| Pre-migration baseline | Run full test suite; record pass count | Before any change |
| Per-action migration | Run tests; verify parity log shows 100% match | 3–4 |
| Pilot org rollback test | Disable RB-02 and confirm legacy path still works | 5 |
| Post-migration cleanup | Grep for retired patterns; confirm zero usage | 5 |

### 7.3 Rollback plan

If any phase causes a regression:
1. **Phase 3–4:** Revert the individual action migration — legacy path still works
2. **Phase 5:** Disable RB-02 engine via feature flag — instantly falls back to RBAC-only `authorize()` path
3. **Emergency:** Set `FF_AUTHORIZATION_LEGACY=true` env var — restores pre-migration behavior

### 7.4 RB-02 Engine Circuit Breaker (Auto-Fail-Open)

When the RB-02 engine is promoted to active enforcement (Phase 5), it must include an automatic circuit breaker to prevent cascading failures:

```typescript
// Inside authorize() — automatic fallback if engine degrades
const engineResult = await engine.authorize(request);
const engineLatency = Date.now() - engineStart;

// Circuit breaker conditions — ANY of these triggers fallback:
const shouldFallback = [
  engineResult.decision === Decision.DENY && engineLatency > 500,
  hasExcessiveErrors(engineResult),   // 3+ errors in 60s window
  engineLatency > 2000,               // 2s timeout
].some(Boolean);

if (shouldFallback) {
  await logFallback(request, engineResult, engineLatency);
  incrementErrorCounter();  // resets after 60s
  // Fall through to RBAC-only authorization (tenant + role check)
  return rbacFallback(request);  // safe — no engine
}
```

**Properties:**
- **Fail-open after 3 consecutive engine errors** — RBAC-only fallback keeps the platform running
- **Latency threshold > 2 seconds** — prevents slow engine from blocking user actions
- **Circuit resets after 60 seconds** — automatic recovery attempt
- **Logged** — every fallback is recorded for operator visibility
- **RBAC-only is safe** — tenant guard + role permission check still enforced; only the policy stage is skipped

---

## 8. Risks and Failure Modes During Migration

| Risk | Phase | Likelihood | Impact | Mitigation |
|------|-------|-----------|--------|------------|
| Parity mismatch between legacy and facade | 3–4 | Medium | Medium | Do not switch until parity > 99.9%; investigate mismatches |
| LocalContentOS regression from retiring custom guards | 4c | Medium-High | High | Parallel run with parity logging; feature-flag switch |
| RB-02 engine performance overhead | 5 | Low | Medium | Stage-level monitoring before platform-wide enable |
| AuditOS tenant bridge misalignment | 4a | Medium | High | Document bridge explicitly; do not change tenant model in this program |
| Developer confusion during transition | 2–5 | High | Low | Deprecation notices; clear ADR; migration cookbook |

---

## 9. Exit Criteria for Consolidation Completion

**Authorization consolidation is complete when ALL of the following are true:**

| # | Criterion | How to Verify |
|---|----------|--------------|
| 1 | Zero `requireUserContext(role)` calls in product action code | `rg "requireUserContext\(" src/actions/` → zero matches |
| 2 | Every mutation action in governed products calls `enforce()` or uses a product guard that calls `enforce()` | Random sample of 10 action files per product → all use facade |
| 3 | RB-02 engine is active in production (not shadow) | `FEATURE_AUTHZ_SHADOW` not set; engine called inline |
| 4 | Authorization deny decisions are logged to `PlatformAuditLog` | Grep for `writePlatformAuditLog` near authz deny paths |
| 5 | Tenant isolation uses unified `tenant-guard.ts` | AuditOS actions checked; no direct orgId comparison outside guard |
| 6 | Product-specific guard files no longer duplicate role logic | `src/lib/local-content/guards.ts` retired; others use thin wrappers |
| 7 | Parity between legacy and facade exceeds 99.9% for 2 weeks | Parity report shows <0.1% mismatch over 14 days |
| 8 | Role vocabulary is single normalized representation | No `toLowerCase()` on roles; no `mapAuditRoleToUserRole()` calls outside bridge |

---

## 10. Recommended Execution Order

### Immediate (current week)

```
Phase 1:  Add deny logging hook + activate shadow logger on all paths
           Estimated: 2–3 days
           Risk: Low — additive only
```

### Week 2–3

```
Phase 2:  Deprecation notices + adapter functions + ADR
Phase 3a: Platform admin actions migration
Phase 3c: Download route migration
           Estimated: 1–2 weeks
           Risk: Low-Medium
```

### Week 3–5

```
Phase 4b: DecisionOS migration (easiest product)
Phase 4d: SalesOS migration
Phase 4e: WorkflowOS / Office AI / Contacts migration
           Estimated: 1–2 weeks
           Risk: Medium
```

### Week 5–7

```
Phase 4a: AuditOS migration (careful — pilot depends)
           Estimated: 1 week
           Risk: Medium — requires thorough testing
Phase 4c: LocalContentOS migration (most complex)
           Estimated: 1–2 weeks
           Risk: High — parallel run required
```

### Week 7–10

```
Phase 5:  RB-02 engine promotion + legacy retirement
           Estimated: 2–3 weeks
           Risk: High — requires all prior phases complete
```

**Total estimated duration: 12–16 weeks for full consolidation**

> **Note on timeline:** The original 8–10 week estimate assumed parallel migration of the 87+ `requireUserContext()` call sites. Each action requires individual analysis (resource type selection, AccessAction mapping, regression testing), making parallelization limited. The 12–16 week range accounts for:
> - 2–3 weeks: Phase 1–2 (foundation + observability)
> - 2–3 weeks: Phase 3 (high-risk surfaces)
> - 4–6 weeks: Phase 4 (product-by-product — 5 products × 3–7 days each + buffer)
> - 3–4 weeks: Phase 5 (RB-02 promotion + legacy retirement + burn-in)
> 
> Products can be run in parallel where team capacity allows (DecisionOS + SalesOS + WorkflowOS are lower-risk and can share a wave).

---

**Evidence basis:** `AQLIYA_AUTHORIZATION_CURRENT_STATE.md`, `AQLIYA_AUTHORIZATION_TARGET_MODEL.md`, code inventory, test suite analysis  
**Status:** DONE
