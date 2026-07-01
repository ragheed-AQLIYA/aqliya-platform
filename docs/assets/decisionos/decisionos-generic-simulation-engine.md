# DecisionOS Generic Simulation Engine

## Overview

A generic simulation engine for DecisionOS that supports non-tender decision types while preserving the existing tender simulation engine. Uses the adapter pattern to route decision-type-specific scoring through a unified interface.

## Architecture

```
src/lib/simulation/
├── tender-simulation.ts      # Original tender logic (untouched)
├── simulation-types.ts       # Shared interfaces
├── simulation-adapters.ts    # Tender adapter wrapping runSimulation
└── simulation-engine.ts      # Generic engine, registry, adapters
```

## Core Types

### SimulationInput
```typescript
interface SimulationInput {
  decisionId: string
  decisionType: DecisionType
  strategicFitScore: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  [key: string]: unknown
}
```

### SimulationScenarioResult
```typescript
interface SimulationScenarioResult {
  scenarioType: ScenarioType
  scenarioName: string
  feasibilityScore: number
  financialScore: number
  capacityScore: number
  riskScore: number
  strategicFitScore: number
  overallDecisionScore: number
  confidence: number
  upside: string
  downside: string
  riskLevel: "LOW" | "MEDIUM" | "HIGH"
  rationale: string
  recommendedAction: string
}
```

### SimulationAdapter
```typescript
interface SimulationAdapter {
  name: string
  description: string
  prerequisites: (input: Record<string, unknown>) => SimulationPrerequisites
  run: (input: SimulationInput) => SimulationScenarioResult[]
}
```

## Adapters by Decision Type

| Type | Adapter | Scoring Focus |
|------|---------|---------------|
| TENDER | `tenderAdapter` | Wraps existing `runSimulation` — financial, capacity, risk, strategic fit |
| INVESTMENT | `investmentAdapter` | ROI/risk/strategic fit with scenario multipliers |
| STRATEGIC | `strategicAdapter` | Strategic alignment/optionality/risk (higher strategic weight) |
| HIRING | `hiringAdapter` | Capacity impact/cost/risk (higher capacity weight) |
| Other | `genericAdapter` | Weighted scoring fallback (feasibility 20%, financial 25%, capacity 15%, risk 20%, strategic 20%) |

## Scenario Multipliers

All non-tender adapters apply scenario multipliers to base scores:
- `BEST_CASE`: ×1.15
- `EXPECTED_CASE`: ×1.0
- `WORST_CASE`: ×0.8

Scores are capped at 100.

## Dispatcher Functions

### `getSimulationAdapter(decisionType: DecisionType): SimulationAdapter`
Returns the adapter for a given decision type, falling back to `genericAdapter`.

### `canRunSimulation(decisionType, inputData): SimulationPrerequisites`
Checks if prerequisites are met. Returns `canRun`, `missingInputs`, and `recommendedNextStep`.

### `runGenericSimulation(input: SimulationInput): SimulationScenarioResult[]`
Runs the appropriate adapter and returns scenario results.

### `getSimulationSummary(output: SimulationOutput): string`
Generates a human-readable summary from simulation output.

## Server Action Flow (`src/actions/simulation.ts`)

1. `runSimulationAndRecommendation(decisionId)`:
   - Checks `decision.type === "TENDER"` and `decision.tenderProfile` exists
   - If TENDER: uses existing `runSimulation` with `TenderInput`
   - Otherwise: derives `riskLevel` from `decision.risks[0]?.level` or defaults to `"MEDIUM"`, uses `runGenericSimulation`
   - Upserts `SimulationResult` per scenario
   - Generates `Recommendation` only for TENDER decisions (existing logic preserved)

2. `getSimulationResults(decisionId)`:
   - Returns scenarios with simulation results, recommendation, and decision type
   - `tenderProfile` only included for TENDER decisions

## UI (`src/app/(dashboard)/decisions/[id]/simulation/page.tsx`)

- Type-aware header: "Tender-specific financial, capacity, and risk scoring" vs "Generic decision scoring across three scenarios"
- Null-safe data loading with `result.success && result.data` guards
- Recommendation section shows tender-specific fields (`confidenceScore`, `conditions`) only for TENDER
- Universal score display across all decision types

## Tender Compatibility Status

- `tender-simulation.ts` — **untouched**, all exports preserved
- `TenderInput` and `ScenarioScores` types — **unchanged**
- `runSimulation` function — **called directly** for TENDER decisions
- `TenderProfile` requirement — **preserved** (TENDER branch requires `decision.tenderProfile`)
- Recommendation generation — **TENDER-only** (existing `generateRecommendation` logic)

## Safe Fallback Behavior

If required data is missing:
```typescript
{
  canRun: false,
  missingInputs: ["Strategic fit score (0-100)", "Risk level (LOW/MEDIUM/HIGH)"],
  recommendedNextStep: "Complete decision intake with risk and strategic fit assessment"
}
```

## Scoring Weights (Generic)

| Dimension | Weight |
|-----------|--------|
| Feasibility | 20% |
| Financial | 25% |
| Capacity | 15% |
| Risk | 20% |
| Strategic Fit | 20% |

## Risk Level Mapping

| Risk Level | Base Score |
|------------|------------|
| LOW | 75-80 |
| MEDIUM | 55-60 |
| HIGH | 35-40 |

## Validation

- `npx tsc --noEmit` — passes (pre-existing unrelated errors in `decisions.ts`/`decisions/[id]/page.tsx`)
- `npm run build -- --webpack` — successful, all pages generated

## Remaining Risks

1. **Generic adapters use hardcoded base scores** — should derive from decision data (objectives, constraints, alternatives) as those modules mature
2. **Non-tender recommendations not generated** — only TENDER decisions get `Recommendation` records; generic decisions store simulation results but no recommendation
3. **`DecisionType.EXPANSION`, `PROCUREMENT`, `PARTNERSHIP`, `PRICING`, `OPERATIONS`, `CUSTOM`** — all fall through to `genericAdapter`; no type-specific scoring yet
4. **`strategicFitScore` defaults to 50** for non-tender — should pull from decision framework or intake data when available

## Recommended TASK-005

**Title:** Enrich Generic Simulation Adapters with Decision Data

**Scope:**
- Pull `strategicFitScore` from `DecisionFramework` or decision metadata instead of defaulting to 50
- Generate `Recommendation` records for non-tender decisions using a generic recommendation generator
- Add type-specific adapters for `INVESTMENT`, `STRATEGIC`, `HIRING` that use actual decision data (ROI calculations, capacity impact, cost analysis)
- Create simulation input forms per decision type to collect required data before running simulation
