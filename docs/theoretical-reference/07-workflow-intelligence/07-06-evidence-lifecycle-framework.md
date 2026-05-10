---
title: Evidence Lifecycle Framework
document_id: 07.06
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 3 - Model / Framework
related_documents:
  - 07.01
  - 07.03
  - 07.05
  - 06.01
  - 07.11
---

# Evidence Lifecycle Framework

## 1. Purpose

This document specifies the state machine governing the lifecycle of evidence artifacts within AQLIYA's Enterprise Decision Intelligence Infrastructure. Evidence is the unit of trust in AQLIYA's doctrine; its lifecycle must be governed with the same rigor as the findings it supports. This framework defines the states evidence occupies, the transitions between those states, the guards enforcing those transitions, and the relationship between evidence state and finding state.

## 2. Thesis

Evidence artifacts progress through a governed lifecycle from collection through verification, attachment, and reference. Each state transition enforces integrity requirements—chain of custody, format validation, completeness checks—that ensure evidence is trustworthy when it gates finding transitions. The Evidence Lifecycle Framework guarantees that no finding advances without evidence that has itself passed through governed verification, and that evidence provenance is traceable from source to decision.

## 3. Problem

In enterprise financial intelligence, evidence is treated as an afterthought:

- **Loose attachment**: Evidence is referenced by file path, stored in shared drives, or attached as email attachments. The link between evidence and finding is informal and breakable.
- **No verification**: Evidence is assumed to be valid because it exists. There is no governed process for verifying evidence integrity, format compliance, or source reliability.
- **No lifecycle**: Evidence has no defined state. It is either present or absent, with no tracking of verification status, attachment status, or ongoing relevance.
- **No chain of custody**: Evidence provenance is undocumented. Auditors cannot trace evidence from its source through collection, verification, and attachment to its role in a finding.

The Evidence Lifecycle Framework addresses these failures by modeling evidence as a governed artifact with its own state machine, integrity checks, and lifecycle transitions.

## 4. Why Existing Systems Fail

- **File storage systems** (SharePoint, Google Drive, S3) store evidence files but provide no lifecycle management. Evidence is a file, not an artifact with governed states.
- **Audit management tools** (AuditBoard, Workiva) allow evidence attachment but treat evidence as a link to a file, not as an artifact with verification and lifecycle requirements.
- **GRC platforms** (Archer, ServiceNow GRC) manage evidence collection for compliance audits but treat evidence as a checklist item ("evidence collected: yes/no"), not as an artifact with integrity requirements.
- **Email and collaboration tools** circulate evidence without any chain of custody. The evidence may be modified, replaced, or lost with no record.

None of these systems model evidence as a governed artifact with its own state machine that enforces integrity, verification, and provenance.

## 5. AQLIYA Philosophy

Evidence is the unit of trust. Governance is structural, not procedural. These doctrines have structural implications for evidence management:

- Evidence has its own lifecycle, independent of but linked to the findings it supports.
- Evidence transitions are governed with integrity checks that verify chain of custody, format compliance, and completeness.
- Evidence state gates finding state transitions. A finding cannot enter review without evidence in the Verified state.
- Evidence provenance is traceable from source to decision. Every state transition in the evidence lifecycle is recorded.
- AI assists in evidence collection, extraction, and summarization but does not occupy verification or attachment decision joints.

## 6. Core Principles

1. **Evidence as First-Class Artifact**: Evidence is not a file attachment. It is an artifact with its own state machine, integrity requirements, and lifecycle transitions.
2. **Verification Before Reference**: Evidence must pass through verification before it can be attached to findings. Unverified evidence cannot gate finding transitions.
3. **Chain of Custody**: Every state transition in the evidence lifecycle records the actor, source, and integrity check results. Chain of custody is a structural guarantee.
4. **Immutable After Verification**: Once evidence is verified, its content is immutable. Modifications create new evidence versions rather than altering verified evidence.
5. **Evidence-Finding Referential Integrity**: Evidence state gates finding state. A finding cannot transition past the evidence gate unless its attached evidence is in the Verified state.
6. **Provenance by Construction**: Evidence provenance—from source through collection, verification, and attachment—is recorded in state transition history. Provenance is not assembled after the fact.

