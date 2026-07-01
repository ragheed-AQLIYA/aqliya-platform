---
title: Findings Lifecycle Framework
document_id: 07.05
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 3 - Model / Framework
related_documents:
  - 07.01
  - 07.02
  - 07.03
  - 07.06
  - 07.07
  - 07.08
  - 06.01
---

# Findings Lifecycle Framework

## 1. Purpose

This document specifies the state machine governing the lifecycle of a finding within AQLIYA's decision pipelines. It defines every state a finding can occupy, the transitions between those states, the guard conditions enforcing those transitions, and the human decision joints that authorize critical transitions. This framework operationalizes the Workflow State Theory (07.03) for the finding artifact class.

## 2. Thesis

A finding is the primary intelligence artifact in financial decision work within the Enterprise Decision Intelligence Infrastructure. It moves from initial observation through evidence attachment, review, approval, potential escalation, and publication through a governed lifecycle. Each lifecycle phase is a state with defined entry conditions, exit conditions, and authority requirements. The Findings Lifecycle Framework ensures that no finding reaches a decision-maker without meeting the evidence, review, and authority standards that govern intelligent decisions.

## 3. Problem

In current enterprise practice, findings follow inconsistent paths:

- **Informal creation**: Analysts create findings in documents, emails, or reports without a governed creation process. The finding's origin, supporting evidence, and author context are undocumented.
- **Unstructured review**: Findings are reviewed through email threads, verbal discussions, or ad hoc meetings. Review outcomes are not consistently recorded, and review authority is not tracked.
- **Opaque approval**: Approvals are given via email reply, signature on a cover page, or verbal confirmation. There is no structural record of what the approver reviewed, what evidence they considered, or what authority they held.
- **Uncontrolled publication**: Findings reach stakeholders through informal channels without confirmation that they completed the governed lifecycle. Draft findings circulate as if they were final.

The Findings Lifecycle Framework replaces this informality with a governed state machine that guarantees evidence integrity, review authority, and approval accountability at every transition.

## 4. Why Existing Systems Fail

- **Document-centric tools** (Word, Google Docs) have no lifecycle model. A finding is a document that exists in whatever state the author last saved it. There is no governed progression.
- **Collaboration tools** (Confluence, Notion) provide versioning and comments but no state machine. "Review" is a comment thread, not a governed state with defined conditions and authority.
- **Audit management platforms** (AuditBoard, Workiva) define finding workflows but treat them as configurable process steps. Lifecycle stages can be removed or reordered, eliminating governance guarantees.
- **GRC platforms** (Archer, ServiceNow GRC) enforce rigidity without intelligence. Finding lifecycles are hard-coded compliance processes that resist the adaptive judgment required in financial intelligence work.

None of these systems model the finding lifecycle as a governed state machine with evidence gates, human decision joints, and structural traceability.

## 5. AQLIYA Philosophy

AQLIYA models the finding lifecycle as a state machine within the Enterprise Decision Intelligence Infrastructure, guided by the doctrine: Evidence is the unit of trust. AI assists. Humans decide. Evidence governs. Structural commitments:

- No finding transitions to review without meeting evidence attachment requirements.
- No finding transitions past review without a human reviewer recording their assessment.
- No finding transitions past approval without a human approver recording their authority and justification.
- Every state transition is recorded with full provenance, creating an audit trail that is a structural property of the system.
- AI assists in drafting findings and surfacing evidence but never occupies a decision joint.

## 6. Core Principles

1. **Evidence-Gated Entry**: A finding cannot enter review without meeting evidence sufficiency thresholds. Evidence gates are structural, not advisory.
2. **Review as Decision Joint**: The transition from review to approval requires human authority. This is a decision joint that cannot be bypassed.
3. **Approval as Decision Joint**: The transition from approval to publication requires human authority. The approver's identity, scope, and justification are recorded.
4. **Revision as Governed Return**: When a finding is sent back for revision, it returns to a defined state with specific conditions that must be met before re-entering review.
5. **Escalation as Alternative Path**: When standard review or approval is insufficient, the finding enters an escalation path with its own governed transitions.
6. **Publication as Terminal State**: Publication is the terminal state of the finding lifecycle. Published findings carry the complete record of their lifecycle as immutable provenance.

## 7. Key Concepts

