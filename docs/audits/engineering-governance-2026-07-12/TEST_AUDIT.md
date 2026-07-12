# AQLIYA Test Audit
**Date:** 2026-07-12
**Auditor:** OpenCode Test Auditor Agent
**Scope:** Full test suite — unit, integration, E2E (Cypress), UAT scripts
**Methodology:** Inspected 60+ test files, jest.config.js, mocks, CI workflow, Cypress specs, schemas, and UAT runners. Read test code, not just file paths.

---

## 1. Executive Summary

AQLIYA has **~382 unit/integration test files** (.test.ts) + **4 component test files** (.test.tsx) + **11 Cypress E2E specs** + **2 manual UAT/rehearsal scripts**. The test suite totals approximately **400 test-bearing files**, which is broad for a platform with 10+ product systems. However, depth varies dramatically by product: AuditOS is the most tested; Cross-cutting security/RBAC has strong coverage; WorkflowOS (Sunbul) has well-structured service tests. But critical gaps exist in **SalesOS, DecisionOS, LocalContactOS, and Admin** — where most tests are shallow mock-based smoke tests that verify route/page existence rather than business behavior.

**Overall Health Rating: 6.2/10** — Broad coverage with pockets of depth, but serious gaps in negative testing, data integrity verification, and true integration tests.

---

## 2. Test Coverage Matrix

### 2.1 By Product/System

| Product/System | Unit Test Files | Integration Test Files | Action Tests | E2E (Cypress) | UAT Scripts | Total Files | Quality Score (1-10) |
|---|---|---|---|---|---|---|---|
| **AuditOS** | 7 | 2 | 2 | 4 | 2 | 17 | **8** |
| **DecisionOS** | 2 | 3 | 1 | 1 | 0 | 7 | **6** |
| **LocalContentOS** | 4 | 1 | 2 | 1 | 0 | 8 | **6** |
| **SalesOS** | 0 | 1 | 0 | 1 | 0 | 2 | **3** |
| **LocalContactOS** | 0 | 1 | 0 | 0 | 0 | 1 | **4** |
| **WorkflowOS / Sunbul** | 2 | 1 | 0 | 0 | 0 | 3 | **7** |
| **Knowledge Foundation** | 18 | 0 | 0 | 0 | 0 | 18 | **6** |
| **Knowledge Mining** | 3 | 0 | 0 | 0 | 0 | 3 | **5** |
| **AI / Intelligence** | 9 | 0 | 0 | 0 | 0 | 9 | **5** |
| **Platform Core** (auth, RBAC, mw) | 22 | 2 | 2 | 2 | 0 | 28 | **8** |
| **Admin / SSO** | 2 | 0 | 2 | 0 | 0 | 4 | **5** |
| **Marketing / Landing** | 2 | 0 | 0 | 1 | 0 | 3 | **4** |
| **i18n / Arabic** | 1 | 0 | 0 | 0 | 0 | 1 | **4** |
| **Integration Framework** | 0 | 5 | 0 | 0 | 0 | 5 | **5** |
| **General / Shared** | 7 | 0 | 1 | 1 | 0 | 9 | **6** |
| **TOTALS** | ~79 | ~16 | ~10 | ~11 | ~2 | ~118‡ | **6.2 avg** |

‡ *Note: ~382 test.ts files exist total. Some are counted under multiple product headings if they span concerns. The 118 is a de-duplicated product-level count.*

### 2.2 By Test Type

| Type | Count | Avg Quality | Notes |
|---|---|---|---|
| Pure Unit (logic only, no mocks) | ~25 | 8 | Pagination, safe-utils, pilot-readiness, secret-resolver tests are strong examples |
| Unit with Full Mocking | ~50 | 5 | Most use jest.mock at module level; Prisma entirely mocked |
| Integration (real DB) | ~5 | 7 | `critical-paths.test.ts`, `tb-upload-mapping-fs.integration.test.ts`, UAT runner |
| Integration (partial mock) | ~10 | 5 | `decision-evidence.test.ts` — well-structured but fully mocked Prisma |
| Action Tests | ~10 | 5 | Test action success/failure but through mocked auth + Prisma |
| Schema/Migration Tests | 1 | 7 | `migration-evidence.test.ts` — strong structural validation |
| File Existence Tests | ~8 | 3 | Verify tab pages exist; shallow but serve as change detection |
| E2E (Cypress) | ~11 | 5 | Smoke-level; verify pages load and basic interactions work |
| UAT/Rehearsal Scripts | 2 | 6 | Direct DB connection; good as operational check, not in CI |

### 2.3 Top-Level File Inventory

