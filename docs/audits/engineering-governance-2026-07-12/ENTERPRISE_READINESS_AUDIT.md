# AQLIYA Enterprise Readiness Audit

**Date:** 2026-07-12
**Auditor:** Enterprise Readiness Auditor (OpenCode Agent)
**Scope:** Full-stack infrastructure, deployment, CI/CD, monitoring, backup/DR, secrets, scaling, runbooks
**Artifacts Reviewed:** 50+ files across `infra/terraform/`, `.github/workflows/`, `runbooks/`, `src/lib/platform/`, `src/app/api/health/`, `docs/deployment/`, `scripts/platform/`, `Dockerfile`, `docker-compose.yml`, `.env.example`

---

## 1. Executive Summary

AQLIYA has engineered a **strong L5-to-L6 infrastructure baseline** with a modular Terraform IaC stack spanning 5 modules across 3 environments, containerised deployment on ECS Fargate with auto-scaling, AWS-native secrets management, comprehensive health endpoints, and 11 well-structured runbooks. The CI/CD pipeline is robust with automated test gates, environment promotion, auto-rollback on smoke test failure, and daily backup+verify.

**The platform is pilot-ready for a single well-controlled customer with on-call operations support.** However, three production-blocking gaps prevent L6 (Production-hardened) classification: (1) Redis has no encryption-in-transit and single-node config in the active prod env, (2) the active deployment is on free-tier-limited RDS (`db.t4g.micro`, 20GB storage), and (3) environment naming inconsistency (`production` vs `prod`) across Terraform and CI/CD creates configuration drift risk.

---

## 2. Infrastructure Assessment

| Component | Status | Gaps |
|-----------|--------|------|
| **AWS IaC** | ✅ Strong | Two competing production dirs (`prod/` vs `production/`); staging + production tfvars have `<ACCOUNT_ID>` placeholders |
| **ECS Fargate** | ✅ Strong | Free-tier RDS blocks recommended instance class; ClamAV sidecar is good but adds cost/complexity |
| **RDS** | ⚠️ Degraded | Active prod runs `db.t4g.micro` / 20GB (free-tier); `storage_encrypted = true` ✅ but engine version `16.14` exceeds default `16.3` |
| **ElastiCache Redis** | ⚠️ Partial | Production-grade replication group with auto-failover configured; **no `transit_encryption_enabled`**; prod tfvars has `redis_num_cache_nodes = 1` (single-node, contradicts HA claim) |
| **S3** | ✅ Strong | Versioned, encrypted (AES256), lifecycle rules (STANDARD_IA at 90d, GLACIER at 365d), public access fully blocked for uploads |
| **CloudFront** | ✅ Good | WAF-attached, security headers policy (HSTS, XFO, CT, referrer), cache behaviours for `/api/*` (no cache) and `/_next/*` (long cache) |
| **WAF** | ✅ Strong | 5 rules: rate-limit (5000/5min), AWS Common Rules (with size override), SQLi, Bad Inputs, IP Reputation |
| **ACM** | ✅ Good | Dual-region certs (eu-north-1 for ALB, us-east-1 for CloudFront); `domain_ready` flag gates HTTPS listener activation |

---

## 3. Container & Orchestration

### Dockerfile Quality: ✅ Good

- Multi-stage build (builder → runner) on `node:22-alpine`
- `npm ci --ignore-scripts` for clean installs
- Next.js standalone output mode
- Non-root user (`nextjs:nodejs`) with explicit UID/GID
- Curl included for ECS health checks
- Image size: optimised Alpine base

**Gaps:**
- Dockerfile has **hardcoded placeholder `DATABASE_URL` and `AUTH_SECRET`** for build-time postinstall (justified but worth documenting)
- No `HEALTHCHECK` Dockerfile instruction (relies on ECS task definition health check instead — acceptable)
- Prisma schema + migrations copied to production image (necessary for runtime migration commands)

### Health Checks: ✅ Strong

