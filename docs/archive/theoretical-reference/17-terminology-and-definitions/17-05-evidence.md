---
title: Evidence
document_id: 17.05
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 4 — Definition
related_documents: 17.01, 17.02, 17.04, 17.14, 08.09, 01.09
---

# Evidence

## 1. Purpose

This document defines "Evidence" as the foundational data type in AQLIYA. Evidence is the unit of trust. Every recommendation, finding, decision, and governance action in AQLIYA traces back to evidence. Without a precise definition, the system cannot distinguish between raw data and evidence, cannot enforce evidence sufficiency, and cannot ensure that trust is earned rather than assumed. This definition anchors every downstream concept that depends on verifiable, traceable, contextualized information.

## 2. Thesis

Evidence in AQLIYA is data that has been validated, attributed, contextualized, and positioned within a decision or finding. Not all data is evidence. Data becomes evidence when it has context, provenance, relevance, and reviewability. Evidence is the indispensable input to every recommendation, finding, and decision. Without evidence, there is no trust, no traceability, no governance, and no auditability. Evidence is the unit of trust — the atomic element that makes the entire system verifiable.

## 3. Problem

In current practice, evidence is treated as an afterthought:

1. **Data-evidence conflation**: Organizations treat all data as evidence. But data without context, attribution, and validation is not evidence — it is raw input that may or may not support a conclusion.
2. **Evidence scattering**: Supporting evidence is stored across email attachments, file shares, local drives, and paper files. The evidence supporting a finding may exist in 15 different locations with no linking.
3. **Evidence gaps**: Audit engagement teams discover evidence gaps during final review — critical findings that lack supporting evidence — because evidence collection is unmanaged.
4. **Evidence opacity**: Even when evidence exists, it is often unclear what evidence supports which conclusion, whether the evidence is complete, and whether it was obtained through appropriate procedures.

## 4. Why Existing Systems Fail

**Document management systems** store files but do not establish the relationship between a document and the finding it supports. Evidence exists but is not linked.

**Audit management platforms** track evidence requests and checklists but do not enforce evidence sufficiency, validation, or attribution. They count whether evidence was received, not whether it supports the conclusion.

**Email and file sharing** are where evidence actually lives in most audit engagements — unstructured, unlinked, and buried in threads that no one can search or verify.

**ERP and financial systems** generate data that could be evidence but do not provide the context, attribution, or validation that transforms data into evidence.

The common failure: no system enforces the distinction between data and evidence, and no system manages the evidence lifecycle — collection, validation, attribution, linking, review, and retention.

## 5. AQLIYA Philosophy

AQLIYA defines evidence through four properties that distinguish it from raw data:

1. **Context**: Evidence is positioned within a specific finding, decision, or workflow. Data without context is not evidence — it is noise.
2. **Provenance**: Evidence has a documented origin — who collected it, when, from what source, through what procedure. Provenance establishes authenticity.
3. **Relevance**: Evidence is relevant to a specific question, finding, or decision. Relevance is not inherent — it must be established through professional judgment.
4. **Reviewability**: Evidence can be examined, validated, and challenged by a qualified reviewer. If evidence cannot be reviewed, it cannot be trusted.

These four properties are not optional. Without all four, data remains data. It does not become evidence. AuditOS is the first wedge where evidence is the governing object. Financial Intelligence is the first moat that generates the structured financial evidence flowing through the system.

## 6. Core Principles

1. **Evidence is the unit of trust.** Every recommendation, finding, and decision must be traceable to its supporting evidence. If it cannot be evidenced, it should not be trusted.
2. **Data is not evidence.** Raw data must be validated, attributed, contextualized, and linked to a decision or finding before it qualifies as evidence.
3. **Evidence sufficiency is enforceable.** The system can determine whether the evidence supporting a conclusion is sufficient based on configured thresholds, materiality levels, and governance rules.
4. **Evidence has a lifecycle.** Evidence is collected, validated, attributed, linked, reviewed, and retained. Each stage is managed, not assumed.
5. **Evidence is first-class.** Evidence has its own schema, storage, lifecycle, and access controls. It is not an attachment or a link — it is a foundational data type.

## 7. Key Concepts

- **Evidence Object:** A structured record containing: the source data, provenance information (collector, timestamp, source, procedure), context (the finding, decision, or workflow it supports), validation status, relevance assessment, and access controls.
- **Evidence Lifecycle:** The progression of evidence from collection through validation, attribution, linking, review, and retention.
- **Evidence Sufficiency:** The assessed completeness of evidence supporting a specific conclusion. Sufficiency is determined by materiality thresholds, professional standards, and governance rules — not by volume alone.
- **Evidence Chain:** The documented link between a finding, recommendation, or decision and all evidence that supports it. A broken evidence chain is a governance violation.
- **Evidence Gap:** An identified absence of required evidence for a conclusion. Evidence gaps are surfaced proactively, not discovered at final review.
- **Evidence Provenance:** The documented origin of evidence: who collected it, when, from what source, through what procedure. Provenance is mandatory for evidence trustworthiness.

