# Enterprise Ops Verification Checklist — Phase D

**Purpose:** Handoff for staging/production operator to close remaining 30 points of enterprise readiness.  
**Status:** Not executed locally (2026-06-18) — terraform CLI absent; no cloud credentials in dev session.

---

## Prerequisites

- AWS CLI configured for `me-south-1` (primary) and `eu-central-1` (DR)
- Terraform ≥ 1.5 installed
- Access to ECS, RDS, ElastiCache, CloudWatch, S3

---

## Checklist

| # | Check | Command / action | Pass criteria | Evidence path |
|---|-------|------------------|---------------|---------------|
| 1 | Terraform validate | `cd infra/terraform && terraform init && terraform validate` | Exit 0 | `docs/reports/YYYY-MM-DD-terraform-validate.txt` |
| 2 | ECS service healthy | `aws ecs describe-services --cluster aqliya-prod --services aqliya-app` | `runningCount >= desiredCount` | screenshot or JSON in reports |
| 3 | RDS Multi-AZ | `aws rds describe-db-instances` | MultiAZ=true, deletion protection | reports |
| 4 | Redis reachable | ElastiCache describe + app health | Rate limiter redis mode if multi-task | reports |
| 5 | Backup retention | RDS backup window + 30-day retention | Matches runbook | reports |
| 6 | Restore drill | `scripts/platform/restore-drill.mjs` on staging RDS | Row-count spot-check PASS | JSON report in reports |
| 7 | Post-deploy smoke | `scripts/post-deploy-smoke.mjs --base-url https://staging.aqliya.com` | All checks green | reports |
| 7a | Staging DNS | `node scripts/platform/staging-probe.mjs` | DNS + health 2xx | **FAIL 2026-06-19:** staging.aqliya.com ENOTFOUND |
| 7b | Production health | `STAGING_BASE_URL=https://aqliya.com node scripts/platform/staging-probe.mjs` | HTTP 200 + DB check | **PASS 2026-06-19** — see `docs/reports/2026-06-19-production-probe.txt` |
| 8 | ClamAV | `SCANNER_PROVIDER=clamav` + daemon | Upload scan PASS | ops log |
| 9 | Rate limiter | `RATE_LIMITER=redis` in ECS task def | No in-memory drift across tasks | task def export |
| 10 | CloudWatch alarms | Alarm state OK for CPU, memory, 5xx | No INSUFFICIENT_DATA on critical | reports |

---

## References

- `docs/operations/production-deployment-runbook.md` (v1.3+)
- `docs/operations/ha-dr-plan.md`
- `infra/terraform/README.md`
- `.github/workflows/deploy.yml`

---

## After completion

1. Save all outputs to `docs/reports/YYYY-MM-DD-enterprise-ops-*`
2. Update `AQLIYA_CURRENT_STATE.md` enterprise ops score
3. Bump overall score if all critical checks pass (target: 78–82/100)
