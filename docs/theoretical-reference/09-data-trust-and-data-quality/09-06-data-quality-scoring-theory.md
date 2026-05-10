---
title: Data Quality Scoring Theory
document_id: 09.06
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 3 - Model / Framework
related_documents: 04.01, 08.01, 09.01, 09.02, 09.03, 09.04, 09.05, 09.09, 09.12
---

# Data Quality Scoring Theory

## 1. Purpose

This document defines the scoring model AQLIYA uses to quantify data quality in a way that is useful for trust, workflow gating, and decision support.

## 2. Thesis

**Data quality scoring is a governed composite assessment that converts multiple trust dimensions into a structured, explainable signal about whether data is fit for enterprise decision use.**

The score exists to support judgment and governance, not to replace either.

## 3. Problem

Organizations often talk about data quality but lack a usable operational model. Scores are either too technical, too opaque, or too generic to influence actual workflows. In regulated environments, a single aggregate score can also be dangerous if it hides why a dataset is weak and which defect matters most.

## 4. Why Existing Systems Fail

Existing scoring models usually fail by compressing different risk types into one undifferentiated number. They do not distinguish between a minor formatting issue and a material provenance failure. They also rarely tie scoring to governance thresholds, evidence acceptance, or reviewer action.

## 5. AQLIYA Philosophy

AQLIYA uses scoring to make trust visible and actionable. The score must be decomposable, explainable, and tied to business consequences. A green score with unknown provenance is unacceptable. A lower score may still be usable for exploratory work if governance allows. The model must reflect that evidence is the unit of trust and that governance is structural, not procedural.

## 6. Core Principles

1. Scores must be explainable, not black-box composites.
2. Quality dimensions should remain visible alongside the overall score.
3. Scoring must be contextual to workflow criticality.
4. Severe failures can override an otherwise acceptable aggregate score.
5. Scores should support gates, escalation, and prioritization.
6. Historical score movement matters as much as current score.
7. Human review may adjust disposition, but not erase score history.
8. AI outputs must inherit score-derived constraints.

## 7. Key Concepts

- **Composite Score:** Overall quality signal derived from multiple dimensions.
- **Dimension Score:** Component score such as reliability, completeness, provenance, lineage integrity, timeliness, or consistency.
- **Blocking Defect:** A failure severe enough to constrain use regardless of aggregate score.
- **Quality Profile:** The full dimensional explanation behind the score.
- **Score Band:** Interpretable range such as trusted, conditional, uncertain, or blocked.

## 8. Operational Implications

1. Teams need defined thresholds for each workflow type.
2. Score changes should trigger operational review when material.
3. Customers should be onboarded with clear expectations about score-driven gates.
4. Re-ingestion and remediation should be measured by score movement.
5. Quality score analytics should inform recurring source and process improvement.

## 9. Product Implications

1. Users should see both the overall band and the dimension breakdown.
2. Product workflows must explain what must improve for a blocked score to become usable.
3. Reviewer queues should prioritize high-risk low-score datasets.
4. Evidence and signal surfaces should display the score profile they depend on.
5. Product design should avoid score theater by preventing simplistic green/red interpretations.

## 10. Architecture Implications

1. Scoring requires a rule-driven and versioned scoring engine.
2. Dimension inputs must be traceable to concrete checks and source states.
3. The architecture should support recalculation when source, lineage, or provenance changes.
4. Score results should be stored as structured documents, not only as scalar values.
5. Services across trust, workflow, and intelligence layers must query the same scoring truth.

## 11. Governance Implications

Governance determines which score bands can support which workflow actions. It also defines when blocking defects supersede aggregate scores and who may authorize exceptions.

## 12. AI / Intelligence Implications

AI should use the dimensional quality profile, not only the aggregate score. For example, low completeness may constrain anomaly interpretation differently from low provenance. Model outputs must carry score-aware confidence and workflow limits.

## 13. UX Implications

Scoring UX must emphasize interpretability. Reviewers should understand why a dataset is conditional or blocked and what practical consequences follow. The score should guide action, not become an abstract badge.

## 14. Commercial Implications

Quality scoring helps enterprise buyers see that AQLIYA does more than ingest records. It operationalizes data trust in a measurable way, which supports premium positioning against generic file processing or AI wrappers.

## 15. Anti-Patterns

1. **Single Number Theater.** Reducing trust to one opaque score.
2. **Equal Weight Fallacy.** Treating all defect types as equally important.
3. **Static Scoring.** Failing to recompute when data conditions change.
4. **Score Without Consequence.** Displaying a score that does not affect workflow behavior.
5. **Cosmetic Greenwashing.** Allowing a passing aggregate to hide a blocking trust defect.

## 16. Examples

**Example 1:** A dataset scores highly on completeness and consistency but poorly on provenance. The aggregate remains conditional and cannot support accepted evidence until provenance is resolved.

**Example 2:** A re-ingested trial balance improves mapping integrity and completeness, moving its score band from uncertain to trusted and releasing blocked recommendations.

**Example 3:** A stale but otherwise high-quality dataset is downgraded because timeliness is critical for the current review workflow.

## 17. Enterprise Impact

1. Clearer trust communication.
2. More consistent workflow gating.
3. Faster remediation prioritization.
4. Better AI confidence calibration.
5. Stronger auditability of trust decisions.

## 18. Long-Term Strategic Importance

Data quality scoring is the operational bridge between doctrine and execution. It lets AQLIYA turn trust philosophy into consistent system behavior without drifting into arbitrary reviewer judgment or generic analytics.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 04.01 | Financial Intelligence Thesis | Financial signals depend on quality-scored data |
| 08.01 | Governance and Trust Thesis | Governance defines the consequences of score bands |
| 09.01 | Data Trust Theory | Scoring operationalizes data trust |
| 09.02 | Source Data Reliability Theory | Reliability is a scoring dimension |
| 09.03 | Data Completeness Theory | Completeness is a scoring dimension |
| 09.04 | Data Lineage Theory | Lineage integrity influences trust scoring |
| 09.05 | Data Provenance Theory | Provenance sufficiency influences trust scoring |
| 09.09 | Data Confidence Model | Confidence consumes quality scoring outputs |
| 09.12 | Garbage-In Risk Model | Scoring is an early-warning control against garbage-in risk |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed for doctrinal consistency and promoted to Reviewed |
