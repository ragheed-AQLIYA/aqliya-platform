# Deployment Runbook

**Document Owner:** Infrastructure Agent
**Last Updated:** 2026-07-11
**Status:** Verified against code and CI/CD configuration
**Applies to:** AQLIYA Platform — CI/CD Pipeline & ECS Deployment

---

## 1. Overview

AQLIYA uses **GitHub Actions** for CI/CD with **AWS ECS Fargate** for container orchestration. Deploys are triggered automatically after CI passes on `main`, or manually for emergency deploys.

### Pipeline Summary

| Stage | Trigger | Action |
|-------|---------|--------|
| **CI** | Push to `main` or PR | Quality checks, tests, build |
| **Deploy** | CI success on `main` or manual | Build Docker, push to ECR, deploy to ECS |
| **Smoke test** | After deploy | Health check + page accessibility |

### Infrastructure

| Component | Value |
|-----------|-------|
| **AWS Region** | `eu-north-1` (Stockholm) |
| **ECR Repository** | `aqliya/prod/app` |
| **ECS Cluster** | `aqliya-prod-cluster` |
| **ECS Service** | `aqliya-prod-service` |
| **Task Definition** | `aqliya-prod-app` |
| **Image Tags** | `:latest` + `:<git-sha>` |

---

## 2. CI Pipeline (ci.yml)

### Triggers

- **Push to main:** Runs full quality pipeline
- **Pull request to main:** Runs full quality pipeline

### Jobs

#### Quality Check

| Step | Command | Purpose |
|------|---------|---------|
| Install deps | `npm ci --ignore-scripts` | Clean install |
| Documentation validation | `node scripts/validate-documentation.mjs` etc. | 7 doc validation scripts |
| Prisma generate | `npx prisma generate` | Generate client |
| Migrations | `npx prisma migrate deploy` | Apply schema changes |
| Type-check | `npx tsc --noEmit` | TypeScript validation |
| Tests | `npm test` | Unit + integration tests |
| Backup verify | `npm run backup:verify` | Data integrity check |
| Lint | `npm run lint` | ESLint |
| Build | `npm run build` | Next.js production build |
| License check | `npx license-checker --failOn "GPL;AGPL;LGPL-3.0"` | License compliance |
| Dependency audit | `npm audit --audit-level=high` | Security audit |
| Secret scanning | `gitleaks detect --config .gitleaks.toml` | Secrets detection |

### CI Environment

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    env:
      POSTGRES_USER: ci
      POSTGRES_PASSWORD: ci
      POSTGRES_DB: aqliya_ci
    ports:
      - 5432:5432

env:
  DATABASE_URL: postgresql://ci:ci@localhost:5432/aqliya_ci
  AUTH_SECRET: ci-auth-secret-minimum-32-characters
  NODE_ENV: test
```

---

## 3. Deploy Pipeline (deploy.yml)

### Triggers

```yaml
on:
  workflow_run:
    workflows: ["CI"]
    types: [completed]
    branches: [main]
  workflow_dispatch:  # Manual emergency deploy
```

### Deploy Gate

The deploy only runs if:
- **Manual dispatch** (`workflow_dispatch`) — always allowed
- **CI completed successfully** on `main` (`github.event.workflow_run.conclusion == 'success'`)

### Steps

#### 1. Checkout

```yaml
- uses: actions/checkout@v4
```

#### 2. Configure AWS Credentials

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_DEPLOY_ROLE_ARN }}
    aws-region: eu-north-1
```

Uses **OIDC** (OpenID Connect) for AWS authentication — no long-lived credentials.

#### 3. Login to ECR

```yaml
- uses: aws-actions/amazon-ecr-login@v1
```

#### 4. Build & Tag Image

```bash
docker build -t aqliya/prod/app:<git-sha> .
docker tag aqliya/prod/app:<git-sha> aqliya/prod/app:latest
```

#### 5. Push to ECR

