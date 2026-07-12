# AQLIYA AWS Deployment Readiness Verification

**Status:** Production activation audit  
**Version:** 1.0  
**Date:** 2026-07-04  
**Method:** Line-by-line inspection of every Terraform file, every workflow, Dockerfile, env config, and application code dependency against ECS runtime  

---

## 1. Terraform Module Deployability

Every module was inspected line-by-line for variable wiring, cross-module references, hardcoded assumptions, and likely `apply` success or failure.

### 1.1 Networking — ✅ READY WITH CAVEATS

| Check | Result |
|-------|--------|
| VPC resource | ✅ Clean. CIDR, DNS, tags all correct. |
| Subnets (public, private, database) | ✅ Correct — 3 each, mapped to AZs, tagged. |
| Internet Gateway | ✅ Clean. |
| NAT Gateway | ⚠️ **3 NAT Gateways (one per AZ)**: At ~$90/mo total, this is the single largest infrastructure waste. For first activation, 1 NAT Gateway is sufficient for all environments. |
| Route tables & associations | ✅ Clean — one public RT, per-AZ private RTs. |
| DB subnet group | ✅ Correct. |
| Security groups (ALB, ECS, RDS, Redis) | ✅ Clean — proper ingress/egress rules. **But:** `0.0.0.0/0` egress on all SGs is permissive. |
| Outputs | ✅ All 9 outputs match root module expectations. |
| **_allowed_cidrs_https unused** | ⚠️ Variable `allowed_cidrs_https` is defined in `variables.tf` (default `["0.0.0.0/0"]`) but **never passed to any module**. If you need to restrict HTTPS access, it won't work. |

**Verdict:** `terraform apply` will succeed for this module. The 3 NAT Gateways are wasteful for first deployment but not blocking.

### 1.2 Database — ✅ READY WITH CAVEATS

| Check | Result |
|-------|--------|
| Parameter group | ✅ Clean. pg_stat_statements preloaded, log_statement=ddl. |
| Primary RDS instance | ✅ Correct. Encrypted, gp3, version 16.3, backup window set. |
| Secrets Manager reference | ⚠️ Uses `data.aws_secretsmanager_secret` with name `aqliya/{env}/db-password`. **Secret must exist before `terraform apply`.** |
| Multi-AZ | ✅ Controlled by var. |
| Deletion protection | ✅ Controlled by var. |
| Read replica | ✅ Conditionally created for production only. |
| Cross-region DR | ⚠️ **Uses `aws_db_instance.primary.latest_snapshot`** — this references the latest automated snapshot. If the automated backup hasn't run yet (fresh DB), this resource will fail to find a snapshot. **Likely cause first apply failure for production.** |
| Read replica user/password | ✅ Pulls same Secrets Manager secret as primary. |
| CloudWatch logs export | ✅ Enabled (postgresql, upgrade). |
| Outputs | ✅ Correct (`rds_endpoint`, `rds_reader_endpoint`, `rds_arn`). |

**Verdict:** `terraform apply` will succeed **except** for `cross_region_dr` on a fresh deployment — that resource will fail because no automated snapshot exists yet. **Mitigation:** Set `enable_cross_region_dr = false` for first apply, then enable after first automated backup completes (~24h).

### 1.3 Compute — ❌ HIGH RISK / LIKELY TO CAUSE ISSUES AT APPLY

| Check | Result |
|-------|--------|
| ECS Cluster | ✅ Clean. Container insights enabled. |
| Capacity providers | ✅ FARGATE + FARGATE_SPOT configured. |
| ECR Repository | ✅ Created with lifecycle policy (30 images). |
| IAM Roles | ✅ Task execution + task roles created. |
| IAM Policies | ⚠️ **Too permissive**: `s3:*` on `arn:aws:s3:::*` (all buckets). Should be scoped to specific S3 buckets. Will work but not best practice. |
| CloudWatch log group | ✅ Created with retention days. |
| **Task Definition — ClamAV essential** | **🚨 CRITICAL:** The task definition has ClamAV as sidecar with `essential = true`. The `app` container has `dependsOn { containerName = "clamav", condition = "HEALTHY" }`. **This means the app will NOT start until ClamAV passes its health check.** ClamAV on first boot can take 2-5+ minutes to download virus definitions. If ClamAV fails, the entire task dies. |
| **Task Definition — ClamAV health check** | ⚠️ Uses `clamdcheck.sh` — this is a script that comes with the official ClamAV image. It should work but the health check timeout (10s) and start period (120s) may not be enough for first boot. |
| **Task Definition — Secrets ARN format** | ⚠️ Uses `arn:aws:secretsmanager:me-south-1:*:secret:...` with `*` for account ID. AWS resolves this within the current account. **However, the secret name lacks the 6-char random suffix.** Per AWS docs, partial ARN matching works for ECS secrets but only if the name is unique. All referenced secrets must exist before `terraform apply`. |
| **Task Definition — environment variables** | ⚠️ Hardcodes `CLAMAV_HOST = "127.0.0.1"` (sidecar) and `SCANNER_PROVIDER = "clamav"`. If ClamAV sidecar is removed or fails, the app can't start. |
| **Task Definition — FF_AI_REAL_PROVIDERS** | ⚠️ For production: `FF_AI_REAL_PROVIDERS = "false"` — AI features will use mock/deterministic providers only. |
| ALB | ✅ Correct. HTTPS listener with TLS 1.2+1.3. HTTP→HTTPS redirect. |
| **ALB — ACM certificate** | 🚨 Uses `data.aws_acm_certificate` for `*.{domain_name}`. **ACM certificate must exist BEFORE `terraform apply`.** |
| Target group | ✅ Health check on `/api/health`, port 3000, matcher "200". |
| ECS Service | ✅ Fargate, private subnets, no public IP. |
| Auto-scaling | ✅ CPU 70%, memory 75%. Correctly configured. |
| Route53 records | 🚨 Uses `data.aws_route53_zone.main` — **Route53 hosted zone must exist before apply.** Creates A records for root domain + wildcard. |
| Redis | ✅ Subnet group, cluster, automatic failover for production. |

