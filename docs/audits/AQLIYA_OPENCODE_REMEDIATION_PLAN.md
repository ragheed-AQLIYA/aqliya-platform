# AQLIYA — OpenCode Remediation Plan
**Date:** 2026-08-16  
**Basis:** Findings from independent architecture, security, database, infrastructure, test, and documentation audits.

---

## Wave 0 — P0 Security / Data / Authorization (BLOCKING)
**Goal:** Close all P0 and critical P1 security gaps before any production exposure.
**ETA:** 3–5 days

| # | Action | Owner | Files to Change | Validation |
|---|---|---|---|---|
| 0.1 | **Fix SalesOS cross-tenant file write (P0)** | Security | `src/actions/sales-agent-actions.ts`, `src/actions/sales-actions/governance.ts` | Add `if (ctx.organizationId !== input.organizationId) throw new SalesAccessError(...)` before `scaffoldSalesProofFileUpload`. Write a cross-tenant negative test. |
| 0.2 | **Fix CRM webhook tenant resolution (P1)** | Security | `src/app/api/crm/webhook/route.ts`, `prisma/schema.prisma` (add `portalId` to `CrmConnection`) | Filter `findFirst` by `portalId` and `organizationId`. Add webhook route test with two orgs. |
| 0.3 | **Scope Decision detail query to organization (P1)** | Security | `src/actions/decisions-crud/detail.ts` | Change `prisma.decision.findUnique({ where: { id } })` to `where: { id, organizationId: user.organizationId }`. |
| 0.4 | **Add defensive tenant scoping to kernel service layer (P1)** | Security | `src/lib/kernel/implementations/audit-ledger.ts`, `files-service.ts`, `src/lib/platform/cross-product-ai/.../bridges.ts` | Add `organizationId` to all `findUnique` `where` clauses. Add negative tests. |
| 0.5 | **Add role checks to knowledge-mining routes (P1)** | Security | `src/app/api/knowledge-mining/*/route.ts` (6 files) | Insert `hasRequiredRole(user, "OPERATOR")` in each handler. Add route-level auth tests. |
| 0.6 | **Add HSTS and Permissions-Policy headers (P1)** | Security | `next.config.mjs` | Add `Strict-Transport-Security` and `Permissions-Policy` to the headers array. Verify with `security-headers.test.ts`. |
| 0.7 | **Fix CSP test to account for environment (P3)** | QA | `src/__tests__/unit/middleware/security-headers.test.ts` | Make test environment-aware, or run CSP assertion only when `NODE_ENV === "production"`. |
| 0.8 | **Fix migration evidence test (P3)** | QA | `src/__tests__/migration-evidence.test.ts` | Update expected latest migration to `20260724180519_add_platform_audit_log_merge_fields` or resolve dynamically. |

---

## Wave 1 — Architecture & Performance (BLOCKING)
**Goal:** Fix kernel violations and unbounded queries. Prevent cascading timeouts and memory exhaustion.
**ETA:** 7–10 days

| # | Action | Owner | Files to Change | Validation |
|---|---|---|---|---|
| 1.1 | **Add pagination to top 50 unbounded `findMany` queries (P1)** | Performance | `src/lib/platform/audit/unified-query.ts`, `src/lib/sales/institutional-memory.ts`, `src/lib/localcontactos/analytics-service.ts`, `src/actions/global-search-actions.ts`, plus 46 others | Add `.take(100)` (or appropriate limit) and return `{ items, totalCount, hasMore }`. Add performance regression tests. |
| 1.2 | **Wrap AI orchestrator with timeout + circuit breaker (P1)** | Architecture | `src/lib/core/ai/orchestrator.ts`, `src/lib/core/ai/governed-ai-executor.ts` | Add `AbortSignal` with 15s timeout. Consider `opossum` or custom circuit breaker. Add timeout test. |
| 1.3 | **Decouple kernel from product barrels (P1)** | Architecture | `src/lib/kernel/bootstrap.ts`, `src/lib/kernel/audit.ts`, `src/lib/kernel/workflowos.ts` | Move product plugin registration to config-driven loader. Remove `audit.ts` and `workflowos.ts` from kernel; re-export from product directories only. |
| 1.4 | **Move AuditOS handler out of core AI registry (P1)** | Architecture | `src/lib/core/ai/handlers/register-handlers.ts`, `src/products/audit-os/plugin.ts` | Move `disclosureEnrichmentHandler` registration into AuditOS plugin `onInit`. Ensure core AI registry remains product-agnostic. |
| 1.5 | **Add `organizationId` to Knowledge Foundation models (P1)** | Data | `prisma/schema.prisma` (`KnowledgeFoundationVersion`, `Release`, `Diff`), related queries | Add field, generate migration, update all queries. Add cross-tenant negative tests. |

