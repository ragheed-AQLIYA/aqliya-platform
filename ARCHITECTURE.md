# AQLIYA OS Core v1 — Architecture

## Layered Architecture

```
A-1: Decision System (Core)
    ↓ (gated)
A-2: Intelligence Outputs (Derived)
    ↓ (gated)
A-3: Sector + Learning (Patterns)
```

---

## Layer Responsibilities

### A-1: Decision System
**Purpose:** Capture, structure, and gate decision inputs.

**Responsibilities:**
- Intake: objectives, alternatives, risks, assumptions
- Framework: context, purpose, criteria, values
- Scenarios: best/expected/worst case
- Risk Analysis: per scenario
- Recommendation: final output (requires all prior stages)

**Allowed Writes:**
- `Decision`, `DecisionFramework`, `DecisionScenario`, `DecisionRiskAnalysis`
- `Recommendation`, `Objective`, `Constraint`, `Assumption`, `Alternative`, `Risk`
- `TenderProfile`, `Scenario`, `SimulationResult`, `Approval`, `AuditLog`, `DecisionReport`

**Forbidden Actions:**
- ❌ Modify A-2 or A-3 data
- ❌ Auto-approve or skip gates
- ❌ Create signals/alerts manually

**Gates:**
- `validateRecommendationGate()` — blocks recommendation if:
  - `intake_not_accepted`
  - `framework_incomplete`
  - `scenarios_missing`
  - `scenarios_incomplete`
  - `risks_missing`
  - `risks_incomplete`

---

### A-2: Intelligence Outputs
**Purpose:** Derive computed outputs from A-1 data (read-only).

**Responsibilities:**
- Insight: `generateStrategicInsight()` (reads A-1 only)
- What to Do: `generateWhatToDoNow()` (reads A-1 only)
- Overview: `generateExecutiveOverview()` (reads A-1 only)
- Signals: system-generated monitoring (`source`, `referenceId`)
- Alerts: human-reviewed warnings (`triggeringSignalId`, never auto-resolve)

**Allowed Writes:**
- `DecisionMonitoringSignal` (system-generated only, `generatedBy: "system"`)
- `DecisionRiskAlert` (requires human review, `requiresReview: true`)

**Forbidden Actions:**
- ❌ Modify A-1 decisions or recommendations
- ❌ Manual signal/alert creation from UI
- ❌ Auto-resolve alerts
- ❌ Store patterns or learning data

**Gates:**
- `validateIntelligenceGate()` — requires A-1 gate + recommendation complete
- Signals: acknowledge only
- Alerts: acknowledge + resolve (human review required)

---

### A-3: Sector + Learning
**Purpose:** Learn patterns from completed decisions, provide sector intelligence.

**Responsibilities:**
- Sector management: `Sector`, `SectorBenchmark` (`sourceType`, `confidence`)
- Pattern extraction: `extractPatternsFromDecision()` (completed decisions only)
- Learning engine: `learning-engine.ts` (ALL logic, in memory)
- Incremental updates: `SectorPattern` (`occurrenceCount`, `lastObservedAt`, `confidenceScore`)

**Allowed Writes:**
- `Sector`, `SectorBenchmark` (manual or system-seeded, human-reviewed)
- `SectorPattern` (incremental updates only, NO analysis logic)
- `DecisionPattern` (metadata only: `patternScope`, `confidence`, `extractedAt`)

**Forbidden Actions:**
- ❌ Modify A-1 or A-2 data
- ❌ Auto-trigger pattern extraction
- ❌ Batch processing or global recompute
- ❌ Store patterns as JSON in DB (analysis in memory only)
- ❌ Apply patterns automatically to decisions

**Gates:**
- `validateIntelligenceLayerGate()` — requires A-2 gate + decision completed (APPROVED/REJECTED)
- `validatePatternExtractionGate()` — requires gate above + patterns not already extracted
- Pattern extraction: manual trigger only ("Extract Patterns" button)

---

## Data Flow Rules

1. **A-1 → A-2:** Read-only references, derived outputs computed on-demand
2. **A-1/A-2 → A-3:** Read-only references, patterns extracted from completed decisions
3. **No reverse writes:** A-2 cannot write to A-1, A-3 cannot write to A-1 or A-2
4. **Signals → Alerts:** Every alert requires a triggering signal (`triggeringSignalId`)
5. **Patterns:** Analysis in `learning-engine.ts` (memory), metadata only in DB

---

## Gate Hierarchy

```
decisionId
    ↓
validateRecommendationGate() → A-1 complete
    ↓
validateIntelligenceGate() → + recommendation complete
    ↓
validateIntelligenceLayerGate() → + decision completed
    ↓
validatePatternExtractionGate() → + patterns not extracted
    ↓
extractPatternsFromDecision()
```

---

## File Structure

```
src/
├── lib/decision/
│   ├── gate.ts              # A-1 gate
│   ├── intelligence-gate.ts # A-2 & A-3 gates (no `as any`)
│   ├── intake.ts           # A-1
│   ├── framework.ts        # A-1
│   ├── scenarios.ts        # A-1
│   ├── risk-analysis.ts    # A-1
│   ├── recommendation.ts    # A-1
│   ├── insight.ts           # A-2
│   ├── what-to-do.ts       # A-2
│   ├── overview.ts         # A-2
│   ├── signals-alerts.ts   # A-2
│   ├── sector.ts            # A-3
│   ├── sector-benchmark.ts # A-3
│   ├── decision-pattern.ts # A-3 (metadata CRUD)
│   ├── sector-pattern.ts  # A-3 (query + update)
│   └── learning-engine.ts # A-3 (ALL pattern logic)
├── actions/
│   ├── decision-intelligence.ts  # A-2
│   ├── decision-signals-alerts.ts # A-2
│   ├── decision-sector.ts        # A-3
│   └── decision-learning.ts     # A-3
└── app/(dashboard)/
    ├── decisions/[id]/
    │   ├── intake/           # A-1
    │   ├── framework/        # A-1
    │   ├── scenarios/        # A-1
    │   ├── risks/            # A-1
    │   ├── recommendation/   # A-1
    │   ├── insight/          # A-2
    │   ├── what-to-do/      # A-2
    │   ├── overview/         # A-2
    │   ├── signals/          # A-2
    │   ├── alerts/           # A-2
    │   └── sector/           # A-3
    └── intelligence/
        └── sectors/
            ├── page.tsx          # Sector list
            └── [id]/page.tsx   # Sector detail + patterns
```

---

*Last updated: 2026-05-05*
