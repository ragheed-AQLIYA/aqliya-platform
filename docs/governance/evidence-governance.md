# Evidence Governance

**Status:** Active — derived from Core Doctrine v1.0

## Key Principles

1. **Data is not evidence by default** — Candidate evidence and accepted evidence are distinct states; promotion requires explicit human acceptance.
2. **Evidence sufficiency is contextual** — What counts as sufficient depends on the decision or assertion being supported.
3. **Version integrity** — Evidence version changes can invalidate downstream trust; superseded evidence triggers reassessment of linked findings.
4. **Acceptance is an accountable act** — Every evidence acceptance is attributed to a named reviewer and recorded in the audit trail.
5. **Traceability to source and usage** — Every evidence object carries provenance metadata and links to the findings/decisions it supports.

## Current Implementation

- `docs/06-evidence-and-review/` — Evidence requirements, account-area evidence maps, review queue methodology, findings classification, approval checklist, publication package
- Evidence lifecycle is modeled as candidate → accepted → superseded — no direct AI promotion to accepted
- Evidence objects carry source provenance, acceptance state, and linked finding context

## Canonical References

| Document | Location |
|----------|----------|
| Evidence Governance Doctrine | `docs/theoretical-reference/08-governance-and-trust/08-09-evidence-governance-doctrine.md` |
| Evidence Requirements | `docs/06-evidence-and-review/01-evidence-requirements.md` |
| Evidence by Account Area | `docs/06-evidence-and-review/02-evidence-by-account-area.md` |
| Evidence Lifecycle Framework | `docs/theoretical-reference/07-workflow-intelligence/07-06-evidence-lifecycle-framework.md` |
| Data Provenance Theory | `docs/theoretical-reference/09-data-trust-and-data-quality/09-05-data-provenance-theory.md` |
| Evidence-Centered Design Index | `docs/theoretical-reference/concept-indexes/evidence-centered-design-index.md` |
| Evidence-Backed AI Theory | `docs/theoretical-reference/10-human-ai-operating-model/10-10-evidence-backed-ai-theory.md` |
| Evidence Traceability Gateway | `docs/theoretical-reference/gateways/evidence-traceability-gateway.md` |

## Open Items

- Automated sufficiency scoring against assertion requirements (not yet implemented)
- Bulk acceptance with object-level inspection logic (under discussion)
