# DecisionOS — Product Definition Pack

> **v1.1 Alignment Notice:** This document contains detailed product design thinking written before the AQLIYA v1.1 official taxonomy. The v1.1 hierarchy positions AuditOS as the primary proof product (Phase 2) and DecisionOS as an adjacent active system. This document's content is valuable for implementation but should be read alongside `docs/official/aqliya-product-taxonomy-v1.1.md`.

Source of truth companion: `docs/products/auditos-product-packaging.md`
Product focus doctrine: `docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`
Current state: `docs/systems/decisionos/README.md`, `docs/systems/decisionos/decisionos-core-engine.md`

---

## 1. Product Identity

**Product name:** DecisionOS / Decision Intelligence

**Category:** Enterprise Decision Intelligence

**Role in architecture:** The core decision intelligence application — the structured, evidence-backed, governed operating system for enterprise decisions. This is the category-defining product. AuditOS is the wedge; DecisionOS is the category.

**Official one-liner:**
DecisionOS gives enterprises a structured, governed path from "we need to decide" to "we decided — here's the evidence, here's the framework, here's what we're tracking."

**تعريف بالعربية:**
DecisionOS يمنح المؤسسات مسارًا منظمًا ومحكومًا من "نحتاج أن نقرر" إلى "قررنا — هذا الدليل، هذا الإطار، وهذا ما نتابعه".

---

## 2. Positioning Statement

DecisionOS is AQLIYA's decision intelligence operating system. It structures enterprise decisions — tenders, investments, expansions, partnerships — through a governed pipeline: Intake → Framework → Scenarios → Risk Analysis → Recommendation → Simulation → Intelligence → Governance → Post-Decision Monitoring.

It does not make decisions for you. It makes every decision defensible.

---

## 3. Trust Principle

**AI assists. Humans decide. Evidence governs.** The structure ensures the human owns the decision; the system ensures the decision is traceable.

---

## 4. Ideal Customer Profile (ICP)

### Primary

1. **Executive decision-makers** — CEOs, managing directors, partners making high-stakes strategic decisions
2. **Investment committees** — evaluating capital allocation, M&A, expansion, and strategic investments
3. **Tender and procurement committees** — evaluating multi-million-dollar bids with structured scoring
4. **Strategy and transformation offices** — managing portfolios of strategic initiatives

### Secondary

1. **CFOs and finance leadership** — structuring capital allocation and investment decisions
2. **Partnership and alliance teams** — evaluating partnership opportunities with structured frameworks
3. **Enterprise risk committees** — integrating decision-making with risk governance
4. **Board-level decision support** — providing structured decision packages for board review

### Buyer and User Mapping

| Segment | Likely Buyer | Primary Users | Main Need |
|---|---|---|---|
| Executive leadership | CEO / Managing Director | Strategy team, executive assistants | Structured decisions with evidence and scenario analysis |
| Investment committee | CIO / Head of Investments | Investment analysts, portfolio managers | Multi-scenario simulation before capital commitment |
| Tender/procurement | Head of Procurement / Commercial Director | Tender evaluation teams, procurement officers | Scored, governed, auditable tender evaluation |
| Strategy office | Chief Strategy Officer | Strategy analysts, PMO | Portfolio of governed strategic decisions |
| SME leadership | Founder / GM | Operations lead, finance lead | Simpler path from "should we?" to "we will, and here's why" |

---

## 5. Core Problem

Enterprise decisions — especially high-stakes ones — are often made with:

1. **No structured framework** — information scattered across documents, emails, and meetings
2. **No scenario simulation** — decisions made on single-point estimates, not modeled outcomes
3. **No evidence traceability** — assumptions and data sources lost after the decision
4. **No governed approval** — approvals happen in email threads with no conditions or evidence gating
5. **No post-decision monitoring** — once decided, no structural tracking of whether the decision played out as modeled
6. **No organizational learning** — past decisions don't inform future ones systematically

The result: decisions that are hard to defend, impossible to audit, and impossible to learn from.

---

## 6. What DecisionOS Solves

DecisionOS helps enterprises:

