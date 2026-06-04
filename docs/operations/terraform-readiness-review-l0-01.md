# L0-01 — Terraform Readiness Review

**Status:** ✅ Gaps resolved — ready for `terraform init` + `plan`  
**Date:** 2026-06-04 (updated after Cycle 5 gap closure)  
**Cycle:** Parallel Execution Cycle 5 (Agent-Platform)  
**Scope:** `infra/terraform/` complete — all structural gaps closed

---

## Executive summary

The repository contains a **credible multi-environment IaC layout** (dev / staging / production) with modular networking, database, compute, storage, and monitoring. **Applying infrastructure is blocked** until AWS account structure, remote state, secrets, KMS, and IAM boundaries are confirmed by operations — not by application code.

**Recommendation:** Proceed with `terraform init` + `plan` in a **non-production** account first; do not apply production until the checklist below is signed off.

---

## What exists in repo

| Area | Location | Notes |
| ---- | -------- | ----- |
| Root composition | `infra/terraform/main.tf` | Wires networking → database → compute → storage → monitoring |
| Provider definitions | `infra/terraform/providers.tf` | Default (`me-south-1`), us-east-1 (ACM/CloudFront), dr (cross-region) |
| Version constraints | `infra/terraform/terraform.tf` | `required_version >= 1.6 < 2.0`, AWS provider `~> 5.80` |
| Environments | `infra/terraform/environments/{dev,staging,production}/` | Per-env `backend.tf`, `terraform.tfvars` |
| Remote state | Under `environments/*/backend.tf` | S3 `aqliya-terraform-state`, key per env, DynamoDB `aqliya-terraform-locks`, region `me-south-1`, `encrypt = true` |
| Modules | `modules/{networking,database,compute,storage,monitoring}` | VPC, RDS, ECS Fargate + ALB + Redis, S3 + CloudFront, alarms/backup |
| State bootstrap | `infra/terraform/bootstrap.sh` | Creates S3 bucket + DynamoDB table via AWS CLI (one-time per account) |
| Makefile | `infra/terraform/Makefile` | `make init/plan/apply/destroy/validate/fmt [env=dev]` |
| Route53 DNS | Within `modules/compute/` and `modules/storage/` | Alias records for root domain, `*.wildcard`, `static.` subdomain |
| WAFv2 | Within `modules/storage/` | CloudFront-associated WebACL with rate limiting (5k/5min) + AWS managed common rules |
| Documentation | `infra/terraform/README.md` | Structure, deployment plan (4 steps), validation checklist, HA/DR, prerequisites |

---

## AWS account structure (verify before apply)

| Check | Required state | Owner |
| ----- | -------------- | ----- |
| Separate accounts or strong OU isolation for dev / staging / prod | Prod must not share state bucket with dev experiments | Platform / FinOps |
| Region strategy | Primary `me-south-1`; DR references in README (`eu-central-1`) | Architecture |
| DNS / ACM | `*.aqliya.ai` certificates in `me-south-1` and `us-east-1` (CloudFront) | Ops |
| Billing alerts & cost tags | `project_name`, `environment` on all resources | FinOps |

---

## Environments

| Environment | Intended use | Apply gate |
| ----------- | ------------ | ---------- |
| dev | Engineer sandbox, smallest SKUs | First `plan` target |
| staging | Pilot parity, shorter retention | After dev plan clean |
| production | Customer-facing | LOI + backup drill + MFA policy |

**Do not** run production `apply` from CI until staging has had at least one successful plan/apply cycle and smoke validation.

---

## Secrets strategy

README expects AWS Secrets Manager paths:

- `aqliya/<env>/db-password`
- `aqliya/<env>/database-url`
- `aqliya/<env>/redis-url`
- `aqliya/<env>/auth-secret`
- `aqliya/<env>/storage-config`

| Requirement | Status in repo |
| ----------- | -------------- |
| No secrets in Terraform source | ✅ tfvars should reference ARNs/names only |
| Rotation procedure documented | ⚠️ Link to `docs/operations/backup-restore-procedure.md` and extend for Secrets Manager rotation |
| App `.env` vs runtime injection | Application uses env at deploy time — ECS task definitions must map Secrets Manager → container env |

---

## Remote state & locking

| Item | Configured in repo | Pre-apply action |
| ---- | ------------------ | ---------------- |
| S3 bucket `aqliya-terraform-state` | Referenced in backend | **Create bucket** with versioning + SSE-KMS |
| DynamoDB `aqliya-terraform-locks` | Referenced in backend | **Create table** (pay per request OK) |
| State key per env | `production/terraform.tfstate` etc. | Confirm separate keys per environment |
| Encryption | `encrypt = true` on backend | Prefer bucket default encryption KMS CMK |

---

## KMS

| Use | Recommendation |
| --- | -------------- |
| Terraform state bucket | CMK with tight key policy; separate from app data key if compliance requires |
| RDS / S3 uploads | Enable encryption at rest in modules (verify `modules/database`, `modules/storage`) |
| Secrets Manager | CMK for secret payloads in production |

**Note:** Repo does not provision KMS keys in Terraform — ops must either add a `kms` module or use account default keys with documented exception. Backup module creates its own KMS key (`modules/monitoring`).

---

## IAM boundaries

| Role | Principle |
| ---- | --------- |
| Human operators | Least privilege; no standing prod admin |
| CI deploy role | `terraform plan` in PR; `apply` only on protected branch + approval |
| ECS task role | S3 upload/read scoped to tenant prefix pattern; no `*` on secrets |
| RDS access | No public subnets; security groups from `module.networking` only |

Review `modules/compute` and `modules/database` security group rules before first apply.

---

## Intelligence Core dependencies (not Terraform)

Cycle 4 **does not** unblock A1-09. Before production AI traffic:

1. IC-09 provider hardening — complete in app layer  
2. IC-01 functional RAG + pgvector running in staging DB  
3. `FF_AI_REAL_PROVIDERS` staging smoke documented in `docs/operations/ai-intelligence-activation.md`

---

## Go / No-Go for `terraform apply`

| Gate | Status |
| ---- | ------ |
| Structural gaps resolved | ✅ All identified gaps closed (container_port var, providers, versions, bootstrap, DNS, WAF, Makefile, README) |
| `bootstrap.sh` script | ✅ Ready — creates S3 bucket + DynamoDB table |
| `terraform init` + `plan` (dev) | ⏳ Requires AWS account + bootstrap first |
| `terraform apply` (any env) | ⏳ Requires ops sign-off + bootstrap |
| Staging app smoke after infra | ⏳ After first apply cycle |

---

## Next steps (ops)

1. Run `./bootstrap.sh` to create S3 bucket + DynamoDB lock table in the target AWS account.  
2. Pre-provision Route53 zone, ACM certificates (`me-south-1` + `us-east-1`), and Secrets Manager entries per environment.  
3. Run `make init env=dev && make plan env=dev` — review output.  
4. If plan is clean, `make apply env=dev` for sandbox verification.  
5. Repeat for staging, then production with approval gates.  
6. After infra is live, re-run CI/CD pipelines from `.github/workflows/deploy.yml` and verify `post-deploy-smoke.mjs` passes.  
7. Document actual ARNs and resource IDs in internal runbook (not committed secrets).
