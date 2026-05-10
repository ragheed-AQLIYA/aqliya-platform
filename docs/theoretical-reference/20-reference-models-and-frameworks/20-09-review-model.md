---
title: Review Model
document_id: 20.09
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents: 17.01, 17.05, 17.11, 20.01, 20.03, 20.04, 20.08, 20.10, 05.04
---

# Review Model

## 1. Purpose

This document defines the canonical Review Model — the structural specification for how AQLIYA represents, governs, and tracks professional review within decision intelligence workflows. Review is the professional judgment function in AQLIYA. It is the point where a qualified human evaluates evidence, assesses findings, validates recommendations, and exercises judgment. The Review Model defines review as a structured, governable, evidence-linked, and auditable workflow event — not an informal opinion or a status change. It specifies who reviews, what they review, under what conditions, with what authority, and with what outcome. Review is the mechanism through which AI-assisted intelligence meets human accountability.

## 2. Thesis

In AQLIYA, review is not a checkbox. It is a structured professional judgment event with defined inputs (evidence, findings, recommendations), defined conditions (reviewer authority, evidence sufficiency, conflict checks), a defined process (evaluation, assessment, judgment), and defined outcomes (accept, modify, reject, escalate). Every review is attributable, evidence-linked, and auditable. The reviewer owns the outcome of their review — not the system, not the AI, not the process. The Review Model enforces this by requiring that reviews are performed by qualified reviewers, that reviewers have access to all relevant evidence, and that review outcomes are recorded with reasoning.

## 3. Problem

In current audit practice, review is the primary bottleneck. Partners and managers review workproduct produced by staff, but the review process itself is unstructured. Reviews happen in ad-hoc meetings, through redlines in documents, or through email comments. The review outcome is a marked-up document, not a structured record. Who reviewed what, what evidence they considered, what judgment they exercised, and what they decided is reconstructable only through manual investigation.

Review quality varies dramatically based on reviewer experience, workload, and attention. A review by a senior partner on a Monday morning produces a different outcome than a review by a junior manager on a Friday evening. This variability is a structural weakness in audit quality and a source of regulatory risk.

## 4. Why Existing Systems Fail

**Audit management platforms** allow reviewers to annotate workpapers but do not structure the review itself. The review is a document interaction, not a governed judgment event.

**Email-based review** distributes workproduct through email, collects comments in email threads, and produces no structured record of the review process, the evidence considered, or the judgment exercised.

**Document redlining** tracks changes in word processing documents but does not capture review reasoning, evidence consideration, or professional judgment. Redlines show what changed, not why.

**Checklist-driven review** enforces that review steps were completed but does not capture the substance of review: what evidence was considered, what judgment was exercised, and what outcome was reached.

**Task status tracking** marks review tasks as "complete" but does not capture whether the reviewer had the authority, the evidence, the time, or the expertise to perform a meaningful review.

The common failure: review is treated as an activity, not as a professional judgment event with defined inputs, conditions, process, and outcomes. AQLIYA treats review as a first-class governance event.

## 5. AQLIYA Philosophy

The Review Model embodies the principle that AI assists and humans decide. Review is where the human exercises professional judgment. The system provides the evidence, the recommendations, the risk signals, and the confidence qualifications — but the reviewer makes the judgment. The model enforces this by ensuring that reviews are performed by qualified reviewers, that reviewers have all relevant information, and that review outcomes are attributable.

Review is also the primary feedback mechanism for AI improvement. When a reviewer accepts, modifies, or rejects a recommendation, that outcome is a training signal. When a reviewer overrides a risk signal classification, that override is a calibration input. Review is not just a governance gate; it is the point where human intelligence validates and improves system intelligence.

## 6. Core Principles

1. **Review is a professional judgment event.** Review is not a status change or an approval stamp. It is a professional evaluation of evidence, findings, or recommendations by a qualified human. The review outcome is a judgment, not a confirmation.

2. **Reviews are structured.** Every review has defined inputs, conditions, process, and outcomes. The reviewer knows what they are reviewing, what evidence must be considered, what authority they hold, and what outcomes are available.

3. **Reviews are attributable.** Every review is recorded with the reviewer's identity, role, and authority. The reviewer owns the judgment. Attributable reviews create professional accountability.

4. **Reviews are evidence-linked.** The reviewer's judgment is linked to the evidence they considered. If a reviewer approves a finding, the evidence they evaluated is recorded with the review.

5. **Reviews are governed by authority.** Not every reviewer can review every item. Authority is determined by role, qualification, engagement assignment, and governance rules. A staff auditor does not approve a material finding; a partner does.

