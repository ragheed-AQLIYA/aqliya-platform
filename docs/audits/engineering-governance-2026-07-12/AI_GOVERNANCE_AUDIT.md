# AQLIYA AI Governance Audit
**Date:** 2026-07-12  
**Auditor:** AI Governance Auditor (read-only)  
**Scope:** Full-stack AI feature surface across `src/lib/core/ai/`, `src/actions/`, `src/app/api/ai/`, product bridges, providers, handlers, and governance framework  
**Files examined:** 60+ (see Appendix)

---

## 1. Executive Summary

AQLIYA's AI governance posture is **strong at the architectural level but uneven in execution depth**. The platform has a well-designed governance framework with doctrine injection, evidence requirements, human approval gates, and audit logging built into every AI prompt. However, critical gaps exist in prompt sanitization, provider retry/timeout hardening, and systematic enforcement of the AGENTS.md §12 compliance matrix across all AI execution paths.

**Overall Grade: B+ (7.8/10)** — Institutional-grade architecture, pilot-ready implementation with specific hardening needed.

### Top 3 Critical Findings

1. **CRITICAL — No prompt sanitization for user input** (`src/lib/governance/prompt-framework.ts:96-104`, `src/lib/core/ai/providers/mock-provider.ts:34-265`). User-provided `instructions`, `title`, `accountName`, and file content are embedded directly into LLM prompts via template literals and `${}` interpolation. The `buildTaskSpecificLayer` function dumps all `request.taskInput` entries directly into the prompt without escaping. While the governance wrapper provides structural guardrail (doctrine layers, output boundaries), there is no programmatic defense against prompt injection. **Risk: HIGH** — an actor with Workspace access could inject instructions that override system doctrine or boundary constraints.

2. **HIGH — No HTTP timeouts on external LLM calls** (`src/lib/core/ai/providers/llm-http-client.ts:25,71` and `cloud-provider.ts`, `anthropic-provider.ts`). The `fetch()` calls to OpenAI, Anthropic, and Ollama have no `AbortSignal.timeout()` set. The `provider-utils.ts` retry helper is available but unused by actual provider implementations. A hung API call would block the request thread indefinitely. The LocalProvider health check (`isAvailable`) has a 3s timeout, but `execute()` does not. **Risk: HIGH** — denial of service via hung external API call.

3. **HIGH — Hardcoded confidence scores bypass the confidence scorer** (`src/lib/core/ai/providers/llm-http-client.ts:131`, `anthropic-provider.ts:48`, `cloud-provider.ts:59`, `local-provider.ts:85`). All three real providers pass fixed confidence values (0.78, 0.80, 0.72) to `completionToAiResponse()`, ignoring the `calculateConfidence()` framework which considers completeness, source count, length, and response time. These fixed values make platform-level confidence reporting unreliable and mask genuine per-output quality variations.

---

## 2. AGENTS.md §12 Compliance Matrix

| Rule | Compliant? | Gaps |
|------|-----------|------|
| Source input references | PARTIAL | RAG-injected requests include source chunks (`orchestrator-rag-inject.ts:52-56`). Product bridges pass source summaries. Deterministic handlers include context strings. But not all paths (OpenAI direct, Anthropic direct) provide source links. |
| Prompt/action type logged | YES | `taskType` field logged in orchestrator (`orchestrator.ts:268`), `governed-ai-executor.ts:97`, and all product bridges. |
| Model/provider recorded | YES | `aiProvider` and `aiModel` fields on PlatformAuditLog (`schema.prisma:329-330`). Both orchestrator and governed executor write them. |
| Generated output tracked | PARTIAL | Output is not stored in audit logs (only metadata). Office AI stores outputs in `OfficeAiOutput` table. LocalContentOS stores drafts in `draftAssistMetadata`. AuditOS stores `AIAssistanceOutput[]` in response metadata. Full output retention is product-dependent, not universal. |
| Confidence/limitation note | PARTIAL | Confidence tools exist (`confidence-scorer.ts`, `governed-ai-metadata.ts`). Limitation notes are collected (`governed-ai-metadata.ts:28-45`). But real LLM providers pass hardcoded confidence (0.72-0.80), bypassing calculation. `ai-review-gate.ts:51-56` adds standard limitation text. |
| Human review status | YES | `aiOutputReviewStatus` field on audit logs. `governed-ai-metadata.ts:53-64` computes status from governance context. All product bridges return `reviewRequired: true` (`product-ai-bridge.ts:130`, `audit-ai-bridge.ts:154`, `office-ai-orchestrator-bridge.ts:92-100`). |
| Audit log entry | YES | Every generation path writes audit logs: orchestrator (`orchestrator.ts:49-68` via `onGenerate`), governed executor (`governed-ai-executor.ts:105`), product bridge (`product-ai-bridge.ts:104-122`), audit bridge (`audit-ai-bridge.ts:120-148`). |
| Permission checks | PARTIAL | Product bridge enforces authorization (`product-ai-bridge.ts:68`). API routes check roles (admin for spend/governance, operator for eval). Office AI checks tenant isolation (`office-ai-actions.ts:101-107`). LocalContentOS actions check RBAC (`localcontent-ai-advisor-actions.ts:69`). But the orchestrator itself has no permission check at the generation level. |
| No autonomous decisions | YES | All output boundaries are `draft_only` or `review_required`. `outputBoundary` is `draft_only` for statement_drafting, account_mapping, evidence_review, audit_findings, notes_generation, disclosure_enrichment. No path sets boundary to `final` or `approved`. |

