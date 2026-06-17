# Intelligence Core / cycle scripts

IC smoke tests, local AI phase-0, skill evaluation, and Cycle 6 staging orchestration.

**Moved here:** repository cleanup Batch 17 (2026-06-17).

## npm entry points

| npm script | Script |
|------------|--------|
| `ic:smoke:cycle5` / `:live` | `ic-cycle5-smoke.ts` |
| `local-ai:smoke` | `local-ai-phase0-smoke.ts` |
| `cycle6:smoke:audit-ai` | `cycle6-governed-audit-smoke.ts` |
| `cycle6:full-run` / `cycle6:remote-smoke` | PowerShell wrappers in this folder |
| `test:ic01:pgvector` | `run-ic01-pgvector-test.ts` |
| `eval:skills*` | `evaluate-skills.ts` |

## Related output

Phase 0 workflow JSON: `scripts/phase0-output/` (via `phase0-workflow-validation.ts`)

PowerShell wrappers use `$PSScriptRoot\..\..` for repo root.
