# AQLIYA — OpenCode Independent Repository Review
**Date:** 2026-08-16  
**Auditor:** OpenCode Agent (Independent Engineering Review)  
**Repository:** `C:\Users\PC\Documents\Aqliya`  
**Commit:** HEAD (`c885f57d`)  
**Scope:** Full-stack, architecture, security, data, infrastructure, tests, documentation

---

## 1. Executive Summary

AQLIYA is a large, ambitious Next.js 16 monolith with ~180 Prisma models, 5,804 tests, and 169 application routes. The codebase demonstrates **mature architectural intent** — a unified audit log (`PlatformAuditLog`), structured logging, real Sentry integration, a working plugin registry, an event bus with retry/DLQ, and comprehensive CI/CD with automated rollback.

However, the **engineering reality diverges from the documented architecture** in several critical dimensions:

1. **The Platform Kernel is not product-agnostic.** It hardcodes AuditOS, LocalContentOS, and SalesOS plugins and contains dedicated product bridge files (`kernel/audit.ts`, `kernel/workflowos.ts`).
2. **A confirmed P0 cross-tenant file-write vulnerability** exists in SalesOS server actions where a client-supplied `organizationId` is persisted without server-side validation.
3. **Performance is a latent red flag:** 692 unbounded `prisma.findMany()` queries across the codebase, most without `.take()` or pagination, plus synchronous blocking AI provider calls in the request path.
4. **Documentation claims are overstated.** Official docs cite test counts that do not match reality (4,678 vs 5,691 vs 5,804) and claim "0 failures" while 2 tests fail on every run.
5. **Schema bloat is severe.** Approximately 64% of models (~115 of 179) are never seeded and appear to support L0-L2 shell features, creating maintenance and migration drag.

The repository is **conditionally buildable and mostly testable**, but it is **not production-hardened** due to the P0 security gap, unbounded query surface, and kernel architecture violations.

---

## 2. Repository Map

| Layer | Technology | Evidence |
|---|---|---|
| Framework | Next.js 16 (App Router) | `package.json`, `next.config.mjs` |
| Runtime | Node.js 22 (Docker alpine) | `Dockerfile` |
| Language | TypeScript 5 strict | `tsconfig.json`, `npx tsc --noEmit` PASS |
| Package Manager | npm | `package-lock.json` |
| Database | PostgreSQL 16 + pgvector | `prisma/schema.prisma`, `docker-compose.yml` |
| ORM | Prisma 7 | `@prisma/client` v7.8.0 |
| Auth | NextAuth v5 beta (Auth.js) | `next-auth` v5.0.0-beta.31 |
| Cache | Redis 7 (optional) / memory fallback | `src/lib/platform/cache-strategy.ts` |
| Queue | Bull (Redis-backed) | `bull` dependency |
| AI | Multi-provider (OpenAI, Anthropic, deterministic) | `src/lib/core/ai/orchestrator.ts` |
| UI | React 19, Tailwind CSS 4, shadcn/ui, Radix | `package.json` |
| i18n | next-intl (Arabic-first, RTL) | `i18n/request.ts` |
| Tests | Jest 30 + @swc/jest | `jest.config.js` |
| Infra | Terraform + AWS ECS/RDS/S3/CloudFront | `infra/terraform/` |
| CI/CD | GitHub Actions (CI + deploy + promote + backup) | `.github/workflows/` |

---

## 3. Scorecard

