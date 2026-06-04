# AQLIYA — Program Execution State

**Authority:** Program Director + `docs/DOCUMENTATION_AUTHORITY.md` (implementation reality)  
**Updated:** 2026-06-07  
**Model:** Governed execution program — not documentation-only delivery

---

## Why this file exists

The largest recent shift is not a single feature (IC-09 or Green Repo). AQLIYA is moving from a **documentation-led project** to a **governed execution program** with:

| Pillar | Artifact |
| ------ | -------- |
| Authority hierarchy | `docs/DOCUMENTATION_AUTHORITY.md`, `PRODUCT_STATUS_MATRIX.md` |
| Dependency gates | `EXECUTION_DEPENDENCY_GRAPH.md`, `PARALLEL_REMEDIATION_GATES.md` |
| Ownership boundaries | `parallel-execution-director.md`, Director skill |
| Execution cycles | `parallel-execution-cycle-*.md`, cycle template |
| Validation gates | Repository Green + Cycle 5 five-gate bundle |
| Program state transitions | This file |

**Primary engineering goal:** **Intelligence Core L5** — not AuditOS AI first. All products (AuditOS, DecisionOS, LocalContentOS, Office AI) will consume Core once; build it right once.

**Discipline rule (do not break after first success):**

```text
Gate → Validate → Promote → Consume
```

Do not skip gates to ship product features early.

---

## Closed (as of Cycle 4 close)

| Item | Cycle / evidence |
| ---- | ---------------- |
| Parallel Director Model | `.skills/aqliya/aqliya-parallel-director.md`, `parallel-execution-director.md` |
| Repository Green Gate | Cycle 2 — tsc, lint, test, build |
| AI Provider Hardening (IC-09) | Cycle 4 — circuit breaker, fallback, observability |
| AI Budget Alert Foundation (IC-06) | Cycle 3 — flags + budget manager |
| Route Resilience Wave (A1-01) | Cycle 1 — loading/error boundaries |
| Terraform Readiness Review (L0-01 prep) | Cycle 4 — no apply |
| Reliability Test Foundation | `ai-reliability.test.ts`, `provider-ic09.test.ts` |
| Backlog ↔ Gate ↔ Documentation sync | L6, backlog, gates, cycle reports |

---

## Real gate (still open)

```text
Intelligence Core L5
```

Not AuditOS. Not DecisionOS. Until Core is operational, product AI coupling is **forbidden** (A1-09 = Cycle 6).

---

## Program state — current (Cycle 5 close)

```text
AQLIYA

Platform ............... L4+
Intelligence Core ...... L5 (functional in repository; staging pgvector verify = ops step)
AuditOS ................ L5 Pilot Ready
DecisionOS ............. L5 Conditional
LocalContentOS ......... L5 Conditional

Program State:
Pilot-Ready +
AI Foundation Operational +
Execution Governance Mature
```

**Cycle 6 (A1-09):** Repo **shipped** @ `4d24afd`+. **Track A local:** **COMPLETE** @ `c6f7927` (`cycle-6-track-a-completion.md`, slices 22–24). **Operator packet:** `cycle-6-remote-operator-packet.md` @ `6b17fb6` (slice 25). **Program:** **BLOCKED** — `staging.aqliya.ai` DNS FAIL 2026-06-07; G6-7 remote still required.

| Track | Owner | Status |
| ----- | ----- | ------ |
| **Track A** — Enterprise / Cycle 6 closure | Cursor / Director | **LOCAL_COMPLETE** — `npm run cycle6:full-run`; remote G6-2 pending |
| **Track B** — Product completion | OpenCode | L5 + slices 14–21 (incl. Sales store→repositories @ slice 21, IC migrations @ slice 20) |

**Remaining ops for Cycle 6 CLOSED:** Remote staging `DATABASE_URL` → `db:verify-pgvector` → `ic:smoke:cycle5:live` → fill `LIVE_SMOKE_REPORT.md` Required Evidence → Director G6-7. See `parallel-execution-cycle-2026-06-06-cycle-6-close.md`.

