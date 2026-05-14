# Strategic Doctrine Map

## Purpose
Map the evolution of AQLIYA's strategic doctrines — how key positions originated, their current status, and their projected future direction.

---

### 1. AQLIYA as AI Operating Systems / Company Platform

| Field | Content |
|---|---|
| **Doctrine** | AQLIYA is a company/platform that builds AI operating systems for business decisions, sales, finance, compliance, and professional reporting. It is not an audit tool, not an EDI company — it is the platform layer. |
| **Original Context** | Originally framed in early doctrine (01.01, 02.01) as "Enterprise Decision Intelligence" being AQLIYA's top-level identity. The company was described primarily through the lens of decision infrastructure. |
| **Current Status** | Official architecture clarified: AQLIYA is the company/platform. EDI is one strategic doctrine within it. Products include Decision OS, Simulation OS, Sales OS, Edit OS, Local Content OS, AuditOS / Financial Intelligence, and Content Authority OS. The modernization note in every Part document now clarifies the earlier language. |
| **Future Direction** | Multi-product platform expansion guided by wedge dynamics. AuditOS proves the model in audit. Financial Intelligence extends it in finance. Governance operations, compliance, and other domain operating systems follow as additional wedges. Each proves the platform and enriches the shared infrastructure. |

### 2. AuditOS as Wedge, Not Identity

| Field | Content |
|---|---|
| **Doctrine** | AuditOS is AQLIYA's current primary product line and first commercial focus — a proving ground for the platform model, not the full company identity. |
| **Original Context** | 01.01 §2 established AuditOS / Financial Intelligence as the first product line. 01.03 §2 explicitly warns: "AuditOS is a product line, not the identity." The wedge serves the category, not the reverse. |
| **Current Status** | Active. AuditOS is the primary market entry point. All current product development is in the audit domain. The architectural separation between platform-level services and AuditOS-specific services is maintained per 01.03 §10. |
| **Future Direction** | Once AuditOS achieves depth and market penetration in audit, the platform expands into adjacent domains: Financial Intelligence (FinanceOS), Governance Operations (GovernanceOS), and other decision-intensive domains per the expansion sequence in 01.01 §18 and 00-doctrine-to-execution-map §12. |

### 3. Financial Intelligence as First Moat

| Field | Content |
|---|---|
| **Doctrine** | Financial data depth and domain models — not AI capability — are AQLIYA's primary defensible advantage. |
| **Original Context** | 01.01 §6(9): "Financial Intelligence is the first defensible moat because financial decisions carry the highest liability density and the deepest evidence requirements." 02.02 §5: "Financial Intelligence is the first moat" — proving decision infrastructure in finance proves it in every domain. |
| **Current Status** | Active and reinforced. The entire data model reflects financial domain structures (ledgers, accounts, journals, trial balances) per 01.01 §10(8). Parsing is table stakes; financial domain models are the moat. |
| **Future Direction** | As financial data models deepen, they become increasingly difficult to replicate. The moat widens with every engagement's financial data patterns. Cross-engagement learning from financial signals compounds the advantage. Expansion beyond audit into financial intelligence (FinanceOS) is the next sequential step per the roadmap. |

### 4. Governance Is Structural, Not Procedural

| Field | Content |
|---|---|
| **Doctrine** | Governance is enforced by system architecture, not policy documents. If governance can be bypassed, it will be. |
| **Original Context** | 01.01 §5 and §6(4) established governance-first as a core philosophical commitment. 01.07 dedicated an entire philosophy document to this position. |
| **Current Status** | Active and architecturally embedded. Governance rules execute as synchronous guards in the workflow engine. No governance requirement may be optional or user-configurable to bypass. The anti-pattern 18.04 (Governance-Less AI) codifies the prohibition. |
| **Future Direction** | Governance becomes the operating system for all AQLIYA product lines. Federated governance across domains and tenants. Governance rules that are themselves governed decisions (meta-governance). Regulatory frameworks (ISA, GAAS, PDPL, GDPR) mapped to governance rule templates. |

### 5. Evidence Is the Unit of Trust

| Field | Content |
|---|---|
| **Doctrine** | Every intelligence output and decision must be reducible to traceable evidence. Evidence is a first-class data type with its own schema, lifecycle, storage, and governance. |
| **Original Context** | 01.01 §5 established evidence-centric philosophy. §6(6) made evidence the unit of trust. 01.09 dedicated an entire philosophy document to evidence-centricity. |
| **Current Status** | Active and architecturally implemented. Evidence is a first-class data type with provenance, lifecycle, and access controls per 01.09 §10. The doctrine-to-execution map §3(5) binds every recommendation to evidence. |
| **Future Direction** | Evidence store becomes a core platform service supporting all domain modules. Evidence quality metrics drive continuous improvement. Cross-engagement evidence discovery enables institutional intelligence. AI-generated evidence traces become as structured and verifiable as human-submitted evidence. |

