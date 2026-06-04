# Cycle 6 — Enterprise Readiness Evidence Bundle

**Program:** Track A (Cursor / Program Director)  
**Baseline commit:** `022b1d7` (Phase 3 complete; bridge @ `4d24afd`)  
**Plan:** `docs/operations/parallel-execution-cycle-6-closure-plan.md` v1.1

## Index

| Report | Agent | Gate |
| ------ | ----- | ---- |
| [STAGING_PGVECTOR_ACTIVATION_REPORT.md](./STAGING_PGVECTOR_ACTIVATION_REPORT.md) | A | G6-1 |
| [LIVE_SMOKE_REPORT.md](./LIVE_SMOKE_REPORT.md) | A | G6-2 |
| [CROSS_TENANT_VALIDATION_REPORT.md](./CROSS_TENANT_VALIDATION_REPORT.md) | B | G6-3 |
| [TENANT_ISOLATION_RISK_REGISTER.md](./TENANT_ISOLATION_RISK_REGISTER.md) | B | G6-3 |
| [TENANT_REMEDIATION_PROPOSALS.md](./TENANT_REMEDIATION_PROPOSALS.md) | B | advisory |
| [INFRASTRUCTURE_READINESS_REPORT.md](./INFRASTRUCTURE_READINESS_REPORT.md) | C | G6-4 |
| [BACKUP_RESTORE_DRILL_EVIDENCE.md](./BACKUP_RESTORE_DRILL_EVIDENCE.md) | C | G6-4 |
| [ROLLBACK_READINESS_ASSESSMENT.md](./ROLLBACK_READINESS_ASSESSMENT.md) | C | G6-4 |
| [INFRA_GAP_LIST.md](./INFRA_GAP_LIST.md) | C | G6-4 |
| [L6_READINESS_SCORECARD.md](./L6_READINESS_SCORECARD.md) | E | G6-6 |
| [CERTIFICATION_BLOCKERS.md](./CERTIFICATION_BLOCKERS.md) | E | G6-6 |
| [PENTEST_PREP_PACKET.md](./PENTEST_PREP_PACKET.md) | E | enterprise |
| [COMPLIANCE_CHECKLIST.md](./COMPLIANCE_CHECKLIST.md) | E | enterprise |
| [REMOTE_STAGING_PROBE.md](./REMOTE_STAGING_PROBE.md) | A | DNS / remote |
| [POST_DEPLOY_SMOKE.md](./POST_DEPLOY_SMOKE.md) | A | local app |
| [BACKUP_RESTORE_DRILL_EVIDENCE.md](./BACKUP_RESTORE_DRILL_EVIDENCE.md) | C | G6-4 |

**Director close:** `docs/operations/parallel-execution-cycle-2026-06-06-cycle-6-close.md`

**One-command local replay:** `npm run cycle6:full-run`  
**Remote staging (operator):** `npm run cycle6:remote-smoke`

## Cycle 6 status

| Gate | Status |
| ---- | ------ |
| G6-0 | PASS |
| G6-1 | PASS (local `:5435` full proxy); **remote staging pending** |
| G6-2 | PASS (local proxy + `cycle6:smoke:audit-ai`); **remote URL pending** |
| G6-7 | BLOCKED — remote `staging.aqliya.ai` + live providers not run |

**Scripts:** `npm run cycle6:smoke:audit-ai` · `docker-compose.staging-local.yml`