6. **Reviews have defined outcomes.** Accept, modify, reject, or escalate. Each outcome is explicitly chosen, not defaulted. Each outcome may trigger different subsequent actions.

7. **Reviews produce feedback.** Review outcomes — especially modifications and rejections — are training signals for the AI layer. The review is the interface between human judgment and machine learning.

8. **Reviews are auditable.** The complete review record — who reviewed, what they reviewed, what evidence they considered, what judgment they exercised, and what outcome they reached — is preserved as a governance artifact.

## 7. Key Concepts

- **Review Object:** The canonical data entity. Fields: review_id, type, item_ref, reviewer, reviewer_authority, evidence_considered, outcome, reasoning, conditions_met, governance_context, timestamp.

- **Review Type:** A taxonomy of review categories. Examples: evidence_verification_review, finding_review, recommendation_review, engagement_quality_review, risk_assessment_review.

- **Reviewer Authority:** The qualifications and role-based authority that permit a reviewer to perform a specific review type. Authority is determined by governance rules: role, qualification, engagement assignment, and conflict checks.

- **Review Conditions:** The prerequisites that must be met before a review can proceed. Conditions include: item is in the correct state, evidence is sufficient, reviewer has appropriate authority, and no conflict of interest exists.

- **Review Outcome:** The result of a review. Outcomes: Accepted (reviewer agrees with the item as presented), Modified (reviewer agrees with changes), Rejected (reviewer disagrees and the item is returned), Escalated (reviewer refers to a higher authority).

- **Review Reasoning:** The reviewer's documented explanation for the review outcome. Modified and rejected reviews require reasoning. Accepted reviews may include optional reasoning.

- **Review Workflow:** The governed sequence from review assignment through conditions check to outcome. The review workflow is a specialized instance of the Workflow State Model (20.08).

- **Review Feedback Signal:** The data produced by review outcomes that is routed to the AI layer for model improvement. Acceptance, modification, rejection, and override data are training signals.

- **Review Quality Assessment:** Periodic evaluation of review consistency and quality across reviewers, engagement types, and time periods. Quality assessment identifies training needs, process improvements, and governance gaps.

- **Conflict Check:** A governance check ensuring the reviewer has no conflict of interest with the item under review. Conflict checks are enforced before review can proceed.

## 8. Operational Implications

1. Reviewer authority matrices must be defined before engagement work begins. Who can review evidence, who can review findings, who can approve findings of each risk level — these are governance decisions, not technical settings.

2. Review workload must be managed and visible. Review is the primary bottleneck in audit. Managers and partners need visibility into review queues, review velocity, and reviewer workload.

3. Review consistency must be monitored. Different reviewers assessing similar items should reach similar outcomes. Consistency analysis identifies training needs and process improvements.

4. Review feedback must be systematically captured and routed to the AI layer. Every review outcome — especially modifications and rejections — is a valuable training signal that must not be lost.

5. Review quality must be periodically assessed through independent quality review. A sample of reviews is re-reviewed by senior professionals to assess judgment quality and consistency.

## 9. Product Implications

1. Review must be a primary workflow surface, not a secondary feature. The reviewer's experience — seeing the item, the evidence, the recommendation, and the governance context — must be optimized for professional judgment.

2. Review assignment must be governed. The system assigns reviews based on authority, engagement assignment, and workload. Assignments are enforced, not suggested.

3. Review conditions must be auto-verified. Before a reviewer can proceed, the system checks: is the item in the correct state? Is the reviewer authorized? Is the evidence sufficient? Are there conflicts?

4. Review outcomes must be deliberate. Accept, modify, reject, and escalate are explicit choices. The reviewer must choose, not default. Optional reasoning is encouraged; required reasoning for modifications and rejections is enforced.

5. Review history must be accessible from any item. "Who reviewed this finding and what did they decide?" must be answerable in one click.

6. Review queues must be manageable. Reviewers see their queue organized by priority, engagement, and review type. Partners see review progress across their portfolio.

## 10. Architecture Implications

1. The Review Object is a first-class entity with its own schema, lifecycle, and event stream. Reviews are not embedded in items; they are linked to items through foreign keys.

2. Review authority is enforced by the governance engine. The system checks reviewer authority, engagement assignment, and conflict status before permitting a review to proceed.

3. Review outcomes are emitted as feedback signals to the AI intelligence layer. Acceptance, modification, and rejection data with reasoning are the highest-value training signals for recommendation and signal models.

4. Review conditions are evaluated by the workflow engine. The engine checks item state, evidence sufficiency, reviewer authority, and conflict status. Conditions not met block the review.

