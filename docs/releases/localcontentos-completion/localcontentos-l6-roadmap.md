# LocalContentOS L6 Roadmap — Institutional Pilot-Ready

**Date:** 2026-06-01  
**Program:** LocalContentOS L6  
**Architect:** Worker 1 (L6 Architect & Master Plan)  
**Baseline:** L4 **DONE_WITH_CONCERNS** (Content Studio); compliance workspace **L5**  
**Target:** **L6 — Institutional pilot-ready with full governance**  
**Production claim:** **NO** (before, during, and at L6 gate unless explicitly rescoped)

---

## 1. L6 definition (AQLIYA context)

### 1.1 What L6 means for LocalContentOS

**L6 = Institutional pilot-ready** — the product can support **one external institution** in a **time-bounded, governed pilot** under AQLIYA’s trust principle:

> AI assists. Humans decide. Evidence governs.

An institution at L6 can:

1. Onboard operators and approvers with documented RBAC.
2. Run **both** compliance workflows (suppliers, spend, evidence, classification) **and** Content Studio (campaign content lifecycle) without engineer intervention.
3. Rely on **Prisma-backed persistence**, tenant isolation, audit trails, human review, and ADMIN approval before export.
4. Receive **operator documentation**, escalation paths, and honest limitation statements (no regulator certification, no autonomous AI).

### 1.2 What L6 explicitly does NOT mean

| Do not claim | Notes |
|--------------|-------|
| Production Ready (marketing) | L6 is pilot-ready, not general availability |
| Regulator-certified local content compliance | Exports carry disclaimers |
| AGENTS.md §6 “Production-hardened” | HA, SIEM, multi-region, formal SLA — **deferred L7+** |
| Full LLM / local AI runtime | Governed template assist only unless separately approved |
| On-Prem / Air-Gapped package | Strategic direction only |
| Monorepo-wide CI green | SalesOS corruption is out of LC L6 scope |

### 1.3 Level ladder (this program)

```
L4 Usable v0.1          ← Content Studio today (DONE_WITH_CONCERNS)
        ↓
L5 Pilot operational    ← Internal tenant, migration applied, smoke 6/6 PASS
        ↓
L6 Institutional pilot-ready ← External institution, full governance, signed docs
        ↓
L7+ Ops hardening       ← Out of scope unless requested (monitoring, scale, backup automation)
```

---

## 2. Current state snapshot (2026-06-01 — post-B4 integrator)

| Signal | Status |
|--------|--------|
| L6 program workers | **All 6 complete** |
| Content Studio workflow | Implemented (Idea→Output) |
| Unit tests | **25/25 PASS** |
| Smoke 1–6 | **ALL PASS** (Worker 2 closure; `crev_mpulmiwi_nzagcrh`) |
| Honest product level | **L5 with conditions — NOT L6** (B1 + PO sign-off remain) |
| LocalContentOS migration on localhost | **Applied** (`20260601120000`) |
| Migration history | **Drift** with SalesOS (**B1 OPEN**) |
| Dual persistence | Prisma-only guard **CLOSED** (**B3 CLOSED** — `repository-instance.ts`) |
| Git | **Committed** — 6 commits on `main` (`fcfe9d5`..`cb7df84`; HEAD `cb7df84`) — **B4 CLOSED** |
| Program blockers open | **B1** only (+ PO sign-off) |
| Governed AI | Deterministic template, `reviewRequired` |
| Validation class | **Light validated** |
| Production claim | **NO** |

Detail: `localcontentos-l6-program-closure.md`, `localcontentos-l6-completion-status.md`, `agent-14-smoke-results.md`, `localcontentos-l6-gap-matrix.md`.

---

## 3. Parallel worker plan (L4 → L6)

Execute workers **in parallel** where dependencies allow. Worker 10 integrates at end.

```
                    ┌─────────────────┐
                    │  Worker 1       │
                    │  Architect      │  ← THIS DOC
                    └────────┬────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     ▼                       ▼                       ▼
┌─────────┐           ┌─────────┐           ┌─────────┐
│ W2      │           │ W3      │           │ W4      │
│ Workflow│           │ Persist │           │ AI/Gov  │
└────┬────┘           └────┬────┘           └────┬────┘
     │                       │                       │
     └───────────────────────┼───────────────────────┘
                             ▼
              ┌──────────────────────────┐
              │ W5 Governance │ W6 Tests │
              │ W7 Docs       │ W9 UI    │
              └──────────────┬───────────┘
                             ▼
                    ┌─────────────────┐
                    │  Worker 8       │
                    │  Smoke / E2E    │
                    └────────┬────────┘
                             ▼
                    ┌─────────────────┐
                    │  Worker 10      │
                    │  Integrator     │
                    └─────────────────┘
```

### Worker 2 — Workflow & policy unification

**Scope:** Business rules for review→approve→export; compliance + Content Studio command center coherence.