| Dimension | Rating | Evidence |
|---|---|---|
| **Architecture** | **AMBER** | Strong `src/core/` isolation, but kernel violates product independence doctrine. Event bus and plugin system are real. |
| **Platform Kernel** | **RED** | `bootstrap.ts` hardcodes 3 product plugins. `kernel/audit.ts` and `kernel/workflowos.ts` re-export hundreds of product-specific functions. Core AI handler registry imports from AuditOS. |
| **Product Boundaries** | **AMBER** | AuditOS and LocalContentOS are clean. SalesOS has a dual implementation (`src/lib/sales/` vs `src/lib/salesos/`). DecisionOS logic is scattered. Platform operations import from SalesOS. |
| **Authorization** | **AMBER** | Middleware matcher is comprehensive (40+ routes, role hierarchy, MFA gate). However, a P0 IDOR exists in SalesOS, and multiple P1 service-layer queries lack tenant scoping. |
| **Multi-tenancy** | **AMBER** | `organizationId` is present on most models, but not enforced at the database level (no RLS). Service layer has defensive gaps. Knowledge Foundation models lack tenant fields entirely. |
| **Database** | **AMBER** | 179 models, good FK indexing, but ~115 unseeded/dead models. A destructive migration dropped 6 audit tables without data migration. |
| **API** | **AMBER** | Well-structured route handlers, but knowledge-mining routes lack visible role checks. CRM webhook lacks portal/org filter. SCIM uses a single global API key. |
| **Frontend** | **GREEN** | Arabic-first, RTL, error/loading/not-found boundaries on all route segments. No giant .tsx files (>1000 lines). |
| **AI** | **AMBER** | Prompt sanitization, budget quotas, audit logging, and RAG tenant scoping are implemented. Synchronous blocking calls in request path. AI routes lack rate limiting. |
| **Security** | **AMBER** | No hardcoded secrets. Upload validation (magic bytes + ClamAV + SHA-256) is strong. Missing HSTS and Permissions-Policy headers. CSP is strict in production, permissive in dev/test. |
| **Testing** | **AMBER** | 5,804 tests, strong cross-tenant isolation tests (119 assertions). However, coverage thresholds are critically low (24% branches), 2 tests fail, and SalesOS unit tests are heavy on module mocks. |
| **Infrastructure** | **AMBER** | Terraform, Docker, and CI/CD are production-grade configurations. No evidence of live deployment or runtime verification in the repo. |
| **Observability** | **GREEN** | Structured logging (`createLogger`) used in 317+ locations. Real Sentry client/server/edge configs. Health endpoint checks DB + kernel + tracing. CloudWatch dashboards defined. |
| **Reliability** | **AMBER** | Sync AI calls and unbounded queries create timeout and memory risks. No visible circuit breaker pattern. |
| **Performance** | **RED** | 692 unbounded `findMany` queries. Synchronous AI orchestration. No pagination on audit log and interaction lists. |
| **Documentation** | **AMBER** | Extensive, but inconsistent test counts and false "0 failures" claims. PRODUCT_STATUS_MATRIX and README drift from code reality. |
| **Production Readiness** | **AMBER** | Build passes. Tests mostly pass. Pilot-ready for controlled environments. Not production-hardened due to P0 security gap and performance red flags. |

---

## 4. Finding Counts

| Severity | Count | Confirmed? |
|---|---|---|
| **P0** | **1** | **Confirmed** — SalesOS cross-tenant file write (client `organizationId` bypass) |
| **P1** | **12** | Confirmed — kernel violations, tenant gaps, webhook injection, sync AI, unbounded queries, destructive migration, missing headers, SCIM global key, etc. |
| **P2** | **6** | Confirmed — schema bloat, test drift, DecisionOS mock data, coverage thresholds, docs inconsistency |
| **P3** | **3** | Confirmed — dev CSP test failure, accounts redirect shell, v0.2 skipped tests |

---

## 5. Top 10 Risks (Ranked by Business / Technical Impact)

| Rank | Risk | Severity | Why It Matters |
|---|---|---|---|
| 1 | **SalesOS cross-tenant file write (IDOR)** | P0 | A user in Org A can write proof files scoped to Org B. Direct data breach vector. |
| 2 | **692 unbounded `findMany` queries** | P1 | Large tenants will cause memory exhaustion, request timeouts, and cascading failures. |
| 3 | **Synchronous AI calls block request threads** | P1 | AI provider degradation = complete platform request stalling. No queue offload visible. |
| 4 | **Kernel violates product independence** | P1 | Adding a new product requires editing kernel source. Prevents independent deployment and scaling. |
| 5 | **CRM webhook cross-tenant injection** | P1 | External system webhooks can be routed to the wrong organization, corrupting CRM data. |
| 6 | **Decision fetched before authorization** | P1 | Full decision object (with risks, tender profile, scenarios) loaded into memory before `enforce()` check. Defense-in-depth failure. |
| 7 | **Knowledge Foundation not tenant-scoped** | P1 | `KnowledgeFoundationVersion`, `Release`, `Diff` have no `organizationId`. Multi-tenant leakage. |
| 8 | **Schema bloat (115 dead models)** | P2 | Increases migration time, cognitive load, and risk of accidental data loss. |
| 9 | **Destructive audit-table migration without data migration** | P1 | `20260724232330_drop_deprecated_audit_models` drops 6 tables with `CASCADE` and no `INSERT...SELECT`. Historical audit data may be lost. |
| 10 | **Test coverage thresholds at 24%** | P2 | ~76% of code branches are unverified. A pilot-ready platform should not ship with this gap. |

