# Backup Schedule Evidence

## Current Status

| Component             | Status            | Evidence                                        |
| --------------------- | ----------------- | ----------------------------------------------- |
| Manual backup command | ✅ Available      | `npm run db:backup` — pg_dump command displayed |
| Backup verification   | ✅ Available      | `npm run backup:verify` — data integrity check  |
| Scheduled automation  | ⏳ Not configured | Cron/systemd scheduler not yet deployed         |

## Recommended Schedule

| Frequency     | Type                   | Command                                                                                         | Retention |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------------------- | --------- |
| Every 6 hours | Full database dump     | `pg_dump -h localhost -U aqliya -d aqliya -F c -f /backups/auditos_$(date +%Y%m%d_%H%M%S).dump` | 30 days   |
| Daily         | Copy to remote storage | `rsync /backups/ user@remote:/backups/`                                                         | 90 days   |

## Cron Example (Linux)

```cron
# Full database dump every 6 hours
0 */6 * * * pg_dump -h localhost -U aqliya -d aqliya -F c -f /backups/auditos_$(date +\%Y\%m\%d_\%H\%M\%S).dump

# Cleanup backups older than 30 days
0 2 * * * find /backups/ -name "auditos_*.dump" -mtime +30 -delete
```

## Systemd Timer Example

```ini
# /etc/systemd/system/auditos-backup.service
[Unit]
Description=AuditOS database backup

[Service]
Type=oneshot
ExecStart=pg_dump -h localhost -U aqliya -d aqliya -F c -f /backups/auditos_%Y%m%d_%H%M%S.dump
```

```ini
# /etc/systemd/system/auditos-backup.timer
[Unit]
Description=Run AuditOS backup every 6 hours

[Timer]
OnCalendar=*:0,6,12,18
Persistent=true

[Install]
WantedBy=timers.target
```

## Cloud Scheduler (AWS Lambda / CloudWatch)

```bash
# Example: AWS RDS snapshot schedule
aws events put-rule --schedule-expression "cron(0 */6 * * ? *)" --name auditos-backup-rule
aws events put-targets --rule auditos-backup-rule --targets "Id"="1","Arn"="arn:aws:rds:..."
```

## Owner

| Task                         | Owner                | Due            |
| ---------------------------- | -------------------- | -------------- |
| Configure cron/systemd timer | Infrastructure admin | Pre-production |
| Verify backup execution      | Infrastructure admin | Weekly         |
| Test restore                 | Infrastructure admin | Monthly        |
