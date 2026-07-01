# Pilot Go-Live Checklist

**Release Manager:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Pilot Customer:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Environment:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## 1. Pre-Deployment

### 1.1 Database

- [x] Verify PostgreSQL 16+ is running: `psql --version` (expected: `>= 16.0`) — **PG 16.8 verified 2026-06-04**
- [x] Verify database connectivity: `psql -d "$DATABASE_URL" -c 'SELECT 1'` — **Connected 2026-06-04**
- [x] Run `npx prisma migrate status` — confirm all migrations are applied or pending — **Up to date, 22 migrations, 1 rolled back (ic01) 2026-06-04**
- [ ] Apply pending migrations: `npx prisma migrate deploy` — **No pending migrations**
- [x] Verify migration record: `psql "$DATABASE_URL" -c "SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations WHERE rolled_back_at IS NULL;"` — **21 applied, ic01 rolled back confirmed 2026-06-04**
- [x] Regenerate Prisma client: `npx prisma generate` — **Generated 2026-06-04**
- [ ] If pgvector/RAG enabled for pilot:
  - [ ] pgvector extension installed: **Not available on Windows PostgreSQL — requires Docker pgvector/pgvector:pg16**
  - [ ] HNSW index verified: **Skipped — no pgvector on this environment**
  - [ ] Run automated verification: **Skipped — no pgvector on this environment**
  - [ ] Run offline smoke test: **Skipped — no pgvector on this environment**

### 1.2 Seed Data

- [ ] Load seed data: `npx prisma db seed`
- [ ] Run AuditOS-specific seed: `npm run seed:audit`
- [ ] Verify pilot organization exists via `/audit/admin/users`
- [ ] Verify pilot users provisioned (admin, operator, reviewer, partner roles)
- [ ] Verify pilot client created via engagement form

### 1.3 Environment Variables

- [ ] `DATABASE_URL` configured and reachable
- [ ] `AUTH_SECRET` set (32+ bytes, `openssl rand -base64 32`)
- [ ] `DOWNLOAD_TOKEN_SECRET` set (32+ bytes)
- [ ] `NEXTAUTH_URL` matches deployment URL
- [ ] `NODE_ENV=production` (or `development` for pilot per runbook rules)
- [ ] `STORAGE_PROVIDER` set (`local` or `s3`)
- [ ] `LOCAL_STORAGE_DIR` exists and writable (if `local`)
- [ ] `SCANNER_PROVIDER` configured (uploads blocked without it in production)
- [ ] Unless using email notifications: `RESEND_API_KEY` optional — leave blank if not used
- [ ] `MFA_REQUIRED_ROLES` set (default: `ADMIN`)
- [ ] All placeholder secrets (`change-me-*`) replaced

### 1.4 Feature Flags

Configure in `.env` or environment:

| Flag | Pilot Value | Notes |
|------|-------------|-------|
| `FF_AI_RAG` | `true` (if pgvector ready) / `false` | Enable only after pgvector validated |
| `FF_AI_REAL_PROVIDERS` | `true` (if LLM enabled) / `false` | Requires API keys |
| `FF_AI_BUDGET_QUOTAS` | `true` | Enable budget controls first |
| `FF_AI_BUDGET_ALERTS` | `true` | Threshold notifications |
| `FF_AI_COST_TRACKING` | `true` | AI spend tracking |
| `FF_AUDIT_MOCK_AI` | `false` (pilot) | Disable mock AI for real workflow |
| `FF_QUEUE_ENABLED` | `false` | Async queue — disable unless tested |
| `FF_STORAGE_S3` | `false` | Use local storage unless S3 configured |

- [ ] Feature flags validated against environment
- [ ] RAG feature NOT exposed in `/auditos/*` demo routes (commercial rule)

### 1.5 Pre-Deployment Backup

- [ ] Run full backup: `npm run db:backup`
- [ ] Verify backup file exists in `backups/`: `ls -la backups/`
- [ ] Verify backup integrity: `npm run backup:verify`
- [ ] Record backup filename: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### 1.6 Build Verification

- [x] TypeScript check: `npx tsc --noEmit` — **passes 2026-06-04**
- [x] Lint: `npm run lint` — **0 errors 2026-06-04**
- [x] Test suite: `npm test` — **919 tests, 0 failures 2026-06-04**
- [x] Build: `npm run build` — **exits 0 2026-06-04** (previous validation)
- [x] Health check script: `npm run audit:health` — **7/7 checks pass 2026-06-04**

