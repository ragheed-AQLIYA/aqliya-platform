---
title: Evidence Model
document_id: 20.04
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 3 - Model / Framework
related_documents: 01.09, 17.01, 17.05, 20.01, 20.02, 20.03, 20.05, 20.12
---

# Evidence Model

## 1. Purpose

This document defines the canonical Evidence Model — the structural specification for how AQLIYA represents, ingests, verifies, links, and governs evidence within decision intelligence workflows. Evidence is the unit of trust in AQLIYA. Every recommendation, finding, risk signal, and decision must be reducible to the evidence that supports it. The Evidence Model defines what evidence is, how it differs from data, how it progresses through a verification lifecycle, how it is linked to the objects it supports, and how it is governed across its entire existence. Without a rigorous Evidence Model, AQLIYA would be an opinion system. With it, AQLIYA is an evidence system.

## 2. Thesis

Data is not evidence. Data becomes evidence only when it acquires context, provenance, relevance, and verification status within a specific decision or finding context. A journal entry is data. A journal entry linked to a finding, with its source verified, its relevance to the finding established, and its integrity confirmed — that is evidence. The Evidence Model enforces this transformation by defining evidence as a first-class data type with its own schema, lifecycle, governance rules, and relational integrity. Evidence is not metadata attached to objects; it is the foundation on which objects stand.

The model treats evidence as an asset with a lifecycle: it is captured, contextualized, verified, linked, and eventually archived. At each stage, governance rules determine what is required for progression. Evidence that fails verification does not disappear — it is flagged and its implications for dependent findings and recommendations are surfaced. Evidence integrity is a structural constraint, not a best practice.

## 3. Problem

In current audit and governance practice, evidence is managed as files. PDFs in shared drives, spreadsheets in email attachments, confirmations in paper folders — all disconnected from the decisions, findings, and risk assessments they support. When a regulator asks "what evidence supports this finding," the answer requires searching across multiple systems, combining fragments, and hoping nothing was lost or modified.

The deeper problem is that evidence is not treated as a managed asset. It is not versioned. Its provenance is not recorded. Its verification status is not tracked. Its relationship to the findings and decisions it supports is not explicit. When evidence changes (a document is updated, a data source is corrected), the downstream implications are unknown. When evidence is missing, the impact on dependent findings is not surfaced.

## 4. Why Existing Systems Fail

**Document management systems** store files but do not manage evidence. They do not track provenance, verification status, or relationship to findings. A document is a container, not an evidence object with lifecycle and governance.

**Audit management platforms** allow evidence to be attached to workpapers but do not enforce evidence standards. There is no minimum evidence threshold, no verification workflow, no provenance tracking, and no automatic impact analysis when evidence changes.

**ERP systems** contain data that could be evidence but provide no mechanism for converting data into evidence within a governance context. The data exists; its evidential role does not.

**Email and collaboration tools** are the de facto evidence exchange in audit. Evidence is sent as attachments, stored in inboxes, and accessed by searching through threads. There is no structure, no verification, no version control, and no governance.

**Cloud storage platforms** provide file storage with access controls but no evidence lifecycle, no provenance, no verification workflow, and no linkage to the decisions or findings the files support.

The common failure: evidence is treated as a file, not as a structured asset with lifecycle, provenance, verification, and governance. AQLIYA treats evidence as the foundational data type of decision intelligence.

## 5. AQLIYA Philosophy

The Evidence Model is the direct expression of the foundational principle: evidence is the unit of trust. In AQLIYA, no recommendation is valid without evidence. No finding is complete without an evidence bundle. No decision is governable without evidence linkage. Evidence is not a supporting artifact — it is the core data type from which all intelligence and governance derives.

Evidence is also the mechanism through which AI earns trust. An AI output without an evidence trace is not a recommendation; it is a guess. Evidence traces are what make intelligence explainable, verifiable, and trustworthy in regulated domains.

