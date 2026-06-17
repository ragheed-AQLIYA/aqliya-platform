# Phase 20–24 remediation scripts

Historical scoring and clearance utilities from the repository hardening program. **Ad-hoc only** — not wired to `package.json`.

| Script | Purpose |
|--------|---------|
| `phase20-remediation.ts` | Phase 20 remediation pass |
| `phase20-verify.ts` | Phase 20 verification |
| `phase20-21-combined.ts` | Combined phase 20–21 run |
| `phase21-clearance.ts` | Phase 21 clearance |
| `phase21-inspect.ts` | Phase 21 inspection |
| `phase22-scoring.ts` | Phase 22 scoring |
| `phase23-rescore.ts` | Phase 23 rescore |
| `phase24-rescore.ts` | Phase 24 rescore |

Run with `npx tsx -r ../mock-server-only.cjs scripts/remediation/<script>` when importing server modules.
