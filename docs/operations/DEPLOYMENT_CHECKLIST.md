# AQLIYA Production Deployment Checklist

> **Version:** 1.0
> **Date:** 2026-07-25
> **Scope:** Production deployment of AQLIYA platform (Next.js 16, PostgreSQL 16, Prisma 7, Node.js 22, AWS ECS Fargate)
> **Owner:** DevOps Team
> **Dependencies:** `production-deployment-runbook.md`, `GO_NOGO_CRITERIA.md`

---

## 1. Pre-Deployment Verification

All gates must pass before starting deployment. Conduct these checks in the staging environment first, then verify identical results in production.

### 1.1 Code Quality Gates

```bash
# Type-check (must be 0 errors)
npx tsc --noEmit

# Unit + integration tests (must be all pass, 0 failures)
npm test

# Production build (must succeed without errors)
npm run build

# Lint (must be 0 new warnings/errors; pre-existing documented warnings only)
npm run lint -- --quiet
```

| Check | Command | Threshold | Pass/Fail |
|-------|---------|-----------|-----------|
| TypeScript | `npx tsc --noEmit` | 0 errors | |
| Tests | `npm test` | 0 failures, all suites pass | |
| Build | `npm run build` | Exit code 0, `.next/` produced | |
| Lint | `npm run lint -- --quiet` | 0 new errors | |

### 1.2 Environment Verification

```bash
# Validate required environment variables
node scripts/platform/validate-env.mjs

# Verify production env values (manual — checklist)
# - DATABASE_URL points to production RDS
# - AUTH_SECRET = NEXTAUTH_SECRET (32+ chars)
# - NEXTAUTH_URL = https://app.aqliya.com
# - STORAGE_PROVIDER = s3
# - S3_BUCKET + S3_ENDPOINT configured
# - RATE_LIMITER = redis
# - REDIS_URL points to production ElastiCache
# - SCANNER_PROVIDER = clamav
# - CLAMAV_HOST + CLAMAV_PORT configured
```

| Check | Verification |
|-------|-------------|
| `DATABASE_URL` | Points to production RDS (verify hostname) |
| `AUTH_SECRET` | 32+ characters, matches `NEXTAUTH_SECRET` |
| `RATE_LIMITER` | Set to `redis` |
| `SCANNER_PROVIDER` | Set to `clamav` |
| `STORAGE_PROVIDER` | Set to `s3` (verify bucket exists) |
| `NODE_ENV` | `production` |

### 1.3 Prisma Validation

```bash
# Validate schema syntax
npx prisma validate

# Check migration status (must show no pending drifts)
npx prisma migrate status
```

### 1.4 Pre-Flight Summary

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm test` — all suites pass (5,691+ tests, 0 failures)
- [ ] `npm run build` — exit code 0
- [ ] `npm run lint -- --quiet` — 0 new errors
- [ ] `node scripts/platform/validate-env.mjs` — all vars present
- [ ] `npx prisma validate` — schema valid
- [ ] `npx prisma migrate status` — no drifts
- [ ] Redis reachable: `redis-cli -h <host> -p <port> ping`
- [ ] Database reachable: `psql $DATABASE_URL -c "SELECT 1"`
- [ ] S3 bucket accessible (IAM role verified)
- [ ] ECR image built and pushed
- [ ] Staging smoke tests pass: `npm run smoke:tier3:http -- --base-url https://staging.aqliya.com`

---

## 2. Database Migration Steps

### 2.1 Pre-Migration Backup

```bash
# Take production backup before any migration
npm run db:backup

# Verify backup integrity
npm run backup:verify
```

### 2.2 Apply Migrations

```bash
# Step 1: Preview pending migrations
npx prisma migrate status

# Step 2: Apply all pending migrations (safe — reads migration files, never resets data)
npx prisma migrate deploy

# Step 3: Verify migration applied correctly
npx prisma migrate status
# Expected: "The database is already in sync with the current schema" (or similar)

# Step 4: Regenerate Prisma client
npx prisma generate
```

### 2.3 Migration Safety Rules

