# Test Reality Report — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Command:** `npm test` (Jest `--ci --passWithNoTests --forceExit`)

---

## Summary

| Metric | Value | Status |
|--------|------:|--------|
| Test Suites Total | 272 | VERIFIED |
| Test Suites Passed | 238 | VERIFIED |
| Test Suites Failed | 29 | VERIFIED |
| Test Suites Skipped | 5 | VERIFIED |
| **Suite Pass Rate** | **87.5%** | VERIFIED |
| Tests Total | 2,515 | VERIFIED |
| Tests Passed | 2,424 | VERIFIED |
| Tests Failed | 66 | VERIFIED |
| Tests Skipped | 25 | VERIFIED |
| **Test Pass Rate** | **96.4%** | VERIFIED |
| Duration | 19.7s | VERIFIED |

**Verdict:** Test suite is **substantial but not green**. Failures cluster in duplicate SalesOS test files and schema drift tests.

---

## Failure Categories

### 1. Duplicate SalesOS Test Files (24 suites) — VERIFIED

Files named `* (1).test.ts` under `src/lib/sales/` — appear to be accidental duplicates from file system copy:

- `institutional-learning (1).test.ts`
- `salesos-v01-lib (1).test.ts`
- `sales-services (1).test.ts`
- `proof-effectiveness (1).test.ts`
- `sales-rbac (1).test.ts` — also fails with `Credentials is not a function`
- ... (20 more)

**Impact:** Inflates failure count; pollutes CI signal.  
**Recommendation:** Delete all `(1).test.ts` and `(1).ts` duplicate files.  
**Effort:** 1 hour. **Severity:** High.

### 2. Migration Evidence Test — VERIFIED

```
FAIL src/__tests__/migration-evidence.test.ts
Expected latest migration: 20260603000001_add_platform_secret_and_notification
Received: 20260615110000_add_lead_schedule
```

**Impact:** Test expectation stale; migrations have progressed.  
**Effort:** 15 minutes to update test. **Severity:** Low.

### 3. Governance Retrieval Validation — VERIFIED

```
FAIL src/lib/governance/__tests__/retrieval-validation.test.ts
Unexpected task type: "pattern_improvement"
```

**Impact:** New governance task added without updating test fixture.  
**Effort:** 15 minutes. **Severity:** Low.

### 4. Integration Test (DB-dependent) — PARTIALLY VERIFIED

```
FAIL src/__tests__/integration/tb-upload-mapping-fs.integration.test.ts
```

Requires PostgreSQL on port 5433 (test compose). **Not run with test DB** — expected failure without `npm run test:integration:setup`.

---

## Test Scripts Inventory — VERIFIED (package.json)

| Script | Purpose | Run in Audit |
|--------|---------|--------------|
| `npm test` | Full Jest suite | **YES — FAIL (29 suites)** |
| `npm run test:unit` | Unit tests only | Not run |
| `npm run test:integration` | Integration (needs DB) | Not run |
| `npm run test:i18n` | i18n tests | Not run |
| `npm run test:e2e` | Cypress (needs build+server) | Not run |
| `npm run cy:run` | Cypress headless | Not run |
| `npm run demo:smoke` | Demo route smoke | Not run |
| `npm run smoke:local` | Post-deploy smoke | Not run |
| `npm run local-ai:smoke` | Ollama smoke | **YES — PASS** |
| `npm run audit:health` | AuditOS health | Not run |
| `npm run factory:smoke` | Factory pilot | Not run |

---

## Coverage — INSUFFICIENT EVIDENCE

No `jest --coverage` run was executed (heavy command). Coverage percentage is **UNVERIFIED**.

**Estimate from file counts:**
- 272 test files vs 1,968 source TS/TSX files ≈ **13.8% file-level test presence**
- AuditOS and LocalContentOS have strong test density
- LocalContactOS, Content Studio standalone have minimal tests

---

## Flaky / Dead Tests

| Category | Evidence |
|----------|----------|
| **Dead duplicates** | 24 `(1).test.ts` files — accidental copies, not intentional variants |
| **Stale assertions** | migration-evidence, retrieval-validation |
| **Flaky** | INSUFFICIENT EVIDENCE (single run only) |

---

## Local AI Smoke — VERIFIED PASS

```
npm run local-ai:smoke
overall: PASS
localProvider.execute: ollama/qwen3:8b, latencyMs=31662
runInference(preferProvider=local): PASS
artifact: docs/audits/evidence/local-ai-phase0-smoke.json
```

Note: `platformAuditLog.create()` failed (DB not running) but smoke overall PASS.

---

## Recommendations

| Priority | Action | Expected Outcome |
|----------|--------|------------------|
| P0 | Delete all `* (1).test.ts` and `* (1).ts` duplicates | ~24 suite failures eliminated |
| P1 | Update migration-evidence + governance test fixtures | 2 more suites green |
| P1 | Run `npm run test:integration:setup` then integration tests | Validate DB workflows |
| P2 | Add `jest --coverage` to CI with threshold gates | Measurable coverage |
| P2 | Run Cypress E2E after build fix | Runtime workflow validation |

---

**Doc claim check:** PRODUCT_STATUS_MATRIX claims "265 passing LocalContent tests" — **PARTIALLY VERIFIED** (LC tests pass within overall 2424 passing; exact LC count not isolated in this run).
