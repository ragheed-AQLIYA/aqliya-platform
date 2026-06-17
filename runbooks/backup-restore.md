# AQLIYA Backup & Restore Runbook

**Status:** Operational  
**Last updated:** 2026-06-17  
**Scope:** Covers backup strategy, manual backup, restore procedures, restore drills, verification, offsite storage, and disaster recovery for the AQLIYA platform database.

> **Cross-reference:** Script-level commands and env vars are documented in [`docs/operations/backup-restore-procedure.md`](../docs/operations/backup-restore-procedure.md). This runbook is the operator narrative; use both together.

---

## Table of Contents

1. [Backup Strategy](#1-backup-strategy)
2. [Environment Variables](#2-environment-variables)
3. [Running a Manual Backup](#3-running-a-manual-backup)
4. [Backup Storage & Retention](#4-backup-storage--retention)
5. [Restoring from Backup](#5-restoring-from-backup)
6. [Running a Restore Drill](#6-running-a-restore-drill)
7. [Verifying Backup Integrity](#7-verifying-backup-integrity)
8. [Offsite Backup Procedure](#8-offsite-backup-procedure)
9. [Testing Backup Locally](#9-testing-backup-locally)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Backup Strategy

AQLIYA uses **daily automated backups** with optional manual on-demand backups.

| Layer | Method | Schedule | Retention |
|-------|--------|----------|-----------|
| CI Automated (GitHub Actions) | pg_dump custom format via scripts/platform/backup.mjs | Daily at 02:00 AST (UTC+3) | 30 days (artifact retention) |
| Local/Manual | tsx scripts/platform/db-backup.ts | On demand | Unlimited (manual cleanup) |
| CI Workflow Trigger | workflow_dispatch on backup.yml | Manual via GitHub UI | 30 days |
| Scheduler (dev) | scripts/platform/db-backup-scheduler.ts | Configurable interval (default: 1h) | 30 files max |

### Backup Types

- **Full database dump** -- uses PostgreSQL pg_dump with custom format (-F c)
- **No owners or ACLs** -- backups use --no-owner --no-acl for portability
- **Compressed** -- custom format includes built-in compression

---

## 2. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | **Yes** | -- | PostgreSQL connection string (e.g. postgresql://user:pass@host:5432/db) |
| CONFIRM_RESTORE | For restore | false | Set to true to actually execute a restore (without this, restore runs in dry-run mode) |
| PGDUMP_PATH | No | Auto-detected | Path to pg_dump executable (useful on Windows where pg_dump may not be in PATH) |
| BACKUP_INTERVAL_MS | For scheduler | 3600000 (1h) | Interval in milliseconds between scheduled backups |
| BACKUP_MAX_FILES | For scheduler | 30 | Maximum backup files to keep locally |

---

## 3. Running a Manual Backup

### Quick backup (uses backup.mjs -- same as CI)

```bash
npm run backup
```

This runs scripts/platform/backup.mjs which:
1. Reads DATABASE_URL from environment
2. Creates backups/ directory if missing
3. Runs pg_dump with custom format (--format=c)
4. Saves as aqliya-backup-<timestamp>.sql in backups/
5. Prints file size
6. Cleans up old backups (keeps 30 most recent)

### TypeScript backup (more portable across OS)

```bash
npm run db:backup
```

This runs scripts/platform/db-backup.ts which:
1. Tries to locate pg_dump across common Windows/Unix paths (uses PGDUMP_PATH if set)
2. Parses DATABASE_URL for connection details
3. Runs pg_dump with explicit connection parameters
4. Saves as aqliya_backup_<timestamp>.dump in backups/

### Which one to use?

| Scenario | Command | Reason |
|----------|---------|--------|
| CI/CD pipeline | npm run backup | Matches the CI workflow exactly |
| Local development (Unix) | npm run backup | Simpler, uses DATABASE_URL directly |
| Local development (Windows) | npm run db:backup | Auto-detects pg_dump paths |
| Before destructive operations | npm run db:backup | Explicit parameter control |

---

## 4. Backup Storage & Retention

### CI Backups (GitHub Actions)

When the scheduled backup runs in CI:
1. The backup file is uploaded as a **GitHub Actions artifact**
2. Artifact name: database-backup-<run_id>
3. Retention: **30 days** (configurable in backup.yml)
4. To download: Navigate to **GitHub -> Actions -> Scheduled Database Backup -> latest run -> Artifacts**

### Local Backups

Backup files are stored in backups/ at the repository root:
- backups/aqliya-backup-<timestamp>.sql (from npm run backup)
- backups/aqliya_backup_<timestamp>.dump (from npm run db:backup)

Local retention:
- npm run backup: keeps 30 most recent files automatically
- npm run db:backup: no automatic cleanup (use scheduler or manual)

---

## 5. Restoring from Backup

### Safety First

The restore script has a **mandatory dry-run mode** to prevent accidental data loss.

```bash
# 1. Dry run (default -- safe)
npm run db:restore -- "<path-to-backup-file>"

# 2. Actual restore (deliberate)
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "<path-to-backup-file>"
```

**Important:** The restore drops and recreates the target database (pg_restore --clean). All existing data in the target database will be replaced.

### Step-by-step restore

```bash
# Step 1: Verify the backup file exists
Test-Path -LiteralPath "backups/aqliya_backup_2026-06-08.dump"

# Step 2: Dry run -- validate the backup can be restored
npm run db:restore -- "backups/aqliya_backup_2026-06-08.dump"
# Output: "DRY RUN -- set CONFIRM_RESTORE=true to execute."

# Step 3: Confirm you want to proceed
# Check DATABASE_URL is pointing to the correct target database
echo $env:DATABASE_URL

# Step 4: Execute restore
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "backups/aqliya_backup_2026-06-08.dump"

# Step 5: Verify the restored database
npm run backup:verify
```

### Restore from CI artifact

```bash
# 1. Download the artifact from GitHub Actions
#    GitHub -> Actions -> Scheduled Database Backup -> latest run -> Artifacts -> database-backup-<run_id>

# 2. Unzip the artifact
Expand-Archive -Path "database-backup-<run_id>.zip" -DestinationPath "./restore-temp"

# 3. Restore from the extracted file
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "./restore-temp/aqliya-backup-<timestamp>.sql"
```

---

## 6. Running a Restore Drill

Restore drills validate that backups are usable. They should be run **at least weekly** in production.

### Quick drill

```bash
npm run db:restore-drill
```

The drill script (scripts/platform/db-restore-drill.ts) performs:

| Step | Action | What it validates |
|------|--------|-------------------|
| 1 | Finds the latest backup in backups/ | Backup files exist |
| 2 | Runs npm run db:restore in dry-run mode | Backup file is valid and can be read |
| 3 | Checks file size | Backup file is not empty (prints size in MB) |
| 4 | Runs npm run backup:verify | Database connectivity + core table data |

### Interpreting drill results

```
=== AQLIYA Restore Drill ===

Backup file: C:\...\backups\aqliya_backup_2026-06-08.dump

Step 1: Dry run (validating backup file)...
DRY RUN -- set CONFIRM_RESTORE=true to execute.
  [PASS] Dry run: PASS

Step 2: Checking backup file integrity...
  File size: 12.34 MB
  [PASS] File integrity: OK

Step 3: Verification (read-only data check)...
  [PASS] Database connectivity: OK
  [PASS] Engagements: 5
  [PASS] Audit events: 142
  [PASS] Evidence: 23
  ...

==================================================
[PASS] Restore Drill: PASS
   Backup: C:\...\backups\aqliya_backup_2026-06-08.dump
   Size: 12.34 MB
   Date: 2026-06-08T12:00:00.000Z
==================================================
```

**If drill fails:**
- **No backup found** -> Run npm run db:backup first
- **Dry run FAILED** -> Backup file may be corrupt. Try creating a new backup or use an older backup file
- **Verification FAILED** -> Database may have data integrity issues. Investigate immediately

---

## 7. Verifying Backup Integrity

### Quick verification

```bash
npm run backup:verify
```

This runs scripts/platform/backup-verify.ts which checks:
1. **Database connectivity** -- can connect to the database
2. **Engagement count** -- ensures audit engagements exist
3. **Core table data** -- verifies these tables have >0 records:
   - Audit events (auditEvent)
   - Evidence (auditEvidence)
   - Findings (auditFinding)
   - Recommendations (auditRecommendation)
   - Users (auditUser)
   - AI outputs (auditAiOutput)

**Note:** This checks the **current live database**, not the backup file. It ensures the database is healthy and has expected data. Run it after a restore to confirm the restore succeeded.

---

## 8. Offsite Backup Procedure

Since CI artifacts expire after 30 days, periodically download and archive backups externally.

### Weekly offsite sync

```bash
# 1. Authenticate with GitHub CLI
gh auth login

# 2. List recent backup runs
gh run list --workflow="backup.yml" --limit 5 --json databaseId,createdAt

# 3. Download artifacts from the latest run
gh run download <run-id> --name "database-backup-<run-id>" --dir ./offsite-temp

# 4. Push to external storage (example: AWS S3)
# aws s3 cp ./offsite-temp/*.sql s3://aqliya-backups/production/

# 5. Push to alternative storage (example: Azure Blob)
# az storage blob upload --container-name backups --file ./offsite-temp/*.sql

# 6. Verify the upload
# aws s3 ls s3://aqliya-backups/production/

# 7. Cleanup temp files
Remove-Item -Recurse -Force ./offsite-temp
```

### Recommended external storage targets

| Target | Pros | Cons |
|--------|------|------|
| AWS S3 (or compatible) | Durable, cheap, versioning | Requires AWS credentials |
| Azure Blob Storage | Good if using Azure ecosystem | Requires Azure credentials |
| Google Cloud Storage | Geo-redundant | Requires GCP credentials |
| SFTP/network share | Simple, no cloud dependency | Limited redundancy |
| Wasabi / Backblaze B2 | Cheaper than S3 | Less ecosystem support |

### Offsite backup schedule

| Frequency | Action | Responsible |
|-----------|--------|-------------|
| Daily | CI backup -> GitHub artifacts | Automated |
| Weekly | Download artifacts -> push to external storage | Ops engineer |
| Monthly | Full restore drill from offsite backup | Ops lead |
| Quarterly | Documented DR test from offsite backup | Engineering lead |

---

## 9. Testing Backup Locally

### Prerequisites

- PostgreSQL installed locally (or Docker)
- pg_dump and pg_restore available on PATH (or set PGDUMP_PATH)
- Local .env file with DATABASE_URL

### Step-by-step local test

```bash
# 1. Ensure database is running
docker compose up -d db

# 2. Create a backup of your local database
npm run backup

# 3. Verify the backup was created
Get-ChildItem .\backups\*.sql

# 4. Create a separate test database
psql -U postgres -c "CREATE DATABASE aqliya_restore_test;"

# 5. Restore into the test database
$env:DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya_restore_test"
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "backups\aqliya-backup-<timestamp>.sql"

# 6. Verify the test database
npm run backup:verify

# 7. Clean up
psql -U postgres -c "DROP DATABASE aqliya_restore_test;"
```

---

## 10. Troubleshooting

### "pg_dump not found"

```bash
# Windows: Install PostgreSQL tools or set PGDUMP_PATH
$env:PGDUMP_PATH = "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"
npm run db:backup

# macOS: Install via Homebrew
brew install postgresql@16

# Linux: Install PostgreSQL client
sudo apt-get install postgresql-client-16
```

### "DATABASE_URL not set"

```bash
# Load from .env file (supported by db-backup.ts)
# For backup.mjs, you must export the variable:
$env:DATABASE_URL = "postgresql://user:pass@localhost:5432/aqliya"
npm run backup
```

### Dry run says "Would restore" but nothing happens

This is expected. Set CONFIRM_RESTORE=true to execute:

```bash
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "backups/your-backup-file.dump"
```

### Restore fails with "role does not exist"

Backups are created with --no-owner --no-acl. If you see role errors, ensure the PostgreSQL user in DATABASE_URL has sufficient privileges.

### Backup file is very large

- Custom format (-F c) includes compression, but large databases will produce large files
- Consider pruning old data before backup if the database is very large
- For databases >100MB, ensure the CI artifact upload step has sufficient timeout

### CI backup fails

1. Check GitHub Actions run logs for error details
2. Verify secrets.DATABASE_URL is set correctly in the repository
3. Run a manual backup locally to verify the database is accessible
4. Trigger a manual workflow via workflow_dispatch

---

## Appendix: Script Reference

| Script | Path | Invocation |
|--------|------|------------|
| Primary backup (CI) | scripts/platform/backup.mjs | npm run backup |
| TypeScript backup | scripts/platform/db-backup.ts | npm run db:backup |
| Backup scheduler | scripts/platform/db-backup-scheduler.ts | npm run db:backup (via scheduler) |
| Restore | scripts/platform/db-restore.ts | npm run db:restore -- <file> |
| Restore drill | scripts/platform/db-restore-drill.ts | npm run db:restore-drill |
| Backup verification | scripts/platform/backup-verify.ts | npm run backup:verify |
