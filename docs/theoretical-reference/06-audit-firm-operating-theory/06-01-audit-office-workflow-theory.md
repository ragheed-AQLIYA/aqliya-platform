---
title: Audit Office Workflow Theory
document_id: 06.01
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 2 - Domain Theory
related_documents: 01.01, 05.01, 05.05, 05.12, 05.14, 06.02, 06.04, 06.05, 06.06, 06.07, 06.08, 07.01, 07.06, 07.07, 07.08
---

# Audit Office Workflow Theory

## 1. Purpose

This document establishes the theoretical foundation for how audit work flows through a professional firm office. It defines the structural properties of audit workflows, explains why current approaches produce persistent coordination failures, and specifies what AQLIYA's infrastructure must deliver to transform fragmented task sequences into governed, evidence-backed decision pipelines.

The purpose is not to catalog tools or describe generic process mapping. The purpose is to formalize audit office workflow as a domain-specific decision intelligence problem: how professional judgment, evidence requirements, reviewer accountability, and time constraints interact to produce audit conclusions under structural conditions that current software does not address.

## 2. Thesis

**Audit office workflow is not a task-routing problem. It is a governed evidence-to-decision pipeline where coordination failures, evidence gaps, and review delays compound across interconnected professional judgments. AQLIYA's infrastructure must treat audit workflow as an intelligent decision supply chain, not a checklist progression.**

The audit office workflow operates under conditions that generic workflow engines cannot handle: multiple parallel review streams, evidence dependencies between procedures, time-bound materiality thresholds, hierarchical approval requirements, and regulatory inspection readiness constraints. These conditions create a decision network, not a task list.

```
AUDIT OFFICE WORKFLOW AS DECISION SUPPLY CHAIN

    Client Engagement Acceptance
        |
        v
    Engagement Planning And Scoping
        |
        v
    Evidence Request And Collection ──── Financial Data Intake And Validation
        |                                        |
        v                                        v
    Procedure Execution ◄──── Evidence Linking And Validation
        |                                        |
        v                                        v
    Finding And Signal Detection ─────► Finding Lifecycle
        |                                        |
        v                                        v
    Review And Escalation ───────────► Manager And Partner Review
        |                                        |
        v                                        v
    Report Assembly ◄────────────── Approval And Sign-Off
        |
        v
    Inspection Readiness And Archival
```

Every node in this chain involves decisions that depend on evidence state, reviewer jurisdiction, and governance rules. Removing any one of those dependencies collapses the workflow into mere task management.

## 3. Problem

### Audit Workflows Collapse Under Structural Pressure That Current Systems Ignore

Audit offices face five persistent workflow problems that existing software does not resolve:

- **Coordination failure across parallel streams.** An engagement runs multiple work streams simultaneously: trial balance review, evidence collection, procedure execution, finding disposition. These streams share dependencies, but current systems treat them as independent task lists. Reviewers discover late that evidence they need was never requested or was requested but never accepted.

- **Evidence-state opacity.** Preparers and reviewers cannot determine, at any point, whether the evidence supporting a specific assertion is complete, current, validated, and accepted. They open folders, trace emails, and reconstruct status manually, consuming review capacity on verification rather than judgment.

- **Review concentration at period end.** In most firms, 60 to 80 percent of review activity compresses into the final weeks before the reporting deadline. Early-stage review opportunities are missed, findings discovered late require expensive rework, and partner review becomes a bottleneck rather than a governance mechanism.

- **Governance declared but not enforced.** Firms write policies specifying required reviewers, evidence thresholds, escalation paths, and sign-off conditions. But enforcement depends on manual compliance, individual memory, and periodic quality reviews. The workflow system does not encode or enforce these constraints structurally.

- **Learning loss between engagements.** Recurring finding categories, common evidence gaps, typical review points, and client-specific risk patterns do not transfer systematically from one engagement to the next. Each engagement begins with partial institutional memory.

These problems are not efficiency gaps. They are structural failures in how audit decisions flow through interconnected professional roles under evidence and governance constraints.

## 4. Why Existing Systems Fail

