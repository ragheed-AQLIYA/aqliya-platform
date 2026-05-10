---
title: Finding Model
document_id: 20.03
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 3 - Model / Framework
related_documents: 17.01, 17.04, 17.05, 20.01, 20.04, 20.05, 20.11, 05.06, 05.09
---

# Finding Model

## 1. Purpose

This document defines the canonical Finding Model — the structural specification for how AQLIYA represents, qualifies, categorizes, and tracks findings within governed workflows. A finding is the formal articulation of an observation discovered during an evidence-driven review process. In audit and governance, findings are the primary deliverable — they are what transform raw observations into actionable, reportable, and accountable conclusions. The Finding Model ensures that every finding is evidence-backed, risk-qualified, properly categorized, and traceable through its entire lifecycle from identification to resolution.

## 2. Thesis

A finding in AQLIYA is not a free-text note in a report. It is a structured enterprise object that connects an observation to its supporting evidence, its risk classification, its materiality assessment, and its resolution path. Every finding exists within a governance context that determines who must review it, what evidence supports it, how it is classified, and what actions follow from it. The Finding Model enforces the principle that findings are not opinions — they are evidence-backed conclusions that carry professional weight, regulatory significance, and organizational accountability. Without a rigorous finding model, audit reports are collections of assertions; with it, they are structured, defensible, evidence-backed conclusions.

## 3. Problem

Findings in current audit practice are created inconsistently. One reviewer documents a finding with extensive evidence; another documents a similar finding with minimal support. Categorization varies by individual. Risk classification is subjective and inconsistent across reviewers, engagements, and time. The result: findings of uneven quality, findings that cannot be compared across engagements, findings that regulators challenge because the evidence chain is incomplete, and findings that organizations cannot learn from because they lack structured data.

More critically, findings are often disconnected from the workflow that produced them. A finding appears in a report, but there is no traceable link from the finding back through the evidence review, the risk signal, the recommendation, and the decision that led to it. This disconnection is a structural deficiency that regulators, partners, and quality reviewers repeatedly encounter.

## 4. Why Existing Systems Fail

**Audit management platforms** allow reviewers to type findings into text fields but provide no structural enforcement for evidence linkage, risk classification consistency, or materiality assessment methodology. Findings become documents, not data.

**Document-centric workflows** treat findings as report sections. The finding lives in a Word document, is reviewed by email, and is finalized by committee. There is no structured finding object that can be tracked, compared, or learned from.

**Risk assessment tools** calculate risk scores but do not connect risk assessments to the specific findings they produce. Risk scores and findings exist in separate systems.

**Spreadsheet-based tracking** records findings in rows on a spreadsheet without evidence links, without lifecycle tracking, and without governance enforcement. Tracking is manual and error-prone.

**Generic issue trackers** manage findings as tickets with status fields. They lack domain-specific structures for evidence linkage, materiality assessment, risk classification, and professional finding categorization.

The common failure: findings are treated as text artifacts rather than structured, evidence-backed, governable enterprise objects. AQLIYA treats findings as data with lifecycle, evidence, and governance.

## 5. AQLIYA Philosophy

The Finding Model is grounded in the principle that evidence is the unit of trust. A finding without evidence is an assertion. An assertion without evidence is an opinion. In regulated, liability-bearing domains, opinions do not constitute professional findings. The Finding Model enforces this by requiring that every finding is connected to its evidence bundle, that the evidence quality is assessed, and that the finding's classification is derived from the evidence, not from the reviewer's subjective impression.

Findings are also structural, not procedural. The governance context in which a finding is identified determines its classification, its required evidence threshold, its review authority, and its reporting treatment. This is embedded in the model, not delegated to after-the-fact policy enforcement.

## 6. Core Principles

1. **Findings are evidence-backed.** Every finding must link to a specific evidence bundle. A finding submitted without evidence is flagged as incomplete and cannot progress through the lifecycle.

2. **Findings are classified, not just described.** Each finding has a structured classification: finding type, risk level, materiality assessment, affected account area, and regulatory relevance. Free-text description supplements classification; it does not replace it.

3. **Findings have a lifecycle.** Identified → Evidence Gathered → Classified → Reviewed → Approved → Reported → Resolved. Each state transition is an event with an actor, timestamp, and evidence reference.

4. **Findings are comparable.** Structured classification enables cross-engagement comparison. Findings about similar patterns across different clients can be aggregated, analyzed, and used to generate organizational learning.

