# SalesOS — Product Definition Pack

> **v1.1 Alignment Notice:** Per AQLIYA v1.1 official taxonomy, SalesOS is a **Future** product (Phase 9 on the roadmap, 12–18 month horizon). It currently has only a shell workspace (`/sales`) with no backend server actions. This document contains future product vision and should be read alongside `docs/official/aqliya-product-taxonomy-v1.1.md` and `docs/official/aqliya-roadmap-v1.1.md`.

Source of truth companion: `docs/products/auditos-product-packaging.md`
Product focus doctrine: `docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`
Current state: `docs/systems/salesos/README.md`

---

## 1. Product Identity

**Product name:** SalesOS / Commercial Intelligence

**Category:** Enterprise Commercial Intelligence

**Role in architecture:** A vertical application built on DecisionOS + GovernanceOS + SimulationOS — applying enterprise decision intelligence to the commercial domain: pipeline, deals, pricing, approvals, and revenue operations.

**Official one-liner:**
SalesOS gives commercial teams the same structured decision intelligence that AuditOS gives audit teams — a governed, evidence-backed path from pipeline to revenue.

**تعريف بالعربية:**
SalesOS يمنح الفرق التجارية نفس ذكاء القرارات المنظم الذي يمنحه AuditOS لفرق المراجعة — مسار محكوم ومدعوم بالأدلة من خط الأنابيب إلى الإيراد.

---

## 2. Positioning Statement

SalesOS is AQLIYA's commercial intelligence operating system — the structured, governed operating system for enterprise sales. It applies the A-1 decision pipeline to commercial decisions: deal qualification → scenario simulation → pricing recommendation → governed approval → post-deal monitoring → revenue intelligence.

It does not replace your CRM. It makes your commercial decisions defensible and your revenue predictable.

---

## 3. Trust Principle

**Deals are governed. Pricing is evidence-backed. Approvals are traceable. Revenue is predictable.**

---

## 4. Ideal Customer Profile (ICP)

### Primary

1. **B2B sales teams (mid-market and enterprise)** — managing complex deals with multi-stakeholder approval chains
2. **Tender and bid teams** — responding to structured RFPs requiring scored evaluation (natural overlap with DecisionOS TENDER)
3. **Commercial directors / heads of sales** — needing governed deal approval and revenue predictability
4. **Revenue operations (RevOps) teams** — managing pipeline hygiene, deal governance, and conversion analytics

### Secondary

1. **Distributors and channel partners** — managing partner deals with structured pricing and approval governance
2. **Enterprise account management teams** — managing renewal and expansion deals with governance
3. **SME sales teams scaling up** — transitioning from founder-led sales to structured commercial operations
4. **Procurement-adjacent commercial teams** — managing both buy-side (DecisionOS) and sell-side (SalesOS) decisions

### Buyer and User Mapping

| Segment | Likely Buyer | Primary Users | Main Need |
|---|---|---|---|
| B2B enterprise sales | VP Sales / CRO | Account executives, sales managers | Governed deal qualification and approval |
| Tender/bid teams | Head of Bids / Commercial Director | Bid managers, pricing analysts | Scored tender evaluation and pricing governance |
| Revenue operations | Head of RevOps | RevOps analysts, sales ops | Pipeline governance, deal analytics, revenue forecasting |
| SME sales teams | Founder / GM / Sales Lead | Sales representatives | Structured path from lead to closed deal |

---

## 5. Core Problem

B2B sales — especially complex enterprise deals — suffers from the same structural gaps as audit before AuditOS:

1. **Deals evaluated intuitively, not structurally** — qualification is a conversation, not a framework
2. **Pricing is negotiated, not evidence-backed** — discounts given ad hoc without scenario modeling
3. **Approvals happen in email** — no conditions, no evidence gating, no traceability
4. **Pipeline is a forecast, not a governed system** — deals move through stages without structural gates
5. **Won/lost analysis is episodic** — patterns not extracted systematically
6. **Revenue predictability is low** — because the path from pipeline to revenue is ungoverned

The gap between "we have a CRM" and "our commercial decisions are governed" is lost revenue, margin erosion, and unpredictable forecasting.

---

## 6. What SalesOS Solves

SalesOS helps commercial teams:

