---
title: Evidence Collection Friction Theory
document_id: 06.06
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 05.01, 05.07, 06.01, 06.04, 06.05, 07.06
---

# Evidence Collection Friction Theory

## 1. Purpose

This document defines the theory of evidence collection friction in audit engagements — the systematic delays, failures, and quality degradation that occur between evidence request and evidence acceptance. It explains why evidence collection is the most disruptive operational friction point in audit, and specifies what AQLIYA's infrastructure must deliver to transform evidence collection from an opaque, delayed process into a governed, visible, accelerated pipeline.

The purpose is not to describe client communication or request tracking. The purpose is to formalize evidence collection friction as a decision intelligence problem where delays, quality gaps, and opacity in the evidence pipeline directly degrade audit decision quality, review throughput, and engagement margin.

## 2. Thesis

**Evidence collection friction is the single largest operational delay in audit engagements. It is not a client responsiveness problem alone — it is a structural pipeline failure where requests are imprecise, responses are unvalidated, follow-up is unstructured, and acceptance is disconnected from the decisions that depend on evidence. AQLIYA's infrastructure must transform evidence collection from an opaque exchange into a governed, measurable pipeline where request quality, response tracking, validation state, and acceptance readiness are visible and managed in real time.**

Evidence collection friction occurs at six points in the pipeline:

```
EVIDENCE COLLECTION FRICTION POINTS

    1. Request Imprecision ──── Requests are vague, reference incorrect
    |                          assertions, or lack specificity. Clients
    |                          respond with incomplete or irrelevant items.
    |
    2. Response Delays ────── Clients respond late, incompletely, or not
    |                          at all. Follow-up is unstructured and
    |                          manual, consuming preparer capacity.
    |
    3. Quality Degradation ── Responses are in wrong formats, lack
    |                          provenance, are incomplete, or fail
    |                          validation. Rejection and re-request
    |                          cycles consume additional cycles.
    |
    4. Validation Backlog ─── Received items await validation. Unvalidated
    |                          items cannot support downstream decisions,
    |                          creating a hidden backlog that blocks review.
    |
    5. Acceptance Opacity ─── It is unclear which items are accepted,
    |                          which are rejected, and which are pending.
    |                          Reviewers cannot determine evidence
    |                          sufficiency for their judgments.
    |
    6. Decision Disconnection ─ Accepted evidence is not linked to the
                               specific assertions, findings, and
                               decisions it supports. Evidence exists
                               but is not decision-ready.
```

Each friction point compounds the others. Imprecise requests generate incomplete responses. Incomplete responses require follow-up. Follow-up consumes preparer capacity. Validation backlogs block review. Acceptance opacity prevents reviewers from making judgments. Decision disconnection means accepted evidence does not flow to the decisions that depend on it.

## 3. Problem

### Evidence Collection Friction Is the Largest Source of Operational Delay in Audit

Audit firms experience evidence collection friction in seven persistent forms:

- **Imprecise requests.** Evidence requests are often vague, referencing incorrect assertions, lacking specificity about format or period, or duplicating prior requests. Clients respond with items that do not match what was actually needed.

- **Client response delays.** Clients respond to evidence requests late, partially, or not at all. Follow-up is unstructured, relying on email threads and phone calls that lack tracking, deadline enforcement, and escalation.

- **Quality degradation on receipt.** Client responses arrive in wrong formats, without provenance, incomplete, or covering incorrect periods. Acceptance rates are low, creating multiple request-response-reject-re-request cycles.

- **Unstructured follow-up.** Follow-up on outstanding requests is manual, untracked, and inconsistent. Some requests are followed up promptly, others are forgotten until they block review or findings.

- **Validation backlog.** Received items await validation but validation resources are limited. Unvalidated items accumulate in a hidden backlog that is not visible as a workflow blocker.

- **Acceptance opacity.** It is unclear at any point which evidence items are accepted, which are rejected and why, and which are still pending. Reviewers cannot determine evidence sufficiency for their judgments.

- **Decision disconnection.** Accepted evidence exists in folders and repositories but is not linked to the specific assertions, findings, and decisions it supports. Evidence is present but not decision-ready.

The cumulative effect is that evidence collection — which should be a pipeline delivering decision-ready inputs — becomes the primary source of delay, rework, and margin erosion in audit engagements.

## 4. Why Existing Systems Fail

