# LocalContentOS AI Governance

> **Status:** Active | **Version:** 1.0 | **Date:** 2026-07-01 | **Owner:** AI Governance Team

## 1. AI Provider Dependencies

### 1.1 Features Using Cloud AI Providers

The following LocalContentOS features can use cloud AI providers (OpenAI, Anthropic, or generic Cloud) when the `ai.real-providers` feature flag is enabled (`FF_AI_REAL_PROVIDERS=true`):

| Feature | Component | AI Action | Cloud Providers | Deterministic Fallback |
|---------|-----------|-----------|-----------------|----------------------|
| Pattern Suggestions | `ai-advisor.ts` | `suggestPatternImprovements()` | OpenAI, Anthropic, Cloud | ✅ Template-based suggestions |
| AI Advisor Chat | `ai-advisor/page.tsx` | Pattern analysis, explanations | OpenAI, Anthropic, Cloud | ✅ Deterministic response |
| Workbook AI Insights | `ai-insights-panel.tsx` | Anomaly detection, trends | OpenAI, Anthropic, Cloud | ✅ Rule-based insights |
| Review Assistance | `review-center-client.tsx` | Review summaries | OpenAI, Anthropic, Cloud | ✅ Template summaries |

### 1.2 Features Using Deterministic AI Only

These features are purely deterministic/rule-based and do not call any cloud AI provider:

| Feature | Engine | Description |
|---------|--------|-------------|
| Scoring Engine | `scoring.ts` | Weighted formula: locality (40%), ownership (25%), workforce (20%), declared content (15%) |
| Tender Match | `tender-match/` | Rule-based comparison of supplier/spend data against tender spec |
| Classification Rules | `classification-rules/` | Metadata-driven deterministic classification |
| Spend Analytics | `analytics/` | Deterministic aggregate queries (no AI) |
| Supplier Records | `suppliers/` | CRUD with deterministic validation |
| Evidence Vault | `evidence/` | File-based evidence with review workflow, no AI generation |

### 1.3 Provider Routing

Provider selection is handled by `AIOrchestrator` (`src/lib/core/ai/orchestrator.ts`):

1. **Feature flag gate**: If `FF_AI_REAL_PROVIDERS` is `false`, all AI uses deterministic fallback immediately.
2. **Environment variable**: `AI_PROVIDER` environment variable sets the default provider (`openai`, `anthropic`, `cloud`, `deterministic`).
3. **Provider priority order**: `openai` → `anthropic` → `local` → `cloud` → `deterministic` (with `deterministic` always as emergency fallback).
4. **Circuit breaker**: Each provider has a circuit breaker (`provider-circuit-breaker.ts`) — after 5 consecutive failures the provider is marked `open` and skipped.
5. **Hybrid router**: `hybrid-router.ts` can also route by task type for cost-based selection.

```
                   ┌─────────────────────────────┐
                   │  AIOrchestrator.generate()   │
                   └──────────┬──────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │ FF_AI_REAL_PROVIDERS │
                   │  = true?             │
                   └──────┬──────┬───────┘
                      yes │      │ no
                   ┌──────▼──┐   │
                   │ Provider│   │
                   │ Router  │   │
                   └──┬──┬──┘   │
                      │  │      │
              ┌───────▼┐ │ ┌────▼───────────┐
              │OpenAI/ │ │ │ Deterministic   │
              │Anthropic│ │ │ Provider       │
              │Cloud   │ │ │                 │
              └────┬───┘ │ └─────────────────┘
                   │      │
              ┌────▼──────▼────┐
              │ On error →     │
              │ deterministic  │
              │ fallback       │
              └────────────────┘
```

### 1.4 Fallback Behavior