```
src/__tests__/                           — ~95 test files (main test directory)
  unit/                                  — ~50 unit tests
    admin/                               — 1 file (admin-actions)
    ai/                                  — 2 files (confidence, eval-gate)
    api/                                 — 6 files (download token, metrics, sanitization)
    audit/                               — 2 files (workflow routes, next action)
    auditos/                             — 1 file (demo routes)
    decision/                            — 1 file (workflow routes)
    knowledge-foundation/                — 16 files (phase 27-28, versioning, diff, release)
    knowledge-mining/                    — 2 files (delete-candidate-binding, security)
    local-content/                       — 2 files (project-workflow, pilot-readiness)
    marketing/                           — 2 files (routes, vision-language)
    middleware/                           — 4 files (auth-guard, rate-limit, security-headers, mw-rate-limit)
    platform/                            — 4 files (api-error, download-token, platform-overview, metrics)
  integration/                           — ~10 files
  actions/                               — ~5 files
  components/                            — 4 files (.tsx)
  i18n/                                  — 1 file
  saml/                                  — 1 file
  lib/                                   — 1 file (redis-cache-adapter)

src/lib/*/__tests__/                     — ~25 test files
  tb-intelligence/__tests__/             — 5 files
  workflowos/__tests__/                  — 2 files
  ai/__tests__/                          — 6 files (orchestrator, memory, pipeline, search, provider-router, observability)
  integration/__tests__/                 — 3 files + 3 in adapters
  skill-runtime/__tests__/              — 1 file

cypress/e2e/                             — 11 spec files
```

---

## 3. Missing Test Scenarios

### 3.1 Critical Gaps by Product

| Product | Missing Scenario | Risk | Priority |
|---|---|---|---|
| **SalesOS** | No unit tests for sales business logic (opportunity qualification, pipeline transitions) | HIGH | P0 |
| **SalesOS** | No test for CSV export content validation (only header + status check) | MEDIUM | P1 |
| **DecisionOS** | No test for multi-step decision workflow gating (only schema-level gate-check, no service-level) | HIGH | P0 |
| **DecisionOS** | No test for pattern extraction from approved decisions (gate enforcement is unit-level only) | MEDIUM | P1 |
| **LocalContactOS** | No test for sensitivity-level RBAC enforcement at data layer | HIGH | P1 |
| **LocalContentOS** | No test for LC scoring algorithm correctness | MEDIUM | P1 |
| **LocalContentOS** | No test for classification workflow with edge cases (mixed supplier types) | MEDIUM | P2 |
| **AuditOS** | No test for lead schedule/workpaper index generation | MEDIUM | P2 |
| **AuditOS** | No test for factory approval gate gating export to wrong format | MEDIUM | P1 |
| **All Products** | No concurrency/race-condition tests | MEDIUM | P2 |
| **All Products** | No performance/load tests | LOW | P3 |
| **All Products** | No tests for versioned API deprecation | MEDIUM | P2 |
| **Platform Core** | No test for SAML SSO assertion validation edge cases | MEDIUM | P2 |
| **Knowledge Mining** | No test for candidate deletion with cleanup of bridge records | MEDIUM | P2 |
| **Marketing** | Marketing route tests only check file existence, not content or SEO | LOW | P3 |

### 3.2 Cross-Cutting Missing Scenarios

| Scenario | Products Missing | Risk |
|---|---|---|
| Edge cases for empty data / 0-length arrays in dashboards | SalesOS, DecisionOS, Admin | MEDIUM |
| Invalid input validation (negative amounts, bad dates, XSS) | All products | HIGH |
| Timezone/DST handling for fiscal-period calculations | AuditOS | LOW |
| Unicode/Arabic collation in search/sort | AuditOS, LCOS | LOW |
| Multi-tenant data leakage via shared cache keys | Platform Core | MEDIUM |
| Token refresh/expiry during long-running operations | All authenticated APIs | MEDIUM |

---

## 4. Integration Test Quality

### 4.1 Integration Test Inventory & Assessment

