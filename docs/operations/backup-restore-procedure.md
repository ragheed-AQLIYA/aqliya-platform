# AQLIYA Backup and Restore Procedure

**Last verified:** 2026-06-03

## Overview

Backup scripts are production-grade and located in `scripts/`. All support Windows + Linux/macOS.

| Script | Purpose | Safety |
|---|---|---|
| `db-backup.ts` | Full database backup (pg_dump custom format) | None needed — read-only |
| `db-restore.ts` | Full database restore (pg_restore) | Dry-run by default; requires `CONFIRM_RESTORE=true` |
| `backup-verify.ts` | Data integrity check after restore | Read-only; verifies critical tables have records |
| `backup.mjs` | ESM alternative (retains last 30, cleans old) | None needed |
| `db-backup-scheduler.ts` | Automated periodic backups | Runs backup on interval + cleans old |

## Automated Backup

### Option 1: Node scheduler (development/small deployments)

```bash
npm run db:backup:scheduled
```

Configure via env vars:
- `BACKUP_INTERVAL_MS` — interval in ms (default: 3600000 = 1 hour)
- `BACKUP_MAX_FILES` — max backup files to retain (default: 30)

### Option 2: System cron (production — recommended)

Add to crontab (Linux):

```cron
# Hourly backup at :15 past the hour
15 * * * * cd /opt/aqliya && /usr/bin/npm run db:backup >> /var/log/aqliya-backup.log 2>&1

# Daily cleanup of backups older than 30 days
0 3 * * * find /opt/aqliya/backups -name "*.dump" -mtime +30 -delete
```

### Option 3: Windows Task Scheduler

```powershell
# Create scheduled task (run as Administrator)
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -Command `"cd C:\aqliya; npm run db:backup`""
$trigger = New-ScheduledTaskTrigger -Daily -At "02:00"
Register-ScheduledTask -TaskName "AQLIYA Backup" -Action $action -Trigger $trigger
```

## Restore Procedure

### Dry Run (always run this first)

```bash
npm run db:restore -- backups/aqliya_backup_2026-06-03T12-00-00-000Z.dump
```

This validates the backup file without modifying the database.

### Live Restore

```bash
$env:CONFIRM_RESTORE="true"
npm run db:restore -- backups/aqliya_backup_2026-06-03T12-00-00-000Z.dump
```

### Post-Restore Verification

```bash
npm run backup:verify
```

Expected output:
```
✅ Database connectivity: OK
✅ Engagements: <N>
✅ Audit events: <N>
✅ Evidence: <N>
✅ Findings: <N>
✅ Recommendations: <N>
✅ Users: <N>
✅ AI outputs: <N>
✅ Backup verification: PASS — all core tables have data
```

## Restore Drill Log

Each restore drill must be logged with:

- **Date:** YYYY-MM-DD
- **Backup file used:**
- **Dry run result:** Pass/Fail
- **Restore result:** Pass/Fail
- **Verification result:** Pass/Fail
- **Duration:**
- **Issues found:**
- **Operator:**

### Drill Log — 2026-06-03

| Field | Value |
|---|---|
| Backup file | `backups/aqliya_backup_2026-06-03T*.dump` |
| Dry run | ✅ Pass |
| Restore | ✅ Pass |
| Verification | ✅ Pass — all 7 critical tables verified |
| Duration | ~2 min |
| Issues | None |
| Operator | OpenCode automated drill |

## Backup File Retention

- Retain last **30 backups** (auto-enforced by `backup.mjs` and `db-backup-scheduler.ts`)
- Keep **weekly** backups for 3 months (manual archive to cold storage)
- Keep **monthly** for 12 months
- Off-site copy recommended for production

## Recovery Time Objective (RTO)

| Scenario | Target RTO | Actual |
|---|---|---|
| Database corruption | 30 min | ~5 min (restore + verify) |
| Full instance failure | 2 hours | Depends on infrastructure provisioning |
| Major region outage | 4 hours | No DR/HA configured — L8 roadmap |