| Category | What It Does | Friction Resolution Gap |
|---|---|---|
| **Client Portals / PBC Tools** | Manages request lists and file exchange | Improves collection logistics but not request precision, validation, acceptance state, or decision linkage |
| **Email / Messaging** | Coordinates requests and responses | Distributes information but loses tracking, creates no structured follow-up, and mixes evidence with non-evidence communication |
| **Document Management Systems** | Stores received files | Preserves files but not evidence state, validation status, acceptance decisions, or decision linkage |
| **Audit Management Software** | Tracks PBC lists and completion status | Tracks whether items were received but not whether they were validated, accepted, and linked to decisions |
| **Spreadsheets** | Manual request tracking and follow-up | Requires manual input, cannot track validation state or acceptance decisions, error-prone and inconsistent |

### The Core Failure

Current systems manage the logistics of evidence exchange — sending requests, receiving files, tracking receipt — but they do not manage the evidence pipeline. They do not ensure request precision, they do not track validation state, they do not manage acceptance decisions, and they do not link accepted evidence to the decisions that depend on it. Evidence collection is managed as a logistics problem rather than as a decision input pipeline.

## 5. AQLIYA Philosophy

AQLIYA's Enterprise Decision Intelligence infrastructure treats evidence collection as a governed pipeline that delivers decision-ready inputs to the audit workflow.

**Evidence is the unit of trust.** Evidence collection is not a logistics exercise. It is the process through which raw data and documents become trusted inputs for audit decisions. Every friction point in this pipeline degrades decision quality.

**Evidence state must be visible and managed.** At any point in the engagement, it must be clear which evidence items are requested, which are received, which are validated, which are accepted, and which are linked to specific assertions and decisions.

**Request precision enables response quality.** Imprecise requests generate incomplete responses. Evidence requests must be specific, assertion-linked, and format-defined to reduce response cycles.

**Validation is a pipeline stage, not an afterthought.** Validation must be tracked, resourced, and completed as a distinct pipeline stage. Unvalidated items block downstream decisions.

**Acceptance is a governed decision, not a filing action.** Accepting evidence is a professional judgment about sufficiency, relevance, and provenance. It must be attributable and inspectable.

**AI assists. Humans decide.** AI can suggest request specifications, identify incomplete responses, detect format issues, and propose evidence links. AI cannot accept evidence, validate sufficiency, or determine relevance for audit assertions.

**Evidence collection proves AQLIYA's decision intelligence thesis.** If the evidence pipeline can be transformed from an opaque exchange into a governed, measurable pipeline, the same infrastructure applies to any domain where decision inputs must be collected, validated, and linked to the decisions that depend on them.

## 6. Core Principles

1. **Evidence collection is a governed pipeline, not a logistics exchange.** Requests, responses, validation, acceptance, and decision linkage are pipeline stages that must be tracked, resourced, and managed.

2. **Request precision enables response quality.** Evidence requests must be specific, assertion-linked, format-defined, and period-specified. Imprecise requests generate cycles of rework.

3. **Evidence state must be visible and managed in real time.** At any point, it must be clear which items are requested, received, validated, accepted, and linked to decisions. Opacity creates friction.

4. **Client follow-up must be structured and trackable.** Outstanding requests must have deadlines, escalation triggers, and status tracking. Unstructured follow-up is a primary source of delay.

5. **Validation is a pipeline stage.** Received items must pass validation before they can support downstream decisions. Unvalidated items block the pipeline and must be tracked as a distinct backlog.

6. **Acceptance is a governed decision.** Accepting evidence is a professional judgment about sufficiency, relevance, and provenance. It must be attributable and inspectable, not a filing action.

7. **Accepted evidence must be decision-linked.** Evidence that exists but is not linked to specific assertions, findings, and decisions is present but not decision-ready. Decision-readiness requires explicit linkage.

8. **Friction must be measured.** Evidence collection friction — request-response cycles, acceptance rates, validation backlogs, and follow-up effort — must be measured to be managed.

9. **Client responsiveness is a measurable engagement metric.** Client response time, completeness, and quality must be tracked across engagements to inform future planning and pricing.

10. **Evidence collection friction resolution proves AQLIYA's decision intelligence thesis.** If evidence collection can be transformed from an opaque exchange into a governed pipeline, the same approach applies to any domain where decision inputs must be collected, validated, and linked to decisions.

## 7. Key Concepts