1. **Structure every decision** through the A-1 pipeline: Intake → Framework → Scenarios → Risk Analysis → Recommendation
2. **Simulate scenarios** before commitment — BEST_CASE, EXPECTED_CASE, WORST_CASE — with multi-dimensional scoring
3. **Attach evidence** to every assumption, scenario, and recommendation
4. **Route decisions through governed approvals** — configurable chains with evidence gating
5. **Monitor post-decision outcomes** — signals, alerts, and drift detection
6. **Extract patterns** — organizational learning from past decisions by sector, type, and outcome

---

## 7. Core Workflow (A-1 Pipeline)

```text
A-1.0 Intake         ← Define the decision: type, title, objectives, deadline
    ↓
A-1.1 Framework      ← Structure: objectives, constraints, assumptions, alternatives, stakeholders
    ↓
A-1.2 Scenarios      ← Model: BEST_CASE, EXPECTED_CASE, WORST_CASE per alternative
    ↓
A-1.3 Risk Analysis   ← Assess: risks per scenario, likelihood, impact, mitigation
    ↓
A-1.4 Recommendation  ← Conclude: GO / GO_WITH_CONDITIONS / NO_GO / DEFER / NEEDS_MORE_DATA
    ↓
A-1.5 Simulation      ← Score: financial, operational, capacity, risk, strategic fit (per type)
    ↓
A-1.6 Intelligence     ← Synthesize: executive overview, strategic insight, what-to-do-now
    ↓
A-1.7 Governance       ← Approve: role-based approval chains, evidence gating, immutable log
    ↓
A-1.8 Post-Decision    ← Monitor: signals, alerts, outcome tracking, pattern extraction
```

### Decision Types Supported

| Type | Description | Simulation Available |
|---|---|---|
| TENDER | Tender/bid evaluation | Full financial + capacity simulation |
| INVESTMENT | Capital investment decisions | Planned |
| EXPANSION | Market/geographic expansion | Planned |
| PROCUREMENT | Major procurement decisions | Planned |
| HIRING | Key hire evaluations | Planned |
| PARTNERSHIP | Strategic partnership evaluation | Planned |
| PRICING | Major pricing decisions | Planned |
| STRATEGIC | General strategic decisions | Generic |
| OPERATIONS | Operational decisions | Generic |
| CUSTOM | Ad-hoc structured decisions | Generic |

---

## 8. Inputs

| Input | Description | Required For |
|---|---|---|
| Decision type | TENDER, INVESTMENT, EXPANSION, etc. | All decisions |
| Objectives (≥ 2) | What the decision aims to achieve | A-1.1 Framework |
| Constraints | Budget, timeline, resource, regulatory limitations | A-1.1 Framework |
| Assumptions | Conditions assumed to hold for analysis | A-1.1 Framework |
| Alternatives | Options being compared (≥ 2) | A-1.1 Framework |
| Scenarios (≥ 3) | BEST_CASE, EXPECTED_CASE, WORST_CASE descriptions | A-1.2 Scenarios |
| Risk entries per scenario | Likelihood, impact, mitigation per risk | A-1.3 Risk Analysis |
| Tender financial data | Contract value, cost, margin, capacity (TENDER type only) | A-1.5 Simulation |
| Sector classification | Industry sector for pattern extraction | Intelligence layer |

---

## 9. Outputs

| Output | Description |
|---|---|
| Structured decision record | Complete A-1 pipeline with all stages completed and gated |
| Scenario comparison | BEST_CASE vs EXPECTED_CASE vs WORST_CASE across all scored dimensions |
| Risk assessment | Per-scenario risk matrix with likelihood × impact × mitigation |
| Recommendation | GO / GO_WITH_CONDITIONS / NO_GO / DEFER / NEEDS_MORE_DATA with rationale |
| Simulation scores | Financial, operational, capacity, risk, strategic fit, overall scores |
| Executive overview | Decision summary with quality score, completeness %, key findings |
| Strategic insight | Deeper analysis: patterns, implications, cross-decision connections |
| What-to-do-now | Immediate action items and next steps |
| Governance trail | Full approval chain with evidence, timestamps, reviewer attribution |
| Post-decision signals | Monitoring signals and risk alerts with acknowledge/resolve workflow |
| Sector patterns | Accumulated patterns from decisions in the same sector |
| Decision report | Exportable, audit-ready decision package |

