# Parallel Remediation — Shared Gates

**Program:** AQLIYA parallel remediation (2026-06-02)

| Gate | Week | Criteria |
| ---- | ---- | -------- |
| B1 + docs | 4 | Sales opportunity review on Prisma; README = PRODUCT_STATUS_MATRIX; ACTION_GUARD_MATRIX draft |
| Demo Ready | 8 | `tsc` + `test` + `build` green; demo runbook path without `/organizations`; no in-memory banner on `/sales` |
| Sales B2 | 12 | No `initSalesWorkspace` on user-facing revenue/command-center/executive paths; `RATE_LIMITER=redis` documented |
| LOI | 24 | Signed SOW or LOI for AuditOS **or** LocalContentOS |
| First paid customer | 26 | Staging/prod for one product; MFA for tenant admins; backup restore drill documented |

## Validation commands

```bash
npx tsc --noEmit
npm test
npm run build
```

Run before claiming each gate. Record date and commit hash in PR or release notes.

## Last validation snapshot (2026-06-02, continued)

| Command | Result |
| ------- | ------ |
| `npx tsc --noEmit` | Pass |
| `npm test -- --testPathPatterns=sales-governance\|tier-b-persistence` | 18 passed |
| `npm run build` | Pass (webpack; Sentry source-map warnings only) |
| `npm test` (full) | 576 passed, 16 skipped |
| `npm run demo:smoke` | Pass (static) |
| `npm run audit:action-guards` | Pass |

## Director cycle 1 snapshot (2026-06-04)

**Playbook:** `docs/operations/parallel-execution-director.md`  
**Report:** `docs/operations/parallel-execution-cycle-2026-06-04-cycle-1.md`

| Task | Result |
| ---- | ------ |
| A1-01 AuditOS loading/error (6 tabs) | 12 files added |
| IC-04 CI eval gate | Verified — `npm run ai:eval:ci` in `ci.yml` |
| L0-07 isolation tests | Verified — existing test files |
| `npx tsc --noEmit` | Fail (pre-existing; see cycle report) |
| Full test/build | Not run (low-load) |

## Repository Green Gate — cycle 2 (2026-06-04)

**Report:** `docs/operations/parallel-execution-cycle-2026-06-04-cycle-2.md`

| Command | Result |
| ------- | ------ |
| `npx tsc --noEmit` | **Pass** |
| `npm run lint -- --quiet` | **Pass** |
| `npm test -- --forceExit` | **Pass** (95 suites, 805 tests) |
| `npm run build` | **Pass** |

**Repository health:** GREEN — safe to start Cycle 3 feature work per dependency graph.

## Intelligence Core G1 — cycle 3 (2026-06-04)

**Report:** `docs/operations/parallel-execution-cycle-2026-06-04-cycle-3.md`  
**Runbook:** `docs/operations/ai-intelligence-activation.md`

| Item | Result |
| ---- | ------ |
| IC-02 / IC-06 / IC-04 / L0-07 | Code complete per L6 update |
| IC-01 RAG orchestrator hook | Partial — `FF_AI_RAG` + `ragContext` in taskInput |
| L0-01 IaC apply | Not run (AWS ops) |
| Repo green | **Pass** — tsc, lint, 806 tests, build (2026-06-04 cycle 3) |

## Intelligence Core IC-09 + hygiene — cycle 4 (2026-06-04)

**Report:** `docs/operations/parallel-execution-cycle-2026-06-04-cycle-4.md`  
**L0-01 review:** `docs/operations/terraform-readiness-review-l0-01.md` (no apply)

| Item | Result |
| ---- | ------ |
| IC-09 circuit breaker + fallback + observability | Code complete |
| AI reliability tests | `ai-reliability.test.ts` + `provider-ic09.test.ts` — 26 passed (targeted) |
| Hygiene | 46 `* (1).*` files removed from `src/` |
| A1-09 | **Deferred** to **Cycle 6** — see five gates below |
| `npx tsc --noEmit` | **Pass** (cycle 4) |
| Full lint / 806 tests / build | Not re-run in cycle 4 (required in Cycle 5 gate 5) |

## Cycle 5 — five gates before A1-09 (approved, not started)

**Plan:** `docs/operations/parallel-execution-cycle-5-plan.md`

| Gate | Status (2026-06-04) |
| ---- | ------------------- |
| 1 IC-09 complete | ✅ |
| 2 IC-01 functional | ⏳ |
| 3 pgvector staging | ⏳ (no migration in repo yet) |
| 4 Real-provider smoke | ⏳ |
| 5 Full validation (tsc + lint + test + build) | ⏳ |

**Program status:** Pilot-Ready + AI Foundation Emerging + Execution Governance Mature  
**Target after Cycle 5:** AI Foundation Operational → then Cycle 6 A1-09

**Program execution state (Director):** `docs/operations/program-execution-state.md` — closed wins, IC-01 DoD chain, smoke metrics, `Gate → Validate → Promote → Consume`.

**Primary open gate:** Intelligence Core L5 (not AuditOS).

## Cycle 5 — Intelligence Core L5 (2026-06-05)

**Report:** `docs/operations/parallel-execution-cycle-2026-06-05-cycle-5.md`

| Gate | Status |
| ---- | ------ |
| 1 IC-09 | ✅ |
| 2 IC-01 governed RAG | ✅ repo |
| 3 pgvector migration | ✅ repo; staging `migrate deploy` + `npm run db:verify-pgvector` |
| 4 Smoke | ✅ `npm run ic:smoke:cycle5`; live staging pending |
| 5 Full validation | ✅ tsc, lint, 821 tests, build |

**Program:** AI Foundation Operational (repo). Cycle 6 / A1-09 repo slice done — see `parallel-execution-cycle-2026-06-06-a1-09.md`. Live staging smoke still OpenCode.

**Gap register:** `docs/operations/execution-director-gap-register.md`