| Category | What It Does | Workflow Intelligence Gap |
|---|---|---|
| **Audit Management Software** | Tracks procedures, deadlines, and sign-offs | Encodes task status but not evidence state, review dependencies, or decision traceability |
| **Project Management Tools** | Manages tasks, assignments, and timelines | Lacks audit domain vocabulary, evidence awareness, and governance enforcement |
| **Document Management Systems** | Stores and versions workpapers | Preserves files but not the decision logic connecting evidence to conclusions |
| **Email and Spreadsheets** | Ad hoc coordination and tracking | No structural coordination at all; decisions are lost in threads and cells |
| **Generic BPM/Workflow Engines** | Routes tasks and approvals | Processes sequence but cannot reason about evidence sufficiency, materiality, or audit judgment |
| **Dashboard / BI Tools** | Visualizes metrics and statuses | Reports what happened, not why decisions were made or what evidence supports them |

### The Core Failure

Current systems manage task status but not decision state. They know that a procedure was completed but not whether the evidence supporting its conclusion is sufficient, validated, and accepted. They track that a review occurred but not what judgment was made, why, and based on which evidence. They record sign-off timestamps but cannot reconstruct the defensibility of what was signed off.

## 5. AQLIYA Philosophy

AQLIYA's Enterprise Decision Intelligence infrastructure applies directly to audit office workflow. Audit is not a special case of task management. It is a domain where every decision carries evidentiary and liability weight, and where governance is structural, not procedural.

**Evidence is the unit of trust.** No workflow state transition should occur without inspectable evidence supporting the transition. A review is not complete because a checkbox was clicked. It is complete when the reviewer's judgment, supporting evidence, and rationale are captured and traceable.

**Workflow is the delivery mechanism for decisions.** The value of audit workflow is not that tasks move from one person to another. The value is that evidence-backed, governed professional judgments flow through accountable review layers to defensible conclusions.

**Financial Intelligence is foundational.** Audit workflow without financial data understanding is routing without meaning. Financial Intelligence provides the context that turns task sequences into decision pipelines.

**AI assists. Humans decide.** AI can surface evidence dependencies, prioritize reviewer queues, identify parallel stream conflicts, and suggest review focus areas. AI cannot accept evidence, finalize findings, approve reviews, or issue conclusions.

**Governance is structural.** Review requirements, sign-off authority, evidence thresholds, and escalation rules must be enforced by the workflow engine, not left to policy documents and individual compliance.

## 6. Core Principles

1. **Audit workflow is a decision supply chain.** Every stage produces, transforms, or consumes decisions supported by evidence. Workflow design must reflect this, not reduce it to task routing.

2. **Evidence state governs workflow state.** A review is not ready for a reviewer when its task status says so. It is ready when the supporting evidence is accepted, current, and sufficient for the judgment required.

3. **Review capacity is a constrained resource.** Partner and manager review time is the primary bottleneck. Workflow must optimize its allocation, not simply queue more items.

4. **Dependencies between streams must be explicit.** A finding on revenue cutoff may depend on evidence requested for inventory valuation. Workflow must surface these dependencies, not hide them in parallel task lists.

5. **Governance enforcement is structural.** Required reviewers, approval thresholds, evidence sufficiency checks, and escalation rules must be enforced by the system, not delegated to policy awareness.

6. **Traceability is built in, not bolted on.** Every state transition, reviewer action, evidence link, and approval must be captured as a natural byproduct of doing the work, not as an after-the-fact reconstruction exercise.

7. **Parallel streams require coordination intelligence.** The system must understand which evidence items are shared between procedures, which findings affect multiple areas, and which review delays cascade to downstream dependencies.

8. **Workflow data must support learning.** Review response times, evidence sufficiency patterns, finding recurrence rates, and bottlenecks must be captured to improve future engagement planning.

9. **Time pressure must not override governance.** Deadline compression is structural in audit. The workflow must maintain evidence and governance discipline even under period-end pressure, not allow shortcuts to circumvent required review.

10. **The office workflow proves AQLIYA's platform thesis.** If AQLIYA can govern the audit office as a decision supply chain, the same infrastructure applies to any enterprise domain where evidence-backed decisions flow through accountable roles.

## 7. Key Concepts

- **Decision Supply Chain:** The end-to-end flow from raw client data and evidence through professional judgments to defensible conclusions, where each stage transforms inputs into more processed decision outputs.

- **Evidence State Dependency:** The relationship between workflow state transitions and the acceptance status of supporting evidence. A review cannot proceed reliably if evidence is incomplete, unvalidated, or stale.

- **Review Capacity Allocation:** The discipline of directing limited partner and manager review time toward the highest-signal, highest-consequence items rather than processing items in arrival order.

