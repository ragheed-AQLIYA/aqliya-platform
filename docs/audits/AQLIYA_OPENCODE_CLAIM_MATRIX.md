# AQLIYA — OpenCode Claim / Evidence Matrix
**Date:** 2026-08-16  
**Methodology:** For each major claim found in authoritative documentation, we inspect code, tests, and runtime evidence. Verdicts are: **VERIFIED**, **PARTIALLY_VERIFIED**, **UNVERIFIED**, **FALSE**, **OUTDATED**, **DOCUMENTED_ONLY**.

---

| # | Claim | Source | Code Evidence | Test Evidence | Runtime Evidence | Verdict |
|---|---|---|---|---|---|---|
| 1 | **LocalContentOS L5 Pilot-ready** | README, PRODUCT_STATUS_MATRIX, AGENTS.md | Real workspace at `/local-content/*`, server-action mutations, supplier/spend CRUD, classification workflow, evidence upload, workbook engine, AI advisor, bilingual PDF export, tender matching, review/approval, 15+ schema models actively used | 321+ tests, cross-tenant isolation tests pass, integration tests touch real DB | Build passes. Real routes rendered. | **VERIFIED** |
| 2 | **AuditOS L5 Pilot-ready** | README, PRODUCT_STATUS_MATRIX, AGENTS.md | Real engagement management, TB upload, account mapping, financial statements, notes, evidence vault, findings, review, approval, exports, 8 engines (ISQM1, Materiality, Client Acceptance, Independence, Working Papers, Review Notes SLA, Sampling, Knowledge), 45+ schema models actively used | 3,909 tests, cross-tenant tests, validation runs | Build passes. Real routes rendered. | **VERIFIED** |
| 3 | **SalesOS L5 Pilot-ready (internal only)** | README, PRODUCT_STATUS_MATRIX | Real routes, deals, accounts, interactions, pipeline, governance review/approval, intelligence connectors, audit trail. 10 schema models actively used. | 878 tests across 86 files (2 are `describe.skip` v0.2/vnext) | Build passes. Real routes rendered. | **PARTIALLY_VERIFIED** — accounts list is a redirect shell; signals are stubbed; P0 IDOR exists |
| 4 | **DecisionOS L5 conditional** | README, PRODUCT_STATUS_MATRIX | Real routes, evidence, framework, scenarios, risks, tender profile, bilingual PDF export, governance events. 20+ schema models. | 110+ tests | Build passes. **BUT** production page renders hardcoded mock data unconditionally. | **PARTIALLY_VERIFIED** — workflow is real, UI polluted by mock data |
| 5 | **RiskOS L5 conditional** | README, PRODUCT_STATUS_MATRIX | Real dashboard, risk models, assessments, procedures, interactive tracking. | Tests exist | Build passes. | **VERIFIED** |
| 6 | **WorkflowOS L5 conditional** | README, PRODUCT_STATUS_MATRIX | Template/record CRUD, evidence upload, SLA monitoring, gated PDF export. | 44 tests | Build passes. | **VERIFIED** |
| 7 | **Zero product-to-product imports** | AGENTS.md §28, PRODUCT_STATUS_MATRIX | Grep confirms zero `import` between `src/lib/audit/`, `src/lib/local-content/`, `src/lib/sales/` domains. | Cross-tenant isolation tests verify product boundaries | Build compiles without product circular deps. | **VERIFIED** |
| 8 | **Platform Kernel 2.0 — all consumers import from `@/lib/kernel`** | AGENTS.md §28 (Sprint 7) | 697 files migrated. Kernel barrel expanded with auth, cache, feature-flags, prisma re-exports. | Tests for kernel modules pass | Build passes. | **VERIFIED** — but kernel itself contains product-specific bridges |
| 9 | **Product independence — kernel does not know products** | AGENTS.md §28 (Sprint 9) | Kernel `bootstrap.ts` hardcodes 3 product plugins. `kernel/audit.ts` and `kernel/workflowos.ts` re-export product internals. | N/A | N/A | **FALSE** — kernel directly knows products |
| 10 | **EventBusWrapper: dead letter queue, retry, history** | AGENTS.md §28 (Sprint 9) | `src/lib/kernel/events/event-bus-wrapper.ts` implements retry, DLQ, history, replay. 16/16 tests pass. | `src/__tests__/unit/kernel/event-bus.test.ts` passes | N/A | **VERIFIED** |
| 11 | **4,678 tests pass, 0 failed test suites** | AGENTS.md §28 (2026-07-16) | Current test suite has 5,804 tests. | 2 tests fail on every run (`security-headers.test.ts`, `migration-evidence.test.ts`). 27 skipped. | `npm test` output | **OUTDATED / FALSE** |
| 12 | **5,691 tests PASS** | README (2026-07-25) | Current count is 5,804. 2 failures exist. | 2 failures exist. | `npm test` output | **FALSE** |
| 13 | **Platform Health Score: 94, Test Failures: 0** | PRODUCT_STATUS_MATRIX | No transparent score methodology found in code. | 2 tests fail. | `npm test` output | **FALSE** |
| 14 | **Security audit passed** | AGENTS.md §28 (Sprint 10) | Internal 8-area review completed: secrets, SQL injection, unsafe patterns, CORS, rate limiting, CSP, auth, env vars. | Tests for security headers, rate limit, auth guards exist and mostly pass | Build passes. | **PARTIALLY_VERIFIED** — internal review done, but external pen-test explicitly listed as "BLOCKING for production" and not yet evidenced |
| 15 | **SAML SSO implementation** | README, PRODUCT_STATUS_MATRIX | Real SP metadata route, AuthnRequest generation, assertion validation, session cookie. `@node-saml/node-saml` package. AES-256-GCM encryption for `clientSecret`. | 65 tests in `sso-flow.test.ts` pass | Routes exist in build output. | **VERIFIED** |
| 16 | **Rate limiting Redis-backed** | AGENTS.md §28 | `redis-rate-limiter.ts` and `redis-provider.ts` exist. Memory fallback is default. `RATE_LIMITER=redis` env var required. | Rate limit tests pass | Code exists but env activation not evidenced | **PARTIALLY_VERIFIED** — code ready, not live-proven |
| 17 | **CSP strict, no unsafe-eval** | AGENTS.md §28 | Production CSP: `script-src 'self'` only. | `security-headers.test.ts` fails because dev/test CSP includes `unsafe-eval` and `unsafe-inline` | Build passes. | **PARTIALLY_VERIFIED** — true in prod, false in dev/test |
| 18 | **Structured logging active** | AGENTS.md §28 (Post-hardening) | `src/lib/observability/logger.ts` factory. 193 imports in `src/lib/`, 124 in `src/actions/`. | Logger tests pass | Build passes. Logs visible in build output. | **VERIFIED** |
| 19 | **Health endpoint** | AGENTS.md §28 | `src/app/api/platform/health/route.ts` checks DB + kernel + tracing. Returns 200/503. No auth. | Health tests pass | Route exists in build output. | **VERIFIED** |
| 20 | **Sentry integration** | AGENTS.md §28 | Client/server/edge configs wired. 20% trace sampling in production. | Sentry config tests pass | Config files exist. | **VERIFIED** |
| 21 | **0 `as any` in production code** | AGENTS.md §28 | 4 documented escapes in production code: `sales/prisma-repository/common.ts`, `decision/intelligence-gate.ts` | N/A | `grep "as any" src/lib/...` | **FALSE** — 4 documented escapes exist |
| 22 | **All workspace routes SECURE** | AGENTS.md §28 (Sprint 10) | Middleware matcher covers 40+ patterns. `routeMinRoles` map exists. | Auth guard tests pass | Build passes. | **PARTIALLY_VERIFIED** — middleware is comprehensive, but P0 IDOR and P1 service gaps exist inside the perimeter |
| 23 | **Prompt sanitization implemented** | AGENTS.md §28 | `src/lib/security/prompt-sanitization.ts` strips injection attempts. Orchestrator calls `sanitizeTaskInput()`. | Sanitization tests pass | Build passes. | **VERIFIED** |
| 24 | **Dashboard cache wiring** | AGENTS.md §28 | All 5 dashboard server actions use `getCachedOrFetch` with 5-min TTL. | Cache tests pass | Build passes. | **VERIFIED** |
| 25 | **Pagination standardization** | AGENTS.md §28 | All server actions return `{ items, totalCount, hasMore }`. | Pagination tests pass | Build passes. | **PARTIALLY_VERIFIED** — dashboard actions are paginated, but 692 unbounded `findMany` queries exist elsewhere |
| 26 | **Build passes, 0 TS errors** | README, AGENTS.md | `npx tsc --noEmit` passes. `npm run build` generates 169 static pages. | N/A | Build log confirms success. | **VERIFIED** |
| 27 | **Node.js 22 aligned** | AGENTS.md §28 | `Dockerfile` uses `node:22-alpine`. `package.json` engines allow `<=24.x`. | N/A | Build passes on Node 22. | **VERIFIED** |
| 28 | **Terraform / AWS IaC defined** | AGENTS.md §28 | `infra/terraform/` has modules for networking, database, compute, storage, monitoring. | N/A | No `.terraform/` state or live evidence in repo. | **DOCUMENTED_ONLY** — defined but not runtime-verified |
| 29 | **CloudWatch dashboards and alarms** | AGENTS.md §28 | Terraform `modules/monitoring/` defines 4 dashboards, 5 alarms, 2 log groups. | N/A | No live AWS evidence in repo. | **DOCUMENTED_ONLY** |
| 30 | **SalesOS intelligence connectors (Apollo, Ocean, Clay, SmartLead, LinkedIn)** | PRODUCT_STATUS_MATRIX | Connector classes with base URLs, retry logic, OAuth PKCE. Factory registry. Webhook receiver. | Connector tests pass | Build passes. | **VERIFIED** |

---

## Summary of Verdicts

| Verdict | Count |
|---|---|
| **VERIFIED** | 14 |
| **PARTIALLY_VERIFIED** | 9 |
| **FALSE** | 4 |
| **OUTDATED** | 2 |
| **DOCUMENTED_ONLY** | 2 |
| **UNVERIFIED** | 0 |

**Key Takeaway:** The codebase has a strong foundation of verified capabilities (AuditOS, LocalContentOS, SAML, logging, Sentry, build). However, several high-visibility claims about the kernel, tests, and security are **overstated or false**. The documentation drift between `AGENTS.md`, `README.md`, and `PRODUCT_STATUS_MATRIX` is a systemic issue that erodes trust in status reporting.

---

*End of Claim / Evidence Matrix.*
