---
title: Approval Model
document_id: 20.10
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents: 17.01, 17.05, 17.12, 20.01, 20.03, 20.08, 20.09, 01.07
---

# Approval Model

## 1. Purpose

This document defines the canonical Approval Model — the structural specification for how AQLIYA represents, governs, and tracks formal approvals within decision intelligence workflows. Approval is the act of authorizing a decision, finding, or action, signifying that a qualified human has reviewed the supporting evidence, exercised professional judgment, and accepted professional accountability for the outcome. The Approval Model defines approval as a governed event with authority requirements, evidence prerequisites, delegation rules, and audit trails. It is the mechanism through which AQLIYA enforces that every significant action in a governed workflow has been authorized by an appropriately qualified person.

## 2. Thesis

Approval in AQLIYA is not a digital signature or a status change. It is a governed authorization event that transfers professional accountability from the system to a human. When a partner approves a finding, they are accepting professional responsibility for that finding. When a manager approves an evidence verification, they are confirming that the evidence meets professional standards. Approval carries weight — legal, regulatory, and professional — and the Approval Model treats it with the structural rigor that weight demands. Every approval requires defined authority, verified prerequisites, and documented reasoning. Every approval is recorded, attributable, and auditable.

## 3. Problem

In current audit and governance practice, approvals are managed through email confirmations, digital signature stamps, and sign-off sheets. The approval process is assumed rather than enforced. A finding is "approved" when the partner emails their agreement. An evidence verification is "approved" when the reviewer checks a box. There is no enforcement that the approver had the authority to approve, that they reviewed the required evidence, or that they considered the relevant governance context.

The consequences are significant. Regulators challenge approvals that lack documented authority. Quality reviewers find findings approved by staff who were not authorized. Partners discover that approvals were given without reviewing the evidence bundle. The gap between the professional significance of approval and the structural rigor of its execution is a source of risk that the Approval Model closes.

## 4. Why Existing Systems Fail

**Email-based approval** has no authority verification, no evidence linkage, no governance enforcement, and no audit trail beyond email headers. It is the most common and the least rigorous approval mechanism in current practice.

**Digital signature solutions** provide identity verification and non-repudiation but do not enforce authority, evidence prerequisites, or governance conditions. A digital signature confirms who approved, not whether they were authorized or what they reviewed.

**Workflow sign-off fields** allow an approver to click a button confirming approval. There is no enforcement of prerequisites, no record of what the approver reviewed, and no governance check on their authority.

**Checklist approvals** confirm that a step was completed, not that a professional judgment was exercised. Checking a box is not the same as reviewing evidence and accepting accountability.

**Layered email threads** document approval discussions but provide no structured record of authority, prerequisites, governance conditions, or reasoning.

The common failure: approval is treated as a confirmation step, not as a governed authorization event. AQLIYA treats approval as a first-class governance event with defined authority, enforced prerequisites, and documented outcomes.

## 5. AQLIYA Philosophy

The Approval Model reflects the principle that the human is accountable. Every approval transfers accountability from the system to a human. The system generates recommendations, surfaces evidence, and detects risk signals — but the human authorizes the outcome and accepts professional responsibility. This accountability transfer is the most significant moment in any governed workflow, and the Approval Model treats it with the structural rigor that significance demands.

Approval is also a governance enforcement point. The model enforces that approvals are given only by authorized individuals, only after required prerequisites are met, and only with documented reasoning. This is governance made structural, not procedural.

## 6. Core Principles

1. **Approval is an authorization event.** Approval signifies that a qualified human has reviewed the evidence, exercised judgment, and accepted accountability. It is not a status change or a digital stamp.

2. **Approval requires authority.** Every approval type has defined authority requirements: role, qualification, engagement assignment, and governance context. Only individuals meeting these requirements can approve.

3. **Approval requires prerequisites.** Before an approval can be given, defined prerequisites must be met: evidence sufficiency, prior review completion, governance conditions. Prerequisites are enforced, not suggested.

4. **Approval is attributable.** Every approval is recorded with the approver's identity, role, authority, and the datetime of approval. The approver owns the authorized outcome.

