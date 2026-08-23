# AQLIYA — OpenCode Independent Findings Register
**Date:** 2026-08-16  
**Scope:** All confirmed findings from architecture, security, database, infrastructure, test, and documentation audits.

---

## P0 — Critical

### P0-001: SalesOS Cross-Tenant File Write (IDOR)
- **Severity:** P0
- **Title:** Client-supplied `organizationId` is written to storage without server-side validation in SalesOS proof upload
- **Area:** Security / Authorization / SalesOS
- **Evidence:** `src/actions/sales-agent-actions.ts` lines 149–170 and `src/actions/sales-actions/governance.ts` lines 182–204 accept `input.organizationId` from the client and pass it directly to `scaffoldSalesProofFileUpload({ organizationId: input.organizationId })` without comparing it to the authenticated user's `ctx.organizationId`.
- **Affected Files:** `src/actions/sales-agent-actions.ts`, `src/actions/sales-actions/governance.ts`
- **Root Cause:** Server action trusts a client-provided tenant identifier.
- **Impact:** A user with `salesos:create` permission in Organization A can upload files scoped to Organization B, violating tenant isolation and creating a direct data breach vector.
- **Recommendation:** Add `if (ctx.organizationId !== input.organizationId) throw new SalesAccessError(...)` before every service call that accepts an `organizationId`.
- **Verification Method:** Read the action files and trace the `organizationId` parameter flow.

---

## P1 — High Risk

### P1-001: Kernel Violates Product Independence Doctrine
- **Severity:** P1
- **Title:** Platform Kernel hardcodes product plugins and re-exports product-specific internals
- **Area:** Architecture / Platform Kernel
- **Evidence:** `src/lib/kernel/bootstrap.ts` statically imports `AuditOSPlugin`, `LocalContentOSPlugin`, `SalesOSPlugin` from `../../products/*`. `src/lib/kernel/audit.ts` (215 lines) re-exports 150+ AuditOS functions from `@/lib/audit/*`. `src/lib/kernel/workflowos.ts` (103 lines) re-exports WorkflowOS internals.
- **Affected Files:** `src/lib/kernel/bootstrap.ts`, `src/lib/kernel/audit.ts`, `src/lib/kernel/workflowos.ts`
- **Root Cause:** Kernel was refactored to centralize imports but retained product-specific barrels.
- **Impact:** Adding a new product requires editing kernel source. The kernel cannot be deployed independently. Compile-time coupling from platform to products.
- **Recommendation:** Remove product barrels from kernel. Move product plugin registration to a config-driven loader or to each product's own bootstrap entry point.
- **Verification Method:** Inspect `src/lib/kernel/` directory and search for product import patterns.

### P1-002: Core AI Handler Registry Depends on AuditOS
- **Severity:** P1
- **Title:** `src/lib/core/ai/handlers/register-handlers.ts` imports AuditOS-specific handler
- **Area:** Architecture / AI
- **Evidence:** `register-handlers.ts` imports `disclosureEnrichmentHandler` from `@/lib/audit/handlers/disclosure-enrichment-handler`.
- **Affected Files:** `src/lib/core/ai/handlers/register-handlers.ts`
- **Root Cause:** AI handler registry was placed in `core/` but wired to a product-specific handler.
- **Impact:** Core AI layer cannot initialize without AuditOS present. Breaks "shared Core" architecture for non-Audit deployments.
- **Recommendation:** Move AuditOS-specific handler registration into the AuditOS plugin's `onInit` lifecycle method.
- **Verification Method:** Read the file and trace imports.

### P1-003: CRM Webhook Cross-Tenant Data Injection
- **Severity:** P1
- **Title:** CRM webhook handler resolves target connection without portal or organization filter
- **Area:** Security / API / Integrations
- **Evidence:** `src/app/api/crm/webhook/route.ts` lines 80–86: `prisma.crmConnection.findFirst({ where: { provider: "hubspot", syncEnabled: true }, orderBy: { createdAt: "desc" } })` — no `portalId` or `organizationId` filter.
- **Affected Files:** `src/app/api/crm/webhook/route.ts`
- **Root Cause:** Webhook handler validates HMAC signature but does not map the webhook to the correct tenant.
- **Impact:** A webhook from Organization A's HubSpot portal could be processed against Organization B's connection (most recently created), causing cross-tenant data corruption.
- **Recommendation:** Store `portalId` in `CrmConnection` and filter `findFirst` by it. Validate `organizationId` mapping before processing.
- **Verification Method:** Read webhook route and inspect `CrmConnection` model fields.

