# Backup and Monitoring

## Database Backup Strategy

### Recommended Method

PostgreSQL `pg_dump` for logical backups. Suitable for the current deployment scale (single instance).

### Backup Frequency

| Environment | Frequency | Retention |
|-------------|-----------|-----------|
| Development | Not required | N/A |
| Pilot / Staging | Daily | 7 days |
| Production | Every 6 hours | 30 days |

### Manual Backup Command

```bash
pg_dump -h localhost -U aqliya -d aqliya -F c -f backup_$(date +%Y%m%d_%H%M%S).dump
```

Or via npm script:

```bash
npm run db:backup
```

### Restore Procedure

```bash
pg_restore -h localhost -U aqliya -d aqliya --clean backup_file.dump
```

Or via npm script:

```bash
npm run db:restore path/to/backup.dump
```

**Important:** Restore overwrites existing data. Only run in controlled environments.

### Audit Event Backup

`AuditEvent` records are append-only and critical for compliance. Ensure they are included in every backup cycle. Consider a separate archival strategy for audit events older than the retention period.

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BACKUP_DEST` | No | Backup destination path or S3 URI |
| `BACKUP_RETENTION_DAYS` | No | Number of days to retain backups |

---

## Health Check

A server-side health check utility is available at:

```
scripts/audit-health-check.ts
```

Usage:

```bash
npm run audit:health
```

Checks performed:
- Database connectivity
- Prisma availability
- Audit engagement count
- Audit event count
- AI output count
- Current timestamp

---

## Monitoring Checklist

### Before Production Deployment

- [ ] Database connectivity monitoring (external uptime check)
- [ ] Failed server action alerting
- [ ] Auth failure rate monitoring
- [ ] Tenant access denial monitoring
- [ ] Upload rejection monitoring (type, size, scanner)
- [ ] Scanner failure alerting (if SCANNER_PROVIDER configured)
- [ ] Approval failure monitoring
- [ ] Export failure monitoring
- [ ] High error rate alerting (>5% error rate in 5 minutes)
- [ ] Slow query detection (>1s queries)
- [ ] Disk usage monitoring for database server
- [ ] Backup success/failure alerting

### Recommended Tools

| Category | Tool | Notes |
|----------|------|-------|
| Database monitoring | pg_stat_statements | Built-in PostgreSQL |
| Error tracking | Sentry / OpenTelemetry | Application-level errors |
| Uptime monitoring | Health check endpoint | /api/health |
| Backup validation | Cron + notification | Automated backup verification |
| Log aggregation | Standard output / JSON logs | Structured logging |

---

## Operational Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Backup | `npm run db:backup` | Creates PostgreSQL dump |
| Health | `npm run audit:health` | Checks database and audit system health |
| DB console | `npx prisma studio` | Prisma Studio for data exploration (dev only) |
| Seed reset | `npm run seed:audit` | Resets demo data |

## Package.json Scripts

Add the following scripts to `package.json`:

```json
{
  "db:backup": "tsx scripts/db-backup.ts",
  "audit:health": "tsx scripts/audit-health-check.ts"
}
```