5. **Approval has reasoning.** Approvers may document their reasoning, and high-risk approvals require documented reasoning. Approval reasoning is a professional artifact.

6. **Approval is governed by delegation.** Authority can be delegated, but delegation is explicit, governed, and recorded. Delegated approval authority has defined scope and duration.

7. **Approval creates audit trails.** Every approval is an immutable record. Approval history cannot be modified after the fact. Corrections are made through new approvals, not through edits.

8. **Approval enables escalation.** When an approver does not have authority for a specific item, the item is escalated through defined authority chains. Escalation is governed, not ad-hoc.

## 7. Key Concepts

- **Approval Object:** The canonical data entity. Fields: approval_id, type, item_ref, approver, approver_authority, prerequisites_verified, reasoning, outcome, delegation_ref, governance_context, timestamp.

- **Approval Type:** A taxonomy of approval categories. Examples: finding_approval, evidence_verification_approval, risk_assessment_approval, engagement_completion_approval, scope_change_approval.

- **Approval Authority:** The role, qualification, and governance context that permits an individual to approve a specific type. Authority is defined per approval type and per governance context.

- **Approval Prerequisites:** The conditions that must be met before an approval can be given. Prerequisites include: evidence sufficiency threshold met, prior review completed, governance conditions satisfied.

- **Approval Reasoning:** The approver's documented explanation for the approval decision. Required for high-risk approvals, optional for standard approvals.

- **Approval Delegation:** The explicit transfer of approval authority from one individual to another, with defined scope, duration, and governance conditions. Delegation is recorded and governed.

- **Approval Escalation:** The routing of an approval to a higher authority when the current approver does not have sufficient authority. Escalation follows defined authority chains.

- **Approval Chain:** The sequence of approvals required for an item based on its type and risk level. A material misstatement finding may require staff review, manager review, and partner approval — a three-level approval chain.

- **Approval Audit Trail:** The immutable record of every approval event, including approver identity, authority, prerequisites, reasoning, outcome, and timestamp. The audit trail is the defensible record of professional authorization.

- **Approval Exception:** A governed override of approval prerequisites or authority requirements. Exceptions are recorded, justified, approved by a higher authority, and flagged for quality review.

## 8. Operational Implications

1. Approval authority matrices must be defined before engagement work begins. Who can approve what, at what level, and under what conditions is a governance decision that must be configured in the system.

2. Approval chains must be configured per approval type and risk level. A low-risk finding requires a different approval chain than a critical finding. Chains are derived from firm policy and engagement governance profiles.

3. Delegation policies must be explicit. Who can delegate approval authority, to whom, for how long, and with what scope is governed by firm policy, not by individual preference.

4. Approval bottlenecks must be monitored. Approval queues that exceed defined timeframes trigger escalation and resource reallocation.

5. Approval consistency must be measured. Approvers with unusual patterns — consistently approving without reasoning, consistently overriding recommendations — are flagged for quality review.

## 9. Product Implications

1. Approval must be a deliberate, informed action. The approver sees the item, the evidence, the prior reviews, and the governance context before confirming approval. Approval is not a single click; it is a reviewed judgment.

2. Approval prerequisites must be auto-verified. Before an approval can be given, the system checks: is the evidence sufficient? Has the item been reviewed by the required authority? Are governance conditions met?

3. Approval queues must show priority, risk level, and time sensitivity. Approvers manage their queues based on professional urgency, not arrival order.

4. Delegation must be a governed action within the product. Approvers can delegate authority, but delegation is recorded, scoped, and time-limited. Delegated approvals are flagged for quality review.

5. Approval history must be accessible from any item. "Who approved this finding and what did they authorize?" must be answerable in one click.

6. Approval exceptions must be rare and governed. The product makes exceptions possible with appropriate overhead, not convenient.

## 10. Architecture Implications

1. The Approval Object is a first-class entity with its own schema, lifecycle, and event stream. Approvals are not embedded in items; they are linked through foreign keys.

2. Approval authority is enforced by the governance engine. The engine checks the approver's role, qualification, engagement assignment, and authority level before permitting the approval.

