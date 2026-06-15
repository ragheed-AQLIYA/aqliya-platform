# Local AI Readiness Audit — AQLIYA Intelligence Core + Ollama

**Date:** 2026-06-14  
**Scope:** Repository code reality (not marketing claims)  
**Target runtime:** Ollama @ `http://localhost:11434` → `qwen3:8b`  
**Authority:** Code + `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md` + `PRODUCT_STATUS_MATRIX.md`

---

## Executive Summary

**Local AI is partially implemented — not greenfield.**

The Intelligence Core already contains:

- A working **`LocalAIProvider`** (Ollama `/api/chat` + `/api/tags` health)
- **`hybrid-router`** task-level local vs cloud selection
- **`provider-router`** fallback chain including `"local"`
- **`runInference()`** sovereign entry point → **`AIOrchestrator`**
- **AuditOS bridge** (`runGovernedAuditAI`) and **TB intelligence** local classification step
- **Settings UI** at `/settings/ai` + **TenantIntegration** metadata storage
- **Ollama factory** in integration registry

**What blocks your Qwen3:8b pilot today is mostly configuration, doc drift, and a few wiring gaps — not missing architecture.**

| Area | Readiness |
|------|-----------|
| Provider implementation | ✅ Exists |
| Routing / hybrid policy | ✅ Exists (env + org metadata) |
| AuditOS → IC path | ✅ Exists (partial call-site migration) |
| TB → local Ollama step | ⚠️ Partial (prompt + flags + model name) |
| Tenant UI → runtime config | ⚠️ Partial (saved but not applied to provider instance) |
| Model registry | ❌ Stale (`local-not-implemented`) |
| Staging / repo validation proof | ❌ Not recorded |
| Production / air-gapped claims | ❌ Must not claim |

---

## 1. Does `LocalAIProvider` Already Exist?

**Yes — implemented.**

| Item | Location |
|------|----------|
| Class | `src/lib/ai/providers/local-provider.ts` — `LocalAIProvider` |
| Interface | `AIProvider` — `execute()`, `isAvailable()`, `getStatus()` |
| Ollama chat | `POST {baseUrl}/api/chat` |
| Health | `GET {baseUrl}/api/tags` (3s timeout) |
| Env defaults | `AI_LOCAL_BASE_URL` (default `http://localhost:11434`), `AI_LOCAL_MODEL` (default `llama3`) |
| Orchestrator registration | `src/lib/ai/orchestrator.ts` — `this.providers.set('local', new LocalAIProvider(...))` |
| Integration factory | `src/lib/integration/factory-registry.ts` — `ollamaFactory` → `LocalAIProvider()` |
| Unit test | `src/lib/ai/providers/__tests__/local-provider.test.ts` (config status only) |
| Embeddings (separate) | `src/lib/ai/embedding/embedding-provider.ts` — `LocalEmbeddingProvider` → `/api/embeddings` |

**Not implemented on LocalAIProvider:**

- `stream()` — no streaming; orchestrator `generateStream()` cannot use local
- SecretResolver / tenant-scoped config — always env-backed at singleton construction
- Integration test against live Ollama (no repo evidence)

**Stale docs claiming stub-only:**

- `AQLIYA_Enterprise_Due_Diligence_Audit_2026.md` (2026-05) — incorrect vs current code
- `src/lib/ai/README.md` line 50 — still says "Not implemented"
- `src/lib/ai/model-registry.ts` — entry `local-not-implemented` status `disabled`

---

## 2. Does Ollama Integration Already Exist?

**Yes — at provider + embedding + factory level.**

| Integration point | File | Function / symbol |
|-------------------|------|-------------------|
| Chat inference | `local-provider.ts` | `LocalAIProvider.execute()` |
| Embeddings | `embedding-provider.ts` | `LocalEmbeddingProvider.embedBatch()` |
| Provider type enum | `src/lib/integration/types.ts` | `"ollama"` in AI provider list |
| Factory registry | `factory-registry.ts` | `ollamaFactory`, `providerRegistry.register(..., "ollama", ...)` |
| vLLM (alternate local) | `factory-registry.ts` | `vllmFactory` wraps `CloudAIProvider` with OpenAI-compatible API |

**Env surface (`.env.example`):**

```env
AI_LOCAL_BASE_URL=http://localhost:11434
AI_LOCAL_MODEL=llama3
AI_LOCAL_EMBED_MODEL=nomic-embed-text
EMBEDDING_PROVIDER=mock
VLLM_BASE_URL=http://localhost:8000/v1
```

**For your setup:** set `AI_LOCAL_MODEL=qwen3:8b` (exact Ollama tag from `ollama list`).

---

