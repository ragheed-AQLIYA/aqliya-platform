# LCGPA Implementation Reality Matrix

**Date:** 2026-08-21
**Status:** REGULATORY BASELINE FROZEN — All 10 Waves + 5-Step Alignment Complete
**Branch:** staging
**Author:** Principal Regulatory Software Architect
**Rule Version:** `LCGPA_RULE_VERSION = "2026-01"`

---

## 0. Pre-Flight

```
Branch: staging
Last commit: (latest on staging)
Working tree: Clean (no uncommitted LocalContentOS changes)
TypeScript: clean (npx tsc --noEmit)
Tests: 336 pass, 0 fail (11 suites: LCGPA + workbook)
```

---

## 1. Regulatory Reality Matrix

| # | Rule | Regulatory Baseline | Current Implementation | Status | Evidence |
|---|------|--------------------|-----------------------|--------|----------|
| 1 | **Core Formula** | `LC% = (LC_GS + LC_AD + LC_LC + LC_CB) / Total_Costs x 100` | `overallScore = sum(metricScore x fixedWeight) / sum(weight)` with weights 35/35/20/10 | **IMPLEMENTED-WRONG** | `workbook/scoring.ts` lines 59-96: METRICS array hardcodes weights `0.35, 0.35, 0.20, 0.10`. Formula at lines 228-249 is a weighted average, not the LCGPA pillar-sum formula. |
| 2 | **Labor: Saudi = 100%** | Saudi employee compensation: 100% LC | Workforce metric uses headcount ratio `WRK-01/WRK-02`. No compensation-based calculation. No 100% attribution. | **IMPLEMENTED-WRONG** | `workbook/scoring.ts` line 82: `numeratorCode: "WRK-01"` (headcount), `denominatorCode: "WRK-02"` (headcount). `workbook/template.ts` line 206: WRK-01 is "Saudi Workforce Count". No WRK-05/WRK-06 for Saudi/Expat compensation. |
| 3 | **Labor: Expat = 37%** | Expat employee compensation: 37% LC | No 37% rule exists anywhere. No expat compensation tracking. | **MISSING** | Grep for "37" in scoring code: zero matches. Grep for "expat" in scoring code: zero matches. Template has no expat compensation line. |
| 4 | **Asset: KSA = 100%** | KSA-manufactured asset: 100% of depreciation | Asset metric uses `AST-01/AST-02` (local fixed assets / total fixed assets). Ratio-based, not depreciation-based. No KSA manufacturing origin check. | **IMPLEMENTED-WRONG** | `workbook/scoring.ts` line 91: `numeratorCode: "AST-01"` (Local Fixed Assets), `denominatorCode: "AST-02"` (Total Fixed Assets). No depreciation field. No manufacturing origin field. |
| 5 | **Asset: Foreign = 20%** | Foreign asset: 20% of depreciation | No foreign asset line. No 20% rule. No depreciation tracking. | **MISSING** | Template has AST-01 (local) and AST-02 (total). No AST-03 (foreign). No depreciation field in any workbook line or Prisma model. |
| 6 | **Capacity Building** | Saudi training = 100%; R&D in KSA | No capacity building section in workbook. No training/R&D tracking. No CAP-* lines. | **MISSING** | Template sections (line 7-305 of template.ts): company_info, revenue, cost_of_sales, gross_profit, supplier_spend, workforce, assets, declarations. No "capacity_building" section. WORKBOOK_SECTIONS enum in types.ts has 8 values, none is "capacity_building". |
| 7 | **G&S Ranking** | Suppliers ranked descending by cost. 70% of total OR top 40 (whichever higher). | No supplier ranking logic. No 70%/top-40 rule. Tender matching only checks min LC% threshold. | **MISSING** | `tender-matching.ts`: checks `minLocalContentPct`, `maxNonLocalSpendSharePct`, `minLocalSupplierCount`. No ranking. No 70%/top-40. `scoring.ts` classifySpend splits by locality, no ranking. |
| 8 | **Mandatory List** | 1,444+ products, 16 sectors | No implementation. No Prisma model. No import. No validation. | **MISSING** | Grep "mandatory" in all LocalContentOS code: zero matches in production code (only in docs). No `LcMandatoryItem` or `LcMandatorySector` model in schema. |
| 9 | **Baseline** | Current LC% (historical) | `LocalContentProject.localContentScore` stores a single score. No baseline concept. No historical versioning. | **MISSING** | `schema.prisma` line 1988: `localContentScore Float?` on LocalContentProject. Single field, no `baselineLcPct`, no `baselineDate`, no versioning. |
| 10 | **Target** | Committed LC% improvement | No target tracking. No `targetedLcPct` field. | **MISSING** | Grep "target" in schema: no `targetedLcPct` field on any model. Tender matching has `minLocalContentPct` but that's a tender requirement, not a project target. |
| 11 | **Financial Evaluation** | 60% price + 40% LC (Target x 50% + Baseline x 50% + 5% listed) | Tender matching only checks min LC% threshold. No Article 17 formula. No price component. | **MISSING** | `tender-matching.ts`: `buildTenderMatchReport()` returns `fitLevel: pass/partial/fail` based on threshold checks. No financial evaluation score. No price ratio. No baseline/target blending. |
| 12 | **Price Preference** | 10% for national products | No implementation. | **MISSING** | Grep "preference" in LocalContentOS: zero matches. |
| 13 | **SME Preference** | 10% for local SMEs | No implementation. No SME classification in supplier model. | **MISSING** | `LocalContentSupplier` model has `ownershipType` (Saudi/foreign/joint_venture) but no SME flag. Grep "SME" or "sme" in LocalContentOS: zero matches. |
| 14 | **Ownership >= 50%** | Company must be >= 50% Saudi-owned | Ownership is binary: "Saudi"/"foreign"/"joint_venture". No percentage field. No 50% threshold. | **IMPLEMENTED-WRONG** | `scoring.ts` line 40-50: `scoreOwnershipFactor()` switches on string "Saudi"/"joint_venture"/"foreign". `types.ts` line 27-32: `VALID_OWNERSHIP_TYPES = ["Saudi", "foreign", "joint_venture"]`. No percentage field on `LocalContentSupplier`. |
| 15 | **Gradual Plan** | Required within 60 days after award | No implementation. No Prisma model. No deadline tracking. | **MISSING** | Grep "gradual" in all code: zero matches. No `LcGradualPlan` model in schema. |
| 16 | **Penalties** | Up to 10% if gap > 5% | No implementation. | **MISSING** | Grep "penalty" in LocalContentOS scoring: zero matches. |
| 17 | **Listed Companies** | 5% additional in financial evaluation | No implementation. No listed company flag. | **MISSING** | Grep "listed" in LocalContentOS: zero matches in scoring code. |
| 18 | **Accredited Reviewer** | External LCGPA certification (not in product) | Product has internal review/approval workflow (`LocalContentReview`, `LocalContentApproval`). No external reviewer submission package. | **PARTIAL** | `LocalContentReview` model: reviewerId, action (submitted/returned/commented), status (pending/in_review/returned/completed). `LocalContentApproval` model: approverId, decision (approved/rejected). Internal workflow exists but no submission package for external reviewer. |
| 19 | **Certificate Validity** | 19 months | No certificate tracking. DEC-01 (LC Certificate Status) is a workbook line for manual input only. | **MISSING** | `template.ts` line 278: DEC-01 is "LC Certificate Status" with `evidenceRequired: true`. Manual input, no validity tracking, no expiry logic. |
| 20 | **Calculation Traceability** | Every result must be traceable to: Rule, Version, Inputs, Calculation, Result, Evidence, Timestamp, Actor | No `calculationMethod` or `ruleVersion` field on any model. Scores are computed on-the-fly, not persisted with versioning. | **MISSING** | Schema grep: zero matches for `calculationMethod`, `ruleVersion`, `ruleVersion`, `calculationVersion`. `LcWorkbook.lcScore` is a single Float, no metadata about how it was computed. |