```bash
docker push aqliya/prod/app:<git-sha>
docker push aqliya/prod/app:latest
```

Both SHA-tagged and `latest` images are pushed.

#### 6. Deploy to ECS

```bash
aws ecs update-service \
  --cluster aqliya-prod-cluster \
  --service aqliya-prod-service \
  --force-new-deployment
```

ECS performs a **rolling update** with:
- `minHealthyPercent: 100` — keeps all existing tasks running
- `maxPercent: 200` — can double task count during deploy
- Health check grace period: 300 seconds
- Task health: `HEALTHY` required for 60 seconds

#### 7. Wait for Service Stable

```bash
aws ecs wait services-stable \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service
```

Blocks until all tasks are healthy and stable.

#### 8. Smoke Test

```bash
sleep 10
curl -sf https://app.aqliya.com/api/health | jq '.status' | grep ok
curl -sf https://app.aqliya.com/ > /dev/null
curl -sf https://app.aqliya.com/login > /dev/null
```

---

## 4. Manual Deploy (Emergency)

### Via GitHub UI

1. Go to **Actions** → **AQLIYA Deploy**
2. Click **Run workflow**
3. Select `main` branch
4. Click **Run workflow**

### Via GitHub CLI

```bash
gh workflow run deploy.yml --ref main
```

### Monitoring

```bash
# Check workflow status
gh run list --workflow=deploy.yml --limit=5

# Watch running workflow
gh run watch <run-id>
```

---

## 5. ECS Task Definition

### Container Configuration (from Terraform)

| Setting | Value |
|---------|-------|
| **App port** | 3000 |
| **Health check** | `curl http://localhost:3000/api/health` |
| **CPU** | 1024 units (1 vCPU) |
| **Memory** | 512 MB (hard limit) |
| **Soft limit** | 384 MB |
| **CloudWatch logging** | Enabled (`awslogs` driver) |
| **Sidecar: ClamAV** | Port 3310, 128 CPU / 256 MB |
| **Sidecar: WAF log subscription** | FireLens for WAF log forwarding |

### Environment Variables (Production)

| Variable | Source |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Secrets Manager |
| `AUTH_SECRET` | Secrets Manager |
| `NEXTAUTH_SECRET` | Secrets Manager |
| `REDIS_URL` | ElastiCache endpoint |
| `SCANNER_PROVIDER` | `clamav` |
| `CLAMAV_HOST` | `127.0.0.1` |
| `CLAMAV_PORT` | `3310` |
| `RATE_LIMITER` | `redis` |
| `STORAGE_PROVIDER` | `local` or `s3` |

---

## 6. Rollback Procedures

### Automatic Rollback

ECS automatically rolls back if:
- New tasks fail health checks for 60+ seconds
- New tasks don't reach `HEALTHY` state within 300 seconds
- Rolling update fails to make progress

### Manual Rollback (ECS)

#### Option 1: Force previous task definition

```bash
# Get current task definition
aws ecs describe-services \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service \
  --query 'services[0].taskDefinition'

# List previous task definitions
aws ecs list-task-definitions \
  --family-prefix aqliya-prod-app \
  --sort DESC \
  --max-items 5

# Update service to use previous task definition
aws ecs update-service \
  --cluster aqliya-prod-cluster \
  --service aqliya-prod-service \
  --task-definition aqliya-prod-app:<previous-revision>

# Wait for stability
aws ecs wait services-stable \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service
```

#### Option 2: Redeploy previous ECR image

```bash
# Update task definition to use previous image tag
# Then force new deployment
aws ecs update-service \
  --cluster aqliya-prod-cluster \
  --service aqliya-prod-service \
  --force-new-deployment
```

### Rollback Checklist

- [ ] Confirm the issue is resolved by rollback
- [ ] Check application logs for errors
- [ ] Verify health check endpoint
- [ ] Test critical user flows
- [ ] Document the issue
- [ ] Fix the issue before next deploy

---

## 7. Monitoring Deployments