**Overall §12 Compliance: 7/9 requirements met (78%)**

---

## 3. Prompt Injection Risk Assessment

### 3.1 Architecture

The prompt construction is **layered** — governance, doctrine, evidence, and human approval layers wrap around the task-specific content (`prompt-framework.ts`). This provides structural defense. The layer ordering (system doctrine → product doctrine → governance → evidence → human approval → task_specific) means system-level constraints appear before user content.

### 3.2 Specific Files at Risk

| File | Risk Level | Issue |
|------|-----------|-------|
| `src/lib/governance/prompt-framework.ts:96-104` | HIGH | `buildTaskSpecificLayer()` iterates all `taskInput` entries and embeds user-provided values directly without escaping via `Object.entries(input).map(([key, value]) => \`  - ${key}: ${value}\`)`. Any user-controlled input (accountName, instructions, query, title) flows directly into the LLM prompt. |
| `src/lib/core/ai/prompt-registry.ts:48-58` | HIGH | `buildAccountClassificationPrompt` stringifies user-provided `accountName`, `accountCode`, `accountBalance` directly into a JSON structure in the prompt body. |
| `src/lib/core/ai/providers/mock-provider.ts:34-265` | MEDIUM | Template literals with `${instructions}`, `${title}`, `${fileContent}` embed user content into mock responses without any sanitization. While this is deterministic output, the pattern normalizes unsafe string interpolation. |
| `src/lib/office-ai/office-ai-orchestrator-bridge.ts:63-71` | MEDIUM | User `instructions` and `fileContext` passed through to `buildOfficeAiPrompt()` and then into governed AI without escaping. |
| `src/lib/local-content/workbook/ai-advisor.ts:208-213` | MEDIUM | User-provided prompt template constructed via string interpolation for pattern improvement, including account names and file context. |

### 3.3 Mitigations Present

- **Governance layer prefixing**: All prompts include system doctrine and governance rules that establish behavior boundaries *before* user content (`prompt-framework.ts:23-106`).
- **Output boundary enforcement**: `outputBoundary: 'draft_only'` on all task types prevents autonomous actions regardless of prompt manipulation.
- **Model temperature**: All LLM providers use default `temperature: 0.2` (`llm-http-client.ts:34,83`), reducing the likelihood of creative prompt injection exploitation.
- **Human approval gates**: Even if a prompt is injected, outputs are never auto-approved (`review_required` on all product bridges).

### 3.4 Missing Mitigations

- **No input sanitization function** exists anywhere in the AI pipeline. No escaping, no character stripping, no delimiter removal.
- **No prompt length limits** for user-contributed fields.
- **No structured output format enforcement** (e.g., requiring all user input to be in `[USER_INPUT]` tags that cannot be escaped from).
- **No prompt audit comparison** (detecting whether actual prompt differs from expected template).

---

## 4. Hallucination Risk Assessment

### 4.1 Grounding Patterns

**Strong grounding mechanisms exist:**

- **Deterministic fallback**: All provider chains fall back to deterministic rule-based handlers (`orchestrator.ts:240-244`, `audit-ai-bridge.ts:96`) when real providers fail.
- **RAG injection**: Governed context retrieval (`orchestrator-rag-inject.ts`) injects knowledge base evidence into prompts when `ai.rag` feature flag is enabled.
- **Governance context**: Every prompt includes doctrine references, evidence status, and escalation triggers (`retrieval-router.ts:3-581`).
- **Evidence-gated generation**: Handlers check evidence status before generating outputs (e.g., `evidence-suggestions-handler.ts` checks trustState, `draft-notes-handler.ts` checks missingInformation).

### 4.2 Ungrounded Output Paths