| Rule | Description |
|------|------------|
| Never `migrate dev` | `prisma migrate dev` resets data — forbidden in production |
| Always preview first | Run `migrate status` before `migrate deploy` |
| Backup before migration | Run `npm run db:backup` before any schema change |
| Staging first | Apply migrations to staging, run full smoke, then production |
| No DROP without plan | Destructive migrations require explicit approval and data migration plan |

### 2.4 Migration Failure Protocol

If `prisma migrate deploy` fails:

1. **DO NOT** re-run the command
2. Check the error message for the specific migration name
3. Check migration logs: `npx prisma migrate status`
4. If a specific migration failed mid-execution, consult the rollback procedure (§6)
5. Verify data integrity: `npm run backup:verify`
6. Escalate to DBA if data loss is possible

### 2.5 PlatformAuditLog Verification

After migration, verify the audit log table is intact:

```sql
-- Verify table exists and is populated
SELECT count(*) FROM "PlatformAuditLog";

-- Check recent entries
SELECT id, action, "actorEmail", "createdAt"
FROM "PlatformAuditLog"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Verify hash chain integrity (if enabled)
SELECT count(*), count("chainVerified")
FROM "HashChainEntry";
```

---

## 3. Seed Data Verification

### 3.1 When Seeds Are Required

Seeds should only be applied:
- On fresh database creation
- When seed data has been explicitly updated for a release
- When documented in the release notes

**Do not** re-seed production databases unless explicitly documented.

### 3.2 Seed Verification

```bash
# If seeding is required for this deployment:
npx prisma db seed

# Verify seed data integrity across products
npm run platform:verify-org-links
npm run platform:verify-workspace-links
npm run platform:verify-audit-logs
```

### 3.3 Key Seed Checks

| Product | Verification |
|---------|-------------|
| Platform | Admin user `admin@aqliya.com` exists |
| Platform | PlatformOrganization records exist |
| Platform | PlatformAuditLog has entries |
| AuditOS | Sample engagements exist |
| AuditOS | PresentationPolicyTemplate rows present |
| LocalContentOS | Sample projects/suppliers exist |
| SalesOS | Pipeline/stage/deal records exist |
| SSO | Sample SSO providers configured |
| All | No orphaned records (verify scripts above) |

---

## 4. ECS Deployment Steps

### 4.1 Prerequisites

- [ ] AWS CLI configured with production credentials
- [ ] ECR image built and tagged: `docker build -t aqliya:prod-<version> .`
- [ ] ECR image pushed: `docker push <ecr-repo>:prod-<version>`
- [ ] Terraform plan reviewed and approved
- [ ] CI/CD pipeline green on staging

### 4.2 Deployment (via CI/CD — GitHub Actions)

The production deployment is triggered through the `promote.yml` GitHub Actions workflow.

```bash
# Manual trigger (if CI/CD unavailable):
# 1. Update ECS task definition with new image
aws ecs register-task-definition --cli-input-json file://task-definition.json

# 2. Update service to use new task definition
aws ecs update-service \
  --cluster aqliya-prod \
  --service aqliya-app \
  --task-definition aqliya:<new-revision> \
  --force-new-deployment

# 3. Monitor deployment
aws ecs describe-services --cluster aqliya-prod --services aqliya-app
# Watch for: deployments[0].desiredCount == runningCount
```

### 4.3 Terraform Workflow (production IaC)

```bash
# Plan (review before apply)
cd infra/terraform/environments/prod
terraform plan -out=tfplan

# Apply after review
terraform apply tfplan

# Verify
terraform output
```

### 4.4 Deployment Monitoring

Monitor during rollout (first 5 minutes):

```bash
# Watch ECS service events
aws ecs describe-services --cluster aqliya-prod --services aqliya-app --query "services[0].events[0:5]"

# Check task health
aws ecs list-tasks --cluster aqliya-prod --service-name aqliya-app
```

---

## 5. Post-Deployment Smoke Tests

Run these immediately after deployment completes.

### 5.1 Automated Smoke (Tier 2 — operational)

