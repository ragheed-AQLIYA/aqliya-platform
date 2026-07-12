# AQLIYA AWS Bring-Up Runbook

**Status:** Active | **Version:** 1.0 | **Date:** 2026-07-04  
**Owner:** Infrastructure Lead  
**Preceding artifacts:** `AQLIYA_AWS_FOUNDATION_BLUEPRINT.md`, `AQLIYA_AWS_DEPLOYMENT_READINESS_VERIFICATION.md`

---

## 1. Bring-Up Strategy

### Environment Order

```
dev → staging → production
```

### Why This Order

| Step | Purpose | Must Prove Before Advancing |
|------|---------|------------------------------|
| **dev** | Proves Terraform, secrets, DNS, container runtime, health checks, migrations, S3, Redis all work end-to-end in a throwaway environment | ALB target healthy, `/api/health` all green, migrations run, S3 upload works, Redis connects |
| **staging** | Proves multi-AZ networking, read replica, autoscaling, CloudFront CDN, backup plan, alarms with a production-like load | Same as dev + CloudFront resolves, alarms fire, read replica lags within bounds, backup vault has recovery points |
| **production** | Proves Multi-AZ RDS, deletion protection, 30-day backups, SNS email alerts, production domain | Same as staging + DNS propagates, email alerts deliver, deletion protection enabled |

### Cardinal Rule

Do not deploy staging until dev is fully green.  
Do not deploy production until staging has been green for 24 hours.

---

## 2. Pre-Flight Prerequisites

### 2.1 AWS Account Info

| Item | How to Get | Blocks |
|------|-----------|--------|
| AWS Account ID | `aws sts get-caller-identity --query Account --output text` | dev, staging, production |
| Region | `me-south-1` (Riyadh) — hardcoded in Terraform | dev, staging, production |
| IAM user/role with sufficient permissions | Admin or PowerUser + `iam:PassRole` on ECS roles | dev, staging, production |

Required IAM permissions (minimum):
```
s3:*       (bootstrap + state)
dynamodb:* (bootstrap + locks)
ec2:*      (VPC, subnets, security groups)
rds:*      (database)
ecs:*      (compute)
ecr:*      (container registry)
elasticache:* (Redis)
secretsmanager:* (secrets)
acm:*      (certificates)
route53:*  (DNS)
cloudwatch:* (monitoring)
sns:*      (alarms)
backup:*   (backup plan)
kms:*      (backup encryption)
wafv2:*    (WAF)
cloudfront:* (CDN)
iam:*      (roles)
```

### 2.2 Route53 Hosted Zone

| Env | Domain | Zone Name | Blocks |
|-----|--------|-----------|--------|
| dev | `dev.aqliya.com` | Must exist in Route53 | dev |
| staging | `staging.aqliya.com` | Must exist in Route53 | staging |
| production | `aqliya.com` | Must exist in Route53 | production |

**Action:** Create hosted zones in Route53 console or via CLI before Terraform apply. The Terraform looks up the zone by domain name (data source), it does not create it.

```bash
# Create dev zone
aws route53 create-hosted-zone --name dev.aqliya.com --caller-reference "aqliya-dev-$(date +%s)"

# Create staging zone
aws route53 create-hosted-zone --name staging.aqliya.com --caller-reference "aqliya-staging-$(date +%s)"

# Create production zone (if not existing)
aws route53 create-hosted-zone --name aqliya.com --caller-reference "aqliya-prod-$(date +%s)"
```

After creating, delegate nameservers from your domain registrar to the Route53 NS records.

### 2.3 ACM Certificates

Two certificates are needed per environment:

| Purpose | Region | Domain | Blocks |
|---------|--------|--------|--------|
| ALB HTTPS | `me-south-1` | `*.aqliya.com` (or `*.dev.aqliya.com` etc.) | dev, staging, production |
| CloudFront HTTPS | `us-east-1` | `*.aqliya.com` (or `*.dev.aqliya.com` etc.) | dev, staging, production |

**Action:** Request certificates in ACM console or via CLI. Use DNS validation. Terraform data source looks up `statuses = ["ISSUED"]` — the certificate must be fully issued before apply.

```bash
# Request ALB cert in me-south-1
aws acm request-certificate \
  --domain-name "*.dev.aqliya.com" \
  --validation-method DNS \
  --region me-south-1

# Request CloudFront cert in us-east-1
aws acm request-certificate \
  --domain-name "*.dev.aqliya.com" \
  --validation-method DNS \
  --region us-east-1
```

After creation, create the DNS validation records in Route53 (shown in ACM console or returned by `describe-certificate`). Wait for status to become `ISSUED` before proceeding.

### 2.4 Terraform State Bucket

| Bucket | Region | Created By |
|--------|--------|-----------|
| `aqliya-terraform-state` | `me-south-1` | `infra/terraform/bootstrap.sh` |

Does NOT block plan with local state, but blocks apply with remote state. Run bootstrap.sh before first `terraform init`.

```bash
cd infra/terraform
chmod +x bootstrap.sh
./bootstrap.sh
# or with explicit region:
./bootstrap.sh me-south-1
```

Output:
```
Bucket 'aqliya-terraform-state' created and configured
DynamoDB table 'aqliya-terraform-locks' created
```

### 2.5 DynamoDB Lock Table

Created by the same `bootstrap.sh` (section 2.4). Table name: `aqliya-terraform-locks`, billing: PAY_PER_REQUEST.

### 2.6 Required GitHub Secrets

These secrets must exist in the GitHub repository for CI/CD workflows (`.github/workflows/deploy.yml`):

| Secret Name | Source | Blocks |
|-------------|--------|--------|
| `AWS_ACCOUNT_ID` | AWS account ID from `aws sts get-caller-identity` | deploy workflow |
| `AWS_OIDC_ROLE_ARN` | IAM role ARN for GitHub OIDC | deploy workflow |
| `AWS_REGION` | `me-south-1` | deploy workflow |
| `GH_PAT` | GitHub personal access token with repo scope | promote workflow |

GitHub Actions workflows use OIDC to assume an IAM role. The role must have a trust policy for `sts.amazonaws.com` with `token.actions.githubusercontent.com` as the issuer.

**If GitHub Actions is not configured yet**, all Terraform applies can be done manually from a local machine with AWS credentials.

### 2.7 Secrets Manager Secrets (13 Total)

