# Scripts Path Audit — Batch 14

**Date:** 2026-06-17  
**Purpose:** Inventory all binding references to `scripts/` before physical regroup.  
**Verdict:** Full regroup complete (Batches 15–18). Root holds only `mock-server-only.cjs` + `README.md`.

---

## Final layout (2026-06-17)

| Location | Count | npm-bound |
|----------|------:|-----------|
| `scripts/` root | 2 | `mock-server-only.cjs` preload only |
| `scripts/platform/` | 34 | Yes — postinstall, backup, CI smoke |
| `scripts/audit/` | 41 | Yes — tb:*, factory:*, phase-3* |
| `scripts/localcontent/` | 13 | Yes — lc:*, dev:localcontent-pilot |
| `scripts/ic/` | 13 | Yes — cycle6:*, local-ai:smoke, eval |
| `scripts/remediation/` | 8 | Ad-hoc |
| `scripts/workflowos/` | 5 | Ad-hoc |
| `scripts/ops/` | 9 | Ad-hoc |
| `scripts/dev/` | 2 | Ad-hoc |
| `scripts/archived/` | 25 | No |
| `scripts/compliance/` | 2 | Manual |
| `scripts/phase0-output/` | 4 JSON | Output |
| `scripts/product-factory/` | 1 README | Reserved |

---

## Regroup execution (completed)

Batches 15–17 moved npm-bound scripts; Batch 18 moved remaining ad-hoc root scripts. Checklist items 1–8 executed.

---

## Binding reference surfaces (historical — paths updated in Batches 15–17)

| Surface | Direct `scripts/` path refs | Notes |
|---------|----------------------------:|-------|
| `package.json` | **75** npm script entries | **59 unique** script files + `mock-server-only.cjs` preload |
| `.github/workflows/` | **3** lines in **3** workflows | Hard-coded paths (not via npm) |
| PowerShell wrappers | **5** cross-refs in **3** `.ps1` files | Invoke sibling scripts by path |
| `postinstall` | 1 | `validate-env.mjs` — runs on every `npm install` |
| `demo-smoke-check.mjs` | 2 | Hard-coded existence checks for pgvector scripts |
| CI via `npm run` | 1 | `backup:verify` in `backup.yml` |

### CI hard-coded paths (must update if moved)

| Workflow | Command |
|----------|---------|
| `.github/workflows/backup.yml` | `node scripts/platform/backup.mjs` |
| `.github/workflows/deploy.yml` | `node scripts/platform/post-deploy-smoke.mjs --base-url "$BASE_URL"` |
| `.github/workflows/promote.yml` | `node scripts/platform/post-deploy-smoke.mjs --base-url https://aqliya.com` |

### PowerShell cross-references

| File | Invokes |
|------|---------|
| `scripts/ic/cycle6-full-run.ps1` | `node scripts/ic/cycle6-smoke-report-stamp.mjs` |
| `scripts/ic/cycle6-remote-smoke.ps1` | `cycle6-operator-preflight.mjs`, `cycle6-smoke-report-stamp.mjs` |
| `scripts/localcontent/run-localcontent-pilot.ps1` | (self only — launched from package.json) |

### Critical shared preload

`scripts/mock-server-only.cjs` is referenced **22+ times** in `package.json` as:

```text
-r ./scripts/mock-server-only.cjs
```

Any regroup must either keep this at a stable path or update all npm entries atomically.

---

## package.json script inventory (59 unique files)

### Platform / ops (17)

`validate-env.mjs`, `backup.mjs`, `backup-verify.ts`, `db-backup.ts`, `db-restore.ts`, `start-standalone.mjs`, `staging-probe.mjs`, `post-deploy-smoke.mjs`, `test-auth-csrf-login.mjs`, `rtl-audit.ts`, `pilot-daily-monitor.ts`, `audit-health-check.ts`, `audit-action-guards.mjs`, `demo-smoke-check.mjs`, `bundle-analyzer.js`, `check-pgvector-health.mjs`, `verify-pgvector-staging.ts`, `verify-mfa-db.ts`

### Platform backfill / verify (10)

