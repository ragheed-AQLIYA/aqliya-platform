---
title: AQLIYA Doctrine-to-Execution Map
document_id: 00.MAP.001
status: Draft
owner: Founding Team
version: 0.1
last_updated: 2026-05-08
---

# AQLIYA Doctrine-to-Execution Map

## 1. Purpose

This document translates the 15 documents of AQLIYA Core Doctrine v1.0 into executable requirements for product, architecture, governance, AI behavior, UX, and go-to-market execution. It answers the question: *What must we build, how must we build it, and what must we never build, given the approved doctrine?*

## Modernization Context

This map was originally authored under a doctrine set where Enterprise Decision Intelligence language was used as AQLIYA's top-level category identity.

Under the current official company architecture, AQLIYA is the company/platform. In this document, Enterprise Decision Intelligence and decision infrastructure language should be read as one strategic doctrine inside AQLIYA's broader AI operating systems architecture.

This is not a product specification. It is the bridge between theory and implementation. Each product team, engineering team, and GTM team should derive their detailed specifications from the requirements stated here.

---

## 2. Source of Truth

The following 15 documents constitute AQLIYA Core Doctrine v1.0 (Approved):

| ID | Document |
|----|----------|
| 01.01 | AQLIYA Foundational Thesis |
| 01.03 | What AQLIYA Is / Is Not |
| 02.01 | Enterprise Decision Intelligence Theory |
| 02.02 | Decision Infrastructure Theory |
| 04.01 | Financial Intelligence Thesis |
| 05.01 | AuditOS Thesis |
| 07.01 | Workflow Intelligence Theory |
| 08.01 | Governance & Trust Thesis |
| 09.01 | Data Trust Theory |
| 10.01 | Human + AI Thesis |
| 13.01 | Product Philosophy Thesis |
| 13.04 | Workflow Before Dashboard Thesis |
| 15.01 | Responsible Intelligence Doctrine |
| 18.01 | AI Wrapper Anti-Pattern |
| 21.06 | Source of Truth Rules |

No document outside this list may override these requirements. If a conflict arises, the hierarchy rules in 21.06 apply: Part 01 overrides Part 02, which overrides Part 03, and so on.

---

## 3. Binding Doctrine Principles

| # | Doctrine | Meaning | Source Document | Execution Consequence |
|---|----------|---------|-----------------|----------------------|
| 1 | **AQLIYA is the company/platform; decision infrastructure is one doctrine within it** | AQLIYA builds AI operating systems across multiple business domains, with governed decision infrastructure remaining one strategic systems thesis | 01.01 §2, 01.03 §2, 02.01 §1 | Product surfaces must distinguish company identity from doctrine identity while preserving workflow, evidence, and governance principles. |
| 2 | **AuditOS is a product line, not company identity** | AuditOS / Financial Intelligence is AQLIYA's current primary product line and first commercial focus, not the company itself | 05.01 §2, 01.03 §5, 02.02 §5 | Platform architecture must support multiple product lines. Product naming must keep AuditOS as a product line under AQLIYA. |
| 3 | **Financial Intelligence is first moat** | Financial data depth and domain models are the primary defensible advantage | 04.01 §1, 02.02 §5, 08.01 §5 | Financial data ingestion, normalization, and validation are core platform capabilities. Parsing is table stakes; financial domain models are the moat. |
| 4 | **Governance is structural, not procedural** | Governance is enforced by system architecture, not policy documents or user training | 08.01 §2, 07.01 §11, 13.01 §5 | Governance rules execute as workflow engine transition guards. No governance requirement may be optional or user-configurable to bypass. |
| 5 | **Evidence is the unit of trust** | Every intelligence output and decision must be reducible to traceable evidence | 01.01 §6, 09.01 §5, 10.01 §5 | Evidence is a first-class data type with schema, lifecycle, storage, provenance, and access control. No recommendation without evidence trace. |
| 6 | **AI assists. Humans decide. Evidence governs.** | The operating model is structural: AI recommends, human reviews, evidence constrains | 10.01 §2, 15.01 §2, 07.01 §12 | The workflow engine must enforce human decision joints. AI outputs are structurally scoped as recommendations, never decisions. Evidence gates precede every material transition. |
| 7 | **Workflow before dashboard** | The primary product interface is the governed workflow, not a dashboard | 13.04 §2, 13.01 §5, 07.01 §2 | The first screen a user sees is their workflow inbox. Dashboards are secondary views computed from workflow state. |
| 8 | **No AI wrapper** | Value must come from domain depth, evidence architecture, and governance — not from model access | 18.01 §2, 18.01 §6, 13.01 §5 | The product must own the domain model, evidence pipeline, and governance engine. Model selection is interchangeable infrastructure, not the product. |
| 9 | **No autonomous audit decisions** | AI may not approve, sign, finalize, or issue audit conclusions | 05.01 §12, 15.01 §6, 10.01 §11 | Every report-impacting conclusion requires attributable human authority. The workflow engine blocks any transition that would bypass human review. |
| 10 | **Data becomes evidence only through context, provenance, relevance, and reviewability** | Raw data is not evidence. Data requires validation, attribution, and positioning within a decision context to become evidence. | 01.01 §7, 09.01 §5, 04.01 §5 | The platform must distinguish stored data from accepted evidence. Trust gates evaluate data before it can enter the evidence lifecycle. |
| 11 | **Decisions are structured enterprise objects** | Decisions have identity, schema, lifecycle, storage, access control, and versioning | 02.02 §5, 02.01 §6, 20.01 (model) | The decision object is the architectural center. Every feature exists to serve the decision object's lifecycle. |
| 12 | **Trust is produced by system structure** | Trust is earned through evidence-backed workflows, attributable decisions, explainable intelligence, and enforced governance | 08.01 §2, 08.01 §6, 09.01 §2 | Trust is not a UX layer or marketing claim. It is a structural property verified by inspecting the system's evidence chains, governance enforcement, and audit trails. |
| 13 | **Human accountability is non-negotiable** | The professional human reviewer remains accountable for every material decision | 10.01 §6, 15.01 §5, 15.03 (doctrine) | No system output may be treated as a final decision without attributable human authority. Override mechanisms must structurally exist, not merely be possible. |