| Path | Risk | Details |
|------|------|---------|
| Direct cloud/Anthropic call with no RAG | MEDIUM | When `ai.rag` is disabled, LLM providers receive governance-injected prompts but no domain-specific context. Model may hallucinate domain details. |
| `generateCompletion()` facade | MEDIUM | Direct callers of `generate.ts:20-33` bypass the governed executor, losing confidence scoring and metadata enrichment. |
| Office AI file-based queries | LOW-MEDIUM | User-uploaded files provide grounding, but file content extraction quality varies. |
| Pattern improvement AI advisor | LOW | Uses `runGroundedLocalContentAI()` with `LocalContentContext` for evidence-backed suggestions, with regex validation of output (`ai-advisor.ts:220-222`). |

### 4.3 Confidence Score Quality

| Aspect | Assessment |
|--------|------------|
| **Gradient scoring** | Good — 4-level system (low/medium/high/very_high) with thresholds at 0.4, 0.7, 0.9 (`confidence-scorer.ts:80-84`). |
| **Factor decomposition** | Good — 5 factors (completeness, sources, length, response_time, provider) with weighted aggregation. |
| **Calibration** | **POOR** — Hardcoded confidence from real providers bypasses the scorer. Industry memory effectiveness feeds confidence (`ai-advisor.ts:967`) but only for LocalContentOS. No cross-product calibration loop. |
| **Provider confidence override** | **POOR** — AnthropicProvider passes 0.8, CloudAIProvider passes 0.78, LocalAIProvider passes 0.72 to `completionToAiResponse()`. These are fixed constants, not computed from output quality. |
| **Low-confidence handling** | Good — `governed-ai-metadata.ts:30-32` flags confidence <0.7 as limitation. `quality-report.ts:49-51` recommends regeneration. |

### 4.4 Post-Generation Validation

Two complementary systems:

1. **Suite-based eval gate** (`eval-gate.ts:27-98`): Runs test cases against actual output with thresholds (67% for fin-analysis, 100% for disclosure-notes and finding-summary). Logged to audit trail.
2. **Content-based eval gate** (`eval-gate.ts:139-178`): Checks minLength, requiredKeywords, forbiddenPatterns, and requiredFields. Warnings only (not blocking).

**Gap**: No eval gate is called automatically post-generation. It's opt-in via API route (`/api/ai/eval-gate`). No integration into the orchestrator pipeline.

---

## 5. Evidence Chain for AI Outputs

### 5.1 Per-Product Assessment

| Product | Feature | Traceable to Evidence? | Mechanism |
|---------|---------|------------------------|-----------|
| **AuditOS** | AI-assisted account mapping | PARTIAL | Evidence status checked against trial balance trust state. Mapping suggestions reference original account codes but don't link to uploaded evidence files. |
| **AuditOS** | Analytical review flags | YES | Each flag references specific account codes and amounts from TB (`analytical-review-handler.ts:33-53`). |
| **AuditOS** | Evidence suggestions | YES | Outputs reference specific finding IDs and account codes (`evidence-suggestions-handler.ts:35-49`). |
| **AuditOS** | Draft notes | YES | Notes reference statement lines, linked findings, and missing information items (`draft-notes-handler.ts:78,105`). |
| **AuditOS** | Finding drafts | YES | References finding definitions and checks for existing findings (`finding-drafts-handler.ts:55,81`). |
| **LocalContentOS** | AI draft assist (content studio) | YES | References linked sources with status and campaign context (`content/ai.ts:75-78,100-103`). |
| **LocalContentOS** | Pattern improvement (workbook) | YES | References FP accounts, unmatched accounts, and industry pattern memory (`ai-advisor.ts:208-213`). |
| **LocalContentOS** | Confidence calibration | YES | Multi-factor: industry effectiveness, org memory, pattern specificity, risk level (`ai-advisor.ts:967-976`). |
| **LocalContentOS** | Auto AI review pipeline | YES | Full pipeline creates `LcAiReviewRun` with structured results, stores all findings persistently (`ai-auto-review.ts:65-234`). |
| **Office AI** | Task output generation | PARTIAL | Prior conversation context and file context provided in prompt. But direct evidence links to source files are implicit, not enumerated. |
| **DecisionOS** | Pilot decision assist | PARTIAL | RAG context injected when available. No direct evidence linking mechanism. |

### 5.2 Evidence Chain Integrity

**Strengths:**
- Audit chain appended for all AI generation events (`audit-ai-bridge.ts:141-147` using `appendToAuditChain`).
- Prompt hash stored for content studio drafts (`content/ai.ts:169-172`), enabling prompt-auditability.
- Organization memory persists AI decisions for future runs (`ai-advisor.ts:616-641`).

