# 58e4021 Review Pack — Platform Risk Assessment

**Commit:** `58e4021` — `chore(auditos): integrate factory with core platform and CI`  
**Branch:** `auditos/factory-memory-2026-06`  
**PR:** [#5](https://github.com/ragheed-AQLIYA/aqliya-platform/pull/5)  
**Date:** 2026-06-15  
**Purpose:** Isolate **Platform Risk** from **AuditOS Risk** before Tier 1 / migration / staging review  
**Scope:** Read-only analysis — no code movement

---

## Executive Summary

| Question | Answer |
|----------|--------|
| Is AuditOS factory code in this commit? | **Yes, but small** — 8 files, +778 LOC (~2.3%) |
| Is most of this commit platform scope? | **Yes** — 172 platform/integration files, +32,657 LOC (~96%) |
| Can it break non-AuditOS surfaces? | **Yes** — middleware RBAC, AI routing, integration resolver, new routes |
| Required for AuditOS factory pilot? | **Partially** — AuditOS intelligence bridge yes; most Platform L0 modules **no** |
| Can it be split later? | **Yes** — documented in `docs/recovery/PR_DECOMPOSITION.md` |

**Reviewer focus:** Treat this commit as **two PRs in one**:

1. **Factory integration slice** (AuditOS intelligence, Cypress, env flags, middleware `/audit` RBAC) — **keep**
2. **Platform L0 expansion** (vault, ABAC, sampling, content-studio, etc.) — **review last or split**

---

## Risk Matrix (by Area)

| Area | Files | +LOC | −LOC | Risk | Breaks non-AuditOS? |
|------|-------|------|------|------|---------------------|
| **Auth** | 2 | 84 | 35 | **High** | Login UX / session edge cases |
| **Middleware** | 2 | 97 | 3 | **High** | **All protected routes** — 403/redirect |
| **Routing** | 1 | 5 | 0 | **Low** | One marketing redirect only |
| **AI Infrastructure** | 27 | 1,354 | 97 | **High** | All AI-assisted features platform-wide |
| **Integration** | 21 | 4,504 | 0 | **High** | Provider resolution, secrets, failover |
| **Platform L0** | 85 | 23,153 | 0 | **Medium** | New modules — mostly additive if unused |
| **Governance** | 6 | 123 | 1 | **Medium** | Retrieval / approval display helpers |
| **AuditOS** | 8 | 778 | 3 | **Low** | Factory intelligence only |
| **LocalContent** | 18 | 1,671 | 3 | **Medium** | ERP connectors + verification UI |
| **AI Settings UI** | 3 | 377 | 0 | **Medium** | Settings page for AI mode |
| **Monitoring UI** | 4 | 264 | 0 | **Low** | Dashboard cards |
| **CI/Config** | 3 | 46 | 1 | **Medium** | CI now runs `npm test` + `lint` |
| **Tests** | 6 | 627 | 19 | **Low** | Test-only |
| **Documentation** | 19 | 291 | 104 | **Low** | Docs sync |
| **Marketing/Docs** | 5 | 455 | 582 | **Low** | Copy/redirect content |
| **Other** | 3 | 226 | 142 | **Medium** | workflow-gating, i18n test tweak |
| **TOTAL** | **213** | **34,055** | **990** | — | — |

---

## High-Risk Files — Detailed Review

### Auth (2 files, +84 / −35)

#### `src/lib/auth-config.ts` (+3 / −1)

| Field | Detail |
|-------|--------|
| **Purpose** | NextAuth v5 config — credentials + OAuth, JWT session |
| **Why changed** | Minor session/token alignment (co-authored integration pass) |
| **Could break?** | **Low** — 4-line delta; login flow largely unchanged |
| **Rollback impact** | Revert auth-config only if login regressions appear |
| **Split later?** | No — too small to split |

#### `src/app/login/page.tsx` (+81 / −34)

| Field | Detail |
|-------|--------|
| **Purpose** | Login UI — credentials form, error states |
| **Why changed** | UX/copy and layout adjustments during platform integration |
| **Could break?** | **Medium** — all users hit this page; test login smoke |
| **Rollback impact** | Revert page only; auth-config unaffected |
| **Split later?** | Yes — independent of AuditOS factory |

---

### Middleware (2 files, +97 / −3) — **HIGHEST OPERATIONAL RISK**

#### `src/middleware.ts` (+94 / −1)

| Field | Detail |
|-------|--------|
| **Purpose** | Edge auth gate, rate limit, MFA check, **new RBAC route map** |
| **Why changed** | Add `routeMinRoles` for `/audit`, `/api/audit`, `/api/ai`, `/api/scim`, `/content-studio`, `/sampling`, etc.; enforce role hierarchy at edge; fix `getToken` salt |
| **Could break?** | **HIGH** — viewer users blocked from admin routes (expected); **false 403** if role names mismatch DB; new matcher paths may intercept routes not intended |
| **Rollback impact** | Removing RBAC block restores pre-commit access model; AuditOS still has server-side guards |
| **Split later?** | **Partially** — `/audit` entries needed for factory; other prefixes could move to platform PR |

**Key additions to verify in staging:**

```text
routeMinRoles: /audit → viewer, /api/audit → viewer, /monitoring → admin, /api/scim → admin
Role check: insufficient → 403 (API) or /access-denied (pages)
getToken salt: "authjs.session-token"
New matcher paths: /contacts, /content-studio, /risk, /office-ai, /sampling, /settings/audit-bridge, /api/integration
```

**Staging smoke:**

- [ ] `admin@aqliya.com` → `/audit/*` — OK
- [ ] `viewer` role → `/audit/*` — OK
- [ ] `viewer` role → `/monitoring` — redirect/deny expected
- [ ] `/auditos/*` — still public (unchanged publicPrefixes)

#### `src/middleware-security.ts` (+3 / −2)

| Field | Detail |
|-------|--------|
| **Purpose** | Security headers (CSP, X-Frame-Options, etc.) |
| **Why changed** | Minor header tweak |
| **Could break?** | **Low** — CSP too strict could block assets; check browser console |
| **Rollback impact** | Isolated |
| **Split later?** | Yes |

---

### Routing (1 file, +5 / −0)

#### `next.config.mjs` (+5 / −0)

| Field | Detail |
|-------|--------|
| **Purpose** | Next.js config — redirects, standalone output, Sentry |
| **Why changed** | Add permanent redirect `/buyers/procurement` → `/procurement-pack` |
| **Could break?** | **Low** — marketing link only |
| **Rollback impact** | Old URL 404 if bookmarked |
| **Split later?** | Yes |

---

### AI Infrastructure (27 files, +1,354 / −97) — **HIGH**

| File | +LOC | Purpose | Could break? | Split? |
|------|------|---------|--------------|--------|
| `src/lib/ai/hybrid-router.ts` | +78 | Task-level local/cloud routing (`AI_MODE`, org policy) | **High** if `AI_MODE=hybrid` without Ollama | Partial — factory uses for TB classification |
| `src/lib/ai/orchestrator.ts` | +62/−9 | AI task orchestration — calls providers | **High** — all AI features | Partial |
| `src/lib/ai/generate.ts` | +79 | Generate facade | Medium | Yes |
| `src/lib/ai/observability.ts` | +57 | AI call metrics/logging | Low | Yes |
| `src/lib/ai/runtime/inference-service.ts` | +57 | Inference abstraction | Medium | Yes |
| `src/lib/ai/providers/ai-provider-factory.ts` | +114 | Factory for cloud/local/anthropic providers | **High** | Partial |
| `src/lib/ai/providers/llm-http-client.ts` | +145 | HTTP client for LLM endpoints | Medium | Yes |
| `src/lib/ai/providers/local-provider.ts` | +80/−24 | Ollama/local inference | **High** if local URL wrong | Yes |
| `src/lib/ai/providers/cloud-provider.ts` | +45/−32 | OpenAI-compatible cloud | Medium | Yes |
| `src/lib/ai/providers/anthropic-provider.ts` | +48/−17 | Anthropic API | Medium | Yes |
| `src/lib/ai/handlers/disclosure-enrichment-handler.ts` | new | Disclosure AI handler registration | Low if flag off | Yes |
| `src/lib/ai/handlers/register-handlers.ts` | changed | Handler registry | Low | Yes |
| `src/lib/ai/intelligence-runtime.ts` | changed | Intelligence runtime wiring | Medium | Partial |
| `src/lib/ai/model-registry.ts` | changed | Model registry | Low | Yes |
| `src/lib/ai/prompt-registry.ts` | changed | Prompt registry | Low | Yes |
| `src/lib/ai/provider-router-constants.ts` | changed | Router constants | Low | Yes |
| `src/lib/ai/providers/provider-circuit-breaker.ts` | changed | Circuit breaker | Medium | Yes |
| `src/lib/ai/__tests__/*` (8 files) | +600 | Unit tests for above | N/A | Yes |

**Why changed:** ADR-001 hybrid AI runtime — cloud/local/hybrid for TB classification and assistive tasks.

**Rollback impact:** Revert `src/lib/ai/*` — AuditOS TB intelligence may fall back to rules-only if hybrid disabled.

**Factory dependency:** `hybrid-router.ts` + provider factory used when `FF_AI_REAL_PROVIDERS=true` and Shalfa validation scripts run hybrid mode.

---

### Integration (21 files, +4,504 / −0) — **HIGH**

| File | +LOC | Purpose | Could break? | Split? |
|------|------|---------|--------------|--------|
| `src/lib/integration/secret-resolver.ts` | +686 | Resolve API keys from env/vault with rotation | **High** — wrong key = AI/integration failures | Yes |
| `src/lib/integration/failover-engine.ts` | +432 | Provider failover logic | Medium | Yes |
| `src/lib/integration/provider-registry.ts` | +341 | Register ERP/CRM/AI/storage providers | Medium | Yes |
| `src/lib/integration/types.ts` | +377 | Integration type definitions | Low | Yes |
| `src/lib/integration/resolver.ts` | +249 | Resolve active provider per org | **High** | Yes |
| `src/lib/integration/factory-registry.ts` | +246 | Factory for adapters | Medium | Yes |
| `src/lib/integration/health-runtime.ts` | +227 | Integration health checks | Low | Yes |
| `src/lib/integration/circuit-alerts.ts` | +192 | Circuit breaker alerts | Low | Yes |
| `src/lib/integration/metrics.ts` | +137 | Integration metrics | Low | Yes |
| `src/lib/integration/adapters/erp-adapter.ts` | +128 | ERP adapter interface | Medium — LocalContent | Yes |
| `src/lib/integration/adapters/crm-adapter.ts` | +125 | CRM adapter | Medium — SalesOS | Yes |
| `src/lib/integration/adapters/storage-adapter.ts` | +118 | Storage adapter | Medium | Yes |
| `src/lib/integration/index.ts` | +95 | Public integration API | Medium | Yes |
| `src/lib/integration/__tests__/*` (6 files) | +900 | Integration tests | N/A | Yes |

**Why changed:** Platform integration layer for multi-provider AI, ERP, secrets — bundled with factory program.

**Rollback impact:** Revert entire `src/lib/integration/*` if resolver causes runtime errors; AuditOS factory core (non-AI) still works.

**AuditOS coupling:** Indirect — TB hybrid classification uses AI providers resolved through this stack when enabled.

---

## Platform L0 (85 files, +23,153) — Module Groups

All modules under `src/lib/platform/*` are **additive** (new files). Risk is **Medium** unless routes/UI expose them in production navigation.

| Module | Files | +LOC | Purpose | Could break? | Split? |
|--------|-------|------|---------|--------------|--------|
| `sales-intelligence` | 4 | 1,820 | Sales intel service + tests | Low — unused routes | **Yes** |
| `content-studio` | 4 | 1,740 | Content studio service | Low — shell routes | **Yes** |
| `audit-bridge` | 4 | 1,616 | Cross-product audit bridge | Medium | **Yes** |
| `audit-risk` | 4 | 1,599 | Audit risk engine | Low | **Yes** |
| `org-advanced` | 5 | 1,573 | Advanced org admin | Medium if settings linked | **Yes** |
| `institutional-memory` | 3 | 1,490 | Institutional memory service | Low — not AuditOS firm memory | **Yes** |
| `office-ai-adv` | 4 | 1,313 | Advanced office AI | Low | **Yes** |
| `secrets` (vault) | 7 | 1,255 | Vault encryption + rotation | **High** if wired to prod secrets | **Yes** |
| `abac` | 4 | 1,252 | Attribute-based access control | Medium | **Yes** |
| `cross-product-ai` | 3 | 1,245 | Cross-product AI orchestration | Medium | **Yes** |
| `sampling` | 4 | 1,230 | Audit sampling engine | Low — `/sampling` route | **Yes** |
| `access` (RBAC/SOD) | 5 | 1,222 | RBAC + separation of duties | Medium | **Yes** |
| `decision-gov` | 4 | 1,114 | Decision governance service | Low | **Yes** |
| `audit` (hash-chain) | 7 | 1,035 | Platform audit store + hash chain | Medium | **Yes** |
| `encryption` | 6 | 920 | Field-level encryption | **High** if enabled | **Yes** |
| `model-governance` | 3 | 779 | Model governance registry | Low | **Yes** |
| `storage` (S3) | 4 | 720 | S3 storage provider | Medium — uploads | **Yes** |
| `download` | 5 | 653 | Download gate/handler | Medium — export paths | Partial |
| `notification` | 3 | 393 | Email factory | Low | **Yes** |
| `feature-flags` | 1 | 143 | Feature flag registry | Medium — toggles factory flags | Partial |
| `bootstrap.ts` | 1 | 41 | Platform bootstrap init | Low | Partial |

**Note:** `src/lib/platform/institutional-memory` ≠ AuditOS **Firm Memory** (`src/lib/tb-intelligence/firm-memory.ts`). Different systems.

---

## AuditOS Slice (8 files, +778) — **LOW RISK**

| File | +LOC | Purpose | Could break? | Split? |
|------|------|---------|--------------|--------|
| `src/lib/audit/intelligence/intelligence-engine.ts` | +173 | Audit intelligence engine for factory | Low | No — core factory |
| `src/__tests__/integration/tb-upload-mapping-fs.integration.test.ts` | +277 | TB upload → mapping → FS integration test | N/A | No |
| `cypress/e2e/audit-factory.cy.ts` | +88 | E2E audit factory smoke | N/A | No |
| `src/lib/audit/intelligence/enrichment-builder.ts` | +80 | Enrichment builder | Low | No |
| `src/lib/audit/intelligence/__tests__/intelligence.test.ts` | +80 | Unit tests | N/A | No |
| `src/lib/audit/intelligence/types.ts` | +39 | Types | Low | No |
| `src/lib/audit/intelligence/index.ts` | +32 | Barrel export | Low | No |
| `src/lib/audit/__tests__/audit-ai-bridge.test.ts` | +9/−3 | AI bridge test update | N/A | No |

**Verdict:** Safe to merge with factory PR — this is the actual AuditOS integration intent of the commit message.

---

## CI / Config Changes

### `.github/workflows/ci.yml` (+4 / −1)

| Field | Detail |
|-------|--------|
| **Purpose** | CI pipeline on push to main/staging |
| **Why changed** | Add `npm test` and `npm run lint` before build |
| **Could break?** | **Medium** — CI may fail on pre-existing lint/test issues |
| **Rollback impact** | CI becomes tsc + build only again |
| **Split later?** | Yes |

### `.env.example` (+26)

| Field | Detail |
|-------|--------|
| **Purpose** | Document new env vars for AI mode, feature flags |
| **Why changed** | Factory feature flags (`FF_AUDIT_*`), hybrid AI vars |
| **Could break?** | **Low** — example only; production needs explicit env |
| **Rollback impact** | Docs drift |
| **Split later?** | No — useful for factory deploy |

**New factory-relevant flags:**

```text
FF_AUDIT_FS_V2, FF_AUDIT_REPORTING_GRAPH, FF_AUDIT_RECONCILIATION,
FF_AUDIT_IFRS_RULES, FF_AUDIT_SOCPA_RULES, FF_AUDIT_DISCLOSURE_AUTO,
FF_AUDIT_APPROVAL_GATES, FF_AUDIT_MIND_MAP, FF_AUDIT_INTELLIGENCE
AI_MODE, FF_AI_REAL_PROVIDERS
```

---

## Reviewer Decision Framework

Answer these five questions (from CTO review plan):

| # | Question | Finding |
|---|----------|---------|
| 1 | Changes outside AuditOS? | **YES** — ~96% of LOC is platform/integration/AI |
| 2 | Touches auth? | **YES** — login page + auth-config (minor) |
| 3 | Touches routing? | **YES** — middleware RBAC + matcher expansion + one redirect |
| 4 | Touches general AI infrastructure? | **YES** — 27 AI files + 21 integration files |
| 5 | Can split later if reviewer rejects part? | **YES** — see split map below |

### If reviewer accepts full commit

- Merge PR #5 as-is after staging gate passes
- Monitor middleware 403 rates and AI provider errors post-deploy

### If reviewer rejects platform slice

**Revert-only paths (no history rewrite needed for future PR):**

```text
git revert 58e4021   # nuclear — also removes AuditOS intelligence slice
```

**Preferred split (future branch `platform/l0-integration-modules`):**

| Keep in factory PR | Move to platform PR |
|--------------------|---------------------|
| `src/lib/audit/intelligence/*` | `src/lib/platform/*` (all 85 files) |
| `cypress/e2e/audit-factory.cy.ts` | `src/lib/integration/*` (except if factory needs resolver) |
| `tb-upload-mapping-fs.integration.test.ts` | Platform L0 UI shells (`content-studio`, `sampling`, etc.) |
| `.env.example` factory flags | `sales-intelligence`, `content-studio`, `office-ai-adv` |
| Middleware `/audit` + `/api/audit` RBAC entries only | Middleware entries for `/content-studio`, `/risk`, `/sampling`, etc. |
| `hybrid-router.ts` + minimal provider factory | Full vault, ABAC, encryption modules |

**Cost of split:** Requires interactive rebase or cherry-pick — **not trivial** after push. For PR #5, practical options are:

1. **Accept** with documented platform debt
2. **Block merge** until platform slice extracted to follow-up PR (rebase required)

---

## Staging Verification Checklist (post-merge or pre-merge on staging branch)

After deploy, verify **Platform Risk** did not break AuditOS:

```bash
npx prisma migrate deploy
npm run build
TB_FILE="/path/to/pilot-tb.xlsx" npm run shalfa:validate
```

| Check | Expected |
|-------|----------|
| Login as admin | OK |
| `/audit/engagements/eng-shalfa-2025` | 200, not 403 |
| `/auditos/*` | Public, no auth |
| Factory Accuracy | ≈ 94 |
| Viewer → `/monitoring` | Denied (403 or redirect) |
| Build | PASS |

---

## Recommended Review Order (Tomorrow)

```text
08:00  This pack — 58e4021 platform risk
09:00  Migration walkthrough (separate doc — Tier 1)
11:00  Tier 1 AuditOS code review (commits 3e80fab–71ac7a4)
14:00  Staging deploy + shalfa:validate
```

---

## Related Documents

| Doc | Purpose |
|-----|---------|
| `docs/recovery/PR_DECOMPOSITION.md` | File-level decomposition + split recommendation |
| `docs/recovery/POST_SANITIZATION_AUDIT.md` | R1 GREEN verdict + push status |
| `docs/recovery/MIGRATION_AUDIT.md` | 7 migrations apply order |
| `docs/AUDITOS_PROGRAM_STATUS.md` | Program matrix |

---

## Reviewer Sign-Off (fill in)

| Reviewer | Date | 58e4021 Verdict | Notes |
|----------|------|-----------------|-------|
| | | ☐ Accept ☐ Accept with conditions ☐ Split required ☐ Reject | |

**Conditions if "Accept with conditions":**

- [ ] Middleware RBAC smoke passed on staging
- [ ] No unexpected 403 on `/audit/*` for viewer role
- [ ] Platform L0 modules documented as L4 shells in PRODUCT_STATUS_MATRIX
- [ ] Follow-up PR opened for platform split (optional)

---

*Generated for PR #5 Release Review — Feature Freeze active. No new features until merge gate passes.*