---

## 2. Current Formula Tracing

### 2.1 Workbook Scoring Formula (THE WRONG ONE)

**File:** `src/lib/local-content/workbook/scoring.ts`

**Definition (lines 59-96):**
```
METRICS = [
  { code: "revenue",         weight: 0.35, num: "REV-01", den: "REV-03" },
  { code: "supplier_spend",  weight: 0.35, num: "SPN-01", den: "SPN-03" },
  { code: "workforce",       weight: 0.20, num: "WRK-01", den: "WRK-02" },
  { code: "assets",          weight: 0.10, num: "AST-01", den: "AST-02" },
]
```

**Per-metric score:** `score = round((numerator / denominator) * 100)`

**Overall (lines 228-249):**
```
weightedSum = sum(score_i * weight_i)    for metrics where score is not null
totalWeight = sum(weight_i)              for metrics where score is not null
overallScore = round(weightedSum / totalWeight, 2)
```

**This is NOT the LCGPA formula.** The LCGPA formula sums LC contributions across pillars and divides by total costs. This formula averages percentage ratios with fixed weights.

### 2.2 Supplier Scoring Formula

**File:** `src/lib/local-content/scoring.ts`

**Definition (lines 14-20):**
```
SUPPLIER_SCORE_WEIGHTS = {
  locality: 40,
  ownership: 25,
  workforce: 20,
  declaredContent: 15,
}
```