All 13 secrets must exist in AWS Secrets Manager in `me-south-1` before `terraform apply`. ECS task definition registration resolves every referenced secret at task start time. Missing any one = task fails to start.

**Quick setup (recommended):**

```bash
cd infra/terraform
chmod +x scripts/create-secrets.sh
./scripts/create-secrets.sh dev
./scripts/create-secrets.sh staging
./scripts/create-secrets.sh production
```

**Manual per-secret table:**

| # | Secret Name | Format | Created by script? | Dev placeholder OK? | Prod requires real? | Feature broken if wrong |
|---|-------------|--------|-------------------|---------------------|---------------------|------------------------|
| 1 | `aqliya/{env}/db-password` | Plain string (24+ chars) | Yes | Yes (auto-generated) | Yes (auto-generated) | Database — app cannot connect |
| 2 | `aqliya/{env}/database-url` | `postgresql://aqliya_admin:{pass}@localhost:5432/aqliya` | Yes (uses generated password) | No — must have real RDS endpoint after deploy | Yes | Everything — app cannot boot |
| 3 | `aqliya/{env}/redis-url` | `redis://{endpoint}:6379` | Yes (uses localhost placeholder) | No — must have real Redis endpoint after deploy | Yes | Rate limiting, queue, caching |
| 4 | `aqliya/{env}/auth-secret` | Plain string (64 chars, random) | Yes | Yes (auto-generated) | Yes (auto-generated) | Auth sessions invalidated on change |
| 5 | `aqliya/{env}/storage-provider` | `"s3"` or `"local"` | Yes | Yes (`"s3"`) | Yes | File uploads fall back to local |
| 6 | `aqliya/{env}/s3-bucket` | `"aqliya-{env}-uploads"` | Yes | Yes (auto-named) | Must match Terraform bucket name | S3 uploads fail |
| 7 | `aqliya/{env}/scim-api-key` | Random string | Yes | Yes (auto-generated, unused) | Only if SCIM is active | SCIM provisioning only |
| 8 | `aqliya/{env}/sso-config` | `{"SSO_DEFAULT_ORG_ID":"default"}` | Yes | Yes (dummy) | Only if SSO is active | SSO login |
| 9 | `aqliya/{env}/google-oauth` | `{"AUTH_GOOGLE_ID":"","AUTH_GOOGLE_SECRET":""}` | Yes | Yes (empty) | Only if Google auth is active | Google login |
| 10 | `aqliya/{env}/github-oauth` | `{"AUTH_GITHUB_ID":"","AUTH_GITHUB_SECRET":""}` | Yes | Yes (empty) | Only if GitHub auth is active | GitHub login |
| 11 | `aqliya/{env}/azure-ad-oauth` | `{"AUTH_AZURE_AD_ID":"","AUTH_AZURE_AD_TENANT_ID":"","AUTH_AZURE_AD_SECRET":""}` | Yes | Yes (empty) | Only if Azure AD is active | Azure AD login |
| 12 | `aqliya/{env}/okta-oauth` | `{"AUTH_OKTA_ID":"","AUTH_OKTA_SECRET":"","AUTH_OKTA_ISSUER":""}` | Yes | Yes (empty) | Only if Okta is active | Okta login |
| 13 | `aqliya/{env}/oidc-config` | `{"AUTH_OIDC_ISSUER":"","AUTH_OIDC_CLIENT_ID":"","AUTH_OIDC_CLIENT_SECRET":""}` | Yes | Yes (empty) | Only if OIDC is active | OIDC login |

> ⚠️ **Known limitation:** Secrets #8–13 store JSON blobs. ECS passes the **entire JSON blob** as each environment variable's value. For example, `AUTH_GOOGLE_ID` gets the string `{"AUTH_GOOGLE_ID":"","AUTH_GOOGLE_SECRET":""}` instead of just the ID value. SSO/OAuth providers **will not work** until these secrets are refactored into individual secrets (one per env var). This does not block the first deploy — unconfigured providers are safely ignored by the app.

### 2.8 tfvars Values That Must Be Edited Manually

**Every environment** has a `container_image` value that must be updated with the real AWS account ID:

```bash
# Get your AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo $AWS_ACCOUNT_ID
```

Edit these three files:

**`infra/terraform/environments/dev/terraform.tfvars`** (line 5):
```hcl
container_image = "<ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest"
# → becomes:
container_image = "123456789012.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest"
```

**`infra/terraform/environments/staging/terraform.tfvars`** (line 5):
```hcl
container_image = "<ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/aqliya/staging/app:latest"
```

**`infra/terraform/environments/production/terraform.tfvars`** (line 6):
```hcl
container_image = "<ACCOUNT_ID>.dkr.ecr.me-south-1.amazonaws.com/aqliya/production/app:latest"
```

A Terraform `check` block in `main.tf` will warn at plan time if any placeholder remains.

### 2.9 Container Image Naming/Tagging Assumptions

The Terraform `container_image` variable expects the full ECR URI with tag:

```
{account_id}.dkr.ecr.me-south-1.amazonaws.com/aqliya/{env}/app:latest
```

The ECR repository is created by Terraform:
```
aqliya/{env}/app
```

Before the first deploy, the container image must be built and pushed:

```bash
# 1. Authenticate Docker to ECR
aws ecr get-login-password --region me-south-1 | \
  docker login --username AWS --password-stdin \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com

# 2. Build the image
docker build -t aqliya/dev/app:latest .

# 3. Tag for ECR
docker tag aqliya/dev/app:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest

# 4. Push to ECR
docker push \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest
```

**Important:** Terraform ECR lifecycle policy keeps only the last 30 images. Tag with unique versions for production rollback:

```bash
docker tag aqliya/prod/app:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/production/app:v1.0.0-$(date +%Y%m%d)
docker push \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/production/app:v1.0.0-$(date +%Y%m%d)
```

### 2.10 Domain and DNS Assumptions

| Env | Terraform domain_name | Terraform looks up Route53 zone by | Resulting URLs |
|-----|----------------------|-------------------------------------|----------------|
| dev | `dev.aqliya.com` | `dev.aqliya.com` | `https://dev.aqliya.com`, `https://static.dev.aqliya.com` |
| staging | `staging.aqliya.com` | `staging.aqliya.com` | `https://staging.aqliya.com`, `https://static.staging.aqliya.com` |
| production | `aqliya.com` | `aqliya.com` | `https://aqliya.com`, `https://static.aqliya.com` |