- **Parallel Stream Coordination:** The structural requirement that interdependent audit procedures share evidence, findings, and reviewer attention, and that the workflow engine must surface cross-stream dependencies.

- **Governance Constraint Enforcement:** The architectural principle that workflow rules (required reviewers, minimum evidence thresholds, sign-off authority matrices) are enforced by the system, not left to individual compliance.

- **Workflow Learning Loop:** The capture and reuse of engagement workflow data (bottleneck patterns, evidence sufficiency rates, review durations, finding recurrence) to improve future engagement planning and resource allocation.

- **Period-End Compression Dynamic:** The structural tendency in audit firms for review activity to concentrate in the final weeks before the reporting deadline, creating bottlenecks and governance risk.

- **Reviewer Queue Intelligence:** The disciplined prioritization of reviewer work items by materiality impact, evidence sufficiency, risk severity, and report proximity rather than by upload time or arbitrary ordering.

- **Inspection Readiness:** The condition where an engagement's traceability, evidence state, governance compliance, and approval history can be reconstructed without manual effort because the workflow captured them structurally.

- **Engagement Throughput Velocity:** The rate at which an engagement produces accepted evidence, completed reviews, resolved findings, and approved conclusions, measured as a portfolio of governed decisions rather than completed tasks.

## 8. Operational Implications

1. Engagement setup must capture workflow rules that are later enforced structurally: required review layers, evidence sufficiency thresholds, escalation triggers, and sign-off authority assignments.

2. Parallel work streams must share an evidence state layer. When one stream accepts evidence that another stream also relies on, both streams must see the current state and provenance.

3. Reviewer queues must be constructed from decision-relevant items, not task completion events. A reviewer should see what requires judgment, what evidence supports or is missing, and what the downstream impact is.

4. Period-end review compression must be addressed by distributing review opportunities across the engagement lifecycle. The workflow should surface review-ready items early, not accumulate them for the final weeks.

5. Finding disposition must be a governed lifecycle with explicit state transitions, evidence dependencies, and approval requirements, not a free-text note in a workpaper.

6. Approval requirements must reflect evidence state. A partner should not be asked to approve a conclusion where required evidence remains incomplete or where a prior reviewer flagged unresolved issues.

7. Workflow exceptions (overridden governance rules, accepted evidence that failed validation, incomplete reviews with sign-off) must be logged, attributable, andInspectable. They are not failures to hide; they are governed decisions to document.

8. Cross-engagement data must be captured systematically. Evidence sufficiency rates, review cycle times, finding category concentrations, and rework patterns must inform future planning.

9. Client communication about evidence requests must be trackable, linkable to specific audit needs, and stateful, not buried in email threads and file shares.

10. Final review readiness must be a computed state derived from evidence completion, review completion, finding disposition, and approval status, not a subjective judgment from the engagement team.

## 9. Product Implications

1. AuditOS must present workflow as a governed decision pipeline, not a collection of task lists with status columns.

2. The engagement workspace must show evidence state, review state, finding state, and approval state as interconnected dimensions, not as separate modules that must be mentally correlated by the user.

3. Reviewer queues must be context-rich: each item must show what evidence is linked, what is missing, what changed since last review, and what downstream items depend on resolution.

4. Parallel procedure evidence sharing must be surfaced. When two procedures rely on the same evidence item, both must see state changes simultaneously.

5. Period-end workload forecasting must be a product capability. The system should project review bottlenecks and flag engagement drift before they become crises.

6. Finding lifecycle management must be a structured feature with explicit states, transitions, dependencies, and approval gates, not a comment thread attached to a workpaper.

7. Approval surfaces must compute readiness based on actual evidence and governance state, not allow sign-off when required conditions remain unresolved.

8. Exception tracking must be a first-class feature. Overridden governance rules, accepted evidence that failed validation, and incomplete reviews must be surfaced, searchable, and subject to independent review.

9. The product must support engagement planning that encodes workflow rules, materiality thresholds, review chain assignments, and escalation criteria as enforceable parameters.

10. Cross-engagement analytics must surface workflow learning: common bottleneck patterns, evidence sufficiency failure rates, finding category distributions, and resource allocation insights.

## 10. Architecture Implications

1. The workflow engine must operate on evidence state, not just task state. Every workflow transition must be eligible to check evidence sufficiency, validation status, and acceptance state before proceeding.

