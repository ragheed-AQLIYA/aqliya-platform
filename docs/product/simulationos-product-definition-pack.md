# SimulationOS — Product Definition Pack

> **v1.1 Alignment Notice:** Per AQLIYA v1.1 official taxonomy, SimulationOS is a **Concept / future** product (marketing-only at present). It is not implemented as a standalone product. The simulation engine exists as a shared component within the codebase. See `docs/official/aqliya-product-taxonomy-v1.1.md` and `docs/official/aqliya-core-architecture-v1.1.md` for current status.

Source of truth companion: `docs/product/auditos-product-packaging.md`
Product focus doctrine: `docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`
Current state: `docs/systems/simulationos/README.md`

---

## 1. Product Identity

**Product name:** SimulationOS

**Category:** Enterprise Scenario Engine

**Role in architecture:** A shared engine — not a standalone application, but a multi-dimensional scenario simulation engine consumed by DecisionOS and SalesOS. Positioned as a product for conceptual clarity and future standalone potential.

**Official one-liner:**
SimulationOS is AQLIYA's multi-dimensional scenario engine — it doesn't predict the future, it structures uncertainty so decision-makers see trade-offs before they commit.

**تعريف بالعربية:**
SimulationOS هو محرك السيناريوهات متعدد الأبعاد تحت AQLIYA — لا يتنبأ بالمستقبل، بل يهيكل عدم اليقين ليتمكن صانع القرار من رؤية المفاضلات قبل الالتزام.

---

## 2. Positioning Statement

SimulationOS is AQLIYA's scenario simulation engine. It powers the scoring, comparison, and sensitivity analysis behind every A-1 pipeline decision in DecisionOS and every deal evaluation in SalesOS.

It is not a standalone product today. It is a shared engine. But it is positioned as a concept product because scenario simulation is a distinct capability that warrants its own definition, roadmap, and commercial narrative — especially as it evolves toward industry-specific simulation models.

---

## 3. Trust Principle

**Every score is traceable to its inputs. Every assumption is documented. Every simulation result is auditable.**

---

## 4. Ideal Customer Profile (ICP)

### Primary (as a capability within DecisionOS/SalesOS)

1. **Financial analysts and investment teams** — running multi-scenario simulations for capital allocation decisions
2. **Tender evaluation committees** — scoring bids across financial, capacity, and risk dimensions
3. **Strategic planning teams** — simulating market entry, expansion, and strategic alternatives
4. **Commercial pricing teams** — modeling pricing scenarios with margin, volume, and competitive dimensions

### Secondary (future standalone potential)

1. **Risk management teams** — running sensitivity analyses on key risk variables
2. **Supply chain and operations teams** — simulating operational scenarios with capacity constraints
3. **Corporate development teams** — M&A and partnership scenario modeling
4. **Insurance and actuarial teams** — multi-dimensional risk and pricing simulation

### Buyer and User Mapping

| Segment | Likely Buyer | Primary Users | Main Need |
|---|---|---|---|
| Financial analysis | CFO / Head of FP&A | Financial analysts | Capital allocation scenario simulation |
| Tender evaluation | Head of Procurement | Tender evaluation teams | Multi-dimensional bid scoring |
| Strategic planning | Chief Strategy Officer | Strategy analysts | Market entry/expansion simulation |
| Commercial pricing | Commercial Director | Pricing analysts | Deal pricing scenario modeling |

---

## 5. Core Problem

Enterprise scenario modeling — when it happens at all — is broken:

1. **Spreadsheets with no versioning** — every analyst has their own model; no single source of truth
2. **Single-dimension analysis** — financial projections without operational, risk, or strategic dimensions
3. **No assumption traceability** — "where did this 15% growth assumption come from?" is unanswerable
4. **No standardized scoring** — different analysts score differently; no comparability across decisions
5. **No sensitivity analysis** — which variable most impacts the outcome? Unknown until it's too late
6. **No governance over simulation inputs** — anyone can change any number with no audit trail

The result: decisions are made on models that can't be defended, compared, or learned from.

---