The Terraform creates ALB + Route53 A-record aliases automatically IF the hosted zone exists. It does NOT create the hosted zone itself.

---

## 3. Secrets Provisioning Matrix

### Dev

| Secret | Auto-Created? | Value Strategy | Update After Deploy? |
|--------|--------------|----------------|---------------------|
| `aqliya/dev/db-password` | `create-secrets.sh dev` | Auto-generated | Not needed |
| `aqliya/dev/database-url` | `create-secrets.sh dev` | Placeholder (localhost) | **Yes** — replace `localhost` with `terraform output rds_endpoint` |
| `aqliya/dev/redis-url` | `create-secrets.sh dev` | Placeholder (localhost) | **Yes** — replace `localhost` with `terraform output redis_endpoint` |
| `aqliya/dev/auth-secret` | `create-secrets.sh dev` | Auto-generated | Not needed |
| `aqliya/dev/storage-provider` | `create-secrets.sh dev` | `"s3"` | Not needed |
| `aqliya/dev/s3-bucket` | `create-secrets.sh dev` | `"aqliya-dev-uploads"` | Verify matches Terraform bucket name |
| `aqliya/dev/scim-api-key` | `create-secrets.sh dev` | Auto-generated | Not needed (unused) |
| `aqliya/dev/sso-config` | `create-secrets.sh dev` | Dummy JSON | Not needed (unused) |
| `aqliya/dev/google-oauth` | `create-secrets.sh dev` | Dummy JSON | Not needed (unused) |
| `aqliya/dev/github-oauth` | `create-secrets.sh dev` | Dummy JSON | Not needed (unused) |
| `aqliya/dev/azure-ad-oauth` | `create-secrets.sh dev` | Dummy JSON | Not needed (unused) |
| `aqliya/dev/okta-oauth` | `create-secrets.sh dev` | Dummy JSON | Not needed (unused) |
| `aqliya/dev/oidc-config` | `create-secrets.sh dev` | Dummy JSON | Not needed (unused) |

### Staging

Same as dev pattern, but update `database-url` and `redis-url` after apply with real endpoints.

### Production

| Secret | Auto-Created? | Value Strategy | Update After Deploy? |
|--------|--------------|----------------|---------------------|
| `aqliya/production/db-password` | `create-secrets.sh production` | Auto-generated | Not needed |
| `aqliya/production/database-url` | `create-secrets.sh production` | Placeholder | **Yes** — replace with real RDS endpoint |
| `aqliya/production/redis-url` | `create-secrets.sh production` | Placeholder | **Yes** — replace with real Redis endpoint |
| `aqliya/production/auth-secret` | `create-secrets.sh production` | Auto-generated | Not needed |
| `aqliya/production/storage-provider` | `create-secrets.sh production` | `"s3"` | Not needed |
| `aqliya/production/s3-bucket` | `create-secrets.sh production` | `"aqliya-production-uploads"` | Verify matches |
| `aqliya/production/scim-api-key` | `create-secrets.sh production` | Auto-generated | Only if SCIM is active |
| `aqliya/production/sso-config` | `create-secrets.sh production` | Dummy JSON | **Yes** — set real org ID if SSO is active |
| `aqliya/production/google-oauth` | `create-secrets.sh production` | Dummy JSON | **Yes** — set real credentials if Google auth is active |
| `aqliya/production/github-oauth` | `create-secrets.sh production` | Dummy JSON | **Yes** — set real credentials if GitHub auth is active |
| `aqliya/production/azure-ad-oauth` | `create-secrets.sh production` | Dummy JSON | **Yes** — set real credentials if Azure AD is active |
| `aqliya/production/okta-oauth` | `create-secrets.sh production` | Dummy JSON | **Yes** — set real credentials if Okta is active |
| `aqliya/production/oidc-config` | `create-secrets.sh production` | Dummy JSON | **Yes** — set real credentials if OIDC is active |

---

## 4. Exact Command Sequence per Environment

### 4.1 Dev — Full Bring-Up

All commands assume `cwd = infra/terraform/`.

#### Step 1: Bootstrap state backend
```bash
chmod +x bootstrap.sh
./bootstrap.sh me-south-1
# Expected: Bucket + DynamoDB table created
```

#### Step 2: Account ID
```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account: $AWS_ACCOUNT_ID"
# Set this in your shell for later use
```

#### Step 3: Edit dev tfvars
Edit `environments/dev/terraform.tfvars`:
- Replace `<ACCOUNT_ID>` in `container_image` with your actual `$AWS_ACCOUNT_ID`
- Verify `domain_name = "dev.aqliya.com"` (correct by default)

#### Step 4: Create secrets
```bash
chmod +x scripts/create-secrets.sh
./scripts/create-secrets.sh dev me-south-1
```

#### Step 5: Run preflight
```bash
chmod +x preflight.sh
./preflight.sh dev
# Expected: all checks pass (might warn about ACM + Route53 — see prereqs)
```

#### Step 6: Build and push container image
```bash
# Login to ECR (registry doesn't exist yet — Terraform creates it in apply step)
# For first build, push to a generic tag first, or build after terraform apply creates ECR

# Option A: Build after Terraform creates ECR (recommended for first time)
# Run terraform apply up to the point where ECR is created, then push

# Option B: Build locally and tag after apply
docker build -t aqliya/dev/app:latest ../../.
```

**Recommended approach for first time:** Terraform apply creates the ECR repository. After apply completes:
```bash
aws ecr get-login-password --region me-south-1 | \
  docker login --username AWS --password-stdin \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com

docker tag aqliya/dev/app:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest

docker push \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest
```

Then force a new ECS deployment:
```bash
aws ecs update-service \
  --cluster aqliya-dev-cluster \
  --service aqliya-dev-service \
  --force-new-deployment \
  --region me-south-1
```

#### Step 7: Terraform init
```bash
terraform init -backend-config=environments/dev/backend.tf -reconfigure
```

#### Step 8: Terraform plan
```bash
terraform plan -var-file=environments/dev/terraform.tfvars -out=dev.tfplan
# Review the plan carefully — expect ~60-80 resources created
# If the check block warns about container_image placeholder, fix it and re-plan
```