---

## Wave 2 — Platform Kernel Hardening
**Goal:** Make the kernel truly product-agnostic and dynamically extensible.
**ETA:** 5–7 days

| # | Action | Owner | Files to Change | Validation |
|---|---|---|---|---|
| 2.1 | **Implement dynamic plugin discovery** | Architecture | `src/lib/kernel/bootstrap.ts`, `src/lib/kernel/plugin/` | Scan a configured directory (e.g., `src/products/`) or read from `process.env.PLUGIN_LIST` to discover plugins at boot time. |
| 2.2 | **Create product-side kernel adapters** | Architecture | `src/products/audit-os/kernel-adapter.ts`, `src/products/workflowos/kernel-adapter.ts` | Move kernel bridge logic into product-owned adapter files that register themselves with the kernel. |
| 2.3 | **Audit and remove unused kernel exports** | Architecture | `src/lib/kernel/index.ts` | Ensure kernel barrel exports only platform contracts, not product-specific types or functions. |

---

## Wave 3 — Product Boundary Cleanup
**Goal:** Resolve dual implementations and UI pollution.
**ETA:** 5–7 days

| # | Action | Owner | Files to Change | Validation |
|---|---|---|---|---|
| 3.1 | **Resolve SalesOS dual implementation** | Product | `src/lib/sales/`, `src/lib/salesos/` | Choose canonical directory (recommend `salesos/` for DDD alignment). Migrate platform imports. Deprecate old directory. |
| 3.2 | **Remove hardcoded mock data from DecisionOS** | Product | `src/app/(dashboard)/decisions/page.tsx` | Replace `mockDecisionTimeline` and `mockRecentEntities` with real queries and empty states. |
| 3.3 | **Ship SalesOS accounts list page** | Product | `src/app/sales/accounts/page.tsx` | Implement list view with `listSalesAccountsAction`, pagination, search. Remove redirect. |
| 3.4 | **Register DecisionOS as a platform plugin** | Architecture | `src/lib/kernel/bootstrap.ts`, create `src/products/decision-os/plugin.ts` | Add `DecisionOSPlugin` and register it. Align with other products. |
| 3.5 | **Consolidate tenant guard usage** | Security | `src/lib/audit/tenant-guard.ts`, `src/lib/sales/guards.ts`, `src/lib/local-content/guards.ts`, `src/lib/workflowos/tenant-guard.ts` | Migrate all products to use `src/lib/authorization/tenant-guard.ts` or a kernel-level `checkTenantAccess` wrapper. |

---

## Wave 4 — Reliability / Infrastructure Activation
**Goal:** Activate production infrastructure and verify runtime behavior.
**ETA:** 5–7 days

| # | Action | Owner | Files to Change | Validation |
|---|---|---|---|---|
| 4.1 | **Activate Redis rate limiter in staging/production** | Infra | `.env` / ECS task definition | Set `RATE_LIMITER=redis`. Verify with `verify-redis-rate-limiter.mjs`. |
| 4.2 | **Deploy ClamAV daemon and set `SCANNER_PROVIDER=clamav`** | Infra | `docker-compose.yml` (already defines ClamAV), ECS task definition | Verify upload scanning works end-to-end. |
| 4.3 | **Run backup restore drill on actual AWS RDS** | Infra | `scripts/platform/restore-drill.mjs` | Execute against live RDS. Verify row counts and generate JSON report. |
| 4.4 | **Add circuit breaker to AI provider calls** | Reliability | `src/lib/core/ai/orchestrator.ts` | Use `opossum` or custom implementation. Test fallback to deterministic provider. |
| 4.5 | **Move non-real-time AI tasks to background queue** | Reliability | `src/actions/office-ai-actions.ts`, `src/actions/audit-ai-actions.ts` | Use Bull queue for draft generation, report creation, memo drafting. Return job ID to client. |

---

## Wave 5 — Testing & QA Integrity
**Goal:** Fix failing tests, raise coverage, and reduce mock-heavy suites.
**ETA:** 7–10 days

