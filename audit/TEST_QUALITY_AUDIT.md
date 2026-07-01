# TEST QUALITY AUDIT
**Independent Audit — AQLIYA Repository**
**Date:** 2026-06-25
**Classification:** Technical Due Diligence
**Auditors:** QA Lead · Staff Engineer

---

## 1. Test Infrastructure

### 1.1 Configuration

- **Framework:** Jest with ts-jest preset
- **Environment:** Node
- **Test files:** 306 total (297 under `src/__tests__` and `src/lib`, 9 elsewhere)
- **Workers:** `maxWorkers: 1` (serial execution, no parallelism)
- **Root discovery:** `src/` only — intentionally excludes `.claude/` and `docs/`

### 1.2 Global Mocking Strategy

**FINDING: CRITICAL**

The Jest configuration maps `@prisma/client` to `src/__mocks__/prisma-client-mock.js` for all tests. This is a wholesale in-memory replacement of the database layer. The mock implements an in-memory store using a `Map` keyed by model name, with auto-incrementing IDs and simple CRUD operations.

**What this means:** No test in the standard jest suite runs against a real database. Every test that exercises a repository method, action function, or service is testing behavior against a toy in-memory store, not the actual PostgreSQL + Prisma behavior.

Additional global mocks that suppress real implementations:
- `next-auth` → mock
- `@auth/prisma-adapter` → mock
- `bcryptjs` → mock
- `server-only` → mock
- `@/lib/ai/providers/openai-embedding-provider` → mock

### 1.3 CI Integration Tests

The `ci.yml` workflow does provision a real PostgreSQL (pgvector/pgvector:pg16) and runs `npx prisma migrate deploy` before `npm test`. However, `npm test` runs the same jest suite with the same `@prisma/client` mock — the real database is provisioned but **jest never connects to it**. The real DB is used only for migration validation (schema applies cleanly), not for behavioral test coverage.

---

## 2. Mock Coverage Analysis

### 2.1 Files with Mocks

- 143 test files use `jest.mock()` or `vi.mock()`
- 147 test files use `jest.fn()` / `vi.fn()`

This means essentially **every test file uses mocking**. This is not inherently wrong, but combined with the global Prisma mock, it means most "integration" tests are integration of mocked components, not real systems.

### 2.2 Cross-Tenant Isolation Test

`src/__tests__/cross-tenant-isolation.test.ts` is a critical test for a multi-tenant governance platform. Inspection reveals:

- Mocks `@/lib/auth` entirely with hand-rolled implementations
- Uses `makeUser()` factory with hardcoded `organizationId: "org-alpha"`
- Tests `requireOrgAccess()` which checks `user.organizationId !== organizationId` — but the real Prisma query that would enforce this at DB level is never executed

**Assessment:** The test verifies JavaScript-level tenant check logic (the `authorize()` function returns the correct result given mocked inputs). It does **not** verify that database queries actually scope to the correct organization. A query that accidentally omits `where: { organizationId: user.organizationId }` would pass all isolation tests.

### 2.3 Tenant Isolation Audit Test

`src/__tests__/tenant-isolation-audit.test.ts` — this is a static analysis test, not a runtime test. It reads source files and checks that tenant isolation patterns are followed. This is a valuable guard but it is a pattern-matching test against text, not behavioral verification.

---

## 3. Authorization Coverage

**FINDING: HIGH**

Authorization tests mock the authorization layer. There are no tests that verify:

1. What happens when `bypassTenantCheck: true` is passed to `authorize()` — no test asserts that an audit log entry is written or that this path is monitored.
2. That privilege escalation is blocked at the database layer (all tests mock Prisma).
3. That ABAC conditions (`abac-bridge.ts`) correctly block or allow operations based on attribute rules — ABAC is either mocked or tested in isolation.

The test suite verifies that the authorization *function* returns the right boolean given mocked inputs. It does not verify end-to-end enforcement.

---

## 4. AI Evaluation Coverage

**FINDING: MEDIUM**

`src/lib/core/ai/eval/` contains an evaluation framework with the following test suites:

- `disclosure-notes.ts`
- `financial-analysis.ts`
- `finding-summary.ts`
- `framework-self-test.ts`

However, `src/lib/ai/eval/suites/financial-analysis.ts` and related files are **corrupted binary files** (detected as `data` by filesystem). The eval suites in the legacy `src/lib/ai/` path cannot be executed.

The canonical eval suites in `src/lib/core/ai/eval/suites/` appear to be valid, but the eval runner (`eval-runner.ts`) itself uses only three metric functions: `exact_match`, `contains`, and `regex`. There is no semantic evaluation, no embedding-based similarity scoring, and no human-in-the-loop evaluation process.

For a platform claiming *"AI assists; humans decide; evidence governs"* as a trust principle, the AI evaluation framework tests string matching, not epistemic correctness or hallucination resistance.

---

## 5. Missing Coverage Areas

| Area | Coverage | Assessment |
|------|----------|------------|
| Real DB queries | None in jest | Critical gap |
| End-to-end auth enforcement | Mocked | High gap |
| Tenant isolation at query level | Not tested | High gap |
| AI hallucination / output quality | String matching only | Medium gap |
| SalesOS v02/vnext integration | Tests in corrupted files | Unknown state |
| SCIM provisioning | Some (import path case was fixed in commit history) | Partial |
| SSO flow | Mocked | Medium gap |
| Audit log chain integrity | Script exists but not in jest | Medium gap |

---

## 6. Test Quality Assessment

### 6.1 Weak Assertions

Many tests in the sales and AI layers use `expect(result).toBeDefined()` and `expect(result.id).toBeTruthy()` rather than asserting specific values. This is visible in test file names from the `.salesos-ts-errors.txt` artifact and the mock-heavy structure of `src/lib/sales/__tests__/`.

### 6.2 Over-Mocking

The global Prisma mock does not implement query filtering, relation loading, transaction semantics, or cascading deletes. A test asserting that a record is found after creation will pass even if the real Prisma query has incorrect `where` clauses, because the mock's `findMany` returns everything in the in-memory store regardless of filter.

### 6.3 Positive Findings

- 306 test files is a substantial investment in testing surface area.
- Tenant isolation has both unit-level logic tests and static analysis guards.
- SCIM tests exist and a case-sensitivity bug was caught and fixed in CI.
- The `no-english-strings.test.ts` i18n test is a creative static analysis guard.
- Cross-product signal tests exist in multiple layers.

---

## 7. Verdict

The test suite is large but architecturally shallow. The global Prisma mock means the test suite verifies application logic against a toy in-memory store. Real query correctness, tenant isolation at the database level, and authorization enforcement at the persistence layer are not tested. The AI eval framework uses string matching metrics that are insufficient for a financial governance platform.

**Test quality rating: INSUFFICIENT for enterprise governance deployment. Passes CI but does not verify the behaviors that matter most.**