#### Step 9: Terraform apply
```bash
terraform apply dev.tfplan
# This takes 15-25 minutes:
#   - VPC + networking: ~2 min
#   - RDS: ~8-12 min
#   - Redis: ~5-8 min
#   - ECS + ALB: ~3 min
#   - S3 + CloudFront: ~2 min
#   - Monitoring + alarms: ~1 min
```

#### Step 10: Capture outputs
```bash
terraform output > dev-outputs.txt
cat dev-outputs.txt
# Note: rds_endpoint, redis_endpoint, alb_dns_name
```

#### Step 11: Update secrets with real endpoints
```bash
# Get endpoints
RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)

# Read current database-url secret
DB_URL=$(aws secretsmanager get-secret-value \
  --secret-id aqliya/dev/database-url \
  --region me-south-1 \
  --query SecretString --output text)

# Replace localhost with real endpoint
REAL_DB_URL=$(echo $DB_URL | sed "s|@localhost|@${RDS_ENDPOINT}|g")
aws secretsmanager put-secret-value \
  --secret-id aqliya/dev/database-url \
  --secret-string "$REAL_DB_URL" \
  --region me-south-1

# Update Redis URL
aws secretsmanager put-secret-value \
  --secret-id aqliya/dev/redis-url \
  --secret-string "redis://${REDIS_ENDPOINT}:6379" \
  --region me-south-1
```

#### Step 12: Push container image and deploy
```bash
# Build + push
docker build -t aqliya/dev/app:latest ../../
docker tag aqliya/dev/app:latest \
  ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.me-south-1.amazonaws.com/aqliya/dev/app:latest

# Force ECS deployment
aws ecs update-service \
  --cluster aqliya-dev-cluster \
  --service aqliya-dev-service \
  --force-new-deployment \
  --region me-south-1
```

#### Step 13: Wait for deployment
```bash
aws ecs wait services-stable \
  --cluster aqliya-dev-cluster \
  --services aqliya-dev-service \
  --region me-south-1
# This waits until the service is stable (tasks pass health checks)
```

#### Step 14: Install pgvector extension
```bash
# Connect to RDS via an EC2 bastion or AWS Systems Manager
# Use the RDS endpoint from terraform output
psql "postgresql://aqliya_admin:${DB_PASS}@${RDS_ENDPOINT}:5432/aqliya" \
  -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

#### Step 15: Run database migrations
```bash
# Prisma migrations run against the RDS instance via the DATABASE_URL secret
# The migrations run automatically through the app's startup script
# OR run manually:
# npm run db:migrate:deploy

# Verify migration status
# npx prisma migrate status
```

#### Step 16: Verify health endpoint
```bash
ALB_DNS=$(terraform output -raw alb_dns_name)
curl -f https://${ALB_DNS}/api/health
# Expected: 200 OK with JSON body showing all checks green
# If certificate is not yet issued, use HTTP:
curl -f http://${ALB_DNS}/api/health
```

---

### 4.2 Staging — Full Bring-Up

Repeat the dev sequence with `staging` instead of `dev`. Differences:

```bash
# 1. Edit staging tfvars (account ID)
# 2. Create secrets
./scripts/create-secrets.sh staging me-south-1

# 3. Preflight
./preflight.sh staging

# 4. Init with staging backend
terraform init -backend-config=environments/staging/backend.tf -reconfigure

# 5. Plan
terraform plan -var-file=environments/staging/terraform.tfvars -out=staging.tfplan

# 6. Apply
terraform apply staging.tfplan

# 7. Capture outputs
terraform output > staging-outputs.txt

# 8. Update secrets with real endpoints (same procedure as dev)
# 9. Build + push image to staging ECR
# 10. Force new deployment
# 11. Wait for service stable
# 12. Install pgvector
# 13. Run migrations
# 14. Verify health
```

**Staging-specific notes:**
- Domain is `staging.aqliya.com` — DNS and ACM cert must be set up for this subdomain
- RDS is single-AZ (cheaper for staging)
- ECS desired count is 2
- CloudFront is included
- SNS email alarm subscription is NOT created for staging (only production)

---

### 4.3 Production — Full Bring-Up

**IMPORTANT: Wait until staging has been green for 24 hours before starting production.**

Repeat the dev/staging sequence with `production`. Differences:

```bash
# 1. Edit production tfvars (account ID)
#    Verify: domain_name = "aqliya.com" (no subdomain)
#    Verify: db_multi_az = true, db_deletion_protection = true
#    Verify: enable_cross_region_dr = false (set to true 24h after deploy)
#    Verify: ecs_desired_count = 3, ecs_min_count = 3

# 2. Create secrets
./scripts/create-secrets.sh production me-south-1

# 3. Preflight
./preflight.sh production
# This will also check for production-specific ACM certs for aqliya.com

# 4. Init with production backend
terraform init -backend-config=environments/production/backend.tf -reconfigure

# 5. Plan
terraform plan -var-file=environments/production/terraform.tfvars -out=prod.tfplan

# 6. Apply
terraform apply prod.tfplan
```

**Production-specific notes:**
- **RDS deployment protection is enabled** — Terraform will fail to destroy this resource. This is intentional.
- **RDS Multi-AZ** — takes 15-20 min for failover setup
- **Read replica** — created in same apply, adds ~5 min
- **ALB deletion protection** — enabled, prevents accidental teardown
- **SNS email alert** — created for production only, sends to `ops@aqliya.com`
- **Backup plan** — daily, weekly, monthly backups with 30-day retention
- **ECS min count = 3** — ensures HA across AZs
- **Redis automatic failover** — enabled (requires 2 nodes, `cache.r6g.large`)
- **WAF** — rate limiting (5000 req/min/IP) + AWS managed rules

---

## 5. Manual Verification Checklist After Apply

### 5.1 Dev Verification

- [ ] **ALB target health:** AWS Console → EC2 → Target Groups → `aqliya-dev-tg` → Targets tab → all healthy
  ```bash
  aws elbv2 describe-target-health \
    --target-group-arn $(aws elbv2 describe-target-groups --names aqliya-dev-tg --region me-south-1 --query TargetGroups[0].TargetGroupArn --output text) \
    --region me-south-1
  ```
- [ ] **ECS task health:** AWS Console → ECS → `aqliya-dev-cluster` → `aqliya-dev-service` → Tasks → 1 task running, status HEALTHY
- [ ] **App health:** `curl -f http://$(terraform output -raw alb_dns_name)/api/health` → JSON response, all `ok: true`
- [ ] **Ready check:** `curl -f http://$(terraform output -raw alb_dns_name)/api/health/ready` → JSON response, no `failed` entries
- [ ] **Database connectivity:** App `/api/health` shows `database: ok`
- [ ] **Migrations:** App boots without migration errors. Check ECS logs for migration output.
- [ ] **Redis connectivity:** App does not return Redis connection errors. `/api/health` may include Redis check.
- [ ] **S3 uploads:** Test file upload through app → file appears in `aqliya-dev-uploads` S3 bucket
- [ ] **Auth:** Login page loads at `https://dev.aqliya.com/auth/signin` (only after DNS propagates)
- [ ] **CloudWatch logs:** App logs streaming to `/ecs/aqliya-dev` log group
- [ ] **CloudWatch dashboard:** Dashboard `aqliya-dev-dashboard` visible in CloudWatch console
- [ ] **No error logs:** Check recent ECS logs for ERROR/CRITICAL entries
  ```bash
  aws logs tail /ecs/aqliya-dev --region me-south-1 --since 5m | grep -i error
  ```

