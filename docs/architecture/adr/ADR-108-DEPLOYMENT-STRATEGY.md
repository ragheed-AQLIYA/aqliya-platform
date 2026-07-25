# ADR-108: Deployment Strategy

**Status:** Accepted — Codified from repository reality  
**Date:** 2026-07-19  
**Owner:** Platform / DevOps  
**Related:** ADR-DEPLOY-001 (CloudFront WAF), ADR-102, CEAP Infra/DevOps streams  
**Note:** Live AWS apply state may still be UNKNOWN for some envs — this ADR defines the intended strategy.

---

## Context

AQLIYA deploys as containers on **AWS ECS Fargate** behind ALB, with RDS PostgreSQL, ElastiCache Redis, S3, CloudFront, WAFv2, CloudWatch, and AWS Backup (Terraform modules under `infra/terraform/`). CI builds and tests on GitHub Actions; deploy workflows push to ECR and update ECS. Promote workflow can roll back N-1 task definition. Docker Compose supports local/dev with pgvector, Redis, ClamAV. Vercel preview exists for PRs. On-Prem / Air-Gapped / Kubernetes are **not** implemented.

---

## Problem

1. Dual folders `environments/prod` and `environments/production` disagree (domain, Redis size, region notes).
2. Prod tfvars retain ACCOUNT-BLOCKED `db.t4g.micro` while docs claim production-hardened.
3. Promote uses static AWS keys; deploy uses OIDC — inconsistent secret posture.
4. Region defaults differ across workflows (`eu-north-1` vs `me-south-1`).
5. No blue/green or canary — rolling deploy only.
6. Commercial pricing must not sell On-Prem until a separate ADR + package exist.

---

## Options Considered

### Option A — Kubernetes (EKS) now

| Pros | Cons |
|------|------|
| Enterprise checkbox | Not in repo; months of work |

### Option B — Vercel-only production

| Pros | Cons |
|------|------|
| Simple | Weak fit for Prisma/workers/ClamAV/Redis HA story |

### Option C — AWS ECS modular monolith + Compose for local (selected)

| Pros | Cons |
|------|------|
| Matches Terraform + workflows | Need env canonicalization |
| CloudFront/WAF path proven (ADR-DEPLOY-001) | No B/G yet |

---

## Decision

1. **Primary production topology:** CloudFront (+ WAF via `web_acl_id` per ADR-DEPLOY-001) → ALB → ECS Fargate (Next.js standalone) → RDS Postgres + Redis + S3.
2. **IaC:** Terraform is the source of infrastructure truth. Application images from ECR.
3. **Canonical environment names:** `dev`, `staging`, `prod`. The `production` folder must be merged or clearly marked deprecated (governance P0).
4. **CI/CD:**
   - `ci.yml` — quality gate on `main`
   - `deploy.yml` / `deploy-staging.yml` — OIDC to AWS
   - `promote.yml` — staging verify → prod; **must migrate to OIDC**; N-1 rollback retained
   - `backup.yml` — scheduled backup
5. **Deploy style:** Rolling ECS deploy. Blue/green and canary require a future ADR.
6. **Secrets:** Runtime via ECS task definition / SSM — never commit `.env`. `AUTH_SECRET` required at runtime.
7. **Rate limiting / malware:** Production claims of multi-instance safety require `RATE_LIMITER=redis` and ClamAV when uploads are enabled.
8. **Non-goals:** Kubernetes, On-Prem appliance, Air-Gapped — strategic only until new ADR + evidence.
9. **Image tags:** Move to **IMMUTABLE** ECR tags (governance P1).

---

## Consequences

### Positive
- One cloud deployment story for engineering and sales (Cloud).
- Aligns runbooks with Terraform modules.

### Negative
- Rolling deploys increase blast radius vs blue/green.
- Account/free-tier limits may block honest “hardened” sizing.

---

## Migration Strategy

1. Collapse `prod` vs `production` tfvars; single domain (`app.aqliya.com` product vs marketing).
2. Align all workflow default regions with tfvars.
3. Promote → OIDC.
4. Upgrade RDS/Redis off ACCOUNT-BLOCKED sizes before unrestricted production marketing.
5. Document restore drill evidence after each drill.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Canonical env definitions | 1 per env name |
| Promote credentials | OIDC only |
| Post-deploy smoke | Pass or auto-rollback |
| On-Prem SKUs in pricing | 0 until ADR |
| ECR mutability | IMMUTABLE |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Wrong region deploy | Workflow/tfvars consistency check |
| Free-tier undersizing | Explicit ACCOUNT-BLOCKED tracking |
| Rollback failure | Smoke tests; keep prior task def |

---

## Related Components

- `infra/terraform/**`
- `Dockerfile`, `docker-compose*.yml`
- `.github/workflows/{ci,deploy,deploy-staging,promote,backup,preview}.yml`
- `docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md`
- `docs/operations/production-deployment-runbook.md`

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Root composition | `infra/terraform/main.tf` |
| Prod tfvars ACCOUNT-BLOCKED | `infra/terraform/environments/prod/terraform.tfvars` |
| Dual production folder | `infra/terraform/environments/production/` |
| WAF attachment ADR | `docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md` |
| Promote rollback | `.github/workflows/promote.yml` |
| Commercial On-Prem exclusion | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` |