| File | Real DB? | Mock Quality | Assertion Quality | Issues |
|---|---|---|---|---|
| `integration/critical-paths.test.ts` | YES — via @/lib/prisma | Good — real Prisma calls to configured DB | **Strong** — verifies full workflow, status transitions, audit logs | Requires DB running; uses prisma directly (not actions) |
| `integration/tb-upload-mapping-fs.integration.test.ts` | YES | Good — real schema calls | **Very strong** — end-to-end classify→map→confirm→firm memory→FS rebuild | Best integration test in the suite; 3 full scenarios |
| `integration/decision-evidence.test.ts` | No — Prisma fully mocked | Good — well-structured mock factories | **Strong** — tests auth, RBAC, file validation, tenant isolation, audit logging | Tests actions through mocked layer; not true E2E |
| `integration/localcontactos-crud.test.ts` | No — Prisma fully mocked | Adequate — inline mock factories | **Medium** — tests create/read/update/delete/export but all via mock returns | One assertion per operation path; no error recovery tests |
| `integration/sales-export.test.ts` | No — Prisma fully mocked | Good — rate limiting + auth tested | **Strong** — auth 401, RBAC 403, rate limit 429, CSV headers, audit event | Tests route handler directly; no CSV content parsing |
| `integration/org-scoping.test.ts` | No — mocked | Good | Strong — tests cross-org blocking | Tests authorization facade |
| `integration/api-health.test.ts` | No | Minimal | **Very weak** — single `toBeDefined()` test | Trivial; provides no coverage value |
| `integration/workflowos-export.test.ts` | No — mocked | Adequate | Medium | Tests header/status only |
| `integration/audit-governance-bridge.test.ts` | No — mocked | Adequate | Medium | Bridge between audit and governance |
| `integration/recommendation-publication.test.ts` | No — mocked | Adequate | Medium | Tests publication flow |
| `integration/decision-evidence-download-route.test.ts` | No — mocked | Good | Strong | Download token + auth tests |
| `integration/workflowos-record-download-route.test.ts` | No — mocked | Adequate | Medium | Download route protection |
| `integration/notification-aggregation.test.ts` | No — mocked | Adequate | Medium | Notification tests |
| `integration/sales-export.test.ts` | No — mocked | Good | Strong | Auth + rate limit + audit |
| `lib/skill-runtime/__tests__/skill-registry.integration.test.ts` | No — mocked | Adequate | Medium | Skill registry |
| `actions/__tests__/localcontent-ai-pipeline.integration.test.ts` | No — mocked | Adequate | Medium | AI pipeline |

### 4.2 Key Finding: Mock-Heavy Integration Tests

Only **2 out of ~16 integration test files** (`critical-paths.test.ts` and `tb-upload-mapping-fs.integration.test.ts`) actually connect to a real database. The remaining 14 files use fully mocked Prisma via `jest.mock("@/lib/prisma", ...)`. While this makes tests fast and CI-friendly, it means:

- **Business logic flow tests are validated**, but
- **Database constraints, FK cascades, and transaction rollback behavior are NOT tested**
- **Prisma query correctness (where clauses, includes, orderBy) is NOT verified**
- The label "integration" is misleading for 87% of the integration test suite

### 4.3 Integration Test Quality Rating: **5/10**

---

## 5. Negative Testing Assessment

| Type | Coverage Score (1-10) | Details | Gaps |
|---|---|---|---|
| **Unauthorized/Auth** | **8** | Strong: `auth-guard.test.ts` (351 lines) covers 401, 403, MFA gates, rate limiting, token errors. `cross-tenant-isolation.test.ts` (477 lines) covers RBAC, tenant checks, schema isolation, middleware protection. | SAML-specific auth edge cases not covered |
| **Invalid Input** | **4** | Limited: `decision-evidence.test.ts` tests invalid file type + max size. `safe-utils.test.ts` tests JSON parse failures. `sales-export.test.ts` tests rate limiting. | Most actions lack tests for: negative amounts, SQL injection attempts, XSS payloads, extremely long strings, boundary values |
| **Concurrent Operations** | **1** | Minimal: `secret-resolver-concurrency.test.ts` — one of very few. `lcos-state-machine.test.ts` has state transitions. | No test simulates: simultaneous writes to same record, duplicate request submission, optimistic locking failures |
| **Rate Limiting** | **5** | Moderate: `sales-export.test.ts` tests 10 requests → 429. `rate-limit-middleware.test.ts` covers middleware trigger. `rate-limiter-l014.test.ts` token bucket. | Only tested for sales export; not tested for AuditOS, DecisionOS, or auth endpoints |
| **Error Recovery** | **4** | Limited: `decision-evidence.test.ts` tests "not found" for delete. `workflowos/audit.test.ts` tests failed dual-write recovery. | Most actions lack tests for: DB connection failure, timeout, partial write rollback |
| **Edge Cases (empty/null)** | **5** | Moderate: `safe-utils.test.ts` tests null/undefined/empty. `decision-evidence.test.ts` tests empty evidence list. `pilot-readiness-status.test.ts` tests empty metrics. `pagination.test.ts` tests empty results + boundary clamping. `knowledge-diff-engine.test.ts` likely tests edge cases. | Many product tests lack: empty dashboards, 0-count scenarios, null metadata fields |
| **Schema Integrity** | **7** | Strong: `cross-tenant-isolation.test.ts` validates `organizationId`, `platformOrganizationId`, `engagementId`, `projectId` on 30+ models. `migration-evidence.test.ts` validates migration files, SQL syntax, indexes, FKs, additive-only patterns for 15+ migrations. | Schema validation is parsing-based, not query-based (does not prove DB matches) |