### P1-004: Decision Fetched Before Authorization Check
- **Severity:** P1
- **Title:** `getDecisionById` loads full decision object into memory before `enforce()`
- **Area:** Security / Authorization / DecisionOS
- **Evidence:** `src/actions/decisions-crud/detail.ts` lines 18–56: `prisma.decision.findUnique({ where: { id }, include: { organization: true, owner: true, reviewer: true, ... } })` is executed, then `enforce()` is called at line 56.
- **Affected Files:** `src/actions/decisions-crud/detail.ts`
- **Root Cause:** Authorization check placed after data retrieval.
- **Impact:** Full decision data (risks, tender profile, scenarios, framework, approvals) is loaded into server memory for every request, including cross-tenant attempts. Under memory pressure or compromised runtime, this is an information disclosure vector.
- **Recommendation:** Scope the initial query to `where: { id, organizationId: user.organizationId }`.
- **Verification Method:** Read the action file.

### P1-005: Service-Layer `findUnique` Without Tenant Scoping
- **Severity:** P1
- **Title:** Multiple shared service functions query by `id` alone, omitting `organizationId`
- **Area:** Security / Data Layer
- **Evidence:** At least 16 locations in `src/lib/kernel/`, `src/lib/platform/`, and product services where `prisma.*.findUnique({ where: { id } })` is used without `organizationId`. High-risk examples:
  - `src/lib/kernel/implementations/audit-ledger.ts:114` — `platformAuditLog.findUnique`
  - `src/lib/kernel/implementations/files-service.ts:67` — `coreEvidence.findUnique`
  - `src/lib/platform/cross-product-ai/.../bridges.ts:14` — cross-product data bridge
  - `src/lib/office-ai/file-extraction-service.ts:266` — `officeAiFile.findUnique`
  - `src/lib/platform/sampling/sampling-engine.ts:281` — `samplingPlan.findUnique`
- **Affected Files:** See Security Audit for full table.
- **Root Cause:** Developers assumed callers already verified access, but the service layer is not defensively scoped.
- **Impact:** If any new route or action calls these services without prior access verification, it becomes an IDOR vector.
- **Recommendation:** Add `organizationId` to the `where` clause of all shared service `findUnique` queries, or create a defensive wrapper.
- **Verification Method:** Grep for `findUnique\(\s*\{\s*where:\s*\{\s*id:` across `src/lib/`.

### P1-006: Knowledge-Mining API Routes Lack Role Checks
- **Severity:** P1
- **Title:** 6 knowledge-mining routes authenticate via `auth()` but do not enforce roles or tenant scoping at the route layer
- **Area:** Security / API
- **Evidence:** `src/app/api/knowledge-mining/aggregate/route.ts`, `batch-promote`, `promote`, `review`, `candidates`, `candidates/[id]`, `kpis` all use `auth()` to get session but do not call `getCurrentUser()` or `hasRequiredRole()`.
- **Affected Files:** `src/app/api/knowledge-mining/*/route.ts`
- **Root Cause:** Route handlers rely on downstream service scoping, but the API boundary lacks explicit guards.
- **Impact:** Any authenticated user (including VIEWER) can trigger knowledge-mining mutations.
- **Recommendation:** Add `hasRequiredRole(user, "OPERATOR")` or `("ADMIN")` to each route handler.
- **Verification Method:** Read each route file.

### P1-007: SCIM Single Global API Key
- **Severity:** P1
- **Title:** All SCIM endpoints authenticate with one global `SCIM_API_KEY` and map to a default org
- **Area:** Security / API / SSO
- **Evidence:** `src/app/api/scim/v2/auth.ts` lines 16–44: `const scimApiKey = process.env.SCIM_API_KEY;` and `const organizationId = process.env.SCIM_DEFAULT_ORG_ID || ...`.
- **Affected Files:** `src/app/api/scim/v2/auth.ts`
- **Root Cause:** SCIM auth implemented as a single shared secret for simplicity.
- **Impact:** Any SCIM client with the key can modify users for the default organization. No per-org key mapping.
- **Recommendation:** Implement per-organization API key storage (e.g., in `SsoProvider` or `TenantIntegration`) and resolve `organizationId` from the key.
- **Verification Method:** Read the auth file.