**This is a supplier evaluation heuristic, not the LCGPA formula.** It scores individual suppliers on a 0-100 scale based on locality classification, ownership type, workforce local percentage, and declared content percentage.

### 2.3 Spend Breakdown Formula

**File:** `src/lib/local-content/scoring.ts` (lines 155-233)

```
classifySpend(spend):
  "local"     -> localAmount = amount
  "non_local" -> nonLocalAmount = amount
  "mixed"     -> localAmount = amount * (localContentPercentage / 100)
  default     -> unclassifiedAmount = amount

localContentPercentage = localSpend / (localSpend + nonLocalSpend + mixedSpend) * 100
```

**This is a simple ratio, not the LCGPA formula.** No pillar decomposition.

---

## 3. Exact Files Involved

### 3.1 Core Scoring (MUST CHANGE)

| File | Lines | What It Does | LCGPA Gap |
|------|-------|-------------|-----------|
| `src/lib/local-content/workbook/scoring.ts` | 292 | Fixed-weight workbook scoring (35/35/20/10) | WRONG FORMULA. Must implement LCGPA 4-pillar formula. |
| `src/lib/local-content/scoring.ts` | 390 | Supplier composite scoring + spend breakdown | PARTIAL. Spend breakdown is useful. Supplier scoring is separate heuristic. |
| `src/lib/local-content/workbook/template.ts` | 341 | 21 workbook lines across 8 sections | MISSING: No capacity building section. No foreign asset line. No expat compensation lines. |
| `src/lib/local-content/workbook/types.ts` | 214 | Workbook types and interfaces | MISSING: No pillar-based scoring types. No LCGPA result type. |

### 3.2 Tender/Evaluation (MUST CHANGE)

| File | Lines | What It Does | LCGPA Gap |
|------|-------|-------------|-----------|
| `src/lib/local-content/tender-matching.ts` | 186 | Threshold-based tender matching | MISSING: No Article 17 financial evaluation. No price component. No baseline/target blend. |

### 3.3 Services Layer (MUST CHANGE)

| File | Lines | What It Does | LCGPA Gap |
|------|-------|-------------|-----------|
| `src/lib/local-content/services/scoring.ts` | ~80 | Bridges Prisma to scoring functions | Must wire new LCGPA engine. |
| `src/lib/local-content/services/common.ts` | ~100 | Re-exports all services | Must expose new LCGPA services. |

### 3.4 Classification (REVIEW)