---

## 4. Product Requirements Derived from Doctrine

| # | Requirement | Doctrine Source | Product Implication | MVP Relevance | Priority |
|---|-------------|-----------------|-------------------|---------------|----------|
| PR1 | Workflow inbox is the first screen | 13.04 §2, 07.01 §8 | User logs in to see pending tasks prioritized by risk and deadline. Not a dashboard. | MVP | Critical |
| PR2 | Evidence is presented inline with recommendations | 13.01 §5, 05.01 §9 | Every AI suggestion surfaces with its supporting evidence. Reviewer never navigates away to find evidence. | MVP | Critical |
| PR3 | Governance status is visible at all times | 08.01 §9, 13.01 §11 | Workflow state shows approval requirements, evidence completeness, and pending governance checks. | MVP | Critical |
| PR4 | AI recommendations are visually distinct | 10.01 §9, 15.01 §13 | AI-suggested content is clearly marked. Human-approved content is separately marked. No ambiguity. | MVP | High |
| PR5 | Dashboards are secondary views | 13.04 §2, 13.04 §9 | Dashboard is accessible but not primary. It derives from workflow state, not the reverse. | Post-MVP | High |
| PR6 | Override is equally frictionless as acceptance | 10.01 §9, 10.01 §13 | Rejecting or modifying an AI recommendation takes the same number of clicks as accepting it. | MVP | Critical |
| PR7 | Evidence management is a core product surface | 01.01 §9, 05.01 §9 | Users upload, verify, view provenance, and manage evidence within the workflow context. Not a separate document repository. | MVP | Critical |
| PR8 | Review lifecycle is visible and actionable | 05.01 §9, 07.01 §13 | Reviewers see where they are in the lifecycle, what evidence is required, and what governance steps remain. | MVP | High |
| PR9 | Recommendation-to-decision flow is explicit | 02.01 §6, 10.01 §9 | Every recommendation has accept/modify/reject actions. The reviewer's choice is recorded as a decision event. | MVP | Critical |
| PR10 | Audit trail is user-visible, not hidden in logs | 01.01 §9, 08.01 §9 | Authorized users can navigate the complete decision trail: evidence → recommendation → review → approval → report. | MVP | High |

---

## 5. Architecture Requirements Derived from Doctrine

