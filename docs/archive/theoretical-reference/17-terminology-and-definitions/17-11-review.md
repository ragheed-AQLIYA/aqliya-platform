---
title: Review
document_id: 17.11
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 4 — Definition
related_documents: 17.02, 17.04, 17.05, 17.10, 17.12, 17.13, 10.04, 08.07
---

# Review

## 1. Purpose

This document defines "Review" as the structured human evaluation stage within AQLIYA's governed workflows. Review is the step where evidence is validated, findings are assessed, recommendations are evaluated, and decisions are challenged before they advance to approval. Without a precise definition, review collapses into a procedural checkbox — reviewed but not actually evaluated, signed off but not truly examined.

## 2. Thesis

Review in AQLIYA is a governed, structured, evidence-anchored evaluation of work performed within an engagement. It is not a sign-off ceremony. It is an analytical process where a qualified reviewer examines evidence, challenges conclusions, evaluates sufficiency, and documents their assessment. The reviewer is the human safeguard between intelligence output and final decision. AI assists the review process but does not perform it. Review is where professional judgment is exercised, documented, and made traceable.

## 3. Problem

1. **Rubber-stamp review.** Review becomes a procedural formality — reviewers sign off without substantive examination because time pressure, workload, or cultural norms discourage challenge.
2. **Review without evidence.** Findings and decisions are reviewed without direct access to the supporting evidence. The reviewer evaluates the conclusion in isolation, not the evidence-conclusion chain.
3. **Review scope ambiguity.** It is unclear what constitutes a review — whether it means reading the report, checking the evidence, validating the methodology, or all of the above.
4. **Review feedback loss.** Reviewer comments, questions, and challenges are communicated verbally or via email, leaving no trace for future reviewers, regulators, or performance evaluation.

## 4. Why Existing Systems Fail

**Audit management platforms** provide review checklists but do not connect the review action to the evidence under review. A reviewer can mark a finding as "reviewed" without ever examining the supporting evidence.

**Document review tools** focus on document-level comments and track changes but do not support review of structured objects — evidence, findings, decisions, signals — with their own review lifecycles.

**Email and conversation threads** are where substantive review feedback actually occurs — unstructured, untraceable, and invisible to anyone not on the thread.

**Approval workflows** conflate review with approval. A reviewer who has not performed substantive review can still advance the workflow to the next stage.

The common failure: review is a status marker, not a structured analytical process. The system does not distinguish between "reviewed" and "examined."

## 5. AQLIYA Philosophy

Review in AQLIYA has four defining characteristics:

1. **Evidence-anchored.** Review evaluates the evidence-conclusion relationship, not the conclusion in isolation. The reviewer examines what evidence supports the finding, whether the evidence is sufficient, and whether alternative conclusions were considered.
2. **Structured output.** Review produces a documented assessment — accepted, accepted with conditions, returned for revision, or rejected. The assessment is part of the governance record.
3. **Traceable.** Every review action, question, challenge, and decision is logged with reviewer identity, timestamp, scope of review, and assessment rationale.
4. **Human-required.** Review is performed by a qualified human professional. AI can assist — surfacing evidence gaps, flagging inconsistencies, suggesting review questions — but the review judgment is human.

## 6. Core Principles

1. **Review is not approval.** Review evaluates. Approval authorizes. The two are distinct and should not be conflated.
2. **Evidence-anchored review.** A finding cannot be reviewed without examining the evidence that supports it. Review of isolated conclusions is not review.
3. **Review leaves a trace.** Every review action — every question, challenge, acceptance, or return — is recorded in the governance log.
4. **Review has scope.** The scope of review (which findings, which evidence, which time period) is documented before the review begins.
5. **Review is independent.** The reviewer should not be the person who performed the work under review. Independence is a governance requirement, not an administrative preference.

## 7. Key Concepts

- **Review Object:** A structured record of a review action: what was reviewed (finding, evidence, recommendation), who reviewed it, when, the assessment outcome, the rationale, and any conditions.
- **Review Scope:** The defined boundaries of a review — which objects, what time period, what depth of examination. Scope is documented before review begins.
- **Review Assessment:** The outcome of a review: accepted, accepted with conditions, returned for revision, or rejected. Each outcome has defined implications for the workflow.
- **Review Condition:** A requirement attached to an accepted-with-conditions assessment. The condition must be satisfied before the object advances to the next stage.
- **Review Evidence Chain:** The documented link between a review and the evidence examined during that review, preserved in the governance record.
- **Review Independence:** The requirement that the reviewer has no direct responsibility for the work under review, documented and verified before review assignment.