| Task | Acceptance criteria |
|------|---------------------|
| Define export policy when `includesApprovedContent` | Written decision in docs; code/UI aligned |
| Optional: enforce review record before approve | `completeContentStudioReviewAction` required OR documented waiver |
| Command center cross-links | Compliance project + Content Studio campaign discoverable from `/local-content` |

**Depends on:** Worker 1  
**Blocks:** Worker 8 (smoke expectations)

---

### Worker 3 — Persistence & migration

**Scope:** Prisma-only pilot path; migration drift; seeds.

| Task | Acceptance criteria |
|------|---------------------|
| Resolve or document SalesOS drift | `migrate status` exit 0 on pilot DB OR baseline runbook signed |
| Prisma-only guard | Dev/prod path rejects file backend except explicit test env |
| Content Studio seed | Repeatable demo project/campaign in `prisma/seed.ts` or documented script |
| Verify `createdById` parity | Content Studio models match compliance lineage pattern |

**Depends on:** User approval for any `migrate deploy`  
**Blocks:** Worker 8, institutional pilot

**Gate:** NO `migrate deploy` without explicit user approval (low-load).

---

### Worker 4 — Governed AI boundaries

**Scope:** Document and verify AI assist chain for institutional pilot.

| Task | Acceptance criteria |
|------|---------------------|
| AI boundary doc | Inputs, outputs, reviewRequired, no autonomous approval |
| Audit event verification | Draft assist produces queryable audit entry |
| Provider routing note | What stays on Anthropic / tenant; no silent external send |

**Depends on:** Worker 1  
**Blocks:** Worker 7 (operator manual)

---

### Worker 5 — Governance hardening

**Scope:** RBAC matrix, audit parity, export disclaimers.

| Task | Acceptance criteria |
|------|---------------------|
| Institutional RBAC matrix | VIEWER / OPERATOR / ADMIN for all Content Studio actions |
| Server-side deny tests spec | VIEWER cannot approve/export (for Worker 6) |
| Export disclaimer | Arabic + English “not certified compliance” on output flow |

**Depends on:** Worker 2 policy decisions  
**Blocks:** Worker 6, Worker 7

---

### Worker 6 — Tests

**Scope:** Unit + optional integration; role-negative tests.

| Task | Acceptance criteria |
|------|---------------------|
| Review dimension edge cases | Tests for `completeContentStudioReviewAction` |
| Role-negative action tests | VIEWER/OPERATOR denied on approve/export |
| Optional Prisma integration | One test on test DB (`npm run test:integration:setup`) — **requires approval** |
| Target count | ≥18 Content Studio tests (from 14) |

**Depends on:** Worker 2, Worker 5  
**Blocks:** Worker 10

**Gate:** Targeted `npm test -- content-studio.test.ts` only unless user approves full suite.

---

### Worker 7 — Documentation & commercial truth

**Scope:** Operator manual, PRODUCT_STATUS_MATRIX, onboarding pack, marketing audit.

| Task | Acceptance criteria |
|------|---------------------|
| Content Studio operator section | Troubleshooting: empty queue, dual backend, migration |
| PRODUCT_STATUS_MATRIX | Dual-track levels; L6 qualifier text |
| Institutional onboarding pack update | Roles, 2-week pilot script, non-production attestation |
| Marketing page audit | `/products/local-content` claims match L6 bounds |

**Depends on:** Workers 2–5  
**Blocks:** L6 sign-off

---

### Worker 8 — Smoke & E2E evidence

**Scope:** Close step 5 gap; full 6-step PASS; optional compliance re-smoke.

| Task | Acceptance criteria |
|------|---------------------|
| Step 5 dimension form | `ContentStudioReview` row exists after smoke |
| Steps 1–6 PASS | Single ADMIN session documented in `agent-14-smoke-results.md` |
| Step 2 re-verify | Create project → campaign without hard refresh |
| Negative tenant test | Second org cannot see first org queue (curl or browser) |

**Depends on:** Workers 2, 3 (DB ready)  
**Blocks:** Worker 10

---

### Worker 9 — UI resilience

**Scope:** loading/error/not-found for Content Studio routes; form stability.

| Task | Acceptance criteria |
|------|---------------------|
| Resilience files | `loading.tsx` / `error.tsx` on campaigns, review, outputs |
| Command center counts | Reflect seeded Content Studio data |
| Nav prefetch | Review queue stable (Worker A patterns preserved) |

**Depends on:** Worker 3 seeds  
**Blocks:** Worker 8 (optional parallel)

---

### Worker 10 — Integrator & L6 sign-off

**Scope:** Synthesize workers; update scorecard; commit recommendation.

| Task | Acceptance criteria |
|------|---------------------|
| Final integrator report | L6 gate checklist from gap matrix |
| Scorecard | All dimensions ≥ L6 target or honest exception |
| Commit plan execution | Only if user explicitly requests commit |
| Validation class | Upgrade to **pilot-ready with conditions** or **institutional pilot-ready** with evidence |

**Depends on:** All workers  
**Blocks:** External institution pilot start

---

