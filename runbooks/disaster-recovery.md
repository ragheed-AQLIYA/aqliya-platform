# AQLIYA Disaster Recovery Runbook

**Status:** Operational  
**Last updated:** 2026-06-08  
**Scope:** Covers recovery from total database loss, step-by-step restore, post-restore verification, RTO guidelines, and rollback procedures for the AQLIYA platform.

---

## Table of Contents

1. [Disaster Classification](#1-disaster-classification)
2. [Recovery from Total Database Loss](#2-recovery-from-total-database-loss)
3. [Step-by-Step Restore Procedure](#3-step-by-step-restore-procedure)
4. [Post-Restore Verification](#4-post-restore-verification)
5. [Recovery Time Objective (RTO) Guidelines](#5-recovery-time-objective-rto-guidelines)
6. [Rollback Procedure for Failed Deployments](#6-rollback-procedure-for-failed-deployments)
7. [Communication Plan](#7-communication-plan)
8. [Post-Incident Review](#8-post-incident-review)

---

## 1. Disaster Classification

| Level | Severity | Description | Response |
|-------|----------|-------------|----------|
| L1 | **Critical** | Total database loss (data deleted, corrupted, or inaccessible) | Immediate DR activation |
| L2 | **High** | Partial data loss (specific tables/schemas corrupted) | Point-in-time recovery |
| L3 | **Medium** | Failed deployment with data migration issues | Rollback + restore |
| L4 | **Low** | Accidental data modification (single record) | Manual fix or point-in-time |

### When to declare a disaster

Declare a disaster if:

1. The production database is inaccessible or unresponsive
2. Data corruption is detected (e.g., backup:verify shows 0 records in core tables)
3. A deployment has irreversibly damaged data integrity
4. Accidental DROP/DELETE/TRUNCATE affects production data
5. The application cannot serve requests due to database state

---

## 2. Recovery from Total Database Loss

### Preconditions

Before attempting recovery, verify:

```bash
# 1. Confirm the database is actually down or corrupted
npm run backup:verify

# 2. Check database service status (varies by provider)
# Local Docker:
docker compose ps db
docker compose logs db --tail 50

# Managed PostgreSQL:
# psql -c "SELECT 1"
# Check cloud provider dashboard

# 3. Identify the most recent valid backup
# Local backups:
Get-ChildItem .\backups\*.sql,.\backups\*.dump | Sort-Object LastWriteTime -Descending

# CI artifacts:
gh run list --workflow="backup.yml" --limit 3 --json databaseId,createdAt,status
gh run download <run-id> --name "database-backup-<run-id>" --dir ./dr-restore

# 4. Check offsite storage for latest backup if local/CI are unavailable
# aws s3 ls s3://aqliya-backups/production/ --recursive
```

### Recovery Decision Tree

```
Is the database server running?
  |-- NO  -> Start the database server (docker compose up -d db / restart service)
  |         -> Run npm run backup:verify to check connectivity
  |         -> If still failing, proceed to restore from backup
  |
  |-- YES -> Is data accessible?
              |-- NO  -> Database may be corrupted
              |         -> Proceed to restore from backup
              |
              |-- YES -> Is data integrity verified?
                          |-- NO  -> core tables have 0 records or data anomalies
                          |         -> Proceed to restore from backup
                          |
                          |-- YES -> No disaster, investigate other causes
```

---

## 3. Step-by-Step Restore Procedure

### Phase 1: Preparation

```bash
# Step 1.1: Stop the application to prevent writes during restore
# Stop the Next.js server
# (if running as a service):
# sudo systemctl stop aqliya
# or:
# docker compose stop app
# or simply ensure no connections are being made

# Step 1.2: Verify the backup file
Test-Path -LiteralPath "backups/aqliya_backup_2026-06-08.dump"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backup file not found. Check CI artifacts or offsite storage."
}

# Step 1.3: Check backup file size (should be > 0 MB)
$file = Get-Item "backups/aqliya_backup_2026-06-08.dump"
$sizeMB = [math]::Round($file.Length / 1MB, 2)
Write-Host "Backup size: $sizeMB MB"
if ($sizeMB -eq 0) {
    Write-Error "Backup file is empty. Cannot restore."
}

# Step 1.4: Confirm DATABASE_URL target
Write-Host "Target database: $env:DATABASE_URL"
# Double-check this is the correct target and not accidentally a different environment
```

### Phase 2: Dry Run

```bash
# Step 2.1: Execute dry run
npm run db:restore -- "backups/aqliya_backup_2026-06-08.dump"

# Expected output:
#   DRY RUN -- set CONFIRM_RESTORE=true to execute.
#   Would restore: backups/aqliya_backup_2026-06-08.dump
#   From DATABASE_URL: (set)

# If dry run fails:
#   "Backup file not found" -> Check path
#   "DATABASE_URL is required" -> Verify env var is set
#   "Failed to parse DATABASE_URL" -> Check DATABASE_URL format
```

### Phase 3: Actual Restore

```bash
# Step 3.1: Set the confirmation flag
$env:CONFIRM_RESTORE = "true"

# Step 3.2: Execute restore
npm run db:restore -- "backups/aqliya_backup_2026-06-08.dump"

# This will:
# 1. Parse the PostgreSQL connection string
# 2. Run: pg_restore -U <user> -h <host> -p <port> -d <database> --clean <file>
# 3. The --clean flag drops existing objects before recreating them
# 4. Output progress to console

# Expected on success:
#   Restoring <host>:<port>/<database> from: <file>
#   ... (pg_restore output) ...
#   Restore complete.
```

### Phase 4: Verification

```bash
# Step 4.1: Verify database connectivity and data integrity
npm run backup:verify

# Step 4.2: Check the application starts correctly
# Start the application
docker compose up -d app
# or:
# npm run build && npm run start &

# Step 4.3: Run smoke tests
npm run smoke:local

# Step 4.4: Manual spot check (if applicable)
# Check recent engagements, user sessions, etc.
```

### Phase 5: Resume Service

```bash
# Step 5.1: Confirm application is serving requests
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# Step 5.2: Verify authentication works
npm run auth:smoke-local

# Step 5.3: Generate a fresh backup now that restore is confirmed
npm run db:backup

# Step 5.4: Log the incident and recovery steps
```

---

## 4. Post-Restore Verification

### Automated verification

```bash
# Run the backup verification script
npm run backup:verify
```

This checks:
- Database connectivity
- Audit engagement count
- Core table data presence (audit events, evidence, findings, recommendations, users, AI outputs)

### Manual verification checklist

| Check | Command/Action | Expected Result |
|-------|---------------|-----------------|
| Database connectivity | npm run backup:verify | All checks pass |
| Application responsiveness | curl http://localhost:3000 | HTTP 200 |
| User authentication | npm run auth:smoke-local | Login successful |
| Core workflows | Manual test via UI | Data visible, actions work |
| Recent data | Check latest records in UI | Data matches backup timestamp |
| AI outputs | Trigger an AI action if applicable | AI features work |
| File uploads/downloads | Upload/download a test file | Storage integration works |

### Data reconciliation

If you need to recover data created after the backup was taken:
1. Check application logs for transactions after the backup timestamp
2. Manually re-enter any critical data if necessary
3. Document any data loss for stakeholders

---

## 5. Recovery Time Objective (RTO) Guidelines

| Scenario | Target RTO | Typical Actual | Notes |
|----------|-----------|----------------|-------|
| Database service restart | 5 minutes | 1-2 minutes | Docker restart or cloud console |
| Restore from local backup | 30 minutes | 5-15 minutes | Depends on backup size |
| Restore from CI artifact | 45 minutes | 15-30 minutes | Includes download time |
| Restore from offsite storage | 60 minutes | 20-45 minutes | Depends on download speed |
| Full infrastructure rebuild | 4 hours | 1-3 hours | Provision server + database + restore |

### Factors affecting RTO

- **Backup size**: Larger backups take longer to download and restore
- **Network speed**: CI/offsite download speed
- **Database size**: pg_restore time scales with database size
- **Recovery point**: Older backups may need additional data recovery
- **Team availability**: After-hours recovery may take longer

### RTO improvement measures

- **Keep local backups**: Maintain the last 30 backups locally for fastest access
- **Automate verification**: CI already runs backup:verify after each backup
- **Weekly drills**: Run npm run db:restore-drill weekly to validate the process
- **Document credentials**: Ensure all team members have access to GitHub and offsite storage

---

## 6. Rollback Procedure for Failed Deployments

### When to roll back

Roll back a deployment if:
1. The application crashes or returns 500 errors
2. Data integrity checks fail after deployment
3. Schema migrations caused data loss
4. Critical features are broken
5. The deployment introduced security vulnerabilities

### Rollback methods

#### Method A: Git revert + redeploy

```bash
# Step 1: Identify the last known good commit
git log --oneline -10

# Step 2: Revert the bad deployment
git revert <bad-commit-hash>
# or for multiple commits:
git revert <oldest-bad-commit>..<latest-bad-commit>

# Step 3: Push the revert
git push origin main

# Step 4: Let CI deploy the reverted version
# Monitor the deployment pipeline
```

#### Method B: Direct database restore (if schema changed)

If the deployment included Prisma migrations that cannot be reverted:

```bash
# Step 1: Revert the application code (Method A)

# Step 2: Restore the database from a pre-deployment backup
# Identify the last backup taken before the deployment
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "backups/aqliya_backup_<pre-deployment-timestamp>.sql"

# Step 3: Regenerate Prisma client
npx prisma generate

# Step 4: Verify
npm run backup:verify
npm run smoke:local
```

#### Method C: Database-only rollback (if code is fine)

If only the database state needs to be rolled back:

```bash
# Step 1: Take a backup of the current (broken) state first
npm run db:backup

# Step 2: Restore from the last known good backup
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "backups/aqliya_backup_<good-timestamp>.dump"

# Step 3: Reapply any needed schema sync
npx prisma db push

# Step 4: Verify
npm run backup:verify
```

### Pre-deployment safety checklist

```bash
# Before every deployment:
# 1. Ensure a recent backup exists
npm run backup

# 2. Verify the backup is valid
npm run backup:verify

# 3. Note the backup filename for potential rollback
Get-ChildItem .\backups\*.sql,.\backups\*.dump | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# 4. Document the current database state
Write-Host "Pre-deployment backup: <filename>"
Write-Host "Pre-deployment verify: <pass/fail>"
```

---

## 7. Communication Plan

### Incident notification

| Role | Notify via | When |
|------|-----------|------|
| Engineering lead | Slack / Phone | Immediately on disaster declaration |
| Ops team | Slack / Incident channel | On DR activation |
| Product owner | Email / Slack | After assessment (within 30 min) |
| Stakeholders | Email | After recovery or within 2 hours |
| Users | Status page / email | If extended downtime expected (>1 hour) |

### Status updates

Provide updates every:
- **30 minutes** during active recovery
- **Hourly** during extended recovery
- **Upon resolution** with post-incident summary

### Status template

```
Subject: [AQLIYA] Incident Update -- <brief title>

Status: Investigating / Mitigating / Resolved
Impact: <what is affected>
Started: <timestamp>
Current action: <what we are doing>
ETA: <estimated resolution time>
Next update: <time>
```

---

## 8. Post-Incident Review

After every disaster recovery event, conduct a post-incident review within 5 business days.

### Review template

```markdown
## Post-Incident Review

### Incident Summary
- Date:
- Duration:
- Impact:
- Root cause:

### Timeline
- Detection:
- Response:
- Mitigation:
- Resolution:

### What went well
- 

### What went wrong
- 

### Improvements
- 

### Action Items
| Action | Owner | Due |
|--------|-------|-----|
| | | |
```

### Key metrics to track

- **Time to detect (TTD)**: How long from incident start to detection
- **Time to respond (TTR)**: How long from detection to active response
- **Time to resolve (TTRes)**: How long from response to full recovery
- **Data loss**: How much data was lost (if any)
- **Backup freshness**: Age of the backup used for recovery

---

## Appendix: Quick Reference Card

### Recovery in 5 commands

```bash
# 1. Verify disaster
npm run backup:verify

# 2. Find latest backup
Get-ChildItem .\backups\*.sql,.\backups\*.dump | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# 3. Dry run
npm run db:restore -- "backups/latest-backup-file.dump"

# 4. Restore
$env:CONFIRM_RESTORE = "true"
npm run db:restore -- "backups/latest-backup-file.dump"

# 5. Verify
npm run backup:verify
```

### Contacts

| Role | Contact |
|------|---------|
| Database admin | [Add contact] |
| DevOps lead | [Add contact] |
| Engineering lead | [Add contact] |
| Security lead | [Add contact] |