---

## 10. Business Value

| Value Dimension | Description | Evidence |
|---|---|---|
| **Decision quality** | Structured framework produces more complete, less biased decisions | Completion scores, scenario count, risk coverage |
| **Decision speed** | Governed pipeline reduces decision cycles from weeks to days | Time-per-stage metrics, approval cycle time |
| **Decision defensibility** | Evidence-backed, scenario-simulated decisions withstand scrutiny | Full A-1 pipeline with evidence chain |
| **Risk mitigation** | Risk is assessed per scenario before commitment, not after | Risk matrix per decision, alerts on post-decision drift |
| **Organizational learning** | Patterns extracted from past decisions improve future decisions | Sector patterns, type patterns, outcome correlation |
| **Governance compliance** | Every decision follows a governed, auditable, evidence-gated path | Governance event log, approval chain, compliance score |
| **Post-decision accountability** | Outcomes tracked against modeled scenarios; signals catch drift | Alerts triggered by deviation from expected outcomes |

---

## 11. Relationship with AuditOS

| Aspect | Relationship |
|---|---|
| **Category relationship** | AuditOS is the wedge. DecisionOS is the category. AuditOS proves decision intelligence in one domain; DecisionOS scales it to all domains. |
| **Evidence flow** | AuditOS produces financial evidence (findings, statements, notes). DecisionOS consumes that evidence in financial and investment decisions. |
| **Shared governance** | Both use the same governance layer (GovernanceOS): approval chains, evidence gating, audit trails. |
| **Shared workflow engine** | AuditOS's engagement workflow and DecisionOS's A-1 pipeline share the same workflow architecture — different configurations, same engine. |
| **Shared intelligence layer** | Insight generation, pattern extraction, and sector intelligence work across both products. |
| **Domain expansion path** | AuditOS → Financial Intelligence → Decision Intelligence across all domains. DecisionOS is the product that makes the expansion real. |
| **Buyer overlap** | Audit firm partners who use AuditOS are natural buyers of DecisionOS for their own firm's strategic and investment decisions. |

---

## 12. MVP Scope

### What Already Exists (✅)

DecisionOS has significant working code. This is not a greenfield product.

| Component | Status | Notes |
|---|---|---|
| Core A-1 pipeline (Intake → Recommendation) | ✅ Complete | All 5 stages with CRUD, gating, persistence |
| 10 decision types | ✅ Complete | TENDER + 9 additional types configured |
| Intelligence layer (insight, overview, what-to-do) | ✅ Complete | Generic — works for all decision types |
| Governance page (roles, audit log, approvals) | ✅ Complete | Per-decision governance with RBAC |
| Post-decision monitoring (signals, alerts) | ✅ Complete | Acknowledge/resolve workflow per signal |
| Sector classification and patterns | ✅ Complete | Sector CRUD, benchmarks, pattern extraction |
| Organization multi-tenancy with RBAC | ✅ Complete | ADMIN, OPERATOR, VIEWER roles per org |
| Audit logging | ✅ Complete | Immutable platform-level audit log |
| Tender-specific module (profile, simulation, recommendation) | ✅ Complete | Full 3-scenario simulation with financial scoring |
| Decision report export | ✅ Complete | Printable decision package |

### What to Complete for MVP (Phase 1)

1. **Generic simulation engine** — configurable scoring dimensions per decision type (not just TENDER). Financial, operational, risk, strategic fit dimensions configurable per type.
2. **Generic recommendation engine** — type-specific recommendation rules (not just tender thresholds). GO/NO_GO/CONDITIONAL logic per type.
3. **Decision-type-specific profiles** — InvestmentProfile, ExpansionProfile, ProcurementProfile with type-specific data fields.
4. **Conditional tab visibility** — Type-specific tabs (Tender, Investment, etc.) shown only when relevant to the decision type.
5. **Wire up new decision form** — Server-side submit handler for creating decisions of all types.
6. **De-tender the report page** — Remove tender-specific language from printed decision report.
7. **Demo dataset** — Seed data for non-tender decision types (investment, expansion, partnership).