### P1-008: Synchronous AI Calls Block Request Threads
- **Severity:** P1
- **Title:** AI orchestrator and provider `execute()` calls are awaited directly in Server Actions and API routes with no timeout or queue offload
- **Area:** Performance / Reliability / AI
- **Evidence:** `src/lib/core/ai/orchestrator.ts:262`, `src/lib/core/ai/governed-ai-executor.ts:58`, `src/lib/core/ai/generate.ts:23`, `src/lib/skill-runtime/runtime/steps.ts:95,291`.
- **Affected Files:** See above.
- **Root Cause:** AI calls treated as synchronous dependencies of the HTTP request lifecycle.
- **Impact:** AI provider latency or outage causes Next.js request timeouts (10–60s depending on host). Degrades entire platform responsiveness.
- **Recommendation:** Add a `AbortSignal` timeout (e.g., 15s) to all AI calls. For non-real-time tasks (draft generation, report creation), move to a background job queue.
- **Verification Method:** Grep for `await.*orchestrator.*generate` and `await.*provider.*execute` in `src/lib/` and `src/actions/`.

### P1-009: 692 Unbounded `findMany` Queries
- **Severity:** P1
- **Title:** The vast majority of `prisma.findMany` calls lack `.take()` or pagination
- **Area:** Performance / Data Layer
- **Evidence:** 565 in `src/lib/**/*.ts`, 127 in `src/actions/**/*.ts`. High-risk examples:
  - `src/lib/platform/audit/unified-query.ts:140` — `platformAuditLog.findMany` unbounded
  - `src/lib/sales/institutional-memory.ts` — `salesDeal.findMany` + `platformAuditLog.findMany` unbounded
  - `src/lib/localcontactos/analytics-service.ts` — `localContact.findMany` + `localContactInteraction.findMany` unbounded
  - `src/actions/global-search-actions.ts` — multi-product unbounded `findMany`
- **Affected Files:** See Database Audit for full list.
- **Root Cause:** Pagination was standardized for dashboard server actions but not enforced across all query paths.
- **Impact:** Memory exhaustion, event-loop blocking, timeouts for large tenants.
- **Recommendation:** Systematically add `.take(100)` (or appropriate limit) to every `findMany` in request paths. Return `{ items, totalCount, hasMore }` from all list actions.
- **Verification Method:** Grep for `findMany\(` in `src/lib/` and `src/actions/` and count those without `.take` or `limit`.

### P1-010: Destructive Migration Dropped Audit Tables Without Data Migration
- **Severity:** P1
- **Title:** Migration `20260724232330_drop_deprecated_audit_models` drops 6 tables + 2 enums with `CASCADE` and no `INSERT...SELECT`
- **Area:** Data Integrity / Migrations
- **Evidence:** `prisma/migrations/20260724232330_drop_deprecated_audit_models/migration.sql` contains 6 `DROP TABLE ... CASCADE` and 2 `DROP TYPE ... CASCADE`.
- **Affected Files:** `prisma/migrations/20260724232330_drop_deprecated_audit_models/migration.sql`
- **Root Cause:** Migration written to clean up legacy tables after audit log consolidation.
- **Impact:** Any environment that ran this migration before the unification code was fully deployed would lose historical audit data irreversibly.
- **Recommendation:** Document this migration as destructive in the runbook. For future migrations, always include a data-backfill script before dropping tables.
- **Verification Method:** Read the migration SQL file.

### P1-011: Sales Intel Webhook Tenant Misattribution
- **Severity:** P1
- **Title:** Sales intel webhook passes hardcoded `"system"` organization ID
- **Area:** Security / API / SalesOS
- **Evidence:** `src/app/api/sales/intel/webhook/route.ts:64` — `organizationId: "system", // Tenant resolved from webhook payload`.
- **Affected Files:** `src/app/api/sales/intel/webhook/route.ts`
- **Root Cause:** Placeholder tenant ID left in production route.
- **Impact:** Webhook events logged/processed under `"system"` tenant break audit trails and may mix data.
- **Recommendation:** Implement explicit tenant resolution from webhook payload and validate against known provider+tenant mappings.
- **Verification Method:** Read the route file.