5. **Findings carry professional accountability.** Every finding has an author, a reviewer, and an approver. Finding accountability is not anonymous or shared — it is attributed.

6. **Findings are risk-qualified.** Risk classification is not a label applied after the fact; it is a structured assessment derived from the finding's evidence, its financial impact, and its regulatory context.

7. **Findings are governable.** Governance rules determine: who must review and approve findings of a given risk level, what evidence threshold applies to each finding type, and what reporting requirements apply.

8. **Findings are traceable.** Every finding can be traced from its source evidence through its classification, review, approval, and reporting to its final resolution. The finding trace is the auditable artifact.

## 7. Key Concepts

- **Finding Object:** The canonical data entity. Fields: finding_id, type, classification, risk_level, materiality_assessment, evidence_bundle, description, author, reviewer, approver, state, engagement_context, entity_context, resolution, and reporting_treatment.

- **Finding Type:** A taxonomy of finding categories. Examples: control_deficiency, material_misstatement, going_concern_indicator, related_party_disclosure_gap, subsequent_event, estimate_uncertainty.

- **Finding Classification:** The structured categorization of a finding along multiple dimensions: type, risk level (low, moderate, high, critical), materiality (immaterial, material, highly material), financial impact range, regulatory relevance, and reporting treatment.

- **Finding Lifecycle:** The state machine governing how a finding progresses from identification to resolution. States are enforceable through governance rules and evidence thresholds.

- **Evidence Bundle:** The set of evidence objects linked to a finding. Each piece of evidence has provenance, relevance, and verification status. The bundle must meet the minimum evidence threshold for the finding type and risk level.

- **Finding Risk Qualification:** A structured risk assessment that considers: evidence strength, financial impact, regulatory exposure, and pattern significance. Risk qualification is derived from evidence, not imposed by reviewer preference.

- **Finding Author/Reviewer/Approver:** The three accountability roles in a finding lifecycle. The author identifies the finding. The reviewer validates the evidence and classification. The approver accepts professional responsibility.

- **Finding Trace:** The complete, navigable record of every state transition, evidence reference, classification decision, and governance check in a finding's lifecycle.

- **Finding Resolution:** The final state of a finding, including: remediated, reported_as_is, escalated, withdrawn (with documented justification), or accepted_as_finding_with_management_response.

- **Cross-Engagement Finding Pattern:** When similar findings recur across engagements, the system identifies the pattern, elevates it to a risk signal, and makes it available to all future engagements. This is how individual findings become organizational intelligence.

## 8. Operational Implications

1. Finding classification taxonomies must be defined per domain before deployment. Audit engagements use ISA/IAASB classification standards; financial reviews use relevant accounting framework classifications.

2. Evidence threshold requirements must be configured per finding type and risk level. A critical material misstatement finding requires stronger evidence than a control improvement suggestion.

3. Approval authority matrices must be established: which roles can approve which finding types at which risk levels. A staff auditor does not approve a critical finding; a partner does.

4. Finding review and quality control processes must be embedded in workflows. Findings do not move to the Reported state without passing through the review and approval governance gates.

5. Cross-engagement finding analysis must be conducted periodically to identify patterns that should be elevated to firm-wide risk signals.

## 9. Product Implications

1. Finding creation must be structured, not free-text. The interface guides the reviewer through classification, evidence linkage, and risk qualification before the finding is submitted.

2. Evidence linkage must be enforced at the point of finding creation. A finding cannot be submitted to review without meeting the minimum evidence threshold for its type and risk level.

3. Finding classification must use controlled vocabularies and standard taxonomies. Free-text descriptions supplement classification but do not substitute for it.

4. Finding lifecycle visualization must show the current state, pending actions, responsible parties, and governance requirements at every stage.

5. Finding comparison views must enable reviewers and partners to compare findings across engagements, over time, and by classification. Pattern recognition across findings is a core product value.

6. Finding reports must be auto-generated from structured finding data. The finding object, not a Word document, is the source of truth. Reports are rendered views of structured data.

7. Finding templates for common finding types must be pre-configured per domain, reducing reviewer effort while maintaining classification consistency.

## 10. Architecture Implications

1. The Finding Object is a first-class entity in the data model with its own schema, lifecycle, and event stream. Findings are not embedded in documents; they are structured data that documents reference.

2. Evidence references in a finding are foreign keys to the Evidence Model (20.04). Evidence integrity cascades: evidence deletion is prohibited if it is linked to an active finding.

3. Finding classification and risk qualification are computed using the Confidence Model (20.11) and domain-specific rules. The system suggests classification and risk level; the reviewer validates or overrides.

