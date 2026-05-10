# AQLIYA OS Core v1 — Testing Checklist#

## 1. Full Decision Pipeline#

### Test Flow:
1. Create new decision (`/decisions/new`)
2. Complete Intake (objectives, alternatives, risks)
3. Verify **Intake tab** shows "accepted"
4. Complete Framework (context, purpose, criteria, values)
5. Verify **Framework tab** shows complete
6. Add 3+ **Scenarios** (best, expected, worst)
7. Add **Risk Analysis** for each scenario
8. Verify **Scenarios tab** shows complete
9. Verify **Risks tab** shows complete
10. Create **Recommendation** (requires all prior stages complete)
11. Verify **Recommendation tab** shows recommendation

### Gates to Verify:
- ❌ Without Intake → Framework blocked
- ❌ Without Framework → Scenarios blocked
- ❌ Without 3+ Scenarios → Risk Analysis blocked
- ❌ Without Risk Analysis → Recommendation blocked

---

## 2. Blocked Gates#

### A-1 Gates (`validateRecommendationGate`)
- [ ] **intake_not_accepted**: Block without completed intake
- [ ] **framework_incomplete**: Block without framework
- [ ] **scenarios_missing**: Block with < 3 scenarios
- [ ] **scenarios_incomplete**: Block without scenario details
- [ ] **risks_missing**: Block without risk analysis for all scenarios
- [ ] **risks_incomplete**: Block with incomplete risk analysis

### A-2 Gates (`validateIntelligenceGate`)
- [ ] **recommendation_not_complete**: Block without recommendation

### A-3 Gates (`validateIntelligenceLayerGate`, `validatePatternExtractionGate`)
- [ ] **decision_not_completed**: Block unless APPROVED/REJECTED
- [ ] **patterns_already_extracted**: Block re-extraction

---

## 3. A-2 Derived Outputs#

### Insight (`/decisions/[id]/insight`)
- [ ] Verify `generateStrategicInsight()` reads A-1 only
- [ ] Verify no DB writes (computed on-demand)
- [ ] Verify gate check (`validateIntelligenceGate`)

### What to Do (`/decisions/[id]/what-to-do`)
- [ ] Verify `generateWhatToDoNow()` reads A-1 only
- [ ] Verify no DB writes
- [ ] Verify gate check

### Overview (`/decisions/[id]/overview`)
- [ ] Verify `generateExecutiveOverview()` uses `Prisma.DecisionGetPayload` (no `any`)
- [ ] Verify gate check

---

## 4. Signals/Alerts Lifecycle#

### Signals (`/decisions/[id]/signals`)
- [ ] **NO Create button** (system-generated only)
- [ ] Verify `generatedBy: "system"` default
- [ ] Verify `source` + `referenceId` present (linked to A-1 entity)
- [ ] Test **Acknowledge** (updates `status` to `ACKNOWLEDGED`)

### Alerts (`/decisions/[id]/alerts`)
- [ ] Verify `triggeringSignalId` required (linked to signal)
- [ ] Verify `requiresReview: true` default
- [ ] Verify `isActive: false` for `SectorRule` (no auto-activate)
- [ ] Test **Acknowledge** (requires human)
- [ ] Test **Resolve** (requires human, `resolution` text, never auto)

---

## 5. Sector Assignment#

### Assign Sector (`/decisions/[id]/sector`)
- [ ] Select sector from dropdown (active sectors only)
- [ ] Verify `sectorId` saved to `Decision` model
- [ ] Verify sector change reflects in decision

### Sector List (`/intelligence/sectors`)
- [ ] Create new sector (name, code, description)
- [ ] Verify sector appears in list
- [ ] Click sector → view detail

### Sector Detail (`/intelligence/sectors/[id]`)
- [ ] Verify benchmarks listed (`SectorBenchmark`)
- [ ] Add benchmark (metric, value, unit, type, sourceType, confidence)
- [ ] Verify `sourceType` (manual/derived/assumption)
- [ ] Verify `confidence` field

---

## 6. Pattern Extraction#

### Extract Patterns (`/decisions/[id]/sector`)
- [ ] **Button visible ONLY if:**
  - Decision is APPROVED/REJECTED
  - Patterns not already extracted
- [ ] Click "Extract Patterns"
- [ ] Verify `DecisionPattern` created (metadata only)
  - `patternScope` (DECISION/SECTOR)
  - `confidence` (from `calculatePatternConfidence()`)
  - `extractedAt`
- [ ] Verify **NO JSON storage** in DB
- [ ] Verify analysis happens in `learning-engine.ts` (in memory)

### Sector Patterns (`/intelligence/sectors/[id]`)
- [ ] Verify `SectorPattern` listed
  - `occurrenceCount` (incremental)
  - `lastObservedAt` (updated on re-extraction)
  - `confidenceScore` (NOT static)
- [ ] Verify `updateSectorPattern()` increments count, updates time

---

## 7. Verification Commands#

Run after any changes:
```bash
npx tsc --noEmit
npm run build
npx eslint src/lib/decision/ src/actions/decision- src/app/"(dashboard)"/decisions/ src/app/"(dashboard)"/intelligence/
```

### Expected Results:
- ✅ `tsc --noEmit`: no output (0 errors)
- ✅ `npm run build`: "✓ Compiled successfully"
- ✅ ESLint: 0 errors (warnings allowed on unused vars in catch blocks)

---

## 8. Forbidden Actions (Verify Absent)#

- [ ] ❌ **NO** manual signal creation in UI
- [ ] ❌ **NO** auto-resolve alerts
- [ ] ❌ **NO** JSON pattern storage in DB
- [ ] ❌ **NO** `as any` in gates (`IntelligenceMissing` type used)
- [ ] ❌ **NO** modifying A-1/A-2 from A-3
- [ ] ❌ **NO** auto-trigger pattern extraction
- [ ] ❌ **NO** batch processing or background jobs

---

*Last updated: 2026-05-05*