2. A shared evidence layer must serve all parallel work streams. Evidence is not "owned" by a procedure. It is a shared asset whose state any dependent procedure can query.

3. Decision trace graph architecture must link source records, evidence acceptance events, reviewer actions, finding states, approval events, and report consequences into a single queryable graph.

4. Governance constraints must be evaluated declaratively at workflow state transitions, not checked manually or through ad hoc logic. Required reviewers, minimum evidence thresholds, and sign-off authority must be rule-expressed and rule-enforced.

5. Reviewer queue construction must be a computed service that ranks items by materiality, evidence completeness, risk severity, deadline proximity, and review seniority requirements.

6. Exception logging must be immutable, attributable, and queryable. Every override, shortcut, and governance bypass must have an actor, rationale, timestamp, and independent review flag.

7. Re-ingestion and version management must preserve decision provenance. If client data changes after review, the system must surface the delta, flag decisions made on prior versions, and allow controlled re-evaluation without losing history.

8. The architecture must support engagement template configuration: reusable workflow rule sets, review chain assignments, evidence requirement catalogs, and escalation thresholds that encode firm methodology.

9. Cross-engagement data aggregation must respect tenant isolation. Engagement patterns, learning insights, and workflow analytics must be available within firm boundaries without cross-tenant data exposure.

10. Event-driven architecture must support real-time workflow state propagation. When evidence is accepted in one stream, dependent reviews in other streams must be notified and eligibility recalculated.

## 11. Governance Implications

1. Engagement workflow rules must be established at engagement creation and enforced throughout the engagement lifecycle. Changes must be authorized, versioned, and tracked.

2. Evidence sufficiency must be a governance checkpoint, not a professional courtesy. Review advancement past evidence thresholds must be validated before proceeding.

3. Reviewer assignment must follow authority matrices. The system must prevent self-approval, enforce seniority requirements, and route escalations according to configured governance rules.

4. Finding disposition must follow governed state transitions. No finding should reach the report without evidence links, reviewer assessment, and authorized approval recorded structurally.

5. Period-end governance shortcuts must be logged. If a firm authorizes an expedited review path under deadline pressure, the exception, its rationale, and its approval must be captured and available for quality inspection.

6. Partner review must target exceptions, unresolved matters, high-risk areas, and evidence sufficiency gaps. The system must construct the partner review agenda from governance state, not leave it to partner discretion alone.

7. Quality management must draw on governance compliance data. The system must surface patterns of governance overrides, evidence acceptance exceptions, and review timing patterns across engagements.

8. Independence and conflict checks must be embedded in workflow rules. The system must enforce separation of duties and flag role conflicts at assignment, not through post-hoc review.

9. Report issuance must be gated on computed readiness: unresolved findings, incomplete reviews, pending approvals, and changed evidence versions must block issuance unless governed exceptions are authorized.

10. Every governance decision must be attributable. Who approved an evidence acceptance despite a validation failure, who authorized a review shortcut, who signed off despite open findings — every such decision must have an actor, rationale, and timestamp.

## 12. AI / Intelligence Implications

1. AI in audit workflow must operate within the governed workflow and evidence model. It cannot act as an unconstrained assistant over arbitrary files.

2. AI may assist with:
   - identifying evidence dependencies across parallel work streams
   - prioritizing reviewer queues by materiality, risk, and deadline impact
   - detecting missing evidence items based on procedure requirements
   - surfacing cross-procedure evidence conflicts
   - forecasting period-end review bottlenecks based on current progress
   - suggesting engagement planning parameters based on historical patterns
   - identifying comparable findings and resolution patterns from prior engagements

3. AI may not:
   - accept evidence on behalf of a reviewer
   - finalize findings without human review
   - approve workflow state transitions that require human authority
   - bypass governance constraints
   - determine engagement scope or materiality independently

4. AI-generated prioritization and suggestions must be inspectable. Reviewers must see why an item was surfaced, what evidence supports the prioritization, and what the model confidence is.

5. Workflow learning must come from review outcomes. What reviewers accepted, rejected, escalated, and overrode provides the training signal for future prioritization and suggestion quality.

6. AI must respect governance boundaries. If a governance rule requires manager review before partner review, AI cannot suggest shortcuts or bypass the required step, regardless of perceived urgency.

## 13. UX Implications

1. The primary product surface must be the engagement decision pipeline, showing evidence state, review state, finding state, and approval state as interconnected views.