---

## 2. Deployment

### 2.1 Build Production Bundle

```bash
# Clean build
npm run build
```

- [ ] Build exits 0
- [ ] Build output in `.next/` directory
- [ ] No build warnings (treat as actionable)

### 2.2 Deploy to Staging

- [ ] Deploy build artifact to staging environment
- [ ] Push Docker image (if containerized): `docker compose build app`
- [ ] Start services: `docker compose up -d`
- [ ] Wait for healthy: `docker compose ps` — all services healthy

### 2.3 Run Staging Smoke Tests

- [ ] Health endpoint responds: `curl -sSf https://staging.aqliya.com/api/health`
- [ ] Login works: navigate to `/audit` — authenticate as admin
- [ ] Engagement list loads: navigate to `/audit/engagements`
- [ ] Create test engagement
- [ ] Upload trial balance CSV/XLSX
- [ ] Run validation: `/audit/engagements/[id]/validation`
- [ ] Verify audit events created
- [ ] If RAG enabled: run `npm run ic:smoke:cycle5:live`
- [ ] If RAG enabled: run `IC01_PGVECTOR_INTEGRATION=true npm run test:ic01:pgvector`

### 2.4 Deploy to Production

- [ ] Production pre-deployment backup taken: `npm run db:backup`
- [ ] Deploy build artifact to production
- [ ] Push Docker image (if containerized)
- [ ] Start services: `docker compose up -d`
- [ ] Verify all containers healthy: `docker compose ps`

### 2.5 Verify Production Deployment

- [ ] Health endpoint: `curl -sSf https://[production-url]/api/health`
- [ ] Login as admin: navigate to `/audit`
- [ ] Verify pilot organization and users present
- [ ] Verify pilot client engagement accessible
- [ ] Verify uploaded evidence files present
- [ ] Verify exports work (JSON, PDF, XLSX)
- [ ] Run `npm run pilot:daily` — monitor reports clean

---

## 3. Rollback Plan

### 3.1 Automated Rollback Triggers

Rollback automatically if any of these conditions occur:

| Trigger Condition | Action | Response Time |
|-------------------|--------|---------------|
| Health endpoint returns non-200 for 3 consecutive checks | ECS auto-rollback to previous task definition | < 2 min |
| `HealthyTaskPercent < 100%` for 2 consecutive periods | Service auto-rollback in Terraform | < 3 min |
| Database migration fails | Halt deployment, do not apply partial migration | Immediate |
| pgvector migration applied but extension missing | Rollback migration only (Section 3.3) | < 1 min |

### 3.2 Manual Rollback — Application

```bash
# If running via Docker Compose
docker compose down
docker compose up -d app         # re-pulls previous image or rebuild

# If running via ECS
aws ecs update-service \
  --cluster aqliya-production \
  --service aqliya-app \
  --task-definition aqliya-app:<previous-version>

# If running directly
git checkout <previous-deploy-tag>
npm run build
npm run start
```

- [ ] Previous deployment artifact retained (last 30 images in ECR / git tags)
- [ ] Application rollback procedure documented and team-trained

### 3.3 Database Rollback — Migration Revert

| Scenario | Procedure |
|----------|-----------|
| Migration applied, no data ingested | `npx prisma migrate resolve --rolled-back <migration-name>` |
| pgvector migration + critical issue | Drop table + mark rolled back (see full steps below) |
| Feature flag causing instability | Set flag to `false`, restart app — no DB change needed |

**Full pgvector rollback:**
```bash
# 1. Drop the DocumentChunk table
psql "$DATABASE_URL" -c 'DROP TABLE IF EXISTS "DocumentChunk" CASCADE;'

# 2. Drop the extension (if needed)
psql "$DATABASE_URL" -c 'DROP EXTENSION IF EXISTS vector;'

# 3. Mark migration as rolled back
npx prisma migrate resolve --rolled-back 20260605000001_ic01_pgvector_document_chunk

# 4. Regenerate Prisma client
npx prisma generate
```

**Feature flag rollback (no code deploy):**
```bash
# Disable in environment
unset FF_AI_REAL_PROVIDERS
unset FF_AI_RAG
# Or set to false
# Restart application
sudo systemctl restart aqliya-app
```

### 3.4 Data Integrity Verification After Rollback