The model enforces structural governance: evidence thresholds are enforced by the system, not by policy documents. Verification is a required step, not an optional quality check. Provenance is recorded, not assumed.

## 6. Core Principles

1. **Evidence is a first-class data type.** Evidence has its own schema, lifecycle, governance rules, and relational integrity. It is not a file attachment or a metadata tag.

2. **Data becomes evidence through context.** Raw data becomes evidence when it is contextualized within a specific decision, finding, or risk assessment. Context includes: what decision this evidence supports, why it is relevant, and how it was obtained.

3. **Evidence has provenance.** The origin, chain of custody, and transformation history of every piece of evidence is recorded. If provenance is unknown, the evidence is flagged as unverified.

4. **Evidence is verified.** Evidence progresses through a verification lifecycle: Captured → Contextualized → Verified → Linked. Verification means that the evidence's authenticity, accuracy, and relevance have been assessed by a qualified reviewer.

5. **Evidence has integrity.** Evidence objects are immutable once verified. Modifications create new versions; the original is preserved. Evidence linked to active findings or decisions cannot be deleted.

6. **Evidence has thresholds.** Different decision types, finding types, and risk levels require different evidence standards. The model enforces minimum evidence thresholds per context.

7. **Evidence is linked, not referenced.** Evidence is linked to the objects it supports through foreign key relationships, not through filename references or descriptions. Linkage is structural, not documentary.

8. **Evidence changes propagate.** When evidence is modified, superseded, or invalidated, all dependent findings, recommendations, and decisions are flagged for re-evaluation. Downstream impact analysis is automatic.

9. **Evidence is governed.** Access to evidence, modification of evidence, and deletion of evidence are governed by role-based access control and audit logging. Not all evidence is accessible to all users.

## 7. Key Concepts

- **Evidence Object:** The canonical data entity. Fields: evidence_id, type, source, provenance, context, verification_status, relevance_score, linked_objects, version, integrity_hash, governance_context.

- **Evidence Type:** A taxonomy classifying evidence by source and nature. Examples: document, financial_record, confirmation, analytical_procedure, observation, third_party_report, system_extract, interview_note.

- **Evidence Provenance:** The recorded origin and chain of custody of a piece of evidence. Provenance answers: where did this come from, who provided it, when was it captured, has it been modified, and by whom?

- **Evidence Verification:** The process of confirming that evidence is authentic, accurate, and relevant. Verification is performed by a qualified reviewer and recorded with the reviewer's identity, timestamp, and verification method.

- **Evidence Lifecycle:** The state machine governing evidence progression: Captured → Contextualized → Verified → Linked → Archived. Each state transition is an event with an actor and governance context.

- **Evidence Relevance Score:** A structured assessment of how relevant a piece of evidence is to the specific decision, finding, or risk assessment it supports. Relevance is not binary; it is a qualification.

- **Evidence Bundle:** The set of evidence objects linked to a single decision, finding, or risk assessment. Bundles must meet minimum evidence thresholds defined by the object's governance context.

- **Evidence Threshold:** The minimum quantity and quality of evidence required for a given decision type, finding type, or risk level. Thresholds are configured per governance context and enforced by the system.

- **Evidence Integrity Hash:** A cryptographic hash ensuring that evidence has not been modified since verification. Integrity is checked on access and on any downstream dependency evaluation.

- **Evidence Impact Propagation:** When evidence is modified or invalidated, the system identifies all findings, recommendations, and decisions that depend on that evidence and flags them for re-evaluation.

## 8. Operational Implications

1. Evidence ingestion workflows must be configured per engagement type before deployment. What types of evidence are expected, what verification procedures apply, and what thresholds govern each finding type.

2. Customer onboarding must include evidence standard definition: what constitutes sufficient evidence for this client's engagement, what verification procedures are required, and what provenance documentation is needed.

3. Professional services must deliver evidence governance configurations that encode the client's evidence standards, regulatory requirements, and quality control procedures into the system.