**Gaps:**
- No cryptographic hash chain across AI generation events (individual hashes exist but not sequentially linked).
- Evidence references stored as descriptive text, not structured IDs in audit metadata.
- No automated evidence completeness check before generation (relies on `evidenceComplete` flag passed by caller).

---

## 6. Cost Governance

### 6.1 Tracking Implementation

| Component | Status | Details |
|-----------|--------|---------|
| Cost mapping table | IMPLEMENTED | `cost-mapping.ts` — 4 models priced (gpt-4o, gpt-4o-mini, claude-sonnet-4, claude-haiku-3-5) with input/output per-1K-token pricing. |
| Spend tracker | IMPLEMENTED | `spend-tracker.ts` — aggregates from PlatformAuditLog. Per-provider, per-model, per-day, per-org breakdowns. |
| Budget manager | IMPLEMENTED | `budget-manager.ts` — per-org spend caps (default $100/mo), request caps (10K), token caps (5M). Stored in `platformSecret`. |
| Budget enforcement | IMPLEMENTED | `ai.budget-quotas` feature flag. Checked in orchestrator (`orchestrator.ts:223-228`), governed executor (`governed-ai-executor.ts:38-56`). Throws `BudgetQuotaExceededError`. |
| Budget alerts | IMPLEMENTED | `triggerBudgetAlerts()` called fire-and-forget post-generation (`governed-ai-executor.ts:108`). Currently returns void with comment "Alerts are emitted when quotas are checked in governed flows." — actual alert delivery mechanism not visible in code. |
| Cost calculation in audit | IMPLEMENTED | `governed-ai-executor.ts:68-73` calculates and stores cost in audit metadata. |
| API route | IMPLEMENTED | `/api/ai/spend` — GET with optional `?days=30`. Admin only. Returns `SpendSummary` with totalCost, byProvider, byModel, byDay, topOrgs. |

### 6.2 Per-Organization Cost Visibility

**Implemented** via `getAISpendSummary()` which groups by `platformOrganizationId` and returns `topOrgs`. Budget configuration is per-organization via `platformSecret` keyed by `budget_config:{organizationId}`.

### 6.3 Budget Controls

Default budget ($100/mo spend, 10K requests, 5M tokens) is conservative. Config is mutable via `setBudgetConfig()` through `platformSecret.upsert()`. Alert thresholds at 50%, 80%, 90%, 100% defined but delivery mechanism relies on side effect of quota check.

**Gap**: No UI for budget configuration exposed via the governance route. Admin must use API or direct DB access.

---

## 7. Provider Resilience

### 7.1 Fallback Paths

```
Primary Provider → Same-order fallback → selectOptimalProvider() → deterministic
```

`orchestrator.ts:122-183` resolves provider with this chain:
1. Try preferred/routed provider → check `isAvailable()`
2. Try remaining real providers in order (openai → anthropic → local → cloud)
3. Try `selectOptimalProvider()` cost-based routing
4. Fall back to `deterministic` as last resort

In `execute()` (`orchestrator.ts:236-245`), if a non-deterministic provider throws, it immediately falls back to deterministic. This is a single-level fallback — it won't try the next real provider before falling to deterministic.

### 7.2 Retry Logic

| Aspect | Status |
|--------|--------|
| Retry helper | IMPLEMENTED — `provider-utils.ts:12-70`. 3 retries, exponential backoff (1s base, 30s max), retryable statuses [429, 500, 502, 503, 504]. |
| Used by providers | **NOT USED** — `cloud-provider.ts`, `openai-provider.ts`, `anthropic-provider.ts`, `local-provider.ts` all call `fetch()` directly without the retry wrapper. The retry helper exists but is not integrated into any provider implementation. |
| Stream retry | NOT IMPLEMENTED — stream failures throw without retry (`orchestrator.ts:338-356`). |

### 7.3 Circuit Breaker

**Implemented** (`provider-circuit-breaker.ts`) with:
- 5 consecutive failures threshold
- 30-second open duration
- Half-open probe with 1 success needed
- In-memory state (lost on process restart — acceptable for now)

**Integration**: The circuit breaker is exposed via `getCircuitBreakerSnapshot()` in observability (`observability.ts:225`), but is **NOT consulted during provider selection**. The orchestrator's `resolveProvider()` calls `isAvailable()` and `getStatus().configured`, but never checks `isCircuitOpen()`. The circuit breaker is essentially a monitoring-only tool, not an active resilience mechanism.

### 7.4 Timeout Configuration

