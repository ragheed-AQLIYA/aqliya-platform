# AI PLATFORM REVIEW
**Independent Audit — AQLIYA Repository**
**Date:** 2026-06-25
**Classification:** Technical Due Diligence
**Auditors:** AI Platform Architect · Principal Software Architect

---

## 1. Provider Architecture

### 1.1 Provider Registry

Five providers are registered:

| Provider | Class | Status | Activation |
|----------|-------|--------|------------|
| `DeterministicAIProvider` | `deterministic-provider.ts` | Default (always available) | Always on |
| `OpenAIProvider` | `openai-provider.ts` | Env-gated | `FF_AI_REAL_PROVIDERS=true` + `OPENAI_API_KEY` |
| `AnthropicProvider` | `anthropic-provider.ts` | Env-gated | `FF_AI_REAL_PROVIDERS=true` + `ANTHROPIC_API_KEY` |
| `CloudAIProvider` | `cloud-provider.ts` | Partial — legacy path | Cloud config env |
| `LocalAIProvider` | `local-provider.ts` | Ollama operational (L4) | `AI_LOCAL_BASE_URL` + `AI_LOCAL_MODEL` |

**FINDING: MEDIUM — File corruption in provider layer**

Multiple files in the provider layer are corrupted (binary "data"):
- `src/lib/ai/providers/deterministic-provider.ts` — default fallback provider in legacy path
- `src/lib/ai/providers/provider-utils.ts`

These affect the `src/lib/ai/` (legacy) path, not `src/lib/core/ai/providers/` (canonical). However, since 23 production files import from the legacy path and the legacy `providers/index.ts` has a parse error (TS1002), any consumer of the legacy AI module that tries to use `DeterministicAIProvider` from `@/lib/ai` will encounter a runtime failure.

The canonical `src/lib/core/ai/providers/` appears structurally intact but contains TypeScript parse errors across all provider files (TS1005 "'}' expected" at various lines), suggesting file encoding corruption in these files as well.

### 1.2 Provider Routing

`src/lib/core/ai/provider-router.ts` (canonical) implements:
- Priority-ordered provider selection
- Circuit breaker per provider (`provider-circuit-breaker.ts`)
- Cost-sorted fallback chain
- Deterministic fallback when all real providers unavailable

**FINDING: MEDIUM** — `provider-router.ts` itself has a TypeScript parse error (TS1005 at line 95). The routing logic may compile in practice if the parse error is in a code path not exercised, but the file is formally non-compilable.

### 1.3 Default Provider

`DeterministicAIProvider` routes to five registered task handlers:

| Task Type | Handler |
|-----------|---------|
| `trial_balance_upload` | `analyticalReviewHandler` |
| `evidence_review` | `evidenceSuggestionsHandler` |
| `audit_findings` | `findingDraftsHandler` |
| `approval_review` | `recommendationDraftsHandler` |
| `notes_generation` | `draftNotesHandler` |

This is the only AI provider guaranteed to be available without environment configuration. It does not call an LLM — it executes deterministic rule-based handlers that produce structured outputs. This is appropriate for a platform claiming human-in-the-loop governance, but it means **by default, AQLIYA produces no LLM-generated content**. Real AI requires explicit environment flag activation.

---

## 2. Prompt Registry

### 2.1 Structure

`src/lib/core/ai/prompt-registry.ts` maps `GovernanceTaskType` → `PromptRegistryEntry` with fields:
- `builder: PromptBuilder`
- `requiresEvidence: boolean`
- `requiresHumanApproval: boolean`
- `outputBoundary: string`

This is a positive design — each prompt is decorated with governance metadata. `requiresHumanApproval: true` is set for `statement_drafting` and financial tasks.

**FINDING: MEDIUM** — `prompt-registry.ts` itself has a TypeScript parse error (TS1005 at line 137). The registry is non-compilable as written.

### 2.2 Output Boundary Enforcement

`outputBoundary: 'draft_only'` is set for financial outputs. This is a metadata declaration, not a runtime enforcement. Nothing in the codebase was found that reads `outputBoundary` and enforces that the output cannot be published or exported without human approval. The enforcement is implied to exist in the governance layer but was not verified.

---

## 3. Evaluation Framework

### 3.1 Eval Runner

`src/lib/core/ai/eval/eval-runner.ts` implements three metric functions:

| Metric | Implementation |
|--------|---------------|
| `exact_match` | `expected.trim() === actual.trim()` |
| `contains` | `actual.includes(expected)` |
| `regex` | `new RegExp(expected).test(actual)` |

**FINDING: HIGH** — These are syntactic metrics. For a financial audit platform, AI outputs should be evaluated for:

