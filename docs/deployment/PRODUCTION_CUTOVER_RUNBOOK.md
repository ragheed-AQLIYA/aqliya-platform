# AQLIYA Production Cutover Runbook

**Status:** Draft | **Last updated:** 2026-07-08 | **Target domain:** `app.aqliya.com` (or `aqliya.com`)

---

## Phase 1: Pre-Cutover (T-7 days)

### 1.1 Domain & DNS Preparation

```bash
# 1. Create Route53 hosted zone
aws route53 create-hosted-zone --name "app.aqliya.com" --caller-reference "prod-$(date +%s)"

# 2. Record the NS records
aws route53 get-hosted-zone --id <zone-id> --query 'DelegationSet.NameServers'

# 3. Update NS records at domain registrar (external)
#    Nameservers to set:
#    ns-xxx.awsdns-xx.net
#    ns-xxx.awsdns-xx.com
#    ns-xxx.awsdns-xx.org
#    ns-xxx.awsdns-xx.co.uk
```

### 1.2 ACM Certificates

```bash
# Request certs (eu-north-1 for ALB)
aws acm request-certificate \
  --domain-name "app.aqliya.com" \
  --subject-alternative-names "*.app.aqliya.com" \
  --validation-method DNS \
  --idempotency-token "prod-eun1"

# Request certs (us-east-1 for CloudFront)
aws acm request-certificate \
  --region us-east-1 \
  --domain-name "app.aqliya.com" \
  --subject-alternative-names "*.app.aqliya.com" \
  --validation-method DNS \
  --idempotency-token "prod-use1"

# Create DNS validation records in Route53
# (Get validation CNAMEs from describe-certificate)
```

### 1.3 ECR Repository

```bash
# Create production ECR repo
aws ecr create-repository \
  --repository-name aqliya/prod/app \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Build and push production image
docker build -t aqliya-prod-app -f Dockerfile .
docker tag aqliya-prod-app:latest 308621094029.dkr.ecr.eu-north-1.amazonaws.com/aqliya/prod/app:latest
docker push 308621094029.dkr.ecr.eu-north-1.amazonaws.com/aqliya/prod/app:latest
```

### 1.4 Production Secrets

```bash
# Create all 13 secrets under aqliya/prod/
cd infra/terraform
./scripts/create-secrets.sh prod eu-north-1

# Update database-url and redis-url after Terraform apply (when endpoints are known)
```

---

## Phase 2: Cutover Day (T-0)

### 2.1 Pre-Deployment Checks

```bash
# 1. Verify ACM certs are ISSUED
aws acm list-certificates --query 'CertificateSummaryList[?contains(DomainName,`app.aqliya.com`) && Status==`ISSUED`]'

# 2. Verify Docker image exists in prod ECR
aws ecr describe-images --repository-name aqliya/prod/app --query 'imageDetails[*].imageTags'

# 3. Verify all prod secrets exist
aws secretsmanager list-secrets --query 'SecretList[?contains(Name,`aqliya/prod`)].Name'
```

### 2.2 Terraform Apply

```bash
cd infra/terraform

# Initialize with prod backend
terraform init -backend-config=environments/prod/backend.tf -reconfigure

# Review plan
terraform plan -var-file=environments/prod/terraform.tfvars -out=tfplan

# *** MANUAL REVIEW POINT ***
# Verify: no destructive changes, correct domain, correct sizing
# Show plan to team lead / platform admin

# Apply
terraform apply tfplan

# Save outputs
terraform output > ../docs/deployments/prod-outputs-$(date +%Y-%m-%d).txt
```

### 2.3 Database Migration

```bash
# Get the RDS endpoint from Terraform outputs
# Run migration task (see INCIDENT_ROLLBACK_RUNBOOK.md for task definition)
```

### 2.4 Enable Domain

Once ACM certs are ISSUED and DNS propagated:

```bash
# Set domain_ready = true in environments/prod/terraform.tfvars
terraform apply -var-file=environments/prod/terraform.tfvars -auto-approve
```

---

## Phase 3: Post-Cutover Verification

### 3.1 Smoke Tests

Run the full smoke test suite from `POST_DEPLOY_SMOKE_TESTS.md`:

```bash
# Health
curl https://app.aqliya.com/api/health
# Expected: {"status":"ok","database":true,"auth_secret":true}

# Pages
curl -o /dev/null -w "%{http_code}" https://app.aqliya.com/         # → 200
curl -o /dev/null -w "%{http_code}" https://app.aqliya.com/login    # → 200

# TLS
openssl s_client -connect app.aqliya.com:443 -servername app.aqliya.com

# Security headers
curl -s -I https://app.aqliya.com/api/health | grep -E "strict-transport|content-security|frame"
```

### 3.2 Save Evidence

```bash
# Save baseline evidence
curl -I https://app.aqliya.com > docs/deployments/prod-baseline-$(date +%Y-%m-%d).txt
curl https://app.aqliya.com/api/health >> docs/deployments/prod-baseline-$(date +%Y-%m-%d).txt
```

---

## Phase 4: Rollback Triggers

### Immediate rollback if:

| Symptom | Action | ETA |
|---------|--------|-----|
| Health endpoint returns non-200 | Roll back to previous Docker image | 10 min |
| Database errors | Restore RDS from snapshot | 30 min |
| TLS/domain failure | Set `domain_ready = false`, re-apply | 5 min |
| Security incident | Full rollback + rotate secrets | 15 min |

### Rollback commands:

```bash
# Fast rollback: disable domain
# Set domain_ready = false
terraform apply -var-file=environments/prod/terraform.tfvars -auto-approve

# Full rollback: previous Docker image
aws ecr batch-get-image --repository-name aqliya/prod/app --image-ids imageTag=previous
aws ecr put-image --repository-name aqliya/prod/app --image-tag latest --image-manifest <manifest>
aws ecs update-service --cluster aqliya-prod-cluster --service aqliya-prod-service --force-new-deployment

# Database rollback
# See BACKUP_RESTORE_DRILL.md
```

---

## Phase 5: Stabilization (T+24h)

- [ ] Monitor CloudWatch alarms for 24 hours
- [ ] Check error rates in Sentry
- [ ] Verify backup jobs completed
- [ ] Run restore drill on prod RDS snapshot
- [ ] Document any issues found
- [ ] Update runbooks with lessons learned

---

## Contact Sheet

| Role | Name | Phone | Email |
|------|------|-------|-------|
| Platform Admin | TBD | TBD | TBD |
| DevOps Lead | TBD | TBD | TBD |
| DB Admin | TBD | TBD | TBD |
| Security | TBD | TBD | TBD |

**Escalation:** If cutover fails and cannot be resolved in 30 minutes, execute full rollback.
