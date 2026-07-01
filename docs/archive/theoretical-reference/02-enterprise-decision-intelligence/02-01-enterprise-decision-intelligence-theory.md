---
title: Enterprise Decision Intelligence Theory
document_id: 02.01
status: Approved
owner: Founding Team
version: 1.0
last_updated: 2026-05-08
priority: Critical
depth_level: Level 1 — Core Doctrine
related_documents: 01.01, 01.03, 05.01, 20.01, 20.02, 17.02, 17.03
---

# Enterprise Decision Intelligence Theory

## 1. Purpose

This document defines Enterprise Decision Intelligence (EDI) as a software category. It explains what EDI is, why enterprises need it, how it differs from every existing category, and what intellectual and architectural commitments it requires.

## Doctrine Modernization Note

Within the official AQLIYA company architecture, Enterprise Decision Intelligence should now be read as a strategic doctrine and systems thesis under AQLIYA, not as the full company identity.

This document is the category definition. Every document that follows — on financial intelligence, audit intelligence, governance, product philosophy, and strategic narrative — depends on the category being clearly defined here.

EDI is not a feature. EDI is not a marketing label. EDI is a new layer in the enterprise software stack: the layer between data and action.

> **Enterprise Decision Intelligence — Definition**
>
> Enterprise Decision Intelligence is the discipline and infrastructure of structuring, augmenting, tracing, governing, and learning from enterprise decisions. It is the system layer that connects data, evidence, recommendations, decisions, actions, and outcomes into a governed, traceable, intelligence-augmented workflow.
>
> EDI is not business intelligence. It is not AI. It is not workflow automation. It is the missing layer that makes decisions — the most valuable and least managed enterprise asset — structured, evidence-backed, accountable, and continuously learnable.

## 2. Thesis

**Enterprise Decision Intelligence is the discipline and infrastructure of structuring, augmenting, tracing, governing, and learning from enterprise decisions.**

Decisions are the most valuable and least managed asset in the enterprise. Organizations invest billions in data infrastructure, analytics, and AI. But the actual decision process — how data becomes a recommendation, how a recommendation becomes a decision, who approves it, what evidence was considered, and what happened afterward — remains manual, implicit, and invisible.

Enterprise Decision Intelligence closes this gap. It provides the system layer that connects data, evidence, recommendations, decisions, actions, and outcomes into a governed, traceable, intelligence-augmented workflow.

AQLIYA applies this doctrine through its broader AI operating systems architecture. AuditOS is the current primary product line where this governed decision-systems thesis is proven in audit and financial intelligence. Audit remains a proving ground, but the company identity is broader than this doctrine alone.

## 3. Problem

### The Unmanaged Gap

Enterprise software has evolved through three major layers:

1. **Transaction Systems** (ERP, accounting, core banking) — record what happened.
2. **Analytics Systems** (BI, data warehouses, dashboards) — show what happened.
3. **Intelligence Systems** (AI, ML, copilots) — suggest what might happen or what to do.

But there is no layer that manages **the decision itself** — the moment where intelligence becomes action, where evidence is weighed, where approval is granted, where accountability is assigned, and where outcomes are recorded for future learning.

This gap creates systematic problems:

- **Invisible decisions.** Decisions happen in meetings, emails, chat messages, and mental judgments. No system records them.
- **Untraceable recommendations.** AI generates recommendations, but no system tracks whether they were accepted, rejected, or modified, or why.
- **Lost evidence.** The evidence that supported a decision exists somewhere — in an email attachment, a spreadsheet, a document — but is disconnected from the decision record.
- **No decision quality measurement.** Organizations measure data quality, model accuracy, and process efficiency. They do not measure decision quality.
- **Fragmented accountability.** When a decision leads to a bad outcome, reconstructing who decided what, based on what evidence, is a manual forensic exercise.
- **Institutional amnesia.** Every decision made today is invisible to the next decision maker. Lessons learned in one engagement are lost for the next.

### Why This Matters Now

Three forces make this gap critical:

1. **Regulatory pressure.** Regulators increasingly demand proof of decision process, not just decision outcomes. The question is shifting from "what did you conclude" to "how did you conclude it."
2. **AI proliferation.** As AI generates more recommendations, the need to track which recommendations were acted on, and why, becomes urgent. Untraceable AI recommendations in regulated domains create unacceptable liability.
3. **Knowledge attrition.** As experienced professionals retire, their decision-making expertise leaves with them. Without a system that captures decision patterns, organizations lose their institutional intelligence.