- [ ] Run `npm run db:verify-pgvector` — expects failure confirming clean rollback (output: `{ "staging": true, "tableExists": false, "pgvector": false }`)
- [ ] Verify health endpoint returns all checks passing
- [ ] Verify no data loss in existing tables
- [ ] Verify application starts and login works
- [ ] Document rollback reason in incident log

---

## 4. Monitoring Setup

### 4.1 Health Endpoint Verification

- [ ] `/api/health` returns HTTP 200
- [ ] Health response includes: DB connectivity, Redis connectivity (if configured), pgvector availability (if RAG enabled), disk space
- [ ] Health check interval configured: 30s
- [ ] Health check timeout: 5s
- [ ] Unhealthy threshold: 2 consecutive failures

### 4.2 Alert Configuration

| Alert | Metric | Threshold | Severity |
|-------|--------|-----------|----------|
| DB connectivity | Health endpoint DB check | Failure | Critical |
| RDS CPU | DBLoad | > 70% for 5 min | Warning |
| ECS service health | HealthyTaskPercent | < 100% for 2 checks | Critical |
| ALB 5xx rate | HTTPCode_ELB_5xx | > 1% for 5 min | Warning |
| Disk space | FreeStorageSpace | < 20% | Warning |
| Backup failure | Backup job status | FAILED | Critical |
| Embedding latency (RAG) | P99 response time | > 5s | Warning |

- [ ] All alerts configured in monitoring system (CloudWatch / equivalent)
- [ ] Alert notification channels configured (PagerDuty / Slack / Email)
- [ ] Escalation paths defined in alert configurations
- [ ] Test alert triggered and verified delivered

### 4.3 Dashboard Review

- [ ] CloudWatch dashboard (or equivalent) configured with:
  - [ ] Application health status
  - [ ] RDS connections, CPU, free storage
  - [ ] ALB request count, latency, error rates
  - [ ] ECS task count, CPU/memory utilization
  - [ ] Redis cache hit rate, memory usage
  - [ ] Backup age and status
- [ ] Dashboard accessible to operations team
- [ ] Dashboard refresh interval: 1 minute

### 4.4 Log Monitoring Setup

- [ ] Application logs streaming to centralized log aggregation
- [ ] Error log alert: any `ERROR` level log triggers notification
- [ ] Audit event log shipping configured (compliance retention)
- [ ] Log retention period configured (min 30 days)
- [ ] No sensitive data (passwords, tokens, PII) in log configuration verified

---

## 5. Support Plan

### 5.1 On-Call Rotation

| Shift | Primary | Secondary | Contact |
|-------|---------|-----------|---------|
| Weekdays (08:00-18:00 AST) | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |
| Weekdays (18:00-08:00 AST) | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |
| Weekends / Holidays | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |

- [ ] On-call schedule published and confirmed
- [ ] All on-call engineers have:
  - [ ] Access to production environment (VPN/permissions)
  - [ ] Access to monitoring dashboards
  - [ ] Copy of this checklist and the runbook
  - [ ] Incident response training completed

### 5.2 Escalation Path

| Level | Contact | Response Time | Authority |
|-------|---------|---------------|-----------|
| L1 — On-call engineer | \_\_\_\_\_\_\_\_\_\_\_ | < 15 min | Triage, runbook execution |
| L2 — Platform Architect | \_\_\_\_\_\_\_\_\_\_\_ | < 30 min | DR decision authority |
| L3 — Tech Lead | \_\_\_\_\_\_\_\_\_\_\_ | < 1 hour | Recovery execution lead |
| L4 — Security Lead | \_\_\_\_\_\_\_\_\_\_\_ | < 1 hour | Post-mortem security review |
| L5 — Release Manager | \_\_\_\_\_\_\_\_\_\_\_ | < 2 hours | Go/No-Go decision authority |

### 5.3 Known Issues Document

Refer to `docs/source-of-truth/PILOT_RUNBOOK.md §20 — Known Limitations`:

