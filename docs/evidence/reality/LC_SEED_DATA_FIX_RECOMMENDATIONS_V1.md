# LocalContentOS — Seed Data Fix Recommendations v1

**Date:** 2026-06-17  
**Purpose:** Concrete, actionable fixes to seed data to achieve ≥80% workbook completion and trigger all V3.5 engines.

---

## 1. Immediate Fixes (Seed Data Only)

These changes go in `prisma/seed-local-content.ts`.

### 1.1 Compute Supplier Spend Lines from Real Data

Current: SPN-01, SPN-02, SPN-03 are all `autoFilled: false, manualValue: null`.

**Fix:** Compute from the seed's own supplier/spend data:

| Line | Code | Section | Computed Value | Source |
|------|------|---------|---------------|--------|
| SPN-01 | supplier_spend | Local supplier spend | **33,800,000** | Sum of 6 local supplier spend records |
| SPN-02 | supplier_spend | Non-local supplier spend | **30,200,000** | Sum of 5 non-local + 1 mixed supplier spend |
| SPN-03 | supplier_spend | Total spend (formula) | **64,000,000** | SPN-01 + SPN-02 |

Set: `autoFilled: true, autoFillValue: <computed>`, remove the `autoFilled: false` override.

### 1.2 Fill Workforce Lines with Realistic Saudi Market Data

| Line | Code | Value | Notes |
|------|------|-------|-------|
| WRK-01 | Total local talent headcount | **425** | 500 total × 85% Saudization (realistic for Saudi market) |
| WRK-02 | Total headcount | **500** | Realistic mid-size Saudi enterprise |
| WRK-03 | Local talent % (formula) | **85%** | WRK-01 / WRK-02 × 100 |

Set: `autoFilled: true` for WRK-03 (formula), `manualValue` for WRK-01 and WRK-02.

### 1.3 Fill Asset Line

| Line | Code | Value | Notes |
|------|------|-------|-------|
| AST-01 | Total local asset value | **8,000,000** | Realistic value for a mid-size company (target is 15M) |

Result: Asset score = 8M / 15M = 53%.

### 1.4 Fill Company Info

| Line | Code | Value | Notes |
|------|------|-------|-------|
| INF-01 | Company name AR | **شركة الابتكار التقني** | Already exists as project name |
| INF-02 | CR number | **1010789012** | Realistic CR |
| INF-03 | City / Region | **الرياض** | Saudi capital |

### 1.5 Fill Declarations

| Line | Code | Value | Notes |
|------|------|-------|-------|
| DEC-01 | Declaration signed | **true** | Boolean |
| DEC-02 | Declaration date | **2025-06-01** | Realistic date |
| DEC-03 | Declaration by | **الرئيس التنفيذي** | CEO title |

### 1.6 Result After Fixes

| Metric | Before | After |
|--------|--------|-------|
| Revenue score | 79% | 79% |
| Supplier score | NULL | **53%** (33.8M/64M) |
| Workforce score | NULL | **85%** (425/500) |
| Asset score | NULL | **53%** (8M/15M) |
| **Overall score** | 79% (misleading) | **~69%** (weighted) |
| Workbook completion | 41% | **91%** (20/22 lines) |
| Data requests needed | 13 items | **~2 items** (confirmations only) |

---

## 2. Engine Trigger Fixes

### 2.1 Create Post-Seed Trigger Script

Create `scripts/trigger-lc-pipeline.ts` that runs after seeding:

```typescript
// Pseudocode — actual implementation depends on server action signatures
async function triggerPipeline(organizationId: string, workbookId: string) {
  // 1. Re-populate workbook (fills SPN from supplier data)
  await populateWorkbook(workbookId);
  
  // 2. Re-compute score (now with supplier + workforce + asset data)
  await computeAndSaveLcScore(workbookId);
  
  // 3. Generate data requests for remaining gaps
  await generateDataRequests(workbookId);
  
  // 4. Generate recommendations (now has enough data)
  await generateRecommendations(workbookId);
  
  // 5. Run simulations
  await runSimulation(workbookId, { scenarioType: 'supplier', ... });
  await runSimulation(workbookId, { scenarioType: 'mixed', ... });
  
  // 6. Seed memory tables
  await seedIndustryPatternMemory(organizationId);
  await seedOrganizationMatchMemory(organizationId);
  
  // 7. Run pattern suggestion
  await suggestPatterns(organizationId, workbookId);
  
  // 8. Trigger AI review (creates LcAiAuditEvent)
  await runGovernedProductAI({ ... });
}
```

