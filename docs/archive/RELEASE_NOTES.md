# AQLIYA OS Core v1 — Release Notes#

## Release Date
2026-05-05

## Overview
AQLIYA OS Core v1 is the first stable release of the decision intelligence system. It implements a strict 3-layer architecture with gated progression, system-generated monitoring, and a learning engine for pattern extraction.

---

## What's Included#

### A-1: Decision System ✅
- **Intake:** Objective, alternative, risk, assumption capture with acceptance gate
- **Framework:** Context, purpose, criteria, values with completeness validation
- **Scenarios:** Best/expected/worst case with 3+ scenario requirement
- **Risk Analysis:** Per-scenario risk analysis (risks, tradeoffs, uncertainty)
- **Recommendation:** Gated final output requiring all prior stages complete
- **Gates:** `validateRecommendationGate()` blocks progression if stages incomplete
- **UI Tabs:** Overview, Intake, Framework, Scenarios, Risks, Recommendation

### A-2: Intelligence Outputs ✅
- **Insight:** `generateStrategicInsight()` — reads A-1 only, computed on-demand
- **What to Do:** `generateWhatToDoNow()` — reads A-1 only, no DB writes
- **Overview:** `generateExecutiveOverview()` — uses `Prisma.DecisionGetPayload` (no `any`)
- **Signals:** `DecisionMonitoringSignal` — system-generated only, `source` + `referenceId` required
- **Alerts:** `DecisionRiskAlert` — requires human review, `triggeringSignalId`, never auto-resolve
- **Gates:** `validateIntelligenceGate()` requires A-1 gate + recommendation complete
- **UI Tabs:** Insight, What to Do, Overview, Signals, Alerts

### A-3: Sector + Learning ✅
- **Sector Management:** `Sector` model, assignment to decisions via `sectorId`
- **Benchmarks:** `SectorBenchmark` with `sourceType` (manual/derived/assumption) + `confidence`
- **Learning Engine:** `learning-engine.ts` contains ALL pattern analysis logic (in memory)
- **Pattern Extraction:** `extractPatternsFromDecision()` — manual trigger only, completed decisions only
- **Incremental Updates:** `SectorPattern` with `occurrenceCount`, `lastObservedAt`, `confidenceScore`
- **Metadata Only:** `DecisionPattern` stores metadata only (no JSON storage)
- **Gates:** `validatePatternExtractionGate()` — requires APPROVED/REJECTED + no re-extraction
- **UI:** Sector list, sector detail with patterns, decision-level "Extract Patterns" button

---

## Architecture Rules Enforced#

1. ✅ **Layered flow:** A-1 → A-2 → A-3 (no reverse writes)
2. ✅ **Signals:** System-generated only (`generatedBy: "system"`), no manual creation
3. ✅ **Alerts:** Require human review (`requiresReview: true`), never auto-resolve
4. ✅ **Patterns:** Analysis in `learning-engine.ts` (memory), metadata only in DB
5. ✅ **No autonomous actions:** Manual triggers only, no background jobs
6. ✅ **Gates:** All layers gated, explicit missing reasons (no `as any`)

---

## Verification Results#

- ✅ `npx tsc --noEmit` — passed (0 errors)
- ✅ `npm run build` — passed (✓ Compiled successfully)
- ✅ ESLint — 0 errors on all changed files

---

## File Summary#

### New/Modified Files:
- `prisma/schema.prisma` — Added Sector, SectorBenchmark, SectorPattern, DecisionPattern models
- `src/lib/decision/gate.ts` — A-1 gate
- `src/lib/decision/intelligence-gate.ts` — A-2 & A-3 gates (no `as any`)
- `src/lib/decision/intake.ts`, `framework.ts`, `scenarios.ts`, `risk-analysis.ts`, `recommendation.ts` — A-1
- `src/lib/decision/insight.ts`, `what-to-do.ts`, `overview.ts` — A-2 (read-only)
- `src/lib/decision/signals-alerts.ts` — A-2 (acknowledge/resolve only)
- `src/lib/decision/sector.ts`, `sector-benchmark.ts` — A-3 Phase 1
- `src/lib/decision/decision-pattern.ts`, `sector-pattern.ts`, `learning-engine.ts` — A-3 Phase 2
- `src/actions/decision-*.ts` — All server actions
- `src/app/(dashboard)/decisions/[id]/*` — Decision-level UI
- `src/app/(dashboard)/intelligence/sectors/*` — Sector UI
- `src/components/decisions/decision-tabs.tsx` — Updated tabs

### Documentation:
- ✅ `SYSTEM_STATUS.md` — Completed layers status
- ✅ `ARCHITECTURE.md` — Layer responsibilities, gates, forbidden actions
- ✅ `TESTING_CHECKLIST.md` — Manual test flows
- ✅ `RELEASE_NOTES.md` — This file

---

## Upgrade Notes#

- **No breaking changes:** First release
- **Database:** Run `npx prisma db push` to apply new models
- **Dependencies:** `date-fns`, `@radix-ui/react-dialog` added for UI
- **Warnings:** Multiple lockfiles detected (ignore or set `turbopack.root`)

---

## Controlled Production Use#

This release is ready for:
- ✅ Internal testing with real decision data
- ✅ Pilot programs with controlled user groups
- ✅ Sector intelligence bootstrapping (manual benchmark entry)

**Not for:**
- ❌ Full external client deployment (see `KNOWN_LIMITATIONS.md`)
- ❌ Autonomous agent operation (A-5 not implemented)

---

*Released: 2026-05-05*
