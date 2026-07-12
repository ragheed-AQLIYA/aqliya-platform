# AQLIYA Production Readiness Gate

**Status:** Draft | **Last updated:** 2026-07-08 | **Gate keeper:** Platform Administrator

---

## 1. Dev → Prod Gap Analysis

| Dimension | Dev (`dev.aqliya.com`) | Proposed Prod (`app.aqliya.com`) | Gap | Decision Needed |
|-----------|----------------------|-----------------------------------|-----|-----------------|
| **Domain** | `dev.aqliya.com` | `app.aqliya.com` (or `aqliya.com`) | Different domain | Select production domain |
| **TLS** | ACM pending validation | ACM to be requested for prod domain | New certs needed | — |
| **DNS** | Route53 subdomain delegation | New hosted zone + NS records | New records | Registrar access |
| **ECS CPU** | 512 (.5 vCPU) | 1024 (1 vCPU) | ⬆ Increase | — |
| **ECS Memory** | 1024 MB | 2048 MB | ⬆ Increase | — |
| **ECS Desired** | 1 | 2 | ⬆ HA | — |
| **RDS Class** | `db.t4g.micro` (1GB) | `db.t4g.medium` (4GB) | ⬆ Scale up | — |
| **RDS Storage** | 20 GB | 100 GB | ⬆ Increase | — |
| **RDS Multi-AZ** | false | true | ⬆ HA | — |
| **RDS Deletion Protection** | false | true | ⬆ Enable | — |
| **RDS Backup** | 1 day | 30 days | ⬆ Increase | — |
| **Redis** | `cache.t4g.small` (0.5GB) | `cache.t7g.medium` (3.1GB) | ⬆ Scale up | — |
| **Cross-region DR** | false | true (eu-central-1) | ⬆ Enable | Confirm DR region |
| **WAF Rules** | AWS Managed + rate limit | Same + stricter prod rules | ⬆ Harden | Review WAF ruleset |
| **Secrets** | `aqliya/dev/*` | `aqliya/prod/*` | New secrets needed | Create prod secrets |
| **ECR Repo** | `aqliya/dev/app` | `aqliya/prod/app` | New repo needed | Create prod ECR repo |
| **CloudFront** | Active | Active | Same pattern | — |
| **S3 Buckets** | `aqliya-dev-uploads/static` | `aqliya-prod-uploads/static` | New buckets | Terraform auto-creates |
| **Backup Retention** | 1 day | 30 days | ⬆ Increase | — |
| **Monitoring Alarms** | Basic | Production-grade | ⬆ Add more | Review thresholds |
| **CI/CD** | Manual deploy | Automated pipeline | ⬆ New | GitHub Actions |
| **Rollback Plan** | Documented | Same | Same runbook | — |
| **Incident Response** | Documented | Same | Same runbook | — |
| **Penetration Test** | Not executed | Required before launch | ❌ BLOCKING | Schedule pentest |
| **Load Test** | Not executed | Recommended | ⚠️ Advisory | Consider |

---

## 2. Production Readiness Checklist

### ☐ 2.1 Pre-Flight (Domain + DNS)

- [ ] Production domain selected (`app.aqliya.com` or `aqliya.com`)
- [ ] Domain registrar access confirmed
- [ ] Route53 hosted zone created for production domain
- [ ] ACM certificates requested (eu-north-1 + us-east-1)
- [ ] DNS validation CNAME records created in Route53
- [ ] NS delegation updated at registrar
- [ ] ACM certs show `ISSUED` status

### ☐ 2.2 Infrastructure

- [ ] `infra/terraform/environments/prod/terraform.tfvars` reviewed and approved
- [ ] ECR repository created for prod images (`aqliya/prod/app`)
- [ ] Docker image built and pushed to prod ECR
- [ ] Prod secrets created in Secrets Manager (`aqliya/prod/*`)
- [ ] Terraform plan reviewed (no unexpected changes)
- [ ] Terraform apply executed and verified

### ☐ 2.3 Database

- [ ] Database migration run (via ECS task)
- [ ] Seed data loaded if needed
- [ ] Backup retention set to 30 days
- [ ] Multi-AZ enabled
- [ ] Deletion protection enabled
- [ ] Cross-region DR snapshot copy configured

### ☐ 2.4 Security

- [ ] WAF rules reviewed and production-hardened
- [ ] Security headers verified (CSP, HSTS, XFO, etc.)
- [ ] CSP `unsafe-inline` removed or justified
- [ ] robots.txt correct (noindex unless public marketing)
- [ ] S3 bucket policies correct (private uploads, OAI for static)
- [ ] Secrets verified (all 13 prod secrets exist)
- [ ] IAM roles least-privilege verified
- [ ] Penetration test completed (or scheduled)

### ☐ 2.5 Observability

- [ ] CloudWatch dashboard configured for prod
- [ ] All alarms active (5xx, latency, CPU, storage)
- [ ] Log retention set to 90+ days (or compliance requirement)
- [ ] Synthetic uptime check configured (Pingdom/Checkly)
- [ ] Incident response contacts configured (SNS subscriptions)

### ☐ 2.6 Backup & DR

- [ ] RDS automated backups at 30 days
- [ ] AWS Backup plan active (daily, weekly, monthly)
- [ ] Cross-region DR snapshot copy tested
- [ ] Restore drill executed and documented

### ☐ 2.7 Operations

- [ ] Release & rollback policy reviewed
- [ ] Access control matrix reviewed
- [ ] Production launch runbook reviewed
- [ ] On-call / escalation contacts confirmed
- [ ] Smoke tests executed and evidence saved

---

## 3. Rollback Triggers

| Trigger | Action | Owner |
|---------|--------|-------|
| Health check fails (< 200) | Rollback ECS deployment | DevOps |
| Database errors after migration | Restore RDS from snapshot | DBA |
| TLS/domain issues | Set `domain_ready = false`, revert DNS | Platform Admin |
| Security vulnerability detected | Immediate rollback + rotate secrets | Security |
| Performance degradation > 50% | Scale up resources or rollback | DevOps |

---

## 4. Gate Decision

**Gate status:** ⬜ NOT YET ASSESSED

| Criterion | Status | Notes |
|-----------|--------|-------|
| Domain + DNS | ⬜ | |
| Terraform config | ⬜ | |
| Secrets | ⬜ | |
| Security review | ⬜ | |
| Observability | ⬜ | |
| Backup/DR | ⬜ | |
| Rollback path | ⬜ | |
| Go/No-Go | ⬜ | |

**Decision:** _____________  
**Date:** _____________  
**Signed:** _____________