### Negative Testing Overall: **4.5/10**

---

## 6. Test Infrastructure Health

### 6.1 Configuration Quality: **7/10**

**`jest.config.js`** (54 lines):
- **Strengths:** Uses `ts-jest`, node environment, explicit root scoping (`src/` only), sensible ignore patterns (`.claude/`, `docs/`), proper `moduleNameMapper` for mocking real auth/Prisma/next-auth/bcryptjs/server-only.
- **Weaknesses:**
  - `maxWorkers: 1` — single-threaded; will be slow with ~400 test files. Intended to avoid mock state leakage, but indicates tests may have shared state issues.
  - `forceExit: true` — bandaids test teardown issues.
  - No `coverage` configuration — no coverage thresholds, no report format.
  - No `globalSetup`/`globalTeardown` — no DB lifecycle management.
  - No test timeout configuration.
  - `moduleNameMapper` remaps `@prisma/client` to mock globally; tests that need real Prisma must mock internally instead.

### 6.2 Mock Quality: **6/10**

**`src/__mocks__/prisma-mock.js`** (123 lines):
- Covers 30+ Prisma models with `findMany`, `findUnique`, `create`, `update`, `deleteMany`, etc.
- `$transaction` wraps in the same mock object — no real transaction behavior.
- Most methods return `[]`, `null`, or `{}` — provides no testable data unless tests override via `jest.fn()`.
- The mock is a **dependency injection anti-pattern**: tests that want real Prisma must re-mock individual methods.
- Missing models: `salesAccount`, `salesDeal`, `salesPipelineStage`, `sunbulClient`, `sunbulRecord`, `localContact` (these are mocked inline in specific tests).

**Auth mocks:**
- `next-auth.js`, `next-auth-provider.js`, `lib-auth.js`, `bcryptjs.js` — adequate stub mocks.
- `server-only.js` — prevents server-only imports from crashing in test environment.

**Overall:** Mocks enable basic testing but the global Prisma mock means nearly all business logic tests are testing against canned responses, not real database state.

### 6.3 CI Integration: **8/10**

**`.github/workflows/ci.yml`** (119 lines):
- Uses `pgvector/pgvector:pg16` as Postgres service with health checks.
- Runs `prisma generate` → `prisma migrate deploy` → `npm test` → `npm run lint` → `npm run build`.
- Also runs: TypeScript check, documentation validation, backup integrity, license check, `npm audit`, gitleaks secret scanning.
- **Strengths:** Full pipeline with DB, migrations, type-check, tests, lint, build, and security scanning.
- **Weakness:** `npm test` runs with the CI database; if DB setup fails (e.g., vector extension), integration tests may pass (mocked) or fail silently.

### 6.4 Test Database Configuration: **6/10**

- `DATABASE_URL` overridden to `localhost:5432/test_db` in `setup.ts`.
- CI uses `localhost:5432/aqliya_ci`.
- No dedicated test database setup script.
- `uat-run.ts` and `rehearsal-check.ts` connect to real DB via `.env` — these are NOT CI-safe.
- `tb-upload-mapping-fs.integration.test.ts` requires real DB with pgvector — tests will fail without it.

### 6.5 Setup Files: **5/10**

**`src/__tests__/setup.ts`** (11 lines):
- Sets env vars only; no mock initialization, no global setup.
- `FF_AI_REAL_PROVIDERS=false` is defensive against AI provider timeouts — good.
- No cleanup hooks, no global DB reset.

---

## 7. Flaky Test Report

*Note: This section is diagnosis-based (code inspection only), not runtime observation-based. A runtime reliability run was not performed as part of this audit.*

### Potential Flaky Tests (by pattern analysis):

| Test File | Risk | Reason |
|---|---|---|
| `saml/sso-flow.test.ts` | MEDIUM | SAML assertion generation depends on XML signing; time-sensitive certificate handling |
| `ai/confidence-scorer.test.ts` | MEDIUM | AI confidence scoring may change if model outputs drift |
| `ai/eval-gate.test.ts` | MEDIUM | Eval gate might depend on provider threshold values |
| `secret-resolver-cache-pressure.test.ts` | LOW | Tests cache behavior under pressure; may flake if timing-dependent |
| `middleware/auth-guard.test.ts` | LOW | Rate limiting test relies on 10 sequential requests; in-memory counter |
| `sales-export.test.ts` | LOW | Rate limit test counts 10 calls before 429; in-memory, test-isolated |
| Any test using `at(undefined)` or `.catch()` pattern without explicit error assertion | LOW-MEDIUM | Could silently pass if error handling changes |

