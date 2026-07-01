# AI Layer Ownership

**Finding 2 from `REVIEW_AFTER_PHASE2.md`** — AI Canonical Layer

## Audit Claim

> "Is src/lib/core/ai actually canonical, or does src/lib/ai still own implementation?"

## Verdict: **PARTIALLY CONFIRMED** — The canonical layer is split. Neither directory is fully canonical.

---

## Ownership Inventory

### `src/lib/core/ai/` — Canonical For (18 real implementation files)

| File | Type | Lines | Notes |
|------|------|-------|-------|
| `types.ts` | Canonical (types) | 131 | Re-exported through `ai/types.ts` shim |
| `orchestrator.ts` | Canonical (logic) | 343 | Imports providers from `@/lib/ai/providers/` |
| `provider-router.ts` | Canonical (logic) | 84 | |
| `hybrid-router.ts` | Canonical (logic) | 65 | |
| `model-registry.ts` | Canonical (logic) | 156 | |
| `prompt-registry.ts` | Canonical (logic) | 124 | |
| `observability.ts` | Canonical (logic) | 226 | |
| `spend-tracker.ts` | Canonical (logic) | 127 | |
| `governance-metrics.ts` | Canonical (logic) | 87 | |
| `cost-mapping.ts` | Canonical (logic) | 51 | |
| `budget-manager.ts` | Canonical (logic) | 132 | |
| `provider-router-constants.ts` | Canonical (logic) | 9 | |
| `api-errors.ts` | Canonical (logic) | 17 | |
| `engine.ts` | Canonical (logic) | 92 | Unique to core |
| `intelligence-runtime.ts` | Canonical (logic) | 76 | Unique to core |
| `governed-ai-executor.ts` | Canonical (logic) | 102 | Unique to core |
| `governed-ai-metadata.ts` | Canonical (logic) | 56 | |
| `orchestrator-rag-inject.ts` | Canonical (logic) | 56 | |

### `src/lib/core/ai/` — Wrapper Files (4 files)

| File | Type | Lines | Notes |
|------|------|-------|-------|
| `generate.ts` | Thin facade | 73 | Wraps `@/lib/ai/orchestrator` |
| `provider-factory.ts` | Thin factory | 20 | Wraps `@/lib/ai/providers/` |
| `cost-governance.ts` | Thin wrapper | 28 | Wraps `@/lib/ai/budget-manager` |
| `eval-gate.ts` | Thin wrapper | 18 | Wraps `@/lib/ai/eval-gate` |

### `src/lib/core/ai/providers/` — REMOVED (Dead Code)

**11 files (~757 lines) — 100% dead. Nothing imported from this directory.**

These were stale byte-for-byte duplicates of `src/lib/ai/providers/`. Removed during this remediation sprint.

| File | Lines | Twin Location |
|------|-------|---------------|
| `index.ts` | 5 | `src/lib/ai/providers/index.ts` |
| `provider-utils.ts` | 97 | `src/lib/ai/providers/provider-utils.ts` |
| `provider-circuit-breaker.ts` | 90 | `src/lib/ai/providers/provider-circuit-breaker.ts` |
| `openai-provider.ts` | 24 | `src/lib/ai/providers/openai-provider.ts` |
| `openai-embedding-provider.ts` | 50 | `src/lib/ai/providers/openai-embedding-provider.ts` |
| `llm-http-client.ts` | 132 | `src/lib/ai/providers/llm-http-client.ts` |
| `local-provider.ts` | 88 | `src/lib/ai/providers/local-provider.ts` |
| `deterministic-provider.ts` | 51 | `src/lib/ai/providers/deterministic-provider.ts` |
| `cloud-provider.ts` | 65 | `src/lib/ai/providers/cloud-provider.ts` |
| `anthropic-provider.ts` | 52 | `src/lib/ai/providers/anthropic-provider.ts` |
| `ai-provider-factory.ts` | 103 | `src/lib/ai/providers/ai-provider-factory.ts` |

