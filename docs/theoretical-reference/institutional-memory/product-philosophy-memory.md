# Product Philosophy Memory

## Purpose
Capture the evolution of AQLIYA's product philosophy from Part 13 — Product Philosophy. Records each key position, its source, its implication for product development, and its current relevance.

---

### 1. Workflow Is the Product

| Field | Content |
|---|---|
| **Position** | The primary interface is a structured, stateful, evidence-aware workflow. Everything else — dashboards, reports, analytics — is a secondary view derived from workflow state. |
| **Source** | 13.01 Product Philosophy Thesis, §5(1). Also 13.04 Workflow Before Dashboard Thesis, §2. |
| **Implication** | The first screen a user sees is their workflow inbox. Every feature exists within workflow context. The workflow has opinionated defaults based on professional standards (ISA, GAAS). Evidence is presented inline. Governance actions (approve, reject, escalate) are primary interactions. |
| **Current Relevance** | Active. This is the foundational product position. It differentiates AQLIYA from dashboard, chatbot, and BPM categories. All current and future product lines inherit this position. Directly protects against the Dashboard-Only anti-pattern (18.02). |

### 2. Intelligence Augments Judgment

| Field | Content |
|---|---|
| **Position** | AI in AQLIYA produces evidence-backed recommendations within governed workflows. It does not generate ungrounded text, make autonomous decisions, or bypass human review. |
| **Source** | 13.01 Product Philosophy Thesis, §5(2). Also 13.05 Intelligence Before Automation Thesis, §2. |
| **Implication** | AI is embedded within workflows, not available as a standalone AI feature. There is no "AI chat" surface — AI assistance appears within review, finding, and recommendation workflow steps. Every AI output includes a complete evidence trace. The reviewer can inspect, challenge, and override every component. |
| **Current Relevance** | Active. Governs all AI feature development. Intelligence is introduced progressively: evidence surfacing → anomaly detection → recommendation generation → controlled automation (per 13.05). Protects against the Over-Automation anti-pattern (18.08). |

### 3. Evidence Is the Unit of Trust

| Field | Content |
|---|---|
| **Position** | No recommendation exists without traceable evidence. No decision is recorded without supporting data. The product is evidence infrastructure, not information infrastructure. |
| **Source** | 13.01 Product Philosophy Thesis, §5(3). Derived from 01.01 §6(6) and 01.09 §2. |
| **Implication** | Evidence is a first-class product surface — upload, review, verification, provenance display. Evidence is presented inline with decisions and recommendations. The reviewer should never have to search for supporting evidence. Evidence quality is measured: completeness, verification rate, relevance. |
| **Current Relevance** | Active. This position directly protects against the AI Wrapper anti-pattern (18.01) and Black-Box AI anti-pattern (18.03). Evidence traces are a hard product requirement for every AI output. |

### 4. Governance Is Structural

| Field | Content |
|---|---|
| **Position** | Governance constraints are embedded in workflow logic. Approval chains, access controls, audit trails, and compliance checks are part of the system architecture, not bolt-on compliance modules. |
| **Source** | 13.01 Product Philosophy Thesis, §5(4). Derived from 01.07 §2 and 01.01 §6(4). |
| **Implication** | Governance configuration is a core product capability, not an admin panel. It is presented to authorized users with the same design care as any workflow surface. Governance state is always visible. Governance actions (approve, reject, escalate) are primary interactions. |
| **Current Relevance** | Active. Protects against the Governance-Less AI anti-pattern (18.04). Governance is the operating system of the product, not a feature module. |

### 5. The Reviewer Is the Primary User

| Field | Content |
|---|---|
| **Position** | Every interface, interaction pattern, and information display is optimized for the professional reviewer who makes decisions eight hours a day. Executive dashboards are secondary. |
| **Source** | 13.01 Product Philosophy Thesis, §5(5). Also 13.03 Enterprise UX Philosophy. |
| **Implication** | UX is optimized for sustained professional use — keyboard shortcuts, batch operations, exception-focused views, progressive disclosure. Governance actions are primary buttons, not hidden in menus. The interface is opinionated — it guides the reviewer through a structured process rather than presenting an empty canvas. |
| **Current Relevance** | Active. Governs all UX decisions. The reviewer's workflow is the primary design target. Mobile and executive views are secondary. Directly opposes executive-first design (18.02 anti-pattern). |

### 6. Category Discipline Over Feature Momentum

| Position | We say no to features, deals, and directions that compromise the category thesis, even when they generate revenue. |
|---|---|
| **Source** | 13.01 Product Philosophy Thesis, §5(6). Also 13.12 Product Focus Doctrine, §2. |
| **Implication** | Every feature must pass the "Is this AQLIYA?" test (01.03 Positioning Test). Customer feedback is categorized: thesis-aligned (build), thesis-adjacent (evaluate), thesis-contradictory (reject). Sales that require mispositioning are rejected. |
| **Current Relevance** | Active. Protects against the Feature Factory anti-pattern (18.07) and Premature Platform Expansion anti-pattern (18.06). Category discipline is the immune system against drift. |

