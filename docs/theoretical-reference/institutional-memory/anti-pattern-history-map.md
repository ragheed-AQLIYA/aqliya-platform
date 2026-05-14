# Anti-Pattern History Map

## Purpose
Catalog the anti-patterns and failure models discovered and documented in Part 18 — Anti-Patterns & Failure Models. Records why each was formally documented and what systemic failure it prevents.

---

### 1. AI Wrapper Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.01 |
| **Name** | AI Wrapper |
| **Description** | A product that offloads its core value to an external model and provides no structural advantage beyond prompt engineering and a user interface. No domain model, no evidence management, no governance enforcement. The fastest path to commoditization. |
| **Why It Matters** | A wrapper has no structural differentiation. The same model, prompt, and response can be replicated by any competitor in days. In regulated domains, a wrapper cannot answer "Why should I trust this recommendation?" It creates an accountability gap. When the model layer commoditizes, the wrapper's commercial position collapses. |
| **Prevention** | Own the domain model, evidence pipeline, and governance engine. Model selection is interchangeable infrastructure. Structure outputs as findings, risk signals, and evidence gaps — not freeform text. Embed evidence traces in every recommendation. Architecturally separate the model inference layer from the domain logic, evidence, and governance layers per 18.01 §10. |

### 2. Dashboard-Only Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.02 |
| **Name** | Dashboard-Only |
| **Description** | A product that becomes a visualization and aggregation layer over existing data without providing workflow intelligence, decision structure, or governance. Dashboards show what happened but do not structure how decisions are made. |
| **Why It Matters** | Dashboards create the illusion of decision intelligence. They show data that might inform a decision but do not participate in the decision itself. Decisions made in response to dashboard data happen off-system — in email, meetings, and conversations — and are therefore untraceable and unauditable. Dashboard products compete against Tableau, Power BI, and dozens of mature BI platforms. |
| **Prevention** | Workflow is primary, dashboard is secondary. Every alert, anomaly, and metric must link to a governed action workflow. Decisions are structured objects with lifecycle, not events that vanish. The workflow engine is the architectural core, not the query engine. All product decisions deepen the workflow or strengthen the evidence chain — not improve data display alone. |

### 3. Black-Box AI Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.03 |
| **Name** | Black-Box AI |
| **Description** | Using AI models that cannot explain their outputs, produce evidence traces, or provide auditable reasoning chains. The relationship between input and output cannot be inspected, understood, or explained by a professional reviewer. |
| **Why It Matters** | Black-box AI creates an unresolvable accountability gap. The system produces an output; the professional is accountable for acting on it; but the professional cannot inspect, validate, or challenge the reasoning. In regulated domains, a recommendation that cannot be traced to its evidence and reasoning is not usable regardless of accuracy. Regulators increasingly require explainability. |
| **Prevention** | Explainability is a hard architectural requirement. Every AI output must include an evidence trace and domain-appropriate explanation. Models that inherently resist explanation (deep neural networks with millions of parameters) are unacceptable as sole decision models. Use ensemble and hybrid approaches combining interpretable core models with supplementary AI signals. Architecturally disallow deployment of models that cannot produce evidence traces in regulated workflows. |

### 4. Governance-Less AI Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.04 |
| **Name** | Governance-Less AI |
| **Description** | AI capabilities deployed without governance infrastructure — no approval chains, no access controls, no audit trails, no accountability structures, and no enforcement mechanisms. |
| **Why It Matters** | Every ungoverned AI output erodes institutional trust and creates unmanaged professional risk. Governance that is added after AI deployment is not governance — it is documentation of what happened without control over what will happen. This is the most dangerous anti-pattern because it is the most common: the path of least resistance is to ship AI first and add governance later. |
| **Prevention** | Governance is the first thing built, not the last. The governance engine is a core architectural component at the same level as the workflow engine, evidence layer, and intelligence layer. Every AI output passes through the governance engine before reaching a user. All data access passes through the governance layer — the intelligence layer requests data through a governed interface. Model deployment is a governed decision, not an engineering configuration. |

### 5. Workflow Fragmentation Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.05 |
| **Name** | Workflow Fragmentation |
| **Description** | Enterprise decision processes are split across disconnected tools, systems, and communication channels — email, spreadsheets, document management, chat, project management — resulting in no unified decision trail and no consistent governance. |
| **Why It Matters** | A decision that is made across five disconnected systems is not a governable decision. It is an unmanaged sequence of events that no system can trace, audit, or learn from. In regulated domains, this is a compliance problem, a governance problem, and a professional liability problem. The decision does not exist as an object — it is scattered across systems that cannot communicate. |
| **Prevention** | The workflow engine is the single, unified system for all decision processes. Evidence, recommendations, approvals, and actions live within the workflow. The workflow trace IS the audit trail. Cross-system integration must connect through the workflow engine, not bypass it. Standardize on the decision lifecycle model from evidence to outcome within a single system. |

### 6. Premature Platform Expansion Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.06 |
| **Name** | Premature Platform Expansion |
| **Description** | Expanding to adjacent domains, use cases, or markets before achieving depth and dominance in the initial wedge (AuditOS). |
| **Why It Matters** | Platform companies die when they expand before they dominate. Every domain expansion before wedge dominance dilutes resources, fragments domain depth, and signals to the market that the company is a generalist. If AQLIYA expands into compliance, risk management, and general finance before dominating audit, the market will categorize it as a general-purpose platform competing against every horizontal tool. |
| **Prevention** | AuditOS wedge must be driven deep before any expansion. Financial Intelligence is the first moat (deepens the wedge), not the first expansion (broadens beyond it). Use the wedge-moat-expansion sequence: dominate the wedge, deepen the moat, then expand. Every product decision must first answer: "Does this deepen our position in audit?" |