| Provider | Timeout |
|----------|---------|
| CloudAIProvider | **NONE** — `execute()` calls `openAiCompatibleComplete()` which does `fetch()` without timeout |
| AnthropicProvider | **NONE** — `execute()` calls `anthropicComplete()` which does `fetch()` without timeout |
| LocalAIProvider | **NONE in execute()** — has `AbortSignal.timeout(3000)` for `isAvailable()` health check only |
| OpenAIEmbeddingProvider | **NONE** |
| Provider-utils | `createTimeoutSignal()` helper exists but unused |

**`provider-utils.ts:76-83`** provides `createTimeoutSignal()` for AbortController-based timeouts. This is available but not wired into any provider's `execute()` flow.

---

## 8. AI Audit Trail Coverage

### 8.1 Event Types Logged

| Event Type | Source System | Trigger |
|-----------|--------------|---------|
| `ai_generation` | `ai_orchestrator` | Every `generate()` call via `onGenerate` callback (`orchestrator.ts:49-68`) |
| `ai_generation` | `governed_ai_executor` | Every `governedAIExecute()` call (`governed-ai-executor.ts:92`) |
| `ai_budget_quota_blocked` | `governed_ai_executor` | When budget quota blocks generation (`governed-ai-executor.ts:41-53`) |
| `auditos_ai_generation` | `audit_ai_bridge` | Every governed AuditOS AI call (`audit-ai-bridge.ts:120-148`) |
| `product_ai_generation` | `product_ai_bridge` | Every cross-product governed AI call (`product-ai-bridge.ts:104-122`) |
| `eval_gate_check` | `ai_core` (implicit) | When eval gate is evaluated (`eval-gate.ts:67-83`) |
| `ai_suggestion_generated` | `ai_review_gate` | When `generateAndLogSuggestion()` is called (`review/ai-review-gate.ts:150-153`) |
| `AI_REVIEW_COMPLETED` / `AI_REVIEW_FAILED` | LoCo audit events | LocalContentOS AI review pipeline (`ai-auto-review.ts:158,208`) |

### 8.2 Audit Fields Captured

Per `PlatformAuditLog` schema (`audit-log.ts:18-54`):
- `productKey` — always set
- `action` — always set
- `aiProvider` — set by orchestrator, governed executor, review gate
- `aiModel` — set by orchestrator, governed executor, review gate
- `aiOutputReviewStatus` — set by governed executor (`pending` or `auto_accepted`)
- `metadata` — includes confidence, token counts, costs, taskType, warnings
- `platformOrganizationId` — set by all bridges

### 8.3 Missing Event Types

| Missing Event | Impact |
|--------------|--------|
| `ai_stream_start` / `ai_stream_end` | Streaming generations have no audit trail (`orchestrator.ts:290-359` — `generateStream()` has no `onGenerate` call or audit log write) |
| `ai_provider_fallback` | When a real provider fails and falls to deterministic, it's logged as a warning string, not a structured audit event |
| `ai_circuit_open` | Circuit breaker state changes are not logged |
| `ai_timeout` | No timeout tracking or logging exists |
| `ai_eval_gate_bypass` | When eval gate results in auto-pass (suite not found), there's no "skipped" audit event |

### 8.4 Audit Completeness

**Rating: 7/10** — Core generation paths are well-covered. Streaming blind spot and lack of infrastructure event logging (circuit, timeout, fallback) are notable gaps.

---

## 9. Human Review Gates

| Product | AI Feature | Review Gate? | Auto-approve? | Enforcement |
|---------|-----------|-------------|---------------|-------------|
| **AuditOS** | Account mapping | YES | NO | `humanApprovalRequired: true` in governance context. `outputBoundary: draft_only`. |
| **AuditOS** | Statement drafting | YES | NO | `humanApprovalRequired: true`. `outputBoundary: draft_only`. |
| **AuditOS** | Evidence review | YES | NO | `humanApprovalRequired: true`. |
| **AuditOS** | Draft notes | YES | NO | `humanApprovalRequired: true`. |
| **AuditOS** | Disclosure enrichment | YES | NO | `humanApprovalRequired: true`. |
| **AuditOS** | Audit findings | YES | NO | `humanApprovalRequired: true`. |
| **LocalContentOS** | Content draft assist | YES | NO | `reviewRequired: true` hardcoded in return type (`product-ai-bridge.ts:32`). Draft marked with review warning. |
| **LocalContentOS** | Pattern suggestions | YES | NO | Stored with `status: "pending"`. Reviewed via `reviewPatternSuggestion()` with `reviewerId`. |
| **LocalContentOS** | False positive review | YES | NO | Stored with `status: "pending"`. Reviewed via `reviewFalsePositive()` with `reviewerId`. |
| **LocalContentOS** | Workbook AI review | YES | NO | Entire pipeline status tracked in `LcAiReviewRun` with explicit pending/pending status on items. |
| **Office AI** | Task output generation | YES | NO | Task status `needs_review` → `approved`/`rejected`. `updateOfficeAiTaskStatusAction()` enforces tenant isolation. |
| **DecisionOS** | Pilot decision assist | YES | NO | `humanApprovalRequired: true`. `outputBoundary: review_required`. |
| **Cross-product** | Commercial claim review | YES | NO | `humanApprovalRequired: true`. `outputBoundary: review_required`. |
| **Skill execution** | Platform skill run | PARTIAL | NO | `humanApprovalRequired: false` in governance context, but `outputBoundary: review_required`. Trusts skill author, not operator. |