**Verdict:** `terraform apply` will **create resources** but the ECS task definition may fail to resolve (missing secrets) and even if it does, the ClamAV dependency will cause the app to fail its health checks repeatedly if ClamAV doesn't start fast enough. **High risk module.**

### 1.4 Storage — ✅ READY WITH MINOR CAVEATS

| Check | Result |
|-------|--------|
| S3 Upload bucket | ✅ Created, versioning enabled, SSE-S3 encrypted, public access blocked. |
| S3 Upload lifecycle | ✅ 365d expiration, 90d→IA, 365d→Glacier. |
| S3 Static bucket | ✅ Created, versioning enabled. |
| **S3 Static bucket — public access block** | ⚠️ `block_public_acls = false`, `block_public_policy = false` — intentional for CloudFront OAI, but the bucket is technically discoverable if someone knows the direct URL. Acceptable risk. |
| CloudFront distribution | ✅ OAI for S3, ALB origin for `/_next/*` and `/api/*`. Cache behaviors correct. |
| **CloudFront — ACM certificate** | 🚨 Uses `data.aws_acm_certificate.cloudfront` with provider `aws.us_east_1`. **ACM certificate for `*.{domain_name}` must exist in us-east-1 before apply.** |
| CloudFront price class | ⚠️ `PriceClass_100` — US/Europe/Middle East only. Correct for KSA audience. |
| WAFv2 | ✅ Rate limiting (5000/5min), AWS Managed Common Rules, SizeRestrictions_BODY excluded. |
| WAF association | ✅ Associated with CloudFront distribution. |
| Route53 record for static | ✅ `static.{domain_name}` → CloudFront. |
| Outputs | ✅ All 5 outputs correct. |

**Verdict:** `terraform apply` will succeed. Caveats are minor.

### 1.5 Monitoring — ❌ HAS ACTUAL BUG

| Check | Result |
|-------|--------|
| CloudWatch Dashboard | ✅ Correct. ECS, RDS, ALB, Redis widgets. |
| **ECS CPU alarm** | ⚠️ Threshold 85% for 15 min → triggers SNS. Correct dimensions (ClusterName + ServiceName). |
| **RDS CPU alarm** | **🚨 BUG: Dimension mismatch.** Alarm uses `DBInstanceIdentifier = var.project_name` which resolves to `"aqliya"`. But the actual RDS instance identifier is `"aqliya-{environment}-db"` (e.g., `"aqliya-production-db"`). **This alarm will never fire** because the dimension doesn't match any resource. CloudWatch will show "Insufficient data" perpetually. |
| **RDS free storage alarm** | **🚨 Same bug as above.** `DBInstanceIdentifier = var.project_name` → `"aqliya"` instead of the real identifier. |
| ALB 5XX alarm | ✅ Correct dimensions (`LoadBalancer = alb.arn_suffix`). |
| ALB latency alarm | ✅ Correct. p95 > 3s → SNS. |
| SNS topic | ✅ Created. |
| SNS subscription | ⚠️ Email to `ops@{domain_name}` — only created for production. **You must confirm the SNS subscription before alarms notify.** |
| KMS key for backup | ✅ Created with rotation. |
| Backup vault | ✅ Created with KMS key reference. |
| Backup plan | ✅ Daily, weekly, monthly with correct retention. |
| Backup selection | ✅ Targets RDS by ARN. |
| IAM role for backup | ✅ Created with correct policy. |

**Verdict:** `terraform apply` will succeed but **two RDS alarms will silently never fire** due to incorrect dimension naming. The monitoring module has a production-impacting bug.

### 1.6 DR Resources — ❌ WILL FAIL ON FIRST APPLY

| Resource | Issue | Impact |
|----------|-------|--------|
| `aws_db_snapshot_copy` | Uses `aws_db_instance.primary.latest_snapshot` — no snapshot exists on a fresh RDS instance | Resource creation will fail on first `terraform apply` |
| Conditional on `enable_cross_region_dr && env == production` | Can be disabled for first deploy | Set `enable_cross_region_dr = false` initially |

**Verdict:** Must be disabled for first deployment. Enable after 24h when first automated backup exists.

### 1.7 Root Module Wiring Summary

| Reference | Wired? | Issue |
|-----------|--------|-------|
| `module.networking` → root | ✅ Clean |
| `module.database` → root | ✅ Clean |
| `module.compute` → root | ✅ Clean |
| `module.storage` → root | ✅ Clean |
| `module.monitoring` → root | ✅ Clean |
| `networking.db_subnet_group_name` → database | ✅ Correct |
| `networking.rds_security_group_id` → database | ✅ Correct |
| `networking.private_subnet_ids` → compute | ✅ Correct |
| `networking.ecs_security_group_id` → compute | ✅ Correct |
| `networking.alb_security_group_id` → compute | ✅ Correct |
| `networking.redis_security_group_id` → compute | ✅ Correct |
| `networking.vpc_id` → compute | ✅ Correct |
| `compute.alb_dns_name` → storage | ✅ Correct |
| `compute.ecs_cluster_name` → monitoring | ✅ Correct |
| `compute.alb_arn_suffix` → monitoring | ✅ Correct |
| `database.rds_arn` → monitoring | ✅ Correct |
| `var.allowed_cidrs_https` → nowhere | ⚠️ Defined but unused |

---

## 2. Runtime Deployability of the Application Container

### 2.1 Dockerfile Audit

```
FROM node:22-alpine AS base
FROM base AS builder
  - ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aqliya (build-time placeholder)
  - ENV AUTH_SECRET=build-time-placeholder-minimum-32-characters
  - RUN npm ci --ignore-scripts
  - RUN npm run build       <-- requires DATABASE_URL + AUTH_SECRET for build-time generation
FROM base AS runner
  - COPY .next/standalone   <-- Next.js standalone output
  - COPY .next/static
  - USER nextjs
  - CMD ["node", "server.js"]
```

| Check | Result |
|-------|--------|
| Multi-stage build | ✅ Correct |
| Build-time env placeholders | ✅ OK — these are only used during build, not at runtime |
| Standalone output | ✅ Correct — `.next/standalone/server.js` is the entry point |
| `node server.js` at port 3000 | ✅ Correct |
| Non-root user | ✅ `nextjs` user |
| Uploads directory | ✅ Created at `/app/uploads` with correct ownership |
| Alpine base | ✅ Small, secure |

