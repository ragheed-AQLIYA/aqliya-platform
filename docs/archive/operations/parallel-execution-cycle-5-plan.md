# Parallel Execution — Cycle 5 Plan (Approved)

**Approved by:** Program Director (human) — 2026-06-04 (full ratification)  
**Status:** **Executed** — see `parallel-execution-cycle-2026-06-05-cycle-5.md`  
**A1-09:** **BLOCKED** until all five gates pass; **Cycle 6** only  
**Canonical state:** `docs/operations/program-execution-state.md`

---

## Program arc (Cycles 2 → 5)

| Phase | State |
| ----- | ----- |
| Before Cycle 2 | Architecture > Execution |
| After Cycle 4 | Execution ≈ Architecture |
| After Cycle 5 (target) | **AI Foundation Operational** |
| Cycle 6 | A1-09 AuditOS AI integration |

---

## Discipline (non-negotiable)

```text
Gate → Validate → Promote → Consume
```

Do not promote product AI (Cycle 6) before Core gates pass. **Greatest risk:** feature velocity after first success, not code defects.

---

## Primary gate (program)

```text
Intelligence Core L5
```

AuditOS / DecisionOS / LocalContentOS / Office AI all consume Core — build once, consume many.

---

## Recorded program status (2026-06-04)

```text
AQLIYA
──────────────
Platform:          L4+
Intelligence Core: L4.5 (approaching L5)
AuditOS:           L5 Pilot Ready
LocalContentOS:    L5 Conditional
DecisionOS:        L5 Conditional

Overall Program:
Pilot-Ready +
AI Foundation Emerging +
Execution Governance Mature
```

**Target after Cycle 5 gates:**

```text
AI Foundation Operational
```

(not yet: **AI-Enabled AuditOS** — that is Cycle 6 / A1-09)

---

## Five gates (all required before A1-09)

| # | Gate | Cycle 4 | Cycle 5 owner |
| - | ---- | ------- | ------------- |
| 1 | IC-09 = Complete | ✅ | — |
| 2 | IC-01 = Functional (not skeleton) | ⏳ | Agent-IC |
| 3 | pgvector = Running (staging) | ⏳ | Agent-Platform |
| 4 | Real Provider Smoke = Pass (staging) | ⏳ | Agent-QA |
| 5 | **Full Repository Validation = Pass** | ⏳ | Agent-QA (phase 2) |

Gate 5 commands (single cycle, honest evidence):

```bash
npx tsc --noEmit
npm run lint -- --quiet
npm test -- --forceExit
npm run build
```

---

## Agent assignments

### Agent-IC — IC-01 completion

**Goal:** `Skeleton → Functional RAG` (governed, not vector lookup only)

**Definition of Done (Director):**

```text
retrieval
  → ranking
  → evidence attribution
  → governance metadata
  → auditability
```

**Insufficient DoD:** `retrieveContext returns results` alone.

| Stage | Cycle 5 target |
| ----- | -------------- |
| Retrieval | Tenant-scoped `searchChunks` / `retrieveContext` against **real** pgvector |
| Ranking | Cosine similarity order + `minSimilarity` threshold documented |
| Evidence attribution | Chunk IDs + scores surfaced in `RAGContext` / orchestrator `ragContext` |
| Governance metadata | `metadata`: source document, `productKey`, sensitivity / retention hints |
| Auditability | `rag_search` platform audit log; mutation paths logged where writes occur |

**Paths:** `src/lib/rag/**`, `src/lib/ai/orchestrator.ts`, `src/__tests__/unit/rag-ic01.test.ts`

**Forbidden:** AuditOS product routes, A1-09 wiring

---

### Agent-Platform — pgvector staging only

**Goal:** enable → migrate → verify (staging DB only)

| Step | Action |
| ---- | ------ |
| 1 | `CREATE EXTENSION IF NOT EXISTS vector` on staging Postgres |
| 2 | Add Prisma migration for `DocumentChunk.embedding` + index (e.g. HNSW/IVFFlat per ops choice) |
| 3 | Document in this file + `ai-intelligence-activation.md` — **no production rollout** |

**Note:** No `pgvector` migration exists in `prisma/migrations/` as of Cycle 4 close.

**Explicitly forbidden this cycle:**

- production rollout
- multi-environment deployment
- `terraform apply`

---

### Agent-QA — phase 1: real provider smoke (staging)

**Character:** First **semi production-like** cycle — measure behaviour, not only HTTP 200.

**Env (staging only):**

```bash
FF_AI_REAL_PROVIDERS=true
FF_AI_RAG=true
# plus OPENAI_API_KEY or ANTHROPIC_API_KEY per runbook
```

**Measure (record in smoke log):**

| Metric | How |
| ------ | --- |
| Latency | Health `latencyMs`; note P50-ish over repeated checks if feasible |
| Fallback rate | Inject failure → count fallbacks to next provider / deterministic |
| Circuit state transitions | `observability.circuits` closed → open → half-open after recovery |
| Provider selection | POST routing: `selected`, `reason`, `alternatives` |
| Budget alerts | `FF_AI_BUDGET_ALERTS` + quota path — alert fired or logged |
| Observability payload | GET: flags, `fallbackChain`, circuits complete |

**Output:** Append results to `docs/operations/ai-intelligence-activation.md` § Staging smoke log (dated, no secrets).

**Forbidden:** Large new integration test suite in Cycle 5 unless scoped to smoke scripts

---

### Agent-QA — phase 2: full repository validation

Run all four commands in **one** validation pass; record commit hash + counts in cycle report.

---

### Agent-AuditOS

```text
BLOCKED
```

No A1-09, no AuditOS LLM surfaces until Cycle 5 report marks all five gates **passed**.

---

## Cycle 6 preview (after gates)

| Agent | Task |
| ----- | ---- |
| Agent-AuditOS | **A1-09** — governed, assistive-only AuditOS AI |
| Agent-IC | Support adapters only if A1-09 needs Core hooks |
| Agent-QA | Regression + product smoke on `/audit/*` |

---

## Strategic note (Director)

Nearest logical milestone is **Intelligence Core → true L5**, then unified product consumption — not AuditOS AI first.

**Program state change:** only after all five gates → `AI Foundation Operational` → then Cycle 6 A1-09.

---

## Related

- Program state: `program-execution-state.md`
- Cycle 4 report: `parallel-execution-cycle-2026-06-04-cycle-4.md`
- Activation runbook: `ai-intelligence-activation.md`
- Terraform prep: `terraform-readiness-review-l0-01.md`
- Director skill: `.skills/aqliya/aqliya-parallel-director.md` § Cycle 5