| # | Requirement | Doctrine Source | Architecture Implication | Required Component | Priority |
|---|-------------|-----------------|------------------------|--------------------|----------|
| AR1 | Build an evidence-aware, governance-enforcing workflow engine | 02.02 §10, 07.01 §10, 13.04 §10 | Not a generic BPM engine. State machine with evidence gates, governance evaluators, and human decision joints. | Workflow/Decision Engine | Critical |
| AR2 | Evidence must have a dedicated persistence layer | 02.02 §10, 01.01 §10, 09.01 §10 | Separate store with provenance metadata, versioning, integrity hashes, and access control. Referenced by workflow state. | Evidence Store | Critical |
| AR3 | Governance rules execute synchronously during workflow transitions | 02.02 §10, 08.01 §10 | Governance evaluator is embedded in the workflow engine. Rules are evaluated at transition time, not after. | Governance Evaluator | Critical |
| AR4 | Every state transition is an immutable event | 02.02 §10, 07.01 §10, 08.01 §10 | Event sourcing captures every transition with evidence references, actor attribution, and timestamp. The event log is the audit trail. | Event Log / Audit Trail | Critical |
| AR5 | Decision objects are first-class data types | 02.02 §5, 02.01 §10 | Schema: context, evidence, options, recommendation, approval, action, outcome, learning. Lifecycle-managed by the engine. | Decision Object Model | Critical |
| AR6 | Recommendations carry evidence provenance and model metadata | 10.01 §10, 18.01 §10 | Each recommendation includes model version, input snapshot, confidence, reasoning trace, and evidence links. | Recommendation Model | Critical |
| AR7 | Evidence objects have a defined schema and lifecycle | 09.01 §7, 05.01 §10 | Schema: source, provenance, validation status, trust state, access control. Lifecycle: candidate → verified → accepted → referenced. | Evidence Model | Critical |
| AR8 | Tenant isolation is enforced at the data layer | 08.01 §10, 05.01 §10 | Each tenant's evidence, decisions, workflows, and governance rules are isolated at storage level. | Tenant Isolation | Critical |
| AR9 | Role-based access control is embedded in the workflow engine | 08.01 §10, 07.01 §11 | Roles determine workflow authority. A reviewer cannot approve beyond their designated authority tier. | RBAC | Critical |
| AR10 | AI outputs carry full provenance metadata | 10.01 §10, 18.01 §10 | Model version, input data hash, confidence, reasoning trace, generation timestamp. Enables replay and audit. | AI Provenance | Critical |
| AR11 | Explainability artifacts are stored alongside AI outputs | 08.01 §10, 15.01 §10 | Each AI output has attached explanation: what data was used, what reasoning was applied, what alternatives were considered. | Explainability Storage | High |
| AR12 | Deployment flexibility at launch: cloud, private cloud, self-hosted | 02.02 §10, 05.01 §10 | Single codebase supports all deployment modes. Governance, evidence, and audit capabilities are identical across modes. | Deployment Flexibility | High |

---

## 6. Governance Requirements Derived from Doctrine

| # | Requirement | Source | Enforced By |
|---|-------------|--------|-------------|
| G1 | No anonymous actions | 08.01 §11, 05.01 §11 | Workflow engine requires authenticated actor for every state transition. |
| G2 | Every recommendation traceable to evidence | 05.01 §11, 08.01 §11 | Evidence model links every recommendation to specific evidence objects with provenance. |
| G3 | Every approval attributable to a human reviewer | 08.01 §11, 10.01 §11 | Approval transitions require human actor authentication. System-level approval is not permitted. |
| G4 | Every report-impacting finding traceable to evidence | 05.01 §11, 08.01 §5 | Report generation queries evidence traceability graph. Untraced findings block report issuance. |
| G5 | Governance rule changes are themselves governed events | 08.01 §11, 02.02 §11 | Changes to governance rules are versioned, require approval, and are recorded as decision events. |
| G6 | No trusted output without evidence trace | 09.01 §11, 08.01 §11 | The system must not surface any output as "trusted" without an inspectable evidence chain. |
| G7 | No autonomous audit decisions | 05.01 §12, 15.01 §4 | AI may recommend, signal, flag, and draft — but may not approve, sign, finalize, or issue conclusions. |
| G8 | Governance is evaluated at workflow transition time | 02.02 §11, 07.01 §11 | Governance rules execute as synchronous guards during lifecycle transitions. Post-hoc evaluation is not governance. |
| G9 | Override of a trust gate requires attributable rationale | 09.01 §11, 08.01 §11 | Trust gate overrides are recorded with actor identity, rationale, and governance approval if required. |

