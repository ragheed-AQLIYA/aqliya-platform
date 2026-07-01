# DecisionOS — Architecture Report

**Date:** 2026-05-11
**Scope:** DecisionOS repositioning from tender-specific to generic Decision Intelligence platform

---

## 1. Current State

DecisionOS is a structured decision workflow system with a gated A-1 pipeline:
```
Intake → Framework → Scenarios → Risk Analysis → Recommendation → (Simulation, Intelligence, Governance)
```

It supports multi-tenant organizations with RBAC (ADMIN/OPERATOR/VIEWER), audit logging, sector classification, pattern extraction, and post-decision monitoring (signals/alerts).

**Build status:** TypeScript clean, Next.js build passes.

---

## 2. Decision Sub-Page Classification

| Route | File | Classification | Notes |
|-------|------|----------------|-------|
| `/decisions` | `decisions/page.tsx` | **REAL** | Lists decisions, fully functional |
| `/decisions/new` | `decisions/new/page.tsx` | **PARTIAL** | UI form exists but no server-side submit handler wired |
| `/decisions/[id]` | `decisions/[id]/page.tsx` | **REAL** | Overview with A-1.0 through A-1.4, fully functional |
| `/decisions/[id]/intake` | `decisions/[id]/intake/page.tsx` | **REAL** | Full CRUD form with gate evaluation |
| `/decisions/[id]/framework` | `decisions/[id]/framework/page.tsx` | **REAL** | Full CRUD form with gate evaluation |
| `/decisions/[id]/scenarios` | `decisions/[id]/scenarios/page.tsx` | **REAL** | Full CRUD form (now persists to DB after this pass) |
| `/decisions/[id]/risks` | `decisions/[id]/risks/page.tsx` | **REAL** | Full CRUD form (now persists to DB after this pass) |
| `/decisions/[id]/recommendation` | `decisions/[id]/recommendation/page.tsx` | **REAL** | Full CRUD with publish/unpublish, gate evaluation |
| `/decisions/[id]/simulation` | `decisions/[id]/simulation/page.tsx` | **REAL** | Runs 3-scenario simulation, but requires TenderProfile |
| `/decisions/[id]/tender` | `decisions/[id]/tender/page.tsx` | **REAL** | Tender-specific form, fully functional |
| `/decisions/[id]/report` | `decisions/[id]/report/page.tsx` | **REAL** | Prints full decision report, but references tender in summary text |
| `/decisions/[id]/overview` | `decisions/[id]/overview/page.tsx` | **REAL** | Executive overview computed from A-1 data |
| `/decisions/[id]/insight` | `decisions/[id]/insight/page.tsx` | **REAL** | Strategic insight computed from A-1 data |
| `/decisions/[id]/what-to-do` | `decisions/[id]/what-to-do/page.tsx` | **REAL** | Actionable next steps computed from A-1 data |
| `/decisions/[id]/governance` | `decisions/[id]/governance/page.tsx` | **REAL** | Roles, audit log, approvals display |
| `/decisions/[id]/sector` | `decisions/[id]/sector/page.tsx` | **REAL** | Sector assignment, benchmarks, pattern extraction |
| `/decisions/[id]/signals` | `decisions/[id]/signals/page.tsx` | **REAL** | Monitoring signals display and acknowledge |
| `/decisions/[id]/alerts` | `decisions/[id]/alerts/page.tsx` | **REAL** | Risk alerts display, acknowledge, resolve |
| `/organizations` | `organizations/page.tsx` | Exists | Not audited in this pass |
| `/organizations/[id]` | `organizations/[id]/page.tsx` | Exists | Not audited in this pass |
| `/intelligence/sectors` | `intelligence/sectors/page.tsx` | Exists | Not audited in this pass |
| `/intelligence/sectors/[id]` | `intelligence/sectors/[id]/page.tsx` | Exists | Not audited in this pass |
| `/settings` | `settings/page.tsx` | Exists | Not audited in this pass |

**Summary:** 16 of 16 decision sub-pages are REAL (functional). 0 STUB, 0 DEAD. 1 PARTIAL (new form lacks submit handler).

---

## 3. What Is Reusable (Generic)

These components work for ANY decision type, not just tenders:

### Core Pipeline (fully generic)
| Component | Location | Reusability |
|-----------|----------|-------------|
| Intake evaluation | `src/lib/decision/intake.ts` | 100% generic |
| Framework evaluation | `src/lib/decision/framework.ts` | 100% generic |
| Scenarios evaluation | `src/lib/decision/scenarios.ts` | 100% generic |
| Risk analysis evaluation | `src/lib/decision/risk-analysis.ts` | 100% generic |
| Recommendation evaluation | `src/lib/decision/recommendation.ts` | 100% generic |
| Intelligence gate | `src/lib/decision/intelligence-gate.ts` | 100% generic |
| Executive overview | `src/lib/decision/overview.ts` | 100% generic |
| Strategic insight | `src/lib/decision/insight.ts` | 100% generic |
| What-to-do-now | `src/lib/decision/what-to-do.ts` | 100% generic |
| Decision CRUD actions | `src/actions/decisions.ts` | 100% generic (now with expanded DecisionType) |
| All intake/framework/scenarios/risks/recommendation pages | `src/app/(dashboard)/decisions/[id]/*/page.tsx` | 100% generic |
| Governance page | `src/app/(dashboard)/decisions/[id]/governance/page.tsx` | 100% generic |
| DecisionTabs component | `src/components/decisions/decision-tabs.tsx` | 100% generic |
| RBAC auth layer | `src/lib/auth.ts` | 100% generic |
| Audit logging | `src/lib/platform-audit.ts` | 100% generic |