## 3. Do `provider-router` / `hybrid-router` Support Local Models?

**Yes — both include local; they serve different layers.**

### `hybrid-router.ts` — task-level policy (ADR-001 Cycle 2)

| Function | Role |
|----------|------|
| `resolveExecutionModeFromEnv()` | Reads `AI_MODE` → `cloud` \| `local` \| `hybrid` |
| `getOrgAiExecutionMode()` | Org override from `TenantIntegration` (`aqliya-ai-runtime`) |
| `getHybridPolicy()` | Per-task `local` \| `cloud` map |
| `selectProviderForTask()` | Returns `"local"` or `"openai"` based on mode + policy |

**Default hybrid policy (local-first tasks):**

- `account_mapping`, `tb_classification`, `trial_balance_upload`, `analytical_review` → **local**
- `notes_generation`, `disclosure_enrichment`, `report_writing`, `audit_findings` → **cloud**

### `provider-router.ts` — IC-09 fallback / circuit breaker

| Function | Role |
|----------|------|
| `selectOptimalProvider()` | Fallback when preferred provider unavailable; gated by `ai.real-providers` |
| `PROVIDER_FALLBACK_CHAIN` | `openai → anthropic → local → cloud → deterministic` |

**Constants:** `src/lib/ai/provider-router-constants.ts`

### Orchestrator merge — `AIOrchestrator.resolveProvider()`

File: `src/lib/ai/orchestrator.ts`

1. If `ai.real-providers` + `organizationId` → `selectProviderForTask()` (hybrid)
2. Probe availability: `getProviderForExecution()` + `isAvailable()`
3. Real provider order: `[routedPrefer, "local", "openai", "anthropic", "cloud"]`
4. Fallback: `selectOptimalProvider()` then **deterministic**

**Gap:** `selectOptimalProvider()` does **not** live-probe Ollama — only circuit-breaker state. Availability probing happens in orchestrator loop (good).

**Gap:** `createAnyAIProviderFromResolver()` supports only `openai` \| `anthropic` \| `cloud` — **not `local`**. Tenant vault path skips local.

---

## 4. Does Intelligence Core Have Local Execution Paths?

**Yes — multiple entry points converge on `aiOrchestrator.generate()`.**

```
┌─────────────────────────────────────────────────────────────────┐
│                        ENTRY POINTS                              │
├─────────────────────────────────────────────────────────────────┤
│ runInference()          inference-service.ts                     │
│ runGovernedAuditAI()    audit-ai-bridge.ts                       │
│ generateClassification() generate.ts → orchestrator              │
│ runGovernedProductAI()  product-ai-bridge.ts → orchestrator      │
│ enrichDisclosureNote()  intelligence-engine.ts → runInference    │
│ classifyByLocalAi()     tb-intelligence/engine.ts → generateClassification │
└───────────────────────────────┬─────────────────────────────────┘
                                ▼
                    AIOrchestrator.generate()
                                │
              ┌─────────────────┼─────────────────┐
              ▼                 ▼                 ▼
     hybrid-router      provider-router    DeterministicAIProvider
     selectProviderForTask   (fallback)    (always available)
              │
              ▼
        LocalAIProvider.execute()  ← Ollama
```

| Path | Local-capable? | Notes |
|------|----------------|-------|
| TB classification pipeline | ✅ | Step 4 in `classifyTrialBalanceAccount()` via `classifyByLocalAi()` |
| AuditOS assistive AI | ✅ | Via bridge when flags on |
| Disclosure enrichment | ✅ | `runInference()` |
| Product AI bridge | ⚠️ | `resolvePreferProvider()` ignores `local` |
| Direct orchestrator (legacy) | ✅ | `generate.ts` supports `preferProvider: "local"` |

**TB pipeline order (must not change):** `src/lib/tb-intelligence/engine.ts`

1. Firm memory → 2. Rules → 3. Pattern → **4. Local AI** → 5. Cloud AI → 6. Human review

Local step skipped when `AI_MODE === "cloud"` (line 127).

---

## 5. Feature Flags for Local AI

**No dedicated `FF_LOCAL_AI` flag.** Local routing uses platform AI flags + env mode.

| Flag / env | Registry key | Effect on local |
|------------|--------------|-----------------|
| `FF_AI_REAL_PROVIDERS=true` | `ai.real-providers` | **Required** — without it orchestrator stays on deterministic |
| `AI_MODE=local` | — | hybrid-router always returns `"local"` |
| `AI_MODE=hybrid` | — | task policy decides |
| `AI_MODE=cloud` | — | **Disables** TB local step + hybrid local routes |
| `AI_RUNTIME_MODE` | — | Alias for inference result labeling (`inference-service.ts`) |
| `FF_AI_RAG=true` | `ai.rag` | Enables RAG inject; separate from local chat |
| `FF_AUDIT_INTELLIGENCE=true` | `audit.intelligence` | AuditOS intelligence layer features |
| `EMBEDDING_PROVIDER=local` | — | Ollama embeddings (not chat) |

