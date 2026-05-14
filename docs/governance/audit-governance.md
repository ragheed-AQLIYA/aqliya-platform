# Audit Governance

**Status:** Active — derived from Audit Governance Model (05.14)

## Key Principles

1. **Governance is structural** — Rules are encoded in the system, not in policy documents; the system enforces governance, humans govern the rules.
2. **Immutable trail** — Every action touching audit work is recorded immutably; audit events retain business meaning beyond raw logs.
3. **Preventive by design** — Governance prevents violations (blocked transitions) rather than merely detecting them after the fact.
4. **Rule-based enforcement** — Governance rules are explicit, machine-evaluable, and versioned; rule changes are themselves auditable.
5. **Continuous monitoring** — Governance compliance is evaluated on every state transition, not sampled periodically.

## Current Implementation

- `docs/03-audit-methodology/` — Audit preparation scope, risk framework, red flags, reviewer observations, missing-info checklist, approval model
- `docs/04-financial-statements/` + `docs/05-notes-system/` — Governed statement/notes generation with review checklists
- Engagement closure is blocked unless all findings are approved, evidence gaps resolved, report reviewed, governance breach count zero

## Canonical References

| Document | Location |
|----------|----------|
| Audit Governance Model | `docs/theoretical-reference/05-audit-intelligence/05-14-audit-governance-model.md` |
| Auditability Doctrine | `docs/theoretical-reference/08-governance-and-trust/08-03-auditability-doctrine.md` |
| Audit Engagement Model | `docs/theoretical-reference/05-audit-intelligence/05-05-audit-engagement-model.md` |
| Audit Review Lifecycle | `docs/theoretical-reference/05-audit-intelligence/05-12-audit-review-lifecycle.md` |
| Audit Quality Assurance Model | `docs/theoretical-reference/05-audit-intelligence/05-13-audit-quality-assurance-model.md` |
| Audit Preparation Scope | `docs/03-audit-methodology/01-audit-preparation-scope.md` |
| Review & Risk Framework | `docs/03-audit-methodology/02-review-risk-framework.md` |
| Findings Intelligence Theory | `docs/theoretical-reference/05-audit-intelligence/05-06-findings-intelligence-theory.md` |
| Audit Methodology Gateway | `docs/theoretical-reference/gateways/audit-methodology-gateway.md` |

## Open Items

- Dedicated governance service / rule engine for domain-layer enforcement (architectural intent, not yet implemented)
- Governance breach notification routing and escalation workflows (in design)
