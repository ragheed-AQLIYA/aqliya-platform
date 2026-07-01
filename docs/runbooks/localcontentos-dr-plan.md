# LocalContentOS Disaster Recovery Plan — خطة التعافي من الكوارث

> **Product:** LocalContentOS under AQLIYA  
> **Level:** L5 Pilot-ready  
> **Status:** Active | Version 1.0 | 2026-07-01  
> **Applies to:** Production / Pilot deployments  
> **Language:** Bilingual (Arabic/English)

---

## Table of Contents — فهرس المحتويات

1. [RPO/RTO Definitions — تعريفات أهداف الاسترداد](#1-rporto-definitions--)
2. [Backup Procedure — إجراءات النسخ الاحتياطي](#2-backup-procedure--)
3. [Restore Procedure — إجراءات الاستعادة](#3-restore-procedure--)
4. [Failover Steps — خطابات التبديل](#4-failover-steps--)
5. [Data Replication Strategy — استراتيجية تكرار البيانات](#5-data-replication-strategy--)
6. [Recovery Verification Steps — خطوات التحقق من الاسترداد](#6-recovery-verification-steps--)

---

## 1. RPO/RTO Definitions — تعريفات أهداف الاسترداد

### Recovery Point Objective (RPO) — هدف نقطة الاسترداد

| Tier | RPO | When | Method |
|------|-----|------|--------|
| **Standard** | 1 hour | Scheduled backup | pg_dump via cron or backup scheduler |
| **Critical** | 5 minutes | WAL archival + streaming replication | PostgreSQL continuous archiving |
| **Pilot (Minimum)** | 24 hours | Daily backup | Manual 
pm run db:backup |

### Recovery Time Objective (RTO) — هدف وقت الاسترداد

| Scenario | RTO | Method |
|----------|-----|--------|
| RDS snapshot restore | ~30 minutes | AWS RDS snapshot promotion |
| pg_dump restore (local) | ~2 hours | 
pm run db:restore:drill + prisma migrate deploy |
| Container rebuild + restore | ~1 hour | Docker Compose + backup restore |

### LCOS-Specific Considerations — اعتبارات خاصة بالمحتوى المحلي

| Asset | Recovery Priority | Notes |
|-------|-------------------|-------|
| LCOS Database (projects, suppliers, workbooks) | **P1 — Critical** | Core business data, must restore first |
| Evidence files (uploads) | **P1 — Critical** | Required for audit trail; stored in ./uploads/ or S3 |
| AI pattern memory (industry + org) | **P2 — High** | Can be regenerated via pipeline re-run |
| Classification rules | **P2 — High** | Backed up as part of database |
| ERP connection config | **P3 — Medium** | Stored in env vars / vault, not database |

### Calculated Metrics for LCOS

| Metric | Standard | Critical (WAL) | Notes |
|--------|----------|----------------|-------|
| RPO | 1 hour | 5 minutes | LCOS data changes frequently during pilot |
| RTO (DB) | 2 hours | 30 minutes | Evidence restore adds time if local storage |
| Data loss tolerance | 1 hour max | Near-zero | Regulatory filings require RPO ≤ 1 hour |
| Recovery drill frequency | Monthly | Weekly | Must demonstrate successful restore |

---

## 2. Backup Procedure — إجراءات النسخ الاحتياطي

### Automated Backup (Scheduled) — النسخ الاحتياطي الآلي (مجدول)

`ash
# Start the backup scheduler (runs in background)
npm run db:backup:scheduler

# Default interval: every hour (configurable via BACKUP_INTERVAL_MS in env)
# Backup files are written to ./backups/ directory
`

### Manual Backup — النسخ الاحتياطي اليدوي

`ash
# Run a single backup
npm run db:backup

# This runs: tsx scripts/platform/db-backup.ts
# Creates: ./backups/aqliya_backup_<timestamp>.dump (custom format)
`

### Direct pg_dump (Alternative) — تفريغ قاعدة البيانات يدويًا

`ash
# Custom format (recommended for restore-drill)
pg_dump -Fc --no-owner --no-acl \
  -h localhost -U postgres -d aqliya_lc_pilot \
  -f ./backups/lcos_manual_$(date +%Y%m%d_%H%M%S).dump

# SQL format (portable, larger)
pg_dump --no-owner --no-acl \
  -h localhost -U postgres -d aqliya_lc_pilot \
  -f ./backups/lcos_manual_$(date +%Y%m%d_%H%M%S).sql
`

### Backup Verification — التحقق من النسخ الاحتياطي

`ash
# Check backup directory
ls -la ./backups/

# Verify latest backup
ls -t ./backups/aqliya_backup_*.dump | head -1

# Run restore drill (see Section 3)
npm run db:restore:drill
`

### Evidence Files Backup — نسخ احتياطي لملفات الأدلة

`ash
# If using local storage:
tar -czf ./backups/lcos_evidence_$(date +%Y%m%d).tar.gz -C ./uploads .

# If using S3: ensure versioning is enabled on the S3 bucket
# aws s3api put-bucket-versioning --bucket aqliya-localcontent-evidence --versioning-configuration Status=Enabled
`

### Backup Checklist — قائمة التحقق من النسخ الاحتياطي

- [ ] Backup script runs without errors
- [ ] Backup file size > 0 bytes
- [ ] Evidence files included in backup (or S3 exists)
- [ ] Backup file stored in a different location than production DB
- [ ] Backup encryption enabled (for offsite backups)
- [ ] Verify backup age < RPO window
- [ ] Log backup completion to monitoring system

---

## 3. Restore Procedure — إجراءات الاستعادة

### Restore Drill (Safe — Creates Scratch DB) — اختبار الاستعادة الآمن

The restore drill script creates a temporary database (qliya_drill_<timestamp>),
restores the backup into it, spot-checks row counts, then drops it.

`ash
# Prerequisites
# - pg_restore and psql in PATH (or Docker container available)
# - Postgres user has CREATEDB privilege
# - DATABASE_URL must be set in .env

# Usage — uses most recent backup
DATABASE_URL=<target-url> node scripts/platform/restore-drill.mjs

# Usage — specify backup file
DATABASE_URL=<target-url> node scripts/platform/restore-drill.mjs ./backups/aqliya_backup_20260701_120000.dump
`

#### Expected Output

`
[restore-drill] Using most-recent backup: aqliya_backup_20260701_120000.dump
[restore-drill] Drill database: aqliya_drill_2026-07-01T12-00-00
[restore-drill] Row counts after restore:
[restore-drill]   Organization: 2
[restore-drill]   User: 5
[restore-drill]   LocalContentProject: 3
[restore-drill]   LcWorkbook: 3
[restore-drill]   LcSupplier: 12
[restore-drill]   LcSpendRecord: 30
[restore-drill]   LcEvidence: 15
[restore-drill]   LcFinding: 5
[restore-drill]   LcReview: 2
[restore-drill] ✅ Restore verified — 587 total rows across spot-check tables.
[restore-drill] Drill database dropped: aqliya_drill_2026-07-01T12-00-00
`

#### LCOS-Specific Spot-Check Tables

The restore drill automatically checks these LCOS tables:

| Table | Minimum Expected | Notes |
|-------|-----------------|-------|
| LocalContentProject | ≥ 1 | Core LCOS entity |
| LcWorkbook | ≥ 1 | Scoring data |
| LcSupplier | ≥ 5 | Supplier records |
| LcSpendRecord | ≥ 10 | Spend data |
| LcEvidence | ≥ 1 | Evidence attachments |
| LcFinding | ≥ 1 | Gap findings |
| LcReview | ≥ 1 | Review records |

### Full Restore Procedure (Production) — إجراءات الاستعادة الكاملة (الإنتاج)

`ash
# Step 1: Identify latest backup
 = Get-ChildItem -Path .\backups\ -Filter "*.dump" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Restoring from: "

# Step 2: Stop application
# docker compose down OR stop the app service

# Step 3: Restore database
# Option A: Direct restore (overwrites existing DB)
# First, terminate connections
psql -h localhost -U postgres -d aqliya_lc_pilot -c "
SELECT pg_terminate_backend(pid) FROM pg_stat_activity
WHERE datname = 'aqliya_lc_pilot' AND pid <> pg_backend_pid();
"

# Option B: Create fresh database
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS aqliya_lc_pilot;"
psql -h localhost -U postgres -c "CREATE DATABASE aqliya_lc_pilot;"

# Restore
pg_restore --no-owner --no-acl -h localhost -U postgres -d aqliya_lc_pilot .FullName

# Step 4: Apply any pending migrations
npx prisma migrate deploy

# Step 5: Verify
npm run smoke:local -- --base-url http://localhost:3000
`

### Evidence Files Restore — استعادة ملفات الأدلة

`ash
# Local storage restore
tar -xzf ./backups/lcos_evidence_20260701.tar.gz -C ./uploads/

# S3 restore (if using versioning)
aws s3api get-object --bucket aqliya-localcontent-evidence --key evidence/abc123.pdf --version-id <version-id> ./restored/evidence/abc123.pdf

# Full S3 sync
aws s3 sync s3://aqliya-localcontent-evidence ./restored/evidence/
`

### RTO Tracking — تتبع وقت الاسترداد

After each restore drill, write a report:

`ash
# The restore-drill script generates a report automatically:
# ./backups/drill-reports/drill-<timestamp>.json
cat ./backups/drill-reports/drill-*.json | Select-Object -First 1
`

Report format:
`json
{
  "drillAt": "2026-07-01T12:00:00.000Z",
  "backupFile": "backups/aqliya_backup_20260701_120000.dump",
  "backupAgeMs": 3600000,
  "rpoMinutes": 60,
  "rowCountSpotCheck": 587,
  "status": "PASS",
  "rtoMs": 120000,
  "rtoMinutes": 2,
  "note": "Local drill DB — RDS production drill requires AWS snapshot restore per runbook"
}
`

---

## 4. Failover Steps — خطوات التبديل

### Scenario 1: Database Failure — فشل قاعدة البيانات

`ash
# 1. Detect failure
docker compose logs db --tail=20
curl http://localhost:3000/api/health/ready
# Expected: { "ok": false, "db": false }

# 2. Attempt restart
docker compose restart db

# 3. If restart fails, promote replica (if available)
# (For RDS: trigger Multi-AZ failover)
# aws rds failover-db-cluster --db-cluster-identifier aqliya-lc-cluster

# 4. Update DATABASE_URL to point to replica if needed

# 5. Verify
docker compose ps db
npm run smoke:local
`

### Scenario 2: Application Failure — فشل التطبيق

`ash
# 1. Check app logs
docker compose logs app --tail=50

# 2. Restart app container
docker compose restart app

# 3. If persistent, roll back to previous stable image
# docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d app

# 4. Verify health
curl http://localhost:3000/api/health
`

### Scenario 3: Full Site Failure — فشل الموقع بالكامل

`ash
# 1. Stop all containers
docker compose down

# 2. Restore DB from latest backup (see Section 3)

# 3. Start infrastructure
docker compose up -d db redis clamav

# 4. Wait for DB to be ready
docker compose exec db pg_isready -U postgres

# 5. Start application
docker compose up -d app

# 6. Run smoke tests
npm run smoke:local
npm run smoke:tier2
`

### Failover Risk Matrix — مصفوفة مخاطر التبديل

| Failure | Detection | Action | RTO | Data Loss |
|---------|-----------|--------|-----|-----------|
| DB instance crash | Health check fails | Restart DB / promote replica | 5-15 min | RPO window |
| Storage full | Disk alert | Clean old data / scale storage | 30 min | None |
| Application crash | 502 errors | Restart app | 2-5 min | In-flight requests |
| Data corruption | Query errors | Restore from backup | 1-2 hours | RPO window |
| Region outage | Cloud status | DNS failover to DR region | 1-4 hours | RPO window |

---

## 5. Data Replication Strategy — استراتيجية تكرار البيانات

### Database Replication — تكرار قاعدة البيانات

| Method | RPO | RTO | Complexity | Recommended For |
|--------|-----|-----|------------|-----------------|
| pg_dump (scheduled) | 1 hour | 2 hours | Low | Pilot / Dev |
| WAL streaming + replica | 5 minutes | 30 minutes | Medium | Production (single-region) |
| RDS Multi-AZ | 5 minutes | 1-2 minutes | Low (managed) | AWS Production |
| Logical replication (pglogical) | Near-zero | 5 minutes | High | Multi-region DR |
| RDS cross-region snapshot | 1 hour | 4 hours | Medium | Regulatory DR |

### Evidence Replication — تكرار الأدلة

| Storage Type | Method | Durability |
|--------------|--------|------------|
| Local ./uploads/ | External backup script | Manual |
| S3 Standard | S3 replication + versioning | 99.999999999% |
| S3 with Cross-Region Replication | CRR rule configuration | Multi-region |

### Recommended Setup for LCOS Pilot — الإعداد الموصى به للتجربة

`ash
# Minimum viable setup:
# 1. Daily pg_dump backup
npm run db:backup:scheduler

# 2. Weekly restore drill
npm run db:restore:drill

# 3. Local evidence backup
# Add to cron: tar -czf ./backups/evidence_weekly.tar.gz ./uploads/
`

### Multi-Region DR (Future — Not Implemented) — التعافي متعدد المناطق (مستقبلي)

PostgreSQL streaming replication architecture:
`
┌──────────────┐     WAL stream     ┌────────────────┐
│  Primary DB  │ ────────────────── │   Standby DB   │
│  (mec-1)     │                    │  (mec-2 / euw) │
└──────┬───────┘                    └────────────────┘
       │
       │ S3 replication (CRR)
       ▼
┌────────────────┐
│  Backup Bucket  │
│  (DR region)    │
└────────────────┘
`

---

## 6. Recovery Verification Steps — خطوات التحقق من الاسترداد

### Automated Verification — التحقق الآلي

`ash
# 1. Run restore drill (creates scratch DB, restores, verifies row counts, drops it)
DATABASE_URL=<target-url> node scripts/platform/restore-drill.mjs

# Success criteria:
# - Exit code 0
# - Row counts > 0 for all LCOS tables
# - Drill report written to ./backups/drill-reports/
`

### Manual Verification — التحقق اليدوي

`ash
# 2. Verify LCOS-specific data integrity
psql "" -c "
SELECT
  (SELECT COUNT(*) FROM \"LocalContentProject\") as projects,
  (SELECT COUNT(*) FROM \"LcSupplier\") as suppliers,
  (SELECT COUNT(*) FROM \"LcSpendRecord\") as spend_records,
  (SELECT COUNT(*) FROM \"LcWorkbook\") as workbooks,
  (SELECT COUNT(*) FROM \"LcEvidence\") as evidence,
  (SELECT COUNT(*) FROM \"LcFinding\") as findings,
  (SELECT COUNT(*) FROM \"LcReview\") as reviews;
"

# 3. Verify relationships (no orphaned records)
psql "" -c "
SELECT 'orphan_suppliers' as check_name, COUNT(*) FROM \"LcSupplier\" s
LEFT JOIN \"LocalContentProject\" p ON s.\"projectId\" = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 'orphan_spend', COUNT(*) FROM \"LcSpendRecord\" sp
LEFT JOIN \"LocalContentProject\" p ON sp.\"projectId\" = p.id
WHERE p.id IS NULL;
"
# Expected: 0 for all

# 4. Verify audit log presence
psql "" -c "
SELECT COUNT(*) FROM \"PlatformAuditLog\"
WHERE \"targetType\" LIKE 'lc%' OR \"productKey\" = 'localcontentos';
"
`

### Application-Level Verification — التحقق على مستوى التطبيق

`ash
# 5. Start the application
npm run build && npm run start

# 6. Run health checks
curl http://localhost:3000/api/health/ready

# 7. Run smoke tests
npm run smoke:local

# 8. Verify organic access to LCOS routes
# Login as admin and navigate to:
# - /local-content (dashboard loads with data)
# - /local-content/projects (seeded projects visible)
# - /local-content/workbook (scoring data present)

# 9. Verify evidence files are accessible
# Upload a test file to confirm storage backend works

# 10. Verify AI pipeline
# Check that FF_AI_REAL_PROVIDERS is set correctly
# Navigate to quality dashboard at /local-content/quality-dashboard
`

### Evidence Integrity Check — التحقق من سلامة الأدلة

`ash
# Check that evidence file hashes match database records
psql "" -c "
SELECT id, \"fileName\", \"fileHash\", \"fileSize\", \"storageProvider\", \"storageKey\"
FROM \"LcEvidence\"
WHERE \"fileHash\" IS NOT NULL
LIMIT 10;
"

# For each record, verify the file exists and hash matches
# (Automated check would compare fileHash against actual file)
`

### Restore Drill Report Example — مثال تقرير اختبار الاستعادة

`json
{
  "drillAt": "2026-07-01T12:00:00.000Z",
  "backupFile": "./backups/aqliya_backup_20260701_120000.dump",
  "backupAgeMs": 3600000,
  "rpoMinutes": 60,
  "rtoMs": 180000,
  "rtoMinutes": 3,
  "rowCountSpotCheck": 587,
  "status": "PASS",
  "lcosTablesVerified": [
    "LocalContentProject",
    "LcWorkbook",
    "LcSupplier",
    "LcSpendRecord",
    "LcEvidence",
    "LcFinding",
    "LcReview"
  ],
  "note": "LCOS DR drill — all tables verified, zero orphan records"
}
`

---

## Recovery Checklist Summary — ملخص قائمة التحقق من الاسترداد

### Daily (آلي/يومي)
- [ ] Backup runs successfully (check via log monitoring)
- [ ] Backup file size > 0

### Weekly (أسبوعي)
- [ ] Restore drill passes (row counts > 0)
- [ ] Drill report written to ./backups/drill-reports/
- [ ] Report reviewed for anomalies

### Monthly (شهري)
- [ ] Full application smoke test on restored data
- [ ] Evidence integrity check (hash verification)
- [ ] Failover simulation (stop DB → promote replica)
- [ ] RTO/RPO metrics reviewed and documented

### Quarterly (ربع سنوي)
- [ ] Full DR exercise with production cutover simulation
- [ ] Recovery documentation review and update
- [ ] Team training on recovery procedures

---

## Related Resources — الموارد ذات الصلة

| Resource | Path |
|----------|------|
| Deployment Runbook | docs/runbooks/localcontentos-deployment-runbook.md |
| Production Support | docs/runbooks/production-support-runbook.md |
| Restore Drill Script | scripts/platform/restore-drill.mjs |
| DB Backup Script | scripts/platform/db-backup.ts |
| Operator Guide | docs/runbooks/localcontentos-operator-guide.md |
| Pilot DB Setup | docs/releases/localcontentos-completion/localcontentos-lc-pilot-db-runbook.md |

---

## Document Record — سجل الوثيقة

| Item | Status |
|------|--------|
| Version | 1.0 |
| Date | 2026-07-01 |
| Author | Documentation Agent |
| Last Review | — |
| Production Claim | NO (pilot runbook) |

