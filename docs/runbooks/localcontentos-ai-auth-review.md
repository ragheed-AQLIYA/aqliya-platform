# LocalContentOS — AI Provider Authentication & Security Review

> **Product:** LocalContentOS under AQLIYA  
> **Level:** L6 Production-hardened  
> **Status:** Active | Version 1.0 | 2026-07-01  
> **Classification:** Security — Internal Only  
> **Review Type:** AI Provider Key Audit & Auth Boundary Verification  
> **Language:** Bilingual (Arabic/English)

---

## Table of Contents — فهرس المحتويات

1. [Scope and Purpose — النطاق والغرض](#1-scope-and-purpose--)
2. [AI Provider Inventory — جرد مزودي الذكاء الاصطناعي](#2-ai-provider-inventory--)
3. [Server-Side Only Verification — التحقق من جانب الخادم فقط](#3-server-side-only-verification--)
4. [Provider Routing and Fallback — توجيه المزود والرجوع البديل](#4-provider-routing-and-fallback--)
5. [Cross-Reference with Deployment Runbook — الإسناد الترافقي مع دليل النشر](#5-cross-reference-with-deployment-runbook--)
6. [Audit Trail and Sign-Off — سجل التدقيق والتوقيع](#6-audit-trail-and-sign-off--)

---

## 1. Scope and Purpose — النطاق والغرض

### Scope — النطاق

This document reviews all AI provider API keys, endpoints, and authentication mechanisms used by LocalContentOS (LCOS) AI features. It confirms:

1. All keys are **server-side only** and never exposed to client bundles
2. Provider routing follows governed rules (no autonomous decisions)
3. Fallback behavior is documented and predictable
4. Deployment environment variables are cross-referenced with the deployment runbook

**Review boundaries:** AI features of LCOS only (pattern suggestions, confidence calibration, false positive review, account explanations). Platform-level AIOrchestrator is reviewed for the LCOS consumption path only.

### Trust Principle — مبدأ الثقة

> AI assists. Humans decide. Evidence governs.
> الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

Every AI feature in LCOS obeys this principle:
- AI output is always a **suggestion** or **draft**
- All suggestions require **human review** before action
- Every AI action is **audited** with source input references
- No AI output is presented as a final decision

---

## 2. AI Provider Inventory — جرد مزودي الذكاء الاصطناعي

### Provider Configuration Summary — ملخص تكوين المزود

| # | Provider ID | Env Variable(s) | Model | Used By LCOS? | Purpose |
|---|-------------|-----------------|-------|---------------|---------|
| 1 | **OpenAI** | AI_PROVIDER=openai, OPENAI_API_KEY | GPT-4o (default) | ✅ Yes | Pattern suggestions, explanations |
| 2 | **Anthropic** | AI_PROVIDER=anthropic, ANTHROPIC_API_KEY, ANTHROPIC_MODEL | Claude Sonnet 4 | ✅ Yes | Pattern suggestions, explanations |
| 3 | **Cloud (generic)** | AI_PROVIDER=cloud, AI_CLOUD_API_KEY, AI_CLOUD_BASE_URL, AI_CLOUD_MODEL | Configurable | ✅ Yes | Alternative cloud provider |
| 4 | **Local (Ollama)** | AI_LOCAL_BASE_URL, AI_LOCAL_MODEL | qwen3:8b (recommended) | ✅ Yes | Offline / air-gapped mode |
| 5 | **Deterministic** | None (built-in) | Rule-based | ✅ Yes | Fallback when no API keys configured |
| 6 | **vLLM** | VLLM_BASE_URL, VLLM_MODEL | Configurable | ❌ No | Platform-level only |

### Provider-Specific Key Inventory — جرد مفاتيح كل مزود

#### 1. OpenAI — مفتاح OpenAI

| Field | Value |
|-------|-------|
| Env variable | OPENAI_API_KEY |
| Type | Bearer token (sk-...) |
| Server-only | ✅ Yes (imported only in src/lib/core/ai/providers/openai-provider.ts) |
| Client bundle | ❌ Never exposed |
| Default model | gpt-4o |
| LCOS entry point | unGovernedProductAI() → iOrchestrator.generate() → OpenAIProvider |
| NEXT_PUBLIC_* variant | ❌ None |

#### 2. Anthropic — مفتاح Anthropic

| Field | Value |
|-------|-------|
| Env variable | ANTHROPIC_API_KEY |
| Type | Bearer token (sk-ant-...) |
| Server-only | ✅ Yes (imported only in src/lib/core/ai/providers/anthropic-provider.ts) |
| Client bundle | ❌ Never exposed |
| Default model | claude-sonnet-4-20250514 (from .env.example) |
| LCOS entry point | unGovernedProductAI() → iOrchestrator.generate() → AnthropicProvider |
| NEXT_PUBLIC_* variant | ❌ None |

#### 3. Cloud (generic) — مفتاح السحابة العام

| Field | Value |
|-------|-------|
| Env variable | AI_CLOUD_API_KEY, AI_CLOUD_BASE_URL, AI_CLOUD_PROVIDER_NAME, AI_CLOUD_MODEL |
| Type | Configurable bearer token |
| Server-only | ✅ Yes (imported only in src/lib/core/ai/providers/cloud-provider.ts) |
| Client bundle | ❌ Never exposed |
| LCOS entry point | Same as above |
| NEXT_PUBLIC_* variant | ❌ None |

#### 4. Local (Ollama) — المزود المحلي

| Field | Value |
|-------|-------|
| Env variable | AI_LOCAL_BASE_URL, AI_LOCAL_MODEL, AI_LOCAL_EMBED_MODEL |
| Type | HTTP endpoint (no auth key required for local) |
| Server-only | ✅ Yes (imported only in src/lib/core/ai/providers/local-provider.ts) |
| Client bundle | ❌ Never exposed |
| Default model | qwen3:8b (recommended for LCOS), fallback llama3 |
| LCOS entry point | Same as above |
| NEXT_PUBLIC_* variant | ❌ None |

#### 5. Deterministic (Fallback) — المزود الحتمي (الاحتياطي)

| Field | Value |
|-------|-------|
| Env variable | None required |
| Type | Built-in rule-based engine |
| Server-only | ✅ Yes (imported only in src/lib/core/ai/providers/deterministic-provider.ts) |
| Client bundle | ❌ Never exposed |
| Behavior | Returns pre-defined responses based on task type |
| LCOS entry point | Same as above |

### Feature Flag Dependencies — تبعيات أعلام الميزات

| Flag | Required For | Default | LCOS Impact |
|------|-------------|---------|-------------|
| FF_AI_REAL_PROVIDERS=true | Real provider calls (OpenAI, Anthropic, Cloud) | alse | Without this → deterministic fallback → limited suggestions |
| FF_AI_RAG=true | Grounded AI (context-rich suggestions) | alse | Without this → suggestions lack evidence grounding |

### LCOS AI Call Chain — سلسلة استدعاءات الذكاء الاصطناعي

`
Client Component
    ↓ (Server Action / API route)
Server Action (src/actions/local-content/*)
    ↓
runGroundedLocalContentAI() (src/lib/local-content/workbook/rag-integration.ts)
    ↓  [builds LocalContentContext, enriches prompt]
runGovernedProductAI() (src/lib/platform/product-ai-bridge.ts)
    ↓  [RBAC check: enforce(), feature flag check: isProductAICoreEnabled()]
aiOrchestrator.generate() (src/lib/core/ai/orchestrator.ts)
    ↓  [provider selection: selectOptimalProvider() or selectProviderForTask()]
Provider (OpenAI / Anthropic / Cloud / Local / Deterministic)
`

---

## 3. Server-Side Only Verification — التحقق من جانب الخادم فقط

### Verification Method — طريقة التحقق

Each AI provider module was inspected for:
1. import "server-only" directive at top of file
2. Absence of "use client" directive
3. No export of key material to client components
4. No NEXT_PUBLIC_* wrapper for API keys

### Provider Files Inspection — فحص ملفات المزودين

| Provider | File | server-only | use client | Key Exposure Risk |
|----------|------|---------------|--------------|-------------------|
| OpenAI | src/lib/core/ai/providers/openai-provider.ts | ✅ Imported | ❌ None | **None** |
| Anthropic | src/lib/core/ai/providers/anthropic-provider.ts | ✅ Imported | ❌ None | **None** |
| Cloud | src/lib/core/ai/providers/cloud-provider.ts | ✅ Imported | ❌ None | **None** |
| Local | src/lib/core/ai/providers/local-provider.ts | ✅ Imported | ❌ None | **None** |
| Deterministic | src/lib/core/ai/providers/deterministic-provider.ts | ✅ Imported | ❌ None | **None** |
| Orchestrator | src/lib/core/ai/orchestrator.ts | ✅ import "server-only" | ❌ None | **None** |
| Product AI Bridge | src/lib/platform/product-ai-bridge.ts | ✅ import "server-only" | ❌ None | **None** |
| LCOS AI Advisor | src/lib/local-content/workbook/ai-advisor.ts | ✅ import "server-only" | ❌ None | **None** |
| LCOS AI Review | src/lib/local-content/workbook/ai-auto-review.ts | ✅ import "server-only" | ❌ None | **None** |
| RAG Integration | src/lib/local-content/workbook/rag-integration.ts | ✅ (via imports) | ❌ None | **None** |

### Client Bundle Scan — فحص حزمة العميل

`ash
# Verify no AI provider keys leak into client bundle
# This would fail if any NEXT_PUBLIC_ variant exists for provider keys
grep -r "NEXT_PUBLIC_AI\|NEXT_PUBLIC_OPENAI\|NEXT_PUBLIC_ANTHROPIC" src/
# Expected: No matches
`

### Env Variable Scan — فحص متغيرات البيئة

`ash
# Verify all AI provider env vars are server-only
# None should have NEXT_PUBLIC_ prefix
grep -c "^NEXT_PUBLIC_\(AI_\|OPENAI_\|ANTHROPIC_\)" .env.example
# Expected: 0
`

### Secret Exposure Prevention — منع تسرب الأسرار

| Rule | Status | Enforcement |
|------|--------|-------------|
| No AI keys in client bundle | ✅ Verified | server-only imports + no NEXT_PUBLIC_ wrappers |
| No AI keys in logs | ✅ Verified | console.info uses truncated metadata, never full keys |
| No AI keys in error messages | ✅ Verified | Errors return generic messages, not credential details |
| No AI keys in source control | ✅ Verified | .env.example contains placeholder values only |
| Keys in env vars only | ✅ Verified | Read from process.env at runtime, never hardcoded |

---

## 4. Provider Routing and Fallback — توجيه المزود والرجوع البديل

### Provider Selection Logic — منطق اختيار المزود

`
aiOrchestrator.generate()
    │
    ├── isEnabled("ai.real-providers")?
    │   ├── YES → selectOptimalProvider() or selectProviderForTask()
    │   │           ├── AI_PROVIDER=openai    → OpenAIProvider
    │   │           ├── AI_PROVIDER=anthropic → AnthropicProvider
    │   │           ├── AI_PROVIDER=cloud     → CloudAIProvider
    │   │           └── AI_PROVIDER=local     → LocalAIProvider
    │   └── NO  → DeterministicProvider (fallback)
    │
    └── On provider error → DeterministicProvider (emergency fallback)
`

### Fallback Chain — سلسلة الرجوع البديل

| Priority | Provider | Condition | LCOS Impact |
|----------|----------|-----------|-------------|
| 1 | Configured provider | FF_AI_REAL_PROVIDERS=true + valid API key | Full AI capabilities |
| 2 | Any other real provider | If preferred provider unavailable | Slightly different model |
| 3 | Deterministic | FF_AI_REAL_PROVIDERS=false OR all providers fail | Limited pattern suggestions |
| 4 | No AI (null) | isProductAICoreEnabled() returns false | Pipeline stages 7-8 skipped |

### Fallback Behavior Matrix — مصفوفة سلوك الرجوع البديل

| Scenario | FF_AI_REAL_PROVIDERS | API Key Present | Result |
|----------|------------------------|-----------------|--------|
| Normal operation | 	rue | ✅ Yes | Full AI with configured provider |
| No API key configured | 	rue | ❌ No | Provider init fails → wake-up message |
| Feature flags disabled | alse | ✅ Yes | Deterministic fallback — limited suggestions |
| API key invalid | 	rue | ❌ Invalid | Auth error → deterministic fallback |
| Network timeout | 	rue | ✅ Yes | Timeout → deterministic fallback |
| Rate limited | 	rue | ✅ Yes | 429 response → deterministic fallback (after retry) |

### LCOS-Specific Fallback Paths — مسارات الرجوع البديل الخاصة بـ LCOS

#### LCOS AI Advisor (i-advisor.ts)

`	ypescript
// In suggestPatternImprovements():
const groundedResult = await runGroundedLocalContentAI({ ... }).catch(() => null);

const governedResult = groundedResult?.result ?? null;
const aiOutput = governedResult?.output ?? "";

// If AI output is not valid, use reasonedFallback()
if (isValidPattern) {
  suggestedPattern = aiOutput;          // AI-suggested
} else {
  suggestedPattern = reasonedFallback(); // Deterministic fallback — regex adjustments
}
`

**Fallback result:** Pattern exclusions for known false positives + broader terms for unmatched accounts. Always produces a suggestion, just less sophisticated.

#### LCOS AI Auto-Review (i-auto-review.ts)

`	ypescript
// In runWorkbookAiReview():
// If calibration fails → skip calibration step, mark as partial
// If explanations fail → continue with 0 explanations
// If suggestions fail → continue with 0 suggestions
`

**Fallback result:** Pipeline completes with partial status. Review run logged with error details.

### Routing Security — أمان التوجيه

| Concern | Mitigation |
|---------|------------|
| External routing of sensitive data | All provider calls pass through governed bridge → audit logged |
| Data sent to wrong provider | Provider selected by configuration, never by user input |
| Prompt injection via TB data | 	askInput is structured JSON, query is truncated to 200 chars |
| Key material in prompt/response | Keys are never included in task input or prompt text |

---

## 5. Cross-Reference with Deployment Runbook — الإسناد الترافقي مع دليل النشر

### Environment Variables Cross-Reference — مرجع متغيرات البيئة

| Env Variable | AI Auth Review Status | Deployment Runbook Section | Required for LCOS AI? |
|-------------|----------------------|---------------------------|-----------------------|
| AI_PROVIDER | ✅ Server-only | §2 LCOS-Specific Environment Variables | ✅ Yes |
| OPENAI_API_KEY | ✅ Server-only, no client exposure | §2 AI Provider Configuration | ⚠️ Conditional (if AI_PROVIDER=openai) |
| ANTHROPIC_API_KEY | ✅ Server-only, no client exposure | §2 AI Provider Configuration | ⚠️ Conditional (if AI_PROVIDER=anthropic) |
| ANTHROPIC_MODEL | ✅ Server-only | §2 AI Provider Configuration | ⚠️ Conditional |
| AI_CLOUD_API_KEY | ✅ Server-only | §2 AI Provider Configuration | ⚠️ Conditional (if AI_PROVIDER=cloud) |
| AI_LOCAL_BASE_URL | ✅ Server-only (endpoint, not key) | §2 AI Provider Configuration | ⚠️ Conditional (if AI_PROVIDER=local) |
| AI_LOCAL_MODEL | ✅ Server-only | §2 AI Provider Configuration | ⚠️ Conditional |
| FF_AI_REAL_PROVIDERS | ✅ Feature flag, server-checked | §2 AI Provider Configuration | ✅ Required for real AI |
| FF_AI_RAG | ✅ Feature flag, server-checked | §2 AI Provider Configuration | ✅ Required for grounded AI |
| EMBEDDING_PROVIDER | ✅ Server-only | §2 AI Provider Configuration | Optional |
| VLLM_BASE_URL | ✅ Server-only (not LCOS-used) | Not in LCOS section | ❌ Not used by LCOS |

### Security Gates from Deployment Runbook — بوابات الأمان من دليل النشر

| Deployment Step | Security Gate | AI Auth Review Confirmation |
|----------------|---------------|----------------------------|
| Set FF_AI_REAL_PROVIDERS=true | Enable AI with real provider | ✅ Confirmed — required for AI features |
| Set OPENAI_API_KEY or ANTHROPIC_API_KEY | API key loaded server-side | ✅ Confirmed — never in client bundle |
| Run 
pm run build | Prisma generate + webpack build | ✅ Confirmed — build verifies server-only imports |
| Verify /api/health | AI provider reachable | ✅ Confirmed — health endpoint checks |
| Smoke test AI pipeline | AI suggestions with human review | ✅ Confirmed — governed bridge enforced |

### Recommended Security Checklist for Deployment — قائمة التحقق الأمنية الموصى بها للنشر

- [ ] FF_AI_REAL_PROVIDERS set to 	rue only when real API keys configured
- [ ] API keys stored in environment variables, never in code
- [ ] API keys have restricted permissions (read-only, specific model access)
- [ ] NEXT_PUBLIC_* prefix NOT used for any AI provider env vars
- [ ] All AI provider files include import "server-only" or equivalent
- [ ] Production API keys differ from development keys
- [ ] API key rotation schedule documented
- [ ] Budget/cost quotas configured at provider dashboard (if applicable)
- [ ] Audit logging enabled for all AI calls

---

## 6. Audit Trail and Sign-Off — سجل التدقيق والتوقيع

### AI Audit Events for LCOS — أحداث تدقيق الذكاء الاصطناعي لـ LCOS

Every AI action in LCOS is audited via createAiAuditEvent() or the platform-level writePlatformAuditLog():

| Audit Event | Trigger | Logged Fields |
|-------------|---------|---------------|
| i_review_completed | Workbook AI review run completes | organizationId, workbookId, ction, ctorId (pipeline-orchestrator or user), providerId, modelVersion, status, inputSummary (line count), outputSummary (explanations, suggestions, FPs), durationMs |
| i_review_failed | Workbook AI review fails | Same as above + error in outputSummary |
| product_ai_generation | Every unGovernedProductAI() call | productKey (localcontentos), useCase, esourceId, providerId, warningCount |
| pattern_suggestion_created | Pattern suggestion generated | organizationId, workbookId, suggestionCount |
| alse_positive_reviewed | False positive reviewed by human | matchReviewId, decision, eviewerId |
| pattern_suggestion_reviewed | Pattern suggestion approved/rejected | suggestionId, decision, eviewerId |
| pipeline.completed | Full pipeline run finishes | workbookId, projectId, stages, inalScore |

### Audit Log Verification — التحقق من سجل التدقيق

`ash
# Check audit events for LCOS AI activity
psql "" -c "
SELECT COUNT(*) FROM \"PlatformAuditLog\"
WHERE \"productKey\" = 'localcontentos'
  AND \"action\" LIKE '%ai%';
"

# View recent AI audit events
psql "" -c "
SELECT \"createdAt\", \"action\", \"status\", \"providerId\"
FROM \"PlatformAuditLog\"
WHERE \"productKey\" = 'localcontentos'
  AND \"action\" LIKE '%ai%'
ORDER BY \"createdAt\" DESC
LIMIT 20;
"

# Check for AI errors
psql "" -c "
SELECT \"createdAt\", \"action\", \"metadata\"->>'error'
FROM \"PlatformAuditLog\"
WHERE \"productKey\" = 'localcontentos'
  AND \"status\" = 'failed'
ORDER BY \"createdAt\" DESC
LIMIT 10;
"
`

### Review Sign-Off Sheet — نموذج التوقيع على المراجعة

| # | Check | Pass/Fail | Reviewer | Date | Notes |
|---|-------|-----------|----------|------|-------|
| 1 | All AI provider keys are server-side only |  |  |  |  |
| 2 | No NEXT_PUBLIC_* prefix for provider keys |  |  |  |  |
| 3 | server-only import present in all AI provider files |  |  |  |  |
| 4 | Provider routing documented (no silent fallback) |  |  |  |  |
| 5 | Fallback to deterministic when real providers disabled |  |  |  |  |
| 6 | Audit trail present for all AI actions |  |  |  |  |
| 7 | Human review required for all AI output |  |  |  |  |
| 8 | No autonomous decision path exists |  |  |  |  |
| 9 | API key rotation documented |  |  |  |  |
| 10 | Budget/cost quota configured (if applicable) |  |  |  |  |
| 11 | Cross-reference with deployment runbook complete |  |  |  |  |
| 12 | Deployment security checklist reviewed |  |  |  |  |

### Review Certification — شهادة المراجعة

| Field | Value |
|-------|-------|
| **Review ID** | AI-AUTH-LCOS-001 |
| **Product** | LocalContentOS under AQLIYA |
| **Review Date** | 2026-07-01 |
| **Reviewer** | (Human sign-off required) |
| **Approver** | (Human sign-off required) |
| **Next Review Due** | 2026-10-01 (quarterly) or on any AI provider change, whichever comes first |

**Certification statement:**
> I have reviewed the AI provider authentication configuration for LocalContentOS. All API keys are server-side only, provider routing follows governed rules with documented fallback behavior, and every AI action is audited. No autonomous decision paths exist. All AI output requires human review before action.

**Signature:** _________________________________ **Date:** _____________

---

## Appendix A — LCOS AI Entry Points — ملحق أ: نقاط دخول الذكاء الاصطناعي

| Entry Point | File | Provider Dependency |
|-------------|------|---------------------|
| unGroundedLocalContentAI() | src/lib/local-content/workbook/rag-integration.ts | All providers |
| unWorkbookAiReview() | src/lib/local-content/workbook/ai-auto-review.ts | All providers |
| suggestPatternImprovements() | src/lib/local-content/workbook/ai-advisor.ts | All providers (+ deterministic fallback) |
| explainAccountMatches() | src/lib/local-content/workbook/ai-advisor.ts | Deterministic (pattern-based) |
| calibrateWorkbookConfidence() | src/lib/local-content/workbook/ai-advisor.ts | Deterministic (industry memory based) |
| eviewFalsePositive() | src/lib/local-content/workbook/ai-advisor.ts | None (human decision only) |
| generateRecommendations() | src/lib/local-content/workbook/recommendation-engine.ts | All providers (via unGovernedProductAI) |

## Appendix B — Env Variable Security Classification — ملحق ب: تصنيف أمان متغيرات البيئة

| Classification | Variables | Storage Method |
|----------------|-----------|----------------|
| **Critical (Secret)** — Leak would allow unauthorized AI usage | OPENAI_API_KEY, ANTHROPIC_API_KEY, AI_CLOUD_API_KEY | Secrets manager / encrypted env |
| **Sensitive** — Leak would reveal configuration | AI_PROVIDER, AI_LOCAL_BASE_URL, AI_LOCAL_MODEL, AI_CLOUD_BASE_URL | Environment variables |
| **Public** — Safe to expose in error messages | AI_MODE, FF_AI_REAL_PROVIDERS, FF_AI_RAG | Feature flags |

## Appendix C — Provider Status Monitoring — ملحق ج: مراقبة حالة المزود

`ash
# Check AI provider health
curl http://localhost:3000/api/ai/providers
# Expected: JSON listing all configured providers with status

# Check LCOS AI pipeline health
curl http://localhost:3000/api/health/ready
# Expected: { "ok": true, "db": true, "redis": true }

# View AI audit log (from app)
curl http://localhost:3000/api/platform/audit-log?productKey=localcontentos&action_like=ai
`

---

## Related Resources — الموارد ذات الصلة

| Resource | Path |
|----------|------|
| Deployment Runbook | docs/runbooks/localcontentos-deployment-runbook.md |
| Disaster Recovery Plan | docs/runbooks/localcontentos-dr-plan.md |
| Operator Guide | docs/runbooks/localcontentos-operator-guide.md |
| AIOrchestrator | src/lib/core/ai/orchestrator.ts |
| Governed Product AI Bridge | src/lib/platform/product-ai-bridge.ts |
| LCOS RAG Integration | src/lib/local-content/workbook/rag-integration.ts |
| Feature Flag Registry | src/lib/platform/feature-flags/registry.ts |
| Architecture | docs/source-of-truth/AQLIYA_ARCHITECTURE.md |

---

## Document Record — سجل الوثيقة

| Item | Status |
|------|--------|
| Version | 1.0 |
| Date | 2026-07-01 |
| Author | Documentation Agent |
| Last Review | — |
| Security Classification | Internal — Do Not Share Externally |
| Production Claim | NO (review document) |