| ID | Issue | Impact | Workaround |
|----|-------|--------|------------|
| LI-01 | No real malware scanning in dev (fail-closed in production) | Uploads blocked without SCANNER_PROVIDER | Set SCANNER_PROVIDER to any value in dev (returns "skipped_dev") |
| LI-02 | Credentials-only authentication (no SSO) | Users must use email+password + MFA | None needed for pilot |
| LI-03 | Evidence files stored as metadata only (no binary storage) | File metadata tracked; actual files managed externally | External file management process |
| LI-04 | No optimistic concurrency | Last-write-wins on concurrent edits | Coordinate operator schedule |
| LI-05 | Statement of Cash Flows not implemented | Cash flow statement unavailable | Excluded from pilot scope |
| LI-06 | Backup not automated/scheduled | Manual backup required | Scheduled via `npm run db:backup:scheduled` or manual every session |
| LI-07 | CSP with `unsafe-inline` + `unsafe-eval` | XSS protection partial (accepted risk CSP-01) | Report-only strict CSP deployed on `/audit/*` routes |
| LI-08 | No step-up for role changes (accepted risk MFA-SU-01) | ADMIN session compromised could escalate privileges | Compensated by MFA requirement + small pilot user count |
| LI-09 | ADMIN bypasses tenant isolation (accepted risk RBAC-CROSS-01) | Inert in single-tenant pilot | All users share one org — code path never triggered |

### 5.4 Support Contacts

| Role | Name | Email | Phone |
|------|------|-------|-------|
| Pilot Customer Lead | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |
| Release Manager | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |
| Platform Ops | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |
| Security Contact | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |
| Product Manager | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_ |

- [ ] Contact list distributed to all team members
- [ ] Emergency contacts programmed in on-call system

---

## 6. Backup & Recovery

### 6.1 Pre-Deployment Backup

```bash
# Full database backup
npm run db:backup

# Verify backup
npm run backup:verify
```

- [ ] Pre-deployment backup taken (filename: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_)
- [ ] Backup verified: integrity check passed
- [ ] Backup stored in `backups/` directory (outside application root)
- [ ] Backup copied to off-server location (S3 / network share)

### 6.2 Automated Backup Schedule

| Frequency | Method | Retention | Target |
|-----------|--------|-----------|--------|
| Daily (01:00-03:00 AST) | RDS automated backup | 30 days (production) / 7 days (staging) | Production RDS |
| Every session (manual) | `npm run db:backup` | N/A (trigger before/after each pilot session) | Pilot data |
| Hourly (optional) | `npm run db:backup:scheduled` | Configurable via `BACKUP_MAX_FILES` | High-activity periods |

- [ ] Automated backup schedule configured
- [ ] Backup retention policy documented

### 6.3 Recovery Test Procedure

Quarterly DR drill procedure (per `docs/operations/ha-dr-plan.md §6`):

```bash
# Step 1: Identify backup to restore
ls -la backups/

# Step 2: Dry-run restore (default — no CONFIRM_RESTORE)
npm run db:restore -- backups/aqliya_backup_YYYY-MM-DDTHH-MM-SS.dump

# Step 3: Execute restore (requires explicit confirmation)
CONFIRM_RESTORE=true npm run db:restore -- backups/aqliya_backup_YYYY-MM-DDTHH-MM-SS.dump

# Step 4: Verify restored data
npm run backup:verify
npm run audit:health
npx tsx scripts/verify-pgvector-staging.ts   # if RAG enabled
```

- [ ] Recovery procedure documented and tested
- [ ] Dry-run confirmed safe before production restore
- [ ] Team members trained on restore procedure

### 6.4 Backup Verification

```bash
# Verify latest backup
npm run backup:verify

# Verify backup file exists and has expected size
ls -lh backups/

# Cross-region backup verification (if applicable)
aws rds describe-db-cluster-snapshots --snapshot-type automated
```

- [ ] Backup verification script passes
- [ ] Latest cross-region snapshot age < 24 hours
- [ ] Monitor: backup age reported on operations dashboard

---

## 7. Risk Acceptance Sign-off

The following risks have been formally accepted for the pilot deployment. Each risk must be acknowledged by the Release Manager and Security Lead.

### Risk CSP-01 — Ineffective CSP Header

**Severity:** Critical | **Pilot Impact:** Low | **Condition:** Deploy report-only strict CSP for `/audit/*` routes

| Item | Status | Notes |
|------|--------|-------|
| Condition met: Report-only strict CSP deployed on `/audit/*` | [ ] Yes [ ] No | |
| `connect-src 'self'` confirmed blocking external C2 | [ ] Verified | |
| Pilot team briefed on CSP limitations | [ ] Yes [ ] No | |
| Plan in place for strict CSP before multi-tenant | [ ] Yes [ ] No | Target: \_\_\_\_\_\_\_\_\_\_\_ |

