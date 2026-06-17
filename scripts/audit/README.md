# AuditOS / TB scripts

Trial balance classification, Shalfa pilot, factory accuracy, reconciliation, and Phase 3B–3D intelligence mining.

**Moved here:** repository cleanup Batch 16 (2026-06-17).

## npm entry points

| npm script | Script |
|------------|--------|
| `tb:preview` | `tb-classification-preview.ts` |
| `tb:upload` | `tb-upload-demo.ts` |
| `tb:benchmark` | `tb-classification-benchmark.ts` |
| `tb:memory-reuse-rate` | `tb-memory-reuse-rate.mjs` |
| `tb:memory-baseline` | `tb-memory-baseline-report.ts` |
| `shalfa:setup` / `shalfa:validate` / `shalfa:tb-classify` | Shalfa pilot suite |
| `phase-3b:*` … `phase-3d:*` | ERP intelligence mining phases |
| `factory:smoke` / `factory:smoke:static` | Product factory pilot smoke |

Preload: `tsx -r ./scripts/mock-server-only.cjs scripts/audit/<script>` (mock path stays at repo `scripts/` root).

## Path note

Scripts use `resolve(__dirname, "../../.env")` and `../../docs/audits/evidence` for repo-root resources.

## Ad-hoc scripts (no npm alias)

`recon-*.mjs`, `p10-pl-simulation.mjs` … `p14-ga-mapping-gap.mjs`, `tb-reclassify-all.mjs`, `coa-phase-81-upsert.mjs`, etc.