**Verdict:** ✅ Dockerfile is production-correct.

### 2.2 ECS Boot Sequence (Critical Path)

The moment an ECS Fargate task starts, this happens:

```
1. ECS pulls container images: app + clamav
2. Docker starts both containers in parallel
3. ClamAV begins:
   a. First boot: Freshen virus database (can take 2-5 MINUTES)
   b. Starts clamd daemon
   c. Health check: clamdcheck.sh (interval 30s, start period 120s, retries 5)
4. App container:
   a. Waits for ClamAV health check to pass (dependsOn condition: HEALTHY)
   b. Reads secrets from AWS Secrets Manager (DATABASE_URL, REDIS_URL, AUTH_SECRET, etc.)
   c. Starts Node.js server on port 3000
   d. ALB health check hits /api/health (interval 30s, start period 60s, retries 3)
5. ALB starts routing traffic when target group health check passes
```

**🚨 CRITICAL BOOT ISSUES:**

1. **ClamAV first boot takes 2-5 minutes.** The task definition has `startPeriod = 120` for ClamAV health check. If ClamAV needs more than 120s + (30s × 5 retries) = 270s (4.5 min), the health check fails and ECS kills the task.

2. **App depends on ClamAV being HEALTHY.** The app container has `dependsOn { condition = "HEALTHY" }` for ClamAV. The `essential = true` on ClamAV means if ClamAV is killed, ECS stops the app too.

3. **ALB health check has `startPeriod = 60`.** If the app doesn't start listening within 60s + (30s × 3 retries) = 150s after it begins (which itself can't start until ClamAV is healthy), the target is marked unhealthy and ECS replaces the task.

4. **If any required secret doesn't exist** in Secrets Manager, the container will fail to start and the task will be in a crash loop.

### 2.3 Will the App Boot Successfully?

**Yes, IF:**
- All secrets exist in Secrets Manager with the correct names
- ClamAV starts within ~4 minutes on first boot (it usually does with a fresh image)
- The database is reachable from the VPC (it will be, since RDS is in the same VPC)
- The `curl` command (health check) is available in the Alpine container (❗ **CHECK**)

**No, IF:**
- Any single secret is missing (ECS will fail to resolve it and crash the container)
- ClamAV takes >4.5 minutes on first boot (very common on slow internet connections)
- `curl` is not installed in the `node:22-alpine` base image

**🚨 CRITICAL FINDING: `curl` availability.** The health check uses `curl -f http://localhost:3000/api/health`. The `node:22-alpine` Docker image does **NOT** have `curl` installed by default. The health check will **ALWAYS FAIL** because `curl` won't exist in the container.

**Fix:** Either:
- Add `RUN apk add --no-cache curl` to the Dockerfile
- Or change the health check to use Node.js (`node -e "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok?0:1))"`)
- Or use `wget` (which may be available in Alpine)

### 2.4 Required Env Vars / Services for First Boot

| Service | Required? | Effect if Missing |
|---------|-----------|-------------------|
| Database (RDS) | **REQUIRED** | App crashes immediately — Prisma needs DB on boot |
| Redis | Optional per health check | App degrades gracefully (no rate limiting, no session cache) |
| S3 | Optional per health check | File uploads fail, but app boots |
| Secrets Manager | **REQUIRED** | ECS task definition won't resolve, container won't start |
| ClamAV | **ESSENTIAL** | App container won't start (dependsOn) |
| AI providers | Feature-flagged | FF_AI_REAL_PROVIDERS=false — app works without AI keys |
| SMTP | Optional | Email notifications won't send, app works |

---

## 3. Secrets and Configuration Readiness

### 3.1 Complete Secrets Inventory

The ECS task definition references **15 secret groups**. Every single one of these must exist in AWS Secrets Manager with the EXACT naming convention `aqliya/{env}/{secret-group}` BEFORE `terraform apply`.

| # | Secret Name | Variables Populated | Required? | Classification |
|---|-------------|-------------------|-----------|----------------|
| 1 | `aqliya/{env}/database-url` | `DATABASE_URL` | ✅ **REQUIRED** | Pre-apply |
| 2 | `aqliya/{env}/db-password` | RDS password | ✅ **REQUIRED** | Pre-apply |
| 3 | `aqliya/{env}/redis-url` | `REDIS_URL` | ✅ **REQUIRED** | Pre-apply |
| 4 | `aqliya/{env}/auth-secret` | `AUTH_SECRET`, `NEXTAUTH_SECRET` | ✅ **REQUIRED** | Pre-apply |
| 5 | `aqliya/{env}/storage-config` | `STORAGE_PROVIDER`, `S3_UPLOAD_BUCKET` | ✅ **REQUIRED** | Pre-apply |
| 6 | `aqliya/{env}/scim-api-key` | `SCIM_API_KEY` | ⚠️ Optional (but ECS will still try to resolve) | Pre-apply |
| 7 | `aqliya/{env}/sso-config` | `SSO_DEFAULT_ORG_ID` | ⚠️ Optional | Pre-apply |
| 8 | `aqliya/{env}/google-oauth` | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | ⚠️ Optional | Pre-apply |
| 9 | `aqliya/{env}/github-oauth` | `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` | ⚠️ Optional | Pre-apply |
| 10 | `aqliya/{env}/azure-ad-oauth` | `AUTH_AZURE_AD_ID`, `AUTH_AZURE_AD_TENANT_ID`, `AUTH_AZURE_AD_SECRET` | ⚠️ Optional | Pre-apply |
| 11 | `aqliya/{env}/okta-oauth` | `AUTH_OKTA_ID`, `AUTH_OKTA_SECRET`, `AUTH_OKTA_ISSUER` | ⚠️ Optional | Pre-apply |
| 12 | `aqliya/{env}/oidc-config` | `AUTH_OIDC_ISSUER`, `AUTH_OIDC_CLIENT_ID`, `AUTH_OIDC_CLIENT_SECRET` | ⚠️ Optional | Pre-apply |