### 6. AI Assists. Humans Decide. Evidence Governs.

| Field | Content |
|---|---|
| **Doctrine** | The operating model is structural: AI recommends, human reviews, evidence constrains. No system output may be treated as a final decision without attributable human authority. |
| **Original Context** | 01.01 §5 stated "Human-in-the-loop, always." §6(5) established human accountability. 10.01 formalized the Human + AI operating model. |
| **Current Status** | Active and enforced at the architecture level. Human decision joints are structurally unskippable per 07.01 §10. The doctrine-to-execution map §7 defines allowed and not-allowed AI operations. No-Autonomous-Audit rule (15.04) is binding. |
| **Future Direction** | Progressive automation introduced only after demonstrated reliability per 13.05 (Intelligence Before Automation). Controlled automation for mechanical tasks. Judgment tasks remain human-supervised. The boundary between assist and automate is governed and configurable per engagement risk. |

### 7. Workflow Before Dashboard

| Field | Content |
|---|---|
| **Doctrine** | The primary product interface is the governed workflow, not a dashboard. Dashboards are secondary views derived from workflow state. |
| **Original Context** | 01.01 §5 established workflow-first philosophy. 01.08 dedicated a philosophy document. 13.04 made it a category-defining product thesis. |
| **Current Status** | Active and binding. The first screen a user sees is their workflow inbox. Dashboards are accessible but secondary. The doctrine-to-execution map UX1 and PR1 codify this as a product requirement. |
| **Future Direction** | Workflow engine expands to support multiple domain-specific workflow templates. Cross-workflow composition and orchestration. Workflow analytics that drive continuous process improvement. The workflow remains the primary structure across all AQLIYA product lines. |

### 8. No AI Wrapper

| Field | Content |
|---|---|
| **Doctrine** | Value must come from domain depth, evidence architecture, and governance — not from model access. AQLIYA is not a thin interface over an LLM. |
| **Original Context** | 01.01 §15(1) identified AI Wrapper as the first anti-pattern. 01.03 §5 explicitly states AQLIYA is "not a prompt layer." 18.01 dedicated an entire anti-pattern document. |
| **Current Status** | Active and enforced. Model selection is interchangeable infrastructure, not the product. The product owns the domain model, evidence pipeline, and governance engine per 18.01 §6 and 00-doctrine-to-execution-map §3(8). |
| **Future Direction** | As models commoditize, AQLIYA's structural advantages become more valuable. Domain depth, evidence architecture, and governance engine are not replicable by changing a prompt. Model access becomes a commodity layer — value accumulates at the domain, evidence, and governance layers. |

### 9. No Autonomous Audit Decisions

| Field | Content |
|---|---|
| **Doctrine** | AI may not approve, sign, finalize, or issue audit conclusions. Every report-impacting conclusion requires attributable human authority. |
| **Original Context** | 01.01 §12(1) stated AI is always assistive. 05.01 §12 prohibits autonomous audit decisions. 15.01 §4 (No-Autonomous-Audit Decision Rule) made it a binding rule. |
| **Current Status** | Active and architecturally enforced. The workflow engine blocks any transition that would bypass human review. Allowed AI operations are defined per 00-doctrine-to-execution-map §7. Not-allowed operations include approve, sign, finalize, issue conclusions, accept evidence autonomously, and auto-advance workflow state. |
| **Future Direction** | Remains absolute. As AI capabilities improve, the boundary between allowed and not-allowed operations will be governed, not relaxed. Controlled automation for mechanical tasks may expand, but professional judgment tasks remain human-decided. |

### 10. Category Creation, Not Feature Competition

| Field | Content |
|---|---|
| **Doctrine** | AQLIYA is not competing as a generic AI tool vendor. We are defining a new category: Enterprise Decision Intelligence and AI operating systems for governed enterprise work. Success is measured by category leadership, not feature parity. |
| **Original Context** | 01.01 §5 stated "Category creation, not feature competition." 01.03 §6 established "Identity is strategy" and the Positioning Test. |
| **Current Status** | Active and binding. The doctrine-to-execution map §10 defines forbidden builds (chat interface, dashboard-first, AI audit autopilot, prompt layer, etc.) 18.06 (Premature Platform Expansion) and 18.07 (Feature Factory) protect this position. |
| **Future Direction** | Category ownership is established one domain wedge at a time. Market education shifts buyers from existing categories (audit software, AI tool) to the new category (decision infrastructure, AI operating systems). Long-term, AQLIYA becomes the category-defining company for governed enterprise decision systems. |