- ECS container health check: `curl -f http://localhost:3000/api/health` (interval 30s, timeout 5s, retries 3, start period 60s)
- ALB target group health check: `/api/health` (interval 30s, timeout 5s, healthy/unhealthy threshold 2/3)
- ClamAV sidecar health check: `clamdcheck.sh` (interval 30s, timeout 10s, retries 3, start period 120s)

### Resource Limits: ✅ Good

| Environment | CPU | Memory | Desired | Min | Max |
|-------------|-----|--------|---------|-----|-----|
| dev | 512 (.5 vCPU) | 1024 MB | 1 | 1 | 2 |
| staging | 512 | 1024 | 2 | 2 | 4 |
| production | 1024 (1 vCPU) | 2048 MB | 3 | 3 | 10 |
| prod (active) | 1024 | 2048 | 2 | 2 | 10 |

### Multi-stage Build: ✅ Yes

Builder stage compiles; runner stage copies only `.next/standalone`, static assets, Prisma client, and schema.

---

## 4. High Availability Assessment

| Component | HA? | Single Point of Failure? |
|-----------|-----|--------------------------|
| **Compute** | ✅ Yes (ECS Fargate, multi-AZ, auto-scaling 2-10 tasks) | No |
| **Database** | ✅ Yes (Multi-AZ enabled in prod, read replica for production) | No (with Multi-AZ) |
| **Cache** | ⚠️ Partial | **Yes — prod tfvars has `redis_num_cache_nodes = 1`** (producting tfvars has 2 with failover) |
| **Storage** | ✅ Yes (S3 — 11 nines) | No |
| **Load Balancer** | ✅ Yes (ALB, multi-AZ by design) | No |
| **CDN** | ✅ Yes (CloudFront global) | No |
| **DNS** | ✅ Yes (Route53) | No |

**Critical finding:** The active prod environment (`environments/prod/`) has `redis_num_cache_nodes = 1` which means **no Redis HA**. The production template (`environments/production/`) correctly sets `redis_num_cache_nodes = 2` with `automatic_failover_enabled`. This inconsistency must be resolved.

---

## 5. Backup & DR Readiness

### RDS Backup: ✅ Strong
- Automated backups at 03:00-04:00 UTC (dev: 1 day; staging: 7 days; prod: 30 days)
- AWS Backup plan: daily (30d retention), weekly (120d), monthly (365d)
- KMS-encrypted backup vault with key rotation
- Cross-region DR snapshot copy configured (prod: eu-north-1 → eu-central-1)
- `enable_cross_region_dr = true` ✅ in active prod tfvars
- CI backup workflow runs daily at 23:00 UTC, uploads artifact (30-day retention), verifies connectivity

### Backup Verification: ✅ Good
- `npm run backup:verify` checks core table row counts (engagements, events, evidence, findings, users, AI outputs)
- `npm run db:restore-drill` creates scratch database, restores, spot-checks 12 tables, writes JSON report
- CI runs `backup:verify` after each backup

### RTO/RPO: ✅ Defined
| Metric | Target |
|--------|--------|
| RTO | < 30 minutes |
| RPO | < 5 minutes |
| DR drill frequency | Quarterly |
| Backup verification | Weekly |

### Restore Drill Status: ✅ Operational
- `scripts/platform/restore-drill.mjs` — creates `aqliya_drill_<timestamp>` DB, restores, verifies row counts, drops, writes JSON report to `backups/drill-reports/`
- `scripts/platform/restore-drill.mjs` exists as TypeScript version
- DR runbook includes decision tree, 5-phase restore procedure, communication plan, post-incident review template

**Gaps:**
- No evidence a restore drill has been executed against actual RDS (only local/dev DB)
- CI backup artifacts live only in GitHub (30-day limit); no automated S3 sync of CI backups
- RPO < 5 minutes is ambitious — CI backups run daily, RDS automated backups run daily; point-in-time recovery window is not configured

---

## 6. Monitoring & Observability

### Health Endpoints: ✅ Excellent

