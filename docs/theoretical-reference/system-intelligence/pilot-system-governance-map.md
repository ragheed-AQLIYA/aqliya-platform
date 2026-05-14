# Pilot System — Governance Map

Maps pilot engagement activities to governance rules drawn from Part 08 (Governance), Part 05 (Audit), and Part 15 (Responsible Intelligence).

## Pilot Activity Governance Matrix

| Pilot Activity | Governance Rule | Doctrine Source | Risk Control |
|---|---|---|---|
| Pilot Scoping | Scope must be documented, signed, and time-boxed | Part 08 §8.2 — Engagement Governance | Scope creep triggers re-approval; automatic halt at time expiry |
| Client Onboarding | Client must acknowledge Data Trust terms and evidence handling procedures | Part 15 §15.3 — Informed Participation | No data ingestion until acknowledgment is logged; onboarding checklist must be complete |
| Data Ingestion | Every data source must have a Chain of Custody record | Part 05 §5.2 — Chain of Custody | Ingestion halted if provenance metadata missing; quarantine unverifiable data |
| Model Deployment | Model must pass Responsible Intelligence checklist before deployment | Part 15 §15.5 — Responsible Deployment | Gating check: fairness, transparency, accountability criteria must be met |
| Evidence Collection | All pilot outputs are evidence-grade and must be retained per Part 05 | Part 05 §5.6 — Evidence Lifecycle | Auto-retention with expiry; reviewer may flag for extended retention |
| Milestone Review | Milestone must be reviewed by independent governance body | Part 08 §8.5 — Milestone Governance | Failure to meet milestone triggers remediation plan; critical failures halt pilot |
| Client Feedback | Feedback must be logged, attributed, and anonymised for audit | Part 08 §8.7 — Stakeholder Feedback | Feedback cannot be deleted; only marked as "addressed" with resolution note |
| Pilot Exit / Conversion | Exit report must include evidence summary, governance log, and recommendation | Part 08 §8.9 — Engagement Close | Conversion requires separate commercial agreement; cannot auto-renew without new scope |

## Risk Control Hierarchy

```
Part 15 (Responsible Intelligence)
    │
    ▼
Part 08 (Governance) — defines rules and gates per activity
    │
    ▼
Part 05 (Audit) — defines evidence, retention, and verification
    │
    ▼
Pilot Activity — executed within governance boundaries
    │
    ▼
Risk Control — preventive (halt/gate) or detective (flag/auto-retain)
```

## Governance Body Involvement

| Governance Body | Pilot Stage | Responsibility |
|---|---|---|
| Pilot Review Board | Scoping, Milestone Review, Exit | Approves scope, reviews milestones, signs off on exit |
| Responsible Intelligence Committee | Model Deployment | Approves deployment readiness checklist |
| Data Trust Authority | Data Ingestion, Client Onboarding | Validates data provenance and client acknowledgment |
| AuditOS | All stages | Provides evidence-grade logging, alerts, and chain of custody |

## Human Review Boundaries

| Boundary | Activity | Human Role | Fallback |
|---|---|---|---|
| Re-scope approval | Scoping creep | Pilot Review Board approves amended scope | Pilot halts if not approved within 5 business days |
| Data quarantine decision | Data Ingestion | Data Steward decides fate of unverifiable data | Data destroyed if no decision within 10 business days |
| Model deployment gate | Model Deployment | Responsible Intelligence Committee signs off | Deployment blocked; pilot may continue without model |
| Pilot termination | Any critical failure | Pilot Review Board decides terminate or remediate | Automatic termination if no decision within SLA |