### 7. Feature Factory Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.07 |
| **Name** | Feature Factory |
| **Description** | Product development driven by customer feature requests and competitive benchmarking rather than by a coherent theoretical framework. Building whatever customers ask for, whatever competitors launch, without a unifying thesis. |
| **Why It Matters** | A feature-accumulation strategy produces a product that is broad but shallow. It has many features but no depth in any domain that matters. It competes with horizontal platforms on feature count — a competition it cannot win. Every feature that does not strengthen the decision infrastructure makes the product more like a generic tool and less like a category-defining system. |
| **Prevention** | Filter every feature request through the category thesis and the Product Philosophy (13.01). Customer feedback is categorized: thesis-aligned (build), thesis-adjacent (evaluate), thesis-contradictory (reject). The Positioning Test (01.03 §6) must be passed for every initiative. No feature enters the roadmap without answering: "Does this deepen evidence management, governance enforcement, or workflow intelligence?" |

### 8. Over-Automation Anti-Pattern

| Field | Content |
|---|---|
| **ID** | 18.08 |
| **Name** | Over-Automation |
| **Description** | Automating professional judgment before the system has earned sufficient trust, demonstrated sufficient reliability, and established sufficient governance to justify removing human decision-making authority. |
| **Why It Matters** | In regulated domains, the cost of an automated error is measured in regulatory penalties, professional liability, institutional trust erosion, and client harm. A single wrong automated decision can create more cost than a thousand correct automated decisions save. Over-automation replaces human accountability with machine authority before the machine has earned the right to that authority. |
| **Prevention** | Follow the Progressive Intelligence Model (13.05): evidence surfacing → anomaly detection → recommendation generation → controlled automation. Each stage is introduced only after the previous stage has proven reliable under human supervision. Automation follows trust. Trust is earned. The sequence cannot be reversed. Configurable automation thresholds per engagement risk. |

### 9. Weak Traceability Failure Model

| Field | Content |
|---|---|
| **ID** | 18.09 |
| **Name** | Weak Traceability |
| **Description** | The failure mode where decision traceability is insufficient — state transitions are not recorded, evidence references are missing, actor attribution is incomplete, or the audit trail cannot be reconstructed from workflow state. |
| **Why It Matters** | Traceability is the defining metric of decision infrastructure maturity. If a decision cannot be traced from outcome back through approval, recommendation, evidence, and source data, it cannot be audited, governed, or learned from. Weak traceability makes regulatory inspection a forensic exercise rather than a read operation. |
| **Prevention** | Event sourcing is mandatory for all governed state transitions. Every workflow step logs evidence references, actor attribution, and timestamp. The complete workflow trace is persisted as a structured, queryable object. Audit is a read operation on workflow state — not a forensic reconstruction. |

### 10. Poor Parsing Failure Model

| Field | Content |
|---|---|
| **ID** | 18.10 |
| **Name** | Poor Parsing |
| **Description** | The failure mode where financial data ingestion produces unreliable, incomplete, or erroneous results due to inadequate parsing logic, insufficient format support, or lack of validation. |
| **Why It Matters** | Financial Intelligence is the first moat. If the data ingestion layer is unreliable — if trial balances are misread, journal entries are lost, or chart-of-accounts mappings are incorrect — every downstream capability (anomaly detection, risk assessment, recommendation generation) is built on a broken foundation. Parsing is table stakes, not a differentiator — but poor parsing destroys all value above it. |
| **Prevention** | Robust parser validation pipeline covering all target ERP formats. Format-specific parsers with explicit validation rules. Data quality scoring at ingestion. Trust gates that prevent low-quality data from entering the evidence lifecycle. Continuous expansion of format coverage prioritized by market demand. |

### 11. Low Trust AI Failure Model

| Field | Content |
|---|---|
| **ID** | 18.11 |
| **Name** | Low Trust AI |
| **Description** | The failure mode where AI outputs are not trusted by professional reviewers, leading to disuse, override fatigue, or rejection of the intelligence layer entirely. |
| **Why It Matters** | If reviewers do not trust AI outputs, they will not use them — regardless of accuracy. The intelligence layer becomes a cost without benefit. Trust is not a feature that can be added; it is earned through demonstrated reliability, explainability, and governance over time. Low trust is the inevitable outcome of any of the other anti-patterns (wrapper, black-box, governance-less, over-automation). |
| **Prevention** | Build trust through the Progressive Intelligence Model. Start with evidence surfacing (low risk, high visibility). Demonstrate reliability before introducing recommendations. Provide complete evidence traces for every output. Make uncertainty visible. Respect reviewer overrides and learn from them. Track trust metrics: acceptance rate, override frequency, anomaly relevance score. |

### 12. Operational Blindness Failure Model

| Field | Content |
|---|---|
| **ID** | 18.12 |
| **Name** | Operational Blindness |
| **Description** | The failure mode where an organization cannot see its own decision processes — whether decisions are being made, by whom, based on what evidence, with what governance, and with what outcomes. |
| **Why It Matters** | An organization that cannot see its decision processes cannot manage them. It cannot identify bottlenecks, detect evidence gaps, enforce governance, or improve decision quality. Operational blindness is the meta-failure that enables all other anti-patterns. Without visibility into decision operations, no anti-pattern can be detected until it has caused damage. |
| **Prevention** | Decision operations dashboards visible to reviewers and managers. Workflow analytics showing cycle time, evidence completeness, governance compliance, and approval patterns. Real-time alerts for governance violations, evidence gaps, and process bottlenecks. The system must make decision operations visible, not just decision outcomes. |
