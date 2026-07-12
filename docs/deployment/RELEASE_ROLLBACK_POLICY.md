# AQLIYA Release & Rollback Policy

**Status:** Active | **Last updated:** 2026-07-08 | **Environment:** dev

---

## 1. What Defines a Release

A release is a change to the production environment that affects users. In AQLIYA, a release can be:

| Type | Example | Risk |
|------|---------|------|
| **Infrastructure** | Terraform apply (new resources, config changes) | High |
| **Application** | Docker image deploy (new code, features) | Medium |
| **Data** | Database migrations | High |
| **Configuration** | Secrets update, env vars | Low-Medium |
| **DNS/TLS** | Route53 changes, cert updates | High |

---

## 2. Release Process

### 2.1 Standard Release Flow

```
Code → Build → Deploy dev → Test → Deploy staging → Test → Deploy prod
```

### 2.2 Current Dev Process

Since only `dev` exists, the flow is:

```bash
# 1. Update code
git commit -m "feature: ..."

# 2. Build and push Docker image
docker build -t aqliya-dev-app .
docker tag aqliya-dev-app:latest <ecr-url>:latest
docker push <ecr-url>:latest

# 3. Update infrastructure (if needed)
cd infra/terraform
terraform apply -var-file=environments/dev/terraform.tfvars -auto-approve

# 4. Deploy to ECS
aws ecs update-service \
  --cluster aqliya-dev-cluster \
  --service aqliya-dev-service \
  --force-new-deployment

# 5. Verify
curl https://dev.aqliya.com/api/health
```

### 2.3 Release Levels

| Level | Description | Approval | Environments |
|-------|-------------|----------|--------------|
| L0 | Hotfix (emergency) | Self-approved | dev → prod (direct) |
| L1 | Bug fix | Code review | dev → staging → prod |
| L2 | Feature | Code review + QA | dev → staging → prod |
| L3 | Infrastructure | Architecture review | dev → staging → prod |

---

## 3. Rollback Procedures

### 3.1 Application Rollback

```bash
# Option A: Roll back to previous Docker image
# 1. Identify previous working image
aws ecr describe-images \
  --repository-name aqliya/dev/app \
  --query 'imageDetails[?imageTags!=null]|[*].{tags:imageTags,pushedAt:imagePushedAt}'

# 2. Tag the previous image as latest
MANIFEST=$(aws ecr batch-get-image \
  --repository-name aqliya/dev/app \
  --image-ids imageTag=<previous-tag> \
  --query 'images[0].imageManifest' --output text)

aws ecr put-image \
  --repository-name aqliya/dev/app \
  --image-tag latest \
  --image-manifest "$MANIFEST"

# 3. Force redeploy
aws ecs update-service \
  --cluster aqliya-dev-cluster \
  --service aqliya-dev-service \
  --force-new-deployment

# 4. Verify
curl https://dev.aqliya.com/api/health
```

### 3.2 Infrastructure Rollback

```bash
# Option A: Revert Terraform (preferred)
# 1. Go to the previous Terraform state
cd infra/terraform
git checkout <previous-commit> -- infra/terraform/

# 2. Re-apply
terraform apply -var-file=environments/dev/terraform.tfvars -auto-approve

# Option B: If Terraform state is corrupted
# 1. Restore state from S3 versioning
aws s3api get-object \
  --bucket aqliya-terraform-state \
  --key "dev/terraform.tfstate" \
  --version-id "<version-id>" \
  terraform.tfstate.restored

# 2. Push restored state
terraform state push terraform.tfstate.restored

# 3. Apply
terraform plan -var-file=environments/dev/terraform.tfvars
terraform apply -var-file=environments/dev/terraform.tfvars -auto-approve
```

### 3.3 Database Rollback

```bash
# If migration caused issues:
# 1. List RDS snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier aqliya-dev-db \
  --query 'DBSnapshots[?Status==`available`].[DBSnapshotIdentifier,SnapshotCreateTime]'

# 2. Restore from snapshot (creates new instance)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier aqliya-dev-db-rollback \
  --db-snapshot-identifier <snapshot-id>

# 3. Update connection string
# See BACKUP_RESTORE_DRILL.md for full procedure
```

### 3.4 DNS / TLS Rollback

```bash
# If domain/TLS fails:
# 1. Set domain_ready = false in terraform.tfvars
# 2. terraform apply (removes HTTPS, CloudFront)
# 3. Fix TLS issue
# 4. Set domain_ready = true
# 5. terraform apply
```

---

## 4. Rollback Decision Matrix

| Symptom | Rollback? | Action |
|---------|-----------|--------|
| Health check fails (`/api/health`) | ✅ Yes | Rollback ECS task definition or Docker image |
| Database errors after migration | ✅ Yes | Restore RDS from snapshot |
| Page returns 5xx errors | ✅ Yes | Rollback Docker image |
| Page returns 4xx errors | ⚠️ Maybe | Check routing, auth, middleware |
| Slow but functional | ❌ No | Investigate, fix forward |
| UI glitches, non-critical | ❌ No | Fix in next release |
| Security vulnerability | ✅ Yes | Immediate rollback + rotate secrets |

---

## 5. Release Gates

Before promoting from dev to staging/production:

| Gate | Check | Who |
|------|-------|-----|
| ✅ Code review | PR approved | Team lead |
| ✅ Tests pass | `npm test` green | CI |
| ✅ Build passes | `npm run build` success | CI |
| ✅ Terraform plan review | No unexpected changes | Platform admin |
| ✅ Health check | `https://<env>/api/health` → 200 | Automated |
| ✅ Smoke tests | `POST_DEPLOY_SMOKE_TESTS.md` | QA |
| ✅ Security scan | No critical vulnerabilities | Security team |
| ✅ Sign-off | Release approved | Product owner |

---

## 6. Versioning

### Docker Images

```bash
# Tag format
<ecr-url>:<environment>-<timestamp>-<commit-sha>

# Example
308621094029.dkr.ecr.eu-north-1.amazonaws.com/aqliya/dev/app:dev-20260708-abc123
```

### Current Image

```
latest → sha256:2a77dc646a19407681a5912c4c5a7c1cfb8a0020c84f014a4fd5cb24964c3da9
```

### Terraform State

State is versioned in S3. Previous versions can be restored if needed.

---

## 7. Communication

| Event | Channel | Template |
|-------|---------|----------|
| Release started | Slack/Teams | `🚀 Deploying <version> to <env>` |
| Release completed | Slack/Teams | `✅ <version> deployed to <env> - health: OK` |
| Rollback started | Slack/Teams + Email | `🔴 Rolling back <version> on <env>` |
| Rollback completed | Slack/Teams | `✅ Rollback complete - <env> at <version>` |
| Incident post-mortem | Document | `docs/incidents/YYYY-MM-DD-description.md` |