### 7. Workflow Before Dashboard

| Position | The workflow is the core product experience. The dashboard is a secondary view derived from workflow state. |
|---|---|
| **Source** | 13.04 Workflow Before Dashboard Thesis, §2. This is a category-defining position, not a UX preference. |
| **Implication** | The first screen is the workflow inbox. Dashboards serve governance oversight — they exist to support partner review and firm-level visibility, not to be the primary product experience. Dashboard metrics are computed from workflow state, not the reverse. |
| **Current Relevance** | Active. This position directly protects against the Dashboard-Only anti-pattern (18.02). It also protects against Chat-as-Workflow drift (13.04 §15) — a conversational interface cannot enforce governance, track evidence, or maintain audit trails. |

### 8. Intelligence Before Automation

| Position | Intelligence must precede automation in enterprise decision systems. Assist before you replace, understand before you act, earn trust before you accelerate. |
|---|---|
| **Source** | 13.05 Intelligence Before Automation Thesis, §2. |
| **Implication** | The Progressive Intelligence Model governs all AI deployment: evidence surfacing → anomaly detection → recommendation generation → controlled automation. Each stage is introduced only after proven reliability. Automation is earned, not declared. The sequence cannot be skipped. |
| **Current Relevance** | Active. Protects against Over-Automation (18.08) and the generic temptation to ship AI autonomy before trust is established. This thesis enables controlled automation only after demonstrated reliability under human supervision. |

### 9. Explainability Before Autonomy

| Position | A system that cannot explain itself should not be trusted — and a system that cannot be trusted should not be autonomous. |
|---|---|
| **Source** | 13.06 Explainability Before Autonomy Thesis, §2. |
| **Implication** | Every AI output has an evidence trace visible by default. Explanations are domain-appropriate (materiality, evidence strength, risk level), not technical (feature weights, probability scores). Uncertainty is communicated honestly. Black-box models are architecturally excluded. |
| **Current Relevance** | Active. Protects against the Black-Box AI anti-pattern (18.03). Explainability is a hard product requirement. The more authority an AI output carries, the more rigorous the explanation requirement. |

### 10. Product Trust Is Structural

| Position | Trust is a structural property of the product, not a messaging strategy. A product is trustworthy when its behavior is predictable, its outputs are explainable, its limitations are visible, its governance is enforced, and its human accountability is preserved. |
|---|---|
| **Source** | 13.10 Product Trust Philosophy, §2. |
| **Implication** | Trust is built through evidence traces, governance enforcement, failure-aware intelligence, and the progressive deployment model. The product never asks for trust — it earns it through repeated positive interactions. Trust metrics (recommendation acceptance rate, anomaly relevance score, override frequency) are tracked and surfaced. |
| **Current Relevance** | Active. Trust is the currency of regulated enterprise sales. This philosophy informs every product surface — from evidence traces to confidence indicators to limitation disclosures. |

### 11. Product Focus Doctrine

| Position | AQLIYA builds decision intelligence infrastructure. AuditOS is the first wedge. Financial Intelligence is the first moat. Everything else is a distraction until the wedge is deep and the moat is established. |
|---|---|
| **Source** | 13.12 Product Focus Doctrine, §2. |
| **Implication** | Features that do not serve the audit wedge or the Financial Intelligence moat are rejected. Feature requests must strengthen evidence management, governance enforcement, or workflow intelligence for audit. The product roadmap is built around wedge depth, not market breadth. |
| **Current Relevance** | Active. This is the binding scope definition. It protects against Premature Platform Expansion (18.06), Feature Factory (18.07), and the numerous drift risks identified in 01.03 §15 (AI Wrapper Drift, Dashboard Drift, CRM Drift, Generic SaaS Drift, etc.). |

### 12. Progressive Intelligence Philosophy

| Position | Early deployments deliver structured workflows with minimal AI. Deeper deployments unlock AI-assisted recommendations as trust builds. AI features are introduced gradually, in sequence. |
|---|---|
| **Source** | 13.09 Progressive Intelligence Philosophy. Also 13.05 §5. |
| **Implication** | New customers start with evidence surfacing and anomaly detection. Recommendations are enabled after demonstrated reliability. Controlled automation is the final stage. This is not a technical limitation — it is the trust-building sequence required by regulated domains. |
| **Current Relevance** | Active. Governs the rollout of AI capabilities to customers. Prevents the common failure of deploying AI features that the organization is not ready to trust. Directly protects against Over-Automation (18.08) and Low Trust AI Failure Model (18.11). |
