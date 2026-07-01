# AQLIYA AI Stack Audit

**Generated:** 2026-06-24
**Methodology:** Source code inspection of 104 AI-related files across `src/lib/ai/`, `src/lib/core/ai/`, `src/lib/ai/eval/`, and all AI-related tests.

---

## 1. AI Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    AI FRAMEWORK                            │
│                  src/lib/ai/ (69 files)                    │
├──────────────────────────────────────────────────────────┤
│ PRIMARY LOCATION: src/lib/ai/                              │
│ ⚠️ DUPLICATE: src/lib/core/ai/ (35 files, 33 overlaps)    │
├──────────────────────────────────────────────────────────┤
│ AI Providers: Anthropic, OpenAI, Local, Deterministic,    │
│               Cloud, OpenAI Embedding                      │
│ AI Governance: Eval gate, prompt registry, cost tracking  │
│ AI Observability: Metrics, spending, model registry       │
│ AI Retrieval: Embedding, similarity search, context builder│
│ AI Memory: Institutional memory service                   │
│ AI Ingestion: Document pipeline for RAG                    │
│ AI Handlers: 9 domain-specific AI handlers                │
│ AI Eval: Eval runner + 4 eval suites                      │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Component Inventory

### 2.1 Core AI Framework (`src/lib/ai/`)

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Orchestrator | `orchestrator.ts` | ✅ Complete | Manages AI execution flow |
| Hybrid Router | `hybrid-router.ts` | ✅ Complete | Routes between providers |
| Provider Router | `provider-router.ts` | ✅ Complete | Provider selection logic |
| Provider Factory | `provider-factory.ts` | ✅ Complete | Creates provider instances |
| Eval Gate | `eval-gate.ts` | ✅ Complete | Evaluation gate before execution |
| Prompt Registry | `prompt-registry.ts` | ✅ Complete | Central prompt management |
| Budget Manager | `budget-manager.ts` | ✅ Complete | Budget limits and controls |
| Spend Tracker | `spend-tracker.ts` | ✅ Complete | Per-request cost tracking |
| Cost Mapping | `cost-mapping.ts` | ✅ Complete | Model → cost mapping |
| Intelligence Runtime | `intelligence-runtime.ts` | ✅ Complete | Cross-product AI runtime |
| Model Registry | `model-registry.ts` | ✅ Complete | Available models |
| AI Observability | `observability.ts` | ✅ Complete | Metrics and monitoring |
| Governance Metrics | `governance-metrics.ts` | ✅ Complete | AI governance scores |
| Governed AI Metadata | `governed-ai-metadata.ts` | ✅ Complete | Metadata enrichment |
| RAG Inject | `orchestrator-rag-inject.ts` | ✅ Complete | RAG context injection |
| Index/Facade | `index.ts` | ✅ Complete | Public API |

### 2.2 AI Providers (`src/lib/ai/providers/`)

| Provider | File | Status | Purpose | Dependencies |
|----------|------|--------|---------|-------------|
| Anthropic | `anthropic-provider.ts` | ✅ Complete | Primary LLM | ANTHROPIC_API_KEY |
| OpenAI | `openai-provider.ts` | ✅ Complete | Secondary LLM | OPENAI_API_KEY |
| OpenAI Embedding | `openai-embedding-provider.ts` | ✅ Complete | Embeddings | OPENAI_API_KEY |
| Local | `local-provider.ts` | ✅ Complete | On-Prem inference | Local model |
| Deterministic | `deterministic-provider.ts` | ✅ Complete | Rule-based fallback | None |
| Cloud | `cloud-provider.ts` | ✅ Complete | Cloud abstraction | Cloud config |
| Factory | `ai-provider-factory.ts` | ✅ Complete | Provider creation | All providers |
| Circuit Breaker | `provider-circuit-breaker.ts` | ✅ Complete | Failure isolation | None |
| HTTP Client | `llm-http-client.ts` | ✅ Complete | HTTP transport | None |
| Utils | `provider-utils.ts` | ✅ Complete | Shared utilities | None |

### 2.3 AI Handlers (`src/lib/ai/handlers/`)

| Handler | File | Domain |
|---------|------|--------|
| Analytical Review | `analytical-review-handler.ts` | AuditOS |
| Commercial Claim Assist | `commercial-claim-assist-handler.ts` | SalesOS |
| Disclosure Enrichment | `disclosure-enrichment-handler.ts` | AuditOS |
| Draft Notes | `draft-notes-handler.ts` | AuditOS |
| Evidence Suggestions | `evidence-suggestions-handler.ts` | AuditOS |
| Finding Drafts | `finding-drafts-handler.ts` | AuditOS |
| Pilot Decision Assist | `pilot-decision-assist-handler.ts` | DecisionOS |
| Recommendation Drafts | `recommendation-drafts-handler.ts` | AuditOS |
| Register | `register-handlers.ts` | All |

### 2.4 AI Evaluation System (`src/lib/ai/eval/`)