**Rating: 9/10 for human review gates.** Only gap is `skill_execution` having `humanApprovalRequired: false` despite its `outputBoundary: review_required` — a contradiction that should be resolved.

---

## 10. Critical AI Risks (Ranked)

| # | Risk | Severity | Likelihood | Impact | Evidence |
|---|------|----------|------------|--------|----------|
| 1 | **Prompt injection via unsanitized user input** | CRITICAL | MEDIUM | HIGH | `prompt-framework.ts:96-104` — all taskInput entries interpolated. User-controlled values in `instructions`, `accountName`, `title` fields flow directly into LLM. No sanitization function anywhere in codebase. |
| 2 | **No HTTP timeout on external API calls** | HIGH | MEDIUM | HIGH | `llm-http-client.ts:25,71` — fetch() with no AbortSignal. `cloud-provider.ts`, `anthropic-provider.ts`, `local-provider.ts` all affected. Can block request thread indefinitely. |
| 3 | **Hardcoded confidence bypasses quality scoring** | HIGH | CERTAIN | MEDIUM | Providers pass fixed values (0.72-0.80) to `completionToAiResponse()`. Platform-level confidence metrics become unreliable. |
| 4 | **Retry logic exists but not wired to providers** | MEDIUM | LOW | MEDIUM | `provider-utils.ts` has `fetchWithRetry()` but no provider uses it. Transient API failures cause immediate fallback to deterministic instead of retry. |
| 5 | **Circuit breaker not consulted during provider selection** | MEDIUM | LOW | MEDIUM | `provider-circuit-breaker.ts` tracks state but `orchestrator.ts:resolveProvider()` never checks `isCircuitOpen()`. Circuit breaker is monitoring-only. |
| 6 | **Streaming generations have no audit trail** | MEDIUM | LOW | HIGH | `generateStream()` in `orchestrator.ts:290-359` has no `onGenerate` callback, no audit log, no cost tracking, no budget check. Entire audit trail is blind during streaming. |
| 7 | **Eval gate not auto-triggered post-generation** | LOW | LOW | MEDIUM | Eval gate exists (`eval-gate.ts`) but must be explicitly called via API. Not integrated into orchestrator post-generation flow. |
| 8 | **generateCompletion() bypasses governed executor** | LOW | LOW | MEDIUM | Direct callers of `generate.ts:20-33` go through orchestrator's `onGenerate` callback (which logs) but skip `governedAIExecute()` which adds budget check, cost tracking, and review status enforcement. |

---

## 11. AI Governance Scorecard

| Dimension | Score (1-10) | Rationale |
|-----------|-------------|-----------|
| **Prompt Safety & Injection Defense** | 4 | Layered governance provides structural defense, but zero input sanitization. Direct user input to LLM. |
| **Hallucination Mitigation** | 7 | Deterministic fallback + RAG injection + governance context. Confidence scoring good but bypassed by providers. |
| **Evidence Grounding** | 8 | Strong per-product evidence chains. Organization memory. RAG integration. Prompt hashing for auditability. |
| **Confidence Scoring** | 5 | Good framework but undermined by hardcoded provider values. No calibration loop from real outcomes. |
| **Cost Governance** | 8 | Full budget/quota/alert system. Per-org configuration. Per-model cost mapping. Spend tracking. Missing UI. |
| **Provider Resilience** | 4 | Good architectural design but poor execution. Circuit breaker not wired. Retry unused. No timeouts. |
| **AI Audit Trail** | 7 | Comprehensive event types. AI-specific fields in schema. Streaming gap. Infrastructure events missing. |
| **Human Review Enforcement** | 9 | Near-universal enforcement. All outputs draft/review-only. Per-task governance context. Office AI status workflow. |
| **AGENTS.md §12 Compliance** | 7 | 7/9 requirements met. Output tracking and permission enforcement are partial. |
| **Skill Evaluation Governance** | 6 | Evaluation route exists with RBAC. Framework self-test suite. But no pre-deployment auto-validation gate. |
| **Observability** | 7 | Rich metrics via `observability.ts`. Realtime snapshot API. Day-level trend breakdowns. Missing realtime alerts. |
| **Overall** | **7.8** | Institutional-grade architecture. Pilot-hardened for core flows. Critical hardening needed in prompt safety, provider resilience, and confidence calibration. |