**Accepted by (Release Manager):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Accepted by (Security Lead):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Risk MFA-SU-01 — No Step-Up Authentication

**Severity:** Critical | **Pilot Impact:** Low | **Condition:** Add step-up for role changes; document MFA disable already has step-up

| Item | Status | Notes |
|------|--------|-------|
| Condition met: Step-up added for role changes (password re-verification) | [ ] Yes [ ] No | |
| Risk register updated: MFA disable already has password step-up | [ ] Yes [ ] No | |
| MFA enforced for ADMIN/OPERATOR roles | [ ] Verified | |
| Session `jti` revocation mechanism active | [ ] Verified | |
| Plan in place for step-up timer before multi-tenant | [ ] Yes [ ] No | Target: \_\_\_\_\_\_\_\_\_\_\_ |

**Accepted by (Release Manager):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Accepted by (Security Lead):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Risk RBAC-CROSS-01 — ADMIN Bypasses Tenant Isolation

**Severity:** Critical | **Pilot Impact:** Low (inert in 1-org deployment) | **Condition:** Accept as designed — single-tenant renders irrelevant

| Item | Status | Notes |
|------|--------|-------|
| Single-tenant deployment confirmed (1 organization) | [ ] Verified | Org ID: \_\_\_\_\_\_\_\_\_\_\_ |
| ADMIN bypass code path never triggered (all users share orgId) | [ ] Verified | |
| MFA required for ADMIN role | [ ] Verified | |
| Audit logging active for all ADMIN actions | [ ] Verified | |
| Plan in place for ADMIN scope restriction before multi-tenant | [ ] Yes [ ] No | Target: \_\_\_\_\_\_\_\_\_\_\_ |

**Accepted by (Release Manager):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Accepted by (Security Lead):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## 8. Go/No-Go Decision

### 8.1 Final Checklist

All items must be complete before Go decision.

| # | Requirement | Status | Verified By |
|---|-------------|--------|-------------|
| 1 | Pre-deployment backup taken and verified | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 2 | Database migration applied (all pending) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 3 | Seed data loaded | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 4 | Environment variables validated | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 5 | Feature flags configured for pilot | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 6 | Build passes (`npm run build`) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 7 | TypeScript clean (`npx tsc --noEmit`) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 8 | Lint clean (`npm run lint`) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 9 | Test suite passes (`npm test`) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 10 | Health check passes (`npm run audit:health`) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 11 | Backup verification passes (`npm run backup:verify`) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 12 | Staging smoke tests passed | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 13 | Production deployment verified | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 14 | Monitoring alerts configured and tested | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 15 | On-call rotation confirmed | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 16 | Risk acceptance sign-off complete (3 risks) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 17 | Known limitations communicated to pilot participants | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 18 | Pilot organization and users provisioned | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 19 | Team roles assigned (operator, reviewer, partner) | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 20 | Rollback plan documented and team-trained | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 21 | Pre-deployment backup stored off-server | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |
| 22 | Demo route (`/auditos`) confirmed isolated from real data | [ ] | \_\_\_\_\_\_\_\_\_\_\_ |

### 8.2 Decision

| Decision | Description | Required Sign-offs |
|----------|-------------|-------------------|
| **Go** | All required items complete. No blocking issues. Proceed with pilot launch. | Release Manager + Security Lead |
| **Go With Conditions** | Non-blocking items incomplete. Document conditions and timeline. | Release Manager + Security Lead + Product Manager |
| **No Go** | Blocking issue identified. Do not proceed. Document reason and blocker. | Release Manager + Platform Architect |

### 8.3 Decision Record

**Decision:** [ ] Go &nbsp;&nbsp; [ ] Go With Conditions &nbsp;&nbsp; [ ] No Go

**Conditions (if Go With Conditions):**
1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
2. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
3. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Decision by (Release Manager):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Decision by (Security Lead):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Decision by (Product Manager):** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

*Generated: 2026-06-04 | Authority: Release Manager | Document: PILOT_GO_LIVE_CHECKLIST.md*
*References: PILOT_RUNBOOK.md, RISK_ACCEPTANCE_REPORT.md, ha-dr-plan.md, ai-intelligence-activation.md, pgvector-staging-validation-runbook.md, pgvector-production-readiness.md*