- Factual correctness relative to uploaded trial balance data
- Absence of hallucinated account codes or amounts
- Compliance with accounting standards (IFRS, SOCPA)
- Appropriate uncertainty quantification

None of these are measured. `exact_match` on financial drafts is not a meaningful quality gate — the correct output for an analytical review is not a fixed string.

### 3.2 Eval Suites (Legacy Path — Corrupted)

`src/lib/ai/eval/suites/financial-analysis.ts`, `framework-self-test.ts`, and `index.ts` are binary-corrupted files. The eval suites in the legacy path cannot execute. If CI runs evals from this path, they would fail to load.

The canonical `src/lib/core/ai/eval/suites/` versions appear structurally intact, but `eval-gate.ts` has a parse error (TS1005 at line 16), meaning the gate that decides whether eval passes or blocks deployment is also non-compilable.

---

## 4. Hallucination Protection

**FINDING: HIGH**

No semantic hallucination detection exists. The platform's hallucination protection strategy is:

1. **Deterministic default provider** — outputs are rule-based, not LLM-generated, so hallucination cannot occur when real providers are disabled.
2. **Human review gate** — all AI outputs are marked `status: "suggested"` until accept/reject by a human.
3. **Evidence linkage** — outputs must reference evidence items.

These are governance controls, not technical hallucination detection. When a real LLM provider is activated (via `FF_AI_REAL_PROVIDERS=true`), the platform relies entirely on the human reviewer to catch hallucinated content. There is no output validation layer that checks generated text against source evidence.

For a platform used in statutory audit processes and financial statement drafting, this is an architectural gap. The governance model is correct in principle (humans decide) but the technical layer provides no assistance to the reviewer in identifying hallucinated content.

---

## 5. Cost Governance

### 5.1 Spend Tracker

`src/lib/core/ai/spend-tracker.ts` implements cost tracking by reading `PlatformAuditLog` records with `productKey: "ai_core"`. It computes per-provider, per-model, per-day, and per-org cost summaries.

**FINDING: MEDIUM** — The spend tracker reads from the audit log, which means cost data accuracy depends on audit log completeness. If AI operations fail to write to the audit log (e.g., due to the `try/catch` silent-fail pattern in `recordSalesAuditEvent`), spend data will be understated.

### 5.2 Budget Manager

`src/lib/core/ai/budget-manager.ts` exists. `src/lib/core/ai/cost-governance.ts` exports `AICostGovernance`, `checkOrgAIBudget`, and `getOrgAIBudgetStatus`. Budget enforcement is present in the architecture.

**FINDING: MEDIUM** — `cost-governance.ts` has a TypeScript parse error (TS1005 at line 34). The budget governance module is non-compilable as written.

---

## 6. Observability

`src/lib/core/ai/observability.ts` — exists, TS1005 parse error at line 249.

`src/lib/core/ai/governed-ai-metadata.ts` — exists, TS1005 parse error at line 65.

**FINDING: HIGH** — The AI observability layer and governed metadata wrapper are both non-compilable. This means AI operation logging metadata and observability hooks cannot be type-checked against their contracts.

---

## 7. Local AI

`LocalAIProvider` connects to Ollama via REST (`/api/chat`). The README states "L4 operational — local-ai:smoke PASS, qwen3:8b." Implementation is present in `src/lib/core/ai/providers/local-provider.ts` and looks structurally sound. Availability is checked with a 3-second timeout against `/api/tags`.

The README explicitly states *"local GPU packaging (IC-10) = future."* This is correctly disclosed.

---

## 8. Summary

| Capability | Status | Finding |
|------------|--------|---------|
| Deterministic provider | Operational in canonical path | Provider files have parse errors |
| Real LLM providers | Env-gated, operational when activated | Provider files have parse errors |
| Local AI (Ollama) | L4 operational | Provider file has parse errors |
| Provider routing & circuit breaker | Designed correctly | `provider-router.ts` parse error |
| Prompt registry | Present, governance-decorated | Parse error in registry file |
| Eval framework | Present but inadequate | String metrics; legacy path corrupted |
| Hallucination protection | Governance-only (human review) | No technical detection layer |
| Cost governance | Architecture present | `cost-governance.ts` parse error |
| Observability | Architecture present | `observability.ts` parse error |

**Verdict: The AI platform design is architecturally sound — provider routing, deterministic fallback, governance decoration, and human review gates are correct patterns. However, the majority of AI infrastructure files in the canonical path (`src/lib/core/ai/`) have TypeScript parse errors suggesting file corruption or incomplete writes. The platform cannot be considered production-ready for real LLM operations until these files compile cleanly.**
