# AQLIYA Access Control Matrix

**Status:** Active | **Last updated:** 2026-07-08 | **Environment:** dev

---

## 1. AWS IAM Users & Roles

| Principal | Type | Purpose | Access Scope |
|-----------|------|---------|--------------|
| `aqliya1` | IAM User | Terraform execution, CLI operations | AdministratorAccess (full AWS) |
| `aqliya-dev-ecs-task` | IAM Role | ECS task role (app runtime) | Limited (secrets, S3, SSM) |
| `aqliya-dev-ecs-execution` | IAM Role | ECS execution role (agent) | ECR pull, Secrets Manager, logs |
| `aqliya-dev-backup-role` | IAM Role | AWS Backup service | RDS snapshots, backup vault |

---

## 2. Permissions Matrix

### Resources by sensitivity

| Tier | Resources | Example | Who Can Access |
|------|-----------|---------|----------------|
| **T1: Critical** | Route53, ACM, IAM | Domain, TLS certs, users | `aqliya1` (admin) |
| **T2: High** | RDS, Secrets Manager, ECS | Database, secrets, compute | `aqliya1`, ECS execution role |
| **T3: Medium** | S3 (uploads), ElastiCache | Files, cache | `aqliya1`, ECS task role |
| **T4: Low** | CloudWatch Logs, S3 (static) | Logs, public assets | `aqliya1`, ECS roles |

### Detailed permissions

#### `aqliya-dev-ecs-task` (app runtime)

| Action | Resource | Reason |
|--------|----------|--------|
| `secretsmanager:GetSecretValue` | `arn:aws:secretsmanager:*:*:secret:*` | Read DB URL, Redis URL, auth secrets |
| `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` | `arn:aws:s3:::*` | Upload/download files |
| `ssm:GetParameters` | `*` | ECS secret name resolution |

#### `aqliya-dev-ecs-execution` (ECS agent)

| Action | Resource | Reason |
|--------|----------|--------|
| `ecr:GetAuthorizationToken` | `*` | Pull Docker image |
| `ecr:BatchCheckLayerAvailability`, `ecr:GetDownloadUrlForLayer`, `ecr:BatchGetImage` | `*` | Pull Docker image layers |
| `logs:CreateLogStream`, `logs:PutLogEvents` | `arn:aws:logs:*:*:*` | Ship container logs to CloudWatch |
| `secretsmanager:GetSecretValue` | `arn:aws:secretsmanager:*:*:secret:*` | Resolve secrets for container env vars |
| `s3:GetObject`, `s3:PutObject` | `arn:aws:s3:::*` | File operations |

---

## 3. Infrastructure Access Points

| Surface | Auth Method | Who | Notes |
|---------|------------|-----|-------|
| **AWS Console** | IAM user/password + MFA | `aqliya1` | Full admin access |
| **AWS CLI** | Access keys | `aqliya1` | Stored in env vars |
| **Terraform** | AWS credentials (CLI) | `aqliya1` | Executed from dev machine |
| **GitHub** | Personal access token | TBD | CI/CD pipeline (future) |
| **Domain Registrar** | External credentials | Owner | Nameservers point to Route53 |

---

## 4. Separation of Duties (Recommended for Production)

| Role | Responsibilities | Recommended IAM Group |
|------|-----------------|----------------------|
| **Platform Admin** | Terraform, Route53, IAM, networking | `AQLIYA-Platform-Admins` |
| **DevOps** | ECS, RDS, Redis, deployments | `AQLIYA-DevOps` |
| **Developer** | App code, read logs, read metrics | `AQLIYA-Developers` |
| **Read-only** | View resources, no changes | `AQLIYA-ReadOnly` |

### Production IAM Boundaries (Recommended)

```json
{
  "Effect": "Allow",
  "Action": [
    "ecs:*",
    "rds:Describe*",
    "logs:*"
  ],
  "Resource": "*",
  "Condition": {
    "StringEquals": {
      "aws:ResourceTag/Environment": "production"
    }
  }
}
```

---

## 5. Current State vs Production Target

| Practice | Current (dev) | Target (production) |
|----------|--------------|---------------------|
| MFA on AWS account | ❌ | ✅ Required |
| IAM groups | ❌ | ✅ Create groups with boundaries |
| Dedicated deploy user | ❌ (using admin user) | ✅ Create CI/CD user with limited perms |
| Terraform state locking | ✅ DynamoDB | ✅ Same |
| Secret rotation policy | ❌ Manual | ✅ Automated where possible |
| Access key rotation | ❌ | ✅ 90-day rotation |
| Audit logging | ✅ CloudTrail (default) | ✅ CloudTrail + Athena queries |

---

## 6. Terraform State Access

| Resource | Location | Access |
|----------|----------|--------|
| `aqliya-terraform-state` bucket | S3 (eu-north-1) | Encrypted at rest, versioned |
| `aqliya-terraform-locks` table | DynamoDB (eu-north-1) | Used for state locking |

**Only `aqliya1` can access these resources.**

---

## 7. Emergency Access

In case of emergency:
1. `aqliya1` has full admin access (use with caution)
2. Root account credentials stored securely (use only for AWS support cases)
3. If keys compromised: rotate immediately via AWS Console

**Contact:** Platform Administrator (owner)