## 4. Why Existing Systems Fail

No existing category was designed to manage the decision process:

| Category | What It Does | Decision Gap |
|---|---|---|
| **Business Intelligence** | Answers "what happened" and "what is happening" | Does not recommend actions, track decisions, or record outcomes. Shows data but not reasoning. |
| **ERP / Financial Systems** | Records transactions and financial states | Does not record decisions behind transactions — why an entry was posted, who approved, what evidence supported it. |
| **AI Copilots / Chatbots** | Generates text, summaries, suggestions | Stateless and untraceable. Cannot answer, six months later, which recommendations were accepted and why. Unsuitable for governed workflows. |
| **Dashboard Platforms** | Visualizes metrics | Disconnects decisions from outcomes. Shows revenue declined but not who decided what in response or whether it worked. |
| **Audit Management Tools** | Digitizes paper checklists and document workflows | Adds no intelligence, no evidence lifecycle, no decision traceability. Document repositories with status fields. |
| **Workflow / BPM Tools** | Manages task sequences — who does what next | Does not understand evidence, governance, or decision quality. Can route a review but cannot evaluate whether it was evidence-backed. |

**The common failure pattern:** all existing tools treat data, workflow, intelligence, evidence, governance, and decisions as separate concerns. Enterprise Decision Intelligence treats them as one integrated system — because that is how decisions actually work.

## 5. AQLIYA Philosophy

Enterprise Decision Intelligence rests on a set of philosophical commitments:

**Decisions are infrastructure, not events.** A decision is not a moment in time — it is a structured object with lifecycle, evidence, governance, and outcomes. It must be stored, traced, and learnable.

**The decision lifecycle is the core process.** Every decision passes through stages: data is gathered, evidence is extracted, signals are identified, recommendations are made, humans review and decide, actions are taken, outcomes are measured, and learning is captured. The system must support the entire lifecycle, not fragments of it.

**Evidence is the bridge between data and decisions.** Data without context is noise. Evidence — data with provenance, relevance, and reviewability — is what transforms raw information into decision support.

**Governance is embedded, not applied.** Governance rules are not external policies that constrain the system. They are built into the workflow engine itself. Every decision executes within governance boundaries.

**Intelligence augments judgment, it does not replace it.** AI identifies patterns, surfaces signals, and makes recommendations. But the professional human reviewer retains decision authority and accountability. The system serves the reviewer.

**Traceability is a structural requirement, not a documentation task.** Every decision must be traceable from outcome back through action, approval, recommendation, evidence, and data. This is not optional — it is the defining property of decision infrastructure.

**The category is proven through domain depth.** Enterprise Decision Intelligence is not a horizontal theory. It is proven by going deep into specific decision-intensive domains — starting with audit — and demonstrating measurable improvements in decision quality, traceability, and learnability.

**Why AuditOS proves this doctrine first in practice.** Audit is the ideal proving ground for governed decision systems. Every audit engagement is a dense sequence of professional decisions: what to inspect, what evidence is sufficient, what risk is material, what finding is valid, what report is defensible. These decisions are evidence-heavy, governed by professional standards (ISA, GAAS, SOCPA), and carry regulatory and liability consequences. If this doctrine can work in audit — where the cost of a poor decision is measured in regulatory risk, not conversion rate — it can work in any decision-intensive domain. AuditOS demonstrates the model in audit. Financial Intelligence extends it in finance. Other AQLIYA operating systems can extend it into adjacent domains.

## 6. Core Principles

1. **Decisions are structured objects.** A decision has context, evidence, options, recommendation, approval, action, outcome, and learning. Each component is explicit, not implicit.

2. **The decision lifecycle governs everything.** Every decision traverses: data → evidence → signal → recommendation → review → decision → action → outcome → learning. The system must support and connect every stage.

```
DECISION LIFECYCLE

    Source Data
        │
        ▼
    Evidence Extraction ──── Data becomes evidence through context, provenance, validation
        │
        ▼
    Signal Detection ─────── Patterns, anomalies, risks surfaced by intelligence layer
        │
        ▼
    Recommendation ───────── Proposed decision with evidence trace
        │
        ▼
    Human Review ─────────── Reviewer examines evidence and recommendation
        │
        ▼
    Decision ─────────────── Accept, reject, or modify (recorded with reasoning)
        │
        ▼
    Action ───────────────── Decision executed in the operational system
        │
        ▼
    Outcome Measurement ──── What happened as a result
        │
        ▼
    Learning Capture ─────── Pattern fed back into intelligence layer
```

