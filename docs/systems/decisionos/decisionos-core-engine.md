# DecisionOS Core Engine

**Date:** 2026-05-11
**Version:** 1.0

---

## Architecture Overview

DecisionOS is structured as a **core engine + type-specific modules**. The core engine handles all generic decision workflow logic, while type-specific modules (like Tender) plug in additional functionality.

```
┌─────────────────────────────────────────────────┐
│                  DecisionOS Core                 │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Intake   │→ │Framework │→ │  Scenarios   │  │
│  └───────────┘  └──────────┘  └──────────────┘  │
│       ↓              ↓              ↓            │
│  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   Risks   │→ │Recommend │→ │  Intelligence │  │
│  └───────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────┐
│              Type-Specific Modules               │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Tender  │  │Investment│  │  Strategic   │  │
│  │ Profile  │  │ (future) │  │  (future)    │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Core Engine

### Location
`src/lib/decision/`

### Files

| File | Purpose | Type-Specific? |
|------|---------|----------------|
| `intake.ts` | Validates decision has title, objectives (≥2), alternatives, risks | No — generic |
| `framework.ts` | Evaluates 8-field framework completeness | No — generic |
| `scenarios.ts` | Evaluates scenario completeness (≥3 with all fields) | No — generic |
| `risk-analysis.ts` | Evaluates risk analysis per scenario | No — generic |
| `recommendation.ts` | Evaluates recommendation field completeness | No — generic |
| `gate.ts` | Validates A-1 pipeline gate (intake → recommendation) | No — generic |
| `intelligence-gate.ts` | Validates intelligence layer prerequisites | No — generic |
| `insight.ts` | Generates strategic insight summary | No — generic |
| `overview.ts` | Generates executive overview with quality score | No — generic |
| `what-to-do.ts` | Generates immediate action and next steps | No — generic |
| `decision-engine.ts` | **NEW** — Completion state, progress tracking, next step | No — generic |
| `decision-type-config.ts` | **NEW** — Type definitions, module configs | No — generic |
| `decision-pattern.ts` | Pattern metadata CRUD | No — generic |
| `learning-engine.ts` | Pattern extraction logic | No — generic |
| `sector.ts` | Sector CRUD and assignment | No — generic |
| `sector-benchmark.ts` | Benchmark CRUD | No — generic |
| `sector-pattern.ts` | Sector pattern upsert | No — generic |
| `signals-alerts.ts` | Signal/alert acknowledge/resolve | No — generic |
| `index.ts` | Re-exports core evaluators | No — generic |

### Core Pipeline (A-1)
```
A-1.0 Intake → A-1.1 Framework → A-1.2 Scenarios → A-1.3 Risk Analysis → A-1.4 Recommendation
```

Each stage gates the next. The `gate.ts` module validates the full pipeline.

---

## Type Configuration

### Location
`src/lib/decision/decision-type-config.ts`

### Supported Types

| Type | Label | Requires Tender Profile | Default Priority |
|------|-------|------------------------|------------------|
| `TENDER` | Tender | Yes | HIGH |
| `INVESTMENT` | Investment | No | HIGH |
| `EXPANSION` | Expansion | No | MEDIUM |
| `PROCUREMENT` | Procurement | No | MEDIUM |
| `HIRING` | Hiring | No | MEDIUM |
| `PARTNERSHIP` | Partnership | No | MEDIUM |
| `PRICING` | Pricing | No | MEDIUM |
| `STRATEGIC` | Strategic | No | HIGH |
| `OPERATIONS` | Operations | No | MEDIUM |
| `CUSTOM` | Custom | No | MEDIUM |

### Module System

Each decision type defines which modules are available:

**Generic modules** (available to all types):
- Intake, Framework, Scenarios, Risks, Recommendation (required)
- Simulation, Insight, What to Do, Executive, Sector, Signals, Alerts, Governance, Report (optional)

**Tender-only module**:
- Tender (financial/capacity profile)

### Key Functions

```typescript
getDecisionTypeConfig(type)     // Full config for a decision type
getDecisionWorkflow(type)       // Required modules only
getAllModules(type)             // All modules (required + optional)
canUseTenderModule(type)        // Whether Tender module is available
getNextDecisionStep(decision)   // Next incomplete stage
getDecisionCompletionState(decision)  // Full stage-by-stage state
getDecisionProgressSummary(decision)  // Progress percentage
```

---

## Tender Module

### Location
- `src/lib/simulation/tender-simulation.ts` — Scoring engine
- `src/lib/recommendation/tender-recommendation.ts` — Recommendation generator
- `src/actions/simulation.ts` — Server action that runs simulation
- `src/actions/tender.ts` — TenderProfile CRUD
- `src/app/(dashboard)/decisions/[id]/tender/page.tsx` — UI form

### What It Does
The Tender module is a **type-specific adapter** that:
1. Collects tender-specific data (client, contract value, cost, margin, capacity)
2. Runs 3-scenario simulation (BEST_CASE, EXPECTED_CASE, WORST_CASE) with financial/capacity/risk scoring
3. Generates GO/GO_WITH_CONDITIONS/NO_GO recommendations based on simulation scores

### Isolation
- Tender simulation and recommendation are **explicitly Tender-only**
- They are NOT imported by the core engine
- The `simulation.ts` action requires `TenderProfile` to exist
- The Tender tab is only shown when `decision.type === "TENDER"`

---

## Future Modules

### Investment Module (planned)
- Investment profile (capital required, expected ROI, payback period)
- Investment-specific simulation (NPV, IRR, payback analysis)
- Investment recommendation engine

### Strategic Module (planned)
- Strategic context fields (market analysis, competitive landscape)
- Strategic scoring framework
- Strategic recommendation engine

### Generic Simulation Engine (planned)
- Configurable scoring dimensions per decision type
- Type-specific input adapters
- Shared output format (scores per scenario)

---

## UI Integration

### DecisionTabs Component
`src/components/decisions/decision-tabs.tsx`

Tabs are now **generated from the type config**:
- Generic modules map to tabs
- Tender tab only appears for TENDER decisions
- Grid layout adapts to tab count

### Decision Detail Page
`src/app/(dashboard)/decisions/[id]/page.tsx`

- Shows decision type description
- Shows progress bar (completion percentage)
- Shows next step hint
- Passes `decisionType` to DecisionTabs for conditional rendering

---

## Data Flow

```
User creates decision (type: X)
    ↓
Decision stored with type, description, priority, targetDate
    ↓
Type config determines available modules
    ↓
User completes A-1 pipeline (generic for all types)
    ↓
If TENDER: Tender module adds simulation + tender-specific recommendation
If other type: Generic pipeline completes without simulation
    ↓
Intelligence layer (insight, overview, what-to-do) — generic for all types
    ↓
Post-decision monitoring (signals, alerts) — generic for all types
```