| Scenario | Provider Behavior | User Experience |
|----------|------------------|-----------------|
| `FF_AI_REAL_PROVIDERS=false` | No cloud calls | Suggestions are template-based, deterministic. No degradation notice shown. |
| API key invalid/missing | Auth error → deterministic fallback | "AI suggestion unavailable" with fallback template text |
| Network timeout | Timeout → deterministic fallback (after 15s) | "AI service temporarily unavailable. Using deterministic mode." |
| Rate limited (429) | Retry → deterministic fallback | "AI service busy. Using deterministic mode." |
| Circuit breaker open | Skip to next provider → deterministic if all fail | "AI service degraded." |
| All providers fail | Deterministic emergency fallback | Normal deterministic output, no error shown |

### 1.5 What Users See When Cloud AI Is Unavailable

- **Pattern Suggestions**: Fallback to template-based suggestions with lower specificity. UI shows a subtle "تلميحات محدودة" / "Limited suggestions" indicator.
- **AI Advisor Chat**: Falls back to deterministic rule-based responses. Chat displays a banner: "خدمة الذكاء الاصطناعي غير متاحة حالياً. يتم استخدام الوضع التقليدي." / "AI service currently unavailable. Using deterministic mode."
- **Workbook AI Insights**: Falls back to simple statistical summaries (counts, averages). No banner — differences from AI-driven insights are minimal.
- **All AI output**: Labeled as "مسودة" / "Draft" — human review required regardless of provider.

### 1.6 Provider Configuration

| Variable | Required | Scope | Notes |
|----------|----------|-------|-------|
| `AI_PROVIDER` | Yes | Default provider | Values: `openai`, `anthropic`, `cloud`, `deterministic` |
| `OPENAI_API_KEY` | Conditional | If `AI_PROVIDER=openai` | Server-side only |
| `ANTHROPIC_API_KEY` | Conditional | If `AI_PROVIDER=anthropic` | Server-side only |
| `AI_CLOUD_API_KEY` | Conditional | If `AI_PROVIDER=cloud` | Server-side only |
| `AI_CLOUD_BASE_URL` | Optional | Generic cloud endpoint | Server-side only |
| `AI_LOCAL_BASE_URL` | Conditional | If `AI_PROVIDER=local` | Local/on-prem endpoint |
| `FF_AI_REAL_PROVIDERS` | Yes | Feature flag | `true`/`false` — gates all cloud AI |

## 2. AI Governance Controls

### 2.1 Every AI Action Includes

- **Audit log entry** via `writePlatformAuditLog()` with provider ID, model, task type, confidence, duration
- **Human review status** — AI output is always `needs_review` by default
- **Confidence scoring** — each response includes a confidence value (0.0–1.0)
- **Source references** — where applicable, evidence/file links are included
- **No autonomous decisions** — AI never approves, rejects, or exports without human review

### 2.2 Restricted Actions

| Action | Restriction |
|--------|-------------|
| Final scoring approval | Human only |
| Export of reports | Human review required |
| Classification override | Human only |
| Supplier verification | Human only |

## 3. Cross-References

- **Deployment runbook**: `docs/runbooks/localcontentos-deployment-runbook.md` — AI_PROVIDER and FF_AI_REAL_PROVIDERS config
- **Production runbook**: `docs/operations/production-deployment-runbook.md` — general AI provider config
- **AI auth review**: `docs/runbooks/localcontentos-ai-auth-review.md` — detailed provider authentication review
- **Feature flags**: `src/lib/platform/feature-flags/registry.ts` — ai.real-providers, ai.cost-tracking, ai.budget-quotas
- **Orchestrator source**: `src/lib/core/ai/orchestrator.ts` — provider selection and fallback logic
- **Circuit breaker**: `src/lib/core/ai/providers/provider-circuit-breaker.ts` — provider health tracking
- **Product status**: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — AI Governance at L4
- **Glossary**: `docs/official/aqliya-glossary-v1.1.md` — AI terminology

## 4. Audit Trail

All AI actions are logged via `AuditEvent` model with:
- `action`: e.g. `ai_generation`
- `aiProvider`: provider ID used
- `aiModel`: model version
- `targetType` + `targetId`: what was acted upon
- `severity`: `info` or `warning`
- `metadata`: task type, confidence, output count, duration, warnings