---

## 6. Top 10 Required Actions

| # | Action | Wave | Owner |
|---|---|---|---|
| 1 | Fix SalesOS `organizationId` validation in `sales-agent-actions.ts` and `sales-actions/governance.ts` | Wave 0 | Security |
| 2 | Add `.take()` / pagination to all request-path `findMany` queries (start with audit log, interactions, deals) | Wave 0 | Performance |
| 3 | Wrap AI orchestrator calls with timeout + circuit breaker, or move to background queue | Wave 1 | Architecture |
| 4 | Remove product-specific imports from kernel (`audit.ts`, `workflowos.ts`, `register-handlers.ts`) | Wave 1 | Architecture |
| 5 | Add `organizationId` to Knowledge Foundation models and queries | Wave 1 | Data |
| 6 | Fix CRM webhook to filter by `portalId` + `organizationId` | Wave 0 | Security |
| 7 | Scope `getDecisionById` query to `organizationId` before fetching | Wave 0 | Security |
| 8 | Fix the 2 failing tests and raise Jest coverage thresholds to 50%+ branches | Wave 5 | QA |
| 9 | Remove hardcoded mock data from DecisionOS production page | Wave 3 | Product |
| 10 | Add HSTS + Permissions-Policy headers to `next.config.mjs` | Wave 0 | Security |

---

## 7. What Is Actually Ready

| Capability | Evidence | Rating |
|---|---|---|
| Build | `npm run build` passes, 169 static pages generated | ✅ Verified |
| TypeScript | `npx tsc --noEmit` 0 errors | ✅ Verified |
| AuditOS workspace | Real routes, Prisma mutations, evidence vault, TB upload, findings, review/approval, exports, 8 engines | ✅ Verified |
| LocalContentOS workspace | Real routes, supplier/spend CRUD, classification workflow, evidence, workbook engine, AI advisor, bilingual UX | ✅ Verified |
| SalesOS workspace | Real routes, deals, accounts, interactions, pipeline, governance review/approval, intelligence connectors, audit trail | ✅ Verified |
| DecisionOS workspace | Real routes, evidence, framework, scenarios, risks, bilingual PDF export, governance events | ✅ Verified (but mock data in UI) |
| RiskOS workspace | Real routes, risk models, assessments, procedures, interactive tracking | ✅ Verified |
| WorkflowOS workspace | Real routes, template/record CRUD, evidence upload, SLA monitoring, gated export | ✅ Verified |
| SAML SSO | Real SP metadata, AuthnRequest, assertion validation, AES-256-GCM encrypted secrets, 65 tests | ✅ Verified |
| Structured logging | `createLogger` used in 317+ locations, JSON output, trace injection | ✅ Verified |
| Health endpoint | DB + kernel + tracing checks, 200/503 semantics, no auth | ✅ Verified |
| Sentry | Client/server/edge configs, environment-gated, trace sampling | ✅ Verified |
| CI/CD | Type-check, tests, lint, build, license audit, secret scan, deploy, smoke, rollback | ✅ Verified |

---

## 8. What Is Not Ready

| Capability | Gap | Rating |
|---|---|---|
| Production-grade security | P0 IDOR + P1 tenant gaps in service layer | ❌ Not Ready |
| Production-grade performance | 692 unbounded queries + sync AI blocking | ❌ Not Ready |
| Product-independent kernel | Kernel hardcodes products and re-exports product internals | ❌ Not Ready |
| Test gate integrity | 2 failing tests, 24% branch coverage, heavy mocking | ❌ Not Ready |
| Live infrastructure verification | Terraform/CI are configured, but no runtime evidence in repo | ❌ Not Ready |
| External penetration test | Explicitly listed as "BLOCKING for production" and not yet done | ❌ Not Ready |
| Redis rate limiter activation | Code ready, env var not activated in staging/production | ❌ Not Ready |
| DecisionOS UI cleanliness | Hardcoded mock timeline/recent entities render unconditionally | ❌ Not Ready |
| SalesOS account list | Redirects to dashboard; comment says "until v0.1 list routes ship" | ❌ Not Ready |
| Schema pruning | ~115 dead models, no `@deprecated` markers | ❌ Not Ready |

