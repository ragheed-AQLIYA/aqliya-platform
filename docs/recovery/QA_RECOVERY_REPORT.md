# QA Recovery Report

**Branch:** `auditos/factory-memory-2026-06`  
**Date:** 2026-06-15  
**Scope:** Recovery validation — not full CI/build gate

---

## Commands Run

| Command | Result | Notes |
|---------|--------|-------|
| `npx tsc --noEmit` | **PASS** | Exit 0 |
| `npx prisma validate` | **PASS** | Schema valid |
| `npx prisma migrate status` | **WARN** | 3 migrations pending apply per CLI |
| `npm test -- firm-memory classification-explanation presentation-profile` | **PASS** | 5 suites, 25 tests |
| `npm run build` | **Not run** | Heavy — required before production |
| `npm run lint` | **Not run** | Full lint deferred |
| `npm test` (full suite) | **Not run** | Targeted only per recovery scope |
| `npm run phase-3c:validate` | **Not run this session** | Prior evidence: 100% memory-only |
| `npm run phase-3d:validate-governance` | **Not run this session** | Prior evidence: PASS post-backfill |

---

## Targeted Test Summary

| Suite | Tests | Status |
|-------|------:|--------|
| `firm-memory-governance.test.ts` | 5 | Pass |
| `firm-memory-lifecycle.test.ts` | 3 | Pass |
| `classification-explanation.test.ts` | 4 | Pass |
| `presentation-profile.test.ts` | (in 5 suites) | Pass |
| **Total** | **25** | **100% pass** |

---

## Failures / Flaky

None observed in targeted run.

---

## Missing Test Coverage (known gaps)

| Area | Gap |
|------|-----|
| TB Intelligence engine E2E | Integration test exists (`tb-upload-mapping-fs`) — not run |
| IFRS/SOCPA rules | Unit tests may exist under `rules/` — not run |
| FS Engine v2 rebuild | No full Cypress FS accuracy gate in this run |
| Shalfa pilot scripts | Manual/script validation only |
| Trust + Evidence UI | No Cypress mapping badge test run |

---

## Reproducibility Verdict

| Criterion | Status |
|-----------|--------|
| TypeScript compiles | ✅ |
| Core memory/governance unit tests | ✅ |
| Presentation profile tests | ✅ |
| Migrations valid SQL | ✅ (manual review) |
| Full build | ⏳ Not verified |
| Staging deploy | ⏳ Blocked until commits pushed + migrate deploy |

**Recovery QA:** **PASS WITH CONDITIONS** — commit + build gate required before merge to main.