3. Approval prerequisites are evaluated by the workflow engine. The engine verifies evidence sufficiency, review completion, and governance conditions. Prerequisites not met block the approval.

4. Approval delegation is a governed configuration. Delegation authority, scope, and duration are stored and enforced. Delegated approvals are flagged in the audit trail and in quality review reports.

5. Approval chains are defined per approval type and risk level. The system routes items through the required approval chain, enforcing that lower-level approvals occur before higher-level approvals.

6. Approval events are emitted to the event bus for downstream consumers: dashboards, analytics, quality reporting, and governance monitoring.

7. Approval audit trails are immutable and tamper-evident. Approval records cannot be modified after the fact. Corrections are made through new approvals with documented reasoning.

## 11. Governance Implications

1. Approval authority is a governance configuration. Defining who can approve what, at what level, and under what conditions is a professional governance decision embedded in the system.

2. Approval chains are governance artifacts. The sequence of approvals required for each item type and risk level is a professional standard, not a technical configuration.

3. Delegation is explicitly governed. Approval authority cannot be delegated without a record of who delegated, to whom, for what scope, and for what duration. Delegation policies are firm-level governance.

4. Approval exceptions are quality flags. Any approval that bypasses prerequisites or authority requirements is recorded, justified, and flagged for quality review. Exception rates are quality metrics.

5. Approval audit trails are regulatory artifacts. In audit and governance, the approval record is a required component of the workpaper. The Approval Model captures this record as structured data.

6. Approval consistency is monitored. Approval patterns that deviate from norms — unusual override rates, consistent approvals without reasoning — are flagged for quality review and professional development.

## 12. AI / Intelligence Implications

1. AI-assisted approval preparation surfaces the relevant evidence, prior reviews, governance context, and similar approvals to help the approver make an informed judgment.

2. AI-driven approval routing suggests the appropriate approval chain based on item type, risk level, and engagement governance profile. Routing suggestions are validated by the governance engine.

3. Approval pattern analysis identifies unusual approval patterns: approvers who consistently approve without reasoning, items that consistently require escalation, and approval chains that consistently experience delays.

4. Approval prerequisite checking is assisted by AI: verifying evidence sufficiency, checking governance conditions, and flagging potential issues before the approver reviews the item.

5. AI does not approve items. Approval is a human authorization event. AI assists preparation and verification, but the approval decision is always a human judgment.

## 13. UX Implications

1. The approval interface must present the complete context: the item, the evidence, the prior reviews, the recommendation, and the governance requirements. The approver makes an informed judgment, not a blind confirmation.

2. Approval must require explicit confirmation. Accept, modify, or reject are distinct actions, each with its own confirmation and optional reasoning field.

3. Approval delegation must be accessible from the approval interface. "Delegate this approval" opens a governed delegation form with scope, duration, and justification fields.

4. Approval queues must be organized by priority, risk level, and time sensitivity. High-risk items and overdue approvals appear first.

5. Approval history must be inline. The approver sees the complete approval chain for an item without leaving the interface.

6. Approval reasoning must be structured for high-risk items. Common reasoning categories plus a free-text option.

## 14. Commercial Implications

1. The Approval Model directly addresses audit partner needs. Partners need governable, attributable, efficient approval workflows. This is a high-value capability that partners evaluate.

2. Proof-of-value metrics: approval cycle time, approval authority compliance, approval prerequisite compliance, and approval exception rate.

3. Governed approval is a regulatory differentiator. Firms that can demonstrate system-enforced approval authority, prerequisite verification, and audit trails have a defensible quality position.

4. Approval feedback (which items were approved, modified, or rejected) enriches the AI layer and improves recommendation quality over time.

5. Delegation management enables partners to delegate routine approvals while maintaining governance. This increases throughput without reducing quality.

## 15. Anti-Patterns

1. **Approval as Confirmation.** Treating approval as a confirmation click rather than a governed authorization event. Approval must require evidence review, prerequisite verification, and deliberate choice.

2. **Approval Without Prerequisites.** Allowing approvals to be given before evidence sufficiency, review completion, and governance conditions are verified. Prerequisites protect the integrity of the approval.

