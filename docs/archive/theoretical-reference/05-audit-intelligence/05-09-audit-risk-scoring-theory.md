---
title: Audit Risk Scoring Theory
document_id: 05.09
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents:
  - 05.01 AuditOS Thesis
  - 05.02 Foundational Intelligence
  - 05.05 Audit Engagement Model
  - 05.06 Findings Intelligence Theory
  - 05.08 Sampling Intelligence Theory
  - 05.10 Explainable Audit Intelligence
  - 05.14 Audit Governance Model
---

# Audit Risk Scoring Theory

## 1. Purpose

Define the theoretical framework for how audit risk is assessed, scored, and applied across the AQLIYA system — from engagement planning through evidence evaluation to opinion formation. Risk scoring is the lens through which all audit decisions are calibrated.

## 2. Thesis

Audit risk is not a single number — it is a multi-dimensional evaluation of inherent risk, control risk, and detection risk that must be assessed at the engagement, assertion, and finding level. Audit Risk Scoring provides a structured, transparent, and auditable framework for risk assessment that is informed by intelligence from past engagements and continuously refined by new evidence.

## 3. Problem

Risk assessment in audit is often performed informally or using simplistic scoring matrices. Common problems include:
- Risk ratings that are subjective and inconsistent across auditors
- Single-dimensional scores that collapse inherent and control risk
- Risk assessments that are performed once at planning and never updated
- No systematic use of historical data to calibrate risk assessments
- Risk scoring that is not linked to evidence or findings

## 4. Why Existing Systems Fail

Current audit tools provide risk score fields but no risk scoring framework. They fail because:
- They store the score but not the rationale
- They offer no integration with historical risk data for calibration
- They cannot update risk scores as new evidence emerges
- They do not support multi-dimensional risk models
- They provide no audit trail for risk score changes

## 5. AQLIYA Philosophy

Risk is not a label — it is a dynamic evaluation that changes as understanding deepens. AQLIYA treats risk scoring as a continuous intelligence activity: initial assessments are informed by foundational intelligence and historical patterns; assessments are updated as evidence is collected and evaluated; final risk positions are anchored to the evidence in EDI. The human auditor owns every risk assessment; AI provides the analytical foundation, historical comparisons, and anomaly detection. No dashboard or chatbot replaces the auditor's risk judgement.

## 6. Core Principles

- **Multi-dimensional**: Risk is assessed across inherent, control, and detection dimensions
- **Evidence-anchored**: Every risk score is linked to the evidence that supports it
- **Dynamic**: Risk scores are updated as new evidence emerges
- **Calibrated**: Scores are informed by historical patterns and foundational intelligence
- **Transparent**: Risk scoring rationale is documented and auditable
- **Granular**: Risk is assessed at engagement, assertion, and finding level

## 7. Key Concepts

- **Inherent Risk**: The risk of material misstatement before considering controls
- **Control Risk**: The risk that controls will not prevent or detect a material misstatement
- **Detection Risk**: The risk that audit procedures will not detect a material misstatement
- **Audit Risk**: The product of inherent, control, and detection risk
- **Risk Score**: The multi-dimensional assessment at a given level
- **Risk Driver**: The factors that influence the risk assessment
- **Risk Calibration**: The process of aligning risk scores with historical patterns
- **Risk Update Event**: A trigger that causes a risk score to be re-evaluated

## 8. Operational Implications

- Risk assessment is not a one-time planning activity — it is continuously updated
- Every risk score must be supported by documented rationale
- Risk score changes must be logged with the triggering event and rationale
- Risk scores at the assertion level drive evidence collection decisions
- Risk scores at the finding level influence severity and recommendation urgency

## 9. Product Implications

- The product must support multi-dimensional risk models configurable per organisation
- Risk scoring must be integrated with engagement planning, not a separate screen
- Risk score visualisation must show the composition (inherent, control, detection)
- Risk updates must be triggered by evidence collection, finding creation, and external events
- Risk reports must show score history and rationale for changes

## 10. Architecture Implications

- Risk scoring is a domain service, not a standalone context — it is invoked across the system
- Risk scores are stored as versioned aggregates linked to their subject (engagement, assertion, finding)
- Risk update events are emitted for governance tracking and intelligence feedback
- Risk calibration draws on Foundational Intelligence (05.02) for historical patterns
- Integration with all engagement contexts for risk-driven decisions

