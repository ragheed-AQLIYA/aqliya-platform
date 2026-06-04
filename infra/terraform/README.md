# AQLIYA Infrastructure as Code (Terraform)

Terraform configuration for reproducible, HA/DR-capable deployments of the AQLIYA platform on AWS.

## Architecture

```
CloudFront CDN (WAFv2 — rate limiting + AWS managed rules)
    │
    ▼
ALB (HTTPS, multi-AZ)
    │
    ▼
ECS Fargate (Next.js, spread across 3 AZs)
    │           │
    ▼           ▼
RDS PostgreSQL   ElastiCache Redis
(Multi-AZ,    (Session, cache)
 read replica)
    │
    ▼
S3 (File uploads, static assets)
```

## Structure

```
infra/terraform/
  ├── terraform.tf           # Version constraints + required providers
  ├── main.tf                # Root composition (assembles all modules)
  ├── providers.tf           # AWS provider definitions (default, us-east-1, dr)
  ├── variables.tf           # Root variables
  ├── outputs.tf             # Root outputs
  ├── bootstrap.sh           # One-time S3 + DynamoDB backend setup
  ├── Makefile               # Convenience: make init/plan/apply ENV=dev
  ├── modules/
  │   ├── networking/        # VPC, subnets, NAT, SGs, route tables
  │   ├── database/          # RDS PostgreSQL, read replica, DR snapshot copy
  │   ├── compute/           # ECS Fargate, ALB, ECR, Redis, auto-scaling
  │   ├── storage/           # S3 uploads + static, CloudFront, WAFv2
  │   └── monitoring/        # CloudWatch dashboards + alarms, AWS Backup
  └── environments/
      ├── dev/               # backend.tf + terraform.tfvars
      ├── staging/           # backend.tf + terraform.tfvars
      └── production/        # backend.tf + terraform.tfvars
```

## Environments

| Environment | Multi-AZ | Deletion Protection | Backup Retention | Cross-Region DR |
|-------------|----------|--------------------|------------------|-----------------|
| dev         | No       | No                 | 3 days           | No              |
| staging     | No       | No                 | 7 days           | No              |
| production  | Yes      | Yes                | 30 days          | Yes (EU)        |

## Deployment Plan

### Step 1 — Bootstrap (one-time per AWS account)

Creates the S3 backend bucket and DynamoDB lock table outside of Terraform.

```bash
cd infra/terraform
./bootstrap.sh
```

### Step 2 — Pre-provision prerequisites

These resources must exist before `terraform apply`:

1. Route53 hosted zone for the domain (e.g. `aqliya.ai`)
2. ACM certificates for `*.aqliya.ai` in `me-south-1` (ALB) and `us-east-1` (CloudFront)
3. Secrets in AWS Secrets Manager (per environment):
   - `aqliya/<env>/db-password`
   - `aqliya/<env>/database-url`
   - `aqliya/<env>/redis-url`
   - `aqliya/<env>/auth-secret`
   - `aqliya/<env>/storage-config`

### Step 3 — Provision infrastructure

```bash
# Dev
make init env=dev
make plan env=dev
make apply env=dev

# Staging
make init env=staging
make plan env=staging
make apply env=staging

# Production
make init env=production
make plan env=production
make apply env=production
```

Or without Make:

```bash
terraform init -backend-config=environments/dev/backend.tf
terraform plan -var-file=environments/dev/terraform.tfvars -out=tfplan
terraform apply tfplan
```

### Step 4 — CI/CD Integration

The GitHub Actions workflow at `.github/workflows/deploy.yml` handles:

1. **Deploy** (on push to main/staging branches): Builds Docker image, pushes to ECR, deploys new ECS task definition
2. **Promote** (manual workflow): Promotes staging to production with approval gates
3. **Preview** (PR branches): Deploys ephemeral preview environment
4. **Backup**: Scheduled DB backup via `scripts/db-backup-scheduler.ts`

Terraform apply runs as a separate manual or CI step — the deploy workflow expects the infra to already exist.

## Validation Checklist

Run these checks after provisioning or changing infrastructure:

- [ ] `terraform validate` passes
- [ ] `terraform plan` shows expected changes (no unexpected drifts)
- [ ] RDS instance is reachable from ECS tasks (security group test)
- [ ] ALB health check returns 200 for `/api/health`
- [ ] CloudFront distribution is deployed and serving static content
- [ ] ACM certificates are valid and not expiring soon
- [ ] WAFv2 WebACL is associated with CloudFront
- [ ] S3 buckets have versioning + encryption enabled
- [ ] Route53 alias records resolve to ALB and CloudFront
- [ ] CloudWatch dashboard shows metrics
- [ ] SNS alarm topic has configured subscribers (production)
- [ ] AWS Backup plan is active and has run at least once
- [ ] Cross-region DR snapshot copy is configured (production)
- [ ] ECR lifecycle policy is set (retain 30 images)
- [ ] Auto-scaling triggers are configured (CPU + memory)