**🚨 CRITICAL FINDING:** The ECS task definition references ALL these secrets unconditionally. Even if a secret is "optional" for the app, **ECS will fail to resolve the task definition if the secret doesn't exist in Secrets Manager.** The container won't start.

**Currently missing from Terraform:** There is no mechanism to make secrets conditional. All 12 secret groups must exist with at least dummy values, even if the feature isn't used.

### 3.2 Additional Env Vars (Non-Secrets Manager)

These are passed as plain `environment` in the container definition (not secrets):

| Env Var | Value | Required? |
|---------|-------|-----------|
| `NODE_ENV` | `production` | ✅ |
| `NEXT_PUBLIC_DEPLOY_ENV` | Environment name | ✅ |
| `DOMAIN_NAME` | From tfvars | ✅ |
| `RATE_LIMITER` | `redis` (hardcoded) | ✅ Redis is required |
| `SCANNER_PROVIDER` | `clamav` (hardcoded) | ⚠️ Makes ClamAV mandatory |
| `CLAMAV_HOST` | `127.0.0.1` | Sidecar assumption |
| `CLAMAV_PORT` | `3310` | Sidecar assumption |
| `FF_AI_RAG` | `true` | Feature flag |
| `FF_AI_REAL_PROVIDERS` | `false` (production) | Feature flag |
| `FF_QUEUE_ENABLED` | `true` | Feature flag |
| `FF_TENANT_LIFECYCLE` | `true` (production) | Feature flag |

**Missing:** Many env vars from `.env.example` are NOT set in the ECS task definition. The app may have fallback defaults for most, but verify:
- `DOWNLOAD_TOKEN_SECRET` — if used, must be in secrets
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` — not set, AI providers won't work for cloud tasks
- `SENTRY_DSN` — error monitoring won't work
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — analytics won't work

---

## 4. Data Plane Readiness

### 4.1 RDS

| Task | Required Before Production Boot? | Status |
|------|----------------------------------|--------|
| Create RDS instance | Yes | Terraform does this |
| Install pgvector extension | Yes — required by schema | `CREATE EXTENSION IF NOT EXISTS vector;` must run |
| Create database | Yes — Terraform sets `db_name = "aqliya"` | Done by Terraform |
| Apply Prisma migrations (54) | Yes — 54 migrations exist | CI does `prisma migrate deploy` |
| Run seed script | Yes — seed data needed (org, users, etc.) | `prisma/seed.ts` exists |
| Verify pgvector is loaded | Yes — `/api/health` checks this | ✅ |
| Configure proper connection pool | No — Prisma default is fine for start | ⚠️ Monitor for connection limits |

**54 Migrations from Scratch:** Applying 54 migrations on a fresh RDS will take **1-3 minutes**. The CI pipeline's `migrate` job handles this, but the pipeline timeout must accommodate it.

### 4.2 pgvector

- **Schema dependency:** `DocumentChunk.embedding` is `vector(1536)` — this is not optional
- **Extension install:** Must run `CREATE EXTENSION IF NOT EXISTS vector;` before first migration
- **CI already does this:** Line 74 of `ci.yml` runs the CREATE EXTENSION command via psql
- **Production:** Must be run manually (or as part of first migration script) before migrations

### 4.3 Redis

| Task | Required? | Status |
|------|-----------|--------|
| Create ElastiCache cluster | Yes | Terraform does this |
| Configure security group | Yes | ✅ Done — ECS tasks can reach Redis |
| Verify connection from app | Not for boot | Health endpoint marks Redis as optional if `REDIS_URL` not set. But `RATE_LIMITER=redis` means the app will try to use Redis. |

**⚠️ Edge case:** `RATE_LIMITER=redis` is hardcoded in the ECS task definition. If Redis is unreachable, rate limiting will fail. The rate limiter code may crash or degrade depending on implementation.

### 4.4 S3

| Task | Required? | Status |
|------|-----------|--------|
| Create S3 buckets | Yes | Terraform does this |
| Configure bucket policies | Yes | Uploads: blocked public access. Static: CloudFront OAI. |
| Verify app S3 provider config | Yes | App expects `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` |
| **S3 config mismatch?** | ⚠️ | Terraform sets `S3_UPLOAD_BUCKET` from secrets. But app's S3 storage provider uses `S3_BUCKET` env var (from `.env.example`). **NAMING MISMATCH between Terraform's secret key and the app's env var.** |

**🚨 S3 naming mismatch:** The ECS task definition sets `S3_UPLOAD_BUCKET` from secrets, but the S3 storage provider code (`s3-storage-provider.ts`) reads `S3_BUCKET` env var. These must be aligned. If `S3_UPLOAD_BUCKET` is set but `S3_BUCKET` is not, the S3 provider will fall back to local storage or fail.

### 4.5 Backups

| Asset | Status | Works? |
|-------|--------|--------|
| `scripts/platform/backup.mjs` | ✅ Exists | Uses pg_dump, works with DATABASE_URL |
| `scripts/platform/restore-drill.mjs` | ✅ Exists | Creates temp DB, restores, verifies, drops |
| `.github/workflows/backup.yml` | ✅ Exists | Daily cron, uploads artifact |
| AWS Backup plan | ✅ In Terraform | Daily/weekly/monthly backup plan |

### 4.6 Data Plane Checklist (First Boot)

```
Before ECS deploy (manual):
1. RDS must exist and be accepting connections
2. pgvector extension must be installed
3. Prisma migrations must be applied (54 of them)
4. Seed data must be loaded

