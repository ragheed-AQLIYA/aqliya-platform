# DecisionOS Inputs UX

## Overview

Improves the data entry experience for non-tender decisions so the data-driven scoring engine has reliable inputs. Adds progress indicators, type-aware guidance, missing-input callouts, and score impact feedback across all input pages.

## Architecture

```
src/
├── lib/
│   ├── decision-type-config.ts          # Type-aware guidance configuration
│   └── simulation/
│       └── decision-scoring.ts          # Scoring engine (unchanged)
├── components/decisions/
│   └── decision-progress.tsx            # Shared workflow progress indicator
├── actions/
│   └── decisions.ts                     # Added getWorkflowReadiness action
└── app/(dashboard)/decisions/[id]/
    ├── intake/page.tsx                  # Updated with progress + guidance
    ├── framework/page.tsx               # Updated with progress + guidance
    ├── scenarios/page.tsx               # Updated with progress + guidance
    ├── risks/page.tsx                   # Updated with progress + guidance
    └── simulation/page.tsx              # Updated with progress + readiness
```

## New Components

### DecisionProgress (`src/components/decisions/decision-progress.tsx`)

Shared workflow progress indicator showing:
- 6-stage workflow: Intake → Framework → Scenarios → Risks → Simulation → Recommendation
- Stage status: complete (✓), current (→), blocked (!), pending (○)
- Missing inputs list for simulation readiness
- Data quality score (0-100)
- Blocked stage warnings with explanations

### DecisionTypeConfig (`src/lib/decision-type-config.ts`)

Configuration for all 10 decision types:
| Type | Label | Key Metrics |
|------|-------|-------------|
| TENDER | Tender | Contract value, Margin, Capacity fit, Delivery risk |
| INVESTMENT | Investment | ROI, Payback period, Risk-adjusted return, Capital efficiency |
| STRATEGIC | Strategic | Strategic alignment, Optionality, Competitive advantage, Market position |
| HIRING | Hiring | Capacity impact, Cost per hire, Time to productivity, Retention risk |
| EXPANSION | Expansion | Market size, Execution risk, Resource requirements, Timeline |
| PROCUREMENT | Procurement | Cost savings, Vendor reliability, Quality impact, Supply risk |
| PARTNERSHIP | Partnership | Mutual benefit, Dependency risk, Strategic fit, Governance |
| PRICING | Pricing | Revenue impact, Margin, Competitive position, Customer response |
| OPERATIONS | Operations | Efficiency gain, Disruption risk, Cost impact, Timeline |
| CUSTOM | Custom | Strategic fit, Feasibility, Risk level, Resource impact |

Each type provides:
- `intakeGuidance` — What to focus on during intake
- `frameworkGuidance` — What to document in the framework
- `scenarioGuidance` — What to model in scenarios
- `riskGuidance` — What to assess in risk analysis
- `keyMetrics` — 4 metrics most relevant to this type

## New Server Action

### `getWorkflowReadiness(decisionId)`

Returns:
```typescript
{
  decisionType: string
  intakeAccepted: boolean
  frameworkComplete: boolean
  scenariosComplete: boolean
  risksComplete: boolean
  simulationReady: boolean
  recommendationReady: boolean
  dataQuality: number          // 0-100
  missingInputs: string[]      // From decision-scoring.ts
  derivedScores: {
    strategicFitScore: number
    feasibilityScore: number
    riskScore: number
    confidenceScore: number
  }
}
```

## UX Improvements by Page

### Intake Page
- **Progress indicator** — Shows all 6 stages with current stage highlighted
- **Type-aware guidance** — Header description uses `config.intakeGuidance`
- **Score impact hints** — Each field shows how it affects scoring:
  - Objectives: "Defines strategic fit and feasibility scores. Aim for 3-5 objectives."
  - Alternatives: "More alternatives improve strategic fit scoring. Aim for 2-3."
  - Risks: "Risk assessment directly impacts risk score. Document all known risks."
  - Constraints: "Fewer constraints = higher capacity score. Be specific."
  - Assumptions: "Documented assumptions improve confidence and risk scores. Aim for 3-4."
- **Data quality badge** — Shows current data quality percentage
- **Missing inputs list** — Shows what's needed for simulation readiness

### Framework Page
- **Progress indicator** — Shows workflow stage status
- **Type-aware guidance** — Header uses `config.frameworkGuidance`
- **Success feedback** — "Framework saved successfully. This improves strategic fit and feasibility scores."
- **Field-level hints** — "Completing framework fields directly increases data quality and strategic fit scores."
- **Criteria hint** — "Detailed criteria improve strategic fit scoring."