3. **Evidence is the atomic unit.** All intelligence outputs and decisions must be reducible to evidence. If it cannot be evidenced, it cannot be trusted, traced, or audited.

4. **Traceability is the defining metric.** Decision traceability — the ability to walk from any outcome back through every step — is the measure of decision infrastructure maturity.

5. **Governance is embedded in the workflow.** Governance is not a separate layer or compliance review. It is executed by the workflow engine at every decision point.

6. **AI is assistive, not autonomous.** In regulated, liability-bearing domains, AI recommends and humans decide. The system design reflects this distinction.

7. **Learning is a first-class output.** Every decision generates learning that improves future decisions. A system that does not learn from decisions is a system that repeats mistakes.

8. **Domain depth enables category breadth.** The category is proven one domain at a time. Audit first. Then financial intelligence. Then governance. Then broader enterprise decisions.

9. **Decision quality is measurable.** Quality is measured by evidence completeness, traceability depth, governance compliance, outcome alignment, and learning capture — not by feature usage.

10. **Infrastructure outlasts tools.** AQLIYA is not building a tool that will be replaced. It is building infrastructure that becomes the permanent layer between data and decisions.

## 7. Key Concepts

- **Enterprise Decision Intelligence (EDI):** The category. The discipline and infrastructure of structuring, augmenting, tracing, governing, and learning from enterprise decisions.

- **Decision Object:** A structured representation of a decision. The fundamental data unit of the platform. A complete decision object contains:

  - **Context:** The situation, domain, workflow state, and triggering condition that necessitated the decision.
  - **Evidence:** The specific data, documents, and analyses that support or refute each option. Evidence has provenance, not just content.
  - **Options:** The alternative courses of action considered, each with supporting evidence and potential outcomes.
  - **Recommendation:** The proposed decision, generated by the intelligence layer or a human, with an evidence trace and confidence expression.
  - **Approval:** The governance record — who reviewed, who approved or rejected, and their rationale.
  - **Action:** What was actually executed as a result of the decision.
  - **Outcome:** The measurable result of the action, captured after execution.
  - **Learning:** Patterns, signals, and insights extracted from this decision for future use.

- **Decision Lifecycle:** The end-to-end progression of a decision: data ingestion → evidence extraction → signal detection → recommendation generation → human review → decision execution → action tracking → outcome measurement → learning capture.

- **Evidence Trace:** The chain connecting a decision outcome back through its approval, recommendation, evidence, and source data. The trace is the audit trail.

- **Signal:** A pattern, anomaly, or insight extracted from data that warrants human attention. Signals are not recommendations — they are intelligence inputs to the recommendation process.

- **Recommendation:** A proposed decision or action, generated by the intelligence layer or by a human, that requires review and approval before execution.

- **Decision Infrastructure:** The system layer that manages the decision lifecycle — connecting data, evidence, workflow, intelligence, governance, and learning into one platform.

- **Decision Quality:** A composite measure of evidence completeness, traceability depth, governance compliance, outcome alignment, and learning capture for a given decision or set of decisions.

- **Organizational Learning Loop:** The feedback path from decision outcomes back into the intelligence layer, enabling pattern recognition, risk signal refinement, and continuous improvement across engagements.

## 8. Operational Implications

1. Every customer engagement begins with decision lifecycle mapping — understanding what decisions are made, in what sequence, with what evidence, under what governance, and with what outcomes.
2. Implementation teams must be trained in decision lifecycle analysis, not just product configuration.
3. Customer success metrics are defined in terms of decision quality improvement — evidence coverage, traceability depth, governance compliance rate, learning capture rate.
4. Professional services include decision workflow design, evidence standard definition, and governance rule configuration.
5. Sales conversations focus on decision lifecycle gaps — "where do your decisions break?" — not on feature comparisons.
6. The company must build domain-specific decision lifecycle models for each vertical (audit, financial intelligence, governance) while maintaining a common conceptual framework.
7. Hiring prioritizes systems thinking and domain expertise. Engineers who understand audit or financial workflows are more valuable than engineers who only understand AI models.

## 9. Product Implications