5. Review quality analysis runs as an asynchronous service that compares review outcomes across reviewers, engagement types, and time periods. Consistency analysis identifies training needs and process improvements.

6. Review workload balancing is a planning service that distributes review assignments based on reviewer authority, engagement assignment, workload, and priority.

7. Review audit trails are immutable. The complete review record — including evidence considered, reasoning, and outcome — cannot be modified after the fact. Corrections are made through new reviews, not edits.

## 11. Governance Implications

1. Reviewer authority is a governance configuration, not a technical setting. Defining who can review what, at what level, and under what conditions is a professional governance decision.

2. Conflict checks are enforced by the system. A reviewer with a conflict of interest cannot perform a review on the conflicted item. Conflicts are identified based on engagement assignment, entity relationship, and professional independence rules.

3. Review outcomes are attributable. The reviewer's identity, role, and authority are recorded with every review. Attributable reviews create professional accountability and enable quality assessment.

4. Review reasoning is a regulatory artifact. In audit and regulated domains, the reasoning behind professional judgments is a required component of the workpaper. The Review Model captures this reasoning as structured data, not as free-text comments.

5. Review escalation paths are governed. When a reviewer escalates an item, the escalation follows defined authority chains. Escalation is not a suggestion; it is a governed routing.

6. Review quality measurement is a governance responsibility. Firms must monitor review consistency, identify reviewers who consistently deviate from norms, and assess whether review processes meet professional standards.

## 12. AI / Intelligence Implications

1. Review feedback is the primary training signal for recommendation and signal models. Accepted recommendations validate the model; modified and rejected recommendations correct it.

2. Review pattern analysis identifies reviewer preferences, biases, and training needs. If one reviewer consistently overrides certain recommendation types, the system identifies the pattern for quality review.

3. Review workload prediction uses historical review velocity data to estimate remaining review time, enabling managers and partners to plan resources.

4. Review quality scoring uses AI to assess review consistency and depth. Reviews that are too short, that do not consider all evidence, or that deviate from norms are flagged for quality review.

5. AI-assisted review preparation surfaces relevant evidence, prior reviews of similar items, and cross-engagement patterns to help reviewers be more thorough in less time.

6. AI does not perform reviews. Reviews are human judgment events. AI assists preparation and captures feedback, but the review outcome is always a human decision.

## 13. UX Implications

1. The review interface must present all relevant information in a single view: the item under review, supporting evidence, recommendations, risk signals, and prior reviews. No navigation away from the review context.

2. Review outcome must be a deliberate action with a clear choice. Accept, modify, reject, and escalate are presented as distinct actions, each with its own reasoning field.

3. Review queues must be organized by priority, engagement, and item type. High-risk items, overdue reviews, and governance exceptions appear first.

4. Review reasoning must be structured, not free-text. Common reasoning categories (insufficient evidence, contrary evidence, professional judgment, context not captured) plus a free-text option.

5. Review history must be inline. The reviewer sees the history of reviews on the current item without leaving the review interface. Prior reviews, modifications, and escalations are visible.

6. Review feedback must be seamless. Modifying a recommendation's classification, adjusting a risk level, or adding reasoning must generate the feedback signal automatically, without requiring the reviewer to fill out a separate form.

## 14. Commercial Implications

1. The Review Model directly addresses the primary bottleneck in audit firms. Structured, governed, efficient review workflows increase partner and manager throughput.

2. Proof-of-value metrics: review cycle time reduction, review consistency improvement, review coverage increase, and review feedback capture rate.

3. Review quality measurement is a capability that audit firms currently lack. Quantitative review quality assessment across reviewers, engagement types, and time periods enables evidence-based professional development.

4. Review feedback creates the training data that improves AI recommendations over time. The more reviews, the better the recommendations. This creates a compounding advantage.

5. Attributable reviews create professional accountability and regulatory defensibility. Firms can demonstrate who reviewed what, what evidence they considered, and what judgment they exercised.

## 15. Anti-Patterns

1. **Rubber-Stamp Review.** Approving items without meaningful evaluation of evidence and judgment. The Review Model prevents this by requiring explicit outcomes and reasoning.

2. **Unattributed Review.** Reviews performed without recording the reviewer's identity, authority, and reasoning. Unattributed reviews create no accountability and no feedback signal.

3. **Review Without Evidence.** Reviewing findings or recommendations without access to or consideration of supporting evidence. This reduces review to opinion, not professional judgment.

4. **Review Bottleneck Concentration.** Routing all reviews to a single partner or manager regardless of item type, risk level, or authority requirements. This creates bottlenecks and dilutes review quality for high-risk items.