### 5.2 Staging Verification

Same as dev checklist, plus:

- [ ] **CloudFront CDN:** `https://static.staging.aqliya.com` resolves and serves content
- [ ] **Read replica:** RDS `aqliya-staging-db-replica` exists and lag is < 1 second
- [ ] **Autoscaling:** Trigger CPU load test → ECS tasks scale up (desired count increases)
- [ ] **Backup vault:** `aqliya-staging-backup-vault` has at least one recovery point
- [ ] **SNS topic:** `aqliya-staging-alarms` exists (no email subscription in staging)
- [ ] **WAF:** Web ACL `aqliya-staging-waf` is associated with CloudFront
- [ ] **Domain:** `https://staging.aqliya.com` loads with valid certificate
- [ ] **Static assets:** `/_next/static/...` loads through CloudFront with correct cache headers

### 5.3 Production Verification

Same as staging checklist, plus:

- [ ] **Multi-AZ RDS:** RDS console shows `aqliya-production-db` as Multi-AZ, failover ready
- [ ] **Deletion protection:** Enabled on RDS instance
- [ ] **Email alerts:** Confirm `ops@aqliya.com` received SNS subscription confirmation email
- [ ] **Backup plan:** Daily backup ran within the first 24h window
- [ ] **SNS alarm email:** Subscription confirmed (check email inbox)
- [ ] **ALB deletion protection:** Enabled
- [ ] **DNS propagation:** `https://aqliya.com` resolves and loads
- [ ] **SSL certificate:** Valid, no browser warnings
- [ ] **3 ECS tasks:** `desiredCount = 3`, all in HEALTHY status across different AZs
- [ ] **Redis HA:** Primary + replica nodes configured in ElastiCache
- [ ] **Cost anomaly baseline:** Record current estimated monthly cost from AWS Cost Explorer

---

## 6. Go / No-Go Gates

### 6.1 Dev → Staging Gate

**Pass criteria — ALL must be true:**

| Check | How | Pass/Fail |
|-------|-----|-----------|
| ALB target healthy | `aws elbv2 describe-target-health` shows all targets healthy | |
| App health endpoint | `/api/health` returns 200, all checks green | |
| Database reachable | App logs show no connection errors | |
| Migrations complete | Prisma migration table has all 54 migrations applied | |
| Redis reachable | App logs show no Redis connection errors | |
| S3 upload works | Upload a test file → confirm in S3 bucket | |
| Auth page loads | `/auth/signin` returns 200 | |
| No ERROR logs | No CRITICAL/ERROR entries in CloudWatch logs | |
| CloudWatch dashboard | Dashboard renders with metric data | |
| Preflight passes | `./preflight.sh dev` passes all checks | |

**Decision:** If all pass → proceed to staging. If any fail → fix in dev before touching staging.

### 6.2 Staging → Production Gate

**Pass criteria — ALL must be true:**

| Check | How | Pass/Fail |
|-------|-----|-----------|
| Dev stable for 24h | No production-impacting incidents in dev for 24+ hours | |
| Staging deployable | Full staging bring-up completed (section 4.2) | |
| Staging green for 24h | No production-impacting incidents in staging for 24+ hours | |
| Staging health | `/api/health` green on staging | |
| Staging migrations | All migrations applied on staging DB | |
| Staging CloudFront | Static assets served through CloudFront with valid cert | |
| Staging WAF active | WAF rules applied, no false positives | |
| Staging backup ran | At least one backup vault recovery point | |
| DNS validated for staging | `staging.aqliya.com` resolves and loads over HTTPS | |
| Production secrets created | All 13 production secrets exist in Secrets Manager | |
| Production ACM certs issued | `*.aqliya.com` cert issued in both `me-south-1` and `us-east-1` | |
| Production Route53 zone confirmed | `aqliya.com` hosted zone exists with delegated NS records | |
| Production container image built | Image tagged and pushed to production ECR | |
| Operations email ready | `ops@aqliya.com` inbox accessible and confirmed | |

**Decision:** If all pass → proceed to production. If any fail → fix in staging first.

---

## 7. Production Launch Profile

What should be enabled on Day 1 vs. Day 2+:

### Day 1 (First Deploy)

| Feature | Status | Rationale |
|---------|--------|-----------|
| Multi-AZ RDS | **ENABLED** | Core resilience for production data |
| RDS deletion protection | **ENABLED** | Prevent accidental data loss |
| ALB + HTTPS | **ENABLED** | Production traffic requires TLS |
| CloudFront CDN | **ENABLED** | Static asset delivery + WAF |
| WAF (rate limit + AWS managed) | **ENABLED** | Production needs baseline DDoS protection |
| ECS Fargate (3 tasks min) | **ENABLED** | HA across AZs |
| ECS autoscaling (CPU/memory) | **ENABLED** | Handle traffic spikes |
| CloudWatch dashboard | **ENABLED** | Operational visibility from day 1 |
| CloudWatch alarms (RDS, ALB, ECS) | **ENABLED** | Alert on anomalies |
| SNS email alerts | **ENABLED** | Ops team notification |
| AWS Backup (daily/weekly/monthly) | **ENABLED** | Data protection from day 1 |
| CloudWatch container insights | **ENABLED** | ECS metrics visibility |
| ECR image scanning | **ENABLED** | Vulnerability detection |
| S3 bucket versioning + encryption | **ENABLED** | Upload data protection |