1. The primary product surface is the decision lifecycle — not a dashboard, not a chat, not a task list. Users interact with decisions as structured objects traversing a lifecycle.
2. Evidence management — upload, verification, provenance, access control — is a core product capability, not a background feature.
3. Recommendations are presented with full evidence traces. The user can inspect the data, evidence, and reasoning behind every recommendation before making a decision.
4. Governance is visible and interactive. Users configure, view, and interact with governance rules as part of the decision workflow.
5. The decision lifecycle is visual and navigable. Users can trace from outcome back to evidence in a few clicks.
6. AI outputs are clearly labeled as recommendations requiring human review. There is no autonomous execution path for AI-generated decisions.
7. Learning is a product surface. Users can see decision patterns, risk signals, and outcome trends across engagements.
8. The product supports multiple domain-specific decision lifecycle models (audit, financial, governance) on a shared infrastructure core.
9. Export and integration capabilities expose decision objects to external systems (ERP, audit management, compliance platforms) without requiring those systems to adopt the full AQLIYA platform.

## 10. Architecture Implications

1. The platform is built around a **decision engine** — not a generic BPM workflow engine, not a rules engine, not an AI inference engine. This is AQLIYA's specific type of governed, evidence-aware workflow engine. It orchestrates the entire decision lifecycle, enforces governance rules, and manages evidence-linked state transitions. It is the same component that other documents in this system refer to as the workflow engine, described from the perspective of decision lifecycle orchestration.
2. The decision object is a first-class data type with its own schema, lifecycle, storage, access controls, and versioning.
3. Evidence storage is separate from data storage. Evidence has provenance metadata, integrity verification, and access control distinct from source data.
4. The intelligence layer produces signals and recommendations — not raw predictions. Signals and recommendations are typed, traceable, and reviewable.
5. Governance rules are executed by the decision engine as part of the lifecycle, not evaluated by an external policy service.
6. The decision lifecycle model is extensible. Domain-specific lifecycles (audit, financial, governance) inherit from a common decision lifecycle base model.
7. Every decision lifecycle transition is logged with evidence references, actor attribution, and timestamp. The log is immutable and independently auditable.
8. The architecture supports deployment in cloud, private cloud, self-hosted, and air-gapped environments with identical decision lifecycle behavior.
9. The decision graph — the network of decisions, their evidence dependencies, their outcomes, and their relationships — is a queryable data structure available for analysis, reporting, and learning.

## 11. Governance Implications

1. Governance is intrinsic to the decision lifecycle. Every decision point has governance rules — who can recommend, who must review, who can approve, what evidence is required, what escalation path applies.
2. Governance is not a separate module or policy layer. It is part of the decision engine's execution model.
3. Decision traceability is the foundation of auditability. If the governance framework requires proof of decision process, the decision lifecycle provides it natively.
4. Governance rules are themselves decisions — their creation, modification, and deletion are governed by the same lifecycle model.
5. Access control operates at the decision object level. Who can see a decision, its evidence, its recommendation, and its outcome is determined by governance rules specific to the decision type and domain.
6. The governance model must support multi-jurisdictional deployments. An audit in Saudi Arabia (PDPL, SOCPA) and an audit in the UAE (UAE GAAS) may have different governance requirements. The system supports per-tenant governance configuration.
7. Governance compliance is measurable. The system reports governance adherence rates, approval cycle times, evidence completeness rates, and exception rates across all decisions.

## 12. AI / Intelligence Implications

1. AI operates within the decision lifecycle, not outside it. AI produces signals and recommendations that enter the lifecycle for human review and approval.
2. Every AI output must be accompanied by an evidence trace — the specific data, context, and reasoning that produced the signal or recommendation.
3. AI confidence is expressed in domain-relevant terms: evidence strength, materiality level, anomaly severity, risk score. Probabilistic confidence alone is insufficient.
4. Black-box models that cannot produce evidence traces are prohibited. Explainability is a hard requirement for every model in the intelligence layer.
5. AI models are domain-specific. The audit intelligence model differs from the financial intelligence model. Cross-domain generalization is limited by design.
6. The intelligence layer learns from human decisions. Every reviewer action — accept, reject, modify — is a feedback signal that improves future recommendations.
7. AI never executes decisions autonomously in regulated domains. The human review step in the decision lifecycle is structurally enforced.
8. The intelligence layer is deployable at the edge (on-premise, air-gapped) with the same model architecture, reduced by model distillation where connectivity is limited.

