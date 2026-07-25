# ADR-107: AI Architecture

**Status:** Accepted — Codifies ADR-001 + Kernel AI gateway reality  
**Date:** 2026-07-19  
**Owner:** AI Architecture / Platform  
**Supersedes in part:** Clarifies commercial claims vs `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md`  
**Related:** ADR-100, ADR-101, ADR-105; `src/lib/security/prompt-sanitization.ts`

---

## Context

AQLIYA AI is governance-first: orchestrator, hybrid router, providers (OpenAI, Anthropic, cloud, local Ollama, mock, deterministic), prompt registry, budget manager, spend tracker, eval suites, human-review gates. Trust principle forbids autonomous final decisions. Local AI is pilot-conditioned (Ollama), not air-gapped certification. Model Governance registry remains L0 in status matrix while some settings UI exists — claim discipline required.

---

## Problem

1. Cost governance code exists but `ai.budget-quotas` / `ai.budget-alerts` default **off**.
2. Silent fallback to deterministic/mock can mislead users if UI does not surface degradation.
3. Prompt sanitization must cover all LLM entry points, not only orchestrator.
4. Commercial language must not claim regulator-certified AI or 100% accuracy.
5. ADR-001 TB pipeline priority must remain the AuditOS classification law.

---

## Options Considered

### Option A — Cloud-only AI

| Pros | Cons |
|------|------|
| Simpler ops | Conflicts with Hybrid/Local strategy and sovereign narrative |

### Option B — Local-only / air-gapped AI now

| Pros | Cons |
|------|------|
| Strong sovereignty story | Not production-proven; On-Prem L0 |

### Option C — Hybrid governed AI with human approval (selected)

| Pros | Cons |
|------|------|
| Matches ADR-001 + orchestrator | Requires flag honesty + UX for fallback |
| Eval + sanitization path exists | Quotas must be enabled for “enforced” claims |

---

## Decision

1. **Trust law:** AI assists; humans decide; evidence governs. Outputs are drafts/suggestions unless a human approval workflow completes.
2. **Runtime modes:** `Cloud` | `Local` (Ollama) | `Hybrid` per ADR-001 / `AI_MODE`.
3. **Provider fallback order** remains Kernel/orchestrator-defined; UI/ops must expose when non-primary provider served the result (requirement for new UI work).
4. **Every LLM prompt path** must call `sanitizePromptInput` / `sanitizeTaskInput` / `sanitizeFreeText` as appropriate.
5. **Prompt registry** entries set `requiresHumanApproval`, `requiresEvidence`, `outputBoundary: 'draft_only'` unless an ADR amends.
6. **Cost:** `budget-manager` defaults ($100/org/month, request/token caps) are the reference policy. Claiming “enforced cost governance” requires `ai.budget-quotas` (and ideally alerts) **enabled** in the target environment.
7. **Eval:** Core eval suites under `src/lib/core/ai/eval/` gate quality for IC skills; product domains may add suites.
8. **Model Governance registry:** Strategic/L0 until a dedicated ADR promotes it — do not market as live.
9. **TB classification:** Firm Memory → Rules → Patterns → Local → Cloud → Human Review (ADR-001) remains binding for AuditOS mapping.

---

## Consequences

### Positive
- Single AI doctrine across products.
- Aligns security (prompt injection) with product UX.
- Honest commercial positioning.

### Negative
- Enabling quotas may block heavy pilot usage — capacity planning needed.
- Fallback transparency requires UI work.

---

## Migration Strategy

1. Document flag defaults in ops runbooks.
2. Enable quotas/alerts in staging → prod when ready; or downgrade docs claims.
3. Audit non-orchestrator LLM call sites for sanitization (security backlog).
4. Keep Local AI claims at “pilot with operator Ollama” — never Air-Gapped without new ADR.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Orchestrator paths sanitized | 100% |
| Human approval before final export of AI-derived artifacts | 100% where product requires |
| Budget quotas in prod when cost-gov claimed | Enabled |
| Eval suites registered | ≥7 (current) maintained |
| Air-Gapped / On-Prem AI claims | 0 unless ADR + evidence |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Prompt injection | Sanitization + least privilege tools |
| Hallucination in exports | Disclaimers + evidence links + review |
| Cost overruns | Quotas + spend tracker |
| Shadow AI call paths | Security/eng scan |

---

## Related Components

- `src/lib/core/ai/orchestrator.ts`, `governed-ai-executor.ts`, `prompt-registry.ts`
- `src/lib/core/ai/providers/*`, `hybrid-router.ts`
- `src/lib/core/ai/budget-manager.ts`, `cost-governance.ts`, `spend-tracker.ts`
- `src/lib/core/ai/review/ai-review-gate.ts`, `eval/`
- `src/lib/security/prompt-sanitization.ts`
- `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md`

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| ADR-001 | `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md` |
| Local provider (Ollama REST) | `src/lib/core/ai/providers/local-provider.ts` |
| Sanitization wired | `orchestrator.ts` imports `sanitizeTaskInput` |
| Feature flags quotas off | `src/lib/platform/feature-flags/registry.ts` |
| Commercial exclusions | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` |
| Model Governance L0 | `PRODUCT_STATUS_MATRIX.md` |