4. Operations must monitor evidence quality metrics: verification completion rates, evidence sufficiency rates, evidence gap counts, and impact propagation events.

5. The team must maintain an evidence type registry that catalogs all supported evidence types, their verification requirements, and their threshold applicability.

## 9. Product Implications

1. Evidence upload must be contextual. Evidence is uploaded within the workflow context where it is needed, not in a separate document repository. The system captures provenance automatically.

2. Evidence verification must be a first-class workflow step. A reviewer verifies evidence authenticity, accuracy, and relevance before the evidence is available for linking to findings or decisions.

3. Evidence sufficiency dashboards must show, at a glance: how much evidence has been gathered, how much has been verified, how much is required, and where gaps exist.

4. Evidence linking must be drag-and-drop or one-click. Linking evidence to a finding or decision should be as simple as possible while still requiring the reviewer to confirm relevance.

5. Evidence impact propagation must be visible. When evidence changes, the product must surface all dependent objects and flag them for re-evaluation. The reviewer sees the cascade before it causes downstream errors.

6. Evidence search must support contextual queries: "find all evidence related to accounts receivable for this client in Q4" and "find all findings where this document was cited as evidence."

7. Evidence version comparison must be a core feature. When evidence is superseded, the reviewer must be able to compare the original and the updated version side by side.

## 10. Architecture Implications

1. The Evidence Object is a first-class entity with versioned state, integrity verification, and relational integrity to findings, recommendations, and decisions. Evidence is not embedded in other objects; it is linked through foreign keys.

2. Evidence storage must be immutable for verified evidence. Modifications create new versions; the original is preserved with full provenance. This ensures audit trails are always reconstructable.

3. Evidence integrity is verified by cryptographic hashing. When evidence is accessed for dependency evaluation or audit, the integrity hash is checked. Tampering is detected, not prevented (prevention is a storage security concern).

4. Evidence impact propagation uses a dependency graph. When evidence changes, a graph traversal identifies all dependent objects and flags them. This traversal must be fast enough for real-time or near-real-time notification.

5. Evidence access control is governance-enforced. Who can see which evidence is determined by role, engagement, and governance context. Evidence in one engagement is not accessible to reviewers in another, even within the same firm.

6. The architecture must support evidence storage in cloud, private cloud, and on-premise environments. Evidence sovereignty is a deployment requirement, not just a data residency checkbox.

7. Evidence search must be performant across large volumes. Audit engagements generate thousands of evidence items; search and retrieval must be sub-second at scale.

8. Evidence metadata (provenance, verification status, relevance, linked objects) is indexed for fast querying. Full evidence content is stored separately and retrieved on demand.

## 11. Governance Implications

1. Evidence thresholds are enforced by the system, not by reviewer discretion. A finding cannot be approved if its evidence bundle does not meet the minimum threshold for its type and risk level.

2. Evidence verification is a required governance step. Evidence that has not been verified cannot be used to support findings above a configurable risk level. Verification is not optional; it is mandatory.

3. Evidence provenance tracking is immutable. The provenance chain — who provided the evidence, when, from what source, through what channel — is recorded and cannot be modified after verification.

4. Evidence deletion is governed. Evidence linked to active findings or decisions cannot be deleted. Evidence deletion requires authorization, and the deletion itself is logged as a governance event.

5. Evidence access control is role-based and context-based. Access is determined by the reviewer's role, their engagement assignment, and the evidence's governance classification.

6. Cross-engagement evidence reuse is governed. Evidence verified in one engagement may be referenced in another, but it must be re-verified in the new context before it supports new findings or decisions.

## 12. AI / Intelligence Implications

1. AI assists evidence verification by flagging anomalies: inconsistent dates, unusual source patterns, data that contradicts other evidence in the bundle. This assists the human verifier; it does not replace human verification.

2. AI assists evidence relevance scoring by analyzing the content of evidence and assessing its relevance to the specific finding or decision it is linked to. Relevance scoring is a recommendation to the reviewer, not an automated decision.