### Intelligence Layer (fully generic)
| Component | Location | Reusability |
|-----------|----------|-------------|
| Sector CRUD | `src/lib/decision/sector.ts` + `src/actions/decision-sector.ts` | 100% generic |
| Sector benchmarks | `src/lib/decision/sector-benchmark.ts` | 100% generic |
| Pattern extraction | `src/lib/decision/learning-engine.ts` + `src/actions/decision-learning.ts` | 100% generic |
| Decision patterns | `src/lib/decision/decision-pattern.ts` | 100% generic |
| Sector patterns | `src/lib/decision/sector-pattern.ts` | 100% generic |
| Signals & alerts | `src/lib/decision/signals-alerts.ts` + `src/actions/decision-signals-alerts.ts` | 100% generic |
| Sector/alerts/signals pages | `src/app/(dashboard)/decisions/[id]/sector|signals|alerts/page.tsx` | 100% generic |

### Prisma Models (fully generic)
| Model | Reusability |
|-------|-------------|
| Organization, User | 100% generic |
| Decision, DecisionFramework, DecisionScenario, DecisionRiskAnalysis | 100% generic |
| Objective, Constraint, Assumption, Alternative, Risk | 100% generic |
| Recommendation, Approval, AuditLog | 100% generic |
| Sector, SectorBenchmark, SectorPattern, SectorPlaybook, SectorRule | 100% generic |
| DecisionPattern, DecisionReport | 100% generic |
| DecisionMonitoringSignal, DecisionRiskAlert | 100% generic |
| Scenario, SimulationResult | 100% generic (structure is generic; scoring logic is tender-specific) |

---

## 4. What Is Tender-Specific

These components are hardcoded for tender use cases:

| Component | Location | Issue |
|-----------|----------|-------|
| `TenderProfile` model | `prisma/schema.prisma` | Tender-specific fields: clientName, estimatedContractValue, estimatedCost, marginEstimate, requiredCapacity |
| `TenderProfile` CRUD | `src/actions/tender.ts` | Only works for tender decisions |
| Tender page | `src/app/(dashboard)/decisions/[id]/tender/page.tsx` | Tender-specific form |
| Tender simulation | `src/lib/simulation/tender-simulation.ts` | Scoring uses tender-specific inputs (contract value, cost, margin, capacity) |
| Tender recommendation | `src/lib/recommendation/tender-recommendation.ts` | Recommendation logic uses tender-specific thresholds |
| Simulation action | `src/actions/simulation.ts` | Requires TenderProfile to run |
| Simulation page | `src/app/(dashboard)/decisions/[id]/simulation/page.tsx` | Works but depends on tender simulation |
| Report page summary text | `src/app/(dashboard)/decisions/[id]/report/page.tsx:113` | Says "this tender shows" |
| Decision detail page tender section | `src/app/(dashboard)/decisions/[id]/page.tsx:320-330` | Shows TenderProfile if present |
| `Tender` TypeScript interface | `src/lib/types/decision.ts:112-126` | Tender-specific type |
| `tenderSchema` validation | `src/lib/validation/decision.ts:66` | Tender-specific Zod schema |
| `decision-tabs.tsx` "Tender" tab | `src/components/decisions/decision-tabs.tsx` | Tab always visible even for non-tender decisions |

---

## 5. What Should Become Generic

### Priority 1: Simulation Engine
- **Current:** `tender-simulation.ts` — calculates scores from tender-specific inputs
- **Target:** Generic simulation engine that accepts configurable score dimensions
- **Approach:** Keep `tender-simulation.ts` as a tender-specific adapter. Create `src/lib/simulation/generic-simulation.ts` with configurable scoring dimensions. Non-tender decisions use generic simulation; tender decisions use tender adapter.

### Priority 2: Recommendation Engine
- **Current:** `tender-recommendation.ts` — GO/NO_GO based on tender thresholds
- **Target:** Generic recommendation engine with configurable rules per DecisionType
- **Approach:** Keep `tender-recommendation.ts` as tender adapter. Create `src/lib/recommendation/generic-recommendation.ts` with type-specific rule sets.