| Endpoint | Purpose | Dependencies | Expected Status |
|----------|---------|-------------|-----------------|
| `GET /api/health/live` | Liveness probe | None (process only) | 200 |
| `GET /api/health/ready` | Readiness probe | DB, storage, pgvector, Redis, AI provider, auth secret | 200 or 503 degraded |
| `GET /api/health` | Combined health | DB, auth secret | 200 or 503 |
| `GET /api/metrics` | Business metrics (ADMIN) | DB | 200 |

The readiness endpoint (`ready/route.ts`) checks **6 dependencies** with per-check latency and detail. The enterprise health snapshot (`enterprise-health.ts`) adds outbox event status, ABAC enforcement state, rate limiter mode, and product metrics.

### Metrics: ✅ Good
- CloudWatch dashboard: ECS CPU/Memory, RDS CPU/Connections/Storage, ALB Response Time/RequestCount/5XX, Redis CPU/Connections/Memory, Error Rate (%)
- 7 CloudWatch alarms: ECS CPU >85%, ECS Memory >85%, RDS CPU >80%, RDS Storage <10GB, RDS Connections >80, ALB 5XX >10, ALB p95 latency >3s, Redis Memory >80%
- SNS topic for alarm notifications; email subscription in production to `ops@<domain_name>`

### Alerting: ✅ Good
- 16 alert definitions (A-01 through A-16) with severity, source, detection method, response
- Sentry for error tracking + performance (sampled at 0.2 client / 0.5 server in production)
- AI budget alerts at 50%/80%/90%/100% thresholds
- Post-deploy smoke tests as CI gates
- Pilot daily monitor script

### Logging: ⚠️ Partial
- CloudWatch Logs via `awslogs` driver (ECS)
- Log retention: 30 days (may be insufficient for compliance; monitoring runbook notes 90+ recommendation)
- Console-level logging (not structured JSON); monitoring runbook acknowledges this gap
- No log aggregation pipeline (no ELK/Loki/Datadog)

### Tracing: ⚠️ Partial
- Sentry performance tracing only
- No OpenTelemetry or distributed tracing

### Known Gaps (from monitoring runbook): ✅ Honest
The runbook documents 10 known gaps including: no Prometheus endpoint, no structured logging, no synthetic monitoring, no PagerDuty integration, no DB connection pool metrics, no user-facing status page.

---

## 7. Secrets Management

### Storage: ✅ Strong
- AWS Secrets Manager for all 13 secret types
- Secrets injected into ECS task definition at task start (not at runtime)
- RDS password stored in Secrets Manager, not in Terraform state
- ECS execution role has `secretsmanager:GetSecretValue` permission
- SSM Parameters also accessible (for runtime config)

### Rotation: ⚠️ Partial
- RDS password: AWS-managed automatic rotation ✅
- All other secrets: Manual rotation (policy: 90 days prod, 365 days dev)
- Rotation procedure documented in `SECRETS_AND_ROTATION_RUNBOOK.md`
- No automated rotation pipeline for non-RDS secrets

### Access Control: ✅ Good
- IAM role scoped to `arn:aws:secretsmanager:*:*:secret:*` (per-environment namespacing via `aqliya/<env>/` prefix)
- Secrets are resolved at task start (not exposed in task definition)
- ECS execution role is separate from task role
- GitHub Actions uses OIDC (no long-lived credentials)

### Gaps:
- SSM Parameter access uses wildcard `*` resource — should scope to specific parameter paths
- No evidence of secret access auditing (CloudTrail would cover this, but not referenced)

---

## 8. Runbook Quality