## Prerequisites

1. AWS CLI configured with appropriate credentials
2. Terraform >= 1.6
3. S3 bucket `aqliya-terraform-state` created for state storage
4. DynamoDB table `aqliya-terraform-locks` created for state locking
5. ACM certificates issued for `*.aqliya.ai` in both `me-south-1` and `us-east-1`
6. Route53 hosted zone for the domain (e.g. `aqliya.ai`)
7. Secrets in AWS Secrets Manager:
   - `aqliya/<env>/db-password`
   - `aqliya/<env>/database-url`
   - `aqliya/<env>/redis-url`
   - `aqliya/<env>/auth-secret`
   - `aqliya/<env>/storage-config`

## Usage

```bash
make init env=dev        # or staging/production
make plan env=dev
make apply env=dev
make validate            # fmt + validate
make fmt                 # auto-format
make output              # show outputs
make destroy env=dev     # tear down (careful!)
```

## HA/DR Strategy

### High Availability

| Component    | Strategy                                      | RTO      | RPO      |
|-------------|-----------------------------------------------|----------|----------|
| Application | ECS Fargate spread across 3 AZs, auto-scaling | < 5 min  | N/A      |
| Database    | RDS Multi-AZ (production), read replica       | < 2 min  | < 1 min  |
| Redis       | Automatic failover (production, 2 nodes)      | < 30 sec | N/A      |
| Load Balancer | ALB (multi-AZ by design)                   | < 1 min  | N/A      |
| CDN         | CloudFront (globally distributed)             | < 1 min  | N/A      |
| Storage     | S3 (11 nines durability, versioned)           | < 1 min  | N/A      |

### Disaster Recovery

| Scenario                          | Procedure                                                     |
|----------------------------------|---------------------------------------------------------------|
| Single AZ failure                | RDS automatic failover + ECS rebalances to remaining AZs      |
| Multi-AZ regional failure        | Promote cross-region RDS snapshot in DR region (eu-central-1) |
| Database corruption              | Point-in-time recovery from automated backup                  |
| Full region loss                 | Restore from cross-region backup in DR region                 |
| Application deployment failure   | Rollback with ECS service redeploy of previous task definition|

### RTO/RPO Targets

| Tier       | Target             |
|------------|--------------------|
| RTO        | < 30 minutes       |
| RPO        | < 5 minutes        |
| DR drill   | Quarterly          |
| Backup verification | Weekly automated restore test |

### Backup Schedule

| Frequency | Retention | Type           |
|-----------|-----------|----------------|
| Daily     | 30 days   | RDS automated  |
| Weekly    | 120 days  | AWS Backup     |
| Monthly   | 365 days  | AWS Backup     |

## Security Groups

| Security Group | Purpose                    | Ingress                  |
|---------------|----------------------------|--------------------------|
| alb-sg        | ALB                        | 443 (HTTPS), 80 (HTTP)   |
| ecs-sg        | ECS Fargate tasks          | ALB only                 |
| rds-sg        | PostgreSQL                 | ECS tasks only (port 5432) |
| redis-sg      | ElastiCache Redis          | ECS tasks only (port 6379) |

## Cost Estimates (Production)

| Service              | Monthly Estimate |
|----------------------|------------------|
| ECS Fargate (3 tasks)| ~$150            |
| RDS (db.r6g.large, Multi-AZ) | ~$600    |
| ElastiCache Redis    | ~$100            |
| ALB                  | ~$25             |
| NAT Gateway (3 AZs)  | ~$90             |
| S3 + CloudFront      | ~$20             |
| **Total**            | **~$985/month**  |

## Important Notes

- Database password is stored in AWS Secrets Manager, not in Terraform state
- S3 buckets are versioned for file upload integrity
- CloudFront distribution uses origin access identity for S3 static bucket
- ECR lifecycle policy retains the last 30 images
- ECS tasks have health checks against `/api/health`
- Auto-scaling is based on CPU and memory utilization (70%/75% thresholds)
- State locking uses DynamoDB to prevent concurrent modifications
- Terraform apply is required pre-flight for CI/CD to verify plan matches
- WAFv2 rate limiting is set at 5000 requests per 5-minute window per IP
- Route53 alias records are created for root domain, wildcard, and static subdomain
