# AQLIYA Readiness Gates

## Internal Reviewable

Minimum bar for internal team review of the repository.

- Build passes
- Architecture is visible and documented
- Known blockers are documented
- Route model is decided and documented

## Demo Ready (with governance)

Minimum bar for an external guided demo that does not misrepresent product maturity.

- All routes clarified and documented
- No broken brand assets (logos, favicons, referenced paths exist)
- Demo data is internally consistent
- No misleading CTAs pointing to nonexistent routes
- No mock/demo pages labeled as "Live" or "Production"
- Known limitations are visible in UI and docs
- Governed workspace clearly separated from demo routes

## Pilot Ready

Minimum bar for a limited production pilot with real users and data.

- Tenant enforcement on all read and write actions
- Validation results are persisted and attributable
- Publication lifecycle is complete (draft → publish with audit event)
- Audit trail covers all workflow stages
- Traceability is target-specific and label-complete
- Backup and restore are executable (not placeholder scripts)
- Clean build, typecheck, and lint baselines
- Controlled user access with role-based authorization

## Commercial Ready

Minimum bar for general availability.

- Production authentication (SSO/OAuth)
- Monitoring and alerting
- Automated backups with tested restore
- External security review / penetration test
- Data retention and deletion policies
- Deployment runbooks
- Support and escalation workflows
- Role-based access with audit logging

## Current Status

**Current gate: Production Launch Preparation**

**Dev:** Pilot-ready (operational) — `https://dev.aqliya.com`  
**Production:** ✅ **LIVE** (2026-07-09) — `https://app.aqliya.com`  
**Gate:** Launch Completed — Post-Launch Stabilization active

**Authoritative operational snapshot:** `docs/source-of-truth/AQLIYA_CURRENT_STATE.md`  
**Truth reconciliation audit:** `docs/audits/truth-reconciliation-2026-06-18/FINAL_TRUTH_RECONCILIATION.md`  
**Validation evidence:** `docs/reports/README.md` (latest: `2026-06-18-final-*.txt`)  
**Deployment baseline:** `docs/deployment/DEV_BASELINE.md`  
**Operational governance:** `docs/deployment/OBSERVABILITY_BASELINE.md`, `SECRETS_AND_ROTATION_RUNBOOK.md`, `BACKUP_RESTORE_DRILL.md`, `ACCESS_CONTROL_MATRIX.md`, `RELEASE_ROLLBACK_POLICY.md`

### Dev Environment (`dev.aqliya.com`)

| Capability | Status | Evidence |
|-----------|--------|----------|
| Public HTTPS URL | ✅ Live | `https://dev.aqliya.com` |
| TLS / ACM | ✅ Working | CloudFront + ACM certs |
| WAF + CloudFront | ✅ Working | Via `web_acl_id` (see ADR-DEPLOY-001) |
| Security headers (CSP, HSTS, XFO, etc.) | ✅ Applied | CloudFront response headers policy |
| Cache behavior segmentation | ✅ Applied | `/api/*` uncached, `/_next/*` 1y TTL |
| RDS automated backups | ✅ 1 day | Pending maintenance window |
| AWS Backup plan | ✅ Daily/weekly/monthly | Cron fixed for AWS Backup format |
| ClamAV malware scanner | ✅ Integrated | Sidecar with cpu=128, memory=256 |
| Observability (dashboards + alarms) | ✅ Configured | CloudWatch + SNS |
| Secrets management | ✅ Documented | Rotation runbook exists |
| Backup & restore drill | ✅ Documented | Procedure + checklist |
| Access control matrix | ✅ Documented | IAM roles + permissions |
| Release & rollback policy | ✅ Documented | Versioning + gates |
| Smoke tests | ✅ Baseline saved | `docs/deployments/dev-baseline-2026-07-08.txt` |

### Pilot-ready blockers (updated)

| Blocker | Status | Note |
|---------|--------|------|
| Jest integration tests (PostgreSQL) | ⬜ Open | `docker-compose.test.yml` exists |
| ESLint warnings (~240) | ⬜ Documented | Warnings not errors |
| External penetration test | ⬜ Not executed | Required for Commercial Ready |
| RDS restore drill on live | ✅ Documented | Procedure in `BACKUP_RESTORE_DRILL.md` |
| Production CI/CD pipeline | ⬜ Planned | GitHub Actions (future) |

### Operational governance documents

- `docs/deployment/DEV_BASELINE.md` — Full dev environment baseline
- `docs/deployment/OBSERVABILITY_BASELINE.md` — CloudWatch, alarms, logs, Sentry
- `docs/deployment/SECRETS_AND_ROTATION_RUNBOOK.md` — Secrets inventory, rotation, incident response
- `docs/deployment/BACKUP_RESTORE_DRILL.md` — RDS restore, Terraform state restore, drill checklist
- `docs/deployment/ACCESS_CONTROL_MATRIX.md` — IAM roles, permissions, separation of duties
- `docs/deployment/RELEASE_ROLLBACK_POLICY.md` — Release process, rollback procedures, gates
- `docs/deployment/POST_DEPLOY_SMOKE_TESTS.md` — 10-point smoke test suite
- `docs/deployment/PROD_DEPLOYMENT_CHECKLIST.md` — Production launch checklist
- `docs/deployment/INCIDENT_ROLLBACK_RUNBOOK.md` — 6 incident scenarios with fixes
- `docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md` — WAF attachment decision