## 6. What SimulationOS Solves

SimulationOS enables:

1. **Multi-dimensional scoring** — financial, operational, capacity, risk, strategic fit scored simultaneously per scenario
2. **Configurable scoring dimensions** — define which dimensions matter per decision type
3. **Standardized scoring framework** — same dimensions, same scales, comparable across decisions
4. **Input traceability** — every assumption documented, every input attributed
5. **Sensitivity analysis** — identify which variables most impact outcomes
6. **Simulation audit trail** — who ran what simulation, with what inputs, producing what results
7. **Type-specific scoring adapters** — tender scoring, investment scoring, expansion scoring — domain-specific logic on a shared engine

---

## 7. Core Engine Architecture

```text
Simulation Configuration
    ├── Scoring Dimensions (configurable per decision type)
    │   ├── Financial Score
    │   ├── Operational Score
    │   ├── Capacity Score
    │   ├── Risk Score
    │   └── Strategic Fit Score
    │
    ├── Scenario Inputs (per scenario)
    │   ├── BEST_CASE
    │   ├── EXPECTED_CASE
    │   └── WORST_CASE
    │
    ├── Scoring Engine
    │   ├── Per-dimension scoring logic
    │   ├── Weighted aggregation
    │   └── Confidence scoring
    │
    └── Output Layer
        ├── Per-scenario scores
        ├── Comparative analysis
        ├── Sensitivity analysis
        └── Simulation audit trail
```

---

## 8. Inputs

| Input | Description | Source |
|---|---|---|
| Decision type configuration | Which dimensions to score, weights per dimension, thresholds | DecisionOS type config |
| Scenario data | Per-scenario inputs: financial projections, capacity estimates, risk assessments | DecisionOS A-1.2 Scenarios |
| Tender financial data (TENDER type) | Contract value, estimated cost, margin estimate, required capacity | TenderProfile model |
| Investment profile data (INVESTMENT type) | Capital required, expected ROI, payback period, NPV inputs | InvestmentProfile (Phase 2) |
| Historical benchmarks | Sector-specific scoring benchmarks for comparison | SectorBenchmark model |
| Scoring weights | Dimension weights per decision type (configurable) | DecisionOS type config |

---

## 9. Outputs

| Output | Description |
|---|---|
| Per-scenario scores | Numerical scores per dimension per scenario (financial, operational, capacity, risk, strategic fit) |
| Overall decision score | Weighted aggregate score per scenario |
| Comparative analysis | Side-by-side scenario score comparison with deltas |
| Confidence scores | Confidence interval per score based on input completeness and data quality |
| Sensitivity analysis | Variable impact analysis — which inputs most affect outcomes |
| Score drivers | Top factors driving each score (e.g., "Margin estimate accounts for 45% of financial score") |
| Simulation audit trail | Full record: who ran simulation, when, with what inputs, producing what results |
| Recommendation input | Scores fed to recommendation engine for GO/NO_GO/CONDITIONAL logic |

---

## 10. Business Value

| Value Dimension | Description | Evidence |
|---|---|---|
| **Decision confidence** | Multi-dimensional scoring reveals trade-offs invisible in single-dimension analysis | Score comparison across dimensions |
| **Input discipline** | Every simulation input must be documented and attributed | Input traceability per assumption |
| **Comparability** | Standardized scoring enables comparison across decisions and over time | Cross-decision score benchmarks |
| **Risk visibility** | Sensitivity analysis reveals which assumptions drive outcomes | Variable impact ranking |
| **Governance** | Simulation audit trail proves the model, inputs, and results | Full simulation event log |
| **Domain adaptation** | Same engine, domain-specific scoring logic — financial for tenders, strategic for expansions | Type-specific score adapters |

---

## 11. Relationship with AuditOS

