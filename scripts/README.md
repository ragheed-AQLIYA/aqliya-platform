# AQLIYA Scripts

> Inventory refresh. Last updated: **2026-06-17** (repository cleanup Batch 18 complete).  
> **Path audit:** `docs/refactoring/repository-cleanup-2026-06-17/SCRIPTS_PATH_AUDIT.md`

## Layout

```
scripts/
├── mock-server-only.cjs    # DO NOT MOVE — npm preload (-r ./scripts/mock-server-only.cjs)
├── README.md
├── platform/               # backup, deploy smoke, verify-*, db ops (34)
├── audit/                  # TB, Shalfa, factory, phase-3b–3d (41)
├── localcontent/           # LC pilot, matrix import (13)
├── ic/                     # IC smoke, cycle6, local AI, eval (13)
├── remediation/            # phase20–24 historical scoring (8)
├── workflowos/             # Sunbul/WorkflowOS seeds + E2E (5)
├── ops/                    # retention, migrations, admin bootstrap (9)
├── dev/                    # performance budget, locale QA (2)
├── archived/               # one-time `_` prefix scripts (25)
├── compliance/             # env/vault policy (2)
├── phase0-output/          # generated LC phase-0 JSON (4)
└── product-factory/        # reserved (README only)
```

**Root:** only `mock-server-only.cjs` + `README.md` (+ this tree). All other scripts live in subfolders.

## Quick Start

```bash
# Validate environment (also runs on postinstall)
npm run validate:env

# Demo route smoke (no server required)
npm run demo:smoke

# Backup
npm run backup

# Post-deploy smoke (local server)
npm run smoke:local
```

## Inventory Summary

| Folder | Count | npm aliases |
|--------|------:|-------------|
| `platform/` | 34 | Yes — backup, verify, smoke, db, office-ai |
| `audit/` | 41 | Yes — tb:*, shalfa:*, factory:*, phase-3* |
| `localcontent/` | 13 | Yes — lc:*, dev:localcontent-pilot |
| `ic/` | 13 | Yes — local-ai:smoke, cycle6:*, eval:* |
| `remediation/` | 8 | Ad-hoc only |
| `workflowos/` | 5 | Ad-hoc only |
| `ops/` | 9 | Ad-hoc only |
| `dev/` | 2 | Ad-hoc only |
| `archived/` | 25 | Do not run without reading script |
| `compliance/` | 2 | Manual |
| **Total script files** | **~157** | |

Subfolder READMEs: `platform/`, `audit/`, `localcontent/`, `ic/`, `remediation/`, `workflowos/`, `ops/`, `dev/`.

## npm Script Index

Prefer `npm run <script>` over ad-hoc paths. Full list:

```bash
grep scripts/ package.json
```

Common entry points:

| npm script | Path |
|------------|------|
| `validate:env` | `scripts/platform/validate-env.mjs` |
| `backup` / `backup:verify` | `scripts/platform/backup.mjs` / `backup-verify.ts` |
| `demo:smoke` | `scripts/platform/demo-smoke-check.mjs` |
| `smoke:local` | `scripts/platform/post-deploy-smoke.mjs` |
| `audit:health` | `scripts/platform/audit-health-check.ts` |
| `tb:*` | `scripts/audit/tb-*.ts` |
| `factory:smoke*` | `scripts/audit/factory-pilot-smoke.*` |
| `lc:*` | `scripts/localcontent/*` |
| `local-ai:smoke` | `scripts/ic/local-ai-phase0-smoke.ts` |
| `cycle6:*` | `scripts/ic/cycle6-*` |

## Notes

- `tsx -r ./scripts/mock-server-only.cjs` is required for scripts importing server-only modules.
- CI hard-coded paths updated in Batches 15–17 (see `SCRIPTS_PATH_AUDIT.md`).
- Archive and audit evidence docs may still cite old flat `scripts/` paths — intentional point-in-time snapshots.
