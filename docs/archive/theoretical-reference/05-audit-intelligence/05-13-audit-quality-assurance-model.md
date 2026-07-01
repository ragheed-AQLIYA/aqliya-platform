---
title: Audit Quality Assurance Model
document_id: 05.13
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents:
  - 05.01 AuditOS Thesis
  - 05.03 EDI Infrastructure
  - 05.05 Audit Engagement Model
  - 05.06 Findings Intelligence Theory
  - 05.07 Evidence Intelligence Theory
  - 05.12 Audit Review Lifecycle
  - 05.14 Audit Governance Model
---

# Audit Quality Assurance Model

## 1. Purpose

Define the structured model by which audit quality is defined, measured, monitored, and improved within the AQLIYA system. Quality assurance is not a separate function — it is embedded in the architecture of how audit work is performed, reviewed, and governed.

## 2. Thesis

Audit quality is not a score — it is a structural property of how audit work is performed. The Audit Quality Assurance Model (AQAM) embeds quality criteria into every phase of the engagement lifecycle: evidence must meet quality thresholds, findings must be supported by sufficient evidence, risk assessments must be calibrated, and reports must accurately reflect the underlying intelligence. Quality is assured by the system's architecture, not by after-the-fact inspection.

## 3. Problem

Audit quality is typically measured through periodic internal or external inspections. Common problems include:
- Quality is assessed after the engagement is complete — too late to influence outcomes
- Quality criteria are subjective and inconsistently applied
- Quality measurement is manual, sampling-based, and resource-intensive
- Quality findings are not systematically linked to process improvements
- There is no continuous quality monitoring — only periodic snapshots

## 4. Why Existing Systems Fail

Current tools treat quality as an external assessment. They fail because:
- They provide no embedded quality criteria within the engagement workflow
- They cannot monitor quality metrics continuously across engagements
- They offer no integration between quality findings and engagement data
- They rely on manual quality reviews with no intelligence layer
- They provide no systematic feedback loop for quality improvement

## 5. AQLIYA Philosophy

Quality is not inspected in — it is designed in. AQLIYA embeds quality criteria into every stage of the engagement model: evidence must meet minimum quality standards before it can be linked to findings, findings must meet structural requirements before they can be included in reports, and reports must be consistent with engagement data before they can be issued. AI assists by monitoring quality metrics, flagging potential quality issues, and identifying patterns for improvement. No chatbot determines quality — quality is a structural property verified by human reviewers.

## 6. Core Principles

- **Embedded quality**: Quality criteria are part of the engagement workflow, not a separate assessment
- **Continuous monitoring**: Quality metrics are tracked throughout the engagement lifecycle
- **Evidence-based quality**: Quality assessments are anchored to evidence and criteria
- **Systematic improvement**: Quality data drives process and system improvements
- **Transparent metrics**: Quality definitions and measurements are visible and auditable
- **Human-verified**: Quality is ultimately verified by human review, not automated scoring

## 7. Key Concepts

- **Quality Dimension**: An aspect of quality (accuracy, completeness, timeliness, relevance, reliability)
- **Quality Criterion**: A specific, measurable standard for a quality dimension
- **Quality Metric**: The measured value against a quality criterion
- **Quality Threshold**: The minimum acceptable value for a quality metric
- **Quality Indicator**: A visible signal of quality status (green, amber, red)
- **Quality Review**: A structured assessment of quality against criteria
- **Quality Improvement Cycle**: The process of using quality data to drive improvement
- **Quality Profile**: The aggregate quality assessment for an engagement or work product

## 8. Operational Implications

- Quality criteria are defined at engagement type level and enforced by the system
- Quality metrics are collected automatically as part of engagement execution
- Quality thresholds that are breached trigger alerts and review requirements
- Quality reviews are conducted at defined points in the engagement lifecycle
- Quality data is retained for trend analysis and improvement

## 9. Product Implications

- The product must display quality indicators at engagement and work product level
- Quality criteria configuration must be accessible to quality management
- Quality reports must show metrics, trends, and improvement actions
- Quality alerts must be actionable, not just informational
- Quality review workflow must be integrated with the engagement lifecycle

## 10. Architecture Implications