| Runbook | Exists? | Quality (1-5) | Gaps |
|---------|---------|---------------|------|
| Deployment | ✅ | 5 | Excellent detail, ECS commands, rollback procedures, troubleshooting |
| Incident response (Security) | ✅ | 4 | Good detection/response flow; contact info is placeholder |
| Rollback (within Deployment) | ✅ | 5 | 3 methods documented (ECS task def, ECR image, DB-only); pre-deployment checklist |
| Backup restore | ✅ | 5 | Comprehensive: strategy table, manual steps, CI restore, offsite sync, troubleshooting |
| Disaster recovery | ✅ | 5 | Decision tree, 5-phase procedure, RTO guidelines, communication plan, post-incident review template |
| Alerting | ✅ | 5 | 16 alert definitions, severity matrix, response procedures, escalation matrix, false positive suppression |
| Monitoring | ✅ | 5 | Health endpoints reference, metrics, dashboards, honest gap list |
| Redis operations | ✅ | 4 | Good client/cache/rate-limiter coverage; production sizing missing |
| ClamAV scanner | ✅ | 4 | Operations and troubleshooting covered |
| Rate limiter | ✅ | 4 | Config, presets, fallback behavior, incident response |
| Staging environment | ✅ | 4 | Local setup, CI deployment, verification |
| **Overall** | **11/11** | **4.5 avg** | Contact info mostly placeholder; no on-call rotation schedule populated |

---

## 9. CI/CD Pipeline Health

### Stages: ✅ Strong

```
PR → CI (tsc, lint, test, build, backup:verify, license, audit, gitleaks)
         ↓
    main push → CI passes → Deploy (build Docker, push ECR, deploy ECS, wait stable, smoke test)
                              ↓
                    Promote (validate staging health → promote ECR image → deploy ECS → smoke test → auto-rollback on fail)
```

### Test Gates: ✅ Strong
- TypeScript (`tsc --noEmit`)
- ESLint lint
- Jest unit + integration tests (with pgvector CI service)
- Prisma migrate deploy against CI database
- `npm audit --audit-level=high`
- License compliance check (blocks GPL/AGPL/LGPL-3.0)
- Gitleaks secret scanning
- 7 documentation validation scripts

### Environment Promotion: ✅ Good
- `promote.yml`: validates staging health → promotes image to production ECR → deploys to production ECS → smoke tests → **auto-rollback** on failure
- Manual `workflow_dispatch` with commit SHA input
- Uses GitHub Environments for protection rules

### Rollback Capability: ✅ Strong
- ECS automatic rollback: deployment circuit breaker (minHealthyPercent: 100, maxPercent: 200)
- `promote.yml` has an explicit `rollback` job that triggers on smoke test failure — it reverts ECS to the previous task definition revision
- Runbooks document 3 manual rollback methods

### Pipeline Workflows:

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push/PR to main | Full quality gate |
| `deploy.yml` | CI success on main / manual | Build + deploy to production ECS |
| `deploy-staging.yml` | Push to develop/staging | Test + deploy to staging ECS |
| `promote.yml` | Manual | Staging → production promotion with auto-rollback |
| `backup.yml` | Daily schedule / manual | Database backup + verify |
| `preview.yml` | PR to main | Vercel preview deployment |
| `governance.yml` | PR | Governance validation gate |

### Gaps:
- `deploy-staging.yml` runs its own tsc/lint/test/build (duplicated from CI — could reuse)
- No infrastructure CI (Terraform plan on PR)
- No integration/E2E tests in pipeline (only unit + integration)

---

## 10. Production Blockers

### BLOCKER-1: Redis Single-Node in Active Production Env
- `environments/prod/terraform.tfvars` sets `redis_num_cache_nodes = 1`
- `environments/production/terraform.tfvars` correctly sets `redis_num_cache_nodes = 2`
- **Risk:** Single Redis node = single point of failure for rate limiting and caching
- **Fix:** Align active prod config to 2 nodes or clarify which config is authoritative

### BLOCKER-2: Free-Tier RDS Instance
- Active prod runs `db.t4g.micro` / 20GB storage / 20GB max (marked "ACCOUNT-BLOCKED")
- Production template specifies `db.t4g.medium` / 100GB / 500GB max
- **Risk:** 1GB RAM insufficient for production workloads; 20GB storage may fill quickly with evidence files
- **Fix:** Complete AWS account upgrade from free tier and re-apply Terraform with production-grade values

