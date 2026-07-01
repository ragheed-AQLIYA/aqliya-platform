# Next Session Analysis — LocalContentOS Pipeline Unblock v1

**Date:** 2026-06-17  
**Purpose:** Analysis of what the next 1-2 agent sessions should focus on, sequenced for maximum impact.

---

## 1. High-Level Recommendation

**Session 1:** Engine Pipeline Activation — fix seed data, run all engines, validate outputs.  
**Session 2:** End-to-End Validation & Hardening — full demo flow, edge cases, documentation sync.

---

## 2. Session 1: Engine Pipeline Activation

### 2.1 Task Classification

| Field | Value |
|-------|-------|
| Task type | Product completion (LC) |
| Current level | L4 code, L2 demo experience |
| Target level | L4 code + L4 demo experience |
| Data impact | Seed data changes + engine execution |
| Route impact | None (routes already exist) |
| Governance impact | Add LcAiAuditEvent records |
| Docs impact | Update product status LC entry after validation |
| Validation plan | npx tsc --noEmit, npm test, data queries |
| Primary risk | Engine server actions may have unexpected dependencies |

### 2.2 Execution Plan

#### Step 1: Fix seed workbook values (~10 min)

**Changes in `prisma/seed-local-content.ts`:**

1. **SPN-01** → autoFillValue: `33_800_000` (sum of local supplier spend)
2. **SPN-02** → autoFillValue: `30_200_000` (sum of non-local/mixed supplier spend)
3. **SPN-03** → autoFilled: true (formula: SPN-01 + SPN-02)
4. **WRK-01** → manualValue: `425` (local talent)
5. **WRK-02** → manualValue: `500` (total headcount)
6. **WRK-03** → autoFilled: true (formula: WRK-01 / WRK-02 × 100)
7. **AST-01** → manualValue: `8_000_000` (local assets)
8. **INF-01, INF-02, INF-03** → manual values
9. **DEC-01, DEC-02, DEC-03** → manual/boolean values

**Verification:** workbook completion goes from 41% → 91%.

#### Step 2: Add engine triggers to seed (~15 min)

**Changes at end of `seed-local-content.ts`:**

1. Import and call `populateWorkbook(workbookId)` — ensures workbook lines are refreshed
2. Import and call `computeAndSaveLcScore(workbookId)` — recomputes score with all 4 metrics
3. Import and call `generateDataRequests(workbookId)` — creates data requests for remaining gaps
4. Import and call `generateRecommendations(workbookId)` — generates grounded recommendations
5. Import and call `runSimulation(workbookId, ...)` — creates simulation scenarios

**Risk area:** Server action signatures may need adjustment. The seed script runs in Node.js environment, so the server actions must be callable from CLI context (or we refactor to share domain services).

**Fallback:** If server actions can't be imported easily, use direct Prisma writes to simulate engine outputs (create recommendations, simulations, etc. directly). This is less "real" but makes the demo functional.

#### Step 3: Evaluate population engine for supplier-spend autofill (~15 min)

**Investigate:** Why the population engine didn't auto-fill SPN-01/02/03 even though the seed has 30 spend records.

1. Read `src/lib/local-content/workbook/population.ts`
2. Check `populateSupplierSpend` or equivalent function
3. Check if it looks up `LocalContentSpendRecord` by project ID
4. Fix if it has a bug or missing trigger

**Result:** Ensure population engine correctly auto-fills supplier spend from spend records.

#### Step 4: Seed memory records (~10 min)

**Add to seed:**

1. 1× `lcIndustryPatternMemory` record — "increase supplier localization" for technology industry
2. 1× `lcOrganizationMatchMemory` record — supplier localization pattern match history
3. 1× `lcPatternHealthRecord` — composite health score for the pattern

#### Step 5: Run and validate (~10 min)

**Commands:**

```bash
npx prisma db push      # if schema changed
npx ts-node prisma/seed-local-content.ts
npx tsc --noEmit
npm test                 # especially LC-specific tests
```

**Data queries to verify:**

```sql
SELECT COUNT(*) FROM lc_recommendation;       -- expect ≥5
SELECT COUNT(*) FROM lc_simulation_result;    -- expect ≥2
SELECT COUNT(*) FROM lc_ai_audit_event;       -- expect ≥1
SELECT COUNT(*) FROM lc_industry_pattern_memory; -- expect 1
SELECT COUNT(*) FROM lc_organization_match_memory; -- expect 1
```

### 2.3 Expected Outcome