### P1-012: AI Knowledge Ingest Allows Client `organizationId` Override
- **Severity:** P1
- **Title:** `POST /api/ai/knowledge/ingest` accepts `organizationId` in body and resolves it via `resolveKnowledgeOrganizationId`
- **Area:** Security / AI
- **Evidence:** `src/app/api/ai/knowledge/ingest/route.ts` accepts `organizationId: z.string().optional()`.
- **Affected Files:** `src/app/api/ai/knowledge/ingest/route.ts`
- **Root Cause:** API permits client to suggest tenant scope for AI knowledge ingestion.
- **Impact:** If `resolveKnowledgeOrganizationId` does not strictly enforce `user.organizationId`, this becomes a cross-tenant AI knowledge injection vector.
- **Recommendation:** Audit `resolveKnowledgeOrganizationId` to confirm it rejects overrides and throws on mismatch.
- **Verification Method:** Read the route file and the resolution function.

### P1-013: Missing Security Headers (HSTS, Permissions-Policy)
- **Severity:** P1
- **Title:** Production CSP is strict but HSTS and Permissions-Policy are absent
- **Area:** Security / Headers
- **Evidence:** `next.config.mjs` lines 132–148 sets CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. No `Strict-Transport-Security` or `Permissions-Policy`.
- **Affected Files:** `next.config.mjs`
- **Root Cause:** Headers added for CSP hardening but HSTS/Permissions-Policy were omitted.
- **Impact:** Missing HSTS allows downgrade attacks. Missing Permissions-Policy allows features like camera/microphone if exploited via XSS.
- **Recommendation:** Add `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` and a restrictive `Permissions-Policy` for production.
- **Verification Method:** Read `next.config.mjs` headers section.

---

## P2 — Material Engineering Debt

### P2-001: Schema Bloat — ~115 Unseeded / Dead Models
- **Severity:** P2
- **Title:** Approximately 64% of schema models have no seed data and no visible API surface
- **Area:** Database / Architecture
- **Evidence:** Comparison of `prisma/seed*.ts` files against 179 models shows ~115 models never seeded. Examples: `OrgHierarchyNode`, `SectorBenchmark`, `ReportingGraph`, `AuditValidationRun`, `SunbulClient`, `LcPatternSuggestion`, `ContentTemplate`, `QualityRemediation`, etc.
- **Affected Files:** `prisma/schema.prisma`, `prisma/seed*.ts`
- **Root Cause:** Schema created ahead of product implementation for speculative features.
- **Impact:** Migration time increases, cognitive overhead, risk of accidental data loss, harder to onboard new engineers.
- **Recommendation:** Mark unimplemented models with Prisma `@deprecated` or remove them from the schema and archive in design docs.
- **Verification Method:** Cross-reference seed files against model list in schema.

### P2-002: Test Coverage Thresholds Critically Low
- **Severity:** P2
- **Title:** Jest global thresholds are 24% branches, 27% functions, 33% lines, 32% statements
- **Area:** QA / Testing
- **Evidence:** `jest.config.js` `coverageThreshold.global` values.
- **Affected Files:** `jest.config.js`
- **Root Cause:** Thresholds set low to allow CI to pass despite large untested surface.
- **Impact:** ~76% of branches are unverified. Critical paths (auth, tenant isolation, AI governance) may contain untested edge cases.
- **Recommendation:** Raise thresholds to 50% branches / 60% lines for critical paths. Add CI coverage diff gates.
- **Verification Method:** Read `jest.config.js`.