### BLOCKER-3: Redis Encryption-in-Transit Not Enabled
- No `transit_encryption_enabled = true` in any ElastiCache configuration
- App supports `rediss://` (TLS) via ioredis but Terraform doesn't provision encrypted endpoints
- **Risk:** Rate limit data and cache contents transmitted in cleartext between ECS and Redis
- **Fix:** Enable `transit_encryption_enabled = true` and update REDIS_URL to use `rediss://`

### ADVISORY-1: Environment Naming Inconsistency
- Terraform has both `environments/production/` and `environments/prod/` directories
- ECR repos: `aqliya/production/app` (promote.yml) vs `aqliya/prod/app` (prod tfvars) vs `aqliya/dev/app`
- ECS clusters: `aqliya-production-cluster` (promote.yml) vs `aqliya-prod-cluster` (deploy.yml)
- **Risk:** CI/CD referencing wrong resources after environment switch
- **Fix:** Standardise on one naming convention (`prod` or `production`)

### ADVISORY-2: Placeholder Values in Terraform Configs
- Staging and production tfvars have `<ACCOUNT_ID>` placeholders in `container_image`
- Staging is not deployable without manual edit
- **Fix:** Use `data.aws_caller_identity` in Terraform to derive account ID dynamically

### ADVISORY-3: No PagerDuty/Opsgenie Integration
- CRITICAL alerts go to SNS → email only
- No automated on-call paging
- **Fix:** Integrate SNS → PagerDuty or use notification engine webhook channel

### ADVISORY-4: Production Readiness Gate Not Executed
- `PRODUCTION_READINESS_GATE.md` is a **draft** with all checkboxes unchecked
- Penetration test not completed
- Load test not executed
- **Fix:** Execute the gate checklist before accepting pilot customers

### ADVISORY-5: Staging Deployment Has No DB Migration Step
- `deploy-staging.yml` builds and pushes Docker but doesn't run `prisma migrate deploy`
- Unlike CI which applies migrations, the staging deploy pipeline may deploy with schema-drifted code
- **Fix:** Add a migration step after ECS deployment or as a pre-deploy task

---

## 11. Enterprise Readiness Score

| Dimension | Score (1-10) | Rationale |
|-----------|--------------|-----------|
| **AWS Infrastructure (IaC)** | 8 | Modular, well-structured, multi-environment. -2 for naming inconsistency and placeholders. |
| **Container & Orchestration** | 8 | Multi-stage Docker, health checks, resource limits. -2 for free-tier constraints and ClamAV sidecar complexity. |
| **High Availability** | 7 | Multi-AZ for DB, auto-scaling for compute. -3 for single-node Redis in prod and free-tier RDS. |
| **Backup & Disaster Recovery** | 8 | Comprehensive strategy, restore drills, DR runbook. -2 for no evidence of RDS restore drill execution and daily-only CI backup (no PITR). |
| **Monitoring & Observability** | 7 | Excellent health endpoints, CloudWatch alarms, Sentry. -3 for no structured logging, no PagerDuty, no synthetic monitoring, no Prometheus. |
| **Secrets Management** | 8 | Secrets Manager, ECS injection, documented rotation. -2 for non-RDS secrets being manual rotation and SSM wildcard access. |
| **Runbook Quality** | 9 | 11 runbooks, comprehensive content, role-based index. -1 for placeholder contact info. |
| **CI/CD Pipeline** | 8 | Full test gates, auto-rollback, promotion workflow. -2 for duplicated staging CI, no Terraform CI, no E2E tests. |
| **Environment Parity** | 6 | Strong .env.example, well-documented dev setup. -4 for naming inconsistency (prod/production), placeholder values, no parity tests. |
| **Scaling & Performance** | 7 | Auto-scaling (CPU+memory), FARGATE_SPOT. -3 for no PgBouncer/RDS Proxy, single-node Redis, free-tier RDS. |
| **Security Hardening** | 7 | WAF, CSP, ClamAV, TLS, non-root user, gitleaks. -3 for no Redis encryption-in-transit, no pentest, CSP still has unsafe-eval/unsafe-inline. |
| **Operational Readiness** | 7 | Good runbooks, restore drills, smoke tests. -3 for placeholder contacts, no on-call schedule, no PagerDuty, PRODUCTION_READINESS_GATE unchecked. |
| **OVERALL** | **7.5 / 10** | **L5+ (Pilot-ready with operations support). Not yet L6.** |