3. **Untracked Delegation.** Allowing approval authority to be delegated informally without recording who delegated to whom, for what scope, and for how long. Delegation must be explicit and governed.

4. **Approval as Bottleneck.** Routing all approvals through a single individual regardless of item type or risk level. Approval chains should be configured to route items to the appropriate authority.

5. **Approval Without Reasoning.** Allowing high-risk approvals without documented reasoning. Approval reasoning is a professional and regulatory requirement for significant judgments.

6. **Approval Bypass.** Allowing items to proceed without approval by treating approval as optional or by accepting informal verbal approvals that are not recorded.

7. **Approval Theater.** Performing approvals without reviewing the evidence or exercising judgment. A digital stamp on an unreviewed item is not an approval — it is theater.

## 16. Examples

**Example 1: Finding Approval Chain.** A material misstatement finding requires a three-level approval chain: staff auditor review, manager review, partner approval. The staff auditor reviews the finding and its evidence bundle, confirms the classification, and marks the finding as reviewed. The manager reviews the finding, confirms the risk level, adds a note about the materiality calculation, and marks the finding as manager-reviewed. The partner reviews the finding, confirms the finding is appropriate for inclusion in the audit report, and approves it. Each step is recorded with the reviewer's identity, authority, reasoning, and timestamp.

**Example 2: Approval Delegation.** The engagement partner is unavailable for three days. They delegate approval authority for low-risk findings to the engagement manager, with scope limited to findings below the materiality threshold and duration limited to three days. All delegated approvals during this period are flagged for the partner's review upon return.

**Example 3: Approval Exception.** A finding must be approved before a regulatory deadline, but one evidence item in the bundle is still pending verification. The partner reviews the finding, confirms that the remaining evidence item is not material given the other corroborating evidence, and approves with an exception. The exception is recorded with the partner's reasoning, approved by the quality review committee, and flagged in the quality review report.

## 17. Enterprise Impact

1. **Governance Enforcement.** System-enforced approval authority, prerequisites, and chains ensure that approvals are given by the right people under the right conditions. Governance is structural.

2. **Professional Accountability.** Attributable approvals create clear accountability. Who approved what, under what authority, with what reasoning — all recorded and auditable.

3. **Approval Efficiency.** Structured approval workflows with auto-verified prerequisites, organized queues, and governed delegation reduce approval cycle time without sacrificing rigor.

4. **Regulatory Defensibility.** Complete approval audit trails provide regulators with transparent records of who authorized what, when, and why. This reduces regulatory friction.

5. **Delegation Governance.** Explicit delegation policies enable partners to delegate routine approvals while maintaining governance integrity. Delegation increases throughput without reducing quality.

6. **Quality Measurement.** Approval consistency analysis enables firms to measure approval quality, identify training needs, and improve professional development.

## 18. Long-Term Strategic Importance

The Approval Model is the mechanism through which professional accountability becomes enforceable. In regulated domains, approval is not a convenience — it is a legal and professional requirement. The model makes approval structurally rigorous: authority is verified, prerequisites are enforced, reasoning is documented, and accountability is recorded.

Long-term, the Approval Model extends to any domain where formal authorization is required. Financial reporting approvals, compliance certifications, risk assessment sign-offs — every domain where a qualified human must authorize a formal outcome uses the same structural model.

The approval audit trail is also a data source for organizational intelligence. Approval patterns — who approves what, with what reasoning, under what conditions — reveal organizational decision-making patterns that can improve governance, resource allocation, and professional development.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 20.01 | Decision Model | Approval is the authorization event in the decision lifecycle |
| 20.03 | Finding Model | Findings require approval through the Approval Model |
| 20.08 | Workflow State Model | Approval is a governance gate that permits state transitions |
| 20.09 | Review Model | Review precedes approval in the governance chain |
| 01.07 | Governance-First Company Philosophy | Approval is the primary governance enforcement mechanism |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial reference model specification |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. Human accountability principle codified — approval as governed authorization event. Added cross-references to 17.01, 17.05, 17.12. |