---

## 9. What Is Claimed But Unproven

| Claim | Source | Verdict |
|---|---|---|
| "Zero product-to-product imports" | AGENTS.md §28, PRODUCT_STATUS_MATRIX | **VERIFIED** — No direct imports between `src/lib/audit/`, `src/lib/local-content/`, `src/lib/sales/`. |
| "4,678 tests pass, 0 failed test suites" | AGENTS.md §28 (2026-07-16) | **OUTDATED** — Current: 5,804 total, 2 failed, 27 skipped. |
| "5,691 tests PASS" | README (2026-07-25) | **FALSE** — Actual count is 5,804, and 2 fail. |
| "Security audit passed" | AGENTS.md §28 | **PARTIALLY VERIFIED** — Internal 8-area review done. External pen-test explicitly remains "BLOCKING for production" and is not evidenced. |
| "Rate limiting Redis-backed" | AGENTS.md §28 | **PARTIALLY VERIFIED** — Code exists, but `RATE_LIMITER=redis` not activated in staging/production per AGENTS.md "Remaining." |
| "CSP strict, no unsafe-eval" | AGENTS.md §28 | **PARTIALLY VERIFIED** — True in production. False in dev/test (causes test failure). |
| "Platform Health Score: 94, Test Failures: 0" | PRODUCT_STATUS_MATRIX | **FALSE** — Failures exist. Score methodology not transparent. |
| "SalesOS 878+ tests across 86 test files PASS" | PRODUCT_STATUS_MATRIX | **PARTIALLY VERIFIED** — Many pass, but 2 files are `describe.skip` (v0.2/vnext). Integration depth is low. |
| "LocalContentOS L5 Pilot-ready (100% readiness)" | README, AGENTS.md | **VERIFIED** — Real workspace, mutations, AI quality re-run, scoring, review/approval, seed data, bilingual export. |
| "AuditOS L5 pilot-ready" | README, AGENTS.md | **VERIFIED** — Real engagement, TB, mapping, statements, notes, evidence, findings, review, approval, exports, 8 engines. |

---

## 10. Recommended Execution Waves

| Wave | Focus | Scope | Blocking? |
|---|---|---|---|
| **Wave 0** | P0 Security / Data / Authorization | Fix SalesOS IDOR, CRM webhook tenant filter, decision query scoping, add HSTS/Permissions-Policy, scope kernel `findUnique` queries | **YES** |
| **Wave 1** | Architecture & Performance | Add pagination to top 50 unbounded queries, wrap AI calls with timeout/circuit breaker, decouple kernel from product barrels | **YES** |
| **Wave 2** | Platform Kernel | Refactor `kernel/audit.ts` and `kernel/workflowos.ts` into product-side adapters; make `bootstrap.ts` config-driven | No |
| **Wave 3** | Product Boundaries | Resolve SalesOS dual implementation; unify DecisionOS into single directory; remove DecisionOS mock data | No |
| **Wave 4** | Reliability / Infrastructure | Activate Redis rate limiter, deploy ClamAV daemon, verify ECS/RDS/Redis live state, run backup restore drill | No |
| **Wave 5** | Testing | Fix 2 failing tests, raise coverage thresholds, add integration tests for SalesOS CRUD end-to-end flows | No |
| **Wave 6** | Product Completion | Ship SalesOS accounts list, de-stub signals, prune schema dead models, add `@deprecated` to L0 tables | No |
| **Wave 7** | Production Verification | External penetration test, SOC2 gap assessment, ISO 27001 gap assessment, runtime load test | **YES** |

---

*This document is an independent OpenCode repository review. It does not modify application behavior. All findings are backed by code evidence from the repository at the time of audit.*