---

## 12. Top 3 Findings

### 1. CRITICAL: Redis Single-Node + No Encryption-in-Transit
The active production Terraform config (`environments/prod/`) provisions a single Redis node without TLS encryption. The rate limiter and cache adapter both depend on Redis. A Redis failure would degrade rate limiting to per-instance memory mode and invalidate shared cache state across ECS tasks. **Fix:** Set `redis_num_cache_nodes = 2`, enable `transit_encryption_enabled`, update REDIS_URL to `rediss://`.

### 2. HIGH: Free-Tier RDS Blocking Production-Grade Sizing
The active production RDS runs on `db.t4g.micro` (1GB RAM, 20GB storage) because of AWS free-tier account limits. The Terraform values are explicitly marked "ACCOUNT-BLOCKED." This is the single biggest infrastructure risk — a production workload spike or evidence accumulation will exhaust resources. **Fix:** Upgrade AWS account from free tier and re-apply Terraform with `db.t4g.medium` / 100GB / 500GB max.

### 3. HIGH: Environment Naming Drift Creates CI/CD Risk
The repository has `environments/production/` and `environments/prod/` with different configurations. CI/CD workflows reference ECR repos and ECS clusters using different naming conventions (`production` vs `prod`). This drift will cause deployment failures if the wrong convention is used. **Fix:** Standardise on one naming convention across all Terraform configs, CI/CD workflows, and runbooks.

---

## 13. Appendix: File Inventory Audited

### Terraform IaC (17 files)
- `infra/terraform/main.tf`, `providers.tf`, `variables.tf`, `outputs.tf`, `terraform.tf`, `README.md`
- `infra/terraform/modules/networking/main.tf` (249 lines)
- `infra/terraform/modules/compute/main.tf` (499 lines)
- `infra/terraform/modules/database/main.tf` (159 lines)
- `infra/terraform/modules/storage/main.tf` (442 lines)
- `infra/terraform/modules/monitoring/main.tf` (403 lines)
- `infra/terraform/environments/{dev,staging,production,prod}/terraform.tfvars`

### CI/CD (7 workflows)
- `.github/workflows/{ci,deploy,deploy-staging,promote,backup,preview,governance}.yml`

### Runbooks (12 files)
- `runbooks/{README,deployment,security-incident,redis-operations,clamav-scanner,rate-limiter,staging-environment,monitoring,alerting,disaster-recovery,backup-restore}.md`

### Health & Monitoring (5 files)
- `src/app/api/health/{route,live/route,ready/route}.ts`
- `src/lib/platform/enterprise-health.ts`
- `src/app/api/monitoring/health/route.ts`

### Redis & Caching (4 files)
- `src/lib/platform/redis-client.ts`, `redis-cache-adapter.ts`, `redis-config.ts`
- `src/lib/platform/rate-limiter/redis-rate-limiter.ts`

### Container (2 files)
- `Dockerfile`, `docker-compose.yml`

### Backup & DR (3 files)
- `scripts/platform/restore-drill.mjs`, `db-backup-scheduler.mjs`
- `.github/workflows/backup.yml`

### Deployment Docs (4 files)
- `docs/deployment/{SECRETS_AND_ROTATION_RUNBOOK,PRODUCTION_READINESS_GATE,PRODUCTION_CUTOVER_RUNBOOK}.md`
- `.env.example`

### Platform Scripts (inspected for relevance)
- `scripts/platform/{restore-drill,post-deploy-smoke,backup-verify,db-backup,db-restore,db-restore-drill}.mjs/ts`

---

*Audit generated by OpenCode Agent. All findings based on repository evidence as of 2026-07-12. No destructive commands were run. No infrastructure state was modified.*
