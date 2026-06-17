# Platform operations scripts

Ad-hoc ops utilities. Most are **not** npm aliases — invoke directly.

| Script | Purpose |
|--------|---------|
| `run-retention.mjs` | Data retention dry-run / apply |
| `sync-migrations.mjs` | Migration sync helper |
| `migrate-local-storage-to-s3.ts` | Local → S3 storage migration |
| `repo-health-gate.mjs` | Repository health gate checks |
| `ensure-admin.mjs` / `ensure-admin-user.mjs` | Admin bootstrap |
| `check-admin-user.mjs` | Admin user verification |
| `execute-category-b-archive.ps1` | Category B doc archive (Windows) |
| `push-main-after-gh-auth.ps1` | Post-`gh auth` push helper |

Retention example:

```bash
node scripts/ops/run-retention.mjs --dry-run
```