---

## 7. AI Operating Boundaries

### Allowed

| Operation | Scope | Constraint |
|-----------|-------|------------|
| **Suggest** | Anomaly detection, pattern recognition, risk flags | Must include evidence trace and confidence indicator |
| **Classify** | Journal entry type, account category, risk tier | Must disclose methodology and confidence basis |
| **Flag** | Unusual transactions, missing evidence, data quality issues | Must link to specific data with explanation |
| **Extract candidate evidence** | Identify potential supporting documents for a finding | Must present as candidate, not verified evidence |
| **Summarize with provenance** | Generate evidence summaries for reviewer review | Every statement in the summary must link to source |
| **Rank reviewer queues** | Prioritize items by risk, deadline, materiality | Algorithm and weighting must be disclosed and configurable |
| **Draft recommendations with evidence** | Generate finding drafts from evidence patterns | Must be marked as AI-draft, require human review before entering findings lifecycle |
| **Detect evidence gaps** | Identify missing evidence requirements for a workflow step | Must specify what evidence is missing and why |
| **Signal confidence degradation** | Alert when data trust status changes | May trigger workflow reevaluation automatically |

### Not Allowed

| Operation | Rationale | Doctrine Source |
|-----------|-----------|-----------------|
| **Approve** any workflow transition | Approval is a human governance act | 10.01 §2, 15.01 §6 |
| **Sign** reports or conclusions | Signing carries professional liability | 05.01 §12, 15.01 §6 |
| **Finalize audit findings** without human confirmation | Findings are professional judgments | 05.01 §12, 15.04 §2 |
| **Accept evidence autonomously** | Evidence requires human verification of provenance and sufficiency | 04.01 §12, 09.01 §10 |
| **Issue audit conclusions** | Conclusions carry regulatory and professional weight | 05.01 §12, 15.01 §6 |
| **Bypass human review** at any governed decision joint | Human authority is structurally required | 07.01 §10, 10.01 §11 |
| **Operate as black-box AI** in governed workflows | All AI in governed workflows must be explainable | 10.11 §2, 18.01 §5 |
| **Auto-advance workflow state** without human action | Every state transition at a decision joint requires explicit human action | 07.01 §13, 13.01 §9 |

---

## 8. UX Requirements

| # | Requirement | Doctrine Source | UX Implication | Priority |
|---|-------------|-----------------|----------------|----------|
| UX1 | Workflow-first UI | 13.04 §2, 07.01 §13 | The primary navigation is the workflow. The user sees their position in the engagement lifecycle, pending tasks, and next action. | Critical |
| UX2 | Evidence inline with recommendations | 13.01 §13, 10.01 §13 | Every AI suggestion displays its supporting evidence in the same view. No drill-down required. | Critical |
| UX3 | AI vs human distinction | 10.01 §13, 15.01 §13 | AI-suggested content and human-approved content are visually distinct at every interaction point. | Critical |
| UX4 | Review gates visibly displayed | 05.01 §9, 07.01 §13 | Workflow shows which steps require review, which have passed, and which are blocked. | Critical |
| UX5 | Governance status visible | 08.01 §13, 13.01 §13 | Approval status, evidence completeness, and governance checkpoints are displayed prominently. | Critical |
| UX6 | Override friction equal to acceptance | 10.01 §13, 10.01 §9 | Accepting, modifying, or rejecting a recommendation requires the same effort. No default acceptance path. | Critical |
| UX7 | Dashboards are secondary | 13.04 §2, 13.04 §9 | Dashboard is accessible but is a computed view from workflow state. The user's daily work is the workflow. | High |
| UX8 | Governed actions are primary interactions | 13.01 §13, 05.01 §9 | Approve, reject, escalate, request evidence are primary buttons, not hidden in menus. | High |
| UX9 | Limitation disclosures at point of action | 15.01 §13, 10.01 §13 | AI confidence and limitations are shown where the reviewer acts on the output, not in a separate document. | High |

---

## 9. Commercial / GTM Requirements