2. Reviewer queues must present items in priority order with full context: what needs judgment, what evidence exists, what is missing, what downstream items are waiting, and what the materiality impact is.

3. Evidence state must be visible at every workflow stage. A reviewer should never need to leave the workflow surface to determine whether supporting evidence is accepted, current, and sufficient.

4. Finding management must be structured, not free-text. Draft observations must be visually distinct from approved findings, and pending dispositions must be distinguishable from resolved ones.

5. Period-end forecast views must show projected review concentration, current bottlenecks, and flag engagement drift before the final weeks.

6. Approval surfaces must show readiness checks before sign-off: unresolved evidence gaps, pending reviews, open findings, and governance exceptions must be surfaced and blocking by default.

7. Exception dashboards must make governance overrides, validation bypasses, and incomplete reviews visible, searchable, and subject to quality review.

8. The UX must continuously reinforce evidence state distinctions: raw data versus validated data, candidate evidence versus accepted evidence, AI-suggested links versus human-verified links.

## 14. Commercial Implications

1. AuditOS workflow must be sold as governed decision infrastructure, not as audit task management or project tracking software.

2. The wedge buyer values engagement quality, reviewer productivity, and inspection readiness. The product must demonstrate that it improves judgment quality, not just task velocity.

3. Financial Intelligence differentiates AuditOS from workflow-only competitors. Without it, the product is task routing. With it, the product is audit intelligence.

4. Period-end compression relief is commercially compelling. Firms that can distribute review activity across the engagement lifecycle gain both quality and capacity advantages.

5. Governance enforcement reduces quality review cost and regulatory exposure. Firms that can demonstrate systemic governance compliance gain competitive differentiation.

6. Cross-engagement learning creates long-term value. Firms that accumulate workflow intelligence across engagements gain planning and resource allocation advantages that compound over time.

## 15. Anti-Patterns

1. **Task Board Anti-Pattern.** AuditOS is reduced to a Kanban board for audit procedures. Tasks move through columns, but evidence state, review intelligence, and decision traceability are absent.

2. **Procedure-Only Workflow Anti-Pattern.** The workflow encodes procedure sequences but not evidence dependencies, review requirements, or finding lifecycle governance.

3. **Status-Without-State Anti-Pattern.** Workflow shows that a review is "complete" but cannot show what evidence was relied upon, what the reviewer decided, or whether the conclusion remains valid after evidence changes.

4. **Manual Governance Anti-Pattern.** The system provides spaces for sign-offs and approvals but does not enforce them structurally. Governance is policy-level, not system-level.

5. **Period-End Fire Drill Anti-Pattern.** The workflow accumulates review items for the final weeks without early distribution, resulting in partner bottleneck and review compression.

6. **Silo Stream Anti-Pattern.** Parallel work streams operate independently without evidence sharing or dependency coordination, causing rework and missed cross-stream issues.

7. **Queue-By-Arrival Anti-Pattern.** Reviewer queues process items in arrival order rather than by materiality, risk, evidence readiness, and decision consequence.

8. **Sign-Off Without Readiness Anti-Pattern.** Partners sign off on engagements where evidence is incomplete, findings are unresolved, or governance exceptions are undocumented, because the system does not block or surface these conditions.

9. **Post-Hoc Traceability Anti-Pattern.** Audit trails are reconstructed after the fact from emails, notes, and files rather than captured structurally through the workflow.

10. **Generic BPM Adoption Anti-Pattern.** The firm adopts a generic business process management tool for audit workflow, resulting in workflow that lacks audit domain vocabulary, evidence awareness, and governance enforcement.

## 16. Examples

**Example 1: Engagement Startup.** A new audit engagement is created. The system loads the engagement template: required review layers, evidence requirements by assertion, materiality thresholds, partner authority rules, and escalation criteria. The engagement team assigns roles. The workflow engine now governs what can proceed, what evidence is required, and who must review each class of item. This is not just setup; it is governance encoding.

**Example 2: Parallel Stream Coordination.** The revenue procedure team accepts a set of confirmation responses. The system identifies that the same confirmations are relevant to the accounts receivable aging procedure and updates evidence state in both streams. Neither team needs to coordinate manually. The evidence layer serves both.

**Example 3: Evidence-State Gated Review.** A manager opens a reviewer queue. An item related to inventory valuation is flagged as "review ready" because all required evidence items have been accepted, no outstanding requests remain, and prior reviewer notes have been addressed. An item related to revenue cut-off is flagged as "evidence incomplete" because two requested confirmations are outstanding. The manager reviews the first item now and monitors the second.

