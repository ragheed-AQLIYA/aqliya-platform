# AI Governance

**Status:** Active — derived from Core Doctrine v1.0

## Key Principles

1. **AI is assistive, never autonomous** — AI may suggest, extract, summarize, rank, and draft, but may not approve evidence, finalize findings, issue conclusions, or make professional judgments.
2. **Evidence-backed outputs** — All governed AI outputs must carry provenance metadata: model version, input snapshot, explanation artifacts, and reviewer disposition.
3. **Human accountability is never displaced** — Every material decision requires a named human reviewer.
4. **No black-box AI in trusted paths** — AI operating on governed workflow stages must be explainable and auditable.
5. **AI Control Boundary** — High-risk AI capabilities are feature-flagged and policy-enforced; low-trust drafting paths are segregated from governed decision paths.

## Current Implementation

- `docs/archive/legacy-numbered/07-ai-governance/` — Product-level AI governance docs (role/limitations, confidence scoring, explainability, audit trail, human review requirement, professional disclaimer)
- Models operate inside governed workflows — chat bypass surfaces do not exist
- AI outputs are candidates until accepted by a human
- Model version, input context, and explanation artifacts retained per output

## Canonical References

| Document | Location |
|----------|----------|
| AI Governance Doctrine | `docs/theoretical-reference/08-governance-and-trust/08-10-ai-governance-doctrine.md` |
| AI Role & Limitations | `docs/archive/legacy-numbered/07-ai-governance/01-ai-role-and-limitations.md` |
| Human Review Requirement | `docs/archive/legacy-numbered/07-ai-governance/02-human-review-requirement.md` |
| Confidence Scoring | `docs/archive/legacy-numbered/07-ai-governance/03-confidence-scoring.md` |
| Explainability Policy | `docs/archive/legacy-numbered/07-ai-governance/04-explainability-policy.md` |
| Audit Trail Policy | `docs/archive/legacy-numbered/07-ai-governance/05-audit-trail-policy.md` |
| Professional Disclaimer | `docs/archive/legacy-numbered/07-ai-governance/06-professional-disclaimer.md` |
| Black-Box AI Rejection Doctrine | `docs/theoretical-reference/10-human-ai-operating-model/10-11-black-box-ai-rejection-doctrine.md` |
| Responsible Intelligence Doctrine | `docs/theoretical-reference/15-responsible-intelligence/15-01-responsible-intelligence-doctrine.md` |
| No Autonomous Audit Decision Rule | `docs/theoretical-reference/15-responsible-intelligence/15-04-no-autonomous-audit-decision-rule.md` |
| AI Boundaries Gateway | `docs/theoretical-reference/gateways/ai-governance-gateway.md` |

## Open Items

- Granular AI capability feature flags for tenant-level policy configuration (not yet implemented)
