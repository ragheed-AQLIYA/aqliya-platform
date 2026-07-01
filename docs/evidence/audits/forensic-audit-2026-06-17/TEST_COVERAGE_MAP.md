# TEST COVERAGE MAP — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Glob + prior executed `npm test` from `test-reality-report.md`  
**jest --coverage:** NOT RUN

---

## Executive Summary

| Metric | Value | Source |
|--------|------:|--------|
| Test files (`*.test.ts`) | **243** | Glob `src/**/*.test.ts` |
| Test suites (executed 2026-06-17) | 272 | test-reality-report |
| Tests total | 2,515 | test-reality-report |
| Pass rate | **96.4%** | test-reality-report |
| Suite pass rate | **87.5%** | test-reality-report |
| Source TS/TSX files | 1,968 | inventory-report |
| File-level test presence | **~12.3%** | 243/1968 (approximate) |

**Coverage percentage:** NOT VERIFIED (no coverage run).

---

## Test Execution Results (2026-06-17 — VERIFIED)

| Outcome | Suites | Tests |
|---------|-------:|------:|
| Passed | 238 | 2,424 |
| Failed | 29 | 66 |
| Skipped | 5 | 25 |

**Verdict:** Substantial suite, not green.

---

## Failure Categories (from test-reality-report — opened)

| Category | Suites | Evidence |
|----------|-------:|----------|
| Duplicate Sales `(1).test.ts` | 24 (prior audit) | **Current glob: 0 `(1).test.ts`** — may be fixed or uncommitted |
| Migration evidence stale | 1 | Expected migration ID mismatch |
| Governance retrieval fixture | 1 | New task type `pattern_improvement` |
| Integration TB test | 1 | Needs DB on 5433 |

---

## Module Test Density (VERIFIED counts)

### Strong coverage (test files present)

| Module | Test pattern | Evidence |
|--------|--------------|----------|
| AuditOS | `src/lib/audit/**/__tests__/` | Multiple files in glob |
| LocalContentOS | `src/lib/local-content/**/__tests__/` | workbook, erp, guards tests |
| Platform | `src/lib/platform/**/__tests__/` | vault, abac, storage, siem |
| Governance | `src/lib/governance/__tests__/` | validation suites |
| AI | `src/lib/ai/__tests__/` | eval-gate, spend, orchestrator |
| Auth/SCIM | `src/lib/auth/__tests__/scim-auth.test.ts` | Present |
| SalesOS | `src/lib/sales/**/__tests__/` | **Largest test cluster** |

### Weak / missing coverage

| Module | App code | Tests | Gap |
|--------|----------|-------|-----|
| RiskOS routes | `src/app/risk/` — 7 files | 0 in `src/lib/risk/` | **No lib tests** |
| LocalContactOS | 6 app files | 2 lib files | Thin |
| Content Studio | 12 app files | NOT VERIFIED | Likely gap |
| Marketing pages | 53+ files | NOT VERIFIED | Expected low |
| `(1)` duplicate sources | 19 files | N/A | Should not exist |

---

## Test Types Map

| Type | Config | Run in audit |
|------|--------|--------------|
| Unit | jest roots `src/` | YES — partial fail |
| Integration | `test:integration` | NO — needs docker 5433 |
| i18n | `test:i18n` | NO |
| E2E Cypress | `test:e2e`, `cy:run` | NO |
| Smoke | `local-ai:smoke`, `smoke:local` | local-ai PASS only |
| Post-deploy | `post-deploy-smoke.mjs` | NO |

---

## Scripts vs Test Reality

| Script | Purpose | Audit status |
|--------|---------|--------------|
| `npm test` | Full Jest | Executed — 29 suite failures |
| `npm run test:unit` | Unit only | NOT run |
| `npm run test:integration` | DB integration | NOT run |
| `npm run local-ai:smoke` | Ollama | PASS |
| `npm run audit:health` | AuditOS health | NOT run |

---

## CI Alignment

`deploy.yml` runs `npx tsc --noEmit` — **NOT `npm test`** in opened portion.

**Gap:** Type errors block deploy; test failures may not block deploy if CI doesn't run full suite.

**NOT VERIFIED:** Full `ci.yml` contents.

---

## Stale / Broken Tests (Evidence)

| Test | Issue | File |
|------|-------|------|
| migration-evidence | Wrong latest migration ID | `src/__tests__/migration-evidence.test.ts` |
| retrieval-validation | Unexpected task type | `src/lib/governance/__tests__/retrieval-validation.test.ts` |

---

## Recommended Coverage Actions

1. Delete `(1)` duplicate source files
2. Update migration-evidence expected ID
3. Update governance retrieval fixture
4. Add RiskOS tests when lib layer exists
5. Run `jest --coverage` after build fix for baseline
6. Confirm CI runs `npm test` — NOT VERIFIED

---

## NOT VERIFIED

- Line/branch coverage percentages
- Which page routes have E2E coverage
- Flaky test history
- Full list of 243 test file paths (glob truncated at 243)
