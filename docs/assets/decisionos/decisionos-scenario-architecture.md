# DecisionOS Scenario Architecture

## Problem

Two overlapping scenario models created architectural drift:
- `DecisionScenario` — business scenario definition (A-1.2 workflow)
- `Scenario` — simulation scenario execution (BEST_CASE, EXPECTED_CASE, WORST_CASE)

Progress tracking used `DecisionScenario` while simulation used `Scenario`. Scoring formulas referenced the wrong model, causing inaccurate data quality and feasibility scores.

## Architecture Classification

### DecisionScenario (Canonical Business Scenario)
**Purpose**: User-defined business scenarios in the A-1.2 workflow stage.

**Fields**:
| Field | Type | Purpose |
|-------|------|---------|
| name | String | Scenario name |
| description | String | Descriptive path without ranking |
| assumptions | String | Assumptions for scenario to hold |
| expectedOutcome | String | Descriptive expected outcome |
| affectedStakeholders | String | Affected parties |
| requiredConditions | String | Conditions for plausibility |

**Relations**:
- 1:1 with `DecisionRiskAnalysis` (A-1.3)
- Belongs to `Decision`

**Used By**:
- Progress tracking (`getWorkflowReadiness`)
- Workflow evaluation (`evaluateScenarios`)
- Risk analysis page
- Insight/overview generation
- Learning engine
- Gate checks
- Scoring formulas (strategic fit, feasibility, data quality)

### Scenario (Simulation Execution Artifact)
**Purpose**: Internal simulation scenario types — not user-defined.

**Fields**:
| Field | Type | Purpose |
|-------|------|---------|
| type | ScenarioType | BEST_CASE, EXPECTED_CASE, or WORST_CASE |

**Relations**:
- 1:1 with `SimulationResult`
- Belongs to `Decision`

**Used By**:
- Simulation result storage
- Simulation page display
- Recommendation generation (score lookup)

**Created By**: `runSimulationAndRecommendation` action (auto-created if missing)

### SimulationResult (Execution Output)
**Purpose**: Stores computed scores for each simulation scenario type.

**Fields**: feasibilityScore, financialScore, capacityScore, riskScore, strategicFitScore, overallDecisionScore

**Linked To**: `Scenario` (not `DecisionScenario`)

## Target Architecture

```
Decision
├── DecisionScenario (canonical business scenario)
│   └── DecisionRiskAnalysis (1:1)
│
├── Scenario (simulation execution artifact)
│   └── SimulationResult (1:1)
│
└── Recommendation
```

### Roles
| Model | Role | User-Facing? |
|-------|------|--------------|
| DecisionScenario | Business scenario definition | Yes — created/edited by users |
| Scenario | Simulation scenario type container | No — auto-created by system |
| SimulationResult | Simulation output scores | No — computed by engine |

### Canonical Source
- **DecisionScenario** is the canonical source for:
  - Scenario count in scoring formulas
  - Scenario completeness in progress tracking
  - Risk analysis readiness
  - Data quality calculation
  - Feasibility score computation

- **Scenario** is an internal artifact for:
  - Storing BEST/EXPECTED/WORST_CASE simulation results
  - Displaying simulation scores in the UI
  - Feeding recommendation engine with scores

## Changes Made

### 1. `decision-scoring.ts` — Interface Update
Changed `DecisionScoringData` from:
```typescript
scenarios: Array<{ type: string }>
```
To:
```typescript
businessScenarioCount: number
businessScenariosComplete: boolean
```

All scoring formulas now use `businessScenarioCount` instead of `scenarios.length`:
- Confidence score: scenario bonus based on business scenario count
- Missing inputs: "No scenarios created" when count is 0
- Feasibility score: scenariosScore from business scenario count
- Data quality: scenario bonus from business scenario count
- Score drivers: label shows business scenario count

### 2. `simulation-engine.ts` — `buildScoringData` Update
Changed parameter from `scenarios: Array<{ type: string }>` to `decisionScenarios: Array<{ name: string; description: string }>` and maps to `businessScenarioCount` + `businessScenariosComplete`.

### 3. `simulation.ts` — Query Updates
Added `decisionScenarios: true` to both `runSimulationAndRecommendation` and `getSimulationResults` queries. Updated `buildScoringData` calls to pass `decisionScenarios`.

### 4. `decisions.ts` — `getWorkflowReadiness` Update
Updated `buildScoringData` call to map `decisionScenarios` to the expected format.

### 5. New `scenario-architecture.ts` — Helper Module
Provides:
- `mapDecisionScenarios()` — maps Prisma DecisionScenario to CanonicalScenario
- `mapSimulationScenarios()` — maps Prisma Scenario to SimulationScenario
- `evaluateScenarioReadiness()` — unified readiness evaluation across both models
- `getScenarioSimulationInputs()` — extracts simulation inputs from business scenarios

## Migration Impact

| Aspect | Impact |
|--------|--------|
| Schema | No changes — both models preserved |
| Existing data | Preserved — no migration required |
| Tender workflow | Unchanged — uses TenderProfile, not scenarios |
| Progress tracking | Now uses correct model (DecisionScenario) |
| Scoring formulas | Now use correct model (DecisionScenario count) |
| Simulation display | Unchanged — still uses Scenario + SimulationResult |
| Recommendation | Unchanged — uses simulation scores from Scenario |

## Backward Compatibility

- `Scenario` model retained for simulation result storage
- `SimulationResult` relation unchanged
- All existing simulation results preserved
- No destructive migrations
- Safe fallback: if `decisionScenarios` is empty, scoring treats it as 0 scenarios

## Remaining Architectural Risks

1. **Dual model maintenance** — Both models must be kept in sync conceptually; future developers may confuse them
2. **No explicit link** — `DecisionScenario` and `Scenario` are not related; simulation results are tied to ScenarioType, not to specific business scenarios
3. **Simulation doesn't use business scenario data** — Simulation scoring uses derived scores from DecisionScenario metadata, not the actual scenario content (description, assumptions, etc.)
4. **Scenario count vs scenario types** — Business scenario count affects scoring, but simulation always produces exactly 3 results (BEST/EXPECTED/WORST_CASE) regardless of business scenario count

## Recommended TASK-008

**Title:** Simulation & Recommendation UI Polish

**Scope:**
- Add recommendation outcome badges (GO/GO_WITH_CONDITIONS/NO_GO/DEFER/NEEDS_MORE_DATA)
- Show confidence score visualization for non-tender decisions
- Add before/after simulation score comparison
- Enable recommendation editing with type-aware field hints
- Add export functionality for simulation results and recommendations
- Create decision summary dashboard showing all stages at a glance