### Priority 3: Decision-Type-Specific Profiles
- **Current:** Only `TenderProfile` exists as a one-to-one relation on Decision
- **Target:** Support optional profiles per DecisionType (InvestmentProfile, ExpansionProfile, etc.)
- **Approach:** Two options:
  - A) Add nullable profile relations per type to Decision model (simplest)
  - B) Use a JSON `profileData` field on Decision with type-specific schemas (more flexible)

### Priority 4: Conditional Tab Visibility
- **Current:** "Tender" tab always visible in decision-tabs
- **Target:** Show Tender tab only when decision.type === "TENDER"
- **Approach:** Pass decision type to DecisionTabs and conditionally render type-specific tabs

---

## 6. Suggested Modular Architecture

```
src/
  lib/
    decision/                    # Generic decision pipeline (already modular)
      intake.ts                  # Generic
      framework.ts               # Generic
      scenarios.ts               # Generic
      risk-analysis.ts           # Generic
      recommendation.ts          # Generic (gate evaluation)
      intelligence-gate.ts       # Generic
      insight.ts                 # Generic
      overview.ts                # Generic
      what-to-do.ts              # Generic
      sector.ts                  # Generic
      sector-benchmark.ts        # Generic
      sector-pattern.ts          # Generic
      decision-pattern.ts        # Generic
      learning-engine.ts         # Generic
      signals-alerts.ts          # Generic

    simulation/
      index.ts                   # Router: dispatches by DecisionType
      generic-simulation.ts      # NEW: configurable scoring
      tender-simulation.ts       # EXISTING: tender-specific adapter

    recommendation/
      index.ts                   # Router: dispatches by DecisionType
      generic-recommendation.ts  # NEW: configurable rules
      tender-recommendation.ts   # EXISTING: tender-specific adapter

    types/
      decision.ts                # Expanded DecisionType (done)

    validation/
      decision.ts                # Generic + type-specific schemas

  actions/
    decisions.ts                 # Generic CRUD (done)
    simulation.ts                # Needs type dispatch
    tender.ts                    # Tender-specific (keep)
    decision-intelligence.ts     # Generic (keep)
    decision-sector.ts           # Generic (keep)
    decision-learning.ts         # Generic (keep)
    decision-signals-alerts.ts   # Generic (keep)

  app/(dashboard)/decisions/
    [id]/
      tender/                    # Tender-specific (keep, show conditionally)
      simulation/                # Works for all, but scoring is tender-only now
      ...                        # All other pages are generic
```

---

## 7. Changed Files (This Pass)

| File | Change |
|------|--------|
| `src/components/layout/sidebar.tsx` | "DecisionOS" → "Decision Intelligence"; "Decision OS Workspace" → "Decision Intelligence" |
| `src/components/layout/header.tsx` | "DecisionOS" → "Decision Intelligence" |
| `src/app/(dashboard)/decisions/page.tsx` | Title → "Decision Intelligence"; subtitle → generic description |
| `src/components/decisions/decision-tabs.tsx` | "Tender Workflow" → "Tender"; duplicate "Overview" → "Executive" |
| `prisma/schema.prisma` | DecisionType expanded: TENDER + 9 new types |
| `src/lib/types/decision.ts` | DecisionType expanded to match Prisma |
| `src/app/(dashboard)/decisions/new/page.tsx` | Added all 10 DecisionType options to dropdown |
| `src/actions/decisions.ts` | createDecision accepts all DecisionType values; updateDecisionScenarios now persists to DB; updateDecisionRiskAnalysis now persists to DB |

---

## 8. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Existing TENDER decisions unaffected | None | TENDER remains default; all existing data compatible |
| Simulation/recommendation still tender-only | Medium | Non-tender decisions can use core pipeline but simulation tab will fail without TenderProfile. Phase 2 must add generic simulation. |
| Tender tab visible for non-tender decisions | Low | Tab renamed to "Tender" but still always visible. Should be conditional on decision.type in Phase 2. |
| New DecisionType values have no profile models | Low | New types work with generic pipeline (intake→framework→scenarios→risks→recommendation). Only simulation/tender-specific features are unavailable. |
| `new/page.tsx` form has no submit handler | Low | Pre-existing issue, not introduced by this pass. Form creates no decision on submit. |

---

## 9. Recommended Phase 2

1. **Generic simulation engine** — Create `src/lib/simulation/generic-simulation.ts` with configurable scoring. Add type dispatch in `src/actions/simulation.ts`.
2. **Generic recommendation engine** — Create `src/lib/recommendation/generic-recommendation.ts` with type-specific rule sets.
3. **Conditional tab visibility** — Pass decision type to DecisionTabs; show/hide Tender tab based on type.
4. **Wire up new decision form** — Add server-side submit handler to `decisions/new/page.tsx`.
5. **Report page de-tender** — Replace "this tender shows" text with type-agnostic language in `report/page.tsx`.
6. **Decision-type profiles** — Add optional profile models or JSON field for non-tender decision types.
7. **DecisionOS seed script** — Create demo data for non-tender decision types.