| Aspect | Relationship |
|---|---|
| **Indirect relationship** | SimulationOS is not directly consumed by AuditOS. AuditOS is about evidence, compliance, and governed workflows — not scenario simulation. |
| **Shared infrastructure** | SimulationOS uses the same evidence model and governance layer as AuditOS, but for different purposes. |
| **Platform architecture** | SimulationOS is a shared engine within the AQLIYA platform. AuditOS is a vertical application. They coexist in the architecture without direct dependency. |
| **Different domains** | AuditOS operates in the audit/financial reporting domain. SimulationOS operates in the decision modeling domain. Different value propositions; same platform. |
| **Tender bridge** | The TENDER decision type in DecisionOS is the bridge — it combines financial intelligence concepts (margin, capacity) with simulation. |

---

## 12. MVP Scope

### What Already Exists (DecisionOS Tender Simulation)

| Component | Status | Notes |
|---|---|---|
| Tender-specific simulation engine | ✅ Complete | Tender financial + capacity scoring |
| Simulation result persistence | ✅ Complete | Per-scenario results stored in SimulationResult model |
| 3-scenario framework (BEST/EXPECTED/WORST) | ✅ Complete | Auto-created if missing |
| Simulation UI page | ✅ Complete | Works for tender decisions |
| Recommendation generator (tender) | ✅ Complete | GO/GO_WITH_CONDITIONS/NO_GO from scores |
| Simulation action (`runSimulationAndRecommendation`) | ✅ Complete | Server action |

### Phase 1 — Generic Simulation Engine

1. **Generic simulation core** — scoring engine that accepts configurable dimensions, weights, and thresholds per decision type (not hardcoded to tender)
2. **Type-specific scoring adapters**:
   - TENDER: financial, capacity, risk (✅ exists)
   - INVESTMENT: NPV, IRR, payback, strategic alignment, risk (new)
   - EXPANSION: market size, execution complexity, regulatory risk, timing (new)
   - PROCUREMENT: cost savings, supplier risk, implementation complexity (new)
   - GENERIC: configurable dimension set for CUSTOM/STRATEGIC/OPERATIONS types (new)
3. **Sensitivity analysis** — variable impact ranking: which inputs most affect the overall score
4. **Confidence scoring** — confidence interval per score based on input completeness and data quality
5. **Simulation audit trail** — full event log: configuration, inputs, engine version, results, timestamp

### Phase 2 — Simulation Intelligence

1. **Cross-decision comparison** — benchmark a decision's scores against historical decisions of the same type and sector
2. **Auto-scenario suggestion** — AI-assisted scenario generation based on sector patterns (human-reviewed, not autonomous)
3. **Monte Carlo simulation** — probabilistic modeling for high-stakes investment and strategic decisions
4. **Collaborative simulation** — multiple analysts contributing to scenario inputs with role-based permissions

### MVP Deliverable

SimulationOS MVP enables:
- Configurable multi-dimensional scoring for any decision type
- 3-scenario simulation (BEST/EXPECTED/WORST) with per-dimension scores
- Comparative analysis across scenarios
- Sensitivity analysis showing key variable impacts
- Full simulation audit trail
- Integration with DecisionOS recommendation engine

---

## 13. What NOT to Build Yet

| Excluded | Rationale | When |
|---|---|---|
| Monte Carlo simulation | Adds significant complexity. Deterministic 3-scenario modeling is sufficient for 80%+ of enterprise decisions. | Phase 3 |
| Real-time market data integration | Requires external data partnerships and infrastructure. Premature before core engine is validated. | Phase 4 |
| AI-driven auto-scenario generation | AI can suggest scenarios, but autonomous generation contradicts human-in-the-loop. Human-authored scenarios first. | Phase 3 |
| External data source ingestion | Focus on enterprise-provided inputs. External data integration is a Phase 3+ feature. | Phase 3 |
| Collaborative real-time simulation | Async input collection is sufficient for MVP. Real-time adds complexity without proportional value. | Phase 2 |
| Industry-specific pre-built models | Each industry needs a validated model. Start with generic configurable engine; build industry models from customer evidence. | Phase 3 |
| Simulation marketplace | Sharing simulation models across organizations requires data governance framework. | Phase 4+ |
| Optimization engine (solver) | Simulation scores and compares scenarios; it does not optimize. Optimization is a different mathematical capability. | Phase 4+ |
| Standalone UI (separate from DecisionOS) | Simulation is embedded in decision workflow. Standalone UI premature before engine is validated. | Phase 3 |

