# DecisionOS Data-driven Scoring

## Overview

Replaces hardcoded generic simulation scores with scores derived from actual DecisionOS data entities. Each dimension (strategic fit, feasibility, financial, capacity, risk) is computed from the decision's framework, objectives, constraints, assumptions, alternatives, risks, and scenarios.

## Architecture

```
src/lib/simulation/
├── tender-simulation.ts       # Untouched — TenderProfile-based
├── decision-scoring.ts        # NEW — Derives scores from decision data
├── simulation-types.ts        # Updated — Added DecisionScoringData/DerivedScores
├── simulation-adapters.ts     # Untouched — Tender adapter
└── simulation-engine.ts       # Updated — Uses derived scores when available
```

## New Module: `decision-scoring.ts`

### Input: `DecisionScoringData`
```typescript
interface DecisionScoringData {
  objectives: Array<{ description: string }>
  constraints: Array<{ description: string }>
  assumptions: Array<{ description: string }>
  alternatives: Array<{ description: string }>
  risks: Array<{ description: string; level: RiskLevel }>
  framework: { context, purpose, options, criteria, values, informationGaps, certainty, assumptions } | null
  scenarios: Array<{ type: string }>
  priority: string | null
  targetDate: Date | null
}
```

### Output: `DerivedScores`
```typescript
interface DerivedScores {
  strategicFitScore: number    // 0-100
  feasibilityScore: number     // 0-100
  financialScore: number       // 0-100
  capacityScore: number        // 0-100
  riskScore: number            // 0-100
  confidenceScore: number      // 0-100
  missingInputs: string[]      // e.g., "No objectives defined"
  dataQuality: number          // 0-100
}
```

### Exports
- `deriveScores(data: DecisionScoringData): DerivedScores`
- `getScoreDrivers(data: DecisionScoringData): Record<string, { score, label, impact }>`
- `buildScoringData(decision): DecisionScoringData` (in simulation-engine.ts)

## Scoring Formulas

### Strategic Fit Score
```
strategicFitScore = clamp(
  frameworkScore * 0.35 +
  objectivesScore * 0.25 +
  alternativesScore * 0.2 +
  criteriaContentScore * 0.2
)
```

- **frameworkScore** (35%): Fraction of 8 framework fields filled (context, purpose, options, criteria, values, informationGaps, certainty, assumptions)
- **objectivesScore** (25%): `min(objectives.count / 5, 1) * 100` — ideal is 5 objectives
- **alternativesScore** (20%): `min(alternatives.count / 3, 1) * 100` — ideal is 3 alternatives
- **criteriaContentScore** (20%): Based on text length of framework.criteria (0-100 scaled)

### Feasibility Score
```
feasibilityScore = clamp(
  frameworkScore * 0.2 +
  objectivesScore * 0.2 +
  constraintsScore * 0.15 +
  assumptionsScore * 0.15 +
  scenariosScore * 0.3
)
```

- **constraintsScore** (15%): `min(constraints.count / 3, 1) * 100` — ideal is 3 constraints
- **assumptionsScore** (15%): `min(assumptions.count / 4, 1) * 100` — ideal is 4 assumptions
- **scenariosScore** (30%): `min(scenarios.count / 3, 1) * 100` — ideal is 3 scenarios

### Financial Score
```
financialScore = clamp(
  objectivesScore * 0.3 +
  constraintsScore * 0.2 +
  alternativesScore * 0.25 +
  urgencyScore * 0.25
)
```

- **urgencyScore**: Based on targetDate proximity and priority level
  - < 7 days: 80 (±10 for priority)
  - < 30 days: 60
  - < 90 days: 45
  - > 90 days: 30
  - No date: 50

### Capacity Score
```
capacityScore = clamp(
  objectivesScore * 0.2 +
  assumptionsScore * 0.2 +
  alternativesScore * 0.3 +
  (100 - constraintsScore) * 0.15 +
  frameworkScore * 0.15
)
```

- Fewer constraints = higher capacity (inverse relationship)

### Risk Score
```
riskScore = clamp(
  riskProfileScore * 0.5 +
  assumptionsScore * 0.2 +
  (100 - constraintsScore) * 0.15 +
  frameworkScore * 0.15
)
```

- **riskProfileScore**: Average of risk level scores (LOW=85, MEDIUM=55, HIGH=25), penalized by count (>5 risks = -3 each)

### Confidence Score
```
confidenceScore = clamp(
  50 +
  (frameworkScore - 50) * 0.2 +
  (objectives.count > 0 ? 10 : -10) +
  (alternatives.count > 0 ? 10 : -10) +
  (risks.count > 0 ? 5 : -5) +
  (scenarios.count >= 3 ? 10 : scenarios.count > 0 ? 5 : -5) -
  (variance / 100) * 15
)
```

