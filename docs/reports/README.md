# AQLIYA Validation Evidence Registry

**Purpose:** Durable, timestamped outputs for build/test/lint/benchmark claims.  
**Authority:** Evidence tier per `docs/audits/recovery-strategy-2026-06-17/DOCUMENTATION_GOVERNANCE_V2.md` §Tier 3.  
**Rule:** Status claims in `PRODUCT_STATUS_MATRIX.md` must link here or say **NOT RUN**.

---

## Index

| Date | Artifact | Command | Result | Commit | Notes |
|------|----------|---------|--------|--------|-------|
| 2026-06-18 | [2026-06-18-tsc.txt](./2026-06-18-tsc.txt) | `npx tsc --noEmit` | **PASS** | ad05b27 + WIP | 0 TS errors |
| 2026-06-18 | [2026-06-18-test.txt](./2026-06-18-test.txt) | `npm test` | **PASS** | ad05b27 + WIP | 247 suites, 2383 tests, 21 skipped |
| 2026-06-18 | [2026-06-18-lint.txt](./2026-06-18-lint.txt) | `npm run lint` | **FAIL** | ad05b27 + WIP | 3 errors, 234 warnings |
| 2026-06-18 | [2026-06-18-build.txt](./2026-06-18-build.txt) | `npm run build` | **PASS** | ad05b27 clean tree | Schema drift stashed; see below |
| 2026-06-17 | `docs/reports/validation-snapshot-2026-06-17.md` (historical) | full bundle | PASS | 0506d38 | Prior snapshot |

---

## Benchmark / smoke evidence (not re-run 2026-06-18)

| Artifact | Type | Location |
|----------|------|----------|
| Local AI phase-0 smoke | smoke | `docs/audits/evidence/local-ai-phase0-smoke.json` |
| TB classification rebenchmark | benchmark | `docs/audits/evidence/tb-classification-rebenchmark.json` |
| TB classification benchmark (Phase 1A) | benchmark | `docs/audits/evidence/tb-classification-benchmark.json` |

---

## How to regenerate

```powershell
cd C:\Users\PC\Documents\Aqliya
$d = Get-Date -Format "yyyy-MM-dd"
git rev-parse HEAD | Out-File "docs/reports/$d-git-head.txt"
npx tsc --noEmit 2>&1 | Tee-Object "docs/reports/$d-tsc.txt"
npm test 2>&1 | Tee-Object "docs/reports/$d-test.txt"
npm run lint 2>&1 | Tee-Object "docs/reports/$d-lint.txt"
npm run build 2>&1 | Tee-Object "docs/reports/$d-build.txt"
```

Update this README index after each run.

---

## Known working-tree caveat (2026-06-18)

Uncommitted `prisma/schema.prisma` adds `User` relations to `InstitutionalMemoryEvent` / `InstitutionalMemoryCollection` **without model definitions** → `npm run build` **FAILS** on dirty tree. Committed HEAD `ad05b27` builds clean. Fix: complete models or revert relation fields before merge.