## 13. UX Implications

1. The primary UX paradigm is the decision lifecycle view — a visual, navigable representation of where a decision is in its lifecycle, what evidence has been gathered, what recommendations are pending, what approvals are required.
2. Evidence is always one click away from any recommendation or decision. No surface displays a conclusion without providing access to the underlying evidence.
3. Decision traceability is interactive. Users can click from an outcome back through the approval, recommendation, evidence, and data stages.
4. Governance status is visible at every decision point. Users see who needs to approve, what evidence is still required, and what the escalation path is.
5. AI recommendations are visually distinguished from human decisions but presented within the same lifecycle view. The distinction is clear but the context is unified.
6. The UX supports high-throughput decision review — keyboard navigation, batch actions, exception-focused views. The system is designed for professionals who review hundreds of decisions per day.
7. Learning is surfaced through decision pattern views — risk signal trends, recommendation acceptance rates, outcome distributions — accessible to reviewers and managers.
8. The UX is consistent across domain wedges. An audit decision lifecycle and a financial intelligence decision lifecycle share the same interaction model, adapted for domain-specific terminology and rules.

## 14. Commercial Implications

1. AQLIYA sells decision infrastructure, not a single-purpose tool. Pricing reflects the value of managing the entire decision lifecycle — evidence, governance, intelligence, traceability, and learning.
2. The initial conversation starts with AuditOS (the audit decision lifecycle), but the commercial relationship is with the platform. Expansion to financial intelligence and governance operations is built into the commercial model.
3. Value is proven through decision quality metrics — not time saved, but evidence coverage improved, traceability depth increased, governance compliance rate raised.
4. Proof of concept focuses on a specific decision lifecycle within the customer's domain. For an audit firm: the findings review decision lifecycle. For a finance team: the journal entry approval decision lifecycle.
5. Self-hosted and air-gapped deployments are not edge cases — they are core deployment models that command infrastructure pricing.
6. The platform's value compounds as the decision graph grows. More decisions create more patterns, more learning, and more organizational intelligence. This compounding value supports expansion pricing.
7. Category leadership is the commercial objective. Short-term deals that shrink the category ("AI audit tool," "compliance workflow") are rejected regardless of revenue.

## 15. Anti-Patterns

1. **BI Confusion.** Building Enterprise Decision Intelligence as a BI layer — dashboards, reports, data visualization — without decision lifecycle management. This turns AQLIYA into an analytics tool.

2. **Dashboard Confusion.** Making dashboards the primary product surface and workflows secondary. The decision lifecycle is the core; dashboards are views into it, not the product itself.

3. **AI Copilot Confusion.** Building a chat-based AI assistant that makes recommendations outside the decision lifecycle. Recommendations without lifecycle context are untraceable, ungoverned, and unauditable.

4. **Decision Automation Without Accountability.** Allowing the system to execute decisions autonomously without human review. In regulated domains, this is not innovation — it is professional liability.

5. **Untraceable Recommendations.** Generating recommendations without evidence traces. A recommendation without a traceable evidence chain is indistinguishable from an opinion.

6. **Decision Records Without Learning.** Storing decisions but never analyzing them for patterns, signals, or improvement opportunities. A decision archive without learning is a graveyard, not intelligence infrastructure.

7. **Workflow Without Intelligence.** Building the workflow and governance engine but never adding the intelligence layer. This produces a compliance tool, not decision intelligence infrastructure.

8. **Intelligence Without Governance.** Adding AI recommendations without embedding them in governed workflows. Ungoverned intelligence in regulated domains is reckless.

9. **Horizontal Category Drift.** Positioning EDI as a general-purpose decision platform for all business decisions without proving it in a specific domain first. Category breadth without domain depth is marketing, not strategy.

### What EDI Must Never Become

Enterprise Decision Intelligence must never become:
- A **dashboard layer** that visualizes decisions without managing their lifecycle.
- A **chat interface** that generates recommendations outside governed workflows.
- A **compliance checklist** that tracks approvals without evidence or intelligence.
- A **generic AI platform** that applies LLMs to decisions without domain depth.
- A **task management system** that routes work without understanding decision quality.
- A **data catalog** that traces lineage but not the decisions made using that data.
- A **reporting tool** that shows decision outcomes but not how those decisions were reached.

When EDI becomes any of these, it has abandoned its category and joined an existing one.