```bash
# Operational smoke (mock providers, no HTTP)
npm run smoke:tier2

# HTTP health checks
npm run smoke:tier2:http -- --base-url https://app.aqliya.com
npm run smoke:tier3:http -- --base-url https://app.aqliya.com
```

### 5.2 Health Endpoints

```bash
# Application liveness (DB + auth check)
curl -s https://app.aqliya.com/api/health | jq .
# Expected: {"status":"ok",...} — HTTP 200

# Platform health (DB + kernel + tracing)
curl -s https://app.aqliya.com/api/platform/health | jq .
# Expected: {"status":"healthy",...} — HTTP 200

# Kubernetes-style liveness (process only, no DB)
curl -s https://app.aqliya.com/api/health/live | jq .
# Expected: {"status":"ok","probe":"live",...} — HTTP 200

# Enterprise readiness (full dependency check)
curl -s https://app.aqliya.com/api/health/ready | jq .
# Expected: {"status":"ok",...} — HTTP 200
```

### 5.3 Authentication Flow

```bash
# 1. Login page loads
curl -s -o /dev/null -w "%{http_code}" https://app.aqliya.com/auth/signin
# Expected: 200

# 2. Protected route redirects unauthenticated users
curl -s -o /dev/null -w "%{http_code}" https://app.aqliya.com/audit
# Expected: 302 or 307 (redirect to login)

# 3. Login with credentials (browser smoke test)
# Manual: Navigate to https://app.aqliya.com/auth/signin
# Login with admin@aqliya.com / admin123
# Verify dashboard loads
```

### 5.4 Core Product Smoke

| Product | Check | Method |
|---------|-------|--------|
| **AuditOS** | Dashboard loads with real data | Browser |
| **AuditOS** | Engagement list renders | Browser |
| **AuditOS** | Trial balance upload accepts file | Browser |
| **LocalContentOS** | Dashboard loads | Browser |
| **LocalContentOS** | Workbook renders | Browser |
| **DecisionOS** | Decisions list renders | Browser |
| **SalesOS** | Pipeline dashboard loads | Browser |
| **WorkflowOS** | Template list renders | Browser |
| **ContentStudio** | Workspace list renders | Browser |
| **RiskOS** | Dashboard renders KPI cards | Browser |
| **LocalContactOS** | Contacts dashboard loads | Browser |
| **IM** | Memory events page loads | Browser |

### 5.5 Governance Verification

- [ ] `PlatformAuditLog` entries logged for mutations (check `/settings/audit-logs`)
- [ ] RBAC restricts admin-only actions from non-admin users
- [ ] Tenant isolation: organization-scoped data not visible across orgs
- [ ] File uploads succeed (check AuditOS evidence upload)
- [ ] Downloads respect authentication (direct link returns 404/401 without auth)

### 5.6 General UX

- [ ] RTL layout renders correctly on Arabic pages
- [ ] English locale works on English pages
- [ ] Empty states render on pages with no data
- [ ] 404 page shows for unknown routes
- [ ] 500 error boundary renders (manual: force error path)

---

## 6. Rollback Procedure

### 6.1 Decision: When to Roll Back

Roll back immediately if any of these occur within 5 minutes of deployment:

| Trigger | Severity |
|---------|----------|
| Any health endpoint returns non-200 for >30 seconds | **P0 — Roll back immediately** |
| Database migration fails | **P0 — Roll back immediately** |
| Auth/login flow is completely broken | **P0 — Roll back immediately** |
| Error rate exceeds 5% | **P1 — Roll back within 15 minutes** |
| Critical data mutation produces incorrect results | **P1 — Roll back within 15 minutes** |

### 6.2 ECS Rollback (Primary — Production)

The GitHub Actions `promote.yml` workflow includes automatic rollback. Manual rollback:

```bash
# 1. Find previous task definition revision
aws ecs list-task-definitions \
  --family-prefix aqliya \
  --sort DESC \
  --max-items 5

# 2. Update service to previous revision (N-1)
aws ecs update-service \
  --cluster aqliya-prod \
  --service aqliya-app \
  --task-definition aqliya:<previous-revision> \
  --force-new-deployment

# 3. Confirm rollback
aws ecs describe-services \
  --cluster aqliya-prod \
  --services aqliya-app \
  --query "services[0].deployments"
```