- **Finding States**: Draft, Evidence Attached, In Review, Review Approved, Revision Required, In Approval, Approved, Escalated, Published, Retired.
- **Evidence Gate**: The guard condition between Evidence Attached and In Review. Requires minimum evidence count and evidence type compliance.
- **Review Decision Joint**: The human authority gate between In Review and the next state (Review Approved or Revision Required).
- **Approval Decision Joint**: The human authority gate between In Approval and the next state (Approved, Revision Required, or Escalated).
- **Revision Loop**: The governed path from Revision Required back to Draft. The revision loop does not skip states; it re-enters the lifecycle from a defined point.
- **Escalation Path**: The governed path for findings that require authority beyond the standard review/approval chain. Escalation follows its own decision joints.
- **Publication Gate**: The guard condition between Approved and Published. Requires final formatting, recipient assignment, and authorization confirmation.

### Findings State Machine

```
Draft → Evidence Attached → In Review → Review Approved → In Approval → Approved → Published
                         ↘ Revision Required ↗              ↘ Revision Required ↗
                                                           ↘ Escalated ↗
Published → Retired
```

- **Draft**: Finding is created. Narrative is being developed.
- **Evidence Attached**: Required number and types of evidence are linked to the finding. Evidence gate is satisfied.
- **In Review**: Finding is assigned to a reviewer. Reviewer evaluates the finding and its evidence.
- **Review Approved**: Reviewer approves the finding. Finding is ready for approval.
- **Revision Required**: Reviewer or approver requires changes. Finding returns to draft with specific revision notes.
- **In Approval**: Finding is assigned to an approver. Approver evaluates the finding, review record, and evidence.
- **Approved**: Approver approves the finding. Finding is ready for publication.
- **Escalated**: Finding requires escalation beyond standard approval chain.
- **Published**: Finding is released to designated recipients with full lifecycle provenance.
- **Retired**: Published finding is no longer active. Maintained for audit purposes.

## 8. Operational Implications

- Analysts create findings in the Draft state. They cannot skip to review without satisfying evidence gates.
- Reviewers receive findings with evidence attached and provenance visible. They make informed assessments with complete context.
- Approvers receive findings with review records attached. They see who reviewed, what they decided, and what evidence supports the finding.
- Revision loops are tracked. The number of revision cycles, the reasons for each return, and the changes made are part of the finding's provenance.
- Retired findings remain accessible for audit but are clearly marked as inactive. They contribute to organizational knowledge without creating confusion.

## 9. Product Implications

- AuditOS must present the finding lifecycle as a visible pipeline. Users see where each finding is and what transitions are available.
- Evidence gates are enforced by the product. Users cannot transition findings to review without meeting evidence requirements.
- Review and approval interfaces display complete context: finding, evidence, provenance, and prior review/approval records.
- Revision requirements are structured. Reviewers and approvers provide specific revision feedback that is associated with the state transition, not buried in comments.
- The product supports finding templates for different financial intelligence domains (audit, compliance, risk assessment).

## 10. Architecture Implications

- The Findings ASM (Artifact State Machine) is a core service with defined states, transitions, guards, and actions.
- Cross-artifact referential integrity: finding state transitions depend on evidence states (attached, verified).
- Event sourcing records every finding state transition with actor, timestamp, guard evaluation results, and action triggers.
- The state machine engine evaluates guards before permitting transitions. Invalid transitions are rejected with specific guard failure reasons.
- Finding state history is queryable for audit, compliance reporting, and pipeline analytics.

## 11. Governance Implications

- The findings lifecycle enforces governance by construction. Evidence gates prevent unevidenced findings from reaching decision-makers.
- Segregation of duties is enforced: the analyst who drafts a finding cannot review it, and the reviewer who approves it cannot provide final approval.
- Audit compliance documentation is generated from state transition records. Regulators see the complete finding lifecycle with every transition, actor, and justification.
- Finding retirement is governed. Published findings are not deleted; they transition to Retired state with documentation of the reason.

## 12. AI / Intelligence Implications

- AI assists in the Draft state by suggesting finding narratives based on evidence patterns, surfacing relevant evidence from the repository, and flagging anomalies for investigation.
- AI does not occupy the Review or Approval decision joints. These are structurally reserved for human authority.
- AI can prepare review packets that summarize evidence, highlight key findings, and suggest review focus areas. These enhance reviewer efficiency without replacing reviewer judgment.
- AI monitors finding pipelines for anomalies: unusually long review times, frequent revision loops, and escalation patterns. These insights inform process improvement without automating decisions.

