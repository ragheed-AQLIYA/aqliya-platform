# Platform scripts

Operational, verification, backup, and deployment helpers for AQLIYA Core.

**Moved here:** repository cleanup Batch 15 (2026-06-17).

## Entry points

Prefer `npm run` commands — see `scripts/README.md` npm index.

Critical CI paths:

- `scripts/platform/backup.mjs` — `.github/workflows/backup.yml`
- `scripts/platform/post-deploy-smoke.mjs` — deploy + promote workflows
- `scripts/platform/validate-env.mjs` — `postinstall`

## Path note

Scripts in this folder use `resolve(__dirname, "../../.env")` (repo root), not `../.env`.