### 6.3 Database Rollback

If a migration was the cause:

```bash
# 1. Identify the failing migration
npx prisma migrate status

# 2. Mark it as rolled back (admin action — requires review)
npx prisma migrate resolve --rolled-back <migration-name>

# 3. Restore from backup if data integrity is compromised
# Use pre-migration backup taken in §2.1
pg_restore -d $DATABASE_URL /path/to/pre-migration-backup.dump

# 4. Verify PlatformAuditLog integrity after restore
psql $DATABASE_URL -c "SELECT count(*) FROM \"PlatformAuditLog\";"
psql $DATABASE_URL -c "SELECT count(*) FROM \"HashChainEntry\";"
```

### 6.4 Full Restore (Last Resort)

```bash
# 1. Restore database from last known-good backup
npm run db:restore

# 2. Run restore drill verification
npm run db:restore:drill

# 3. Verify backup integrity
npm run backup:verify

# 4. Re-deploy last known-good image
# Follow ECS rollback procedure (§6.2) or Terraform rollback
cd infra/terraform/environments/prod
terraform destroy -target=... # selective, or full if needed
```

### 6.5 Audit Model Rollback

If the audit model migration caused issues:

```sql
-- Verify PlatformAuditLog is intact
SELECT relname, n_live_tup
FROM pg_stat_user_tables
WHERE relname IN ('PlatformAuditLog', 'HashChainEntry');

-- Check for orphaned hash chain entries
SELECT hce.id, hce."auditLogId"
FROM "HashChainEntry" hce
LEFT JOIN "PlatformAuditLog" pal ON pal.id = hce."auditLogId"
WHERE pal.id IS NULL;
-- Expected: 0 rows
```

---

## 7. Emergency Contacts

> **Action required before go-live:** Replace bracket placeholders with named individuals. See `PILOT_ONCALL_ROSTER.md` for the current on-call rotation.

| Role | Primary | Phone | Email | Escalation |
|------|---------|-------|-------|------------|
| **Platform L3 (on-call)** | `[NAME]` | `[PHONE]` | `[EMAIL]` | 15 min → secondary |
| **Database / Infrastructure** | `[NAME]` | `[PHONE]` | `[EMAIL]` | 30 min → AWS support |
| **Security incident** | `[NAME]` | `[PHONE]` | `[EMAIL]` | 15 min → CISO |
| **Commercial / Client** | `[NAME]` | `[PHONE]` | `[EMAIL]` | 1 hour → CEO |

### External Dependencies

| Service | Console | Support |
|---------|---------|---------|
| AWS (ECS, RDS, S3) | `https://console.aws.amazon.com` | Business/Enterprise support plan |
| GitHub (CI/CD) | `https://github.com/aqliya` | GitHub Support |
| Domain / DNS | `[PROVIDER CONSOLE]` | `[PROVIDER SUPPORT]` |

---

## 8. Post-Deployment Sign-Off

Complete after successful deployment:

- [ ] All health endpoints return 200
- [ ] `npm run smoke:tier2` passes
- [ ] `npm run smoke:tier3:http -- --base-url https://app.aqliya.com` passes
- [ ] Auth flow works (login, session, logout)
- [ ] Core product dashboards load
- [ ] `PlatformAuditLog` shows recent deployment entries
- [ ] `npm run platform:verify-audit-logs` passes
- [ ] Error rate normal (≤ baseline)
- [ ] On-call notified of deployment completion

**Deployer:** `[NAME]`  
**Date/Time:** `[YYYY-MM-DD HH:MM UTC]`  
**Build Tag:** `[GIT_TAG]`  
**Signature:** `[SIGN]`

---

> **Related documents:** `production-deployment-runbook.md`, `GO_NOGO_CRITERIA.md`, `backup-restore-procedure.md`, `PILOT_ONCALL_ROSTER.md`, `PILOT_OPERATIONAL_HANDBOOK.md`