## 8. Operational Implications

1. Every engagement requires a review plan that defines review scope, reviewer assignment, and independence verification before review begins.
2. Review assignments consider reviewer qualifications, independence, workload, and capacity. Unqualified or conflicted reviewers are prevented by the system.
3. Review produces a documented assessment with rationale. A reviewer cannot mark an object as reviewed without recording their assessment.
4. Review conditions are tracked through resolution. Objects with unsatisfied conditions cannot advance to the next workflow stage.
5. Review feedback loops back to the originator — the person who performed the work receives the reviewer's assessment, questions, and conditions.
6. Review metrics (review cycle time, first-pass yield, return rate, condition resolution rate) are tracked per-reviewer and per-engagement.

## 9. Product Implications

1. Review is a distinct workflow state with its own views and interactions — not a checkbox or a status dropdown.
2. The review view shows the finding or recommendation alongside its supporting evidence. The reviewer evaluates both in context.
3. Review assessment is a structured action with predefined outcomes and a required rationale field.
4. Review conditions are tracked objects — assigned to the originator, with due dates and resolution workflows.
5. Review history is displayed on every object — who reviewed it, when, what assessment was given, and what conditions were attached.
6. Review dashboards show reviewer workload, pending items, aging conditions, and quality metrics.

## 10. Architecture Implications

1. The review object is a first-class entity with schema: reviewer, timestamp, scope, assessment, rationale, conditions, and evidence references.
2. Review is integrated into the workflow engine. Objects cannot transition past the review state without a review assessment.
3. The review assessment outcome determines workflow routing — accepted objects advance, returned objects route back to the originator, rejected objects trigger escalation.
4. Review conditions are independent objects linked to their parent object and tracked through resolution.
5. Review evidence references are stored as relationships — the review object references the specific evidence examined during the review.

## 11. Governance Implications

1. Review governance defines: who can perform reviews, what qualifications are required, what independence rules apply, and what review scope minimums are mandatory.
2. Independence verification is documented before review assignment. Conflicted reviewers are flagged by the system.
3. Review assessment rationale is part of the governance record and can be inspected by regulators, quality reviewers, and engagement partners.
4. Review conditions have governance implications — unresolved conditions at engagement close are flagged as governance exceptions.
5. Review quality is monitored through organizational review metrics: return rates, condition resolution patterns, and reviewer consistency.

## 12. AI / Intelligence Implications

1. Intelligence assists review by surfacing evidence gaps, flagging inconsistencies between evidence and conclusions, and suggesting review questions.
2. Intelligence does not perform review. The human reviewer remains the sole authority for review assessment.
3. Intelligence can recommend review scope — identifying which findings have sufficient evidence depth to warrant review and which need additional evidence before they can be reviewed.
4. Intelligence analyzes reviewer patterns to identify potential quality issues — reviewers who consistently accept without conditions, reviewers who reject more than the norm, reviewers whose assessments diverge from peers.
5. Intelligence surfaces review conditions that are aging or at risk, helping reviewers and engagement managers prioritize.

## 13. UX Implications

1. The review interface presents the object under review alongside its evidence in a split view — conclusion on one side, supporting evidence on the other.
2. Review assessment actions are primary interactions — accept, accept with conditions, return, reject — each with clear visual differentiation.
3. Conditions are entered inline with the review assessment, not as a separate workflow step.
4. Review history is one click away — previous reviews, conditions, and resolutions are visible on the object's timeline.
5. Review dashboards show personalized queues: items assigned for review, pending conditions, and items requiring re-review after condition resolution.

## 14. Commercial Implications

1. Structured review is a governance differentiator. Organizations that demonstrate rigorous, traceable review withstand regulatory scrutiny more effectively.
2. Review cycle time reduction is a measurable pilot outcome — organizations see faster engagement completion when review is structured rather than ad hoc.
3. Review quality analytics provide organizational improvement data — identifying reviewer training needs, process bottlenecks, and quality pattern shifts.
4. The commercial narrative: "AQLIYA makes review a substantive, evidence-anchored, traceable process — not a sign-off checkbox that satisfies auditors but doesn't protect the firm."