## 16. Examples

**Example 1: Audit Findings Decision Lifecycle.** An auditor reviews a set of findings generated by AuditOS. The system has analyzed the trial balance, detected anomalous entries, and produced findings — each with evidence traces linking back to source documents. The auditor reviews each finding: examines the evidence, reads the system's recommendation, and decides: accept, reject, or modify. Each decision is recorded with the evidence, recommendation, and auditor's reasoning. The finding moves through the lifecycle: evidence gathered → signal detected → recommendation generated → human reviewed → decision made → action taken (report inclusion or exclusion). Six months later, a regulator asks why a specific finding was excluded. The auditor traces from the outcome back through the decision, evidence, recommendation, and source data in under a minute.

**Example 2: Journal Entry Approval Decision Lifecycle.** A financial intelligence module identifies a journal entry that exceeds materiality thresholds and lacks supporting documentation. The system generates a recommendation: "This entry requires additional evidence before approval." The entry enters the decision lifecycle. The reviewer examines the evidence, requests additional documentation, and records the decision. The lifecycle captures every step. Later, when the same entry pattern appears across the organization, the system surfaces it as a risk signal for future decision lifecycles.

**Example 3: Cross-Engagement Learning.** Over 200 audit engagements, the decision lifecycle captures every findings decision — which findings were accepted, rejected, modified, and the evidence that supported each outcome. The system identifies patterns: certain journal entry types are consistently associated with material misstatements. These patterns become risk signals that feed back into the intelligence layer, proactively flagging similar entries in new engagements. The decision lifecycle has become a learning system.

## 17. Enterprise Impact

1. **Decision traceability.** Every decision can be traced from outcome back through the complete lifecycle. Regulatory inquiries that once took weeks now take minutes.
2. **Decision quality improvement.** Evidence-backed, governed, reviewed decisions are systematically better than implicit, undocumented decisions. Quality is measurable and improvable.
3. **Organizational learning.** Decision patterns — what works, what does not, what signals correlate with good outcomes — are captured across engagements and across teams. Institutional intelligence compounds over time.
4. **Risk reduction.** Untraceable decisions are unmanaged risk. Every decision with a complete lifecycle is a decision whose risk is understood and documented.
5. **Professional productivity.** Reviewers spend less time gathering evidence and reconstructing decision context, and more time exercising professional judgment — the opposite of current practice.
6. **Governance confidence.** Regulators, clients, and internal compliance teams can inspect decision processes with confidence. Governance is demonstrated by the system, not claimed by policy documents.

## 18. Long-Term Strategic Importance

Enterprise Decision Intelligence is the category AQLIYA is building. This document defines the category.

The long-term vision: every enterprise decision — in audit, finance, governance, risk, compliance, and operations — runs on AQLIYA's decision infrastructure. Not because we have the best AI, but because we are the only platform that treats decisions as structured, evidence-backed, governed, and learnable assets.

This will take time. Categories are not declared — they are proven. AuditOS proves EDI in audit. Financial intelligence proves it in finance. Governance operations prove it in compliance. Each domain proof builds the category.

The companies that define new categories do not compete on features. They compete on intellectual frameworks. This document is the framework for Enterprise Decision Intelligence.

EDI ليست مجرد فئة برمجية. هي طريقة جديدة لفهم القرارات المؤسسية وإدارتها.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 01.01 | AQLIYA Foundational Thesis | Root doctrine establishing why decision infrastructure matters |
| 01.03 | What AQLIYA Is / Is Not | EDI is the category this document protects from drift |
| 04.01 | Financial Intelligence Thesis | Financial intelligence as a specific EDI domain |
| 05.01 | AuditOS Thesis | First wedge execution of EDI theory |
| 20.01 | Decision Model | Structural model of the decision object |
| 20.02 | Recommendation Model | Structural model of recommendations within the decision lifecycle |
| 17.02 | Decision | Definition of decision as a term |
| 17.03 | Recommendation | Definition of recommendation as a term |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial definition of Enterprise Decision Intelligence category |
| 1.0 | 2026-05-08 | Founding Team | Approved as part of AQLIYA Core Doctrine v1.0 |
| 0.2 | 2026-05-07 | Founding Team | Added definition box; comparison table in §4; AuditOS proof section in §5; decision lifecycle diagram in §6; decision object model in §7; "What EDI Must Never Become" in §15 |