### Day 1 (Disabled — Enable Post-Deploy)

| Feature | Status | Enable When | Action |
|---------|--------|-------------|--------|
| Cross-region DR | **DISABLED** | 24h after first deploy | Set `enable_cross_region_dr = true` in production tfvars, re-apply. First automated RDS snapshot must exist. |
| Amazon Bedrock integration | **DISABLED** | After AI feature validation | Request Bedrock model access in `me-south-1`. Configure via app config not Terraform. |
| SSO/OAuth providers | **DISABLED** | After individual secret refactoring | Secrets #8–13 need refactoring from JSON blobs to individual secrets. Requires Terraform + app changes. Until then, use email/password auth. |
| GuardDuty | **DISABLED** | Day 2 | Enable via AWS Console or Terraform addition. Not currently in Terraform. |
| CloudTrail | **DISABLED** | Day 2 | Enable via AWS Console or Terraform addition. Not currently in Terraform. |
| SecurityHub | **DISABLED** | Day 2-3 | Enable via AWS Console. Requires CloudTrail + GuardDuty to be active first. |
| VPC Endpoints (Gateway + Interface) | **DISABLED** | Day 3-5 | Add `aws_vpc_endpoint` resources to Terraform. Reduces NAT Gateway costs and improves security. |
| ClamAV antivirus | **ENABLED** | Day 1 (essential=false) | ClamAV runs as a sidecar. If it restarts, app continues. First boot downloads virus DB (~2-5 min). |

### Week 2 (After Stability Confirmed)

| Feature | Action |
|---------|--------|
| GuardDuty | Add to Terraform monitoring module, enable in all regions |
| CloudTrail | Add organization trail, enable in me-south-1 + us-east-1 |
| VPC Endpoints | Add `com.amazonaws.me-south-1.s3` (gateway) and `com.amazonaws.me-south-1.ecr.dkr` (interface) |
| DR snapshot copy | Set `enable_cross_region_dr = true`, verify copy completes |
| Bedrock | Enable model access, configure in app settings |
| SSO refactoring | Refactor JSON secrets → individual secrets per env var |
| Cost anomaly budget | Set AWS Budgets alert at 110% of baseline cost |

---

## 8. Rollback Procedure

### 8.1 terraform apply Partially Fails

**Symptom:** `terraform apply` exits with an error after creating some resources.

**Response:**

```bash
# 1. Check what was created
terraform state list

# 2. Fix the error (often a timeout or race condition)
# Common fixes:
#   - RDS takes too long → increase timeout or re-run apply
#   - ACM cert not issued → issue cert and re-run
#   - Route53 zone not found → create zone and re-run

# 3. Re-run apply (Terraform is idempotent)
terraform apply -var-file=environments/${ENV}/terraform.tfvars

# 4. If re-run fails, destroy and start over (NOT on production)
terraform destroy -var-file=environments/${ENV}/terraform.tfvars
```

**Production-specific:** Never run `terraform destroy` on production. Instead, fix the issue and re-apply. If the state is corrupted, restore from the DynamoDB backup.

### 8.2 ECS Deployment Fails

**Symptom:** ECS service shows tasks in `STOPPED` or `PROVISIONING` state, never reaching `RUNNING`.

**Response:**

```bash
# 1. Check task stop reason
aws ecs describe-tasks \
  --cluster aqliya-${ENV}-cluster \
  --tasks $(aws ecs list-tasks --cluster aqliya-${ENV}-cluster --region me-south-1 --query taskArns[0] --output text) \
  --region me-south-1 \
  --query "tasks[0].stoppedReason"

# 2. Check ECS logs
aws logs tail /ecs/aqliya-${ENV} --region me-south-1 --since 5m

# 3. Common causes and fixes:
#
#    a) Secret not found → verify all 13 secrets exist:
#       ./preflight.sh ${ENV}
#
#    b) Container image not found → verify image exists in ECR:
#       aws ecr describe-images --repository-name aqliya/${ENV}/app --region me-south-1
#
#    c) Health check fails → check ALB target health:
#       aws elbv2 describe-target-health --target-group-arn ...
#       Verify curl is installed in Dockerfile (fix already applied)
#
#    d) Resource limits → check ECS service quota for Fargate:
#       aws service-quotas get-service-quota --service-code ecs --quota-code L-7212CCBC

# 4. Roll back to previous task definition
# Get the last known good revision
PREVIOUS_REVISION=$(aws ecs describe-task-definition \
  --task-definition aqliya-${ENV}-app \
  --region me-south-1 \
  --query "taskDefinition.revision" \
  --output text)
PREVIOUS_REVISION=$((PREVIOUS_REVISION - 1))

aws ecs update-service \
  --cluster aqliya-${ENV}-cluster \
  --service aqliya-${ENV}-service \
  --task-definition aqliya-${ENV}-app:${PREVIOUS_REVISION} \
  --region me-south-1
```

### 8.3 App Boots But Health Check Fails

**Symptom:** ECS task is running but ALB target is unhealthy. `/api/health` returns 503 or non-200.

**Response:**

```bash
# 1. Get the task's public/private IP
TASK_ARN=$(aws ecs list-tasks --cluster aqliya-${ENV}-cluster --region me-south-1 --query taskArns[0] --output text)
ENI=$(aws ecs describe-tasks --cluster aqliya-${ENV}-cluster --tasks $TASK_ARN --region me-south-1 --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text)
PRIVATE_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI --region me-south-1 --query "NetworkInterfaces[0].PrivateIpAddress" --output text)

# 2. SSH to a bastion/jump box and test directly
# OR check logs for specific failure
aws logs tail /ecs/aqliya-${ENV} --region me-south-1 --since 10m

# 3. Common health check failures:
#
#    a) Database connection ▼:
#       → Verify database-url secret has correct RDS endpoint
#       → Verify RDS security group allows inbound from ECS security group
#       → Verify RDS is not in "creating" or "backing-up" state
#
#    b) Storage check failed ▼:
#       → Verify STORAGE_PROVIDER = "s3" (not JSON blob)
#       → Verify S3_BUCKET name matches actual bucket
#       → Verify S3_ENDPOINT is set (should be auto-configured now)
#
#    c) Redis connection ▼:
#       → Verify redis-url secret has correct endpoint
#       → Verify Redis security group allows inbound from ECS
#
#    d) pgvector not available ▼:
#       → Connect to RDS and run: CREATE EXTENSION IF NOT EXISTS vector;
```