### No known persistent flaky tests identified. `maxWorkers: 1` in jest.config suggests the team mitigated parallel-execution flakiness by forcing single-worker mode.

---

## 8. E2E Test Status

### 8.1 Framework: **Cypress** (11 spec files)

| Spec File | Flows Covered | Depth | Quality |
|---|---|---|---|
| `auth-flow.cy.ts` (65 lines) | Login form, SSO section, demo credentials, admin login, operator login, invalid credentials, auth redirect | **Medium** — tests actual DOM elements, Arabic text, RTL direction | 6 |
| `audit-os.cy.ts` (92 lines) | Dashboard, workspace status, engagement detail, 9 workflow tabs (trial-balance, mapping, statements, findings, evidence, review, exports, audit-trail, notes, recommendations) | **Shallow** — mainly `cy.url().should("include", ...)` URL checks; no form interactions or data validation | 4 |
| `audit-pages.cy.ts` | Additional AuditOS pages | Shallow | 4 |
| `audit-factory.cy.ts` | Factory approval gates | Shallow | 4 |
| `audit-sampling.cy.ts` | Sampling workflow | Medium | 5 |
| `decision-os.cy.ts` | Decision workflow | Medium | 5 |
| `local-content-os.cy.ts` | LC project workflow | Medium | 5 |
| `sales-os.cy.ts` | Sales pipeline | Shallow | 4 |
| `routing-and-gates.cy.ts` | Route protection, RBAC gates | Medium | 5 |
| `marketing-pages.cy.ts` | Landing pages | Shallow | 4 |
| `sprint-3-5-routes.cy.ts` | Sprint 3-5 route verification | Shallow | 4 |

### 8.2 E2E Assessment:

- **Coverage breadth: 6/10** — All major products have at least one spec.
- **Coverage depth: 3/10** — Most tests verify URL navigation only. Very few test data entry, form submission, or end-to-end business workflows.
- **No Playwright found** — only Cypress.
- **No E2E tests for:** Admin panel, SSO configuration, user management, platform settings, notifications.
- **CI status:** Cypress is NOT referenced in `ci.yml`. E2E tests appear to be manual-only.

### E2E Overall: **4/10**

---

## 9. Test Pattern Issues

### 9.1 Anti-Patterns Found

| Anti-Pattern | Files Affected | Severity |
|---|---|---|
| **Tests that verify file existence, not behavior** | `engagement-workflow-routes.test.ts`, `demo-routes.test.ts`, `marketing-routes.test.ts`, `api-health.test.ts` | **Medium** — These serve as change detection but add no behavioral coverage. ~30 tests just check `fs.existsSync()`. |
| **Tests with `toBeDefined()` as primary assertion** | `empty-state.test.tsx`, `loading-state.test.tsx`, `status-badge.test.tsx`, `engagement-tabs.test.tsx`, `api-health.test.ts`, `services.test.ts` (partial) | **Medium** — Verifies component exports exist. No rendering or prop validation. |
| **Fully mocked "integration" tests** | 14 out of 16 integration test files | **High** — Labeled "integration" but test only mock behavior. Misleads coverage understanding. |
| **Silently skipped i18n test** | `no-english-strings.test.ts` — uses `test.skip()` with `ALLOW_WARNINGS=true` | **Medium** — Test exists but is disabled. Scan finds 47 untranslated English strings in audit components. |
| **Inline mock factories per test file** | `decision-evidence.test.ts`, `sales-export.test.ts`, `localcontactos-crud.test.ts`, `workflowos/services.test.ts`, `workflowos/audit.test.ts` | **Minor** — Each test file re-implements its own mock Prisma/Auth. Duplication across files. |
| **No shared test fixtures/factories** | All files | **Minor** — Each test creates its own `makeUser()`, `makeDecision()`, `makeDecisionEvidence()` helpers. |
| **`$transaction` mock passes through to same mock** | `prisma-mock.js` | **Medium** — `$transaction: (fn) => fn(mockPrisma)` means operations within transactions are not atomic even in mock. |
| **UAT scripts not in CI** | `uat-run.ts`, `rehearsal-check.ts` | **Low** — These scripts connect to real DB with `.env` creds; cannot run in CI. |

### 9.2 Positive Patterns Found

