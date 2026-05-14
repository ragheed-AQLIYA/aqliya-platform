# DecisionOS Generic Recommendation Engine

## Overview

A generic recommendation engine for DecisionOS that supports all decision types while preserving the existing Tender recommendation behavior. Uses the adapter pattern to route decision-type-specific recommendation logic through a unified interface.

## Architecture

```
src/lib/recommendation/
├── tender-recommendation.ts         # Original tender logic (untouched)
├── recommendation-types.ts          # Shared interfaces and enums
├── recommendation-engine.ts         # Core engine with adapters
└── recommendation-adapters.ts       # Re-exports for clean imports
```

## Core Types

### RecommendationOutcome
```typescript
enum RecommendationOutcome {
  GO = "GO",
  GO_WITH_CONDITIONS = "GO_WITH_CONDITIONS",
  NO_GO = "NO_GO",
  DEFER = "DEFER",
  NEEDS_MORE_DATA = "NEEDS_MORE_DATA",
}
```

### RecommendationInput
```typescript
interface RecommendationInput {
  decisionId: string
  decisionType: DecisionType
  scenarioScores: ScenarioScores[]
  riskLevel: RiskLevel
  strategicFitScore: number
  priority?: string
  targetDate?: Date | null
  workflowComplete?: boolean
  missingInputs?: string[]
}
```

### RecommendationResult
```typescript
interface RecommendationResult {
  outcome: RecommendationOutcome
  confidence: number
  recommendedAction: string
  rationale: string
  expectedNextState: string
  scopeExclusions: string
  assumptionsUsed: string
  risksAccepted: string
  risksRejected: string
  humanReviewRequired: boolean
  conditions?: string
  nextActions: string[]
}
```

### RecommendationAdapter
```typescript
interface RecommendationAdapter {
  name: string
  description: string
  prerequisites: (input: RecommendationInput) => RecommendationPrerequisites
  generate: (input: RecommendationInput) => RecommendationResult
}
```

## Adapters by Decision Type

| Type | Adapter | Logic Focus |
|------|---------|-------------|
| TENDER | `tenderAdapter` | Wraps existing `generateRecommendation` — financial, capacity, risk, margin-based |
| INVESTMENT | `investmentAdapter` | ROI/risk/strategic fit weighted logic with financial viability emphasis |
| STRATEGIC | `strategicAdapter` | Strategic alignment/optionality/risk with strategic fit emphasis |
| HIRING | `hiringAdapter` | Capacity impact/cost/risk with capacity improvement emphasis |
| Other | `genericAdapter` | Weighted fallback using overall score, risk level, and strategic fit |

## Outcome Determination

| Overall Score | Risk Level | Missing Inputs | Outcome |
|---------------|------------|----------------|---------|
| ≥ 75 | Any | No | GO |
| 55–74 | Any | No | GO_WITH_CONDITIONS |
| 40–54 | Any | No | DEFER |
| < 40 | Any | No | NO_GO |
| Any | Any | Yes | NEEDS_MORE_DATA |

## Confidence Calculation

```
confidence = baseConfidence - variancePenalty
baseConfidence = expectedCase.overallDecisionScore (clamped 0-100)
variancePenalty = max(0, (bestCase - worstCase - 20) * 1.5)
```

High variance between best and worst cases reduces confidence.

## Dispatcher Functions

### `getRecommendationAdapter(decisionType: string): RecommendationAdapter`
Returns the adapter for a given decision type, falling back to `genericAdapter`.

### `canGenerateRecommendation(input: RecommendationInput): RecommendationPrerequisites`
Checks if prerequisites are met. Returns `canRun`, `missingInputs`, and `recommendedNextStep`.

### `generateGenericRecommendation(input: RecommendationInput): RecommendationResult`
Runs the appropriate adapter and returns the recommendation result.

## Server Action Flow (`src/actions/simulation.ts`)

1. **TENDER decisions**: Uses existing `generateRecommendation` with `TenderInput` (margin, risk level)
2. **Non-tender decisions**: Uses `generateGenericRecommendation` with:
   - `scenarioScores` from simulation
   - `riskLevel` from `decision.risks[0]?.level` or defaults to `"MEDIUM"`
   - `strategicFitScore` defaults to 50
   - `priority` and `targetDate` from decision metadata
3. **Both paths**: Upsert `Recommendation` record using existing Prisma model

## UI (`src/app/(dashboard)/decisions/[id]/recommendation/page.tsx`)

- Type-aware header description:
  - TENDER: "Tender-specific recommendation based on financial, capacity, and risk analysis"
  - Other: "Decision recommendation based on simulation scoring and risk assessment"
- `DecisionTabs` receives `decisionType` for consistent navigation
- Form fields unchanged — all decision types use the same `Recommendation` model fields
- Publish/unpublish workflow preserved

## Data Flow

```
runSimulationAndRecommendation(decisionId)
  ├── Run simulation (tender or generic)
  ├── Save SimulationResult records
  └── Generate recommendation
       ├── TENDER → generateRecommendation() (existing)
       └── Other  → generateGenericRecommendation() (new)
            └── Upsert Recommendation record
```

## Tender Compatibility Status

- `tender-recommendation.ts` — **untouched** (95 lines, all exports intact)
- `generateRecommendation` function — **called directly** for TENDER decisions
- `Recommendation` model — **no schema changes**, all fields compatible
- Recommendation page form — **unchanged**, same fields for all types
- Publish/unpublish workflow — **preserved**

## Schema Changes

**None.** The existing `Recommendation` model fields are sufficient:
- `recommendedAction` — stores outcome + action text
- `rationale` — stores scoring-based rationale
- `expectedNextState` — stores outcome-specific next state
- `scopeExclusions` — stores scope boundaries
- `assumptionsUsed` — stores assumptions and risk level
- `risksAccepted` / `risksRejected` — stores risk disposition
- `humanReviewRequired` — set to `true` unless outcome is `GO`

## Evaluation Factors

The generic recommendation engine evaluates:
1. **Simulation score** — `overallDecisionScore` from expected case
2. **Risk level** — from decision risks or default
3. **Confidence** — derived from score variance across scenarios
4. **Missing inputs** — flags `NEEDS_MORE_DATA` if prerequisites not met
5. **Decision priority** — passed to adapter (future use for urgency weighting)
6. **Target date** — passed to adapter (future use for time-pressure adjustment)
7. **Workflow completion** — passed to adapter (future use for gating)

## Remaining Risks

1. **`strategicFitScore` defaults to 50** — should pull from `DecisionFramework` or decision metadata
2. **Priority and target date not yet used** — passed to adapters but not factored into scoring
3. **Workflow completion state hardcoded to `false`** — should evaluate actual workflow state
4. **No type-specific recommendation forms** — all types share the same form fields
5. **Tender adapter uses hardcoded `marginEstimate: 15`** — should derive from actual tender data when available in generic path

## Recommended TASK-006

**Title:** Data-driven Simulation Scoring

**Scope:**
- Replace hardcoded base scores in simulation adapters with actual decision data
- Pull `strategicFitScore` from `DecisionFramework` criteria/values analysis
- Derive financial scores from decision objectives and constraints
- Use `targetDate` urgency to adjust risk scores
- Evaluate workflow completion state for recommendation gating
- Add priority-based weighting to recommendation outcomes
