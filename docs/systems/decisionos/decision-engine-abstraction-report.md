# Decision Engine Abstraction — Implementation Report

**Date:** 2026-05-11
**Scope:** Generic DecisionOS core engine creation

---

## Changed Files (3)

| File | Change |
|------|--------|
| `src/components/decisions/decision-tabs.tsx` | Tabs now generated from `decision-type-config.ts` instead of hardcoded arrays |
| `src/app/(dashboard)/decisions/[id]/page.tsx` | Added engine imports, progress bar, type description, next-step hint |
| `docs/decisionos-core-engine.md` | New documentation file |

---

## New Engine Files (2)

| File | Purpose |
|------|---------|
| `src/lib/decision/decision-type-config.ts` | DecisionType configuration: labels, descriptions, module lists, tender requirement flags |
| `src/lib/decision/decision-engine.ts` | Core engine: completion state, progress tracking, next-step determination |

---

## What Became Generic

### Decision Type Configuration (`decision-type-config.ts`)
- All 10 DecisionType values now have explicit configuration
- Each type defines: label, description, icon, modules, tender requirement, default priority
- Module system: 14 generic modules + 1 Tender-only module
- Functions: `getDecisionTypeConfig()`, `getDecisionWorkflow()`, `getAllModules()`, `canUseTenderModule()`

### Decision Completion Engine (`decision-engine.ts`)
- `getDecisionCompletionState(decision)` — Returns stage-by-stage status (complete/incomplete/blocked/not_started/optional)
- `getNextDecisionStep(decision)` — Returns the next module to complete
- `getDecisionProgressSummary(decision)` — Returns completed/total/percentage/nextLabel

### UI Integration
- DecisionTabs now reads tabs from `getAllModules(type)` — no hardcoded tab lists
- Detail page shows progress bar with percentage and next-step hint
- Detail page shows type description from config

---

## What Remains Tender-Specific

| Component | Location | Status |
|-----------|----------|--------|
| Tender simulation scoring | `src/lib/simulation/tender-simulation.ts` | Untouched — explicitly Tender module |
| Tender recommendation | `src/lib/recommendation/tender-recommendation.ts` | Untouched — explicitly Tender module |
| Tender simulation action | `src/actions/simulation.ts` | Untouched — requires TenderProfile |
| Tender CRUD actions | `src/actions/tender.ts` | Untouched |
| Tender profile form | `src/app/(dashboard)/decisions/[id]/tender/page.tsx` | Untouched |
| TenderProfile Prisma model | `prisma/schema.prisma` | Untouched |

The Tender module is **isolated** — it is NOT imported by the core engine. It is only accessible when `decision.type === "TENDER"`.

---

## Classification of Existing Files

### 100% Generic (no changes needed)
- `intake.ts` — Generic intake evaluation
- `framework.ts` — Generic framework evaluation
- `scenarios.ts` — Generic scenario evaluation
- `risk-analysis.ts` — Generic risk analysis evaluation
- `recommendation.ts` — Generic recommendation state evaluation
- `gate.ts` — Generic recommendation gate
- `intelligence-gate.ts` — Generic intelligence gate
- `insight.ts` — Generic strategic insight
- `overview.ts` — Generic executive overview
- `what-to-do.ts` — Generic next-step generation
- `decision-pattern.ts` — Generic pattern metadata
- `learning-engine.ts` — Generic pattern extraction
- `sector.ts` — Generic sector management
- `sector-benchmark.ts` — Generic benchmarks
- `sector-pattern.ts` — Generic sector patterns
- `signals-alerts.ts` — Generic signals/alerts

### Tender-Specific (isolated, not deleted)
- `tender-simulation.ts` — Tender scoring engine
- `tender-recommendation.ts` — Tender recommendation generator
- `simulation.ts` (action) — Calls tender-simulation
- `tender.ts` (action) — TenderProfile CRUD

### UI-Only (unchanged)
- All pages under `src/app/(dashboard)/decisions/[id]/` — Render UI, call actions

---

## Validation Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build -- --webpack` | **Passes** — all routes compiled |

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Non-tender decisions show Simulation tab but simulation requires TenderProfile | Low | Simulation tab is in generic modules but the simulation action will error gracefully for non-tender decisions. Phase 2 should add generic simulation or hide tab for non-tender. |
| `DecisionForEngine` interface uses `unknown` for `tenderProfile` | Low | Used only for type checking; actual tender access is through Prisma types in actions |
| Progress bar shows 0% for new decisions with no data | None | Expected behavior — correctly reflects 0/5 stages complete |
| Tabs grid may overflow on small screens with 16 tabs | Low | Responsive grid adapts: `grid-cols-2 md:grid-cols-5 lg:grid-cols-16` |

---

## Recommended TASK-004

**Title:** Generic Simulation Engine + Type-Specific Adapters

**Goals:**
1. Create `src/lib/simulation/generic-simulation.ts` with configurable scoring dimensions
2. Create type-specific adapters (Tender adapter wraps existing `tender-simulation.ts`)
3. Update `src/actions/simulation.ts` to dispatch by DecisionType
4. Add Investment simulation adapter (NPV/IRR/payback scoring)
5. Non-tender decisions can now run simulation with type-appropriate scoring

**Why:** Currently only TENDER decisions can run simulation. INVESTMENT, STRATEGIC, and other types have no simulation capability. A generic engine with type adapters enables simulation for all decision types while preserving the existing Tender scoring logic.
