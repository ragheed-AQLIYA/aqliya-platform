---
title: Review Lifecycle Framework
document_id: 07.07
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents:
  - 07.01
  - 07.03
  - 07.04
  - 07.05
  - 07.08
  - 07.09
---

# Review Lifecycle Framework

## 1. Purpose

This document specifies the state machine governing the lifecycle of review artifacts within AQLIYA's Enterprise Decision Intelligence Infrastructure. Reviews are the first human decision joint after evidence attachment—they are the quality gate that determines whether a finding is sufficiently supported and accurately represented. This framework defines the states a review occupies, the transitions between those states, and the authority requirements that govern review execution.

## 2. Thesis

Review is not a procedural formality. It is a governed decision joint where a qualified human evaluates a finding's evidentiary support, analytical accuracy, and logical coherence. The Review Lifecycle Framework ensures that reviews are structurally required, authority-scoped, and traceable. No finding progresses past review without a recorded human assessment that the finding meets the organization's quality standards.

## 3. Problem

In current enterprise practice, review is the most commonly degraded decision joint:

- **Rubber-stamp review**: Reviewers approve findings without meaningful evaluation, treating review as a procedural step rather than a quality gate.
- **Unscoped review**: Anyone with access can review any finding, regardless of their expertise or authority to evaluate the finding's subject matter.
- **Unrecorded review**: Review outcomes are communicated verbally, via email, or in marginal comments. The review record is incomplete or nonexistent.
- **Root-cause-free review**: Reviewers approve or reject without documenting their reasoning, making review outcomes unaccountable and unreviewable.
- **Review bypass**: Workflows allow configurable review steps that can be skipped for urgency or priority, removing the quality gate entirely.

The Review Lifecycle Framework replaces this degradation with a governed state machine that enforces review quality, authority, and record.

## 4. Why Existing Systems Fail

- **Document review tools** (Word track changes, Google Docs comments) support commenting but not governed review. Review is a suggestion, not a decision joint.
- **Task management systems** (Jira, Asana) model review as a task assignment with a completion checkbox. There is no quality gate, no authority requirement, and no structured outcome recording.
- **Audit management platforms** (AuditBoard, Workiva) include review workflows but treat review as configurable. Review steps can be added, removed, or modified, eliminating structural guarantees.
- **Email-based review** has no state model. The review "process" is a thread where the last reply is the review outcome, with no structure for assessment, justification, or authority.

These systems fail because they treat review as a task, not a governed decision joint with authority requirements and quality obligations.

## 5. AQLIYA Philosophy

AQLIYA models review as the first governed decision joint in the finding lifecycle, grounded in the doctrine: AI assists. Humans decide. Evidence governs. Structural commitments:

- Review is required. No finding progresses past review without a recorded human assessment.
- Review authority is scoped. Reviewers are assigned based on expertise, role, and organizational responsibility.
- Review outcomes are structured. Reviewers record their assessment (approve, request revision, escalate) with mandatory justification.
- Review is a segregation of duties enforcement point. The finding author cannot be the finding reviewer.
- Evidence gates precede review: the reviewer receives a finding whose evidence has already met sufficiency thresholds.
- AI assists the reviewer by preparing review packets, highlighting evidence, and identifying potential issues, but never occupies the review decision joint.

## 6. Core Principles

1. **Review as Decision Joint**: Review is a structurally required human authority point. It cannot be bypassed, configured away, or auto-approved.
2. **Authority-Scoped Review**: Reviewers are assigned based on defined authority scopes. A reviewer must have the expertise and organizational authority to evaluate the finding's subject.
3. **Structured Assessment**: Review outcomes are not free-text comments. They are structured records with assessment types, severity ratings, and mandatory justification.
4. **Segregation of Duties**: The finding author and finding reviewer must be different individuals with different authority scopes. Self-review is structurally prohibited.
5. **Review Completeness**: Reviewers must evaluate all components of a finding (narrative, evidence, risk assessment, recommendations) before recording their assessment.
6. **Review Record Immutability**: Once recorded, review assessments are immutable. They become part of the finding's provenance and cannot be edited to change the review outcome.

## 7. Key Concepts