| # | Requirement | Doctrine Source | GTM Implication | Priority |
|---|-------------|-----------------|-----------------|----------|
| C1 | Do not sell as AI audit chatbot | 01.03 §8 (Sales Boundary Rules) | All sales materials must lead with AQLIYA's official company positioning and avoid chatbot positioning. | Critical |
| C2 | Do not sell as dashboard | 01.03 §8, 13.04 §2 | No sales demo should lead with a dashboard view. The primary demo is the workflow. | Critical |
| C3 | Sell AQLIYA as a multi-product AI operating systems company | 01.03 §8, 02.01 §1 | Every pitch positions AQLIYA as the company/platform and explains decision infrastructure as one strategic doctrine and product-domain thesis. | Critical |
| C4 | Position AuditOS as the current primary product line | 01.03 §14, 05.01 §14 | Sales conversations may start with AuditOS, but they should frame it as an official AQLIYA product line and first commercial focus, not the whole company. | Critical |
| C5 | Proof through pilot metrics | 02.01 §14, 05.01 §14 | Pilots measure: evidence gaps detected, review coverage improved, governance compliance rate, traceability depth. Not time-saved alone. | Critical |
| C6 | Value metrics are evidence quality, review efficiency, traceability, governance confidence | 01.01 §14, 08.01 §14 | Pricing and value conversations use these metrics, not seats, MAU, or storage. | High |
| C7 | Self-hosted and air-gapped are premium | 02.02 §14, 05.01 §14 | These deployment modes command premium pricing because they solve sovereignty problems cloud-only products cannot address. | High |
| C8 | Trust-based selling is the only model | 08.01 §14, 14.06 (doctrine) | Enterprise buyers in regulated domains do not buy without governance-level trust. The product must be demonstrated as governed infrastructure. | Critical |

---

## 10. Forbidden Builds

The following feature categories must not be built unless fundamentally re-framed to align with doctrine:

| Feature Category | Why Forbidden | Doctrine Source | Re-framing Possible? |
|-----------------|---------------|-----------------|---------------------|
| **Generic chat interface** | Stateless, untraceable, ungoverned. Creates expectation of autonomous AI. | 01.03 §5, 18.01 §15, 10.11 §2 | No — chat is structurally incompatible with governed workflows |
| **Dashboard-first product** | Reverses the correct relationship. Dashboards inform; workflows enable. | 13.04 §2, 13.04 §15 | No — this is a category-defining position |
| **AI audit autopilot** | Autonomous audit decisions are prohibited. AI may not replace the auditor. | 05.01 §12, 15.01 §6, 15.04 §2 | No — autonomous audit violates core doctrine |
| **Prompt layer / LLM interface** | Thin wrapper over a model. No domain depth, evidence, or governance. | 18.01 §2, 18.01 §15, 01.03 §5 | No — this is the AI Wrapper anti-pattern |
| **Generic file Q&A** | Treats every query as a stateless question. No workflow, governance, or decision lifecycle. | 18.01 §15, 13.01 §15 | No — incompatible with structured decision infrastructure |
| **CRM-like audit management** | Manages relationships, not decisions. Different category. | 01.03 §5, 01.03 §15 | Possibly — only if re-framed as decision workflow management |
| **Checklist-only audit tool** | Digitizes paper without intelligence, evidence, or governance. | 01.03 §5, 13.04 §4 | No — does not meet EDI definition |
| **Black-box anomaly scoring** | Score without explanation. Cannot be trusted in governed workflows. | 10.11 §2, 18.01 §15, 08.01 §15 | No — all AI in governed workflows must be explainable |
| **Feature factory / horizontal SaaS** | Building whatever customers ask for without theoretical coherence. | 13.01 §15, 01.03 §5 | No — destroys the category thesis |
| **Generic BPM workflow engine** | Task routing without evidence awareness, governance enforcement, or domain depth. | 07.01 §15, 13.04 §15, 02.02 §5 | No — the workflow engine must be evidence-aware and governance-aware |

---

## 11. AuditOS MVP Translation

The MVP translates the approved doctrine into the minimum set of capabilities required to prove the model in audit.