**Settings UI:** `src/app/(dashboard)/settings/ai/page.tsx` + `src/actions/ai-settings-actions.ts`

Persists to `TenantIntegration.configMetadata`: `executionMode`, `localBaseUrl`, `localModel`, `hybridPolicy`.

**Gap:** UI-saved `localBaseUrl` / `localModel` are **not read** by `LocalAIProvider` at runtime (env-only on singleton).

---

## Gap Analysis Matrix

| Component | Status | Gap |
|-----------|--------|-----|
| `LocalAIProvider` | ✅ Implemented | No stream; no tenant config resolver |
| Ollama REST | ✅ Wired | Model default `llama3`, not `qwen3:8b` |
| `hybrid-router` | ✅ Complete | Requires DB `TenantIntegration` or env |
| `provider-router` | ✅ Complete | No Ollama health in cache snapshot |
| `AIOrchestrator` | ✅ Wired | Local not in `createAnyAIProviderFromResolver` |
| `runInference` | ✅ Complete | Thin wrapper — correct extension point |
| `audit-ai-bridge` | ✅ Complete | Requires `FF_AI_REAL_PROVIDERS` or `FF_AI_RAG` |
| TB `classifyByLocalAi` | ⚠️ Partial | Prompt generic; needs `preferProvider: "local"` path tested |
| `model-registry.ts` | ❌ Stale | Local model marked disabled |
| `src/lib/ai/README.md` | ❌ Stale | Says local not implemented |
| Settings → runtime | ⚠️ Partial | Metadata saved, not applied to provider |
| Live validation script | ❌ Missing | No `ollama-smoke.mjs` in repo |
| Staging proof | ❌ Missing | `LOCAL_AI_BRIDGE.md` says not validated |
| Knowledge Foundation | 🚫 Separate | Ollama blocked in KF governance — **do not conflate** with IC runtime |

---

## What Should NOT Be Changed

1. **ADR-001 classification pipeline order** — firm memory → rules → pattern → local → cloud → human review
2. **Trust principle** — AI assists; humans decide; no auto-approve / auto-publish / auto-commit mappings
3. **`runInference()` / `audit-ai-bridge` as AuditOS entry** — do not add parallel AuditOS → Ollama shortcuts
4. **`AIOrchestrator` singleton pattern** — extend, do not duplicate
5. **Deterministic fallback** — must remain when Ollama unavailable
6. **Feature flag gating** — do not enable cloud egress bypass without explicit `FF_AI_REAL_PROVIDERS`
7. **Commercial claims** — do not mark Local AI L6 or air-gapped production-ready without evidence
8. **Knowledge Foundation program** — separate charter; KF `blockedTechnologies: Ollama` is intentional until KF v1
9. **Provider taxonomy** — reuse `AIProviderId: 'local'`; do not add `ollama` as separate orchestrator provider ID
10. **RAG stack** — optional orthogonal path; do not block chat pilot on pgvector

---

## Contradictions to Resolve (Docs Only)

| Source | Says | Code says |
|--------|------|-----------|
| Due diligence audit 2026-05 | Local always throws | `LocalAIProvider.execute()` calls Ollama |
| `src/lib/ai/README.md` | IC-10 not implemented | Provider exists; registry/docs stale |
| `model-registry.ts` | `local-not-implemented` | Provider operational |
| `PRODUCT_STATUS_MATRIX` | L4 pilot with conditions | **Accurate** — align other docs to this |

---

## Readiness Verdict for Qwen3:8b Pilot

| Question | Answer |
|----------|--------|
| Can we route AuditOS → IC → Ollama today? | **Yes**, with env + flags |
| Is new architecture required? | **No** |
| Is code complete for pilot? | **~75%** — config wiring + validation + doc sync remain |
| Estimated time to first governed TB classification via Qwen3 | **4–8 hours** engineering + validation (see implementation plan) |

**Recommended immediate env (dev only):**

```env
FF_AI_REAL_PROVIDERS=true
AI_MODE=hybrid
AI_LOCAL_BASE_URL=http://localhost:11434
AI_LOCAL_MODEL=qwen3:8b
```

---

## Related Documents

- `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md`
- `docs/systems/auditos/LOCAL_AI_BRIDGE.md`
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` (Local AI runtime row)
- `docs/architecture/LOCAL_AI_IMPLEMENTATION_PLAN.md`