## 8. Operational Implications

1. Every engagement must define evidence requirements: what evidence is needed, for what conclusions, at what sufficiency levels. This is not discretionary — it is part of engagement setup.
2. Evidence collection is tracked in real time. Teams can see what evidence has been collected, what is missing, and what deadlines are approaching.
3. Evidence validation is a required step before evidence can be linked to a finding or decision. Unvalidated data is flagged as "pending validation" and cannot support conclusions.
4. Evidence attribution establishes who collected the evidence, through what procedure, and from what source. Anonymous or unattributed evidence is flagged as structurally deficient.
5. Evidence retention follows professional and regulatory standards. Evidence is retained for the required period and disposed of according to governance rules.

## 9. Product Implications

1. Evidence is a first-class object with its own views, lifecycle management, and access controls — not a file attachment or a link.
2. The product enforces evidence sufficiency checks. Findings, recommendations, and decisions that lack adequate evidence are flagged before they can advance.
3. Evidence linking is the primary way reviewers connect data to conclusions. The product makes it easy to link evidence and impossible to bypass the linking step.
4. Evidence gaps are surfaced proactively. Reviewers see what evidence is missing before they reach final review, not after.
5. Evidence views show provenance, context, validation status, and relevance assessment at a glance.

## 10. Architecture Implications

1. Evidence is a first-class data type with its own schema: source data, provenance, context, validation status, relevance assessment, access controls, and lifecycle state.
2. Evidence storage is separate from document storage. Evidence objects reference source documents, financial data, and other inputs without duplicating them.
3. Evidence linking is enforced by the data model. Findings, recommendations, and decisions must reference evidence objects. The data model supports one-to-many relationships between conclusions and evidence.
4. Evidence access controls are granular — controlling who can view, validate, modify, and dispose of evidence based on role, engagement, and governance rules.
5. Evidence lifecycle state transitions are governed by the workflow engine. Evidence cannot move to "validated" without review, and findings cannot move to "approved" without sufficient evidence.

## 11. Governance Implications

Governance is structural, not procedural.

1. Evidence governance defines: what types of evidence are required for different findings, what sufficiency levels apply, what validation procedures are mandatory, and what retention policies govern.
2. Evidence that cannot be validated or attributed is flagged as structurally deficient and cannot support material findings or decisions.
3. Evidence access is governed by role and engagement scope. Reviewers can access evidence for their engagements. Partners can access evidence across engagements within their scope.
4. Evidence audit trails are maintained for regulatory inspection: what evidence was collected, when, by whom, for what purpose, and with what validation.
5. Evidence sufficiency reports can be generated at any point in an engagement, showing which conclusions have adequate evidence and which have gaps.

## 12. AI / Intelligence Implications

AI assists. Humans decide. Evidence governs.

1. Intelligence processes evidence to produce recommendations, findings, and signals. But intelligence does not create evidence — it validates, attributes, and links existing evidence to conclusions.
2. Intelligence can identify evidence gaps proactively: "This material conclusion lacks supporting evidence for account X." This shifts evidence gap detection from final review to continuous monitoring.
3. Intelligence can validate evidence consistency: checking that the evidence supporting a conclusion is internally consistent, from reliable sources, and obtained through appropriate procedures.
4. Intelligence output is itself a form of evidence — the system's analysis of financial data, anomaly patterns, and risk signals. But intelligence evidence is always labeled as such and accompanied by its own evidence trace.
5. Evidence classification by intelligence (strong, moderate, weak) is a recommendation, not a decision. The professional reviewer validates the classification.

## 13. UX Implications

1. Evidence is displayed inline with findings, recommendations, and decisions. Reviewers see what evidence supports a conclusion without navigating to a separate view.
2. Evidence sufficiency is visually indicated: which conclusions have adequate evidence, which have gaps, and which are at risk.
3. Evidence gap resolution is a primary workflow action. Reviewers can create evidence collection tasks, track collection progress, and close gaps from within the finding or decision view.
4. Evidence provenance is always accessible. Reviewers can see who collected evidence, when, from what source, and through what procedure.
5. Evidence validation is a simple, structured action — not a bureaucratic process. Reviewers validate evidence with a clear, domain-relevant interface.

## 14. Commercial Implications