- **Evidence Pipeline:** The governed sequence from request through acceptance to decision linkage, where each stage transforms raw data and documents into decision-ready evidence.

- **Request Precision:** The specificity and completeness of evidence requests, including assertion linkage, format requirements, period specification, and sufficiency criteria. Imprecise requests generate imprecise responses.

- **Client Response Quality:** The completeness, format compliance, provenance, and relevance of client responses to evidence requests. Low response quality creates rework cycles.

- **Request-Response Cycle:** The sequence of request, response, review, rejection, clarification, and re-request that occurs when evidence responses do not meet the request specifications. Multiple cycles indicate friction.

- **Validation Backlog:** The accumulation of received items awaiting validation. Unvalidated items cannot support downstream decisions, creating a hidden pipeline blockage.

- **Acceptance Rate:** The percentage of received evidence items that pass validation and are accepted as decision-ready. Low acceptance rates indicate request imprecision, client response quality issues, or validation criteria misalignment.

- **Acceptance as Governance:** The principle that accepting evidence is a professional judgment about sufficiency, relevance, and provenance, attributable to the reviewer who made the judgment, not a filing action.

- **Decision Linkage:** The explicit connection between accepted evidence and the specific assertions, findings, and decisions it supports. Evidence without decision linkage is present but not decision-ready.

- **Friction Metrics:** Measurable indicators of evidence collection friction: request-response cycle count, acceptance rate, validation backlog size, follow-up frequency, and average time from request to acceptance.

- **Client Responsiveness Score:** A measurable engagement metric capturing client response time, completeness, and quality across engagements, useful for future planning and pricing.

## 8. Operational Implications

1. Evidence requests must be assertion-linked, format-specified, and period-defined. Imprecise requests generate cycles of rework that consume both firm and client capacity.

2. Evidence state must be visible at every stage. At any point, it must be clear which items are requested, received, under validation, accepted, and linked to decisions.

3. Client follow-up must be structured. Outstanding requests must have deadlines, escalation triggers, status tracking, and automated reminders. Unstructured follow-up is a primary source of delay.

4. Validation must be resourced as a distinct pipeline stage. Validation backlogs must be visible and tracked. Unvalidated items must be flagged as pipeline blockers for downstream decisions.

5. Acceptance must be a governed decision. Accepting evidence is a professional judgment that must be attributable, with rationale, and inspectable for quality review.

6. Accepted evidence must be linked to specific assertions, findings, and decisions. Evidence that is accepted but not linked is not decision-ready.

7. Evidence collection friction must be measured. Request-response cycle counts, acceptance rates, validation backlog sizes, and follow-up frequency must be tracked as operational metrics.

8. Client responsiveness must be tracked across engagements. Response time, completeness, and quality must inform future engagement planning, staffing, and pricing.

9. Evidence collection progress must be connected to engagement economics. Delays in evidence collection directly impact margin through extended timelines, review delays, and rework costs.

10. Cross-engagement evidence patterns must be captured. Common request types, typical response cycles, and acceptance rate patterns must inform future engagement planning.

## 9. Product Implications

1. AuditOS must present evidence collection as a governed pipeline, not a PBC list with file attachments.

2. Evidence requests must be structured: assertion-linked, format-specified, period-defined, and sufficiency-described. The product must support request construction with assertion context and specification templates.

3. Evidence state must be visible at every stage. The engagement workspace must show request status, response status, validation status, acceptance status, and decision linkage for every evidence item.

4. Client-facing request tracking must support structured follow-up. The product must provide deadline tracking, automated reminders, escalation triggers, and status visibility for both the audit team and the client.

5. Validation must be a visible pipeline stage. The product must show received items awaiting validation, validation results, and unvalidated items blocking downstream decisions.

6. Acceptance must be a governed action. The product must capture who accepted the evidence, on what basis (sufficiency, relevance, provenance), and with what rationale. Acceptance must be attributable and inspectable.

7. Decision linkage must be explicit. The product must support linking accepted evidence to specific assertions, findings, and decisions. Evidence without linkage must be flagged as present but not decision-ready.

8. Friction metrics must be visible. The product must show request-response cycle counts, acceptance rates, validation backlog sizes, and average time from request to acceptance.

9. Client responsiveness metrics must be available across engagements. The product must track client response time, completeness, and quality to inform future engagement planning.

10. Evidence collection progress must be connected to margin forecasting. Delays in evidence collection must be reflected in engagement margin projections.

