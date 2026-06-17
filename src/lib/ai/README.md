# Intelligence Core — AI Abstraction Layer

**Status:** L5 operational in repository (2026-06-05). Staging live smoke = OpenCode ops gate.

## Truth labels

| Capability | Status |
| ---------- | ------ |
| Static governance context | `retrieval-router.ts` — doctrine, evidence requirements, approval flags |
| Governed RAG (IC-01) | `src/lib/rag/intelligence-core-rag.ts` when `FF_AI_RAG=true` + pgvector |
| Provider routing (IC-09) | `provider-router.ts` — fallback chain, circuit breaker, cost sort |
| Real LLM | `FF_AI_REAL_PROVIDERS=true` + API keys — env-gated, not default |
| AuditOS AI (A1-09) | `audit-ai-bridge.ts` → orchestrator (tenant + RAG + budget) |
| Office AI | `deterministic-generators.ts` — separate from orchestrator unless wired |
| Model registry (IC-05) | `model-registry.ts` — file-based catalog; wired into provider routing + `/api/ai/providers` |
| Local AI (Ollama) | L4 operational — `local-ai:smoke` PASS, qwen3:8b; default-off, needs `OLLAMA_BASE_URL` |
| **Not implemented** | local GPU packaging (IC-10), institutional memory store |

---

## Architecture

```
audit-actions.ts → services/ai.ts → runGovernedAuditAI()  [A1-09]
                                        │
                                        └── aiOrchestrator.generate()
                                              ├── governance context (retrieval-router.ts)
                                              ├── RAG (intelligence-core-rag.ts) if FF_AI_RAG
                                              ├── budget quotas/alerts (IC-06) if flagged
                                              ├── prompt assembly (prompt-registry.ts)
                                              └── provider selection (IC-09)
                                                    ├── OpenAI / Anthropic / Cloud (if configured)
                                                    └── DeterministicAIProvider (fallback)
                                                          └── 5 audit handlers (register-handlers.ts)
```

**Public RAG API:** `src/lib/rag/index.ts`

**Knowledge HTTP API (IC-01):** `/api/ai/knowledge/*` — see `docs/operations/ai-platform/KNOWLEDGE_API_STATUS.md`

---

## Provider Status

| Provider | Status | Notes |
|---|---|---|
| **DeterministicAIProvider** | **Default** | 5 AuditOS handlers; always available fallback |
| **OpenAIProvider** | Env-gated | `FF_AI_REAL_PROVIDERS` + `OPENAI_API_KEY` |
| **AnthropicProvider** | Env-gated | `FF_AI_REAL_PROVIDERS` + `ANTHROPIC_API_KEY` |
| **CloudAIProvider** | Partial | Legacy cloud config path |
| **LocalAIProvider** | Ollama operational (L4) | `OLLAMA_BASE_URL` env; qwen3:8b smoke PASS. IC-10 GPU runtime = future |

---

## Handler Map

| Task Type | Handler | Wired Function |
|---|---|---|
| `trial_balance_upload` | `analyticalReviewHandler` | `generateAnalyticalReview()` |
| `evidence_review` | `evidenceSuggestionsHandler` | `generateEvidenceSuggestions()` |
| `audit_findings` | `findingDraftsHandler` | `generateFindingDrafts()` |
| `approval_review` | `recommendationDraftsHandler` | `generateRecommendationDrafts()` |
| `notes_generation` | `draftNotesHandler` | `generateDraftNotes()` |

---

## Files

| File | Purpose |
|---|---|
| `types.ts` | `AIProvider`, `AIRequest`, `AIResponse`, `AIProviderStatus`, `AIProviderId`, `DeterministicTaskHandler` |
| `orchestrator.ts` | Provider selection, governance context injection, prompt assembly, fallback on error |
| `orchestrator-rag-inject.ts` | Shared governed RAG injection for `generate()` and `generateStream()` |
| `prompt-registry.ts` | Maps 5 `GovernanceTaskType` values to `prompt-framework.ts` builders |
| `model-registry.ts` | IC-05 — allowed model IDs, provider binding, active/deprecated/disabled status |
| `providers/deterministic-provider.ts` | Default provider — routes to registered task handlers |
| `providers/cloud-provider.ts` | Cloud LLM stub (Phase 4) |
| `providers/local-provider.ts` | Local AI stub (Phase 4) |
| `handlers/register-handlers.ts` | Registers all 5 handlers on `deterministicProvider` |
| `handlers/analytical-review-handler.ts` | TB scan + anomaly flag persistence |
| `handlers/evidence-suggestions-handler.ts` | Materiality-based evidence gap persistence |
| `handlers/finding-drafts-handler.ts` | Predefined finding templates + persistence |
| `handlers/recommendation-drafts-handler.ts` | Per-finding recommendation persistence |
| `handlers/draft-notes-handler.ts` | Notes engine + persistence |

---

## Audit Event Logging

| Layer | Mechanism |
| ----- | --------- |
| AuditOS engagement | `audit-actions.ts` → `recordAuditEvent` with `aiRelated: true` |
| Platform | `audit-ai-bridge.ts` → `writePlatformAuditLog` action `auditos_ai_generation` |
| RAG search | `rag-retriever.ts` → `rag_search` with ranking + chunk IDs; lexical fallback when pgvector empty |
| Orchestrator | Optional `onGenerate` callback (not required when bridge logging active) |

---

## No Schema Changes

`prisma/schema.prisma` was NOT changed. No migrations.

- `AuditAiOutput` model — used for AI output persistence (suggestionType, confidence, modelVersion, status, metadata)
- `AuditEvent` model — used for audit logging (aiRelated, metadata JSON)

---

## Constraints

- AI assists; humans decide; evidence governs
- All AuditOS outputs remain `suggested` until accept/reject
- Real providers and RAG require explicit env flags + staging validation
- Do not claim production AI until `ai-intelligence-activation.md` live smoke passes

---

## Ops references

- `docs/operations/ai-intelligence-activation.md`
- `docs/operations/pgvector-staging-runbook.md`
- `docs/operations/auditos-ai-governed-generation.md`
- `docs/operations/execution-director-gap-register.md`