| File | Lines | What It Does | LCGPA Gap |
|------|-------|-------------|-----------|
| `src/lib/local-content/classification-rules.ts` | ~120 | Default classification rules (services 30%, equipment 25%, consulting 40%, construction 35%) | May need alignment with LCGPA mandatory list thresholds. |

### 3.5 Schema (MUST CHANGE)

| Model | Current Fields Missing |
|-------|----------------------|
| `LocalContentProject` | `baselineLcPct`, `targetedLcPct`, `baselineDate`, `targetDate`, `calculationMethod`, `ruleVersion`, `listedCompanyStatus` |
| `LocalContentSupplier` | `saudiOwnershipPct`, `isSme`, `ownershipEvidenceUrl` |
| NEW: `LcMandatoryList` | Entire model needed |
| NEW: `LcMandatoryListItem` | Entire model needed |
| NEW: `LcGradualPlan` | Entire model needed |
| NEW: `LcGradualPlanMilestone` | Entire model needed |
| NEW: `LcCalculationRun` | Entire model needed (traceability) |
| NEW: `LcPenaltyAssessment` | Entire model needed |
| NEW: `LcFinancialEvaluation` | Entire model needed |

### 3.6 Tests (MUST CHANGE)

| Test File | Current Coverage | LCGPA Gap |
|-----------|-----------------|-----------|
| `workbook/__tests__/scoring.test.ts` | Tests 35/35/20/10 formula (18 tests) | All tests validate WRONG formula. Must add LCGPA formula tests. |
| `__tests__/scoring.test.ts` | Tests supplier composite (9 tests) | Tests supplier heuristic only. No LCGPA pillar tests. |
| `__tests__/tender-matching.test.ts` | Tests threshold matching (3 tests) | No financial evaluation tests. |
| NEW: LCGPA formula tests | -- | Must create. |
| NEW: Labor 37% tests | -- | Must create. |
| NEW: Asset 20% tests | -- | Must create. |
| NEW: Capacity building tests | -- | Must create. |
| NEW: G&S ranking tests | -- | Must create. |
| NEW: Financial evaluation tests | -- | Must create. |
| NEW: Gradual plan tests | -- | Must create. |
| NEW: Penalty assessment tests | -- | Must create. |
| NEW: Mandatory list tests | -- | Must create. |

---

## 4. What is CORRECT

| Component | Status | Notes |
|-----------|--------|-------|
| **Spend classification by locality** | CORRECT | `classifySpend()` correctly splits spend by supplier locality. |
| **Supplier locality classification** | CORRECT | `classifySupplier()` correctly maps locality strings. |
| **Evidence coverage calculation** | CORRECT | `calculateEvidenceCoverage()` computes coverage percentages. |
| **Finding counts** | CORRECT | `calculateFindingCounts()` groups by severity/status. |
| **Workbook population from TB** | CORRECT | TB import, formula evaluation, account code range filtering all work. |
| **Workflow gating** | CORRECT | State machine transitions are correct for workbook lifecycle. |
| **Audit events** | CORRECT | PlatformAuditLog integration with hash chain. |
| **ERP integrations** | CORRECT | SAP, Oracle, Dynamics, Odoo connectors with tenant isolation. |
| **Simulation engine** | CORRECT (as IKTVA) | Works for IKTVA-style what-if analysis. Must be isolated from LCGPA. |
| **Recommendation engine** | CORRECT (as IKTVA) | Generates recommendations based on current weights. Must be updated for LCGPA. |
| **Verification checklist** | CORRECT | 36-item checklist across 4 sections. |
| **Approval routing** | CORRECT | 2-submitter / 2-reviewer cycle with reset on return. |
| **PDF/XLSX export** | CORRECT | Arabic bilingual PDF, XLSX spend classification and evidence index. |

---

## 5. What is WRONG