| # | Action | Owner | Files to Change | Validation |
|---|---|---|---|---|
| 5.1 | **Fix 2 failing tests** | QA | `security-headers.test.ts`, `migration-evidence.test.ts` | See Wave 0.7 and 0.8. |
| 5.2 | **Raise Jest coverage thresholds** | QA | `jest.config.js` | Target 50% branches, 60% lines. Add CI coverage diff gate to prevent regressions. |
| 5.3 | **Add integration tests for SalesOS CRUD flows** | QA | `src/__tests__/integration/sales/` | End-to-end: account create → deal create → interaction log → review submit → approval. |
| 5.4 | **Add negative path tests for P0/P1 gaps** | QA | `src/__tests__/integration/security/` | Cross-tenant file upload rejection, CRM webhook org mismatch, decision org scoping. |
| 5.5 | **Audit and remove or relocate skipped tests** | QA | `src/lib/sales/v02/...`, `src/lib/sales/vnext/...`, `src/__tests__/i18n/no-english-strings.test.ts` | Move `describe.skip` suites to `__tests__/future/` or delete. |
| 5.6 | **Automate test count injection into docs** | Docs | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, CI pipeline | Add a CI step that runs `npm test -- --listTests`, counts tests, and fails if docs count is stale. |

---

## Wave 6 — Product Completion & Schema Pruning
**Goal:** Finish v0.1 gaps and reduce schema maintenance burden.
**ETA:** 7–10 days

| # | Action | Owner | Files to Change | Validation |
|---|---|---|---|---|
| 6.1 | **Schema pruning — mark unimplemented models** | Data | `prisma/schema.prisma` | Add `// @deprecated` or Prisma preview feature comment to ~115 unseeded models. Do not drop tables yet. |
| 6.2 | **De-stub SalesOS signals** | Product | `src/app/sales/signals/page.tsx`, `src/lib/sales/signals/` | Implement real signal aggregation from `salesInteraction` and `salesDeal` changes. |
| 6.3 | **Complete SalesOS account brief export** | Product | `src/app/sales/accounts/[id]/brief/export/` | Implement bilingual PDF generation for account briefs (use existing `pdfkit` pattern). |
| 6.4 | **Add empty states to all product dashboards** | Product | All `page.tsx` files in dashboard routes | Ensure every async page has `error.tsx`, `loading.tsx`, and `not-found.tsx` with actionable Arabic-first copy. |
| 6.5 | **Register RiskOS, Office AI, LocalContactOS, ContentStudio as plugins** | Architecture | `src/lib/kernel/bootstrap.ts`, create `plugin.ts` for each | Align all products with the plugin model for consistency. |

---

## Wave 7 — Production Verification (BLOCKING)
**Goal:** External validation and compliance readiness.
**ETA:** External dependency

| # | Action | Owner | Validation |
|---|---|---|---|
| 7.1 | **External penetration test** | Security / External | Engage third-party firm. Block production deploy until report is reviewed and critical findings closed. |
| 7.2 | **SOC2 Type II readiness program** | Governance | Begin evidence collection for trust services criteria (security, availability, processing integrity, confidentiality). |
| 7.3 | **ISO 27001 gap assessment** | Governance | Map current controls to ISO 27001 Annex A. Identify gaps. |
| 7.4 | **Runtime load test** | SRE | Use k6 or Artillery against staging. Validate pagination and caching under load. |
| 7.5 | **Sentry source maps auth token** | Infra | Configure `SENTRY_AUTH_TOKEN` in CI for production source map upload. |

---

## Dependency Graph

```
Wave 0 (Security fixes)
   ↓
Wave 1 (Architecture + Performance)
   ↓
Wave 2 (Kernel hardening)
   ↓
Wave 3 (Product cleanup)
   ↓
Wave 4 (Infra activation)
   ↓
Wave 5 (Testing)
   ↓
Wave 6 (Product completion)
   ↓
Wave 7 (External verification)
```

**Parallelizable pairs:**
- Wave 0 and Wave 1 can start together (different teams).
- Wave 5 (Testing) can begin as soon as Wave 0 is merged.
- Wave 6 (Product completion) is independent of Waves 2–4.

---

## Quick Wins (Can be done in 1 day each)

1. **Fix the 2 failing tests** — immediate CI green.
2. **Add `.take(100)` to top 10 unbounded queries** — immediate performance safety.
3. **Add `organizationId` validation to SalesOS actions** — immediate P0 closure.
4. **Add HSTS + Permissions-Policy to `next.config.mjs`** — immediate security header improvement.
5. **Remove DecisionOS mock data** — immediate UI trust improvement.
6. **Update test counts in README and PRODUCT_STATUS_MATRIX** — immediate documentation accuracy.

---

*End of Remediation Plan. This plan is derived entirely from evidence found in the repository during the independent OpenCode audit. No files were modified during the audit phase.*