- **Review States**: Pending Assignment, Assigned, In Progress, Completed, Revision Requested, Escalated.
- **Review Assignment**: The governed process of assigning a reviewer with appropriate authority scope to a finding. Assignment considers expertise, role, workload, and organizational responsibility.
- **Review Assessment**: The structured record of the reviewer's evaluation. Includes assessment outcome (approve, request revision, escalate), justification, and specific findings or concerns.
- **Review Completeness Gate**: The guard condition requiring the reviewer to evaluate all finding components before recording their assessment.
- **Revision Request**: The outcome when a reviewer determines the finding requires changes. Includes specific revision requirements that the analyst must address.
- **Escalation from Review**: The outcome when a reviewer determines the finding requires evaluation beyond their authority scope. The finding enters the escalation path.

### Review State Machine

```
Pending Assignment → Assigned → In Progress → Completed → (finding transitions to In Approval)
                                  ↘ Revision Requested → (finding returns to Draft)
                                  ↘ Escalated → (finding enters escalation path)
```

- **Pending Assignment**: Review is required but no reviewer has been assigned. The system or a review coordinator assigns based on authority scope.
- **Assigned**: A reviewer with appropriate authority scope has been assigned. The reviewer has access to the finding and its evidence.
- **In Progress**: The reviewer is actively evaluating the finding. Review preparation materials (AI-generated summaries, evidence highlights) are available.
- **Completed**: The reviewer has recorded their assessment. If approved, the finding transitions to In Approval. If revision is requested, the finding returns to Draft.
- **Revision Requested**: The reviewer requires changes to the finding. Specific revision requirements are recorded as structured feedback.
- **Escalated**: The reviewer determines the finding requires authority beyond their scope. The finding enters the escalation framework.

## 8. Operational Implications

- Review assignment is authority-aware. The system or review coordinator assigns reviewers based on expertise, role, and organizational scope, not rotation or availability.
- Reviewers receive complete context: the finding narrative, attached evidence with provenance, AI-prepared review materials, and any prior revision history.
- Review assessments are structured. Reviewers record their evaluation using defined assessment categories and mandatory justification, not free-text comments.
- Revision requests include specific, structured feedback. Analysts receive clear guidance on what needs to change and why, reducing revision loop iterations.
- Review workload is visible. Review coordinators and pipeline managers see review assignment distribution and completion velocity.

## 9. Product Implications

- AuditOS provides a review interface that displays the finding, evidence, provenance, and AI-prepared materials in a single view.
- Review assessment requires filling structured fields: assessment outcome, justification, specific concerns. Free-text is supported but structured fields are mandatory.
- Review assignment considers authority scope. The product suggests reviewers based on expertise and role, and prevents assignment of unqualified reviewers.
- Review workload is visible in pipeline dashboards. Reviewers see their assignments; coordinators see distribution and velocity.
- Revision requests are structured and linked to the finding's state transition. The revision loop is tracked as part of the finding's provenance.

## 10. Architecture Implications

- The Review ASM (Artifact State Machine) is a core service with defined states, transitions, guards, and actions.
- Cross-artifact referential integrity: review state gates finding state. A finding cannot transition past the review gate unless its review is in Completed state.
- Review authority assignment is managed by a governance layer that enforces segregation of duties and scope requirements.
- Review assessments are immutable records. Once recorded, they cannot be modified. Corrections are recorded as new assessments appended to the review record.
- AI review preparation services operate in the assistive lane, generating review packets that summarize evidence, highlight potential issues, and suggest focus areas.

## 11. Governance Implications

- Review is a governance control activity. Review records satisfy SOX, SOC 2, and ISO 27001 requirements for supervisory review of analytical work.
- Segregation of duties is structurally enforced. The system prevents self-review and cross-assignment of conflicting authority scopes.
- Review authority scopes can be audited. Regulators can verify that reviews were performed by individuals with appropriate expertise and organizational responsibility.
- Review assessment records are compliance documentation. Organizations do not need to assemble review evidence manually; it is a structural property of the system.

## 12. AI / Intelligence Implications