### P2-003: Documentation Test Counts Are Inconsistent and Stale
- **Severity:** P2
- **Title:** Three authoritative documents cite three different test counts
- **Area:** Documentation / Governance
- **Evidence:** AGENTS.md §28: 4,678. README: 5,691. PRODUCT_STATUS_MATRIX: 5,771. Actual: 5,804.
- **Affected Files:** `AGENTS.md`, `README.md`, `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- **Root Cause:** Manual doc updates after milestones, not automated.
- **Impact:** Undermines metric credibility and makes it hard to assess true QA state.
- **Recommendation:** Automate test count injection into docs via CI badge or pre-commit validation.
- **Verification Method:** Read the three files and compare to `npm test` output.

### P2-004: DecisionOS Production Page Renders Hardcoded Mock Data
- **Severity:** P2
- **Title:** `src/app/(dashboard)/decisions/page.tsx` unconditionally renders fake timeline and recent entities
- **Area:** Product / DecisionOS / UI
- **Evidence:** Lines 352–433 define `mockDecisionTimeline` and `mockRecentEntities` and render them regardless of real data presence.
- **Affected Files:** `src/app/(dashboard)/decisions/page.tsx`
- **Root Cause:** Mock data left in production component after prototyping.
- **Impact:** Pilot users see fake AI recommendations and fake actor names mixed with real data, violating the trust principle.
- **Recommendation:** Replace mock blocks with real queries. Show empty states when no data exists.
- **Verification Method:** Read the page component.

### P2-005: Tenant Guard Duplication Across Products
- **Severity:** P2
- **Title:** Each product maintains its own tenant guard file; shared guard exists but is unused
- **Area:** Architecture / Governance
- **Evidence:**
  - `src/lib/audit/tenant-guard.ts` (65 lines)
  - `src/lib/sales/guards.ts` (142 lines)
  - `src/lib/local-content/guards.ts` (123 lines)
  - `src/lib/workflowos/tenant-guard.ts` (154 lines)
  - `src/lib/authorization/tenant-guard.ts` (75 lines) — unused by products
- **Affected Files:** See above.
- **Root Cause:** Products built tenant guards independently before shared abstraction was finalized.
- **Impact:** Security fixes must be applied in 4+ locations. Risk of inconsistent enforcement.
- **Recommendation:** Migrate all products to use `src/lib/authorization/tenant-guard.ts` or a kernel-level `checkTenantAccess` wrapper.
- **Verification Method:** Read each guard file and search for imports of the shared guard.

### P2-006: SalesOS Accounts List Is a Redirect Shell
- **Severity:** P2
- **Title:** `/sales/accounts` redirects to `/sales` with a comment saying list routes are not yet shipped
- **Area:** Product / SalesOS / UI
- **Evidence:** `src/app/sales/accounts/page.tsx` contains `redirect("/sales")` and comment `"list browse lives on dashboard until v0.1 list routes ship."`
- **Affected Files:** `src/app/sales/accounts/page.tsx`
- **Root Cause:** Accounts list UI deferred.
- **Impact:** Users cannot browse the full account register independently of the dashboard.
- **Recommendation:** Implement the accounts list page or remove the route and document the gap.
- **Verification Method:** Read the page file.

---

## P3 — Low-Risk Cleanup

### P3-001: CSP Test Fails in Development Mode
- **Severity:** P3
- **Title:** `security-headers.test.ts` fails because dev CSP includes `unsafe-eval` and `unsafe-inline`
- **Area:** QA / Testing
- **Evidence:** `src/__tests__/unit/middleware/security-headers.test.ts:72` asserts `not.toContain("unsafe-eval")`, but `next.config.mjs` sets dev CSP to `script-src 'self' 'unsafe-inline' 'unsafe-eval'`.
- **Affected Files:** `src/__tests__/unit/middleware/security-headers.test.ts`, `next.config.mjs`
- **Root Cause:** Test is environment-unaware or middleware does not account for `NODE_ENV=test`.
- **Impact:** False-negative test failure on every run. Masks real CSP regressions.
- **Recommendation:** Fix test to check production CSP only, or set `NODE_ENV=production` in the test environment for the CSP assertion.
- **Verification Method:** Run `npm test -- security-headers`.

### P3-002: Migration Evidence Test Expects Stale Latest Migration
- **Severity:** P3
- **Title:** `migration-evidence.test.ts` expects an old migration as "latest"
- **Area:** QA / Testing
- **Evidence:** `src/__tests__/migration-evidence.test.ts` expects `20260623000000_add_knowledge_candidate_fk` as latest, but actual latest is `20260724180519_add_platform_audit_log_merge_fields`.
- **Affected Files:** `src/__tests__/migration-evidence.test.ts`
- **Root Cause:** Test not updated after new migrations.
- **Impact:** False-negative on every run.
- **Recommendation:** Update test assertion or make it dynamically resolve the latest migration file.
- **Verification Method:** Run `npm test -- migration-evidence`.

### P3-003: SalesOS v0.2 / vnext Tests Skipped
- **Severity:** P3
- **Title:** Two SalesOS test suites are `describe.skip` for future versions
- **Area:** QA / Testing
- **Evidence:** `src/lib/sales/v02/.../aggregator.test.ts` and `src/lib/sales/vnext/.../cross-product-signals.test.ts`.
- **Affected Files:** See above.
- **Root Cause:** Tests written for planned future features.
- **Impact:** Inflates test file count without adding runtime verification.
- **Recommendation:** Move skipped future tests to a `__tests__/future/` directory or delete until the features are implemented.
- **Verification Method:** Search for `describe.skip` in `src/lib/sales/`.

---

*End of Findings Register. Every finding is backed by a specific file path and line reference in the repository at the time of audit. No files were modified during this engagement.*