### MVP Deliverable

DecisionOS MVP enables an enterprise to:
- Create structured decisions of any supported type
- Run the full A-1 pipeline with gated progression
- Simulate scenarios with multi-dimensional scoring (per type)
- Get a recommendation with evidence-backed rationale
- Route through governed approval
- Monitor post-decision outcomes
- Extract patterns from past decisions

---

## 13. What NOT to Build Yet

| Excluded | Rationale | When |
|---|---|---|
| Full ERP integration (SAP, Oracle) | Premature — needs market validation of decision types first | Phase 3 |
| External data marketplace for decisions | Requires data partnerships and legal frameworks | Phase 4 |
| Autonomous decision execution | Contradicts human-in-the-loop principle — decisions are human-owned | Never |
| Multi-language decision content | English + Arabic labels initially; full multilingual postponed | Phase 3 |
| Mobile application | Desktop-first for professional decision-makers | Phase 4 |
| Collaborative real-time editing | Async workflow mode is sufficient for MVP; real-time adds complexity | Phase 2 |
| AI-driven auto-scenario generation | AI assists, doesn't create scenarios autonomously — needs human authorship | Phase 3 |
| Decision marketplace / benchmarking | Industry benchmarking needs data aggregation and anonymization | Phase 4+ |
| Full document management integration | Decision attachments handled through existing infrastructure | Phase 2 |
| Public API for third-party integrations | Internal AQLIYA ecosystem first | Phase 3 |

---

## 14. Demo Scenario

**Opening:**
"هذا DecisionOS — نظام تشغيل الذكاء القراراتي تحت AQLIYA. يمنحك مسارًا منظمًا ومحكومًا من 'نحتاج أن نقرر' إلى 'قررنا — وهذا الدليل'."

**Flow:**

1. **Create a decision** — show the new decision form: type = INVESTMENT, title = "Asia Market Expansion", objectives defined
2. **Framework** — show structured framework: objectives, constraints (budget $2M), assumptions, 3 alternatives (organic, JV, acquisition)
3. **Scenarios** — define 3 scenarios per alternative: BEST_CASE, EXPECTED_CASE, WORST_CASE with descriptions and assumptions
4. **Risk Analysis** — per-scenario risk assessment: regulatory risk (high in WORST_CASE), market risk, execution risk, with mitigation
5. **Simulation** — run generic simulation: financial score (ROI projection), operational score (capacity), risk score, strategic fit, overall decision score per scenario
6. **Recommendation** — system generates GO_WITH_CONDITIONS: JV option scores highest, with conditions on regulatory approval and local partner due diligence
7. **Intelligence** — show executive overview, strategic insight connecting this decision to sector patterns, what-to-do-now
8. **Governance** — route through approval chain: Strategy Director → CFO → CEO, with evidence gating at each stage
9. **Post-Decision** — show monitoring signals: budget variance alert, timeline signal, regulatory milestone tracker
10. **Pattern extraction** — show how this decision adds to the EXPANSION sector pattern library

**Close:**
"DecisionOS لا يتخذ القرار عنك. يجعله قابلاً للدفاع عنه. كل قرار له إطار. كل إطار له سيناريوهات. كل سيناريو له أدلة. كل موافقة لها أثر تتبعي."

---

## 15. Commercial Positioning

### Category
Enterprise Decision Intelligence — not a project management tool, not a BI dashboard, not a decision tree app.

### What DecisionOS Is Sold As
1. **The structured decision operating system** — the governed path from intake to post-decision monitoring
2. **The A-1 pipeline** — the universal decision framework adapted to any decision type
3. **Evidence-backed, not opinion-based decisions** — every recommendation tied to evidence and scored scenarios
4. **Organizational learning from decisions** — patterns accumulate, decisions compound

### What DecisionOS Is NOT Sold As
1. Not a project management tool — DecisionOS structures the decision, not the execution
2. Not a BI dashboard — decisions are workflow-native, not dashboard-first
3. Not an AI oracle — AI assists with scoring and insight; humans decide
4. Not a voting/polling tool — governance is structural approval, not consensus gathering
5. Not a document management system — evidence is attached, not stored as primary function
6. Not a mind-mapping tool — the A-1 pipeline is a governance-grade workflow, not a brainstorming canvas

