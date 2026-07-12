# AQLIYA Secrets & Rotation Runbook

**Status:** Active | **Last updated:** 2026-07-08 | **Environment:** dev

---

## 1. Secrets Inventory

All secrets stored in **AWS Secrets Manager** (eu-north-1).

| Secret Name | Type | Used By | Rotation |
|-------------|------|---------|----------|
| `aqliya/dev/db-password` | Auto-generated (Terraform) | RDS (via `master_user_secret`) | AWS-managed |
| `aqliya/dev/database-url` | Derived | ECS (DATABASE_URL env) | Manual |
| `aqliya/dev/redis-url` | Derived | ECS (REDIS_URL env) | Manual |
| `aqliya/dev/auth-secret` | Static | ECS (AUTH_SECRET, NEXTAUTH_SECRET) | Manual |
| `aqliya/dev/storage-provider` | Static | ECS (STORAGE_PROVIDER) | Manual |
| `aqliya/dev/s3-bucket` | Static | ECS (S3_BUCKET) | Manual |
| `aqliya/dev/scim-api-key` | Static | ECS (SCIM_API_KEY) | Manual |
| `aqliya/dev/sso-config` | JSON blob | ECS (SSO_DEFAULT_ORG_ID) | Manual |
| `aqliya/dev/google-oauth` | JSON blob | ECS (Google OAuth env vars) | Manual |
| `aqliya/dev/github-oauth` | JSON blob | ECS (GitHub OAuth env vars) | Manual |
| `aqliya/dev/azure-ad-oauth` | JSON blob | ECS (Azure AD env vars) | Manual |
| `aqliya/dev/okta-oauth` | JSON blob | ECS (Okta env vars) | Manual |
| `aqliya/dev/oidc-config` | JSON blob | ECS (OIDC env vars) | Manual |

---

## 2. Secret Creation

### Initial creation script

```bash
# From the repository root
bash infra/terraform/scripts/create-secrets.sh dev eu-north-1
```

### What the script does

1. Creates each secret with a placeholder value
2. ECR allows immediate use
3. Secrets with JSON values (OAuth providers) are stored as JSON objects

### Creating a new secret

```bash
aws secretsmanager create-secret \
  --name "aqliya/dev/<secret-name>" \
  --secret-string "<value>" \
  --region eu-north-1
```

---

## 3. Updating Secrets

### Manual update (e.g., new database password)

```bash
aws secretsmanager put-secret-value \
  --secret-id "aqliya/dev/database-url" \
  --secret-string "postgresql://user:pass@host:5432/db?sslmode=no-verify&connection_limit=20&pool_timeout=10" \
  --region eu-north-1
```

### Important

After updating a secret used by ECS:
1. The new value takes effect **when the next task starts**
2. Force a new deployment:
   ```bash
   aws ecs update-service \
     --cluster aqliya-dev-cluster \
     --service aqliya-dev-service \
     --force-new-deployment
   ```
3. **Secrets are resolved at task start**, not at runtime

---

## 4. ECS Secret Resolution

ECS task definitions reference secrets by **full ARN** (including random suffix):

```json
{
  "name": "DATABASE_URL",
  "valueFrom": "arn:aws:secretsmanager:eu-north-1:308621094029:secret:aqliya/dev/database-url-cNpIl8"
}
```

Secrets with JSON values are passed as-is. The app must parse them.

### Required IAM permissions

ECS execution role must have:

```json
{
  "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:*:*:secret:*"
}
```

✅ Already configured.

---

## 5. Secret Rotation

### RDS Password (AWS-managed)

- Managed by `aws_db_instance.master_user_secret`
- AWS rotates automatically
- No manual action needed

### All other secrets

Rotation is **manual**. Current policy:

| Rotation Trigger | Action | Runbook |
|-----------------|--------|---------|
| Security incident | Rotate immediately | Section 7 |
| Employee offboarding | Rotate auth/API secrets | Section 7 |
| Every 90 days (production) | Scheduled rotation | Section 7 |
| Every 365 days (dev) | Scheduled rotation | Section 7 |

---

## 6. Deriving `database-url` and `redis-url`

### database-url

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier aqliya-dev-db \
  --query 'DBInstances[0].Endpoint.Address' --output text)

# Get password from secret
PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "aqliya/dev/db-password" \
  --query 'SecretString' --output text)

# Construct URL
DATABASE_URL="postgresql://aqliya_admin:${PASSWORD}@${RDS_ENDPOINT}:5432/aqliya?sslmode=no-verify&connection_limit=20&pool_timeout=10"

# Update secret
aws secretsmanager put-secret-value \
  --secret-id "aqliya/dev/database-url" \
  --secret-string "$DATABASE_URL"
```

### redis-url

```bash
# Get Redis endpoint
REDIS_ENDPOINT=$(aws elasticache describe-cache-clusters \
  --cache-cluster-id aqliya-dev-redis \
  --query 'CacheClusters[0].CacheNodes[0].Endpoint.Address' --output text)

REDIS_URL="redis://${REDIS_ENDPOINT}:6379"

aws secretsmanager put-secret-value \
  --secret-id "aqliya/dev/redis-url" \
  --secret-string "$REDIS_URL"
```

---

## 7. Incident: Secret Breach or Rotation

### If a secret is compromised

```bash
# 1. Generate new value
NEW_PASSWORD=$(openssl rand -base64 32)

# 2. Update the secret
aws secretsmanager put-secret-value \
  --secret-id "aqliya/dev/auth-secret" \
  --secret-string "$NEW_PASSWORD"

# 3. Force new ECS deployment
aws ecs update-service \
  --cluster aqliya-dev-cluster \
  --service aqliya-dev-service \
  --force-new-deployment

# 4. Verify app starts with new secret
curl https://dev.aqliya.com/api/health

# 5. If RDS password:
#    - Update the password via AWS RDS console
#    - Derive new database-url
#    - Update secret
#    - Force deployment
```

### If a secret is accidentally deleted

```bash
# 1. Recreate with same name
aws secretsmanager create-secret \
  --name "aqliya/dev/<secret-name>" \
  --secret-string "<value>" \
  --region eu-north-1

# 2. Verify
aws secretsmanager get-secret-value \
  --secret-id "aqliya/dev/<secret-name>" \
  --query 'Name' --output text

# 3. Force deployment to confirm
```