## 15. Anti-Patterns

1. **Review as rubber stamp.** Treating review as a procedural checkbox where the reviewer signs off without substantive examination of evidence or conclusions.
2. **Evidence-free review.** Reviewing findings and recommendations without direct access to the supporting evidence — evaluating conclusions in isolation.
3. **Reviewer/approver conflation.** Assigning the same person to both review and approve, collapsing two distinct governance functions into one.
4. **Oral review feedback.** Communicating review feedback verbally or via email rather than through the system's structured review workflow.
5. **Review scope avoidance.** Reviewing without documenting what was examined — how many findings, what evidence, what time period.
6. **Review independence violation.** Assigning a reviewer who performed the work under review, undermining the independence that makes review meaningful.
7. **Review with no conditions tracking.** Allowing review conditions to be forgotten — accepted-with-conditions results where conditions are never tracked or resolved.

## 16. Examples

**Example 1: Finding Review.** A reviewer is assigned to review a material finding about revenue recognition. The review interface shows the finding statement, the evidence objects that support it (customer contracts, bank statements, shipping documents), and the intelligence analysis. The reviewer examines each evidence object, validates the provenance, and assesses whether the evidence is sufficient for the finding's weight. The reviewer accepts the finding with a condition: "Confirm that the three largest contracts have been verified against original signatures." The condition is assigned to the engagement team member who performed the evidence collection.

**Example 2: Review Independence Check.** An engagement manager assigns a reviewer for a complex inventory valuation finding. The system checks the proposed reviewer against the engagement team, previous assignments, and conflict-of-interest declarations. The system flags that the proposed reviewer was the engagement manager on the same client in the prior year — a potential independence concern. The governance team reviews and either confirms independence or reassigns the review. The independence check is documented in the governance record.

**Example 3: Review Return and Resubmission.** A reviewer examines a set of evidence linked to an accounts payable finding. The evidence is incomplete — three confirmation responses are still outstanding. The reviewer returns the finding to the originator with a review assessment of "returned for revision" and a condition: "Obtain outstanding confirmations and re-submit with complete evidence package." The originator receives the return notification, resolves the evidence gap, and resubmits the finding with the additional evidence. The reviewer re-examines the complete package and accepts.

## 17. Enterprise Impact

1. **Regulatory defensibility.** Traceable, evidence-anchored review records demonstrate governance rigor to regulators and quality reviewers.
2. **Quality improvement.** Structured review with documented assessments and conditions drives consistent quality across engagements.
3. **Risk reduction.** Substantive review catches evidence gaps, logical errors, and judgment issues before they reach approval and reporting stages.
4. **Professional development.** Review feedback visible to originators creates a learning loop — reviewers are effectively mentoring through structured conditions.
5. **Performance visibility.** Review metrics provide objective data on review quality, reviewer consistency, and engagement team performance.

## 18. Long-Term Strategic Importance

Review is the human safeguard in AQLIYA's intelligence-to-decision pipeline. If review is treated as a structural, evidence-anchored, traceable process rather than a procedural checkbox, AQLIYA establishes a defensible position in the governance infrastructure market. Organizations that require documented professional judgment — audit firms, financial institutions, regulatory bodies, governance functions — cannot outsource review to a system. But they can use AQLIYA's review infrastructure to make review more rigorous, more efficient, and more traceable.

Long-term, structured review becomes the institutional standard for professional judgment validation. Every recommendation from intelligence, every finding from engagement work, every decision from governance functions passes through structured, evidence-anchored, traceable review before it becomes action.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 17.02 | Decision | Decisions are reviewed before approval |
| 17.04 | Finding | Findings are the primary objects of review |
| 17.05 | Evidence | Review is evidence-anchored — evaluates evidence alongside conclusions |
| 17.10 | Audit Engagement | Review is a lifecycle state within the engagement |
| 17.12 | Approval | Review precedes approval but is distinct from it |
| 17.13 | Governance | Review governance defines who, what, and how of review |
| 10.04 | AI Assistance Theory | AI assists review but does not perform it |
| 08.07 | Review Independence Doctrine | Independence as a governance requirement for review |
| 07.08 | Structured Review Framework | Operational framework for evidence-anchored review |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed — promoted to v0.2 after doctrinal check |
