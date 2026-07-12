# AQLIYA Platform Activation Program

**Status:** Ready | **Date:** 2026-07-09 | **Target:** First product on production runtime

---

## Current State

```
Infrastructure: ✅ 3 environments live (aqliya.com, dev, prod)
Runtime:       ✅ CloudFront → WAF → ALB → ECS → RDS/Redis
Governance:    ✅ Baseline + Runbooks + CI/CD
Open items:    4 operational commitments
```

---

## Track 1 — Operational Closure Sprint

| # | Item | Owner | Target | Deliverable |
|---|------|-------|--------|-------------|
| 1 | AWS account upgrade | TBD | TBD | Billing enabled + quotas increased |
| 2 | Terraform state recovery | TBD | TBD | S3 state restored for dev + prod |
| 3 | GitHub deploy role | TBD | TBD | IAM role + `AWS_DEPLOY_ROLE_ARN` secret |
| 4 | Penetration test | TBD | TBD | Scheduled engagement + report |

### State Recovery Quick Start

```bash
cd infra/terraform
terraform init -backend-config=environments/prod/backend.tf -reconfigure
# Import critical resources:
terraform import module.networking.aws_vpc.main vpc-060a49d210f05d9d1
terraform import module.database.aws_db_instance.primary aqliya-prod-db
terraform import module.compute.aws_ecs_cluster.main aqliya-prod-cluster
# ... continue full import list
terraform apply -var-file=environments/prod/terraform.tfvars
```

---

## Track 2 — Platform Truth Audit

### Verify

| Check | Method |
|-------|--------|
| AWS resources match Terraform | `terraform plan` after state recovery |
| Documentation matches reality | Compare `docs/deployment/` against AWS console |
| CI/CD path is executable | Manual test: push to main → verify pipeline |
| All 3 domains resolve | DNS check for aqliya.com, dev, app |
| Health endpoints respond | curl all 3 environments |

### Deliverable

`docs/audits/PLATFORM_TRUTH_AUDIT_FINAL.md`

---

## Track 3 — First Product Activation

### Recommended: **AuditOS**

Rationale:
- Most mature product in the codebase (L6 production-hardened)
- Directly aligned with AQLIYA's institutional identity
- Real governance workflow (evidence, review, approval, audit trail)
- Strong seed data and test coverage

### Activation Checklist

| Step | Action |
|------|--------|
| 1 | Route strategy: `/audit` → `app.aqliya.com/audit` |
| 2 | Auth: RBAC + tenant isolation (existing) |
| 3 | Seed data: populated (existing) |
| 4 | Smoke tests: login → engagement → evidence → export |
| 5 | Readiness gate: AuditOS-specific checklist |
| 6 | Production pilot: select pilot organization |
| 7 | Go/No-Go: documented decision |

### Alternative: SalesOS

If customer-facing sales intelligence is higher priority:
- Also L6 production-hardened
- Pipeline, deals, accounts, intelligence tabs
- Needs CRM integration for full value

---

## Program Structure

```text
Week 1-2:   Track 1 — Operational Closure (4 items)
Week 2-3:   Track 2 — Platform Truth Audit
Week 3-4:   Track 3 — First Product Activation (audit / sales)
Week 4:     Go/No-Go for product pilot
```

## Resources Needed

- AWS account admin access (for upgrade + IAM)
- GitHub repository admin (for secrets)
- 1 product owner decision (AuditOS vs SalesOS)
- Penetration testing vendor/team