| Metric | Before Session 1 | After Session 1 |
|--------|-----------------|-----------------|
| Workbook completion | 41% | 91% |
| Recommendations | 0 | ≥5 |
| Simulations | 0 | ≥2 |
| AI audit events | 0 | ≥1 |
| Pilot readiness | ~18% (Not Ready) | ~55% (Pilot Conditional) |
| Industry memory | 0 | 1 |
| Org match memory | 0 | 1 |

---

## 3. Session 2: End-to-End Validation & Hardening

### 3.1 Task Classification

| Field | Value |
|-------|-------|
| Task type | Product completion (LC) |
| Current level | L4 code + L4 demo (after session 1) |
| Target level | L4 verified |
| Data impact | None (no schema/schema changes) |
| Route impact | None |
| Governance impact | Verify audit trail for engine actions |
| docs impact | Update PRODUCT_STATUS_MATRIX.md, local content docs |
| Primary risk | Edge cases in demo flow |

### 3.2 Execution Plan

#### Step 1: Browser smoke test (~20 min)

Navigate through the entire LC workspace and verify:

1. `/local-content` — project list (verify the seed project shows)
2. `/local-content/workbook/[workbookId]` — verify:
   - All sections show filled values
   - SPN-01/02/03 show the computed values
   - Score shows 4 metrics, not just revenue
   - Missing data section shows data requests
3. `/local-content/pilot-readiness` — verify:
   - Overall score has improved
   - No RED metrics for workbook completion
   - AI health is GREEN
4. `/local-content/settings/integrations` — verify ERP connectors
5. Export flow — test workbook export

#### Step 2: Complete the governance chain (~15 min)

Verify the full lifecycle:

1. User creates data → audit event logged
2. User submits for review → review state changes
3. Reviewer approves → approval record created
4. Engine runs → AI audit event created
5. Report generated → export created

#### Step 3: Fix any discovered issues (~20 min)

Common issues to watch for:

- Recommendation display not showing (UI gap)
- Simulation controls not wired to backend
- Missing data request items not rendering
- Score not updating after population
- Export failing

#### Step 4: Documentation sync (~10 min)

Update:
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — add "Pipeline: ✅ Engine outputs verified"
- `docs/official/aqliya-roadmap-v1.1.md` — update LC V3.5 completion status
- Re-generate any route maps if routes changed

### 3.3 Expected Outcome

| Check | Expected |
|-------|----------|
| Browser smoke test | All routes render, data shows |
| Audit trail | ≥7 events covering all lifecycle stages |
| Export | At least one report exported |
| Score | Shows 4 metrics, total ≈69% |
| Pilot readiness | ≤3 RED, ≥3 GREEN |
| Documentation | Status matrix updated |

---

## 4. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Server actions not callable from seed script | Medium | High — can't trigger engines | Fall back to direct Prisma writes |
| Population engine has bug for supplier-spend | Medium | Medium — SPN lines stay empty | Manual fix in seed values |
| Recommendation engine requires pattern data | Medium | Medium — blank recommendations | Seed recommendations directly |
| Simulation engine requires scoring engine output | Low | Low — scoring runs first | Ensure dependency order |
| Test suite fails after seed changes | Low | Medium — seed changes may affect tests | Pin seed IDs in tests |
| Dashboard breaks with new data shape | Low | Medium — UI may not handle new scores | Browser smoke test |
| Schema mismatch with Prisma v7 | Low | Low — regenerate before run | `npx prisma generate` |

---

## 5. Files to Read Before Session 1

To execute efficiently:

1. `prisma/seed-local-content.ts` — Understand current seed structure
2. `src/lib/local-content/workbook/population.ts` — Understand population engine
3. `src/lib/local-content/workbook/scoring.ts` — Understand scoring formulas
4. `src/lib/local-content/workbook/recommendation-engine.ts` — Understand recommendation generation
5. `src/app/local-content/workbook/actions.ts` — Understand server action signatures

---

## 6. Decision Fork

### Option A: Minimal Demo Fix (30 min)
- Fix only seed workbook values (section 2.2 Step 1)
- No engine triggers
- Seed recommendations/simulations directly via Prisma
- **Risk:** Demo shows data but engines still never run. Next session must still trigger them.

### Option B: Full Pipeline Activation (65 min) ✅ **Recommended**
- Fix seed workbook values
- Call engine server actions from seed
- Seed memory records
- Validate outputs
- **Benefit:** All V3.5 features actually work. Demo is real. Pilot readiness improves.
- **Risk:** May hit server action import issues; fallback to Option A + add direct data.

**Decision:** Start with Option B. If server actions can't be imported from seed script, fall back to Option A + add the pipeline trigger script for later execution.
