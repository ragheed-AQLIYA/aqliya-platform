# LocalContentOS scripts

Pilot extraction, workbook analysis, LC verification matrix import, and dev server launcher.

**Moved here:** repository cleanup Batch 17 (2026-06-17).

## npm entry points

| npm script | Script |
|------------|--------|
| `dev:localcontent-pilot` | `run-localcontent-pilot.ps1` |
| `lc:matrix:import` | `import-lc-verification-matrix.ts` |
| `lc:signals` | `lc-signals-from-engagement.ts` |
| `lc:link-audit` | `link-lc-project-audit.ts` |

## Ad-hoc (no npm alias)

`pilot-analysis.cjs`, `pilot-extract*.cjs`, `multi-client-baseline.cjs`, `pilot-session-*.ts`

Preload for server-only modules: `tsx -r ./scripts/mock-server-only.cjs scripts/localcontent/<script>`
