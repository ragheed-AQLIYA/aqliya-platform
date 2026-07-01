# Backup Restore Drill Evidence

**Date:** 2026-06-06  
**Agent:** AGENT-C  
**Environment:** `localhost:5435/aqliya_staging`

| Item | Status |
| ---- | ------ |
| `npm run db:backup` | **PASS** — `aqliya_backup_2026-06-04T19-17-44-426Z.dump` (0.33 MB) |
| `npm run backup:verify` (post `seed:audit`) | **PASS** — engagements, events, evidence, findings |
| `db-restore-drill.ts` dry run | **PARTIAL** — restore CLI invoked; full destructive restore **not_executed** |
| `backup.yml` workflow | Present on `main` |

**Honest label:** Backup + integrity verify **PASS** on local staging proxy. Full production restore drill still **pending** operator sign-off per `docs/operations/backup-restore-procedure.md`.

**Commands (recorded):**

```powershell
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5435/aqliya_staging"
npm run db:backup
npm run backup:verify
npx tsx scripts/db-restore-drill.ts
```