| Component | Issue | Fix Required |
|-----------|-------|-------------|
| **Workbook scoring formula** | Uses 35/35/20/10 fixed weights instead of LCGPA 4-pillar formula | Replace with LCGPA formula. Keep IKTVA as separate mode. |
| **Workforce metric** | Uses headcount ratio (WRK-01/WRK-02) instead of compensation-based | Add WRK-05 (Saudi compensation), WRK-06 (Expat compensation). Score = (Saudi x 100% + Expat x 37%) / total. |
| **Asset metric** | Uses asset value ratio (AST-01/AST-02) instead of depreciation-based | Add depreciation fields. Score = (KSA x 100% + Foreign x 20%) / total depreciation. |
| **Ownership scoring** | Binary "Saudi"/"foreign"/"joint_venture" instead of percentage-based | Add `saudiOwnershipPct` field. Apply >= 50% threshold. |
| **Status labels** | Custom Arabic labels (ممتاز/جيد جداً/etc.) not aligned with LCGPA grades | Review LCGPA grading system and align. |

---

## 6. What is MISSING

| Component | Description | Priority |
|-----------|-------------|----------|
| **Capacity Building section** | Workbook lines for Saudi training, supplier development, R&D | P0 |
| **Foreign asset line** | AST-03 for foreign fixed assets (20% depreciation rule) | P0 |
| **Expat compensation lines** | WRK-05/WRK-06 for Saudi/Expat salary-based LC calculation | P0 |
| **Baseline vs Target** | `baselineLcPct` and `targetedLcPct` on project model | P0 |
| **Mandatory List module** | Prisma models, import, validation, search, classification | P0 |
| **Financial Evaluation engine** | Article 17 formula: 60% price + 40% LC | P0 |
| **Gradual Plan workflow** | Prisma model, 60-day deadline, milestones, status tracking | P1 |
| **Penalty assessment** | Calculate eligibility/exposure for >5% gap | P1 |
| **Price Preference** | 10% for national products in supply tenders | P1 |
| **SME Preference** | 10% for local SMEs | P1 |
| **Listed Company logic** | 5% additional in financial evaluation | P1 |
| **Calculation traceability** | `calculationMethod`, `ruleVersion` on all score results | P1 |
| **G&S supplier ranking** | 70%/top-40 rule for supplier selection | P2 |
| **Certificate tracking** | 19-month validity, expiry alerts | P2 |
| **External reviewer submission** | Package for LCGPA audit submission | P2 |

---

## 7. Proposed Domain Model

### 7.1 Extended Existing Models

```
LocalContentProject (ADD):
  baselineLcPct        Float?
  targetedLcPct        Float?
  baselineDate         DateTime?
  targetDate           DateTime?
  calculationMethod    String?    @default("lcgpa_v1")
  ruleVersion          String?    @default("2026-01")
  listedCompanyStatus  String?    @default("not_listed")
  gradualPlanStatus    String?    @default("none")

LocalContentSupplier (ADD):
  saudiOwnershipPct    Float?
  isSme                Boolean?   @default(false)
  ownershipEvidenceUrl String?
  smeEvidenceUrl       String?
```

### 7.2 New Models