### 2.2 Add Engine Invocation to End of `seed-local-content.ts`

Add at the bottom of the main seed function:

```typescript
// After all seed data is created...
console.log("Triggering engines...");
await populateWorkbook(workbook.id);
await computeAndSaveLcScore(workbook.id);
await generateRecommendations(workbook.id);
console.log("Engines complete.");
```

This is the simpler approach — runs the engines directly from the seed script.

### 2.3 Seed Memory Records Directly

Add at least one record each to:

```typescript
await prisma.lcIndustryPatternMemory.create({
  data: {
    organizationId: orgId,
    industry: "technology",
    workbookLineCode: "SPN-01",
    suggestedPattern: "increase supplier localization",
    averageConfidence: 85,
    totalApplications: 5,
    totalAccepted: 4,
    lastAppliedAt: new Date(),
  },
});

await prisma.lcOrganizationMatchMemory.create({
  data: {
    organizationId: orgId,
    workbookLineCode: "SPN-01",
    currentPattern: "non-local supplier dependency",
    matchCount: 5,
    truePositiveRate: 0.8,
    falsePositiveRate: 0.1,
    lastMatchAt: new Date(),
  },
});
```

---

## 3. Post-Fix Validation Checks

| Check | Expected | Command |
|-------|----------|---------|
| Workbook lines filled | 20/22 (91%) | `SELECT count(*) FROM lc_workbook_line WHERE auto_filled=true OR manual_value IS NOT NULL` |
| Recommendations | ≥5 | `SELECT count(*) FROM lc_recommendation` |
| Simulations | ≥2 | `SELECT count(*) FROM lc_simulation_result` |
| Data requests | ≥1 | `SELECT count(*) FROM lc_data_request` |
| AI audit events | ≥1 | `SELECT count(*) FROM lc_ai_audit_event` |
| Industry memory | ≥1 | `SELECT count(*) FROM lc_industry_pattern_memory` |
| Org match memory | ≥1 | `SELECT count(*) FROM lc_organization_match_memory` |
| Pattern health records | ≥1 | `SELECT count(*) FROM lc_pattern_health_record` |
| Pilot readiness | ≤3 RED | Run `getPilotReadiness()` |
| Workflow gating | All pass | Run workflow-gating tests |

---

## 4. Effort Estimate

| Change | Lines Changed | Risk | Time |
|--------|--------------|------|------|
| Fill workbook seed lines | ~30 lines in `seed-local-content.ts` | Low | 10 min |
| Add engine triggers to seed | ~20 lines, new imports | Medium — need server action signatures | 15 min |
| Seed memory records | ~30 lines | Low | 10 min |
| Create pipeline trigger script | ~60 lines | Medium — needs correct API calls | 20 min |
| Validation | Run all queries | Low | 10 min |
| **Total** | | | **~65 min** |

**Simplified path:** Only fix the seed data (section 1) and add direct Prisma calls for recommendations/memories (section 2.3) → **~30 min**. This doesn't trigger the actual engines but makes the demo look populated.

**Full path:** Fix seed + add engine calls + run validation → **~65 min**. All engines actually run.

---

## 5. Files to Modify

| File | Change |
|------|--------|
| `prisma/seed-local-content.ts` | Fix SPN/WRK/AST/INF/DEC line values, add engine triggers, add memory seeds |
| `scripts/trigger-lc-pipeline.ts` | NEW — standalone pipeline trigger script |
| `src/app/local-content/workbook/actions.ts` | (Read only) — verify server action signatures for the trigger script |