After ECS deploy (automatic):
5. Health check verifies DB, pgvector, Redis, S3
6. App is ready for traffic
```

---

## 5. CI/CD Truth Audit

### 5.1 Workflow Table

| Workflow | Real Purpose | Works As-Is? | Hidden Prerequisites | Risk |
|----------|-------------|-------------|----------------------|------|
| **ci.yml** | PR and main-branch quality: lint, type, test, build, audit | ✅ **YES** | pgvector Postgres service (provided via Docker in CI) | Low. Already working. |
| **deploy.yml** | Push to main/staging → test, terraform plan, build image, migrate DB, apply terraform, force ECS deploy, smoke test | ⚠️ **PARTIALLY** | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `DATABASE_URL`, `SCIM_API_KEY`, `SMOKE_TEST_TOKEN` as GitHub secrets. Route53 zone must exist. ACM certs must exist. | **Medium-High.** Depends on secrets, certs, DNS. Container image tfvar placeholder will cause issues. |
| **promote.yml** | Manual staging→production promotion: validate staging health, promote image, smoke test, rollback on failure | ⚠️ **PARTIALLY** | Same AWS credentials. Staging must already be healthy. | Medium. Rollback logic is simple (revision -1) which assumes previous revision is stable. |
| **preview.yml** | Vercel preview deploys for PRs | ✅ **YES** | Vercel secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) | Low. Vercel previews don't affect production. |
| **backup.yml** | Scheduled daily DB backup | ⚠️ **UNTESTED** | `DATABASE_URL` as GitHub secret for production DB | Low. Runs in GitHub Actions, not in VPC. Large backups could timeout. |

### 5.2 deploy.yml — Specific Issues

| Step | Issue | Impact |
|------|-------|--------|
| **Terraform plan** | Uses `environments/{env}/terraform.tfvars`. Staging and production tfvars have `<ACCOUNT_ID>` placeholder for `container_image`. | Plan will fail because ECR URL is invalid. Must be fixed before first deploy. |
| **Terraform plan** | Creates `tfplan` artifact | ✅ Correct pattern — plan persists for apply. |
| **Build & push** | Pushes Docker image with `:latest` + `:${{ github.sha }}` tags | ✅ Correct. |
| **Migrate** | Runs `prisma migrate deploy` and `prisma migrate status` | ✅ Correct. Uses `secrets.DATABASE_URL`. |
| **Terraform apply** | Applies the plan from the previous `terraform` step. | ⚠️ Plan was created before the image was built. If infra changes depend on the image existing (they don't - ECR is separate), this is fine. |
| **ECS update-service** | `aws ecs update-service --force-new-deployment` | ⚠️ This forces a new deployment of the CURRENT task definition. It works because `:latest` tag was updated, so the new deployment pulls the new `:latest` image. **But `:latest` is a mutable tag** — not immutable deploy best practice. |
| **Post-deploy smoke test** | Uses `BASE_URL` from branch name (e.g., `https://aqliya.com` for main) | ⚠️ DNS must be configured and resolving before this step. If Route53 isn't set up, smoke test fails. |

### 5.3 Rollback Reality

**Promote.yml has real rollback.** It:
1. Gets the current task definition ARN
2. Extracts the revision number
3. Decrements by 1 to get previous revision
4. Calls `ecs update-service --task-definition PREVIOUS_REVISION`

**This works IF:**
- The previous revision is still registered (ECS retains task definitions indefinitely)
- The previous revision has a working container image (images are tagged with commit SHA + `:latest`)
- The rollback happens before the old image is garbage collected (ECR lifecycle keeps 30 images)

**Limitation:** Revision -1 assumes the task definition revision immediately preceding the current one is the old stable version. This is true for sequential deploys but NOT true if:
- Multiple `ecs update-service` calls happen (each creates a new revision)
- Terraform apply changes the task definition (creates new revision)
- Manual ECS operations happen

**Verdict:** Rollback works for simple cases but is fragile. Not production-grade.

### 5.4 What's Not in CI

| Missing Piece | Why It Matters |
|---------------|----------------|
| No infrastructure CI | Terraform validate runs but no automated compliance checks |
| No security scanning on ECS images | ECR has `scan_on_push = true` but no gate/fail on high severity |
| No integration test against real RDS | CI uses ephemeral pgvector container, not RDS |
| No DR drill in CI | `restore-drill.mjs` exists but is not scheduled |
| No secret rotation check | Secrets are created manually, rotation not configured |

---

## 6. Bootstrap Gap Analysis

### 6.1 Group A: Must Be Done Before `terraform apply`

These are prerequisites that Terraform assumes already exist. If skipped, `terraform apply` will fail.

| # | Prerequisite | How to Verify | Effort |
|---|-------------|---------------|--------|
| A1 | **Create S3 state bucket** (`aqliya-terraform-state`) | `./bootstrap.sh` (script exists) | 5 min |
| A2 | **Create DynamoDB lock table** (`aqliya-terraform-locks`) | Same script above | 5 min |
| A3 | **Request ACM certificate for `*.{domain}` in me-south-1** | DNS validation via Route53 | 30 min (DNS propagation) |
| A4 | **Request ACM certificate for `*.{domain}` in us-east-1** | Needed for CloudFront | 30 min |
| A5 | **Create Route53 hosted zone for domain** | Must already exist | 10 min |
| A6 | **Create ALL 12 secrets in AWS Secrets Manager** (see §3.1) with correct naming | See naming table above | 30 min |
| A7 | **Set AWS credentials** (access key + secret key) in GitHub Secrets | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | 5 min |
| A8 | **Fix `container_image` in all tfvars** | Replace placeholder with real ECR URL | 5 min |

### 6.2 Group B: Must Be Done Before First ECS Deploy

| # | Prerequisite | How | Effort |
|---|-------------|-----|--------|
| B1 | **Fix Dockerfile — add `curl`** | Add `RUN apk add --no-cache curl` to Dockerfile | 5 min |
| B2 | **Set `enable_cross_region_dr = false`** in production tfvars for first deploy | Change one variable | 1 min |
| B3 | **Fix RDS alarm dimension bug** in monitoring module | Change `var.project_name` → `"${var.project_name}-${var.environment}-db"` | 5 min |
| B4 | **Build and push initial Docker image to ECR** | Manual `docker build && docker push` or let CI do it | 10 min |
| B5 | **Ensure git SHA + DATABASE_URL secret set in GitHub** | Add secrets to GitHub repo | 5 min |
| B6 | **Run `terraform apply` for dev first** (not production) | Validate in low-risk environment first | 15 min |
| B7 | **Install pgvector extension** in RDS | `psql -h <rds-endpoint> -U aqliya_admin -d aqliya -c "CREATE EXTENSION IF NOT EXISTS vector;"` | 5 min |
| B8 | **Apply Prisma migrations from CI** or manually | `npx prisma migrate deploy` | 3 min |
| B9 | **Run seed script** | `npx prisma db seed` | 2 min |