## 13. UX Implications

- Finding lifecycle state is prominently displayed. Users see the state machine position, available transitions, and guard conditions at each stage.
- Transition actions are explicit. Users confirm state changes with understanding of what the transition requires and triggers.
- Evidence attachment is integrated into the finding interface. Analysts attach evidence as they draft, and the product tracks evidence gate progress.
- Review and approval interfaces include mandatory justification fields. The product does not permit state transition past decision joints without recorded justification.

## 14. Commercial Implications

- The Findings Lifecycle Framework is a core differentiator for financial intelligence teams. No existing platform offers governed finding lifecycles with evidence gates and structural human authority.
- Finding templates for audit, compliance, and risk assessment accelerate deployment. Teams adopt proven lifecycles rather than building their own.
- The finding lifecycle creates organizational switching costs. Teams that encode their judgment processes in finding workflows accumulate decision infrastructure that is costly to replicate elsewhere.

## 15. Anti-Patterns

- **Ungoverned Drafting**: Allowing findings to circulate as drafts outside the lifecycle. Draft findings should only be visible within the governed lifecycle, not in email or shared documents.
- **Evidence-Optional Review**: Permitting review state transitions without required evidence attached. This defeats the evidence gate and allows unevidenced findings to reach decision-makers.
- **Self-Review**: Configuring the system to allow an analyst to review their own findings. Segregation of duties is structural, not optional.
- **Rubber-Stamp Approval**: Treating approval as a formality that can be executed without engaging the finding content. Approval is a decision joint requiring recorded justification.
- **Skipping Lifecycle States**: Allowing findings to skip review or approval states through configuration. Lifecycle states represent governance requirements, not workflow preferences.
- **Version Confusion**: Creating new findings for revision rather than tracking the lifecycle of a single finding through its revision loops. The finding lifecycle must be a single traceable thread.

## 16. Examples

- An analyst creates a finding about a revenue recognition anomaly. The finding enters the Draft state. The analyst attaches three evidence artifacts (transaction data, policy document, interview notes). The evidence gate is satisfied, and the finding transitions to Evidence Attached. The state machine routes the finding to a designated reviewer.
- A reviewer evaluates the finding, determines that the evidence supports the conclusion but the narrative needs clarification, and transitions the finding to Revision Required with specific feedback. The analyst revises the narrative and the finding re-enters the review cycle. The revision loop is recorded in the finding's state history.
- An approver reviews the finding, the review record, and the supporting evidence. They transition the finding to Approved with a recorded justification. The finding is then published to the designated audit committee with the complete lifecycle provenance attached.

## 17. Enterprise Impact

- Finding quality becomes measurable. Organizations track evidence sufficiency at review gates, revision loop frequency, and approval cycle time.
- Audit readiness increases. Finding lifecycles with complete state histories satisfy regulatory requirements for decision traceability.
- Organizational learning accelerates. Revision loop analysis reveals common finding deficiencies, enabling targeted analyst training and template improvement.

## 18. Long-Term Strategic Importance

The Findings Lifecycle Framework is the most immediately valuable component of AQLIYA's workflow system because findings are the primary deliverable of financial intelligence work. As AQLIYA expands into other domains, the lifecycle pattern generalizes: every domain has an artifact class that progresses through governed lifecycles with evidence gates and human decision joints. The Findings Lifecycle Framework is the proof of concept for governed artifact lifecycles across Enterprise Decision Intelligence.

## 19. Related Documents

- 07.01 — Workflow Intelligence Theory (domain overview)
- 07.03 — Workflow State Theory (state machine formalization)
- 07.04 — Human-In-The-Loop Workflow Theory (decision joint theory)
- 07.06 — Evidence Lifecycle Framework (evidence artifact lifecycle)
- 07.07 — Review Lifecycle Framework (review artifact lifecycle)
- 07.08 — Approval Lifecycle Framework (approval artifact lifecycle)
- 06.01 — Evidence Theory (evidence as the unit of trust)

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed. Added EDI Infrastructure, complete doctrinal language, evidence-as-trust grounding.