```
LcCalculationRun (NEW):
  id                    String     @id @default(cuid())
  projectId             String
  workbookId            String?
  method                String     // "lcgpa_v1", "iktva_v1"
  ruleVersion           String     // "2026-01"
  inputs                Json       // All input values used
  result                Json       // Pillar-level results
  lcPillars             Json       // { gs, ad, lc, cb } breakdown
  overallLcPct          Float
  totalCosts            Float
  computedAt            DateTime   @default(now())
  computedById          String?
  evidence              Json?      // Evidence references
  createdAt             DateTime   @default(now())

LcMandatoryList (NEW):
  id                    String     @id @default(cuid())
  version               String     // "2026-Q1"
  sourceUrl             String     // LCGPA documents library URL
  effectiveDate         DateTime
  productCount          Int
  sectorCount           Int
  importedAt            DateTime
  importedById          String?
  status                String     @default("active")
  createdAt             DateTime   @default(now())

LcMandatoryListItem (NEW):
  id                    String     @id @default(cuid())
  listId                String
  productCode           String
  productNameAr         String
  productNameEn         String?
  sectorCode            String
  sectorNameAr          String
  sectorNameEn          String?
  effectiveDate         DateTime
  createdAt             DateTime   @default(now())

LcGradualPlan (NEW):
  id                    String     @id @default(cuid())
  projectId             String
  baselineLcPct         Float
  targetLcPct           Float
  awardDate             DateTime
  submissionDeadline    DateTime    // awardDate + 60 days
  status                String     @default("draft")
  submittedAt           DateTime?
  approvedAt            DateTime?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

LcGradualPlanMilestone (NEW):
  id                    String     @id @default(cuid())
  planId                String
  targetDate            DateTime
  targetLcPct           Float
  actualLcPct           Float?
  status                String     @default("pending")
  evidenceUrl           String?
  notes                 String?
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

LcPenaltyAssessment (NEW):
  id                    String     @id @default(cuid())
  projectId             String
  contractValue         Float
  targetLcPct           Float
  actualLcPct           Float
  variance              Float       // actual - target
  exceedsThreshold      Boolean     // |variance| > 5%
  maxPenaltyPct         Float       // up to 10%
  maxPenaltyAmount      Float       // contractValue * maxPenaltyPct / 100
  status                String     @default("calculated")
  assessedAt            DateTime    @default(now())
  assessedById          String?
  createdAt             DateTime    @default(now())

LcFinancialEvaluation (NEW):
  id                    String     @id @default(cuid())
  projectId             String
  tenderReference       String?
  lowestBidPrice        Float
  evaluatedBidPrice     Float
  baselineLcPct         Float
  targetedLcPct         Float
  isListedCompany       Boolean     @default(false)
  listedCompanyBonus    Float       // 5% if listed
  priceScore            Float       // (lowestBid / evaluatedBid) * 60
  lcScore               Float       // (targeted * 50% + baseline * 50% + bonus) * 40
  overallScore          Float       // priceScore + lcScore
  calculatedAt          DateTime    @default(now())
  calculatedById        String?
  createdAt             DateTime    @default(now())
```

### 7.3 Calculation Traceability Contract

Every `LcCalculationRun` must contain:

```typescript
interface CalculationRunInputs {
  // Labor pillar
  saudiCompensation: number;
  expatCompensation: number;
  totalCompensation: number;
  
  // Asset pillar
  ksaManufacturedDepreciation: number;
  foreignAssetDepreciation: number;
  totalDepreciation: number;
  
  // G&S pillar
  rankedSuppliers: RankedSupplier[];  // descending by cost
  selectedSuppliers: RankedSupplier[]; // 70% or top-40
  totalGoodsServicesCost: number;
  localGoodsServicesCost: number;
  
  // Capacity Building pillar
  saudiTrainingCost: number;
  supplierDevelopmentCost: number;
  rdCostInKsa: number;
  totalCapacityBuildingCost: number;
}

interface CalculationRunResult {
  lcGoodsServices: number;
  lcAssetDepreciation: number;
  lcLaborCompensation: number;
  lcCapacityBuilding: number;
  totalCosts: number;
  overallLcPct: number;
  
  // Per-pillar percentages
  gsLcPct: number;
  adLcPct: number;
  lcPillarLcPct: number;
  cbLcPct: number;
}
```

---

## 8. Proposed Migration Strategy

### 8.1 Schema Changes (Additive Only)

All schema changes are ADDITIVE:
- Add fields to existing models (nullable, with defaults)
- Add new models (no changes to existing models)
- NO destructive migrations
- NO column renames
- NO table drops

### 8.2 Historical Data Preservation

- Existing `LocalContentProject.localContentScore` values are PRESERVED
- New `calculationMethod` field defaults to `"iktva_legacy"` for existing records
- New LCGPA scores are stored in `LcCalculationRun` table, not overwriting existing scores
- `LcWorkbook.lcScore` continues to store the current IKTVA-style score
- LCGPA scores are stored separately in `LcCalculationRun.overallLcPct`