`backfill-platform-organizations.ts`, `backfill-client-workspaces.ts`, `verify-platform-organization-links.ts`, `verify-client-workspace-links.ts`, `verify-platform-audit-log-write.ts`, `verify-platform-audit-logs.ts`, `verify-auditos-dual-write.ts`, `verify-decisionos-dual-write.ts`

### Office AI verify (5)

`verify-office-ai-task-service.ts`, `verify-office-ai-file-validation.ts`, `verify-office-ai-extraction.ts`, `verify-office-ai-v01.ts`, `seed-office-ai.ts`

### AuditOS / TB / factory (14)

`tb-classification-preview.ts`, `tb-upload-demo.ts`, `tb-classification-benchmark.ts`, `tb-memory-reuse-rate.mjs`, `tb-memory-baseline-report.ts`, `shalfa-pilot-setup.mjs`, `shalfa-live-validation.mjs`, `shalfa-real-tb-classification.ts`, `factory-pilot-smoke.ts`, `factory-pilot-smoke-static.mjs`, `phase-3b-erp-intelligence-mining.mjs`, `phase-3b1-holdout-validation.ts`, `phase-3b2-stratified-holdout.ts`, `phase-3c-backfill-firm-memory.mjs`, `phase-3c-memory-validation.ts`, `phase-3d-validate-governance.ts`

### LocalContent (3)

`import-lc-verification-matrix.ts`, `lc-signals-from-engagement.ts`, `link-lc-project-audit.ts`

### IC / cycle / AI (6)

`local-ai-phase0-smoke.ts`, `ic-cycle5-smoke.ts`, `cycle6-governed-audit-smoke.ts`, `run-ic01-pgvector-test.ts`, `evaluate-skills.ts`, `cycle6-full-run.ps1`, `cycle6-remote-smoke.ps1`, `run-localcontent-pilot.ps1`

---

## Current layout (superseded — see Final layout above)

| Location | Count | Status |
|----------|------:|--------|
| `scripts/` (root flat) | ~120 | **Moved** — Batch 18 |
| `scripts/compliance/` | 2 | Already grouped |
| `scripts/product-factory/` | 1 (README) | Reserved |
| `scripts/phase0-output/` | 4 JSON | Generated output |
| `scripts/archived/` | **25** | One-time `_` prefix (Batch 14 move) |

---

## Proposed target structure (executed — Batch 15–18)

```
scripts/
├── README.md
├── mock-server-only.cjs          # keep at root (preload path stability)
├── platform/                     # validate-env, backup*, db-*, post-deploy-smoke, verify-platform-*
├── audit/                        # tb-*, shalfa-*, factory-*, phase-3b*, recon-*, audit-health
├── localcontent/                 # pilot-*, lc-*, multi-client-*, run-localcontent-pilot.ps1
├── ic/                           # ic-*, cycle6-*, local-ai-*, evaluate-skills
├── compliance/                   # existing
├── archived/                     # _* one-time scripts (DONE Batch 14)
├── product-factory/              # reserved
└── phase0-output/                # generated JSON
```

### Regroup execution checklist (when approved)

1. Create target subfolders
2. Move files in **one category per commit**
3. Update `package.json` paths for moved files (grep `scripts/<name>`)
4. Update CI workflow hard-coded paths (3 lines)
5. Update PowerShell wrappers (3 files)
6. Update `demo-smoke-check.mjs` hard-coded paths if pgvector scripts move
7. Update `scripts/README.md` + this audit
8. Run `npm run demo:smoke`, `npm run validate:env`, deploy smoke dry-run

**Estimated touch surface:** ~80 path updates across 5 file types.

---

## Batch 14 partial execution

| Action | Risk | Reversible |
|--------|------|------------|
| Move `scripts/_*` → `scripts/archived/` | **Low** | `git restore scripts/` |
| Create this audit doc | None | N/A |

**Not moved:** Any file referenced by `package.json`, CI, PowerShell wrappers, or `demo-smoke-check.mjs`.

---

## References

- `scripts/README.md` — operator inventory
- `docs/refactoring/repository-cleanup-2026-06-17/BATCH_LOG.md` — execution log
- `docs/refactoring/repository-cleanup-2026-06-17/TARGET_REPOSITORY_STRUCTURE.md` — target tree