3. AI identifies evidence gaps: findings or decisions that lack sufficient evidence to meet the threshold. The system proactively surfaces gaps before the reviewer reaches the evidence verification step.

4. AI generates evidence linkage suggestions: when a reviewer creates a finding, the system suggests relevant evidence from the engagement's evidence repository based on content matching and pattern recognition.

5. AI-powered evidence impact propagation identifies the cascade effect when evidence changes: which findings, recommendations, and decisions are affected, and how severely.

6. AI does not verify evidence autonomously. Verification is a human responsibility. AI flags anomalies and suggests relevance scores; the human reviewer confirms authenticity, accuracy, and relevance.

## 13. UX Implications

1. Evidence upload must be seamless from within the workflow. The reviewer should never need to navigate to a separate evidence management interface to upload evidence for a finding or decision.

2. Evidence verification status must be visible at every point where evidence is referenced. A color-coded indicator (verified, pending, flagged) next to every evidence reference gives the reviewer immediate confidence information.

3. Evidence sufficiency progress must be shown for every finding and decision. "3 of 5 required evidence items verified" gives the reviewer a clear sense of what is needed before the finding can progress.

4. Evidence impact propagation must be surfaced proactively. When the reviewer modifies or invalidates evidence, the product must show which findings and decisions are affected before the change is confirmed.

5. Evidence search and filtering must support the reviewer's natural workflow: search by account, entity, date range, type, engagement, and verification status. Search must return results in under one second.

6. Evidence comparison must support side-by-side viewing of different versions, different sources, and different relevance scores. Reviewers comparing evidence need visual, not just textual, comparison tools.

## 14. Commercial Implications

1. The Evidence Model is a primary differentiator. No competitor manages evidence as a first-class object with lifecycle, provenance, verification, and governance. This is a structural advantage.

2. Proof-of-value metrics are evidence-centric: evidence sufficiency rate (percentage of findings with complete evidence), evidence verification rate, evidence gap resolution time, and impact propagation speed.

3. Evidence sovereignty is a commercial differentiator for regulated and government clients. Evidence that stays within the organization's infrastructure, governed by its own rules, is a capability that cloud-only competitors cannot match.

4. Evidence quality improvement is a measurable outcome. Clients who implement AQLIYA's evidence workflow show reduction in audit finding rework caused by insufficient or unverifiable evidence.

5. The Evidence Model creates network effects: as more evidence is captured and verified, the system's ability to suggest relevant evidence, identify gaps, and propagate impacts improves. This creates a retention moat.

## 15. Anti-Patterns

1. **Evidence as File Attachment.** Treating evidence as a file attached to a finding or decision without provenance, verification status, or lifecycle management. This reduces evidence to a document reference, losing the attributes that make it evidence.

2. **Unverified Evidence in Findings.** Allowing findings to be approved with evidence that has not passed verification. This undermines the entire evidence chain and makes findings vulnerable to regulatory challenge.

3. **Evidence Orphanage.** Allowing evidence to exist in the system without being linked to findings, recommendations, or decisions. Orphan evidence consumes storage, creates confusion, and provides no analytical value.

4. **Evidence Deletion Without Impact Analysis.** Deleting evidence without checking what findings and decisions depend on it. This can silently invalidate conclusions that downstream reviewers believe are still supported.

5. **Manual Provenance Tracking.** Relying on reviewers to manually record where evidence came from, who provided it, and when. Manual provenance is incomplete provenance; the system must capture it automatically.

6. **Evidence Threshold Bypass.** Allowing reviewers or administrators to bypass minimum evidence thresholds "for this one case." Threshold bypasses degrade the governance structure and create precedent for further erosion.

7. **Evidence Context Loss.** Extracting evidence from its engagement context without preserving the contextual metadata that makes it meaningful. Evidence without context is data; data without context is noise.

## 16. Examples

