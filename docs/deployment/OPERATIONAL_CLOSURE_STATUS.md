# Operational Closure Status

**Date:** 2026-07-09 | **Program:** Overnight Execution

---

## O1: AWS Account Upgrade / Final Prod Sizing

**Status:** ⚠️ In Progress

### Verified
| Item | Value |
|------|-------|
| Current RDS class | `db.t4g.micro` (free-tier limit) |
| Current backup retention | 0 days (free-tier limit) |
| Current Multi-AZ | disabled |
| Current ECS sizing | 1024 CPU / 2048 MB (adequate) |
| Current Redis | single node (bug: env condition) |
| Target values documented in tfvars | ✅ |

### What must happen after upgrade
1. Increase `db_instance_class` → `db.t4g.medium`
2. Increase `db_allocated_storage` → 100 GB
3. Enable `db_multi_az = true`
4. Enable `db_deletion_protection = true`
5. Set `db_backup_retention_days = 30`
6. Increase `redis_node_type` → `cache.t7g.medium`

### Fixed
- Redis bug: `environment == "production"` changed to `"prod"`

### Risk if ignored
Medium — production running on free-tier equivalents. Multi-AZ and backups unavailable.

---

## O2: Terraform State Recovery

**Status:** ❌ At Risk

### Verified
| Check | Result |
|-------|--------|
| S3 state bucket `aqliya-terraform-state` | Empty (0 objects) |
| DynamoDB lock table | Exists, no locks |
| Dev Terraform state | Lost (local state deleted during backend switching) |
| Prod Terraform state | Lost (same) |
| Recovery runbook | ✅ `STATE_RECOVERY_RUNBOOK.md` exists |

### Priority resources to import (prod)
```
module.networking.aws_vpc.main → vpc-060a49d210f05d9d1
module.database.aws_db_instance.primary → aqliya-prod-db
module.compute.aws_ecs_cluster.main → aqliya-prod-cluster
module.compute.aws_ecs_service.app → aqliya-prod-service
module.compute.aws_lb.main → aqliya-prod-alb
module.networking.aws_eip.nat[*] → 3 EIPs
```

### Risk if ignored
High — Terraform cannot manage prod resources. Any apply would attempt to create duplicates.

---

## O3: GitHub Deploy Role

**Status:** ⚠️ Configured but Incomplete

### Verified
| Check | Result |
|-------|--------|
| Workflow file | ✅ `.github/workflows/deploy.yml` |
| OIDC / IAM role | ❌ `AWS_DEPLOY_ROLE_ARN` not set |
| ECR push | ✅ Works from local |
| ECS deploy | ✅ Works from local |

### What is missing
1. Create IAM role with OIDC trust to GitHub
2. Set `AWS_DEPLOY_ROLE_ARN` in GitHub secrets
3. Test pipeline end-to-end

### Risk if ignored
Medium — manual deploys are slow and error-prone.

---

## O4: Penetration Test

**Status:** ✅ Ready for Scheduling

### Verified
| Check | Result |
|-------|--------|
| Scope document | ✅ `PENETRATION_TEST_SCOPE.md` |
| WAF active | ✅ Rate limiting + AWS Managed |
| CSP headers | ✅ Present |
| HSTS | ✅ Present |
| Auth protection | ✅ All audit routes 307 |

### What is needed
1. Schedule engagement with testing team
2. Run preliminary internal scan
3. Share scope document with testers

### Risk if ignored
Low — scope is prepped, no external launch imminent.