## 11. Governance Implications

- Risk scoring rationale must be auditable — every score has a traceable basis
- Governance policies can set risk thresholds that trigger mandatory review
- Risk score changes must be approved according to governance rules
- Risk calibration against historical data is subject to governance oversight
- Risk assessments for regulated engagements must follow prescribed risk models

## 12. AI / Intelligence Implications

- AI recommends initial risk scores based on engagement context and historical patterns
- AI detects risk score anomalies — scores that deviate significantly from similar engagements
- AI flags evidence that conflicts with current risk assessments
- AI does not set risk scores autonomously — every score is set or approved by the auditor
- AI learns from risk score adjustments to improve future recommendations

## 13. UX Implications

- Risk scoring must be intuitive without being simplistic
- Multi-dimensional risk must be visualised clearly (e.g., risk heat maps at assertion level)
- Risk updates must be surfaced proactively without disrupting workflow
- Risk rationale entry must be quick to encourage documentation
- The UX must communicate that risk is dynamic, not static

## 14. Commercial Implications

- Defensible risk scoring reduces regulatory exposure
- Multi-dimensional risk models differentiate from single-score competitors
- Risk calibration services (benchmarking against industry patterns) become a consulting offering
- Organisations with complex risk profiles benefit most from structured risk scoring
- No dashboard upsell — value is in transparent, evidence-anchored risk assessment

## 15. Anti-Patterns

- **Single-number risk**: Collapsing multi-dimensional risk into one score loses critical information
- **Set-and-forget**: Assigning risk scores at planning and never updating them
- **Score without rationale**: A risk score without supporting evidence or reasoning
- **Risk as label**: Using "High/Medium/Low" without the underlying analysis
- **Inconsistent calibration**: Different auditors assigning different scores to the same risk
- **AI risk autonomy**: Letting AI determine risk scores without human approval
- **Risk score inflation**: Assigning high risk to everything to appear thorough

## 16. Examples

- **Engagement-level risk**: New procurement engagement. Inherent risk assessed as High (complex vendor landscape, high transaction volume, recent regulatory changes). Control risk assessed as Moderate (new ERP system, but limited testing). Detection risk assessed as Low (strong analytics capabilities). Overall audit risk assessed as Moderate. Evidence collection during engagement reveals control gaps; control risk updated to High.
- **Assertion-level risk**: Revenue recognition assertion. Inherent risk High (complex revenue recognition criteria). Control risk Low (strong automated controls with monitoring). Detection risk Moderate (sampling limitations). Assertion risk drives increased sample size for revenue testing.

## 17. Enterprise Impact

- Consistent risk assessment across engagements improves risk coverage
- Dynamic risk scoring ensures resources are allocated to highest-risk areas
- Risk calibration from historical data reduces assessment bias
- Audit trail for risk scores improves governance and regulatory response
- Aggregated risk intelligence enables enterprise-level risk insights

## 18. Long-Term Strategic Importance

Risk scoring is the calibration mechanism for all of AQLIYA's intelligence. Without a rigorous risk scoring framework, intelligence cannot be properly weighted, prioritised, or acted upon. As the risk corpus grows, AQLIYA's ability to calibrate risk assessments against actual outcomes compounds — making each engagement's risk assessment more accurate than the last. This is a critical component of the FI moat and a key differentiator from static risk matrix tools.

## 19. Related Documents

- **05.01 AuditOS Thesis** — Risk-driven audit is a core thesis principle
- **05.02 Foundational Intelligence** — Historical risk patterns inform calibration
- **05.05 Audit Engagement Model** — Risk scoring drives engagement scope and decisions
- **05.06 Findings Intelligence Theory** — Finding severity is influenced by risk scoring
- **05.08 Sampling Intelligence Theory** — Sampling risk is a component of detection risk
- **05.10 Explainable Audit Intelligence** — Risk scoring rationale must be explainable
- **05.14 Audit Governance Model** — Governance policies reference risk thresholds

## 20. Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full 20-section document defining Audit Risk Scoring Theory |
| 0.2 | 2026-05-08 | Founding Team | Status promoted to Reviewed — frontmatter and metadata update |
