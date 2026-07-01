# Readiness Governance

**Status:** Active — derived from Compliance Readiness Theory (08.12) and current stabilization reports

## Key Principles

1. **Continuous readiness** — Compliance posture should be demonstrable at any point, not assembled reactively before an audit.
2. **Operational history as inspection evidence** — Normal system use should generate the artifacts needed for scrutiny; no special data extraction projects.
3. **Control evidence emerges from operations** — Approval records, evidence acceptance, access changes, AI usage boundaries, and rule versions are retained as a matter of course.
4. **Readiness is gated** — Formal gates (pilot exit, production review, security review) enforce readiness criteria before progression.
5. **AI-specific readiness** — Model versions, trusted-path outputs, and reviewer dispositions are retained and exportable for AI-related inspection.

## Current Implementation

- `docs/READINESS_GATES.md` — Formal readiness gate definitions
- `docs/PRODUCT_STATUS_MATRIX.md` — Current product status across dimensions
- `docs/PILOT_RUNBOOK.md` — Pilot operations and exit criteria
- `docs/reports/stabilization/` — Five-phase stabilization reports tracking closure of architectural, data, and operational gaps
- `docs/reports/audits/` — Full project audit and controlled pilot execution reports
- `docs/auditos/production-readiness-review.md` — Production readiness assessment
- `docs/auditos/production-readiness-action-plan.md` — Gap closure tracking
- `docs/auditos/pilot-exit-criteria.md` + `pilot-exit-scoring.md` — Pilot exit scoring framework
- `docs/SECURITY_REVIEW.md` — Security posture review
- `docs/KNOWN-LIMITATIONS.md` — Documented known limitations

## Canonical References

| Document | Location |
|----------|----------|
| Compliance Readiness Theory | `docs/theoretical-reference/08-governance-and-trust/08-12-compliance-readiness-theory.md` |
| Regulated Workflow Governance | `docs/theoretical-reference/08-governance-and-trust/08-13-regulated-workflow-governance.md` |
| Regulated Deployment Readiness | `docs/theoretical-reference/12-enterprise-deployment-and-sovereignty/12-10-regulated-deployment-readiness.md` |
| Enterprise Governance Readiness | `docs/theoretical-reference/operationalization/enterprise-governance-readiness.md` |
| Readiness Gates | `docs/READINESS_GATES.md` |
| Product Status Matrix | `docs/PRODUCT_STATUS_MATRIX.md` |
| Stabilization Phase 1-5 Reports | `docs/reports/stabilization/` |
| Full Project Audit Report | `docs/reports/audits/AQLIYA_FULL_PROJECT_AUDIT_REPORT.md` |

## Open Items

- Continuous readiness dashboard / monitoring view (not yet implemented — currently assessed via periodic stabilization reports)
- Automated readiness health checks against gate criteria (in design)
