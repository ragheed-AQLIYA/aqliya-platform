# AQLIYA Production Deployment Checklist

**Purpose:** Gate checklist for launching a new environment (staging, production) following the dev baseline pattern.

---

## ☐ Phase 1: Pre-Deployment

### DNS & Domain

- [ ] Domain registered (e.g., `aqliya.com`, `app.aqliya.com`)
- [ ] Route53 hosted zone created
- [ ] NS records updated at domain registrar
- [ ] ACM certificates requested (eu-north-1 for ALB, us-east-1 for CloudFront)
- [ ] DNS validation CNAME records created in Route53
- [ ] Subdomain delegation (if needed) configured

### Infrastructure

- [ ] `terraform.tfvars` created for new environment (copy from `dev`)
- [ ] `domain_ready = false` initially (HTTPS/CloudFront disabled until cert validates)
- [ ] `container_image` points to correct ECR repo:tag
- [ ] RDS instance class sized for workload (dev uses `db.t4g.micro`)
- [ ] Redis node type sized for workload
- [ ] `db_backup_retention_days` set (min 7 for production, 35 for regulated)
- [ ] `db_deletion_protection = true`
- [ ] `db_multi_az = true` for production
- [ ] `enable_cross_region_dr = true` if needed

---

## ☐ Phase 2: Initial Apply

```bash
cd infra/terraform
terraform init -backend-config=environments/<env>/backend.tf -reconfigure
terraform plan -var-file=environments/<env>/terraform.tfvars
terraform apply -var-file=environments/<env>/terraform.tfvars -auto-approve
```

- [ ] Terraform init succeeds
- [ ] Terraform plan shows expected resources (no unexpected deletions)
- [ ] Terraform apply completes without error

---

## ☐ Phase 3: Database

- [ ] Prisma migrations run (via ECS task)
- [ ] Seed data applied
- [ ] Connection verified via health endpoint

### Run migration

```bash
aws ecs run-task \
  --cluster <cluster-name> \
  --task-definition aqliya-dev-migrate-v5 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[...],securityGroups=[...],assignPublicIp=DISABLED}"
```

---

## ☐ Phase 4: DNS Propagation

- [ ] NS records propagated (24-48h)
- [ ] ACM certificates show `ISSUED` status
- [ ] `domain_ready = true` set in tfvars
- [ ] `terraform apply` to enable HTTPS + CloudFront + WAF

---

## ☐ Phase 5: Post-Deploy Smoke Tests

- [ ] `https://<domain>/api/health` → 200 + `status:ok`
- [ ] `https://<domain>/` → 200
- [ ] `https://<domain>/login` → 200
- [ ] TLS certificate valid in browser
- [ ] HSTS header present
- [ ] Redirect HTTP to HTTPS (if ALB listener configured)

See `POST_DEPLOY_SMOKE_TESTS.md` for full test suite.

---

## ☐ Phase 6: Hardening

- [ ] WAF rules verified (rate limiting + managed rules)
- [ ] CSP / security headers verified
- [ ] robots.txt correct (disallow internal routes)
- [ ] No sensitive data exposed via public routes
- [ ] S3 bucket policies correct
- [ ] CloudFront cache behaviors correct

---

## ☐ Phase 7: Observability

- [ ] CloudWatch dashboard shows metrics
- [ ] ALB 5xx alarm configured
- [ ] ECS CPU/memory alarms configured
- [ ] RDS CPU/storage/connection alarms configured
- [ ] Backup plan active
- [ ] Logs flowing to CloudWatch Logs

---

## ☐ Phase 8: Final Verification

- [ ] Terraform state saved and backed up
- [ ] `terraform plan` shows no drift
- [ ] All secrets stored in Secrets Manager (not hardcoded)
- [ ] IAM roles least-privilege verified
- [ ] Rollback plan documented
- [ ] Runbook updated

---

## Rollback Procedure

If deployment fails or needs to be reverted:

```bash
# Roll back to previous Terraform state
terraform plan -var-file=environments/<env>/terraform.tfvars -out=tfplan
# Review plan for destructive changes, then:
terraform apply tfplan

# Alternative: restore from backup
# 1. Restore RDS from snapshot
# 2. Point service to previous task definition
# 3. Update Route53 if needed
```