---

## 14. Demo Scenario

**Opening:**
"هذا محاكي السيناريوهات تحت AQLIYA — SimulationOS. ليس أداة تنبؤ. هو محرك يهيكل عدم اليقين لتتمكن من رؤية المفاضلات قبل أن تلتزم."

**Flow:**

1. **Decision context** — show a TENDER decision already framed with 3 scenarios
2. **Simulation configuration** — show configurable dimensions: Financial (40% weight), Capacity (25%), Risk (20%), Strategic Fit (15%)
3. **Input per scenario** — show input data for BEST_CASE, EXPECTED_CASE, WORST_CASE
4. **Run simulation** — engine scores each dimension per scenario:
   - BEST_CASE: Financial 82, Capacity 70, Risk 45, Strategic 90 → Overall 73
   - EXPECTED_CASE: Financial 65, Capacity 60, Risk 55, Strategic 75 → Overall 63
   - WORST_CASE: Financial 40, Capacity 50, Risk 80, Strategic 55 → Overall 53
5. **Comparative view** — side-by-side scores with deltas. EXPECTED_CASE identified as balanced choice.
6. **Sensitivity analysis** — "Margin estimate accounts for 52% of financial score variance. ±10% margin change moves overall score by ±8 points."
7. **Confidence scoring** — confidence interval per score based on input completeness: Financial 88% confidence (well-documented), Capacity 62% (estimates only)
8. **Simulation audit trail** — show full event log: who ran it, when, with what configuration, engine version
9. **Recommendation feed** — scores feed into recommendation engine: GO_WITH_CONDITIONS on EXPECTED_CASE scenario
10. **Cross-decision context** — show how this decision's scores compare to sector benchmarks for similar tender decisions

**Close:**
"SimulationOS لا يخبرك ماذا سيحدث. يريك ماذا يمكن أن يحدث — عبر الأبعاد المالية والتشغيلية والمخاطر والاستراتيجية — لتتخذ قرارًا مبنيًا على تحليل، لا على حدس."

---

## 15. Commercial Positioning

### Category
Enterprise Scenario Engine — not a forecasting tool, not a BI analytics engine, not a financial modeling spreadsheet.

### What SimulationOS Is Sold As
1. **The simulation engine behind every AQLIYA decision** — powers DecisionOS and SalesOS scenario comparisons
2. **Multi-dimensional scoring** — financial, operational, risk, strategic fit in one simulation
3. **Configurable per domain** — tender scoring, investment scoring, expansion scoring — same engine, domain-specific logic
4. **Traceable and auditable** — every simulation run is logged with inputs, configuration, and results
5. **Built on the AQLIYA platform** — shared evidence model, shared governance, shared learning across domains

### What SimulationOS Is NOT Sold As
1. Not a forecasting tool — simulates scenarios, doesn't predict the future
2. Not a financial modeling spreadsheet — governed, versioned, auditable, not free-form
3. Not a BI analytics dashboard — scenario engine, not business intelligence
4. Not an AI prediction engine — scores based on configured logic, not black-box AI
5. Not an optimization/solver tool — scores and compares scenarios; doesn't find optimal solutions
6. Not a standalone product (today) — embedded engine within DecisionOS and SalesOS

### Core Pitch
1. Your team already models scenarios — in spreadsheets, with no versioning and no governance
2. SimulationOS gives you a governed, multi-dimensional, auditable simulation engine
3. Same engine serves tender evaluation, investment decisions, expansion planning, and pricing scenarios
4. The result: decisions compared across all relevant dimensions, with sensitivity analysis and a full audit trail

### Value Themes
1. Multi-dimensional visibility (not single-dimension financials)
2. Governed simulation (not free-form spreadsheet)
3. Traceable assumptions (not lost context)
4. Domain-adaptable (not one-size-fits-all)

### Recommended Packaging Language

