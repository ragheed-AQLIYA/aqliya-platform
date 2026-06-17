# Verification — Test Claims

**Verification date:** 2026-06-17 02:28 +03:00  
**Command:** `npm test`  
**Exit code:** `1`

---

## CLAIM: 238/272 suites pass, 29 fail, 96.4% test pass rate

### Raw summary (reproduced exactly)

```
Test Suites: 29 failed, 5 skipped, 238 passed, 267 of 272 total
Tests:       66 failed, 25 skipped, 2424 passed, 2515 total
Time:        ~22s
```

| Metric | Original Audit | Verification | Match |
|--------|---------------:|-------------:|:-----:|
| Suites passed | 238 | 238 | ✅ |
| Suites failed | 29 | 29 | ✅ |
| Suites total | 272 | 272 | ✅ |
| Tests passed | 2424 | 2424 | ✅ |
| Tests failed | 66 | 66 | ✅ |
| Test pass rate | 96.4% | 96.38% | ✅ |

**VERDICT:** **CONFIRMED**

---

## CLAIM: Duplicate `(1).test.ts` files cause most failures

### File count verification

```powershell
Get-ChildItem -Path src -Recurse -Filter "* (1).test.ts"
```

**Result:** **26 files** (original audit said 24 — off by 2)

### Unique failing suites (29 total)

| # | Suite | Root cause |
|---|-------|------------|
| 1–26 | `src/lib/sales/**/(1).test.ts` (26 files) | Duplicate test files — same modules tested twice; many fail on import/mock issues |
| 27 | `src/__tests__/migration-evidence.test.ts` | Stale expected migration name |
| 28 | `src/lib/governance/__tests__/retrieval-validation.test.ts` | New task `pattern_improvement` not in test fixture |
| 29 | `src/__tests__/integration/tb-upload-mapping-fs.integration.test.ts` | Requires Postgres test DB (port 5433) |

### Sample failure — migration-evidence

```
Expected: "20260603000001_add_platform_secret_and_notification"
Received: "20260615110000_add_lead_schedule"
```

### Sample failure — retrieval-validation

```
Unexpected task: "pattern_improvement" in listSupportedGovernanceTasks()
```

### Sample failure — sales-rbac (1).test.ts

```
TypeError: (0 , credentials_1.default) is not a function
  at src/lib/auth-config.ts:43:16
```

### Duplicate impact analysis

- **26 of 29** suite failures (89.7%) involve `(1).test.ts` duplicates
- Removing duplicates would likely leave **3** failing suites (migration, governance, integration)
- Original audit attribution **directionally correct**; count **26 not 24**

**VERDICT:** **CONFIRMED** (minor count error)

---

## False failure assessment

| Suite | False positive? | Reason |
|-------|---------------|--------|
| `(1).test.ts` ×26 | **YES** — artifact noise | Accidental copies, not intentional test variants |
| migration-evidence | **NO** | Real stale assertion |
| retrieval-validation | **NO** | Real code/test drift |
| tb-upload integration | **PARTIAL** | Expected fail without `test:integration:setup` |

---

## Raw output

Saved: `verification-test-output.txt`

**VERDICT:** Test statistics **CONFIRMED**. Duplicate file count **PARTIALLY CONFIRMED** (26 vs 24).
