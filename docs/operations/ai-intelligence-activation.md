# AI Intelligence Core — Staging Activation Runbook

**Scope:** L0.5 Intelligence Core (IC-02, IC-04, IC-06, IC-09, IC-01 governed RAG)  
**Prerequisite:** Repository Green Gate (Cycle 2) — `tsc`, `lint`, `test`, `build` all pass  
**Commercial rule:** Do not claim production LLM or RAG until flags are enabled in that environment and validated.

---

## Gate G1 checklist

| Requirement | Env / artifact | Verify |
| ----------- | -------------- | ------ |
| IC-04 CI eval gate | `npm run ai:eval:ci` in CI | CI step green |
| IC-06 budget quotas | `FF_AI_BUDGET_QUOTAS=true` | Orchestrator blocks over-cap org (see `orchestrator-ic02.test.ts`) |
| IC-06 budget alerts | `FF_AI_BUDGET_ALERTS=true` | Threshold notifications after generation |
| IC-02 real providers | `FF_AI_REAL_PROVIDERS=true` + API keys | `/api/ai/providers` shows configured providers |
| IC-09 provider hardening | (always on in code) | GET `/api/ai/providers` returns `fallbackChain` + `observability.circuits`; circuit opens after repeated failures |
| IC-01 RAG (optional) | `FF_AI_RAG=true` + pgvector + `OPENAI_API_KEY` | `rag-ic01.test.ts` patterns; staging DB has `DocumentChunk` |

---

## Recommended staging env (copy from `.env.example`)

```bash
# Intelligence Core — staging pilot only
FF_AI_REAL_PROVIDERS=true
FF_AI_BUDGET_QUOTAS=true
FF_AI_BUDGET_ALERTS=true
FF_AI_COST_TRACKING=true
# FF_AI_RAG=true          # Enable only when pgvector extension + migrations applied

OPENAI_API_KEY=...
# or ANTHROPIC_API_KEY=...
AI_PROVIDER=openai
```

**Default (safe):** all `FF_AI_*` unset or `false` → deterministic fallback only.

---

## Activation order

1. Deploy/build with repository green.
2. Enable `FF_AI_BUDGET_QUOTAS` + `FF_AI_BUDGET_ALERTS` first (no external LLM spend).
3. Set provider API keys; enable `FF_AI_REAL_PROVIDERS` for a single pilot org if using partial rollout later.
4. Run `npm run ai:eval:ci` after any prompt/registry change.
5. Enable `FF_AI_RAG` only after DB has pgvector and embedding pipeline smoke-tested.

---

## Rollback

Set `FF_AI_REAL_PROVIDERS=false` (or remove). Orchestrator and governed executor fall back to deterministic handlers immediately — no code deploy required if env-only.

---

## Cycle 5 — staging smoke checklist (gate 4)

**Environment:** staging only. **Never** enable on `/auditos/*`.

> **A1-09 repo:** `audit-ai-bridge.ts` shipped @ `4d24afd`. **Cycle 6 CLOSED:** blocked until live staging smoke (G6-2) + G6-7 Director PASS — see `docs/operations/parallel-execution-cycle-2026-06-06-cycle-6-close.md`.

| Step | Check |
| ---- | ----- |
| 1 | pgvector extension + migration applied ✅ repo (staging ops pending — see `docs/operations/pgvector-staging-validation-runbook.md`) |
| 2 | `FF_AI_REAL_PROVIDERS=true` + provider API key set (staging only) |
| 3 | `FF_AI_RAG=true` + `OPENAI_API_KEY` for embeddings (staging only — requires Step 1 first) |
| 4 | GET `/api/ai/providers` — health, `fallbackChain`, `observability.circuits` (requires live provider) |
| 5 | Trigger routing failure — confirm fallback to deterministic or next provider (requires Step 4 pass) |
| 6 | Budget: `FF_AI_BUDGET_ALERTS=true` — verify alert path after test generation (requires live generation) |

Record results here (date, pass/fail per row, measured values OK, no secrets):

| Date | Latency | Fallback rate | Circuit transitions | Provider selection | Budget alerts | Observability | Overall |
| ---- | ------- | ------------- | ------------------- | ------------------ | ------------- | ------------- | ------- |
| 2026-06-05 | offline skip | circuit proxy pass | closed→open→closed pass | flag gating pass | env gating pass | fallbackChain+circuits pass | **Offline PASS** (`npm run ic:smoke:cycle5`) |
| 2026-06-06 | offline skip | proxy pass | closed→open→closed pass | flag gating pass | env gating pass | fallbackChain+circuits pass | **Local pgvector PASS** (`localhost:5434`); **remote staging live BLOCKED** |
| — | live TBD | live TBD | live TBD | live TBD | live TBD | live TBD | Requires staging `DATABASE_URL` + `ic:smoke:cycle5:live` |

**Cycle 5 smoke is semi production-like** — measure behaviour per `program-execution-state.md`, not only call success.

---

## Related

- `docs/execution-backlog/v1.2-execution-backlog.md`
- `docs/source-of-truth/EXECUTION_DEPENDENCY_GRAPH.md` — Gate G1, G2, G3
- `docs/operations/parallel-execution-cycle-2026-06-04-cycle-3.md`
- `docs/operations/parallel-execution-cycle-2026-06-04-cycle-4.md`
- `docs/operations/parallel-execution-cycle-5-plan.md`
- `docs/operations/terraform-readiness-review-l0-01.md`
- `docs/operations/pgvector-staging-validation-runbook.md`
- `docs/operations/parallel-execution-cycle-2026-06-05-cycle-5.md`
- `docs/operations/parallel-execution-cycle-6-plan.md` (BLOCKED until live smoke)