1. Evidence management is a primary value driver for audit firms. Reducing evidence collection time, eliminating evidence gaps, and enforcing evidence sufficiency directly impact engagement economics.
2. Pilot engagements demonstrate value through evidence gap reduction and evidence sufficiency improvement — measurable outcomes, not subjective assessments.
3. Evidence management creates organizational memory — evidence patterns, collection procedures, and sufficiency standards persist across engagements and staff turnover.
4. The commercial narrative: "AQLIYA ensures every conclusion is backed by sufficient, validated, traceable evidence — not because professionals are careless, but because the system makes it structural."

## 15. Anti-Patterns

1. **Data-evidence conflation.** Treating all data as evidence without validation, attribution, context, or relevance assessment. This erodes the distinction that makes evidence trustworthy.
2. **Evidence without provenance.** Allowing evidence to be used without documenting who collected it, when, from what source, and through what procedure. Unattributed evidence cannot be validated.
3. **Evidence sufficiency ignored.** Allowing conclusions to be reached without determining whether the supporting evidence is sufficient for the conclusion's weight and materiality.
4. **Evidence as attachment.** Reducing evidence to file uploads or document links without structured provenance, validation status, or linking to conclusions.
5. **Evidence gap discovery at final review.** Discovering that critical evidence is missing only during final review rather than proactively tracking evidence completeness throughout the engagement.
6. **Evidence destruction without governance.** Disposing of evidence without following retention policies and governance procedures. Evidence is a governance asset with lifecycle requirements.

## 16. Examples

**Example 1: Audit Evidence for Revenue Recognition.** An auditor reviews revenue for a client. Evidence objects include: signed customer contracts (source document), bank statements showing cash receipts (financial data), shipping documents confirming delivery (source document), and the intelligence system's analysis showing revenue recognition timing patterns (intelligence evidence). Each evidence object has provenance (who collected it, when, from where), validation status (confirmed/unconfirmed), and relevance assessment (supports the revenue completeness assertion). The auditor links the relevant evidence to the revenue completeness finding, and the system confirms evidence sufficiency based on the engagement's materiality thresholds.

**Example 2: Evidence Gap Detection.** During interim testing, the system identifies that the accounts payable balance has only two of five required confirmation responses. An evidence gap is created: "Three AP confirmations outstanding for balances exceeding materiality threshold." The gap is linked to the relevant finding, assigned to the team member responsible for follow-up, and tracked through collection, validation, and linking. The engagement manager monitors evidence gap status across all findings.

**Example 3: Evidence Provenance Chain.** A regulator requests the evidence supporting a material finding about inventory valuation. The AQLIYA system produces a complete evidence chain: the finding, the five evidence objects that support it, the provenance for each (who collected it, when, from what source, through what procedure), the validation status of each, and the sufficiency assessment. The regulator can trace from the conclusion back through every piece of evidence without gaps.

## 17. Enterprise Impact

1. **Regulatory defensibility**: Complete evidence chains with provenance, validation, and sufficiency assessment withstand regulatory scrutiny.
2. **Reviewer productivity**: Proactive evidence gap detection and structured evidence management reduce the time spent on evidence collection and verification.
3. **Quality consistency**: Enforced evidence sufficiency ensures that every conclusion is supported by adequate evidence, regardless of which reviewer is working.
4. **Risk reduction**: Evidence gaps are identified and resolved proactively, reducing the risk of unsupported findings reaching audit reports.
5. **Institutional memory**: Evidence patterns, collection procedures, and sufficiency standards persist across engagements, reducing the learning curve for new engagements.

## 18. Long-Term Strategic Importance

Evidence is the unit of trust. If AQLIYA maintains a precise, rigorous definition of evidence — distinct from data, with mandatory provenance, validation, context, and sufficiency — it creates a durable competitive position. No generic platform, document system, or AI wrapper can replicate evidence management without the domain depth, governance integration, and lifecycle enforcement that AQLIYA provides.

Long-term, evidence management becomes the connective tissue of enterprise operations. Every domain — audit, finance, governance, risk, compliance — depends on evidence. If AQLIYA owns the evidence layer, it becomes the trusted foundation for every downstream decision, finding, and governance action.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 17.01 | Intelligence | Intelligence processes evidence to produce recommendations |
| 17.02 | Decision | Decisions are built on evidence |
| 17.04 | Finding | Findings are supported by evidence |
| 17.14 | Traceability | Traceability connects conclusions back to evidence |
| 08.09 | Evidence Governance Doctrine | Governance rules for evidence management |
| 01.09 | Evidence-Centric Company Philosophy | Evidence as the foundational AQLIYA philosophy |
| 09.10 | Data-To-Decision Trust Chain | Chain connecting data through evidence to decisions |
| 07.06 | Evidence Lifecycle Framework | Framework for managing evidence through its lifecycle |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for doctrinal consistency and promoted to Reviewed |
| 0.1 | 2026-05-07 | Founding Team | Initial draft |