- Base 50, adjusted by data completeness and score variance
- Variance penalty: difference between strategic fit and risk scores

### Data Quality Score
```
dataQuality = clamp(
  frameworkScore * 0.3 +
  (objectives.count > 0 ? 15 : 0) +
  (constraints.count > 0 ? 10 : 0) +
  (assumptions.count > 0 ? 10 : 0) +
  (alternatives.count > 0 ? 10 : 0) +
  (risks.count > 0 ? 15 : 0) +
  (scenarios.count >= 3 ? 30 : scenarios.count > 0 ? 15 : 0)
)
```

## Missing Input Detection

| Condition | Missing Input Message |
|-----------|----------------------|
| Framework score < 50 or null | "Decision framework not completed" |
| objectives.count = 0 | "No objectives defined" |
| constraints.count = 0 | "No constraints identified" |
| alternatives.count = 0 | "No alternatives defined" |
| assumptions.count = 0 | "No assumptions documented" |
| risks.count = 0 | "No risks assessed" |
| scenarios.count = 0 | "No scenarios created" |

## Score Drivers

Each driver reports:
- **score**: 0-100
- **label**: Human-readable description with count
- **impact**: "positive" (≥70), "neutral" (40-69), "negative" (<40)

Drivers shown in UI:
- Framework completion
- Objectives count
- Constraints count
- Alternatives count
- Risk profile
- Scenarios count

## Data Flow

```
runSimulationAndRecommendation(decisionId)
  ├── Fetch decision with ALL relations:
  │   - objectives, constraints, assumptions, alternatives
  │   - risks, framework, scenarios
  ├── buildScoringData(decision) → DecisionScoringData
  ├── deriveScores(scoringData) → DerivedScores
  ├── Pass derivedScores to simulation adapters
  └── Pass derivedScores to recommendation engine
```

## Changed Files

| File | Change |
|------|--------|
| `src/lib/simulation/decision-scoring.ts` | NEW — All scoring formulas, missing input detection, score drivers |
| `src/lib/simulation/simulation-types.ts` | Added `DecisionScoringData`, `DerivedScores` exports; added `derivedScores` to `SimulationInput` |
| `src/lib/simulation/simulation-engine.ts` | Added `getBaseScores()` to use derived scores when available; exports `buildScoringData`, `deriveScores`, `getScoreDrivers` |
| `src/actions/simulation.ts` | Fetches all decision relations; uses `buildScoringData` + `deriveScores` for non-tender; passes derived scores to simulation and recommendation |
| `src/app/(dashboard)/decisions/[id]/simulation/page.tsx` | Shows missing inputs card, score drivers grid, data quality score |

## Data Sources Used

| Entity | Used For | Weight |
|--------|----------|--------|
| DecisionFramework | Framework completeness | 15-35% across scores |
| Objective | Goal clarity | 20-30% across scores |
| Constraint | Limitations severity | 15-20% across scores |
| Assumption | Documentation quality | 15-20% across scores |
| Alternative | Options considered | 20-30% across scores |
| Risk | Risk profile | 50% of risk score |
| Scenario | Analysis completeness | 30% of feasibility |
| Decision.priority | Urgency calculation | Financial score only |
| Decision.targetDate | Urgency calculation | Financial score only |

## Tender Compatibility Status

- `tender-simulation.ts` — **untouched**
- `tenderAdapter` — **unchanged**, uses TenderProfile data
- TENDER branch in `simulation.ts` — **unchanged**, no derived scoring
- All changes apply only to non-TENDER decision types

## Remaining Risks

1. **Score weights are heuristic** — may need calibration based on real decision outcomes
2. **Content quality scoring is length-based** — doesn't assess actual quality of framework text
3. **No type-specific weighting** — INVESTMENT, STRATEGIC, HIRING all use same derived scores
4. **Urgency score is simplistic** — only considers days until target date, not business context
5. **Risk score uses first risk's level** — should aggregate all risks more comprehensively

## Recommended TASK-007

**Title:** Decision Inputs UX

**Scope:**
- Create type-specific input forms for each decision type (INVESTMENT, STRATEGIC, HIRING, etc.)
- Guide users through framework completion with progressive disclosure
- Show real-time score impact as users add objectives, constraints, alternatives, risks
- Provide validation and suggestions for missing inputs
- Add "Simulation Readiness" indicator showing data quality score
- Enable users to see how each input affects the final scores before running simulation