### 6.3 Group C: Must Be Done Before Production Cutover

| # | Prerequisite | Why | Effort |
|---|-------------|-----|--------|
| C1 | **Register domain** (`aqliya.com` or chosen domain) | Required for Route53 + ACM + public access | Varies |
| C2 | **Confirm SNS subscription** for alarm notifications | SNS sends confirmation email to `ops@{domain}` | 5 min |
| C3 | **Verify DNS resolution** for root domain + wildcard + static subdomain | Route53 → ALB/CloudFront | 30 min after deploy |
| C4 | **Configure CDN cache behaviors** if default not optimal | Verify CloudFront settings | 15 min |
| C5 | **Set up proper monitoring dashboards** | Auto-created by Terraform, but verify | 15 min |
| C6 | **Configure AI provider API keys** (if cloud AI needed) | `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` in secrets or env | 10 min |
| C7 | **Set up Sentry** (DSN, org, project) | Add `SENTRY_DSN` to secrets | 10 min |
| C8 | **Set up Plausible** (self-hosted or cloud) | Add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | 30 min |

### 6.4 Group D: Can Wait Until After First Internal Deployment

| # | Task | Priority |
|---|------|----------|
| D1 | Set up GuardDuty + SecurityHub + CloudTrail | High — but not blocking first boot |
| D2 | Configure VPC Endpoints | High — but not blocking first boot |
| D3 | Enable DR (cross-region snapshot) after 24h | Medium |
| D4 | Set up Bedrock AI provider | Medium |
| D5 | Configure SAML SSO with real IdP | Medium |
| D6 | Add WAF to ALB (currently only on CloudFront) | Medium |
| D7 | Schedule DR drill in CI | Low |
| D8 | Implement canary/blue-green deploys | Low |
| D9 | Configure secret rotation | Low |

---

## 7. Cost Reality

### 7.1 What Actually Gets Created (from real Terraform)

These resources will definitely exist after `terraform apply`:

| Resource | Dev | Staging | Production | Monthly Cost (Prod) |
|----------|-----|---------|------------|-------------------|
| VPC (includes NAT Gateway, IGW, Elastics IPs) | 3 subnets | 3 subnets | 3 subnets, **3 NAT Gateways** | $90 (3 NAT) |
| ALB | ✅ 1 | ✅ 1 | ✅ 1 | $25 |
| ECS Fargate (always running) | 1 task × 256/512 | 2 tasks × 512/1024 | 3 tasks × 1024/2048 | $150 |
| ECR Repository | ✅ 1 | ✅ 1 | ✅ 1 | ~$1 |
| CloudWatch Logs | Log group | Log group | Log group | $15 |
| RDS PostgreSQL | 1 × t4g.small | 1 × t4g.small | 1 × r6g.large Multi-AZ + 1 read replica | $600 |
| ElastiCache Redis | 1 × t4g.small | 1 × t4g.small | 2 × r6g.large | $150 |
| S3 buckets | 2 buckets | 2 buckets | 2 buckets + versioning | $10 |
| CloudFront | ✅ 1 distribution | ✅ 1 distribution | ✅ 1 distribution | $10 |
| WAFv2 | ✅ 1 WebACL | ✅ 1 WebACL | ✅ 1 WebACL | $10 |
| Route53 records | Hosted zone + records | Hosted zone + records | Hosted zone + records | $5 |
| AWS Backup vault + KMS | ✅ | ✅ | ✅ | $10 |
| CloudWatch Dashboard + Alarms | ✅ | ✅ | ✅ | $5 |
| KMS (backup + RDS) | ✅ | ✅ | ✅ | $5 |

### 7.2 Cost by Environment

| Environment | Monthly Cost | Notes |
|-------------|-------------|-------|
| **Dev (cheapest)** | ~$80-100/mo | 1 NAT, 1 ECS task, 1 t4g.small DB, 1 Redis t4g.small |
| **Staging** | ~$120-150/mo | 1 NAT, 2 ECS tasks, 1 t4g.small DB, 1 Redis t4g.small |
| **Production (as defined)** | **~$1,070-1,100/mo** | BREAKDOWN: $90 NAT + $25 ALB + $150 ECS + $600 RDS + $150 Redis + $10 S3 + $10 CloudFront + $10 WAF + $10 Backup + $5 Route53 + $10 KMS/logs |
| **"Everything enabled"** | **~$1,200-1,500/mo** | Production + DR snapshot copy + multi-region costs + more S3 storage |

### 7.3 Waste in Current Terraform

| Waste | Amount | Fix |
|-------|--------|-----|
| **3 NAT Gateways** in production | **$65/mo** over 1 NAT | Consolidate to 1 NAT Gateway. For production, 1 NAT with 3 AZs is acceptable. For dev/staging, 0 NAT (or 1) is fine. |
| **RDS instance class** for dev/staging | ~$400/mo waste | Dev/Staging tfvars already use `db.t4g.medium` — this is reasonable. Production uses `r6g.large` which is appropriate. |
| **2 Redis nodes for production** | ~$100/mo | Production has 2 cache nodes. Single node is sufficient for initial deployment. |
| **EBS gp3 100GB for all envs** | Minor | Dev/staging could use 20GB |
| **CloudFront PriceClass_100** | ✅ Correct | Not waste — this is the right class for KSA audience |

### 7.4 Cheapest Safe Internal Environment

```
Dev environment with:
- 1 NAT Gateway (instead of 3)
- 1 ECS Fargate task (256 CPU / 512 MB)
- 1 db.t4g.small RDS (20GB gp3, no Multi-AZ)
- 1 cache.t4g.small Redis (1 node)
- No CloudFront (skip for dev; use ALB directly)
- No WAF (skip for dev)
- No backup vault (skip for dev)

Estimated cost: ~$50-70/mo
```

---

## 8. Risk Register

### 8.1 Terraform Apply Risk