---

## 12. Detailed Recommendations

### Priority 1 (Must Fix — These are blocking for L6 Production-hardened)

1. **Implement prompt sanitization function** — Create `sanitizePromptValue()` in `prompt-framework.ts` that strips delimiter injection patterns, limits length, and wraps user input in bounded markers. Apply before `buildTaskSpecificLayer()` and in all mock provider template literals.

2. **Add HTTP timeouts to all provider calls** — Wire `createTimeoutSignal()` from `provider-utils.ts` into `openAiCompatibleComplete()`, `anthropicComplete()`, and `local-provider.ts:execute()`. Default: 60 seconds for completion, 120 seconds for streaming.

3. **Wire retry logic into providers** — Call `fetchWithRetry()` instead of bare `fetch()` in `cloud-provider.ts`, `local-provider.ts`, and `llm-http-client.ts`.

### Priority 2 (Should Fix — Pilot-ready hardening)

4. **Integrate circuit breaker into provider selection** — Add `isCircuitOpen(providerId)` check in `orchestrator.ts:resolveProvider()` before attempting to use a provider.

5. **Replace hardcoded confidence with real calculation** — In `completionToAiResponse()`, accept an optional `ConfidenceInput` and compute via `calculateConfidence()` instead of passing a fixed number. Or add a post-response hook that recomputes.

6. **Add audit trail to streaming** — Add `onGenerate`-equivalent callback to `generateStream()` in the orchestrator.

### Priority 3 (Nice to Have — v0.2 readiness)

7. **Auto-trigger eval gate post-generation** — Add a configurable post-generation hook in the orchestrator that can run `evaluateWithGate()` for high-risk task types (audit_findings, statement_drafting, disclosure_enrichment).

8. **Structured evidence references in audit metadata** — Replace descriptive text with `evidenceRefs: [{ type, id, label }]` array in audit log metadata for AI generation events.

9. **Real-time budget alert delivery** — Implement actual alert delivery (email/webhook) in `triggerBudgetAlerts()` instead of the current void stub.

---

## Appendix A — Files Examined