| Capability | Doctrine Source | MVP Scope | Notes |
|------------|-----------------|-----------|-------|
| **Client / organization scoping** | 05.01 §5, 08.01 §8 | Configure tenant, users, roles, governance rules | RBAC and tenant isolation at the data layer |
| **Engagement setup** | 05.01 §5, 07.01 §8 | Define engagement scope, team, timeline, evidence requirements | Workflow template instantiation |
| **Trial balance intake** | 04.01 §5, 09.01 §9 | Import trial balance, validate completeness, assess data trust | Trust gates validate before evidence creation |
| **Ledger / journal import** | 04.01 §5, 09.01 §9 | Import general ledger and journal entries | Financial normalization pipeline |
| **Evidence upload** | 05.01 §9, 09.01 §9 | Upload supporting documents, link to workflow steps | Evidence enters as candidate, requires verification |
| **Evidence review** | 05.01 §9, 07.01 §6 | Review evidence for sufficiency, provenance, relevance | Evidence lifecycle: candidate → verified → accepted |
| **Findings lifecycle** | 05.01 §6, 07.01 §5 | Draft → Review → Approval → Escalation → Publication | Governed state machine per finding |
| **Recommendation publication** | 05.01 §11, 10.01 §9 | AI-generated findings presented with evidence traces | Marked as AI-draft, requires human review |
| **Reviewer approval** | 05.01 §12, 08.01 §11 | Human reviewer accepts, modifies, or rejects findings | Every approval is an attributable governance event |
| **Report traceability** | 05.01 §11, 08.01 §5 | Report references traceable to evidence, findings, approvals | Report blocked if dependencies missing |
| **Audit logging** | 02.02 §10, 08.01 §10 | Every state transition recorded with evidence references | Immutable event log |
| **RBAC** | 08.01 §10, 05.01 §10 | Role-based access per tenant, engagement, and document | Enforced at data layer |
| **AI-assisted recommendations** | 10.01 §2, 05.01 §12 | AI flags anomalies, suggests findings with evidence traces | Must be human-approved before becoming findings |

---

## 12. Roadmap Implications

### Must Build Now (MVP)

| Priority | Capability | Rationale |
|----------|------------|-----------|
| P0 | Workflow engine with state machine, evidence gates, governance evaluator | Architectural core of the entire system |
| P0 | Evidence store with provenance, integrity, access control | Evidence is the unit of trust |
| P0 | Decision object model with lifecycle | Architectural center per 02.02 |
| P0 | RBAC with data-layer enforcement | Governance requirement G1, G3 |
| P0 | Immutable event log / audit trail | Governance requirement G4, G6 |
| P0 | Findings lifecycle (draft → review → approval → publication) | Core audit workflow |
| P0 | Evidence upload and verification workflow | Foundation for all audit work |
| P0 | AI-assisted anomaly detection with evidence traces | Demonstrates AI assists, humans decide |
| P0 | Governance evaluator synchronous with workflow transitions | Governance requirement G8 |

### Must Design Now, Build Later

| Priority | Capability | Rationale |
|----------|------------|-----------|
| P1 | Financial normalization pipeline (ledger, journal, trial balance) | Financial Intelligence moat |
| P1 | Multi-tenant governance rule configuration per engagement | Enterprise scaling |
| P1 | Report generation with traceability enforcement | Report defensibility |
| P1 | Self-hosted deployment mode | Commercial requirement C7 |
| P1 | AI recommendation drafting with full provenance | AI boundary requirement |
| P2 | Cross-engagement learning / pattern detection | Organizational memory |
| P2 | Escalation workflows with governed override paths | Governance maturity |
| P2 | Private cloud deployment mode | Deployment flexibility |

### Must Avoid

| Feature | Why |
|---------|-----|
| Chatbot UI of any kind | Violates doctrine (10.11, 01.03) |
| Dashboard-first product experience | Violates doctrine (13.04) |
| Autonomous audit features | Violates doctrine (15.04, 05.01) |
| Generic BPM capabilities without evidence/governance | Violates doctrine (07.01, 13.04) |
| CRM or relationship management features | Violates doctrine (01.03) |
| AI that approves or finalizes without human | Violates doctrine (10.01, 15.01) |
| Model-centric product (wrapping LLM as value) | Violates doctrine (18.01) |

### Future Platform Expansion

| Domain | Precondition | Doctrinal Basis |
|--------|--------------|-----------------|
| Financial Intelligence (FinanceOS) | AuditOS wedge proven with paying customers | 04.01 §2, 05.01 §2 |
| Governance Operations (GovernanceOS) | Financial Intelligence wedge established | 01.01 §2, 02.02 §5 |
| Enterprise Decision Intelligence (horizontal) | Multiple domain wedges validated | 02.01 §1, 01.01 §18 |

---

## 13. Open Questions