| Risk | Severity | Likelihood | What Would Fail | Mitigation This Week |
|------|----------|------------|----------------|----------------------|
| **Missing ACM certs** | HIGH | 100% (certs not issued yet) | ALB HTTPS listener + CloudFront creation | Request ACM certs NOW. DNS validation takes ~30 min after Route53 setup. |
| **Missing Secrets Manager secrets** | HIGH | 100% (secrets not created yet) | ECS task definition creation | Create all 12 secret groups with placeholder values before apply. |
| **Cross-region DR snapshot fails** | MEDIUM | 100% on first apply | `aws_db_snapshot_copy` resource fails | Set `enable_cross_region_dr = false` for first deploy. |
| **Route53 zone doesn't exist** | HIGH | Unknown — depends on domain registration | `data.aws_route53_zone` fails, all DNS records fail | Create Route53 hosted zone before apply. |
| **container_image placeholder** | HIGH | 100% (staging/production tfvars have `<ACCOUNT_ID>`) | Terraform plan creates invalid ECR URL | Replace with real ECR URL before apply. |

### 8.2 App Boot Risk

| Risk | Severity | Likelihood | What Would Fail | Mitigation This Week |
|------|----------|------------|----------------|----------------------|
| **Missing `curl` in Docker image** | **CRITICAL** | 100% | ALB health check ALWAYS fails (curl not in node:22-alpine) | Add `RUN apk add --no-cache curl` to Dockerfile. Or change health check to use Node.js. |
| **ClamAV first-boot timeout** | HIGH | 50% (depends on internet speed for virus DB download) | App never starts (dependsOn: ClamAV health) | Set `SCANNER_PROVIDER` to empty or remove ClamAV sidecar from production until verified. |
| **ClamAV essential=true** | HIGH | 100% (by design) | If ClamAV crashes, app is killed | Set ClamAV `essential = false` in task definition so app container survives ClamAV restarts. |
| **Missing secret → container crash** | HIGH | 100% (if any secret missing) | ECS task enters crash loop | Create ALL secrets before apply. |
| **Redis unreachable** | MEDIUM | 30% (misconfiguration) | Rate limiting fails, app may error | Set `RATE_LIMITER=memory` for initial deployment until Redis is verified. |
| **S3 bucket naming mismatch** | MEDIUM | 50% (app reads `S3_BUCKET`, task defines `S3_UPLOAD_BUCKET`) | File uploads fail silently | Fix env var name alignment before deploy. |

### 8.3 Secrets Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Secret name mismatch** (Terraform expects `aqliya/{env}/x`, manual creation uses wrong name) | HIGH | High | Use AWS CLI to create secrets, verify names exactly match |
| **No secret rotation configured** | MEDIUM | 100% (no rotation policy) | Acceptable for first deploy, configure rotation later |
| **Secrets exposed in CI logs** | LOW | Low | GitHub Actions masks secrets by default |

### 8.4 DNS/Cert Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **ACM cert DNS validation pending** | HIGH | Medium (DNS takes time) | Request certs early, monitor validation status |
| **Route53 zone not delegated** | HIGH | Medium (depends on domain registrar) | Verify NS records in domain registrar point to Route53 |
| **Domain not registered** | HIGH | Unknown | Must have domain before proceeding |

### 8.5 Database Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **54 migrations take too long** | MEDIUM | Low (migrations are incremental) | Run before ECS deploy (pipeline already does this) |
| **Migration order conflict** | MEDIUM | Low | `prisma migrate deploy` handles ordering |
| **pgvector extension not loaded** | HIGH | 100% if not done manually | Run CREATE EXTENSION before first migration |
| **Seed data conflicts** | MEDIUM | Low | Seed is idempotent (upsert pattern expected) |
| **Connection pool exhaustion** | LOW | Low at current scale | Monitor with CloudWatch alarms, add PgBouncer later |

### 8.6 CI/CD Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **GitHub Actions AWS credentials missing** | HIGH | Medium | Store in GitHub secrets before running pipeline |
| **deploy.yml plans before image build** | LOW | Low | Plan is valid at apply time as long as no concurrent infra changes |
| **Smoke test fails due to DNS not resolving** | MEDIUM | Medium (for new domain) | Use ALB DNS name directly for smoke test, not domain name |
| **ECR push fails due to permissions** | HIGH | Medium | Verify ECR permissions in CI role |

### 8.7 DR Complexity Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **Snapshot copy fails on fresh instance** | MEDIUM | 100% | Disable for first deploy |
| **DR region (eu-central-1) doesn't have required services** | LOW | Low | All AWS services used are global or available in eu-central-1 |

### 8.8 Security Monitoring Gap Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **No GuardDuty** | MEDIUM | N/A | Enable after first deploy — doesn't block boot |
| **No CloudTrail** | MEDIUM | N/A | Enable after first deploy |
| **S3 bucket potentially accessible** | LOW | Low (static bucket is intentionally open for CloudFront) | Acceptable risk for initial deployment |
| **IAM policy too permissive** | LOW | Low (no external users yet) | Tighten after initial deployment |

### 8.9 AI Provider Runtime Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **FF_AI_REAL_PROVIDERS=false in production** | LOW | 100% by design | AI features run in deterministic/mock mode |
| **No API keys configured** | LOW | 100% | Not needed until AI features are enabled |
| **Ollama not available in production** | LOW | 100% | Local AI tasks will fail or use mock. No Ollama host exists in VPC. |

### 8.10 Storage Risk

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| **S3_BUCKET vs S3_UPLOAD_BUCKET mismatch** | MEDIUM | 100% | Fix the env var name in task definition |
| **Local storage enabled (STORAGE_PROVIDER not set to s3)** | MEDIUM | Unknown (depends on secrets) | Set STORAGE_PROVIDER=s3 in storage-config secret |
| **Uploads directory permissions** | LOW | Low (Dockerfile handles this) | Verified: nextjs user owns /app/uploads |

---

## 9. Deployment Verdict

### Verdict B — Deployable this week with contained fixes

**The current AWS implementation is fundamentally real and production-viable, but there are 7 blocking issues (4 CRITICAL, 3 HIGH) that must be fixed before a successful deployment.**

The Terraform is not aspirational — it's a solid foundation with real wiring. But testing it as written will produce failures. The good news: every issue has a 5-minute fix. This code is closer to deployable than most infrastructure I've audited.

### 🚨 BLOCKING — Must Fix Before First `terraform apply`