### CloudWatch Logs

```bash
# View recent app logs
aws logs get-log-events \
  --log-group-name /ecs/aqliya-prod \
  --log-stream-prefix app \
  --limit 50

# View ClamAV logs
aws logs get-log-events \
  --log-group-name /ecs/aqliya-prod \
  --log-stream-prefix clamav \
  --limit 50
```

### ECS Service Events

```bash
# Check for deployment events
aws ecs describe-services \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service \
  --query 'services[0].events[:10]'
```

### Task Health

```bash
# List running tasks
aws ecs list-tasks \
  --cluster aqliya-prod-cluster \
  --service-name aqliya-prod-service

# Describe specific task
aws ecs describe-tasks \
  --cluster aqliya-prod-cluster \
  --tasks <task-arn>
```

---

## 8. Pre-Deploy Checklist

Before triggering a deploy:

- [ ] All PRs merged and CI passing
- [ ] No breaking schema changes without migration
- [ ] Environment variables updated in ECS if needed
- [ ] Secrets updated in AWS Secrets Manager if needed
- [ ] Terraform changes applied if infrastructure changed
- [ ] Load balancer health check targets healthy
- [ ] Database migrations backward-compatible
- [ ] Rollback plan documented

---

## 9. Post-Deploy Checklist

After a successful deploy:

- [ ] Health check endpoint responding: `curl https://app.aqliya.com/api/health`
- [ ] Smoke test passing (deploy.yml does this automatically)
- [ ] CloudWatch logs showing no errors
- [ ] ECS tasks healthy and stable
- [ ] Critical user flows tested
- [ ] Monitoring dashboards checked
- [ ] No increase in error rates

---

## 10. Infrastructure as Code

### Terraform

| Module | Purpose | Path |
|--------|---------|------|
| **VPC** | Network isolation | `infra/terraform/modules/vpc/` |
| **Compute** | ECS, ECR, ALB, ElastiCache, WAF | `infra/terraform/modules/compute/` |
| **Root** | Environment-specific config | `infra/terraform/` |

### Key Terraform Resources

| Resource | Purpose |
|----------|---------|
| `aws_ecs_cluster` | ECS cluster with Container Insights |
| `aws_ecs_service` | ECS Fargate service (2 tasks for prod) |
| `aws_ecs_task_definition` | App + ClamAV + WAF sidecar containers |
| `aws_ecr_repository` | Container image registry |
| `aws_lb` | Application Load Balancer |
| `aws_lb_target_group` | ALB target group for app |
| `aws_security_group` | ALB, ECS, RDS, Redis security groups |
| `aws_elasticache_replication_group` | Redis 7.1 with failover |
| `aws_wafv2_web_acl` | WAF with rate limiting + managed rules |

### Terraform Commands

```bash
# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Check state
terraform state list

# Import existing resources
terraform import aws_ecs_service.app aqliya-prod-cluster/aqliya-prod-service
```

---

## 11. Docker Image Details

### Dockerfile

The Dockerfile uses **multi-stage build**:

1. **Base stage:** `node:22-alpine` — runtime dependencies
2. **Build stage:** `node:22-alpine` — full build with dev dependencies
3. **Production stage:** `node:22-alpine` — only production artifacts

### Image Optimization

- `npm ci --omit=dev` for production only
- Prisma client generated at build time
- Next.js standalone output mode
- No dev dependencies in production image
- Alpine Linux for minimal image size

### Image Tags

| Tag | Purpose |
|-----|---------|
| `:latest` | Always points to most recent deploy |
| `:<git-sha>` | Immutable reference to specific commit |
| `:<timestamp>` | Optional: timestamp-based tag for auditing |

---

## 12. Troubleshooting

### Deploy Stuck in "In Progress"

**Symptoms:** ECS service shows `IN_PROGRESS` for > 10 minutes.

**Causes:**
- New tasks failing health checks
- Old tasks not draining properly
- Resource constraints (CPU/memory)