**Short:**
SimulationOS is AQLIYA's multi-dimensional scenario engine — powering governed simulation across every AQLIYA decision.

**Medium:**
SimulationOS provides configurable, multi-dimensional scenario scoring for enterprise decisions. It scores financial, operational, capacity, risk, and strategic dimensions per scenario — producing comparable, auditable simulation results that feed directly into governed recommendations.

**Longer:**
SimulationOS is AQLIYA's enterprise scenario engine — the simulation layer behind DecisionOS and SalesOS. It transforms how enterprises model uncertainty by providing a governed, multi-dimensional, auditable simulation framework. Instead of single-dimension spreadsheet models, SimulationOS scores every scenario across financial, operational, risk, and strategic fit dimensions — with configurable weights per decision type, full input traceability, sensitivity analysis, and a complete simulation audit trail. Built on the AQLIYA platform, it shares the same evidence model, governance layer, and learning infrastructure that powers AuditOS and DecisionOS.

### Packaging Priorities (external presentation order)
1. AQLIYA platform context
2. The scenario modeling problem: spreadsheets with no governance
3. SimulationOS: multi-dimensional, governed, auditable
4. How it works: configurable dimensions → per-scenario scoring → comparative analysis
5. Domain adaptation: tender, investment, expansion
6. Integration with DecisionOS A-1 pipeline
7. Sensitivity analysis and confidence scoring
8. Future: Monte Carlo, industry models, cross-decision benchmarking

---

## 16. Architecture Note: Engine vs. Product

SimulationOS is currently a **shared engine**, not a standalone product. This means:

| Aspect | Current State | Future Potential |
|---|---|---|
| **Code location** | `src/lib/simulation/` — embedded in DecisionOS codebase | Could be extracted as a shared package or microservice |
| **UI surface** | Simulation page within DecisionOS at `/decisions/[id]/simulation` | Could have its own workspace for standalone simulation |
| **Consumer** | DecisionOS (TENDER type) | All DecisionOS types + SalesOS deals |
| **Pricing** | Included in DecisionOS/SalesOS | Could be a standalone simulation product or premium add-on |
| **Buyer** | DecisionOS/SalesOS buyer | Could have dedicated simulation buyers (risk teams, FP&A) |

### Recommendation: Engine-First, Product-Later

Build SimulationOS as a robust shared engine first. Validate through DecisionOS and SalesOS consumption. Consider standalone productization only when:
1. The engine supports 5+ decision types with type-specific adapters
2. At least one customer requests standalone simulation without full DecisionOS
3. Monte Carlo or advanced simulation capabilities create a distinct buyer

---

## 17. Anti-Patterns

1. **Spreadsheet Replacement Trap.** Building a "better Excel." SimulationOS is governed, versioned, multi-dimensional — fundamentally different from free-form spreadsheets.
2. **Prediction Engine Trap.** Positioning as "AI predicts outcomes." SimulationOS scores scenarios based on configured logic; it does not predict the future.
3. **Standalone Premature Trap.** Building a standalone SimulationOS product before the shared engine is validated through DecisionOS and SalesOS consumption.
4. **Black Box Trap.** Building AI-driven scoring with no explainability. Every score must be traceable to its inputs and logic.
5. **Optimization Trap.** Adding optimization/solver capabilities. SimulationOS compares and scores; it doesn't optimize. Different mathematical model, different market.

---

## 18. Related References

1. `docs/systems/simulationos/README.md` — Current state (marketing-only)
2. `docs/systems/decisionos/decisionos-core-engine.md` — Simulation in DecisionOS context
3. `docs/systems/decisionos/decisionos-scenario-architecture.md` — Scenario model architecture
4. `docs/systems/decisionos/decisionos-architecture-report.md` — Simulation engine positioning
5. `docs/theoretical-reference/13-product-philosophy/13-12-product-focus-doctrine.md`
6. `docs/product/decisionos-product-definition-pack.md`
7. `docs/product/salesos-product-definition-pack.md`
8. `docs/source-of-truth/AQLIYA-company-product-architecture-official.md`