1. **Qualify deals structurally** — not just BANT/MEDDIC as a checklist, but a governed qualification framework
2. **Model deal scenarios** — simulate pricing, margin, and capacity scenarios before committing
3. **Route commercial approvals** — governed approval chains with evidence requirements (pricing rationale, risk assessment, margin analysis)
4. **Track deal outcomes** — post-close monitoring: revenue realization vs. modeled, margin vs. expected
5. **Extract commercial patterns** — won/lost analysis by sector, deal type, pricing model, competitor
6. **Forecast with evidence** — pipeline forecasting based on governed deal progression, not sales rep confidence

---

## 7. Core Workflow

```text
Pipeline Management
    → Deal Qualification (structured gate)
    → Deal Framework (leveraging DecisionOS A-1 pipeline)
    → Deal Scenarios (leveraging SimulationOS)
    → Pricing Recommendation
    → Commercial Approval (leveraging GovernanceOS)
    → Contract Closure
    → Post-Deal Monitoring (revenue realization, margin tracking)
    → Pattern Extraction (won/lost analysis, sector patterns)
    → Revenue Intelligence (forecasting, pipeline health)
```

---

## 8. Inputs

| Input | Description | Source |
|---|---|---|
| Pipeline data | Deals, stages, values, probabilities | CRM integration or native pipeline |
| Deal qualification data | Need, budget, authority, timeline, fit scores | Qualification framework |
| Pricing model | Cost, list price, discount bands, margin targets | Commercial policy |
| Competitive intelligence | Competitor, positioning, win/loss factors | Sales team input |
| Commercial policies | Approval thresholds, discount limits, special terms | Commercial governance |
| Historical deal data | Past won/lost deals with attributes | CRM or SalesOS pattern engine |

---

## 9. Outputs

| Output | Description |
|---|---|
| Structured deal records | Governed deal with qualification, framework, scenarios, approval |
| Deal qualification score | Multi-dimensional fit scoring with evidence |
| Deal scenario simulations | BEST_CASE, EXPECTED_CASE, WORST_CASE with revenue, margin, and risk scoring |
| Pricing recommendation | Evidence-backed pricing with discount justification |
| Commercial approval trail | Governed approval chain with evidence and conditions |
| Won/lost pattern analysis | Systematic extraction of factors correlated with deal outcomes |
| Revenue forecast | Evidence-gated pipeline forecast with confidence intervals |
| Pipeline health dashboard | Qualification rates, stage conversion, deal velocity, margin health |
| Commercial governance report | Audit-ready commercial decision trail |

---

## 10. Business Value

| Value Dimension | Description | Evidence |
|---|---|---|
| **Deal quality** | Structured qualification filters bad deals earlier | Qualification scores, stage conversion rates |
| **Pricing discipline** | Evidence-backed pricing reduces margin erosion | Discount variance, margin per deal vs. target |
| **Forecast accuracy** | Governed pipeline produces more predictable revenue | Forecast vs. actual, confidence interval accuracy |
| **Approval velocity** | Governed approval chains reduce deal cycle time | Time-in-stage metrics, approval cycle time |
| **Commercial governance** | Every deal decision is traceable and defensible | Full approval chain with pricing rationale |
| **Organizational learning** | Won/lost patterns inform future qualification and pricing | Pattern scores, sector benchmarks |
| **Revenue intelligence** | Pipeline to revenue path is measured, governed, and optimizable | Conversion rates, revenue realization rates |

---

## 11. Relationship with AuditOS

| Aspect | Relationship |
|---|---|
| **Domain adjacency** | AuditOS serves audit and finance teams. SalesOS serves commercial teams. Both use the same AQLIYA infrastructure (DecisionOS pipeline, GovernanceOS, SimulationOS). |
| **Evidence model** | SalesOS uses the same evidence model — deal documents, pricing analysis, competitive intelligence — structured as evidence linked to decisions. |
| **Governance model** | Same governance layer (GovernanceOS): commercial approvals follow the same structural governance as audit approvals. |
| **Buyer adjacency** | Audit firm partners are buyers of both: AuditOS for their audit practice, SalesOS for their own firm's client acquisition and pricing governance. |
| **No direct dependency** | SalesOS does not require AuditOS to function. It is a parallel vertical, not a downstream consumer. |
| **Platform proof** | SalesOS proves that AQLIYA's decision intelligence infrastructure works across domains — audit AND commercial. This is the category thesis at work. |

---

## 12. MVP Scope

### Phase 1 — Commercial Decision Foundation