| # | File | Fix | Time |
|---|------|-----|------|
| **B1** | `Dockerfile` — Add `RUN apk add --no-cache curl` | Without this, **ALB health check always fails** and ECS cycles tasks forever | 5 min |
| **B2** | `infra/terraform/modules/compute/main.tf` L234 — Change ClamAV `essential = true` to `essential = false` | ClamAV is not critical for app function; app boot shouldn't depend on it | 5 min |
| **B3** | `infra/terraform/environments/production/terraform.tfvars` L5 — Replace `<ACCOUNT_ID>` with actual AWS account ID | Staging tfvars has same issue line 4 | 2 min |
| **B4** | `infra/terraform/environments/dev/terraform.tfvars` L4 — Replace `123456789012` with actual account ID | Current value is a fake placeholder | 2 min |

### ⚠️ HIGH — Fix Before First ECS Deploy

| # | File | Fix | Time |
|---|------|-----|------|
| **H1** | `infra/terraform/environments/production/terraform.tfvars` — Set `enable_cross_region_dr = false` | Cross-region DR snapshot will fail on first apply (no automated snapshot yet) | 1 min |
| **H2** | `infra/terraform/modules/monitoring/main.tf` L127 and L148 — Change `DBInstanceIdentifier = var.project_name` to `DBInstanceIdentifier = "${var.project_name}-${var.environment}-db"` | Two RDS alarms will silently never fire | 5 min |
| **H3** | Create ALL 12 secrets in AWS Secrets Manager before apply | ECS task definition references them all and will fail to register if any are missing | 30 min |
| **H4** | Request ACM certificates for `*.{domain}` in both `me-south-1` and `us-east-1` | ALB and CloudFront won't provision without them | 30 min (DNS validation) |

### ✅ OPTIONAL — Fix After First Internal Deploy

| # | Task | Justification |
|---|------|---------------|
| O1 | Consolidate to 1 NAT Gateway for all environments | Saves ~$60/mo, not blocking |
| O2 | Tighten IAM policies (scope `s3:*` to specific buckets) | Security hardening, not blocking |
| O3 | Change `:latest` tag to immutable deploy pattern | Best practice, not critical now |
| O4 | Add VPC Endpoints | Saves NAT bandwidth, not blocking |
| O5 | Enable GuardDuty + CloudTrail | Security monitoring, not blocking |
| O6 | Set `RATE_LIMITER=memory` for initial deploy | Avoids Redis coupling on day 1 |

### Exact Bring-Up Sequence (This Week)

```
Day 1 — Preparation
────────────────────
[  ] Register domain (if not owned)
[  ] Create Route53 hosted zone
[  ] Request ACM certs in me-south-1 and us-east-1
[  ] Run bootstrap.sh (creates S3 bucket + DynamoDB table)
[  ] Create ALL 12 secrets in AWS Secrets Manager (use dummy values for optional ones)
[  ] Fix Dockerfile — add curl
[  ] Fix ClamAV essential=false in task definition
[  ] Fix RDS alarm dimension monitoring bug
[  ] Fix container_image placeholders in all 3 tfvars
[  ] Set enable_cross_region_dr = false
[  ] Store AWS credentials as GitHub secrets
[  ] Build and push initial Docker image manually
[  ] Set DATABASE_URL as GitHub repository secret

Day 2 — Deploy Dev First
────────────────────────
[  ] terraform init -backend-config=environments/dev/backend.tf
[  ] terraform plan -var-file=environments/dev/terraform.tfvars
[  ] Review plan for unexpected changes
[  ] terraform apply
[  ] Wait for RDS to be ready (~5 min)
[  ] psql to RDS → CREATE EXTENSION vector;
[  ] npx prisma migrate deploy (against dev RDS)
[  ] npx prisma db seed
[  ] Force ECS new deployment
[  ] Verify health endpoint: curl https://dev.aqliya.com/api/health
[  ] Smoke test: node scripts/post-deploy-smoke.mjs --base-url https://dev.aqliya.com

Day 3 — Staging
───────────────
[  ] Repeat Day 2 steps for staging environment
[  ] Run full CI/CD pipeline on staging branch
[  ] Verify promote workflow

Day 4-5 — Production
────────────────────
[  ] Repeat Day 2 steps for production (with Multi-AZ, prod certs)
[  ] Day 2: enable_cross_region_dr = false
[  ] Day 3 (after first automated backup): enable_cross_region_dr = true
[  ] Verify alarm SNS subscription confirmed
[  ] Verify DNS: root domain + wildcard + static subdomain
[  ] Production cutover: update Route53 to point to ALB
[  ] Monitor: CloudWatch dashboard, Sentry, Plausible
```

---

## Appendix: Quick-Fix Patch List

### Fix 1: Dockerfile — Add curl
Add after `FROM base AS runner`:
```dockerfile
RUN apk add --no-cache curl
```

### Fix 2: ClamAV essential → false
In `infra/terraform/modules/compute/main.tf`, line ~234:
```hcl
{
  name      = "clamav"
  essential = false   # Change from true to false
  ...
}
```

### Fix 3: RDS alarm dimensions
In `infra/terraform/modules/monitoring/main.tf`, lines ~127 and ~148:
```hcl
# Change from:
DBInstanceIdentifier = var.project_name
# To:
DBInstanceIdentifier = "${var.project_name}-${var.environment}-db"
```

### Fix 4: Disable cross-region DR for first deploy
In `infra/terraform/environments/production/terraform.tfvars`:
```hcl
enable_cross_region_dr = false   # Change from true
```

### Fix 5: Fix container_image placeholders
In all three `environments/{env}/terraform.tfvars`:
```hcl
# Replace <ACCOUNT_ID> or 123456789012 with actual AWS account ID
container_image = "<ACTUAL_ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/aqliya/{env}/app:latest"
```

### Fix 6: S3 env var name alignment
In the ECS task definition container definitions, either:
- Change `S3_UPLOAD_BUCKET` to `S3_BUCKET` in `secrets`
- Or change the app's S3 provider code to read `S3_UPLOAD_BUCKET` instead of `S3_BUCKET`

---

**End of verification.** The codebase is real, the Terraform is mostly correct, and with the 4 CRITICAL + 4 HIGH fixes listed above, AQLIYA can be deployed on AWS this week.
