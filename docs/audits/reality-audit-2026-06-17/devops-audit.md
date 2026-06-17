# DevOps Audit — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Overall Score: 70/100**

---

## CI/CD — PARTIALLY VERIFIED

| Workflow | File | Status | Notes |
|----------|------|--------|-------|
| CI | `.github/workflows/ci.yml` | VERIFIED | tsc + test + lint + build on PR/main |
| Deploy | `.github/workflows/deploy.yml` | PARTIAL | Would fail on current tsc; no Postgres service in CI |
| Promote | `.github/workflows/promote.yml` | PARTIAL | Rollback = force deploy, not image revert |
| Backup | `.github/workflows/backup.yml` | VERIFIED | Daily pg_dump artifact |
| Preview | `.github/workflows/preview.yml` | STUB | `--prebuilt` without build step |

**CI gap:** Tests run without Postgres — integration tests fail/skip.

---

## Docker — VERIFIED

| Asset | Status |
|-------|--------|
| `Dockerfile` multi-stage standalone | VERIFIED |
| Non-root `nextjs` user | VERIFIED |
| `docker-compose.yml` (dev PG) | VERIFIED — no Redis |
| `docker-compose.staging.yml` | VERIFIED — includes Redis |
| `docker-compose.test.yml` | VERIFIED — port 5433 |
| Node 20 (Docker) vs Node 22 (CI) | PARTIAL — version mismatch |

---

## Terraform — PARTIALLY VERIFIED

**Modules (all present in repo):**
- networking, database, compute, storage, monitoring

**Production config (`environments/production/terraform.tfvars`):**
- ECS Fargate 3-10 tasks, 1 vCPU / 2 GB
- RDS PostgreSQL 16 Multi-AZ, 30-day backup
- ElastiCache Redis 2 nodes
- CloudFront + WAF
- Domain: aqliya.com

**Known bug:** Monitoring module references `var.domain_name` not declared — may break `terraform validate`.

**Live AWS state:** UNVERIFIED (no AWS credentials used in audit).

---

## Monitoring — VERIFIED

| Component | Evidence |
|-----------|----------|
| Health endpoints | `/api/health`, `/live`, `/ready` |
| Admin monitoring | `/monitoring`, `/api/monitoring/health` |
| Sentry | `sentry.server.config.ts`, `next.config.mjs` wrapper |
| CloudWatch | Terraform monitoring module |
| System monitor lib | `system-monitor.ts` — DB, Redis, Bull metrics |

---

## Backup & DR — PARTIALLY VERIFIED

| Capability | Status |
|------------|--------|
| `scripts/backup.mjs` | VERIFIED |
| `scripts/db-backup.ts` / `db-restore.ts` | VERIFIED |
| GHA scheduled backup | VERIFIED |
| `backup:verify` | PARTIAL — checks live DB, not restore |
| AWS Backup (Terraform) | VERIFIED in IaC |
| Cross-region DR | PARTIAL — one-time snapshot copy |
| ha-dr-plan.md | VERIFIED doc exists |

**RTO/RPO claims in docs:** UNVERIFIED by drill execution.

---

## Redis & Queues — VERIFIED

- ioredis client with health ping
- Bull queue `aqliya-workflows` gated by `FF_QUEUE_ENABLED`
- Redis URL injected via ECS secrets in Terraform
- Rate limiter supports Redis backend

---

## Deployment Pipeline Reality

**Current state:** Pipeline definition is production-grade; **execution blocked by TS/build failures**.

Deploy flow:
1. tsc → **WOULD FAIL TODAY**
2. terraform validate/plan
3. Docker build → **WOULD FAIL TODAY**
4. ECR push
5. ECS force-new-deployment
6. post-deploy-smoke.mjs

---

## Logging — VERIFIED

- ECS awslogs driver configured in Terraform
- Platform audit log writes (when DB available)
- Sentry error tracking in production

---

## Recommendations

| Priority | Action | Effort |
|----------|--------|--------|
| P0 | Fix build/TS to unblock deploy pipeline | 1-2d |
| P0 | Fix Terraform monitoring `domain_name` variable | 1h |
| P1 | Add Postgres service to CI or document mock-only strategy | 4h |
| P1 | Implement true ECS rollback (task definition revision) | 1d |
| P1 | Make backup:verify test restore integrity | 2d |
| P2 | Align Node 20/22 across Docker and CI | 2h |
| P2 | Fix or remove Vercel preview workflow | 1h |

---

## Operational Readiness

| Check | Status |
|-------|--------|
| Runbooks exist | VERIFIED (`docs/operations/`, `runbooks/`) |
| Smoke tests exist | VERIFIED |
| DR drill script exists | PARTIAL (not in npm scripts) |
| On-call alerting | PARTIAL (SNS in Terraform; live unverified) |
| Infrastructure as Code | VERIFIED |

**DevOps verdict:** Infrastructure **design is L5**; **operational proof is L3** due to build block and unverified live deployment.