1. **Pipeline management (light)** — basic deal tracking with stages, values, probabilities. Not a full CRM — designed to integrate with existing CRMs.
2. **Deal qualification framework** — structured qualification with configurable criteria, scoring, and gate conditions
3. **Deal decision framework** — leveraging DecisionOS A-1 pipeline adapted for commercial decisions:
   - Intake: deal registration with type, value, timeline
   - Framework: objectives, constraints, stakeholders, alternatives
   - Scenarios: pricing scenarios (aggressive, standard, conservative)
   - Risk analysis: competitive risk, delivery risk, margin risk
   - Recommendation: GO / GO_WITH_CONDITIONS / NO_GO on deal pursuit
4. **Pricing recommendation** — evidence-backed pricing with configurable rules, margin analysis, and discount justification
5. **Commercial approval workflow** — leveraging GovernanceOS: configurable approval chains with evidence gating (discount threshold → manager → director → VP)
6. **Basic won/lost capture** — structured capture of deal outcome with attribution factors

### Phase 2 — Revenue Intelligence

1. **Pipeline health dashboard** — qualification rates, stage conversion, deal velocity, margin health
2. **Post-deal monitoring** — revenue realization vs. modeled, margin vs. expected, signals and alerts
3. **Pattern extraction** — won/lost patterns by sector, deal size, competitor, pricing model
4. **Revenue forecasting** — evidence-gated pipeline forecast with confidence intervals
5. **Scenario simulation for deals** — full SimulationOS integration for multi-dimensional deal scoring

### MVP Deliverable

SalesOS MVP enables a commercial team to:
- Qualify deals through a structured, gated framework
- Model pricing scenarios before committing
- Route deals through governed commercial approvals
- Track deal outcomes and extract won/lost patterns
- Reduce margin erosion through disciplined pricing governance

---

## 13. What NOT to Build Yet

| Excluded | Rationale | When |
|---|---|---|
| Full CRM replacement | SalesOS is decision intelligence for commercial, not a CRM. Must integrate with existing CRMs (Salesforce, HubSpot). | Never — integrate |
| Email sequencing / outbound automation | Sales engagement tools are a different category. SalesOS governs decisions, not sends emails. | Never — integrate |
| Marketing automation / lead scoring | Marketing is a different domain. SalesOS starts at qualified pipeline. | Phase 4+ |
| Commission / compensation management | Compensation is HR/finance domain. SalesOS governs deals, not paychecks. | Phase 4+ |
| Contract lifecycle management (CLM) | Contract management is a separate category. Integrate with CLM tools. | Never — integrate |
| E-signature / document generation | Operational tools, not decision intelligence. Integrate. | Phase 3 |
| AI-driven deal scoring auto-close | Contradicts human-in-the-loop. AI scores; humans decide to close. | Never |
| Mobile-first sales app | Desktop-first for structured commercial decision-making | Phase 4 |
| Multi-currency / multi-entity revenue consolidation | Enterprise complexity — Phase 1 focuses on single-entity commercial governance | Phase 3 |

---

## 14. Demo Scenario

**Opening:**
"هذا SalesOS — منتج الذكاء التجاري تحت AQLIYA. يطبّق نفس الذكاء القراراتي الذي يمنحه AuditOS للمراجعة على فريقك التجاري."

**Flow:**

1. **Pipeline view** — show active deals with qualification status, stage, value, and governance health
2. **Deal qualification** — create a new deal: "Enterprise Software License — Bank AlJazira" — run structured qualification: budget ✅, authority ⚠️, need ✅, timeline ✅ → score: 78/100
3. **Deal framework** — build A-1 framework: objectives, constraints (margin floor 35%), alternatives (3 pricing tiers), stakeholders (CIO, Procurement, CFO)
4. **Pricing scenarios** — model 3 scenarios: AGGRESSIVE (28% margin, $480K), STANDARD (35% margin, $520K), CONSERVATIVE (42% margin, $580K)
5. **Risk analysis** — competitive risk (2 competitors), delivery risk (capacity 70%), margin risk (discount pressure)
6. **Recommendation** — GO_WITH_CONDITIONS: STANDARD pricing, conditions on competitor intel update and capacity confirmation
7. **Commercial approval** — route through approval chain: Sales Manager → Commercial Director → CFO (if discount > 10%). Show evidence gating at each stage.
8. **Post-deal monitoring** — after close: revenue realization tracker, margin vs. expected, renewal signal
9. **Pattern extraction** — show won/lost analysis: "Enterprise financial sector deals with STANDARD pricing close at 64% vs. 38% for AGGRESSIVE"
10. **Pipeline health** — dashboard: conversion rates, margin health, forecast accuracy