4. The finding lifecycle state machine is configurable per domain and per governance context but enforced by the workflow engine. Required states cannot be skipped.

5. Finding events are emitted to the event bus for downstream consumers: risk signal generation, reporting, analytics, and organizational learning.

6. Cross-engagement finding pattern detection runs as an asynchronous service that identifies similar findings across engagements and surfaces them as risk signals.

7. Finding data must support temporal queries: "show all findings about this account area across all engagements in the last three years" and "show the resolution pattern for findings of this type."

8. Tenant isolation at the finding level means one firm cannot access another firm's findings, even in shared infrastructure.

## 11. Governance Implications

1. Every finding type and risk level has a governance profile specifying: required evidence threshold, required reviewer qualifications, required approver level, and mandatory reporting treatment.

2. Finding approval follows strict authority delegation. Approvals are tracked, attributable, and irreversible. Finding approvals become part of the professional accountability record.

3. Finding withdrawal requires documented justification and partner-level approval. Withdrawn findings are not deleted; they are marked as withdrawn with the reason preserved.

4. Findings reported to regulators must pass an additional governance gate: a quality review that verifies evidence sufficiency, classification accuracy, and reporting treatment compliance.

5. Finding escalation is automatic when risk qualification exceeds a threshold. Critical findings route to partners immediately, bypassing intermediate review.

6. Finding audit trails are immutable. No finding history can be altered after the fact. Corrections are made through new findings or finding amendments, not through edits.

## 12. AI / Intelligence Implications

1. The intelligence layer generates finding candidates — preliminary findings based on evidence analysis, risk signals, and pattern detection. Finding candidates are not findings; they are recommendations to create findings.

2. Finding candidate classification is assisted by AI. The system suggests type, risk level, and materiality based on the evidence bundle, engagement context, and historical patterns. The reviewer validates or adjusts.

3. Finding pattern detection across engagements is an AI-driven capability. The system identifies recurring finding types, common evidence patterns, and correlated risk signals that individual reviewers may not see.

4. Finding quality scoring is assisted by AI. The system evaluates submitted findings against evidence thresholds, classification consistency, and reporting standards, flagging potential quality issues before review.

5. AI does not create findings autonomously. Finding candidates become findings only when a human reviewer validates the evidence, accepts or adjusts the classification, and submits the finding for review and approval.

6. Finding writing assistance is limited to structural suggestions (evidence completeness, classification options, reporting language), not to substantive judgment about the finding's validity.

## 13. UX Implications

1. Finding creation is a guided workflow: identify evidence → classify finding → assess risk → link to engagement context → submit for review. Each step has validation and help.

2. Finding lists must support filter, sort, and grouping by type, risk level, status, reviewer, entity, and engagement. Partners reviewing engagement finding portfolios must be able to navigate efficiently.

3. Finding detail views must show the complete evidence bundle, classification assessment, lifecycle history, and governance status in a single, navigable interface.

4. Finding comparison must enable reviewers to select multiple findings and compare evidence, classification, risk level, and resolution side by side. This supports consistency and pattern detection.

5. Finding export to reports must be a rendering operation from structured data, not a copy-paste operation. Reports are generated from finding data, not the reverse.

6. Keyboard navigation for finding review: accept finding, request revision, escalate to partner, defer finding — all without leaving the keyboard.

## 14. Commercial Implications

1. The Finding Model is a direct value driver for audit firms. Structured, evidence-backed, classified findings reduce rework, improve consistency, and accelerate partner review.

2. Proof-of-value metrics: finding quality scores (evidence completeness, classification consistency), time from identification to approved finding, and reduction in partner review rework.

3. Cross-engagement finding pattern detection is a differentiating capability that generic audit tools do not provide. It enables firms to identify systemic risks that no individual reviewer would detect.

4. Auto-generation of reports from structured finding data reduces the document production burden by eliminating manual report compilation.

5. Finding quality controls built into the model (evidence thresholds, classification enforcement, governance gates) reduce regulatory risk and improve audit quality metrics.

## 15. Anti-Patterns

1. **Free-Text Finding.** Allowing findings to be created as unstructured text without required classification, evidence linkage, or risk qualification. This makes findings uncomparable, untrackable, and unlearnable.

2. **Finding Without Evidence.** Allowing findings to be submitted or approved without linking to supporting evidence. A finding without evidence is an opinion, not a professional conclusion.

3. **Self-Approval.** Permitting the same person who identifies a finding to approve it. This violates the principle of independent review and undermines finding credibility.