### 8.4 Migrations Fail

**Symptom:** App boots but database schema is incomplete. ECS logs show migration errors.

**Response:**

```bash
# 1. Check which migrations have been applied
npx prisma migrate status

# 2. If a specific migration failed, resolve the conflict:
#    - Check if the migration SQL is valid for PostgreSQL 16
#    - Check for missing extensions (pgvector)
#    - Check for duplicate migrations

# 3. Apply remaining migrations manually
npx prisma migrate deploy

# 4. If migration state is corrupted, resolve in prisma_migrations table:
#    - Mark failed migration as rolled back
#    - Fix the SQL and re-run

# 5. Worst case: Roll back database to last known good snapshot
#    (AWS Console → RDS → snapshots → restore to point-in-time)
```

**Prevention:** Test migrations against dev RDS before applying to staging/production. The migration sequence is the same across all environments.

### 8.5 S3 Uploads Fail

**Symptom:** File uploads return errors or silently fall back to local storage.

**Response:**

```bash
# 1. Verify S3_BUCKET env var value (check ECS task definition)
aws ecs describe-task-definition \
  --task-definition aqliya-${ENV}-app \
  --region me-south-1 \
  --query "taskDefinition.containerDefinitions[0].secrets[?name=='S3_BUCKET']"

# 2. Verify the bucket exists
aws s3api head-bucket --bucket aqliya-${ENV}-uploads --region me-south-1

# 3. Verify ECS task role has S3 permissions
#    The IAM policy allows s3:PutObject, GetObject, DeleteObject, ListBucket on all buckets
#    Check: aws iam get-role-policy --role-name aqliya-${ENV}-ecs-task

# 4. If using S3_ENDPOINT for health check, verify it resolves
nslookup s3.me-south-1.amazonaws.com

# 5. If uploads still fail, check app logs for S3 errors
aws logs tail /ecs/aqliya-${ENV} --region me-south-1 --since 30m | grep -i s3
```

### 8.6 Auth Breaks

**Symptom:** Login page errors, sessions not persisting, SSO returns errors.

**Response:**

```bash
# 1. Verify AUTH_SECRET is consistent (same across all tasks)
#    Rotating AUTH_SECRET invalidates all active sessions

# 2. Check auth-secret secret value
aws secretsmanager get-secret-value \
  --secret-id aqliya/${ENV}/auth-secret \
  --region me-south-1 \
  --query SecretString --output text

# 3. Check NextAuth configuration via app logs
aws logs tail /ecs/aqliya-${ENV} --region me-south-1 --since 30m | grep -i nextauth

# 4. For SSO failures:
#    - Known issue: SSO secrets are JSON blobs, ECS passes entire blob as each env var
#    - SSO will NOT work until refactored to individual secrets
#    - Use email/password auth as fallback

# 5. Rollback auth config:
#    - If a new auth-secret was deployed, restore the previous value
#    - Update the secret in Secrets Manager and restart ECS tasks
```

---

## 9. First-Week Operations Checklist

Check these daily for the first 7 days after each environment bring-up.

### Daily Checks

| Check | Command/Tool | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 | Day 6 | Day 7 |
|-------|-------------|-------|-------|-------|-------|-------|-------|-------|
| ECS tasks running | `aws ecs describe-services --cluster aqliya-{env}-cluster --services aqliya-{env}-service --query "services[0].runningCount"` | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ECS deployment status | `aws ecs describe-services --cluster aqliya-{env}-cluster --services aqliya-{env}-service --query "services[0].deployments[0].rolloutState"` | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ALB 5XX errors | CloudWatch alarm or `aws cloudwatch get-metric-statistics --namespace AWS/ApplicationELB --metric-name HTTPCode_Target_5XX` | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| ALB latency (p95) | CloudWatch alarm or dashboard widget | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| RDS CPU | CloudWatch alarm or dashboard widget | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| RDS connections | CloudWatch dashboard | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| RDS free storage | CloudWatch alarm (alerts below 10GB) | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Redis CPU + connections | CloudWatch dashboard | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| App ERROR logs | `aws logs tail /ecs/aqliya-{env} --since 24h \| grep -i error \| wc -l` | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| S3 upload failures | Check bucket metrics for PutObject errors | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Backup vault recovery points | `aws backup list-recovery-points-by-backup-vault --backup-vault-name aqliya-{env}-backup-vault --region me-south-1` | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| Cost (estimated) | `aws ce get-cost-and-usage --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) --granularity MONTHLY --metrics "BlendedCost"` | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |
| CloudWatch dashboard | Check `aqliya-{env}-dashboard` for any red metrics | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ | ☐ |

### Weekly Checks (Day 7)

- [ ] **Review all CloudWatch alarms** — check which fired, verify notification delivery
- [ ] **Review ECS logs for patterns** — any recurring errors or warnings
- [ ] **Check RDS performance insights** — slow queries, connection pool
- [ ] **Verify backup integrity** — attempt a restore from snapshot to dev environment
- [ ] **Review IAM roles** — verify least-privilege for ECS task and execution roles
- [ ] **Check ECR vulnerabilities** — scan results for pushed images
- [ ] **Review WAF logs** — check for blocked legitimate traffic (false positives)
- [ ] **Update cost baseline** — set AWS Budgets alert at 110% of actual

### What to Watch For

| Symptom | Likely Cause | Action |
|---------|-------------|--------|
| Gradual RDS CPU increase | Missing index, slow query under load | Check Performance Insights, add index |
| ECS tasks restarting cyclically | Container OOM or health check flapping | Increase ECS task memory, check health check timing |
| ALB 5XX errors increasing | Application errors under load | Check ECS logs for stack traces, scale out |
| S3 upload latency | Missing VPC Endpoint (traffic goes through NAT) | Add S3 Gateway Endpoint to VPC |
| Auth sessions dropping | AUTH_SECRET rotated | Restore previous auth-secret value |
| Backup recovery points missing | Backup IAM role misconfigured | Check backup role permissions |
| Redis CPU high | Cache-miss storm or oversized data | Monitor cache hit ratio, consider larger node type |

---

## 10. Founder Decisions Still Required