## 10. Architecture Implications

1. Evidence items must be first-class objects with full lifecycle state: requested, received, under validation, accepted, rejected, decision-linked, superseded, and archived. State transitions must be governed.

2. Evidence requests must be assertion-linked. Every request must carry the audit assertion, procedure, or finding it supports, enabling downstream decision linkage.

3. Validation must be a distinct pipeline stage with its own state tracking, resource allocation, and backlog visibility. Unvalidated items must block downstream decisions.

4. Acceptance must be a governed decision event. Who accepted, on what basis, and with what rationale must be captured as attributable, immutable data.

5. Decision linkage must be explicit in the data model. Accepted evidence must carry references to the assertions, findings, and decisions it supports. Unlinked evidence must be flagged.

6. Friction metrics must be computed from pipeline data. Request-response cycle counts, acceptance rates, validation backlog sizes, and timing must be derived from evidence state transitions, not manually tracked.

7. Client responsiveness must be tracked as engagement-level metrics. Response time, completeness, and quality must be aggregated across engagements while respecting tenant isolation.

8. Evidence pipeline data must feed margin forecasting. Evidence collection delays must be reflected in engagement timeline and margin projections.

9. The architecture must support automated request specification assistance. AI can suggest request parameters based on assertion, procedure, and prior engagement patterns, but request approval must remain human.

10. Evidence version management must preserve lineage. When client data is updated or evidence is superseded, prior versions must be retained with decision provenance. Decisions made on prior versions must be flagged.

## 11. Governance Implications

1. Evidence requests must be traceable to specific audit assertions, procedures, or findings. Requests that are not assertion-linked cannot be assessed for sufficiency or relevance.

2. Evidence acceptance must be a governed decision. The reviewer who accepts evidence must be identifiable, the basis for acceptance must be documented, and the acceptance must be inspectable for quality review.

3. Validation requirements must be specified. Each evidence type must have defined validation criteria: provenance, integrity, completeness, format, and period coverage. Acceptance without validation must be flagged for quality review.

4. Outstanding evidence requests must have escalation triggers. Requests past deadline without response must be escalated automatically. Outstanding requests that block findings or sign-off must be flagged.

5. Evidence state changes must be tracked. State transitions — from requested to received, from received to validated, from validated to accepted — must be recorded with timestamp and actor.

6. Evidence that fails validation must not silently support downstream decisions. Validation failures must block reliance until a governed exception is authorized.

7. Client communication about evidence must be trackable and linkable. Evidence request correspondence, responses, and follow-up must be linked to the specific evidence item, not lost in email threads.

8. Acceptance rates must be monitored as a governance quality metric. Consistently low acceptance rates indicate request imprecision, client quality issues, or validation criteria misalignment.

9. Evidence sufficiency must be a milestone for engagement progress. Downstream review and findings must not proceed on the assumption that evidence is sufficient when it has not been formally accepted.

10. Quality review must be able to sample evidence acceptance decisions, trace them to specific requests, and verify that sufficiency, relevance, and provenance were actually assessed.

## 12. AI / Intelligence Implications

1. AI may assist with:
   - suggesting evidence request specifications based on assertion, procedure, and prior engagement patterns
   - detecting incomplete responses by comparing received items to request specifications
   - extracting candidate data from client documents for evidence linking
   - detecting format issues, provenance gaps, and completeness problems in responses
   - proposing evidence-to-assertion linkages based on content analysis
   - forecasting evidence collection timelines based on client responsiveness patterns
   - identifying common evidence friction patterns across engagements

2. AI may not:
   - accept evidence on behalf of a reviewer
   - validate evidence sufficiency or relevance independently
   - determine that evidence is sufficient for an audit assertion without human review
   - bypass validation requirements or acceptance governance

3. AI-generated request specifications must be reviewed and approved by the audit team before sending to clients.

4. AI-proposed evidence linkages must be flagged as AI-suggested, not human-verified. Reviewers must confirm linkages before they enter the trusted decision path.

5. Evidence flow patterns must be learnable. Request-response cycles, acceptance rates, and client responsiveness must feed models that improve evidence collection forecasting and planning.

## 13. UX Implications

1. The evidence pipeline must be visible as a primary engagement dimension, not a file attachment list.

2. Evidence requests must be constructed with assertion context, format specification, and period definition. The product must support structured request construction, not free-text upload requests.

