# AQLIYA Validation Evidence Registry

**Purpose:** Durable, timestamped outputs for build/test/lint/benchmark claims.  
**Authority:** Tier 3 per `docs/audits/recovery-strategy-2026-06-17/DOCUMENTATION_GOVERNANCE_V2.md`.  
**Operational truth:** `docs/source-of-truth/AQLIYA_CURRENT_STATE.md`

---

## Latest bundle — 2026-06-18 (final)

| Artifact | Command | Result |
|----------|---------|--------|
| [2026-06-18-final-git-head.txt](./2026-06-18-final-git-head.txt) | `git rev-parse HEAD` | commit hash |
| [2026-06-18-final-tsc.txt](./2026-06-18-final-tsc.txt) | `npx tsc --noEmit` | **PASS** (post-build) |
| [2026-06-18-local-ai-smoke.txt](./2026-06-18-local-ai-smoke.txt) | `npm run local-ai:smoke` | **PASS** — Ollama qwen3:8b |
| [2026-06-18-tb-benchmark.txt](./2026-06-18-tb-benchmark.txt) | `npm run tb:benchmark -- --limit 20` | **PASS** — AI 100% (20/20) |
| [2026-06-18-tb-benchmark-full.txt](./2026-06-18-tb-benchmark-full.txt) | `npm run tb:benchmark` (100) | **PASS** — AI **87%**, rules 65% |
| [2026-06-18-factory-smoke-static.txt](./2026-06-18-factory-smoke-static.txt) | `npm run factory:smoke:static` | **PASS** — 33 checks |
| [2026-06-18-terraform-validate.txt](./2026-06-18-terraform-validate.txt) | `terraform validate` | **BLOCKED** — CLI not installed locally |
| [2026-06-18-final-test.txt](./2026-06-18-final-test.txt) | `npm test` | **PASS** — 249 suites, 2462 tests |
| [2026-06-18-final-lint.txt](./2026-06-18-final-lint.txt) | `npm run lint` | **PASS** — 0 errors, ~240 warnings |
| [2026-06-18-final-build.txt](./2026-06-18-final-build.txt) | `npm run build` | **PASS** — 131 static pages |

Earlier same-day artifacts: `2026-06-18-{tsc,test,lint,build}.txt` (superseded by `-final-` after lint/code fixes).

## Follow-up — 2026-06-18 (Phase 2)

| Artifact | Command | Result |
|----------|---------|--------|
| [2026-06-18-staging-probe.txt](./2026-06-18-staging-probe.txt) | `STAGING_HOST=staging.aqliya.com npm run staging:probe` | **FAIL** — ENOTFOUND |
| [2026-06-18-production-probe.txt](./2026-06-18-production-probe.txt) | production health | **PASS** — HTTP 200, DB ok |
| [2026-06-18-production-smoke.txt](./2026-06-18-production-smoke.txt) | post-deploy smoke | **PASS** — 28/30 critical |
| [2026-06-18-cypress-full-v2.txt](./2026-06-18-cypress-full-v2.txt) | Cypress 11 specs | **152 pass**, 10 fail → fixed in `728df9d` |
| seed:audit (local) | `npm run seed:audit` | **PASS** — 23 TB lines |

## Follow-up — 2026-06-19

| Artifact | Command | Result |
|----------|---------|--------|
| [2026-06-19-final-test.txt](./2026-06-19-final-test.txt) | `npm test` (post RiskOS + InstMem graph) | **PASS** — 249 suites, 2462 tests |
| [2026-06-19-final-build.txt](./2026-06-19-final-build.txt) | `npm run build` | **PASS** — 131 routes |
| [2026-06-19-final-tsc.txt](./2026-06-19-final-tsc.txt) | `npx tsc --noEmit` | **PASS** |
| [2026-06-19-final-lint.txt](./2026-06-19-final-lint.txt) | `npm run lint` | **PASS** — 0 errors |
| [2026-06-19-staging-probe.txt](./2026-06-19-staging-probe.txt) | staging DNS | **FAIL** — ENOTFOUND staging.aqliya.com |
| [2026-06-19-production-smoke.txt](./2026-06-19-production-smoke.txt) | post-deploy smoke | **PASS** — 28/30 critical |
| [2026-06-19-cypress-sprint-3-5.txt](./2026-06-19-cypress-sprint-3-5.txt) | Cypress sprint-3-5 | **PASS** — 28/28 |

---

## Benchmark / smoke (historical)

| Artifact | Type |
|----------|------|
| `docs/audits/evidence/local-ai-phase0-smoke.json` | Local AI smoke 2026-06-16 |
| `docs/audits/evidence/tb-classification-rebenchmark.json` | TB benchmark Phase 1B |

---

## Regenerate

```powershell
cd C:\Users\PC\Documents\Aqliya
$d = "YYYY-MM-DD-final"
git rev-parse HEAD | Out-File "docs/reports/$d-git-head.txt"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build 2>&1 | Tee-Object "docs/reports/$d-build.txt"
npx tsc --noEmit 2>&1 | Tee-Object "docs/reports/$d-tsc.txt"
npm test 2>&1 | Tee-Object "docs/reports/$d-test.txt"
npm run lint 2>&1 | Tee-Object "docs/reports/$d-lint.txt"
```

Update `AQLIYA_CURRENT_STATE.md` and this README after each run.