## 7. Key Concepts

- **Evidence States**: Collected, Verified, Attached, Referenced, Superseded, Archived.
- **Collection**: The initial state when evidence is ingested from a source. Metadata (source, collector, timestamp, format) is recorded.
- **Verification**: The governed process of confirming evidence integrity, format compliance, and source reliability. Verification is a decision joint requiring human authority.
- **Attachment**: The linking of verified evidence to a finding. Attachment creates a referential integrity link between the evidence ASM and the finding ASM.
- **Reference**: Evidence that is actively supporting a published finding. Referenced evidence is protected from modification or deletion.
- **Supersession**: Evidence that has been replaced by newer, more accurate, or more complete evidence. Superseded evidence retains its state history but is no longer active.
- **Archival**: Evidence that is no longer active but retained for audit and provenance purposes. Archived evidence is immutable and queryable.

### Evidence State Machine

```
Collected → Verified → Attached → Referenced → Archived
                     ↘ Rejected ↗          ↘ Superseded ↗
```

- **Collected**: Evidence has been ingested. Metadata recorded. Not yet verified.
- **Verified**: Evidence has passed integrity and format checks. Verified by a human authority. Ready for attachment to findings.
- **Rejected**: Evidence failed verification. Retained with failure reason for audit.
- **Attached**: Evidence is linked to one or more findings. Attachment is a governed transition that requires the evidence to be in Verified state.
- **Referenced**: Evidence is supporting a published finding. Referenced evidence is protected from modification.
- **Superseded**: Evidence has been replaced by new evidence. State history preserved.
- **Archived**: Evidence is no longer active. Retained for provenance and audit.

## 8. Operational Implications

- Analysts collect evidence from sources (data systems, documents, interviews). Evidence enters the Collected state with source metadata.
- Verification specialists or automated verification pipelines check evidence integrity. Verified evidence is available for attachment; rejected evidence is flagged for re-collection.
- Attaching evidence to findings requires the evidence to be in Verified state. The system prevents attachment of unverified evidence.
- When findings are published, their supporting evidence transitions to Referenced state, protecting it from modification.
- Evidence updates (newer data, corrected documents) create new evidence versions. The previous version transitions to Superseded, preserving provenance continuity.

## 9. Product Implications

- AuditOS provides an evidence collection interface that captures source metadata, format information, and chain of custody data upon ingestion.
- Evidence verification is a prominent workflow step. The product displays verification status clearly and prevents attachment of unverified evidence.
- Evidence attachment to findings is a governed action. The product requires evidence to be in Verified state and displays the evidence gate status for each finding.
- Evidence versioning is supported. When evidence is updated, the product creates a new version and links it to the previous version, maintaining provenance.
- Evidence provenance is queryable. Users and auditors can trace any piece of evidence from its source through every state transition.

## 10. Architecture Implications

- The Evidence ASM (Artifact State Machine) is a core service with defined states, transitions, guards, and actions.
- Cross-artifact referential integrity: evidence state gates finding state. The finding ASM checks evidence states before permitting transitions past the evidence gate.
- Evidence verification is a decision joint. The state machine requires human authority to transition evidence from Collected to Verified.
- Evidence immutability after verification: verified evidence content is stored as immutable data. Modifications create new versions rather than altering existing evidence.
- Event sourcing records every evidence state transition with actor, timestamp, guard evaluation, and integrity check results.

## 11. Governance Implications

- Evidence lifecycle management satisfies regulatory requirements for evidence integrity and chain of custody.
- Evidence verification records provide auditable proof that supporting evidence was verified before it gated decision transitions.
- Evidence immutability prevents post-hoc modification of evidence supporting published findings. This is a structural guarantee of evidence integrity.
- Evidence archival policies can be configured to meet retention requirements (SOX, SEC, GDPR) while maintaining provenance.

## 12. AI / Intelligence Implications