**Close:**
"SalesOS لا يستبدل CRM الخاص بك. يضيف طبقة ذكاء قراراتي فوقه: تأهيل منظم، سيناريوهات تسعير، اعتماد تجاري محكوم، وتعلم تنظيمي من كل صفقة."

---

## 15. Commercial Positioning

### Category
Enterprise Commercial Intelligence — not a CRM, not a sales engagement platform, not a forecasting tool.

### What SalesOS Is Sold As
1. **Commercial decision intelligence** — the governed path from deal qualification to revenue
2. **The A-1 pipeline for sales** — structured deal evaluation, not intuitive selling
3. **Pricing governance** — evidence-backed pricing with approval discipline
4. **Revenue intelligence** — pipeline-to-revenue with governed predictability
5. **Built on AQLIYA platform** — same DecisionOS + GovernanceOS + SimulationOS infrastructure as AuditOS

### What SalesOS Is NOT Sold As
1. Not a CRM — integrates with CRMs; doesn't replace them
2. Not a sales engagement tool — doesn't send emails, sequences, or automate outreach
3. Not a forecasting tool — governed pipeline, not spreadsheet projections
4. Not a commission calculator — governs deals, not compensation
5. Not a sales training / enablement platform — governs decisions, not skills

### Core Pitch
1. Your CRM tracks deals; SalesOS governs them
2. Commercial teams make pricing, approval, and pursuit decisions every day — without structure or evidence
3. SalesOS applies the same governed decision intelligence that AuditOS applies to financial reporting
4. The result: better deal qualification, disciplined pricing, governed approvals, predictable revenue, and compounding commercial intelligence

### Value Themes
1. Governed commercial decisions (not ad-hoc)
2. Evidence-backed pricing (not negotiated)
3. Structured qualification (not intuitive)
4. Predictable revenue (not hopeful forecasting)

### Recommended Packaging Language

**Short:**
SalesOS gives commercial teams governed decision intelligence — from deal qualification to revenue.

**Medium:**
SalesOS applies AQLIYA's decision intelligence infrastructure to commercial operations: structured deal qualification, pricing scenario simulation, governed commercial approvals, and post-deal revenue intelligence.

**Longer:**
SalesOS is AQLIYA's commercial intelligence operating system. It transforms how B2B sales teams qualify, price, approve, and learn from deals. Every deal follows the A-1 pipeline adapted for commercial decisions: structured qualification → pricing scenarios → risk-gated recommendation → governed commercial approval → post-deal monitoring → pattern extraction. Built on the same DecisionOS + GovernanceOS + SimulationOS infrastructure that powers AuditOS, SalesOS proves that AQLIYA's decision intelligence model works across domains.

### Packaging Priorities (external presentation order)
1. AQLIYA platform and the AuditOS proof
2. The commercial decision problem: ungoverned deals, eroded margins, unpredictable revenue
3. SalesOS: governed commercial intelligence
4. Integration with existing CRM infrastructure
5. Pricing governance and margin discipline
6. Revenue intelligence and forecasting
7. The AQLIYA platform advantage: cross-domain decision intelligence

---

## 16. Anti-Patterns

1. **CRM Replacement Trap.** Building SalesOS as a full CRM. The value is decision intelligence on top of CRM data. Integrate, don't replicate.
2. **Sales Automation Trap.** Building email sequences, auto-dialers, or outreach automation. SalesOS governs decisions, not communications.
3. **Deal Desk Only Trap.** Limiting SalesOS to approval routing. The value is the full A-1 pipeline for commercial decisions — qualification through post-deal learning.
4. **AI Auto-Close Trap.** Positioning AI as auto-qualifying or auto-closing deals. AI scores and recommends; humans decide to close.
5. **Dashboard-First Trap.** Making pipeline dashboards the primary experience. The deal workflow (qualification → pricing → approval) is the product.

---

## 17. Related References

1. `docs/systems/salesos/README.md` — Current state (prototype)
2. `docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`
3. `docs/products/auditos-product-packaging.md` — AuditOS pack
4. `docs/products/decisionos-product-definition-pack.md` — DecisionOS pack
5. `docs/products/governanceos-product-definition-pack.md` — GovernanceOS pack
6. `docs/products/simulationos-product-definition-pack.md` — SimulationOS pack
7. `docs/source-of-truth/AQLIYA-company-product-architecture-official.md`