**Fix applied:** Updated `src/lib/ai/providers/index.ts` and `src/lib/ai/index.ts` to re-export from live `./providers/` directory. Updated `src/lib/core/ai/index.ts` and `src/lib/core/ai/provider-router.ts` to import from live `@/lib/ai/providers/` path.

### `src/lib/ai/` — Real Implementation Files (32 files, NO canonical counterpart in core)

These files have no equivalent in `src/lib/core/ai/`. The migration to core was never completed for these domains:

| Domain | Files | Lines | Consumer |
|--------|-------|-------|----------|
| `providers/` (10) | `deterministic-provider.ts`, `openai-provider.ts`, `anthropic-provider.ts`, `cloud-provider.ts`, `local-provider.ts`, `ai-provider-factory.ts`, `llm-http-client.ts`, `provider-circuit-breaker.ts`, `provider-utils.ts`, `openai-embedding-provider.ts` | ~757 | Orchestrator, Factory, RAG |
| `eval/` (5) | `eval-gate.ts`, `eval-types.ts`, `eval-runner.ts`, `suites/` (4 files) | ~490 | Eval framework |
| `embedding/` (1) | `embedding-provider.ts` | 119 | Retrieval pipeline |
| `retrieval/` (2) | `similarity-search.ts`, `context-builder.ts` | 267 | AI review gate |
| `ingestion/` (1) | `ingestion-pipeline.ts` | 305 | Document ingestion |
| `review/` (1) | `ai-review-gate.ts` | 150 | AI review |
| `handlers/` (9) | 9 handler files | ~548 | Deterministic task handlers |
| `runtime/` (1) | `inference-service.ts` | 50 | Inference runtime |

### `src/lib/ai/` — Re-export Shim Files (25 files, 4-5 lines each)

All point to `@/lib/core/ai/`:

`index.ts`, `types.ts`, `generate.ts`, `observability.ts`, `provider-router.ts`, `hybrid-router.ts`, `model-registry.ts`, `governed-ai-metadata.ts`, `provider-factory.ts`, `prompt-registry.ts`, `api-errors.ts`, `governance-metrics.ts`, `spend-tracker.ts`, `provider-router-constants.ts`, `cost-mapping.ts`, `budget-manager.ts`, `orchestrator.ts`, `intelligence-runtime.ts`, `orchestrator-rag-inject.ts`, `providers/index.ts`

---

## Summary

| Location | Implementation | Re-export/Shim | Dead Code | Total |
|----------|---------------|----------------|-----------|-------|
| `src/lib/ai/` (all) | **32** | **23** | **0** | 55 |
| `src/lib/core/ai/` (excl. tests) | **18** | **4** | **0** (11 removed) | 22 |

## Architecture Diagram (After Fix)

```
src/lib/core/ai/          src/lib/ai/
─────────────────         ─────────────────
types.ts (canonical)  ←── types.ts (shim)
orchestrator.ts       ←── orchestrator.ts (shim)  ──→ imports @/lib/ai/providers/
provider-router.ts    ←── provider-router.ts (shim)
... (18 canonical)    ←── ... (25 shims total)

                        src/lib/ai/providers/  (LIVE — 10 files)
                        src/lib/ai/eval/       (LIVE — unique to ai/)
                        src/lib/ai/retrieval/  (LIVE — unique to ai/)
                        src/lib/ai/embedding/  (LIVE — unique to ai/)
                        src/lib/ai/ingestion/  (LIVE — unique to ai/)
                        src/lib/ai/review/     (LIVE — unique to ai/)
                        src/lib/ai/handlers/   (LIVE — unique to ai/)
                        src/lib/ai/runtime/    (LIVE — unique to ai/)
```

## Conclusion

The audit was partially correct: the canonical layer IS split. `src/lib/core/ai/` owns orchestration, routing, and AI governance. `src/lib/ai/` still owns provider implementations, RAG pipeline, eval framework, and handlers. The dead `src/lib/core/ai/providers/` directory (11 files, ~757 lines) has been removed.

Complete migration of the remaining 32 files from `src/lib/ai/` subdirectories to `src/lib/core/ai/` is future work and was not in scope for this remediation sprint.