4. **Finding Amnesia.** Creating findings that are not compared against past findings on similar entities, accounts, or patterns. Each engagement starts from scratch instead of building on organizational knowledge.

5. **Classification Inconsistency.** Allowing subjective, inconsistent classification of findings across reviewers and engagements. Two findings about the same issue should receive the same classification regardless of who creates them.

6. **Finding as Document.** Treating findings as sections of a report rather than as structured data. When findings are documents, they cannot be compared, tracked, or learned from.

7. **Delayed Evidence Linkage.** Allowing findings to be created first with evidence "to be added later." This practice leads to findings supported by weak evidence or no evidence at all.

## 16. Examples

**Example 1: Material Misstatement Finding.** During an audit of a manufacturing client, the system identifies that inventory valuation includes obsolete stock valued at SAR 8.5M. The reviewer creates a finding with type `material_misstatement`, risk level `high`, materiality `material`. The evidence bundle includes: the inventory listing, the obsolescence analysis, the relevant accounting standard reference, and the client's own provision calculation. The finding is classified, risk-qualified, and submitted for partner review. The partner reviews the evidence, adjusts the materiality assessment based on the entity's total assets, approves the finding, and it is included in the audit report draft.

**Example 2: Control Deficiency Finding.** Across 15 audit engagements, the system identifies a recurring pattern: client organizations consistently lack proper segregation of duties in accounts payable processing. The finding type is `control_deficiency`, risk level `moderate`, materiality `immaterial per engagement but systematic across engagements`. The AI layer identifies this as a cross-engagement pattern and flags it for firm-level risk assessment. The head of audit quality reviews the aggregated findings, confirms the pattern, and creates a firm-wide risk signal for segregation of duties in accounts payable.

**Example 3: Going Concern Indicator Finding.** During an audit review, the system surfaces multiple signals: declining revenue trends, negative cash flow projections, and pending debt covenant violations. The reviewer creates a finding with type `going_concern_indicator`, risk level `critical`. The evidence bundle includes: three years of financial trend data, the client's cash flow projections, the debt covenant schedule, and correspondence with management. The critical risk level triggers automatic escalation to the engagement partner and the firm's quality review committee. Governance rules require partner-level approval and quality review before reporting.

## 17. Enterprise Impact

1. **Finding Consistency.** Structured classification and evidence thresholds produce findings that are consistent across reviewers, engagements, and time periods. Consistency improves audit quality and reduces regulatory challenge.

2. **Review Efficiency.** Partners reviewing finding portfolios can filter, sort, and group by risk level, type, and entity. Review is efficient and focused rather than sequential and exhaustive.

3. **Regulatory Defensibility.** Every finding is traceable from evidence through classification to approval. Regulatory inquiries can be satisfied with complete finding traces rather than reconstructed documentation.

4. **Organizational Learning.** Finding patterns across engagements generate risk signals that improve future audit approaches. Individual findings become institutional knowledge.

5. **Reduced Rework.** Evidence thresholds, classification enforcement, and governance gates catch incomplete or misclassified findings before they reach the partner review stage, reducing rework cycles.

6. **Quality Assurance Metrics.** Structured finding data enables measurement of finding quality across the firm: evidence sufficiency rates, classification consistency, risk level accuracy, and review cycle time.

## 18. Long-Term Strategic Importance

The Finding Model is one of the most directly value-creating models in AQLIYA because findings are the primary deliverable of audit work. If findings are poorly structured, the entire audit workflow degrades. If findings are well-structured, they become data that powers every downstream capability: risk signal generation, organizational learning, report production, and regulatory response.

Long-term, the Finding Model extends beyond audit into any domain where professional conclusions must be evidence-backed, classified, reviewed, and reported. Compliance findings, risk assessment findings, investigation findings — all follow the same structural pattern. The model designed for audit is the model that scales to the broader enterprise.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 20.01 | Decision Model | Findings are resolved through decisions |
| 20.04 | Evidence Model | Evidence bundles substantiate findings |
| 20.05 | Risk Signal Model | Findings generate and are generated by risk signals |
| 20.11 | Confidence Model | Confidence qualifies finding classification |
| 05.06 | Findings Intelligence Theory | Intelligence layer for finding identification |
| 05.09 | Audit Risk Scoring Theory | Risk scoring applied to finding classification |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial reference model specification |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. Evidence-backed classification enforced. AI assists via finding candidates (not autonomous creation). Added cross-references to 17.01, 17.04, 17.05. |