**Resolution:**
```bash
# Check service events
aws ecs describe-services \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service \
  --query 'services[0].events[:5]'

# Check task health
aws ecs list-tasks \
  --cluster aqliya-prod-cluster \
  --service-name aqliya-prod-service \
  --desired-status RUNNING

# Check CloudWatch logs for errors
aws logs get-log-events \
  --log-group-name /ecs/aqliya-prod \
  --log-stream-prefix app \
  --limit 20
```

### Health Check Failures After Deploy

**Symptoms:** Smoke test fails, ECS tasks not reaching `HEALTHY`.

**Causes:**
- Application startup error
- Missing environment variables
- Database connection failure
- ClamAV sidecar not ready

**Resolution:**
```bash
# Check app logs
aws logs get-log-events \
  --log-group-name /ecs/aqliya-prod \
  --log-stream-prefix app \
  --limit 50

# Check ClamAV logs
aws logs get-log-events \
  --log-group-name /ecs/aqliya-prod \
  --log-stream-prefix clamav \
  --limit 50

# Verify environment variables
aws ecs describe-task-definition \
  --task-definition aqliya-prod-app \
  --query 'taskDefinition.containerDefinitions[?name==`app`].environment'
```

### ECR Push Failed

**Symptoms:** Deploy fails at "Push to ECR" step.

**Causes:**
- ECR repository doesn't exist
- IAM permissions insufficient
- Image too large

**Resolution:**
```bash
# Verify ECR repository exists
aws ecr describe-repositories --repository-names aqliya/prod/app

# Check IAM role permissions
aws iam simulate-principal-policy \
  --policy-source-arn <deploy-role-arn> \
  --action-names ecr:GetAuthorizationToken ecr:BatchCheckLayerAvailability ecr:PutImage ecr:InitiateLayerUpload ecr:UploadLayerPart ecr:CompleteLayerUpload

# Check image size
docker images aqliya/prod/app --format "{{.Size}}"
```

### Service Cannot Scale

**Symptoms:** ECS service stuck at fewer tasks than desired.

**Causes:**
- Resource limits reached
- Service quotas exceeded
- Placement constraints failing

**Resolution:**
```bash
# Check service desired count
aws ecs describe-services \
  --cluster aqliya-prod-cluster \
  --services aqliya-prod-service \
  --query 'services[0].{desired:desiredCount,running:runningCount,pending:pendingCount}'

# Check resource availability
aws ecs describe-clusters \
  --clusters aqliya-prod-cluster \
  --include STATISTICS

# Check service quotas
aws service-quotas get-service-quota \
  --service-code ecs \
  --quota-code L-219729CA \
  --region eu-north-1
```

---

## 13. Security Considerations

| Concern | Implementation |
|---------|---------------|
| **AWS authentication** | OIDC (no long-lived credentials) |
| **Image signing** | SHA-tagged images for immutability |
| **Secret management** | AWS Secrets Manager (not env vars) |
| **Network** | VPC isolation, security groups |
| **TLS** | ALB terminates TLS |
| **WAF** | AWS WAF with rate limiting + managed rules |
| **ClamAV** | File scanning before storage |
| **Audit** | All deployments logged in CloudWatch |

---

## 14. Reference

| Document | Path |
|----------|------|
| CI workflow | `.github/workflows/ci.yml` |
| Deploy workflow | `.github/workflows/deploy.yml` |
| Dockerfile | `Dockerfile` |
| Terraform compute | `infra/terraform/modules/compute/main.tf` |
| Terraform variables | `infra/terraform/variables.tf` |
| Terraform outputs | `infra/terraform/outputs.tf` |
| Docker Compose | `docker-compose.yml` |
| Staging Compose | `docker-compose.staging.yml` |
| ECS task definition | `infra/terraform/modules/compute/main.tf` (lines 33-249) |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-07-11 | Documentation Agent | Initial runbook created from CI/CD and IaC verification |
