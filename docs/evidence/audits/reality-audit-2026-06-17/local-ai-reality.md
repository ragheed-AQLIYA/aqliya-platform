# Local AI Reality — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Execution evidence:** `npm run local-ai:smoke` → **PASS**

---

## Executive Answers

| Question | Answer | Status |
|----------|--------|--------|
| 1. What actually works? | Ollama local inference, hybrid routing, orchestrator fallback chain, deterministic handlers (default) | **VERIFIED** |
| 2. What is mocked? | Default embeddings (hash vectors), Office AI output, ai-review-gate suggestions, eval-runner "actual" inputs | **VERIFIED** |
| 3. What is stubbed? | vLLM (factory only), model-registry `local-not-implemented`, virus scan, CoreAccessControl | **VERIFIED** |
| 4. What is partially implemented? | Cloud LLM (env-gated), RAG (FF-gated), DB SSO, MFA JWT population, vLLM orchestrator integration | **VERIFIED** |
| 5. What is production ready? | Deterministic governance path, eval-gate framework, spend tracking APIs, hybrid router logic | **PARTIALLY VERIFIED** |
| 6. What is fake? | README claim "LocalAIProvider not implemented"; enterprise due diligence doc claiming local "always throws" | **FALSE claims in docs** |

---

## Provider Inventory

| Provider | File | Runtime | Activation |
|----------|------|---------|------------|
| Deterministic | `providers/deterministic-provider.ts` | **Always on** | Default |
| OpenAI | `providers/openai-provider.ts` | Real HTTP | `FF_AI_REAL_PROVIDERS` + API key |
| Anthropic | `providers/anthropic-provider.ts` | Real HTTP | `FF_AI_REAL_PROVIDERS` + API key |
| Cloud (generic) | `providers/cloud-provider.ts` | OpenAI-compatible | Env base URL + key |
| Local/Ollama | `providers/local-provider.ts` | Real HTTP | `FF_AI_REAL_PROVIDERS` + Ollama running |
| vLLM | `integration/factory-registry.ts` | Wrapper only | TenantIntegration factory |
| Mock embeddings | `embedding/embedding-provider.ts` | Hash vectors | Default when unset |

---

## Routing Architecture — VERIFIED

```
runInference() / generate()
  → AIOrchestrator (orchestrator.ts)
      → hybrid-router.ts (AI_MODE: cloud|local|hybrid)
      → provider-router.ts (FF_AI_REAL_PROVIDERS gate)
      → circuit-breaker per provider
      → fallback: openai → anthropic → local → cloud → deterministic
```

**Feature flags** (`src/lib/platform/feature-flags/registry.ts`):
- `ai.real-providers` — OFF by default
- `ai.rag` — OFF by default
- `ai.budget-quotas` — OFF by default
- `ai.cost-tracking` — ON by default (logging)

---

## Execution Test Results — VERIFIED (2026-06-17)

```
npm run local-ai:smoke

[PASS] hybridRouter.selectProviderForTask(account_mapping): local
[PASS] hybridRouter.selectProviderForTask(notes_generation): openai
[PASS] localProvider.execute(direct): model=ollama/qwen3:8b, latencyMs=31662
[PASS] runInference(preferProvider=local): providerId=local, latencyMs=11687
overall: PASS
artifact: docs/audits/evidence/local-ai-phase0-smoke.json
```

**Ollama availability:** VERIFIED on audit machine (qwen3:8b)  
**OpenAI/Anthropic live test:** NOT RUN (no API keys in audit env)  
**vLLM live test:** NOT RUN

---

## Governance Controls — VERIFIED (code)

| Control | File | Works? |
|---------|------|--------|
| Eval gate | `eval-gate.ts`, `/api/ai/eval-gate` | YES (framework) |
| Spend tracking | `spend-tracker.ts`, `/api/ai/spend` | YES |
| Budget quotas | `budget-manager.ts` | YES (gated) |
| Prompt framework | `governance/prompt-framework.ts` | YES |
| Human review metadata | `governed-ai-metadata.ts` | YES |
| RAG evidence injection | `orchestrator-rag-inject.ts` | YES (gated) |
| Autonomous approval | — | NO (by design) |

---

## Token Accounting & Cost — PARTIALLY VERIFIED

- `cost-mapping.ts` — model price tables exist
- `governed-ai-executor.ts` — logs token usage to audit when real provider used
- Spend API aggregates from `platformAuditLog` where `action=ai_generation`

Live cost tracking accuracy: **UNVERIFIED** without production traffic.

---

## Local AI Benchmark — INSUFFICIENT EVIDENCE

Protocol requested 20 realistic tasks. Only phase-0 smoke (4 checks) executed.

| Metric | Smoke Sample | 20-Task Benchmark |
|--------|-------------|-------------------|
| Accuracy | PASS (4/4) | NOT RUN |
| Latency | 11.7s–31.7s | NOT RUN |
| Cost | $0 (local) | NOT RUN |
| Failure rate | 0% (smoke) | NOT RUN |

See `local-ai-benchmark.md` for planned benchmark template.

---

## Doc vs Code Contradictions

| Document | Claim | Reality |
|----------|-------|---------|
| `src/lib/ai/README.md` | Local not implemented | Ollama provider works |
| `model-registry.ts` | `local-not-implemented` disabled | Orchestrator registers LocalAIProvider |
| PRODUCT_STATUS_MATRIX | Local AI L4 pilot | **Accurate** with conditions |

---

## Production Readiness for Local AI

**Pilot-ready with conditions:**
- Operator must run Ollama with configured model
- Must set `FF_AI_REAL_PROVIDERS=true` and `AI_MODE=hybrid|local`
- Not air-gapped packaged — manual endpoint configuration
- Default production deploy uses deterministic handlers only

**Blocks enterprise "sovereign AI" sale:**
- No bundled Ollama/vLLM deployment
- No GPU orchestration
- No model governance registry
- External cloud keys still in code path for hybrid mode

---

**Local AI score: 68/100** — Real Ollama integration proven; default-off posture and doc drift reduce confidence.