- AI assists in evidence collection by identifying relevant data sources, extracting structured information from documents, and flagging anomalies in evidence data.
- AI assists in verification preparation by checking format compliance, identifying missing fields, and comparing evidence against expected patterns.
- AI does not occupy the verification decision joint. Human authority is required to transition evidence from Collected to Verified.
- AI monitors evidence pipelines for anomalies: unusual verification rejection rates, evidence collection bottlenecks, and supersession patterns.

## 13. UX Implications

- Evidence state is prominently displayed in the evidence interface. Users see whether evidence is Collected, Verified, Attached, Referenced, Superseded, or Archived.
- Attachment actions enforce evidence state requirements. Users cannot attach Collected or Rejected evidence to findings.
- Evidence provenance is accessible through a drill-down interface. Clicking on evidence reveals its complete state history and source metadata.
- Version management is visual. Users see evidence versions as a timeline with clear indication of current, superseded, and archived versions.

## 14. Commercial Implications

- Evidence lifecycle management is a direct response to regulatory requirements for evidence integrity and chain of custody in financial intelligence.
- Financial intelligence teams that adopt AQLIYA's evidence lifecycle gain immediate audit readiness. Evidence provenance is a structural property, not an assembled documentation.
- The evidence lifecycle creates defensibility. Organizations can demonstrate that evidence supporting findings was verified before it gated decisions, a requirement for SOX, SEC, and SOC 2 compliance.

## 15. Anti-Patterns

- **Evidence as File Attachment**: Treating evidence as a file attached to a finding without lifecycle management. This breaks chain of custody and makes evidence integrity unverifiable.
- **Verification Bypass**: Allowing evidence to be attached to findings without verification. This defeats the evidence gate and allows unverified evidence to support decisions.
- **Evidence Mutation**: Modifying evidence after it has been verified and attached to a finding. Verified evidence must be immutable. Changes create new versions.
- **Orphaned Evidence**: Allowing evidence to exist without lifecycle state. Uncollected, unverified evidence floating in the system creates confusion and audit gaps.
- **Evidence-Finding Decoupling**: Allowing findings and evidence to exist independently without referential integrity. Evidence must gate finding transitions structurally.
- **Silent Supersession**: Replacing evidence without recording the supersession. The chain between old and new evidence versions must be maintained for provenance.

## 16. Examples

- An analyst collects transaction data from the ERP system. The evidence enters the Collected state with source metadata (system, query, timestamp, collector). A verification specialist reviews the data extraction, confirms integrity and format, and transitions the evidence to Verified. The analyst attaches the Verified evidence to a finding, gating the finding's transition to In Review.
- A compliance team discovers that financial statement evidence collected last quarter contains a data extraction error. The existing evidence is transitioned to Superseded. New, corrected evidence is collected, verified, and attached to the findings. The provenance chain shows the supersession with the reason documented.
- An auditor queries the provenance of evidence supporting a published finding. The system provides the complete lifecycle: source data, collection metadata, verification record, attachment record, and current Referenced state. The auditor confirms chain of custody without manual investigation.

## 17. Enterprise Impact

- Evidence integrity becomes a structural guarantee rather than a procedural aspiration. Organizations no longer rely on analysts to remember to verify evidence; the system enforces it.
- Audit costs decrease because evidence provenance is queryable from state records rather than assembled from disparate sources.
- Evidence quality improves because the verification process catches integrity issues before evidence gates finding transitions.

## 18. Long-Term Strategic Importance

The Evidence Lifecycle Framework is the operational backbone of AQLIYA's doctrine that evidence is the unit of trust. As AQLIYA expands beyond financial intelligence, every domain has evidence artifacts that require governed lifecycles. The pattern established here—collection, verification, attachment, reference, supersession, archival—generalizes across all decision intelligence domains, making this framework a foundational component of AQLIYA's platform.

## 19. Related Documents

- 07.01 — Workflow Intelligence Theory (domain overview)
- 07.03 — Workflow State Theory (state machine formalization)
- 07.05 — Findings Lifecycle Framework (finding artifact lifecycle)
- 06.01 — Evidence Theory (evidence as the unit of trust)
- 07.11 — Workflow Traceability Theory (provenance and traceability)

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed. Added EDI Infrastructure framing, governance-is-structural anchoring.