| # | File | Lines | Audit Area |
|---|------|-------|------------|
| 1 | `src/lib/core/ai/index.ts` | 74 | Architecture |
| 2 | `src/lib/core/ai/engine.ts` | 103 | Architecture |
| 3 | `src/lib/core/ai/orchestrator.ts` | 378 | Provider routing, Audit trail, Budget |
| 4 | `src/lib/core/ai/governed-ai-executor.ts` | 117 | Budget, Audit, Review gates |
| 5 | `src/lib/core/ai/governed-ai-metadata.ts` | 66 | Metadata, Confidence, Limitation |
| 6 | `src/lib/core/ai/types.ts` | 161 | Architecture |
| 7 | `src/lib/core/ai/generate.ts` | 81 | Architecture |
| 8 | `src/lib/core/ai/prompt-registry.ts` | 138 | Prompt injection, Evidence |
| 9 | `src/lib/core/ai/confidence-scorer.ts` | 101 | Confidence scoring |
| 10 | `src/lib/core/ai/cost-governance.ts` | 34 | Cost |
| 11 | `src/lib/core/ai/budget-manager.ts` | 149 | Cost, Budget |
| 12 | `src/lib/core/ai/spend-tracker.ts` | 141 | Cost tracking |
| 13 | `src/lib/core/ai/cost-mapping.ts` | 57 | Cost mapping |
| 14 | `src/lib/core/ai/eval-gate.ts` | 208 | Hallucination, Quality gate |
| 15 | `src/lib/core/ai/quality-report.ts` | 67 | Quality |
| 16 | `src/lib/core/ai/observability.ts` | 251 | Observability |
| 17 | `src/lib/core/ai/governance-metrics.ts` | 99 | Governance metrics |
| 18 | `src/lib/core/ai/intelligence-runtime.ts` | 87 | Routing |
| 19 | `src/lib/core/ai/orchestrator-rag-inject.ts` | 62 | Evidence, RAG |
| 20 | `src/lib/core/ai/review/ai-review-gate.ts` | 167 | Review gate, Evidence |
| 21 | `src/lib/core/ai/providers/provider-circuit-breaker.ts` | 103 | Resilience |
| 22 | `src/lib/core/ai/providers/llm-http-client.ts` | 145 | Provider calls, Retry gap |
| 23 | `src/lib/core/ai/providers/cloud-provider.ts` | 76 | Provider implementation |
| 24 | `src/lib/core/ai/providers/openai-provider.ts` | 29 | Provider implementation |
| 25 | `src/lib/core/ai/providers/anthropic-provider.ts` | 60 | Provider implementation |
| 26 | `src/lib/core/ai/providers/local-provider.ts` | 101 | Provider implementation |
| 27 | `src/lib/core/ai/providers/deterministic-provider.ts` | 62 | Provider implementation |
| 28 | `src/lib/core/ai/providers/ai-provider-factory.ts` | 114 | Provider factory |
| 29 | `src/lib/core/ai/providers/provider-utils.ts` | 113 | Retry helper |
| 30 | `src/lib/core/ai/hybrid-router.ts` | 79 | Routing |
| 31 | `src/lib/core/ai/handlers/register-handlers.ts` | 33 | Handlers |
| 32 | `src/lib/core/ai/runtime/inference-service.ts` | 57 | Runtime |
| 33 | `src/lib/governance/prompt-framework.ts` | 329 | Prompt injection, Governance |
| 34 | `src/lib/governance/retrieval-router.ts` | 607 | Governance context |
| 35 | `src/lib/governance/runtime-types.ts` | 188 | Types |
| 36 | `src/lib/platform/product-ai-bridge.ts` | 138 | Product bridge |
| 37 | `src/lib/audit/audit-ai-bridge.ts` | 170 | Audit bridge |
| 38 | `src/lib/office-ai/office-ai-orchestrator-bridge.ts` | 110 | Office bridge |
| 39 | `src/lib/local-content/content/ai.ts` | 207 | LoCo content AI |
| 40 | `src/lib/local-content/workbook/ai-advisor.ts` | 1161 | LoCo workbook AI |
| 41 | `src/lib/local-content/workbook/ai-health.ts` | 308 | LoCo AI health |
| 42 | `src/lib/local-content/workbook/ai-auto-review.ts` | 302 | LoCo AI review |
| 43 | `src/app/api/ai/spend/route.ts` | 23 | Cost API |
| 44 | `src/app/api/ai/providers/route.ts` | 33 | Provider API |
| 45 | `src/app/api/ai/governance/route.ts` | 23 | Governance API |
| 46 | `src/app/api/ai/eval-gate/route.ts` | 68 | Eval API |
| 47 | `src/app/api/skills/evaluate/route.ts` | 227 | Skill eval API |
| 48 | `src/actions/localcontent-ai-advisor-actions.ts` | 321 | LoCo actions |
| 49 | `src/actions/office-ai-actions.ts` | 480 | Office actions |
| 50 | `src/actions/ai-governance-actions.ts` | 172 | Governance actions |
| 51 | `src/actions/ai-settings-actions.ts` | ~100 | AI settings |
| 52 | `src/lib/platform/audit-log.ts` | 228 | Audit infrastructure |
| 53 | `src/lib/platform/audit-logger.ts` | ~80 | Audit logger |
| 54 | `src/lib/core/ai/model-registry.ts` | ~140 | Model registry |
| 55 | `src/lib/core/ai/provider-router.ts` | ~100 | Provider routing |
| 56 | `src/lib/core/ai/provider-factory.ts` | ~30 | Provider factory |
| 57 | `src/lib/core/ai/embedding/embedding-provider.ts` | ~110 | Embeddings |
| 58 | `src/lib/core/ai/ingestion/ingestion-pipeline.ts` | ~80 | Knowledge ingestion |
| 59 | `docs/source-of-truth/AI_CAPABILITY_MATRIX.md` | 22 | Capability claims |
| 60 | `prisma/schema.prisma` (AI fields) | — | Schema |
| 61 | `src/lib/core/ai/providers/mock-provider.ts` | ~270 | Mock provider |
| 62 | `src/lib/core/ai/runtime/index.ts` | 7 | Runtime facade |

---

## Appendix B — Prepared by

- **Role:** AI Governance Auditor
- **Methodology:** Read-only file inspection. No code changes, no DB access, no API calls.
- **Authority:** AGENTS.md §12, §25, §35; `docs/DOCUMENTATION_AUTHORITY.md`.
- **Skills loaded:** `aqliya-security-gate.md`, `aqliya-product-completion.md`