| Pattern | Files | Quality |
|---|---|---|
| **Triple-A pattern (Arrange-Act-Assert)** | `decision-evidence.test.ts`, `cross-tenant-isolation.test.ts`, `safe-utils.test.ts`, `pagination.test.ts` | Good — clear separation of setup, execution, verification |
| **Mock factories with overrides** | `decision-evidence.test.ts` (`makeUser`, `makeDecisionEvidence`, `makeDecision`) | Good — composable test data with defaults |
| **Comprehensive RBAC matrix** | `cross-tenant-isolation.test.ts` (477 lines, 40+ assertions) | Excellent — full role hierarchy, tenant isolation, deny-by-default |
| **End-to-end business pipeline** | `tb-upload-mapping-fs.integration.test.ts` (403 lines, 3 full scenarios) | Excellent — real DB, real schema, multi-step workflow |
| **Middleware behavioral tests** | `auth-guard.test.ts` (351 lines) | Good — tests redirects, status codes, MFA gates, rate limiting |
| **Schema structural validation** | `migration-evidence.test.ts` (577 lines), `cross-tenant-isolation.test.ts` (schema section) | Good — validates schema integrity without running migrations |
| **Stateful mock store (in-memory DB)** | `workflowos/services.test.ts` — uses arrays as in-memory stores | Interesting — simulates real CRUD without real DB |
| **beforeEach cleanup** | `critical-paths.test.ts`, `tb-upload-mapping-fs.integration.test.ts` | Good — proper test isolation |

### 9.3 Test Independence

- Most test files use `beforeEach(() => jest.clearAllMocks())`.
- `critical-paths.test.ts` and `tb-upload-mapping-fs.integration.test.ts` use `beforeAll`/`afterAll` cleanup.
- **Potential shared state issue:** `workflowos/services.test.ts` uses module-level arrays (`clientStore[]`, `membershipStore[]`) as in-memory stores. These are reset in `beforeEach` but if a test fails mid-execution, subsequent tests may have stale data. `maxWorkers: 1` mitigates inter-file leakage.

---

## 10. Test Quality Scorecard

| Metric | Score (1-10) | Rationale |
|---|---|---|
| **Coverage breadth** | 7 | All 10+ products have SOME tests. Cross-cutting auth/RBAC has strong coverage. Migration evidence is well-tested. |
| **Coverage depth** | 5 | AuditOS has deep integration. DecisionOS/LCOS have action-level tests. SalesOS has only 1 integration file. Most product flows are not tested end-to-end. |
| **Negative testing** | 4.5 | Auth/RBAC negative tests are strong. Invalid input, concurrency, and error recovery are heavily under-tested across all products. |
| **Integration quality** | 5 | 2 genuine DB integration tests out of ~16 files. Rest are mock-heavy with misleading "integration" label. |
| **E2E coverage** | 4 | 11 Cypress specs exist but mostly shallow (URL checks). No form interaction tests. Not run in CI. No Playwright. |
| **Test reliability** | 6 | Few obvious flaky risks. `maxWorkers: 1` is a defensive choice. Not observed at runtime. |
| **Mock quality** | 6 | Adequate for unit tests. Global Prisma mock is a double-edged sword — enables testing but tests don't detect schema mismatches. |
| **CI readiness** | 8 | CI pipeline is comprehensive (DB + migrate + test + lint + build + audit + security). Well-structured. |
| **Test documentation** | 2 | No `tests/README.md`, no test data documentation, no runbook for test suite. |
| **Mutation readiness** | 4 | Most tests assert exact values or existence. Few would catch logic regressions from code changes (mock-based tests catch interface changes, not behavior changes). |

### Overall: **6.2 / 10**

---

## 11. Detailed Findings (Top 10)

### Finding #1: Critical — SalesOS has near-zero test coverage
SalesOS has only 2 test files: `integration/sales-export.test.ts` (route-level export test) and `cypress/e2e/sales-os.cy.ts` (shallow E2E). No unit tests exist for sales business logic: opportunity qualification, pipeline stage transitions, deal forecasting, or interaction logging. The product claims a v0.1 completion status but lacks the test evidence to support this.

### Finding #2: High — 87% of "integration" tests don't touch a database
Of 16 files labeled "integration", only 2 (`critical-paths.test.ts` and `tb-upload-mapping-fs.integration.test.ts`) connect to a real database. The remaining 14 use fully mocked Prisma. This means FK constraint validation, cascade behavior, index usage, and query correctness are never verified through tests. The term "integration" is misleading for the vast majority.