These decisions cannot be resolved by execution — they require a founder or architecture authority.

| # | Decision | Context | Impact if Unresolved | Deadline |
|---|----------|---------|---------------------|----------|
| D1 | **DR region compliance** | DR region is set to `eu-central-1` (Frankfurt). For KSA data residency, the DR region should be within Saudi borders (no second me-south AZ available). Options: (a) keep `eu-central-1` for now with risk acknowledgment, (b) use another me-south AZ, (c) use Bahrain (me-central-1). | Legal risk if data crosses borders without compliance review. Blocks enabling cross-region DR in production. | Before enabling `enable_cross_region_dr = true` in production (24h after deploy) |
| D2 | **S3 bucket naming convention** | Terraform creates `aqliya-{env}-uploads` and `aqliya-{env}-static`. The `s3-bucket` secret must match. If bucket naming needs to change (e.g., for compliance or multi-region), it must be decided before first deploy. | Renaming buckets after deploy requires data migration. | Before first `terraform apply` |
| D3 | **Production domain** | Currently `aqliya.com`. If the production domain is different (e.g., `app.aqliya.com`, `platform.aqliya.com`), all DNS, ACM certs, and Terraform `domain_name` values must change. | Wrong domain = broken DNS, cert errors, unusable app. | Before production deploy |
| D4 | **SSO/OAuth priority** | SSO secrets are broken (JSON blob → wrong env var values). Fixing requires refactoring 7 secrets into individual entries and updating Terraform + create-secrets.sh. | SSO/OAuth login will not work until refactored. Email/password still works. | Before any SSO provider needs to work |
| D5 | **Bedrock model access** | Amazon Bedrock requires model access requests in `me-south-1`. Which models are needed? (e.g., Claude 3, Titan, Llama). Model names affect app configuration. | AI features that depend on Bedrock will fail until models are enabled. | When AI features are activated for production |
| D6 | **Multi-region strategy** | Is AQLIYA a single-region (me-south-1) or multi-region platform? If multi-region, the DR region needs to be active (not just cold standby), and RDS cross-region replication differs from snapshot copy. | Single-region is simpler but riskier. Multi-region requires significant Terraform additions. | Before production scales beyond pilot |
| D7 | **Production ops email** | SNS alarm emails go to `ops@aqliya.com`. This mailbox must exist and be monitored. If a different email should receive alerts (e.g., `infra@company.com`), update `monitoring/main.tf` line 209. | No one receives alarm notifications. | Before production deploy |
| D8 | **Compliance scope** | Are SOC2, ISO 27001, or Saudi NCA compliance required? If yes, GuardDuty, CloudTrail, SecurityHub, and audit logging must be configured as part of the production baseline, not post-deploy. | Compliance gaps may require re-architecture if discovered late. | Before production scales |
| D9 | **GitHub Actions workflow activation** | CI/CD workflows exist at `.github/workflows/deploy.yml` but require OIDC role + secrets. If manual deploy is preferred for v0.1, decide whether to invest in GitHub Actions setup or skip it. | Without CI/CD, all deploys are manual. CI/CD setup takes ~2 hours. | Before first production deploy |
| D10 | **Rollback budget** | RDS point-in-time recovery, snapshot restore, and cross-region DR all have cost implications. What is the acceptable RPO (recovery point objective) and RTO (recovery time objective)? | Affects backup frequency, Multi-AZ vs. Single-AZ, cross-region strategy. | Before production deploy |

---

## Appendix A: Quick Reference — Terraform State Management

```bash
# List resources in state
terraform state list

# Show a specific resource
terraform state show aws_db_instance.primary

# Move a resource (after manual changes)
terraform state mv aws_lb.main aws_lb.alb

# Remove a resource from state (without destroying)
terraform state rm aws_lb.main

# Import existing resource
terraform import aws_s3_bucket.uploads aqliya-dev-uploads
```

## Appendix B: Quick Reference — Common Operations

```bash
# Force ECS new deployment (after image push)
aws ecs update-service \
  --cluster aqliya-${ENV}-cluster \
  --service aqliya-${ENV}-service \
  --force-new-deployment \
  --region me-south-1

# Scale ECS service to 0 (maintenance mode)
aws ecs update-service \
  --cluster aqliya-${ENV}-cluster \
  --service aqliya-${ENV}-service \
  --desired-count 0 \
  --region me-south-1

# View ECS task logs
aws logs tail /ecs/aqliya-${ENV} --region me-south-1 --since 10m

# View ClamAV sidecar logs
aws logs tail /ecs/aqliya-${ENV} --region me-south-1 --since 10m --log-stream-name-prefix clamav

# Update a secret
aws secretsmanager put-secret-value \
  --secret-id aqliya/${ENV}/database-url \
  --secret-string "postgresql://..." \
  --region me-south-1

# Trigger RDS manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier aqliya-${ENV}-db \
  --db-snapshot-identifier aqliya-${ENV}-db-manual-$(date +%Y%m%d) \
  --region me-south-1
```

## Appendix C: Cost Baseline — First Month Tracking

Record these numbers after each environment is deployed:

| Resource | Dev | Staging | Production | Total |
|----------|-----|---------|------------|-------|
| RDS (db.t4g.medium × 1/2/1) | $ | $ | $ | $ |
| RDS Multi-AZ premium | — | — | $ | $ |
| RDS read replica | — | $ | $ | $ |
| ECS Fargate (256/512/1024) | $ | $ | $ | $ |
| ALB | $ | $ | $ | $ |
| ElastiCache (t4g.small/r6g.large) | $ | $ | $ | $ |
| NAT Gateway (3×) | $ | $ | $ | $ |
| S3 (uploads + static) | $ | $ | $ | $ |
| CloudFront | $ | $ | $ | $ |
| WAF | — | $ | $ | $ |
| AWS Backup | $ | $ | $ | $ |
| CloudWatch logs + metrics | $ | $ | $ | $ |
| ACM (free) | — | — | — | — |
| Route53 (hosted zone) | $ | $ | $ | $ |
| **Estimated monthly total** | **~$50-70** | **~$150-200** | **~$1,070-1,100** | **~$1,300-1,400** |

**Waste alert:** 3 NAT Gateways (~$90/mo) can be eliminated with VPC Endpoints (~$20/mo for 2-3 endpoints). Add endpoint deployment to Week 2 plan.

---

*End of Runbook*