| Component | File | Status |
|-----------|------|--------|
| Eval Runner | `eval-runner.ts` | ✅ Implemented (2,778 bytes) |
| Eval Types | `eval-types.ts` | ✅ Implemented (1,133 bytes) |
| Suite: Disclosure Notes | `suites/disclosure-notes.ts` | ✅ Implemented |
| Suite: Financial Analysis | `suites/financial-analysis.ts` | ✅ Implemented |
| Suite: Finding Summary | `suites/finding-summary.ts` | ✅ Implemented |
| Suite: Framework Self-Test | `suites/framework-self-test.ts` | ✅ Implemented |

### 2.5 AI Retrieval (`src/lib/ai/retrieval/`)

| Component | File | Status |
|-----------|------|--------|
| Context Builder | `context-builder.ts` | ✅ Implemented |
| Similarity Search | `similarity-search.ts` | ✅ Implemented |
| Embedding Provider | `embedding/embedding-provider.ts` | ✅ Implemented |

### 2.6 AI Infrastructure

| Component | File | Status |
|-----------|------|--------|
| Ingestion Pipeline | `ingestion/ingestion-pipeline.ts` | ✅ Implemented |
| AI Review Gate | `review/ai-review-gate.ts` | ✅ Implemented |
| Inference Service | `runtime/inference-service.ts` | ✅ Implemented |
| Institutional Memory | `memory/` (in lib/ai) | ✅ Implemented |

---

## 3. Duplicate AI Framework (`src/lib/core/ai/`)

The **exact same** AI framework exists in `src/lib/core/ai/` with **33 overlapping filenames**.

### Overlapping Files
```
api-errors.ts, budget-manager.ts, cost-mapping.ts, eval-gate.ts,
generate.ts, governance-metrics.ts, governed-ai-metadata.ts,
hybrid-router.ts, index.ts, intelligence-runtime.ts, model-registry.ts,
observability.ts, orchestrator-rag-inject.ts, orchestrator.ts,
prompt-registry.ts, provider-factory.ts, provider-router-constants.ts,
provider-router.ts, spend-tracker.ts, types.ts
```
Plus 13 provider files.

**Risk:** 
- Functions may diverge over time
- Inconsistent behavior: which version is actually used?
- Double maintenance burden
- Confusion for developers

---

## 4. Evaluation Coverage

### 4.1 Existing Eval Suites
| Suite | Tests | Expected | Actual | Gap |
|-------|-------|----------|--------|-----|
| Disclosure Notes | Format, completeness, governance | ✓ | Implementation found | — |
| Financial Analysis | Balance sheet, ratios, trends | ✓ | Implementation found | — |
| Finding Summary | Structure, evidence, clarity | ✓ | Implementation found | — |
| Framework Self-Test | Meta-evaluation | ✓ | Implementation found | — |

### 4.2 Missing Eval Suites
| Missing Suite | Should Test | Priority |
|---------------|------------|----------|
| Provider Router Eval | Correct provider selection | High |
| Hybrid Router Eval | Routing accuracy | High |
| Cost Tracking Eval | Budget enforcement | Medium |
| Tenant Isolation Eval | Cross-tenant data leakage in AI | Critical |
| Prompt Injection Eval | Security of prompt boundaries | Critical |
| Response Quality Eval | Generated content quality | High |
| RAG Relevance Eval | Retrieved context relevance | Medium |
| Hallucination Detection | Factual accuracy | High |

---

## 5. AI Observability

### Implemented
- `observability.ts` — Custom AI metrics via Sentry
- `governance-metrics.ts` — Governance scoring
- `model-registry.ts` — Model tracking
- `spend-tracker.ts` — Cost per request

### Missing
- Per-model latency tracking
- Cost trend dashboard
- Evaluation dashboard
- Alert on budget threshold
- Regression detection pipeline

---

## 6. Cost Tracking

### Implemented
| Component | Location | Function |
|-----------|----------|----------|
| Budget Manager | `src/lib/ai/budget-manager.ts` | Per-workspace budget limits |
| Spend Tracker | `src/lib/ai/spend-tracker.ts` | Per-request cost recording |
| Cost Mapping | `src/lib/ai/cost-mapping.ts` | Model → price mapping |

### Total: 3 cost-related modules, duplicated to 6 (in `src/lib/core/ai/`)

---

## 7. Critical Gaps

| Gap | Severity | Impact | Effort |
|-----|----------|--------|--------|
| **Duplicate AI engine** | Critical | Behavioral inconsistency | 3-5 days |
| **No regression benchmarks** | High | AI quality degradation undetected | 3-5 days |
| **No prompt injection tests** | Critical | Security vulnerability | 2-3 days |
| **No hallucination detection** | High | Untrusted outputs | 5-10 days |
| **No cost dashboards** | Medium | Uncontrolled spending | 2-3 days |
| **No eval pipeline** | High | Manual evaluation only | 3-5 days |
| **No AI tenant isolation tests** | Critical | Cross-tenant leakage | 2-3 days |
| **No load testing for AI** | Medium | Performance under load | 3-5 days |
| **Missing eval suites** | High | Incomplete quality assessment | 5-8 days |

---

*This audit is based on actual source code inspection of 104 AI-related files, all 11 test files, and provider implementations. No documentation assumptions were used.*