### Scenarios Page
- **Progress indicator** — Shows workflow stage status
- **Type-aware guidance** — Header uses `config.scenarioGuidance`
- **Success feedback** — "Scenarios saved successfully. 3+ scenarios enable simulation readiness."
- **Blocked state clarity** — Shows exactly which prerequisite is blocking

### Risks Page
- **Progress indicator** — Shows workflow stage status
- **Type-aware guidance** — Header uses `config.riskGuidance`
- **Success feedback** — "Risk analysis saved. This enables simulation and recommendation."
- **Blocked state clarity** — Shows intake/framework/scenario blocking status

### Simulation Page
- **Progress indicator** — Full workflow view with simulation stage highlighted
- **Type-aware guidance** — Header uses `config.scenarioGuidance`
- **Missing inputs card** — Amber warning with specific missing items and data quality
- **Score drivers grid** — Shows each driver with impact badge (positive/neutral/negative)
- **Readiness context** — Shows what's complete and what's blocking

## Persistence Status

| Entity | Page | Persistence |
|--------|------|-------------|
| Objectives | Intake | `updateDecisionIntake` — creates/updates via Prisma |
| Constraints | Intake | `updateDecisionIntake` — creates/updates via Prisma |
| Assumptions | Intake | `updateDecisionIntake` — creates/updates via Prisma |
| Alternatives | Intake | `updateDecisionIntake` — creates/updates via Prisma |
| Risks (text) | Intake | `updateDecisionIntake` — creates/updates via Prisma |
| Framework | Framework | `updateDecisionFramework` — upserts DecisionFramework |
| Scenarios | Scenarios | `updateDecisionScenarios` — creates/updates DecisionScenario |
| Risk Analysis | Risks | `updateDecisionRiskAnalysis` — creates/updates DecisionRiskAnalysis |

All persistence uses existing server actions — no schema changes required.

## Demo Flow

1. **Create a non-tender decision** (e.g., INVESTMENT)
2. **Navigate to Intake** — see type-specific guidance, progress indicator at stage 1/6
3. **Fill in objectives** — see hint about strategic fit impact, save
4. **Navigate to Framework** — see progress (1/6 complete), type-specific guidance
5. **Complete framework fields** — see data quality improve, save
6. **Navigate to Scenarios** — see progress (2/6 complete), blocked if framework incomplete
7. **Create 3 scenarios** — see readiness improve, save
8. **Navigate to Risks** — see progress (3/6 complete), complete risk analysis
9. **Navigate to Simulation** — see full workflow (4/6 complete), score drivers, missing inputs
10. **Run Simulation** — see data-driven scores based on all entered data
11. **Navigate to Recommendation** — see generated recommendation from simulation results

## Changed Files

| File | Change |
|------|--------|
| `src/lib/decision-type-config.ts` | NEW — Type-aware guidance for all 10 decision types |
| `src/components/decisions/decision-progress.tsx` | NEW — Shared workflow progress indicator component |
| `src/actions/decisions.ts` | Added `getWorkflowReadiness` action; added `type` to getDecisionIntake/Framework/Scenarios/RiskAnalysis returns |
| `src/app/(dashboard)/decisions/[id]/intake/page.tsx` | Added progress indicator, type guidance, score impact hints, data quality |
| `src/app/(dashboard)/decisions/[id]/framework/page.tsx` | Added progress indicator, type guidance, success feedback |
| `src/app/(dashboard)/decisions/[id]/scenarios/page.tsx` | Added progress indicator, type guidance, readiness feedback |
| `src/app/(dashboard)/decisions/[id]/risks/page.tsx` | Added progress indicator, type guidance, readiness feedback |
| `src/app/(dashboard)/decisions/[id]/simulation/page.tsx` | Added progress indicator, type guidance, enhanced missing inputs display |

## Schema Changes

**None.** All changes use existing Prisma models and server actions.

## Remaining Risks

1. **Progress indicator uses `decisionScenarios` not `scenarios`** — two different scenario models exist; the progress component checks `decisionScenarios` (A-1.2) while simulation uses `scenarios` (BEST/EXPECTED/WORST_CASE)
2. **No real-time score updates** — scores update on save, not on field change
3. **Type guidance is static** — doesn't adapt to actual decision data quality
4. **Missing inputs don't link to pages** — users must navigate manually
5. **No validation feedback on field level** — only form-level success/error

## Recommended TASK-008

**Title:** Simulation & Recommendation UI Polish

**Scope:**
- Add recommendation outcome badges (GO/GO_WITH_CONDITIONS/NO_GO/DEFER/NEEDS_MORE_DATA) to recommendation page
- Show confidence score visualization for non-tender decisions
- Add comparison view: before/after simulation scores
- Enable recommendation editing with type-aware field hints
- Add export functionality for simulation results and recommendations
- Create decision summary dashboard showing all stages at a glance