## 4. Acceptance criteria (L6 gate)

### 4.1 Mandatory gates

| Gate | Criterion | Evidence |
|------|-----------|----------|
| **G1 Workflow** | Steps 1–6 smoke **PASS** | `agent-14-smoke-results.md` |
| **G2 Governance** | Review dimensions exercised; ADMIN approve after review | DB: `ContentStudioReview` + `ContentStudioApproval` |
| **G3 Persistence** | Pilot DB on Prisma; migrate status documented | `localcontentos-migration-readiness.md` |
| **G4 Tests** | ≥18 unit tests PASS; role-negative tests | `agent-12-targeted-tests.md` |
| **G5 Docs** | Operator manual + onboarding pack + matrix synced | File paths in integrator report |
| **G6 Commercial** | Production claim **NO** on all public docs | Manual audit |
| **G7 AI** | Boundary doc signed; no autonomous approval | `agent-06` + Worker 4 doc |
| **G8 Sign-off** | Product owner sign-off on scorecard | Dated signature block |

### 4.2 Conditional waivers (require explicit PO approval)

| Waiver | Risk |
|--------|------|
| SalesOS drift unresolved but LC tables verified | Future migrate deploy failure |
| Review optional before approve | Weaker institutional governance story |
| File backend in dev | Singleton drift recurrence |

---

## 5. Risk register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|----|------|------------|--------|------------|-------|
| R1 | SalesOS drift breaks `migrate deploy` | High | High | Baseline `_prisma_migrations` before pilot DB | W3 + Platform |
| R2 | Dual backend singleton drift | Medium | High | Prisma-only guard; test env isolation | W3 |
| R3 | Glass browser stale auth | High | Medium | curl SSR + DB as authoritative; pilot login guide | W8 |
| R4 | Export without approved content confuses auditors | Medium | Medium | Policy doc + UI flag enforcement | W2 |
| R5 | Uncommitted code — irreproducible pilot | ~~High~~ **Closed** (B4) | ~~High~~ — mitigated | 6 commits on `main` (`fcfe9d5`..`cb7df84`) | W10 / user |
| R6 | Overclaiming “Production Ready” | Medium | High | L6 naming discipline; docs gate | W7 |
| R7 | SalesOS tsc corruption blocks CI | High | Low for LC | LC-scoped validation in reports | Platform |

---

## 6. Timeline suggestion (human estimates)

| Phase | Workers | Human effort | Agent effort (low-load) |
|-------|---------|--------------|-------------------------|
| **Phase A** — Plan | W1 | 0.5d review | Done (this doc) |
| **Phase B** — Foundation | W2, W3, W4, W5 parallel | 1–2d | ~2–4h agent |
| **Phase C** — Evidence | W6, W8, W9 parallel | 1d | ~2h agent |
| **Phase D** — Docs & integrate | W7, W10 | 0.5d | ~1h agent |
| **Phase E** — Institution pilot | Human operators | 2 weeks | N/A |

**Total to L6 gate:** ~3–4 human days engineering + 2-week pilot window.

---

## 7. Validation plan (low-load default)

| Command | When | Approval |
|---------|------|----------|
| `npx prisma migrate status` | W3, W10 | Light — allowed |
| `npm test -- content-studio.test.ts` | W6, W10 | Light — targeted |
| `npx tsc --noEmit` (LC paths) | W6, W10 | Light |
| `npm run build` | L6 gate optional | **Heavy — user approval** |
| `npm run lint` full | L6 gate optional | **Heavy — user approval** |
| `npx prisma migrate deploy` | W3 | **Heavy — user approval** |

**Validation classification target at L6:** **Pilot-ready with conditions** → **Institutional pilot-ready** (not production no-go, not production go).

---

## 8. Handoff to other workers

| Worker | Start after | First action |
|--------|-------------|--------------|
| W2 | Now | Read gap matrix §1 Workflow; draft export/review policy |
| W3 | User drift decision | Read `localcontentos-migration-readiness.md`; propose baseline |
| W4 | Now | Draft AI boundary doc from `ai.ts` + actions |
| W5 | W2 policy draft | RBAC matrix from `local-content-workspace-actions.ts` |
| W6 | W5 spec | Add role-negative tests |
| W7 | W4 boundary draft | Operator manual Content Studio section |
| W8 | W3 DB ready | Execute `localcontentos-smoke-steps-3-6-manual.md` step 5 dimensions |
| W9 | W3 seed | Add resilience files to Content Studio routes |
| W10 | All complete | L6 integrator report + scorecard sign-off |

---

## 9. References

- `localcontentos-l6-gap-matrix.md` — per-dimension gaps
- `localcontentos-v01-readiness-scorecard.md` — L6 target columns
- `final-integrator-report.md` — L4 baseline
- `localcontentos-migration-readiness.md` — migration gate
- `localcontentos-pilot-handoff.md` — L5 handoff
- `AGENTS.md` §6 — platform level rubric (L6 naming overridden here)

---

## Production claim

**NO**
