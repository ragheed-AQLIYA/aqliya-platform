# Evidence Over Automation Principle

## Purpose

Establishes the governing principle that evidence precedes automation in all AQLIYA workflows. No AI output without evidence trace. No automation without evidence gate. This principle is derived from approved doctrine and is structurally enforced across all product layers.

## Core Rule

> **No AI output enters a governed workflow without an evidence trace. No automated transition occurs without passing an evidence gate. Automation follows evidence sufficiency, never precedes it.**

---

## Principle Matrix

### 1. Evidence Precedes AI Output

| Dimension | Definition |
|-----------|------------|
| **Principle** | Every AI-generated suggestion, classification, flag, or draft must be paired with the specific evidence that supports it. AI influence on decisions is proportional to evidence quality, relevance, and verifiability. |
| **Source** | Part 09 §2, Part 09 §5, Part 10 §5, Part 10 §10 |
| **Operational Meaning** | AI models do not produce outputs that enter reviewer workflows without evidence references. The intelligence layer must surface the evidence that drove each output inline, linked to source data, before the output is presented. |
| **Product Implication** | Every AI output surface (suggestion panel, flag notification, draft editor) renders evidence references as primary content, not secondary drill-down. Any AI output that cannot cite specific evidence is blocked at the API layer. |

### 2. Evidence Precedes Workflow Transition

| Dimension | Definition |
|-----------|------------|
| **Principle** | No workflow state transition may occur unless the governing evidence gate is satisfied. Workflow progression is earned by evidence sufficiency, not by task completion. |
| **Source** | Part 07 §3, Part 07 §6, Part 01 §5 |
| **Operational Meaning** | Every workflow transition (draft → review, review → approval, approval → publish) has a defined evidence gate. The gate checks completeness, provenance, and confidence of required evidence before allowing progression. Transitions that would bypass an evidence gate are prevented at the state machine level. |
| **Product Implication** | The workflow engine includes an evidence gate evaluator that runs synchronously on every transition attempt. UI surfaces show gate status (passed, blocked, pending conditions) inline. Manual override of an evidence gate is a governance event requiring second-person approval. |

### 3. Evidence Precedes Automation

| Dimension | Definition |
|-----------|------------|
| **Principle** | Automation of non-material tasks may only execute within boundaries defined by evidence thresholds. Automated actions must be preceded by evidence conditions that are verifiable and auditable. |
| **Source** | Part 10 §3, Part 15 §6, Part 01 §1 |
| **Operational Meaning** | Governed automation (e.g., routing, notification, template population) operates only when evidence conditions are met. Automation scope is explicitly bounded; any action that affects a material decision path requires human authority. Automation without evidence preconditions is prohibited. |
| **Product Implication** | Automation rules are configured with evidence preconditions, not just task triggers. The product surfaces automation status (active, blocked, bypassed) and the evidence conditions that govern it. Automation boundary changes are governance-controlled events. |

### 4. Evidence Precedes Publication

| Dimension | Definition |
|-----------|------------|
| **Principle** | No report, finding, or decision output may be published without a complete evidence trace linking every material assertion to its supporting evidence. |
| **Source** | Part 09 §10, Part 05 §11, Part 08 §5 |
| **Operational Meaning** | Publication generates a signed manifest that enumerates all evidence artifacts, decision points, reviewer actions, and approval events. The manifest is verifiable by downstream consumers and regulators. Publication is blocked if any required evidence is missing, untrusted, or unresolved. |
| **Product Implication** | Publication API runs a completeness check before generating the manifest. The product displays evidence gaps as publication blockers. The manifest is a first-class output object with its own identity, version, and traceability. |

### 5. Evidence Precedes Learning

| Dimension | Definition |
|-----------|------------|
| **Principle** | Organizational learning from decision outcomes must be grounded in evidence traces, not derived from outcomes alone. AI improvement feedback loops operate on evidence-grounded data. |
| **Source** | Part 09 §11, Part 10 §9, Part 01 §9 |
| **Operational Meaning** | AI retraining, model improvement, and insight extraction use only evidence-grounded decision data. Outcomes without evidence traces are excluded from learning cycles. Learning governance ensures feedback does not bypass evidence quality gates. |
| **Product Implication** | Learning pipelines consume data from the evidence store, not raw event logs. The product reports on evidence coverage rates and flags outcomes missing evidence traces as governance exceptions. |

---

## Evidence Gate Types

| Gate Type | Check | Blocking Condition |
|-----------|-------|--------------------|
| Completeness gate | All required evidence items present | Missing items identified with specific location and type |
| Provenance gate | Each evidence item has attributable source | Evidence with unknown or untrusted source is blocked |
| Confidence gate | Evidence confidence meets workflow threshold | Low-confidence evidence flagged for reviewer before transition |
| Freshness gate | Evidence is within acceptable age range | Stale evidence triggers revalidation requirement |
| Consistency gate | Evidence supports the asserted finding or recommendation | Evidence contradicts assertion; reviewer must reconcile |

---

## Violation Severity

| Violation | Severity | Consequence |
|-----------|----------|-------------|
| AI output without evidence trace | Critical | Output discarded; governance event triggered; model pipeline flagged for review |
| Workflow transition without evidence gate | Critical | Transition reversed; affected decisions placed under review; system change control investigation |
| Automation without evidence precondition | High | Automation suspended; boundary configuration reviewed; governance audit initiated |
| Publication without evidence manifest | Critical | Publication blocked; compliance team notified; incident review required |
| Learning from unevidenced outcomes | High | Training data quarantined; affected model versions flagged for revalidation |

---

## Doctrine Sources

- Part 09 — Data Trust & Data Quality (09.01 Data Trust Theory, 09.02 Source Data Reliability Theory, 09.05 Data Provenance Theory, 09.06 Data Quality Scoring Theory, 09.10 Data-to-Decision Trust Chain, 09.11 Financial Data Error Taxonomy, 09.12 Garbage-In Risk Model)
- Part 01 — Foundational Doctrine (01.01 AQLIYA Foundational Thesis §5, §6; 01.05 AI-Native Enterprise Infrastructure Thesis; 01.09 Evidence-Centric Company Philosophy)
- Part 05 — Audit Intelligence (05.01 AuditOS Thesis, 05.07 Evidence Intelligence Theory, 05.10 Explainable Audit Intelligence, 05.11 Audit Report Intelligence, 05.12 Audit Review Lifecycle, 05.14 Audit Governance Model)
- Part 07 — Workflow Intelligence (07.01 Workflow Intelligence Theory §6, 07.03 Workflow State Theory, 07.06 Evidence Lifecycle Framework, 07.11 Workflow Traceability Theory)
- Part 10 — Human + AI Operating Model (10.01 Human + AI Thesis, 10.04 AI Assistance Theory, 10.10 Evidence-Backed AI Theory)
- Part 15 — Responsible Intelligence Doctrine (15.01, 15.06, 15.07 Explainable Limitation Disclosure)
- Part 08 — Governance & Trust (08.01 Governance and Trust Thesis, 08.05 Traceability Doctrine, 08.09 Evidence Governance Doctrine)

---

*This principle is structural doctrine. No performance optimization, feature velocity, or commercial pressure may override the requirement that evidence precedes automation.*