5. **Review Without Feedback Capture.** Performing reviews without systematically capturing outcomes and reasoning as feedback signals. This wastes the primary mechanism for AI improvement.

6. **Review as Administrative Step.** Treating review as a procedural checkpoint rather than a professional judgment event. Review is the point where human expertise meets system intelligence; it should be supported, not minimized.

7. **Isolated Review.** Reviewing items without access to cross-engagement patterns, prior reviews of similar items, or organizational learning. Each review occurs in isolation instead of informed by accumulated knowledge.

## 16. Examples

**Example 1: Finding Review.** A staff auditor creates a finding about a material misstatement in revenue recognition. The finding has type `material_misstatement`, risk level `high`, and evidence bundle containing three verified documents. The review workflow assigns the finding to the engagement manager for review. The system checks: manager has authority to review high-risk findings (yes), evidence sufficiency threshold met (3 of 3 required items verified) (yes), no conflict (yes). The manager reviews the finding, agrees with the classification, accepts the finding, and adds reasoning: "Evidence is sufficient and supports the finding. Risk classification is appropriate given the materiality." The review outcome (accepted) with reasoning is recorded, and the feedback signal is routed to the AI layer.

**Example 2: Recommendation Override.** The AI layer generates a recommendation to reclassify a lease expense based on IFRS 16 criteria. The reviewer evaluates the recommendation and the supporting evidence. The reviewer determines that the client has elected the practical expedient under IFRS 16 and the current classification is appropriate. The reviewer rejects the recommendation with reasoning: "Client has elected IFRS 16 practical expedient for leases of low-value assets. Current classification is consistent with the policy election." The rejection and reasoning are recorded as a feedback signal. After 15 similar rejections across engagements, the model learns to check for practical expedient elections before generating lease reclassification recommendations.

**Example 3: Quality Review.** A quality reviewer examines a sample of completed reviews for an engagement. The quality review assesses: were reviews performed by authorized reviewers? Were all relevant evidence items considered? Were review outcomes consistent for similar items? Were rejections documented with adequate reasoning? The quality review identifies that one reviewer consistently accepts risk level classifications without adjusting them. The quality review generates a training recommendation: the reviewer should receive additional training on risk classification standards.

## 17. Enterprise Impact

1. **Review Efficiency.** Structured review workflows with auto-verified conditions, organized queues, and inline evidence reduce the time reviewers spend on administrative tasks and increase the time they spend on professional judgment.

2. **Review Consistency.** Governed review conditions, structured outcomes, and consistency analysis reduce the variability that comes from individual reviewer experience and workload.

3. **Review Accountability.** Attributable reviews create clear professional accountability. Every review is linked to a specific reviewer with defined authority and documented reasoning.

4. **Review Feedback.** Systematic capture of review outcomes creates training data for AI improvement. Every accepted, modified, or rejected recommendation is a signal that calibrates future intelligence.

5. **Review Quality.** Periodic quality assessment of reviews identifies training needs, process improvements, and governance gaps. Quantitative review quality measurement is a capability most firms lack.

6. **Regulatory Defensibility.** Complete review records — who reviewed, what they reviewed, what evidence they considered, and what they decided — provide regulators with transparent, auditable review evidence.

## 18. Long-Term Strategic Importance

The Review Model is where AI meets human judgment. It is the mechanism through which AQLIYA delivers on the promise that AI assists and humans decide. If the review experience is poor — slow, cumbersome, disconnected from evidence — reviewers will resist the system. If it is excellent — efficient, evidence-rich, well-organized — reviewers will depend on it as a professional tool.

The long-term value lies in review feedback. Every review produces a data point that improves AI recommendations, risk signals, and finding classifications. Over time, the AI layer learns from the accumulated judgment of the firm's best reviewers. This creates institutional intelligence that survives reviewer turnover and compounds over time.

As AQLIYA expands beyond audit, the Review Model generalizes. Every domain where professional judgment is exercised — financial reporting review, compliance review, risk assessment review — uses the same structural model: defined inputs, governed conditions, attributable outcomes, and systematic feedback.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 20.01 | Decision Model | Review is a decision event within the decision lifecycle |
| 20.03 | Finding Model | Findings are reviewed through the Review Model |
| 20.04 | Evidence Model | Reviews consider evidence as defined by the Evidence Model |
| 20.08 | Workflow State Model | Review is a governed workflow state |
| 20.10 | Approval Model | Approval follows review in the governance chain |
| 05.04 | Auditor-Centered System Philosophy | Review is the primary professional judgment activity |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial reference model specification |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. AI assists humans decide principle embedded in review-as-judgment-event model. Added cross-references to 17.01, 17.05, 17.11. |