**Local staging full proxy (2026-06-06):** `:5435/aqliya_staging` — migrate + seed + verify + `cycle6:smoke:audit-ai` PASS. **Remote** `staging.aqliya.ai` still required for Cycle 6 **CLOSED**.

**Roadmap Phase 3 (2026-06-07):** **Repo COMPLETE** — slices 1–9 on `main` through `3bf3734` (AuditOS portfolio/archival/rollforward/evidence versions; DecisionOS patterns; LocalContentOS LC-02–LC-07; SalesOS S7-01–S7-08 except S7-03 XL).  
Reports: `parallel-execution-cycle-2026-06-07-roadmap-phase3.md`, `ROADMAP_PHASE3_COMPLETION_REPORT.md`.

**Cycle 6 closure:** Still **BLOCKED** on remote staging — `cycle-6-staging-operator-checklist.md`, `cycle6-operator-preflight.mjs`, `cycle6-smoke-report-stamp.mjs`.

**Phase 4 entry:** `docs/operations/phase-4-entry-checklist.md` (after Cycle 6 remote CLOSED). **Demo static gate:** `npm run demo:smoke` ✅. **Jest full suite:** `141/144` pass @ `bd24a74` (~8s, `forceExit`). **OAuth (L0-05 partial):** invite-only @ `62b7cb3` — see `sso-enterprise-decision.md`.

Report: `docs/operations/parallel-execution-cycle-2026-06-05-cycle-5.md`

---

## Five gates (Cycle 5)

See `docs/operations/parallel-execution-cycle-5-plan.md`.

| # | Gate |
| - | ---- |
| 1 | IC-09 complete ✅ |
| 2 | IC-01 functional (governed RAG — see IC-01 DoD below) | ✅ repo |
| 3 | pgvector running (staging) | ✅ migration; ops: `db:verify-pgvector` |
| 4 | Real provider smoke pass (production-like metrics) | ✅ offline; ops: live staging |
| 5 | Full repository validation pass | ✅ |

---

## IC-01 Definition of Done (Cycle 5 — Director)

**Insufficient:**

```text
retrieveContext returns results
```

**Required chain:**

```text
retrieval
  → ranking
  → evidence attribution
  → governance metadata
  → auditability
```

RAG must not degrade to bare vector lookup. Audit trail must record search actions with tenant scope and chunk references where applicable (`rag_search` in `rag-retriever.ts` is the baseline pattern).

---

## Agent-Platform boundary (Cycle 5)

**Allowed:** `enable` → `migrate` → `verify` on **staging** Postgres only.

**Forbidden this cycle:**

- production rollout
- multi-environment deployment
- `terraform apply`

---

## Agent-QA — production-like smoke (Cycle 5)

First cycle treated as **semi production-like**. Smoke must **measure**, not only assert call success:

| Metric | Source / method |
| ------ | ---------------- |
| Latency | Provider health `latencyMs`; optional P50 over N calls |
| Fallback rate | Forced failure → count deterministic / chain fallbacks |
| Circuit state transitions | Observability `circuits` before/after failure injection |
| Provider selection | POST `/api/ai/providers` routing decision + reason |
| Budget alerts | Quota/alert path with `FF_AI_BUDGET_ALERTS` |
| Observability payload | GET snapshot: flags, fallbackChain, circuits |

Log in `ai-intelligence-activation.md` § Staging smoke log (no secrets).

---

## Agent-AuditOS

```text
BLOCKED for Cycle 5
```

Any A1-09 work before gates pass creates coupling to an incomplete intelligence layer.

---

## Greatest risk (Director)

Not code quality — **loss of execution discipline** after first green cycles. Feature velocity without `Gate → Validate → Promote → Consume` collapses the program back to Architecture > Execution.

---

## Related

- `docs/operations/parallel-execution-cycle-5-plan.md`
- `docs/operations/ai-intelligence-activation.md`
- `docs/source-of-truth/PARALLEL_REMEDIATION_GATES.md`
- `.skills/aqliya/aqliya-parallel-director.md`