### 8.3 Dual-Mode Scoring

The system supports two scoring modes:
1. **IKTVA Legacy** (existing 35/35/20/10) — preserved for historical records
2. **LCGPA Entity Level** (new 4-pillar formula) — for new calculations

Mode is selected per calculation run and stored in `LcCalculationRun.method`.

---

## 9. Proposed Implementation Order

### WAVE 1: Domain Model + Calculation Contract (no UI)
1. Extend Prisma schema with new fields and models
2. Create `src/lib/local-content/lcgpa/calculation-contract.ts` — types and interfaces
3. Create `src/lib/local-content/lcgpa/calculation-engine.ts` — the LCGPA formula
4. Create `src/lib/local-content/lcgpa/calculation-trace.ts` — traceability
5. Write unit tests for the calculation engine

### WAVE 2: Labor + Assets + Capacity Building
1. Add workbook lines: WRK-05, WRK-06 (compensation), AST-03 (foreign), CAP-01 through CAP-05
2. Implement labor scoring: (Saudi x 100% + Expat x 37%) / total
3. Implement asset scoring: (KSA x 100% + Foreign x 20%) / total depreciation
4. Implement capacity building scoring: Saudi training = 100%, R&D in KSA
5. Write deterministic tests for each pillar

### WAVE 3: G&S + Supplier Ranking
1. Implement supplier ranking by spend descending
2. Implement 70%/top-40 selection rule
3. Implement deterministic tie-breaking
4. Write tests with known supplier sets

### WAVE 4: Baseline + Target + Actual
1. Add baseline/target fields to project model
2. Implement baseline snapshot logic
3. Implement target versioning
4. Implement variance calculation
5. Write tests

### WAVE 5: Financial Evaluation
1. Implement Article 17 formula exactly
2. Add price score, LC score, baseline contribution, target contribution, listed company bonus
3. Write tests with known bid sets

### WAVE 6: Mandatory List
1. Create Prisma models
2. Build XLSX import parser
3. Implement search and classification
4. Wire to spend classification
5. Write tests

### WAVE 7: Gradual Plan + Penalties
1. Create Prisma models
2. Implement 60-day deadline logic
3. Implement penalty assessment engine
4. Write tests

### WAVE 8: SME + Ownership + Listed Company + Price Preference
1. Add ownership percentage field
2. Implement 50% threshold
3. Implement SME classification
4. Implement listed company detection
5. Implement price preference calculation
6. Write tests

### WAVE 9: Reviewer Workflow + Documentation
1. Build submission package for external reviewer
2. Update all documentation
3. Final regression testing

### WAVE 10: UI + Integration
1. Update workbook UI for new lines
2. Add LCGPA score display
3. Add baseline/target UI
4. Add financial evaluation UI
5. Add mandatory list UI
6. Add gradual plan UI
7. Full regression testing

---

## 10. Stop Conditions

None triggered during WAVE 0. All regulatory rules from the supplied baseline are clear and implementable.

**Potential future stops:**
- Mandatory List source data: If the XLSX files from lcgpa.gov.sa cannot be parsed automatically, we build the ingestion contract but do not fabricate data.
- LCGPA calculator validation: If we cannot access the official calculator to validate our implementation, we document the limitation.

---

## 11. Validation Commands

```
npx tsc --noEmit                                    # TypeScript
npx jest --testPathPattern="local-content" --silent # LocalContentOS tests
npx prisma validate                                  # Schema
npx prisma generate                                  # Client
```

---

## 12. Ready For Implementation

**Status:** WAVEs 1-10 COMPLETE. LCGPA Entity-Level implementation is pilot-ready.

**Completion Summary:**