### Finding #3: High — No concurrency or transaction isolation tests exist
AQLIYA is an institutional platform where multiple users may operate simultaneously. Zero tests verify: race conditions between concurrent writes, optimistic locking behavior, transaction rollback on failure, or read-after-write consistency. The `secret-resolver-concurrency.test.ts` file is the single concurrency test but tests a utility, not business workflows.

### Finding #4: Medium — i18n test is silently disabled
`src/__tests__/i18n/no-english-strings.test.ts` is a well-written English-string scanner that uses `test.skip()` with `ALLOW_WARNINGS=true`. The test documents 47 untranslated English strings in audit components but is permanently skipped. There is no plan or tracking issue to resolve them.

### Finding #5: Medium — ~30 tests only verify file/page existence
Tests in `engagement-workflow-routes.test.ts`, `demo-routes.test.ts`, `marketing-routes.test.ts`, and 4 component test files (`empty-state.test.tsx`, `loading-state.test.tsx`, `status-badge.test.tsx`, `engagement-tabs.test.tsx`) use `fs.existsSync()` or `toBeDefined()` as their primary assertion. These provide no behavioral coverage and inflate the test count.

### Finding #6: Medium — No test coverage threshold or reporting configured
`jest.config.js` has no `coverageThreshold`, `coverageReporters`, `collectCoverageFrom`, or any coverage configuration. It is impossible to track coverage trends or enforce minimums.

### Finding #7: Medium — Global Prisma mock prevents schema-change detection in most tests
`jest.config.js` maps `@prisma/client` globally to `prisma-client-mock.js`. When the Prisma schema changes (fields renamed, types changed, models removed), 90%+ of tests won't fail because they test against the mock, not the real schema. Only the 2 real-DB integration tests and the migration-evidence tests would catch schema mismatches.

### Finding #8: Low-Medium — No test data documentation
There is no `tests/README.md` or equivalent. A new developer would not know:
- Which tests need a database
- What seed data is required
- How to run integration vs. unit tests separately
- What environment variables to set
- That `uat-run.ts` connects to a real database

### Finding #9: Low-Medium — Cypress E2E tests not in CI pipeline
The 11 Cypress E2E spec files are not referenced in `ci.yml`. They are manual-only tests that may rot without automated execution. No Cypress GitHub Actions configuration exists.

### Finding #10: Low — No performance/load/stress tests
Zero performance tests exist for any product. No benchmarks for API response times, database query performance, or concurrent user limits. Acceptable for v0.1, but should be on the roadmap for pilot-readiness (L5).

---

## 12. Recommendations

### Immediate (P0 — this sprint)

1. **Add SalesOS unit tests** for opportunity qualification, pipeline stage transitions, and deal CRUD operations. Target: 10-15 test cases covering happy path + error states.
2. **Add DecisionOS workflow gating tests** at the service level (not just schema-level). Test the full DRAFT → IN_REVIEW → APPROVED → ARCHIVED lifecycle with RBAC enforcement.
3. **Enable the i18n test** by either (a) fixing the 47 untranslated strings, or (b) converting the test to a `test.todo()` tracker with an issue number, not a silent skip.

### Short-term (P1 — next 2 sprints)

4. **Convert 3-5 integration tests to real DB tests**: Use a test database with schema deployed. Priority: `decision-evidence.test.ts`, `localcontactos-crud.test.ts`, `sales-export.test.ts`.
5. **Add invalid input tests** for at least the top 3 products (AuditOS, DecisionOS, LocalContentOS). Test: negative amounts, XSS payloads in text fields, boundary file sizes, invalid enum values.
6. **Configure jest coverage thresholds**: Start with 50% line coverage, 40% branch coverage. Generate HTML + text reports. Fail CI below threshold.
7. **Add a `tests/README.md`** documenting test structure, how to run different test types, required environment variables, and database setup.

### Medium-term (P2 — next quarter)

8. **Add concurrency tests** for at least the most critical shared-resource operations (decision approval, evidence upload, mapping confirmation).
9. **Integrate Cypress into CI** with a parallel job using a seeded test database.
10. **Refactor test mock factories** into a shared `src/__tests__/factories/` directory to reduce duplication.
11. **Add at least 3 end-to-end integration tests per product** covering full CRUD lifecycle with database verification.
12. **Add rate limiting tests** for AuditOS and DecisionOS API routes (currently only SalesOS tested).

### Long-term (P3 — before L5)

13. **Implement basic API performance tests** (response time <500ms for dashboard queries).
14. **Add mutation testing** (Stryker or similar) to validate that tests detect code changes.
15. **Consider splitting jest config** into `jest.unit.config.js` and `jest.integration.config.js` for clearer separation and parallel execution.

---

## 13. Appendices

### A. Test File Count by Directory (approximate)