3. Evidence state must be visible at a glance. The engagement workspace must show: what is requested, what is received, what is under validation, what is accepted, and what is decision-linked.

4. Client-facing request tracking must be available. The client must see request status, deadlines, and follow-up reminders, not just a file upload portal.

5. Validation results must be visible. Items that failed validation must show why, and items awaiting validation must be flagged as pipeline blockers.

6. Acceptance decisions must require rationale. The product must prompt the reviewer to document the basis for acceptance (sufficiency, relevance, provenance) and capture it as attributable data.

7. Decision linkage must be explicit and visible. The product must show which assertions, findings, and decisions are supported by each accepted evidence item, and which decisions lack sufficient evidence.

8. Friction metrics must be displayed on the engagement dashboard. Request-response cycles, acceptance rates, validation backlog, and average time from request to acceptance must be visible.

9. Evidence collection progress must be connected to engagement timeline and margin. Delays must be reflected in projections.

## 14. Commercial Implications

1. Evidence collection friction is the most operationally persistent pain point in audit. Any measurable reduction in request-response cycles, acceptance rework, and follow-up effort directly improves engagement efficiency and margin.

2. Structured evidence requests reduce client frustration. Clients who receive precise, assertion-linked requests respond faster and more completely, improving client satisfaction and reducing rework.

3. Evidence state visibility eliminates the most common source of reviewer delay: not knowing whether evidence is sufficient, current, and accepted. Reviewer productivity improves when evidence state is visible.

4. Validation backlog visibility prevents a hidden pipeline blockage that delays reviews and findings without being identified as the root cause.

5. Decision linkage ensures that accepted evidence flows to the decisions that depend on it. This is the difference between having evidence files and having decision-ready evidence.

6. Client responsiveness metrics enable data-driven engagement planning. Firms can calibrate staffing, timelines, and pricing based on measured client responsiveness, not anecdotal impressions.

## 15. Anti-Patterns

1. **PBC List Anti-Pattern.** Evidence collection is managed as a provided-by-client list with file uploads. Requests lack specification, responses are unvalidated, and acceptance is filing rather than governance.

2. **Vague Request Anti-Pattern.** Evidence requests are imprecise: "provide bank statements" rather than "provide bank statements for all operating accounts for period January 1 to December 31, 2025, in PDF format with bank confirmation." Clients respond with irrelevant or incomplete items.

3. **Email Follow-Up Anti-Pattern.** Follow-up on outstanding requests occurs through email threads that lack tracking, deadline enforcement, and escalation. Some requests are followed up multiple times, others are forgotten.

4. **Acceptance-By-Filing Anti-Pattern.** Evidence is "accepted" by being filed in a workpaper folder, without validation, sufficiency assessment, or governance. Acceptance is a filing action, not a professional judgment.

5. **Validation Backlog Invisibility Anti-Pattern.** Received items sit in a validation queue that nobody tracks. Reviewers assume evidence is validated when it has not been. Unvalidated items silently support downstream decisions.

6. **Decision Disconnection Anti-Pattern.** Accepted evidence exists in folders but is not linked to the specific assertions, findings, and decisions it supports. Evidence is present but not decision-ready.

7. **Friction-Blind Anti-Pattern.** Evidence collection friction is not measured. Request-response cycles, acceptance rates, and follow-up effort are invisible. The engagement absorbs the cost without identifying the root cause.

8. **Client-Blame Anti-Pattern.** Evidence collection delays are attributed to client responsiveness without examining request precision, follow-up structure, or validation backlog. The firm's contribution to friction is invisible.

9. **Deadline-Without-Escalation Anti-Pattern.** Evidence requests have deadlines but no escalation triggers. Overdue requests sit in the system without automatic follow-up or escalation.

10. **Acceptance-Without-Rationale Anti-Pattern.** Evidence is accepted without documenting the basis for acceptance. When sufficiency or relevance is later questioned, there is no record of why the evidence was considered sufficient.

## 16. Examples

**Example 1: Structured Evidence Request.** Instead of "provide bank statements," the system generates a structured request: "Provide bank statements for all operating accounts (account numbers listed) for the period January 1 to December 31, 2025, in PDF format with bank confirmation reference. Evidence is required to support the cash and cash equivalents assertion for completeness and existence." The client receives a precise request. The response is more likely to be complete and relevant. Cycles are reduced.