- Quality is a cross-cutting concern, not a bounded context — quality services operate across all contexts
- Quality criteria are stored as configurable rules evaluated by the domain layer
- Quality metrics are collected via domain events emitted by all engagement contexts
- Quality profiles are computed read models stored in EDI
- Integration with Review Lifecycle (05.12) for quality review workflow

## 11. Governance Implications

- Quality thresholds are subject to governance policy
- Quality breaches must be escalated according to governance rules
- Quality review outcomes are part of the engagement record
- Governance oversight includes review of quality trends and improvement actions
- Quality metrics for regulated engagements must meet prescribed standards

## 12. AI / Intelligence Implications

- AI monitors quality metrics continuously across active engagements
- AI flags quality anomalies — metrics that deviate from historical patterns
- AI suggests quality improvements based on analysis of quality data
- AI identifies quality risk — engagements or work products that may not meet quality thresholds
- AI does not override quality thresholds or approve quality overrides — those remain human decisions

## 13. UX Implications

- Quality indicators must be visible without being distracting
- Quality alerts must be specific and actionable, not generic warnings
- Quality metric trends must be visually accessible
- Quality review must be integrated into existing workflows, not a separate system
- The UX must communicate that quality is embedded, not bolted on

## 14. Commercial Implications

- Demonstrable audit quality is a competitive differentiator
- Quality analytics (trends, benchmarks) become a consulting offering
- Organisations with quality deficiencies benefit from systematic quality improvement
- Quality assurance reduces regulatory risk and liability exposure
- No dashboard upsell — quality is embedded in the engagement, not displayed on a screen

## 15. Anti-Patterns

- **Quality as inspection**: Waiting until after engagement completion to assess quality
- **Quality theatre**: Displaying quality metrics that are not tied to actual criteria
- **Single quality score**: Collapsing multi-dimensional quality into one number
- **Threshold blindness**: Not updating thresholds as quality standards evolve
- **Quality metric inflation**: Measuring what is easy rather than what matters
- **AI quality judgement**: Letting AI determine quality outcomes autonomously
- **Quality as blame**: Using quality assessment punitively rather than for improvement

## 16. Examples

- **Evidence quality monitoring**: Throughout a procurement audit, quality metrics track evidence completeness, reliability, and timeliness. An evidence item drops below the reliability threshold. Quality indicator turns amber. Workflow requires additional evidence before the finding can be finalised. Auditor collects a more reliable evidence source. Quality indicator returns to green.
- **Finding quality review**: Quality review of findings across all active engagements identifies a pattern: findings from one engagement type consistently receive lower quality scores for root cause classification. Quality improvement cycle initiated: update root cause guidance, add validation step, retrain auditors. Follow-up review shows improvement.

## 17. Enterprise Impact

- Consistently high audit quality across the entire audit function
- Early detection of quality issues reduces rework and risk
- Quality trend data enables targeted improvement initiatives
- Stronger regulatory relationships through demonstrable quality management
- Embedded quality reduces the cost of external quality assessments

## 18. Long-Term Strategic Importance

Quality is the ultimate differentiator for AQLIYA. Any system can manage audit workflow; only an intelligence system can continuously monitor and improve quality. By embedding quality into the architecture, AQLIYA ensures that every engagement meets professional standards not because of inspection but because of design. This structural quality guarantee is a key component of AQLIYA's value proposition and a barrier to entry for tool-based competitors.

## 19. Related Documents

- **05.01 AuditOS Thesis** — Quality through architecture is a core thesis principle
- **05.03 EDI Infrastructure** — Quality metrics and profiles are stored in EDI
- **05.05 Audit Engagement Model** — Quality is monitored across the engagement lifecycle
- **05.06 Findings Intelligence Theory** — Finding quality is a key quality dimension
- **05.07 Evidence Intelligence Theory** — Evidence quality is a key quality dimension
- **05.12 Audit Review Lifecycle** — Quality reviews are conducted through the review lifecycle
- **05.14 Audit Governance Model** — Governance policies reference quality thresholds

## 20. Version History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft — full 20-section document defining the Audit Quality Assurance Model |
| 0.2 | 2026-05-08 | Founding Team | Status promoted to Reviewed — frontmatter and metadata update |