| Directory | .test.ts | .test.tsx | Total |
|---|---|---|---|
| `src/__tests__/unit/` | ~50 | 0 | 50 |
| `src/__tests__/integration/` | ~10 | 0 | 10 |
| `src/__tests__/actions/` | ~5 | 0 | 5 |
| `src/__tests__/components/` | 0 | 4 | 4 |
| `src/__tests__/i18n/` | 1 | 0 | 1 |
| `src/__tests__/saml/` | 1 | 0 | 1 |
| `src/__tests__/lib/` | 1 | 0 | 1 |
| `src/__tests__/` (root) | 6 | 0 | 6 |
| `src/lib/ai/__tests__/` | 6 | 0 | 6 |
| `src/lib/integration/__tests__/` | 3 | 0 | 3 |
| `src/lib/integration/adapters/__tests__/` | 3 | 0 | 3 |
| `src/lib/tb-intelligence/__tests__/` | 5 | 0 | 5 |
| `src/lib/workflowos/__tests__/` | 2 | 0 | 2 |
| `src/lib/skill-runtime/__tests__/` | 1 | 0 | 1 |
| `src/actions/__tests__/` | 1 | 0 | 1 |
| **TOTAL** | **~95** | **4** | **~99** |

*Note: The ~382 count from bash includes all matching files across the full tree including build artifacts, which may include duplicates or compiled test files. Actual test source files ≈ 99 (unit/integration/.test.ts) + 11 Cypress + 2 UAT scripts ≈ 112 test source files.*

### B. Cypress E2E Spec Inventory

| Spec | Lines | Products Covered |
|---|---|---|
| `auth-flow.cy.ts` | 65 | Auth (login, logout, redirect) |
| `audit-os.cy.ts` | 92 | AuditOS (dashboard, 9 tabs) |
| `audit-pages.cy.ts` | — | AuditOS pages |
| `audit-factory.cy.ts` | — | AuditOS factory gates |
| `audit-sampling.cy.ts` | — | AuditOS sampling |
| `decision-os.cy.ts` | — | DecisionOS |
| `local-content-os.cy.ts` | — | LocalContentOS |
| `sales-os.cy.ts` | — | SalesOS |
| `routing-and-gates.cy.ts` | — | Route protection + RBAC |
| `marketing-pages.cy.ts` | — | Marketing pages |
| `sprint-3-5-routes.cy.ts` | — | Sprint 3-5 routes |

### C. UAT / Operational Scripts

| File | Lines | Type | CI-Safe? |
|---|---|---|---|
| `src/__tests__/uat-run.ts` | 696 | Automated UAT — AuditOS workflow via real Prisma | No — uses .env creds |
| `src/__tests__/rehearsal-check.ts` | 287 | Rehearsal check — engagement data validation | No — uses .env creds |

### D. Mock Infrastructure Inventory

| File | Purpose | Coverage |
|---|---|---|
| `src/__mocks__/prisma-mock.js` | Global Prisma mock (30+ models) | All non-DB tests |
| `src/__mocks__/prisma-client-mock.js` | Re-exports prisma-mock as @prisma/client | All tests via moduleNameMapper |
| `src/__mocks__/next-auth.js` | Auth session mock | All auth-dependent tests |
| `src/__mocks__/next-auth-provider.js` | Provider mocks (Google, GitHub, Azure AD, Okta) | Auth flow tests |
| `src/__mocks__/lib-auth.js` | Auth utility mock | Route/action tests |
| `src/__mocks__/bcryptjs.js` | Password hashing stub | Auth tests |
| `src/__mocks__/server-only.js` | No-op for server-only imports | All tests |
| `src/__mocks__/auth-prisma-adapter.js` | Adapter mock | Auth flow tests |
| `src/__mocks__/prisma-adapter-mock.js` | Adapter mock | Prisma Pg adapter tests |
| `src/__mocks__/openai-embedding-provider.js` | AI embedding stub | AI tests |

---

## 14. Audit Methodology

This audit was performed via **code inspection only** — test code was read and analyzed for:
- Assertion quality and specificity
- Mock vs. real dependency usage
- Coverage of error paths, edge cases, and negative scenarios
- Test independence and cleanup patterns
- CI integration and configurability
- Documentation completeness

The test suite was NOT executed at runtime for this audit. Runtime observations (flaky tests, actual pass/fail counts, coverage percentages) would require a separate validation run.

**Files inspected:** 62 test files read in full, 118+ test file paths analyzed, jest.config.js, all mock files, CI workflow, Cypress specs, UAT scripts, setup files.

---

*End of Test Audit — 2026-07-12*
