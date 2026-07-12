# AQLIYA Backup & Restore Drill

**Status:** Active | **Last updated:** 2026-07-08 | **Environment:** dev

---

## 1. Backup Inventory

| Resource | Backup Method | Retention | Status |
|----------|--------------|-----------|--------|
| RDS PostgreSQL | Automated snapshots | 1 day (pending maintenance window) | ✅ |
| AWS Backup Plan | Daily / Weekly / Monthly | 1 / 4 / 12 days | ✅ |
| Backup Vault | `aqliya-dev-backup-vault` | KMS-encrypted | ✅ |
| Terraform State | S3 (`aqliya-terraform-state`) + DynamoDB locking | Versioned | ✅ |

---

## 2. Backup Plan Details

| Rule | Schedule | Retention | Vault |
|------|----------|-----------|-------|
| Daily | `cron(0 2 * * ? *)` | 1 day | `aqliya-dev-backup-vault` |
| Weekly (Sun) | `cron(0 3 ? * 1 *)` | 4 days | `aqliya-dev-backup-vault` |
| Monthly (1st) | `cron(0 4 1 * ? *)` | 12 days | `aqliya-dev-backup-vault` |

### Status

```bash
# Check last backup jobs
aws backup list-backup-jobs \
  --by-resource-type RDS \
  --query 'BackupJobs[?State==`COMPLETED`].[BackupJobId,CreationDate]'
```

---

## 3. Restore Procedures

### 3.1 Restore RDS from snapshot

```bash
# 1. List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier aqliya-dev-db \
  --query 'DBSnapshots[?Status==`available`].[DBSnapshotIdentifier,SnapshotCreateTime]'

# 2. Choose snapshot and restore
SNAPSHOT_ID="rds:aqliya-dev-db-2026-07-08-02-00"

aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier aqliya-dev-db-restored \
  --db-snapshot-identifier "$SNAPSHOT_ID" \
  --vpc-security-group-ids sg-001e71cf0f3cfe3ec \
  --db-subnet-group-name aqliya-dev-db-subnet-group

# 3. Wait for restore to complete
aws rds wait db-instance-available \
  --db-instance-identifier aqliya-dev-db-restored

# 4. Verify the restored instance
aws rds describe-db-instances \
  --db-instance-identifier aqliya-dev-db-restored \
  --query 'DBInstances[0].{endpoint:Endpoint.Address,status:DBInstanceStatus}'

# 5. Get password from original secret
PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "aqliya/dev/db-password" \
  --query 'SecretString' --output text)

# 6. Point the app to the restored DB
RESTORED_ENDPOINT="<restored-endpoint>"
DATABASE_URL="postgresql://aqliya_admin:${PASSWORD}@${RESTORED_ENDPOINT}:5432/aqliya?sslmode=no-verify&connection_limit=20&pool_timeout=10"

aws secretsmanager put-secret-value \
  --secret-id "aqliya/dev/database-url" \
  --secret-string "$DATABASE_URL"

# 7. Force ECS deployment
aws ecs update-service \
  --cluster aqliya-dev-cluster \
  --service aqliya-dev-service \
  --force-new-deployment

# 8. Verify
curl https://dev.aqliya.com/api/health
```

### 3.2 Restore Terraform State

```bash
# Terraform state is stored in S3 with versioning
aws s3api list-object-versions \
  --bucket aqliya-terraform-state \
  --prefix "dev/terraform.tfstate"

# Restore a specific version
aws s3api get-object \
  --bucket aqliya-terraform-state \
  --key "dev/terraform.tfstate" \
  --version-id "<version-id>" \
  terraform.tfstate.restored

# Apply restored state
terraform state push terraform.tfstate.restored
```

### 3.3 Restore ECS task definition

```bash
# List task definition revisions
aws ecs list-task-definitions \
  --family-prefix aqliya-dev-app \
  --query 'taskDefinitionArns'

# Register the previous revision as current
aws ecs register-task-definition \
  --cli-input-json "$(aws ecs describe-task-definition --task-definition aqliya-dev-app:<revision> --query 'taskDefinition')"

# Update service to use it
aws ecs update-service \
  --cluster aqliya-dev-cluster \
  --service aqliya-dev-service \
  --task-definition aqliya-dev-app:<new-revision>
```

---

## 4. Restore Drill Checklist

| Step | Action | Status | Date |
|------|--------|--------|------|
| 1 | List available RDS snapshots | ⬜ | |
| 2 | Restore RDS from snapshot | ⬜ | |
| 3 | Verify restored DB is accessible | ⬜ | |
| 4 | Update database-url secret | ⬜ | |
| 5 | Force ECS deployment | ⬜ | |
| 6 | Verify app health (`/api/health`) | ⬜ | |
| 7 | Verify key data integrity (run query) | ⬜ | |
| 8 | Restore Terraform state (if needed) | ⬜ | |
| 9 | Clean up temporary resources | ⬜ | |
| 10 | Document drill results | ⬜ | |

**Frequency:** Run this drill every quarter (production) or every 6 months (dev).

---

## 5. Automated Restore Drill Script

A restore drill script exists at:

```
scripts/platform/restore-drill.mjs
```

This script performs a spot-check of row counts to verify backup integrity.

```bash
node scripts/platform/restore-drill.mjs
```

### What it checks

- RDS instance is accessible
- Key tables have expected row counts
- Generates a JSON report

---

## 6. Post-Restore Verification

After any restore, always verify:

```bash
# 1. Health endpoint
curl https://dev.aqliya.com/api/health
# Expected: {"status":"ok","database":{"ok":true}}

# 2. Data integrity (example queries)
# If you know specific data points, verify them

# 3. Application functionality
curl -o /dev/null -w "%{http_code}" https://dev.aqliya.com/
# Expected: 200

curl -o /dev/null -w "%{http_code}" https://dev.aqliya.com/login
# Expected: 200
```