**Example 1: Audit Evidence Verification.** During an audit engagement, the reviewer uploads a bank confirmation for a material cash balance. The evidence object is created with type `confirmation`, source `client_bank`, provenance captured automatically (uploaded by reviewer, date, engagement context). The system detects that the confirmation amount matches the client's records and flags no anomalies. The reviewer verifies the evidence, confirming authenticity, accuracy, and relevance. The evidence status changes to Verified. The reviewer links the evidence to the cash balance finding. The evidence bundle for the finding now shows 1 of 3 required items verified.

**Example 2: Evidence Impact Propagation.** After preliminary findings are approved, the client corrects a journal entry that was cited as evidence in two findings. The system detects the change, verifies that the original evidence version is still available, creates a new version, and flags both findings for re-evaluation. The reviewer is notified: "Two findings dependent on modified evidence. Review required." The reviewer evaluates whether the corrected entry affects the findings, adjusts one finding and confirms the other is unaffected, and the system records the re-evaluation.

**Example 3: AI-Suggested Evidence Linkage.** A reviewer creates a finding about revenue recognition timing. The system analyzes the finding description and suggests three pieces of evidence from the engagement repository: the revenue ledger extract, the customer contract file, and the prior year revenue comparison. The reviewer reviews the suggestions, accepts two and rejects one (the prior year comparison covers a different accounting period). The evidence bundle is populated efficiently, and the relevance of each piece is assessed and confirmed by the reviewer.

## 17. Enterprise Impact

1. **Evidence Integrity.** Every piece of evidence in the system has provenance, verification status, and integrity verification. The enterprise can demonstrate evidence integrity to regulators, auditors, and oversight bodies.

2. **Evidence Sufficiency.** Minimum evidence thresholds ensure that no finding or decision is approved without sufficient evidence. This eliminates the common audit deficiency of findings supported by incomplete evidence.

3. **Impact Awareness.** When evidence changes, downstream dependencies are automatically flagged. Reviewers and partners are never surprised by invalidated findings because the system proactively surfaces the impact.

4. **Evidence Search and Reuse.** Evidence verified in one engagement context can be efficiently located and, with re-verification, reused in another. This reduces evidence collection time across the organization.

5. **Regulatory Confidence.** Structured, provenanced, verified evidence with impact propagation gives regulators and quality reviewers confidence in the audit process. This reduces regulatory friction and demonstrates governance maturity.

6. **Reduced Rework.** Evidence gaps and verification failures are caught at the point of evidence upload, not at the point of partner review. Early detection reduces rework cycles.

## 18. Long-Term Strategic Importance

The Evidence Model is the foundational data type of AQLIYA. It is the building block that makes everything else possible: recommendations without evidence are untrustworthy, findings without evidence are opinions, decisions without evidence are indefensible, and risk signals without evidence are noise. The Evidence Model is the structural expression of the principle that evidence is the unit of trust.

Long-term, the Evidence Model becomes the standard for how evidence is managed in regulated enterprises. As AQLIYA expands beyond audit into financial reporting, compliance, and governance, the same evidence requirements apply. The model must be designed for this expansion from the start.

The competitive moat is depth. Generic document management systems and cloud storage platforms manage files. AQLIYA manages evidence: identity, provenance, verification, linkage, impact propagation, and governance. This depth is not replicable by adding a feature to a file storage system. It requires the Evidence Model to be the foundation, not an add-on.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 01.09 | Evidence-Centric Company Philosophy | Foundational philosophy that evidence is the unit of trust |
| 20.01 | Decision Model | Decisions require evidence to be approved |
| 20.02 | Recommendation Model | Recommendations require evidence traces |
| 20.03 | Finding Model | Findings require evidence bundles |
| 20.05 | Risk Signal Model | Risk signals are generated from evidence patterns |
| 20.12 | Traceability Model | Traceability ensures evidence chains are complete |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial reference model specification |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. Exemplary doctrinal document — "evidence is the unit of trust" codified in model. Added cross-references to 17.01 (Intelligence) and 17.05 (Evidence definition). |