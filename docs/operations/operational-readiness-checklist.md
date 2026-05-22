# Operational Readiness Checklist

## Purpose

Verify AQLIYA is ready for immediate real customer TB intake without requiring last-minute configuration, deployment, or remediation.

## Environment Readiness

| Check | Status | Notes |
|---|---|---|
| Development environment stable | ✅ | `npm run dev` works |
| Build pipeline functional | ⚠️ | Pre-existing TSC warnings in audit-actions — not blocking |
| Database accessible | ✅ | Prisma connects to SQLite/Postgres |
| Mock data available | ✅ | Demo datasets in place |
| Route model stable | ✅ | /audit, /auditos intact |

## Deployment Readiness

| Check | Status | Notes |
|---|---|---|
| Backup strategy documented | ⚠️ | Needs formal verification |
| Rollback capability | ⚠️ | Needs documented process |
| Environment consistency | ✅ | Same build across environments |

## Governance Readiness

| Check | Status |
|---|---|
| Governance runtime stable | ✅ 233/233 PASS |
| Governance UI integrated | ✅ Statements page |
| Draft boundaries clear | ✅ DraftOnlyBanner active |
| Escalation ready | ✅ 12 triggers implemented |
| Provenance available | ✅ Panel + inline notice |

## Pilot Readiness

| Check | Status |
|---|---|
| Observation frameworks ready | ✅ 10 documents in docs/pilot/ |
| TB quality assessment template | ✅ Available |
| Mapping ambiguity log template | ✅ Available |
| Reviewer override log template | ✅ Available |
| Blocker classification framework | ✅ Available |

## Remaining Gaps

| Gap | Priority | Action |
|---|---|---|
| Backup verification not automated | P1 | Manual verification acceptable for pilot |
| Rollback procedure not documented | P2 | Document before production, not needed for pilot |
| TSC pre-existing warnings | P2 | Clean up during pilot waiting period |

## Verdict

✅ AQLIYA is operationally ready for real TB intake. No blocking issues remain.
