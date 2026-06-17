# AuditOS — Backup Scheduling

## Current State

- `npm run db:backup` — executes `pg_dump` via `scripts/platform/db-backup.ts`
- `npm run db:restore` — executes `pg_restore` via `scripts/platform/db-restore.ts` (dry-run by default)
- `npm run backup:verify` — data integrity check (validates tables have records)
- Backup files written to: `backups/` (gitignored)

## Recommended Schedule

| Frequency | Type | Retention |
|---|---|---|
| Before every pilot session | Full DB dump | 7 days |
| Daily (during active pilot) | Full DB dump | 30 days |
| Weekly | Verified restore test | 90 days |

## Manual Backup

```bash
npm run db:backup
```

## Automated Backup (cron example)

Add to crontab (Linux/macOS):

```cron
# Daily backup at 2:00 AM
0 2 * * * cd /path/to/aqliya && npm run db:backup >> backups/backup.log 2>&1

# Cleanup backups older than 30 days
0 3 * * * find /path/to/aqliya/backups/ -name "*.dump" -mtime +30 -delete
```

## Systemd Timer (Linux)

```ini
# /etc/systemd/system/aqliya-backup.service
[Unit]
Description=AuditOS database backup
After=network.target

[Service]
Type=oneshot
WorkingDirectory=/path/to/aqliya
ExecStart=/usr/bin/npm run db:backup
User=aqliya
```

```ini
# /etc/systemd/system/aqliya-backup.timer
[Unit]
Description=Run AQLIYA backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Enable: `systemctl enable --now aqliya-backup.timer`

## Test Database (Docker Compose)

For integration testing and restore verification:

```bash
docker compose -f docker-compose.test.yml up -d
DATABASE_URL="postgresql://aqliya_test:aqliya_test@localhost:5433/aqliya_test" npx prisma db push
```

The test DB uses port 5433 (does not conflict with the main DB) and runs with `tmpfs` storage (data lost on container stop — safe for testing).

## Restore Procedure

1. **Backup current state first**: `npm run db:backup`
2. **Dry-run restore** to validate backup file: `npm run db:restore -- backups/file.dump`
3. **Execute restore**: `CONFIRM_RESTORE=true npm run db:restore -- backups/file.dump`
4. **Verify**: `npm run backup:verify && npm run audit:health`