**Example 4: Finding Lifecycle.** A junior auditor observes unusual late-period journal entries. The observation enters the finding lifecycle as a draft. Supporting evidence is linked. The manager reviews, refines the issue description, and requests client explanation. The client responds. Additional evidence is requested. The finding is reclassified. The senior manager approves the final disposition. The partner reviews the finding with its complete evidence chain and approves its report impact. Each transition is governed, evidenced, and traceable.

**Example 5: Period-End Forecasting.** The system projects that 40 percent of review items will arrive in the final two weeks based on current evidence collection rates and procedure completion. It recommends rebalancing: completing early-stage evidence reviews now, prioritizing high-risk areas for immediate attention, and escalating evidence delays. The engagement team adjusts and avoids the usual period-end crisis.

**Example 6: Governance Exception Tracking.** An audit team accepts a trial balance that failed a completeness validation check. The system requires a governance exception: the partner authorizes acceptance, records the rationale, and flags the item for quality review. The exception is logged, attributable, and available for inspection. The workflow does not pretend it did not happen. It governs it.

## 17. Enterprise Impact

1. Audit firms gain workflow that enforces evidence discipline and governance compliance structurally, reducing the gap between policy and practice.

2. Reviewer productivity increases because reviewers spend time on judgment, not on reconstructing evidence state and governance status.

3. Engagement consistency improves because workflow rules, evidence requirements, and review obligations are enforced systematically across teams and offices.

4. Inspection readiness improves because traceability is captured by design, not reconstructed after the fact.

5. Firm-wide workflow intelligence becomes possible: bottleneck patterns, evidence sufficiency rates, finding recurrence, and review duration analytics across engagements.

6. AQLIYA gains a workflow execution model that proves Enterprise Decision Intelligence infrastructure in a high-stakes, evidence-heavy domain.

## 18. Long-Term Strategic Importance

Audit office workflow is where AQLIYA's thesis meets operational reality. If audit decisions can be structured as a governed evidence-to-conclusion pipeline, then the same infrastructure applies to every domain where professional judgments must be evidence-backed, reviewable, and defensible.

The audit office is the proving ground because it combines every constraint that makes generic workflow inadequate: multiple parallel review streams, evidence dependencies, governance thresholds, time pressure, liability, and inspection requirements. Solving workflow here demonstrates that the infrastructure can handle the hardest case first.

Long-term, the audit office workflow model extends to any enterprise decision domain where decisions flow through roles, depend on evidence, require governance, and must be traceable. Audit is the first domain. It will not be the last.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 01.01 | AQLIYA Foundational Thesis | Root doctrine for workflow as decision supply chain |
| 05.01 | AuditOS Thesis | Defines the system within which this workflow operates |
| 05.05 | Audit Engagement Model | Specifies the engagement lifecycle that this workflow serves |
| 05.12 | Audit Review Lifecycle | Details the review layers, queues, and escalation structure |
| 05.14 | Audit Governance Model | Defines governance constraints enforced through this workflow |
| 06.02 | Partner / Manager / Reviewer Operating Model | Specifies the roles that this workflow routes decisions through |
| 06.04 | Audit Capacity Theory | Explains the resource constraints that workflow must manage |
| 06.05 | Review Bottleneck Theory | Analyzes the reviews bottleneck that this workflow must address |
| 06.06 | Evidence Collection Friction Theory | Explains evidence collection delays that slow this workflow |
| 06.07 | Report Production Theory | Addresses the downstream workflow stage this feeds into |
| 06.08 | Quality Control Pressure Theory | Analyzes the quality pressure that this workflow must support |
| 07.01 | Workflow Intelligence Theory | Provides the general workflow theory this domain model specializes |
| 07.06 | Evidence Lifecycle Framework | Supplies the evidence state model this workflow depends on |
| 07.07 | Review Lifecycle Framework | Supplies the review lifecycle this workflow enforces |
| 07.08 | Approval Lifecycle Framework | Supplies the approval model this workflow requires |

## 20. Version History

| Version | Date | Author | Notes |
|---|---|---|---|
| 0.1 | 2026-05-07 | Founding Team | First full draft |
| 0.2 | 2026-05-08 | Founding Team | Reviewed and promoted: cross-references aligned |