### Core Pitch
1. Your organization makes decisions every day — tenders, investments, expansions, partnerships
2. Most of these decisions are made through meetings, emails, and spreadsheets
3. When someone asks "why did we decide this?" — you reconstruct from memory
4. DecisionOS gives you a structured, evidence-backed, governed path for every decision
5. The result: faster decisions, better outcomes, full defensibility, and compounding organizational intelligence

### Value Themes
1. Structure over intuition
2. Evidence over opinion
3. Governance over ad-hoc approval
4. Learning over repeating mistakes

### Recommended Packaging Language

**Short:**
DecisionOS is AQLIYA's decision intelligence operating system — the structured, governed path from "we need to decide" to "we decided, and here's the evidence."

**Medium:**
DecisionOS gives enterprises a governed A-1 pipeline for every decision: Intake → Framework → Scenarios → Risk Analysis → Recommendation → Simulation → Intelligence → Governance → Post-Decision Monitoring. It doesn't make decisions; it makes them defensible.

**Longer:**
DecisionOS is the category-defining product of AQLIYA's Enterprise Decision Intelligence platform. It transforms how enterprises make, document, and learn from decisions. From tender evaluation to capital allocation to strategic expansion — every decision follows the same governed pipeline: structured framing, multi-scenario simulation, risk-gated recommendation, evidence-backed approval, and post-decision monitoring. AuditOS proved this model in one domain. DecisionOS scales it to every domain where decisions carry weight, risk, and consequence.

### Packaging Priorities (external presentation order)
1. AQLIYA company/platform
2. The decision problem: unstructured, untraceable, unlearnable
3. DecisionOS: the A-1 decision intelligence pipeline
4. The trust principle: AI assists, humans decide, evidence governs
5. AuditOS as proof: the same model works in the most regulated domain
6. DecisionOS as the expansion: from audit decisions to all enterprise decisions
7. Decision types and future roadmap

---

## 16. Competitive Differentiation

| Dimension | DecisionOS | Generic PM Tools | BI Dashboards | Spreadsheets |
|---|---|---|---|---|
| Structured decision framework | A-1 pipeline, gated progression | Task lists, no decision structure | Metrics, no decision workflow | Free-form, no structure |
| Scenario simulation | Multi-dimensional scoring per type | None | None | Manual, no versioning |
| Evidence traceability | Evidence attached per stage | Attachments, no governance | None | None |
| Governed approval | Configurable chains, evidence-gated | Simple approval, no gating | None | None |
| Post-decision monitoring | Signals, alerts, drift detection | None | Metrics only | None |
| Organizational learning | Pattern extraction by sector/type | None | None | None |

---

## 17. Anti-Patterns

1. **Project Management Trap.** Building DecisionOS as a task/project management tool. The A-1 pipeline is a decision framework, not a Gantt chart.
2. **BI Dashboard Trap.** Making dashboard views the primary experience. Workflow is primary; dashboards are secondary views.
3. **AI Oracle Trap.** Positioning AI as the decision-maker. The system structures and scores; the human decides.
4. **Tender-Only Narrowing.** Keeping DecisionOS as a tender evaluation tool only. The category is Enterprise Decision Intelligence — tenders are one type.
5. **Decision = Vote Trap.** Reducing governance to voting/polling. Governance is structural approval with evidence gating.

---

## 18. Related References

1. `docs/systems/decisionos/README.md` — Current state
2. `docs/systems/decisionos/decisionos-core-engine.md` — Architecture
3. `docs/systems/decisionos/decisionos-architecture-report.md` — Full component audit
4. `docs/systems/decisionos/decisionos-scenario-architecture.md` — Scenario model
5. `docs/theoretical-reference/system-intelligence/decision-intelligence-system-map.md`
6. `docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`
7. `docs/theoretical-reference/01-foundational-doctrine/01-06-decision-intelligence-systems-thesis.md`
8. `docs/products/auditos-product-packaging.md` — AuditOS pack (wedge product)
9. `docs/source-of-truth/AQLIYA-company-product-architecture-official.md`
