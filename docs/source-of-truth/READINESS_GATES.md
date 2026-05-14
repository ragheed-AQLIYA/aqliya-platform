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

**Current gate: Pilot-ready candidate**

The repository meets the Internal Reviewable, Demo-ready with governance, and Pilot-ready candidate bars. See `AQLIYA_STABILIZATION_AND_ARCHITECTURE_PLAN.md` for the full gap analysis and prioritized roadmap.

Pilot-ready blockers:
- Jest integration tests require PostgreSQL (Docker Compose setup exists — `docker-compose.test.yml`)
- Pre-existing ESLint warnings/errors remain in pre-existing shared lib code (count varies by lint run; documented in `PRODUCT_STATUS_MATRIX.md`)
- Backup not automated (manual only; scheduling guidance exists — `docs/operations/backup-schedule.md`)
- Production malware scanner not integrated (fail-closed blocks uploads)
- No external penetration test executed

Pilot hardening documentation exists:
- `docs/SECURITY_REVIEW.md` — Internal security review
- `docs/PILOT_RUNBOOK.md` — Pilot operations guide
- `docs/operations/backup-schedule.md` — Backup scheduling guidance
