# Phase 3: AI Abstraction Layer

**Status:** Phase 3B complete — deterministic wiring finished. Phase 3C stabilized.

---

## Architecture

```
audit-actions.ts → services.ts → aiOrchestrator.generate()
                                    │
                                    ├── governance context (retrieval-router.ts)
                                    ├── prompt assembly (prompt-registry.ts)
                                    └── provider selection
                                        └── DeterministicAIProvider (default)
                                            ├── analyticalReviewHandler   → trial_balance_upload
                                            ├── evidenceSuggestionsHandler → evidence_review
                                            ├── findingDraftsHandler       → audit_findings
                                            ├── recommendationDraftsHandler→ approval_review
                                            └── draftNotesHandler          → notes_generation
```

---

## Provider Status

| Provider | Status | Notes |
|---|---|---|
| **DeterministicAIProvider** | **Active (default)** | 5 handlers registered. Rule-based generation preserved exactly. Always available. |
| **CloudAIProvider** | Stub — throws on call | Configured via `AI_CLOUD_API_KEY` + `AI_CLOUD_MODEL` env vars. `execute()` throws "not yet wired." Phase 4 will wire external API call. |
| **LocalAIProvider** | Stub — throws on call | `execute()` throws "not implemented." Phase 4 will integrate Ollama/vLLM. |

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
| `prompt-registry.ts` | Maps 5 `GovernanceTaskType` values to `prompt-framework.ts` builders |
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

Audit events for AI calls are logged by `src/actions/audit-actions.ts` using the existing `db.recordAuditEvent()` with `aiRelated: true`. Each AI output generation records an `ai.output_generated` event with metadata containing `suggestionType`, `sourceEntityType`, and `sourceEntityId`.

The orchestrator supports an optional `onGenerate` callback that can be wired for centralized logging at the orchestrator level. This is not yet activated — the existing per-action logging is sufficient.

All logging uses the existing `AuditEvent` Prisma model (no schema changes).

---

## No Schema Changes

`prisma/schema.prisma` was NOT changed. No migrations.

- `AuditAiOutput` model — used for AI output persistence (suggestionType, confidence, modelVersion, status, metadata)
- `AuditEvent` model — used for audit logging (aiRelated, metadata JSON)

---

## Constraints

- All AI outputs remain human-reviewed (accept/reject workflow)
- Evidence-aware (governance context from `retrieval-router.ts`)
- Permissioned (tenant guard + role checks in actions)
- Auditable (`AuditEvent` with `aiRelated: true`)
- No Cloud API calls (Phase 4)
- No Local AI runtime (Phase 4)
- No claims that Private/On-Prem/Air-Gapped or Model Governance are implemented

---

## Phase 4 Next Steps

1. Wire `CloudAIProvider.execute()` to external API (OpenAI/Claude)
2. Implement `LocalAIProvider` with Ollama/vLLM
3. Activate orchestrator `onGenerate` callback for centralized AI audit logging
4. Add provider status endpoint (`/api/health` AI section)
5. Remove or deprecate `src/lib/audit/ai-service.ts` (0 callers)