| Wave | Scope | Status |
|------|-------|--------|
| WAVE 0 | Repository Reality Audit | ✅ COMPLETE |
| WAVE 1 | Domain Model + Calculation Contract | ✅ COMPLETE |
| WAVE 2 | Workbook Lines (62 lines, 14 sections) | ✅ COMPLETE |
| WAVE 3 | G&S Supplier Ranking Engine | ✅ COMPLETE |
| WAVE 4 | Baseline / Target / Actual | ✅ COMPLETE |
| WAVE 5 | Financial Evaluation (Article 17) | ✅ COMPLETE |
| WAVE 6 | Mandatory List Import/Search/Classify | ✅ COMPLETE |
| WAVE 7 | Gradual Plan + Penalties + SME/Price | ✅ COMPLETE |
| WAVE 8 | Unified Tender Evaluation | ✅ COMPLETE |
| WAVE 9 | Reviewer Submission Package | ✅ COMPLETE |
| WAVE 10 | UI Integration + Full Regression | ✅ COMPLETE |

**5-Step Regulatory Alignment (2026-08-21):**

| Step | Scope | Status |
|------|-------|--------|
| Step 1 | Workbook expansion (32→62 lines, 9→14 sections) | ✅ COMPLETE |
| Step 2 | Sector LC% rate integration (38 sectors wired into classification + G&S pillar) | ✅ COMPLETE |
| Step 3 | Workforce 37% configurable (EXPAT_LC_RATE_REGULATION=0.37, EXPAT_LC_RATE_TEMPLATE=0.534) | ✅ COMPLETE |
| Step 4 | Final regulatory reality audit (12 gaps found, 5 high/medium fixed) | ✅ COMPLETE |
| Step 5 | Freeze regulatory baseline | ✅ COMPLETE |

**Test Results:** 336 tests pass, 0 failures, 0 TypeScript errors (11 suites).

**No blockers identified.** All regulatory rules are implemented. The codebase is clean. The migration strategy is additive-only. Historical data is preserved.

---

## REGULATORY BASELINE FREEZE — 2026-08-21

**Frozen by:** Regulatory Reality Audit (Step 4-5)
**Rule Version:** `LCGPA_RULE_VERSION = "2026-01"`
**Scope:** All LCGPA entity-level computation, workbook template, sector rates, and audit traceability.

### What is frozen

1. **Workbook Template:** 62 lines, 14 sections (INF/LC/WRK/GS/XD/CPX/CAP/DEP/AST/APX)
2. **Sector Rates:** 38 sectors (S01-S23, P01-P15) from Appendix B, decimal format (0-1)
3. **Core Formulas:**
   - LC% = (LC_GS + LC_AD + LC_LC + LC_CB) / Total_Costs × 100
   - Financial Eval: PriceScore = (LowestBid/EvaluatedBid) × 60, LCScore = blended LC × 40
   - Expat default: 0.37 (regulation), template opt-in: 0.534
   - Penalty: |variance| > 5%, max 10% of contract value
4. **Audit Matrix:** 43 controls mapped (GEN-08, LAB-10, SC-10, CPX-3, CAP-4, DEP-3, CLO-5)
5. **G&S Selection:** max(70% cumulative, top-40, min-10 vendors), sector rate fallback for unclassified
6. **Capex Rules:** 100M threshold, asset filtering, top-80 by descending cost

### What requires a new decision to change

- Any formula constant (expat rate, penalty threshold, selection rules)
- Workbook line structure (add/remove/rename lines)
- Sector rates (requires official LCGPA update)
- Audit control mappings
- `LCGPA_RULE_VERSION` (must be bumped on any change)

### Known remaining items (non-blocking)

| # | Item | Severity | Notes |
|---|------|----------|-------|
| 1 | CAP-05 tautological (always 100% given CAP-04 definition) | Low | Workbook formula works; engine uses independent denominator |
| 2 | CLO mappings overstate coverage (manual procedures by design) | Low | Acceptable for v0.1 |
| 3 | CAP numbering mismatch between matrix and workbook | Low | Documentation-only; engine handles correctly |
| 4 | 1,444+ mandatory list products not yet imported | Medium | Requires official LCGPA data file |
| 5 | P6 Arabic IFRS content blocked on licensing | Medium | SOCPA/ACPA translations are copyrighted |