- AI prepares review packets that summarize findings and evidence, highlight potential issues, and suggest areas of focus. These enhance reviewer efficiency without replacing reviewer judgment.
- AI identifies review patterns: common revision reasons, frequent escalation triggers, and review quality metrics. These insights inform process improvement.
- AI does not occupy the review decision joint. The assessment (approve, request revision, escalate) is a human authority action recorded with justification.
- AI can flag anomalies in review patterns: disproportionately fast reviews (rubber-stamping), consistent self-revision loops, or reviewer workload imbalances.

## 13. UX Implications

- The review interface presents all relevant information in a structured layout: finding narrative, evidence with provenance, AI-prepared summary, and prior review history if applicable.
- Assessment fields are mandatory and structured. The product does not allow review completion without recorded assessment outcome and justification.
- Reviewer authority scope is displayed. Reviewers see their scope and cannot accept reviews outside their authority.
- Revision requests are linked to the finding state transition. Analysts see specific, structured feedback rather than informal comments.

## 14. Commercial Implications

- Structured review is a direct response to regulatory requirements for supervisory review in financial intelligence. AuditOS delivers review as a governance guarantee, not a configurable option.
- Review quality metrics enable organizations to measure and improve their review processes. Review completion time, revision loop frequency, and escalation rates become actionable data.
- The review framework creates defensibility. Organizations can demonstrate that reviews were performed by qualified individuals with recorded assessments and justifications.

## 15. Anti-Patterns

- **Rubber-Stamp Review**: Completing review assessments without meaningful evaluation. Structured assessment fields with mandatory justification discourage rubber-stamping, and review velocity metrics flag it.
- **Self-Review**: Allowing the finding author to review their own finding. Segregation of duties is structurally enforced; self-review is impossible in the system.
- **Unscoped Review**: Assigning any reviewer to any finding regardless of expertise. Authority scope requirements prevent unqualified review.
- **Free-Form Assessment**: Allowing reviewers to provide only free-text assessment without structured evaluation. Structured fields are mandatory; free-text is supplementary.
- **Review Bypass for Urgency**: Configuring the workflow to skip review for high-priority findings. Review is a structural requirement; urgency is addressed through review velocity, not review removal.
- **Editable Review Records**: Allowing reviewers to modify their assessments after recording. Review records are immutable. Corrections are appended, not overwritten.

## 16. Examples

- A senior auditor is assigned to review a finding about expense report irregularities. Their authority scope includes financial audit within the relevant business unit. They receive a review packet with AI-prepared evidence summaries and anomaly highlights. They evaluate the finding, approve it with a structured assessment and justification, and the finding transitions to In Approval.
- A compliance specialist reviews a finding about regulatory non-compliance. They determine that the finding's risk assessment is understated and request revision with specific structured feedback. The finding returns to the analyst for revision with the review record and revision requirements attached.
- A risk analyst reviews a finding about credit risk concentration. They determine that the finding requires evaluation by a more senior risk officer and escalate the review. The finding enters the escalation framework with the review record indicating the escalation reason.

## 17. Enterprise Impact

- Review quality becomes measurable and improvable. Organizations track review metrics across reviewers, teams, and time periods.
- Review defensibility increases. Regulators see structured assessments by qualified reviewers with recorded justifications, not informal approval comments.
- Review efficiency improves through AI-assisted review preparation. Reviewers spend less time gathering context and more time evaluating findings.

## 18. Long-Term Strategic Importance

The Review Lifecycle Framework establishes the first human decision joint in AQLIYA's finding pipeline. As AQLIYA expands, the review pattern generalizes: every decision pipeline has quality gates where qualified humans evaluate work products before they proceed. The review framework—authority-scoped, structured, immutable, and AI-assisted—becomes the standard for quality gates across Enterprise Decision Intelligence.

## 19. Related Documents

- 07.01 — Workflow Intelligence Theory (domain overview)
- 07.03 — Workflow State Theory (state machine formalization)
- 07.04 — Human-In-The-Loop Workflow Theory (decision joint theory)
- 07.05 — Findings Lifecycle Framework (finding artifact lifecycle)
- 07.08 — Approval Lifecycle Framework (approval artifact lifecycle)
- 07.09 — Escalation Framework (escalation path specification)

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed. Added EDI Infrastructure, complete doctrine, evidence gate connection to review.