**Example 2: Evidence State Visibility.** A manager reviews the evidence pipeline and sees: 78 evidence items requested, 52 received, 34 under validation, 18 accepted, 14 rejected requiring re-request, 12 outstanding past deadline, 6 blocking findings or sign-off. The manager can see the full pipeline, identify bottlenecks, and take action — rather than discovering at period-end that critical evidence is incomplete.

**Example 3: Validation as Pipeline Stage.** Received items pass through a visible validation stage. Format compliance, provenance, completeness, and period coverage are checked. Items that fail validation are flagged with specific reasons and routed for follow-up. Items that pass validation move to acceptance readiness. The validation backlog is visible as a distinct pipeline blockage, not hidden in folders.

**Example 4: Governed Acceptance.** A reviewer accepts a confirmation response. The system prompts for acceptance basis: sufficiency (covers the assertion), relevance (addresses the right period and account), provenance (direct from bank). The reviewer confirms each basis. The acceptance is attributable, inspectable, and linked to the specific assertion the evidence supports.

**Example 5: Decision Linkage.** Accepted evidence is linked to the specific assertion, finding, or decision it supports. A reviewer looking at the revenue cutoff assertion sees exactly which evidence items support it, their acceptance status, and their validation state. Evidence is not just present; it is decision-ready.

**Example 6: Friction Metrics.** The engagement dashboard shows: average request-response cycle is 2.3 rounds, acceptance rate is 61 percent, validation backlog is 12 items, average time from request to acceptance is 18 days, and three items are blocking findings or sign-off. The manager accelerates follow-up on blocking items, improves request precision, and allocates validation resources. Friction is measured and managed.

## 17. Enterprise Impact

1. Evidence collection friction is reduced through request precision, structured follow-up, visible validation, and governed acceptance. Request-response cycles decrease, acceptance rates increase, and follow-up effort is reduced.

2. Reviewer delay is eliminated. Reviewers no longer wait for evidence, investigate evidence status, or rework findings based on incomplete evidence. Evidence state visibility accelerates review.

3. Client satisfaction improves. Precise, structured requests reduce client frustration and improve response quality.

4. Engagement margin is protected. Evidence collection delays are a primary source of margin erosion. Reducing friction directly improves engagement profitability.

5. Cross-engagement learning accumulates. Request types, response patterns, acceptance rates, and client responsiveness scores inform future engagement planning, staffing, and pricing.

6. Quality improves because evidence acceptance is a governed decision, not a filing action. Evidence sufficiency, relevance, and provenance are documented and inspectable.

7. AQLIYA demonstrates that evidence collection can be transformed from an opaque exchange into a governed, measurable pipeline that delivers decision-ready inputs.

## 18. Long-Term Strategic Importance

Evidence collection friction is the most operationally visible problem in audit firms. Every auditor, every manager, every partner has experienced the delay, rework, and frustration of incomplete evidence, unstructured follow-up, and acceptance opacity.

Resolving evidence collection friction through infrastructure — request precision, pipeline visibility, governed acceptance, and decision linkage — proves that AQLIYA's decision intelligence infrastructure can transform an operational pipeline that has been managed as logistics into a governed, measurable system that delivers decision-ready inputs.

The long-term implication extends beyond audit. Every professional domain that depends on external information — legal discovery, regulatory investigation, clinical trial data management, insurance claims processing — faces the same pipeline dynamics: imprecise requests, delayed responses, unstructured follow-up, validation backlogs, and decision disconnection.

Audit is the proving ground because evidence collection friction has direct audit quality, regulatory, and margin consequences. If AQLIYA can resolve it in audit, the same pipeline governance applies to any domain where decision inputs must be collected, validated, and linked to the decisions that depend on them.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 05.01 | AuditOS Thesis | Defines the system within which evidence collection operates |
| 05.07 | Evidence Intelligence Theory | Defines how evidence becomes structured and reviewable |
| 06.01 | Audit Office Workflow Theory | Provides the workflow context that evidence collection serves |
| 06.04 | Audit Capacity Theory | Explains how evidence throughput constrains capacity |
| 06.05 | Review Bottleneck Theory | Analyzes how evidence delays create review bottlenecks |
| 07.06 | Evidence Lifecycle Framework | Provides the formal lifecycle model for evidence request and acceptance |

## 20. Version History

| Version | Date | Author | Notes |
|---|---|---|---|
| 0.1 | 2026-05-07 | Founding Team | First full draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed and promoted: cross-references aligned |