These execution questions are not fully resolved by the current doctrine and require engineering, product, or strategic decisions:

| # | Question | Relevant Doctrine | Decision Needed By |
|---|----------|-------------------|-------------------|
| 1 | What is the exact schema of the decision object across all domains (audit, financial, governance)? | 02.02 §5, 20.01 (model) | Architecture design phase |
| 2 | What is the precise relationship between "signal," "finding," and "recommendation" in the lifecycle? | 02.01 §6, 04.01 §2, 05.01 §2 | MVP scoping |
| 3 | How are evidence trust gates calibrated per engagement type and regulatory regime? | 09.01 §8, 08.01 §8 | Implementation phase |
| 4 | What is the minimum governance rule set for MVP vs. enterprise deployment? | 08.01 §6, 05.01 §11 | Product scoping |
| 5 | Which audit standards (ISA, GAAS, PCAOB) are encoded in the initial workflow templates? | 05.01 §5, 07.01 §9 | Implementation phase |
| 6 | How does the system handle evidence that crosses tenant boundaries (e.g., shared client data)? | 08.01 §10, 09.01 §6 | Architecture design phase |
| 7 | What is the performance SLA for the evidence store and workflow engine in production? | 02.02 §10, 07.01 §10 | Engineering planning |
| 8 | How does the self-hosted deployment handle model updates without internet access? | 12.04 (doctrine), 05.01 §10 | Architecture design phase |
| 9 | What is the pricing model: per-engagement, per-tenant, infrastructure license? | 02.02 §14, 05.01 §14 | Commercial planning |
| 10 | What metrics define "pilot success" for the first 3 audit firm customers? | 05.01 §14, 08.01 §14 | GTM planning |

---

## 14. Next Documents to Create

These execution documents should be created after this map is approved:

| Priority | Document | Purpose | Depends On |
|----------|----------|---------|------------|
| 1 | **AuditOS MVP Product Requirements Document** | Detailed PRD for the MVP, mapping each capability to doctrine | This map |
| 2 | **Architecture Decision Records (ADRs)** | Record architectural decisions for workflow engine, evidence store, governance evaluator | This map, MVP PRD |
| 3 | **Data Model Specification** | Schemas for decision object, evidence, recommendation, finding, risk signal, workflow state | ADRs, Core doctrine |
| 4 | **Governance Model Specification** | Governance rule types, evaluation engine, configuration model, audit trail schema | Data model, 08.01 |
| 5 | **AI Boundary Specification** | AI operation types, provenance metadata schema, explainability artifact format, allowed/not-allowed list | Data model, 10.01 |
| 6 | **Pilot Readiness Checklist** | Technical, governance, and commercial checklist for first customer pilot | MVP PRD, Governance spec |
| 7 | **UX Design Principles Document** | Derived from doctrine UX requirements, guides all product design | This map UX §8 |

---

## Summary

### What This Map Does

1. **Translates 15 approved doctrine documents** into 13 binding principles with specific execution consequences.
2. **Derives 10 product requirements**, 12 architecture requirements, and 9 governance requirements — all traceable to specific doctrine sources.
3. **Defines clear AI operating boundaries**: what AI may do (7 operations) and what AI must never do (8 operations).
4. **Establishes 9 UX requirements** that define the product experience.
5. **Sets 8 commercial/GTM requirements** including forbidden positioning.
6. **Identifies 10 forbidden build categories** — features that must not be built.
7. **Translates doctrine into MVP capabilities** across 13 capability areas.
8. **Separates the roadmap** into must-build-now, design-now-build-later, must-avoid, and future expansion.
9. **Lists 10 open execution questions** that require decisions.
10. **Recommends 7 next documents** to create.

### Key Requirements Derived

- **Critical path (P0)**: Workflow engine with evidence gates, evidence store with provenance, decision object model, RBAC, immutable event log, findings lifecycle, AI-assisted anomaly detection with evidence traces, governance evaluator synchronous with transitions.
- **Must not build**: Chatbot UI, dashboard-first product, autonomous audit features, generic BPM, CRM features, AI approval without human, model-centric product.
- **First on roadmap**: AuditOS MVP with the 13 capabilities listed in §11.

### Recommended Next Execution Document

**AuditOS MVP Product Requirements Document** — This is the single most important next document. It translates the doctrine-to-execution map into a concrete, actionable product specification for the first engineering sprints.
