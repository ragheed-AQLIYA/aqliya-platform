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
| [2026-06-18-final-test.txt](./2026-06-18-final-test.txt) | `npm test` | **PASS** — 247 suites, 2383 tests |
| [2026-06-18-final-lint.txt](./2026-06-18-final-lint.txt) | `npm run lint` | **PASS** — 0 errors, ~240 warnings |
| [2026-06-18-final-build.txt](./2026-06-18-final-build.txt) | `npm run build` | **PASS** — 131 static pages |

Earlier same-day artifacts: `2026-06-18-{tsc,test,lint,build}.txt` (superseded by `-final-` after lint/code fixes).

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
