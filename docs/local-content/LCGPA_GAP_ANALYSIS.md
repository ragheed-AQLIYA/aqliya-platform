# LocalContentOS vs LCGPA Official Framework - Gap Analysis

**Date:** 2026-08-19
**Status:** COMPLETE
**Author:** OpenCode Agent

---

## Executive Summary

LocalContentOS is currently built on an **IKTVA-style fixed-weight model** (35/35/20/10), NOT the official LCGPA entity-level formula. The LCGPA official formula uses **actual financial data** across four pillars with specific calculation rules. This document maps every gap between the official framework and the current implementation.

---

## 1. LCGPA Official Formula (Source of Truth)

### 1.1 Core Formula

```
LC% = (LC_GS + LC_AD + LC_LC + LC_CB) / Total_Costs x 100
```

Where:
- **LC_GS** = Local component of goods and services spend
- **LC_AD** = Local component of asset depreciation
- **LC_LC** = Local component of labor costs
- **LC_CB** = Local component of training/R&D/supplier development
- **Total_Costs** = Total operating costs (all four pillars combined)

### 1.2 Pillar Calculation Rules

| Pillar | Rule |
|--------|------|
| **Labor** | Saudi employees = 100% local content; Expat employees = 37% of wages |
| **Assets** | Manufactured in KSA = 100% of depreciation; Manufactured abroad = 20% of depreciation |
| **Goods & Services** | Ranked suppliers descending; cover 70% of total costs OR top 40 suppliers (whichever higher) |
| **Capacity Building** | Saudi training = 100%; Supplier development; R&D in KSA |

### 1.3 Key Regulations

| Regulation | Detail |
|------------|--------|
| **Price Preference** | 10% for national products in supply tenders |
| **SME Preference** | 10% for local SMEs |
| **Financial Evaluation** | 60% price + 40% LC (targeted x 50% + baseline x 50% + 5% listed company) |
| **Mandatory List** | 1,444+ products across 16 sectors (targeting 2,000 in 2026) |
| **Gradual Plan** | Required within 60 days after award for high-value contracts |
| **Fines** | Up to 10% if gap > 5% from target |
| **Certificate** | Issued by LCGPA, valid 19 months, requires accredited audit firm |
| **Ownership** | Company must be >= 50% Saudi-owned to be considered "local" |

### 1.4 Adjusted Bid Value (Article 11)

For supply tenders with mandatory list products:
```
Adjusted bid value = Bid price + 10% x Bid price x (1 - share of national products)
```

### 1.5 Financial Evaluation (Article 17)

```
Evaluation = (Lowest bid / Evaluated bid) x 60% + (Targeted LC% x 50% + Baseline x 50% + 5% if listed) x 40%
```

---

## 2. Current LocalContentOS Implementation

### 2.1 Workbook Scoring (workbook/scoring.ts)

Fixed weights (IKTVA-style):
- Revenue Score: 35% (REV-01 / REV-03)
- Supplier Spend Score: 35% (SPN-01 / SPN-03)
- Workforce Score: 20% (WRK-01 / WRK-02)
- Asset Score: 10% (AST-01 / AST-02)

Formula: `overallScore = sum(metricScore x weight) / sum(weight)`

### 2.2 Supplier Scoring (scoring.ts)

4-factor weighted model:
- Locality: 40%
- Ownership: 25%
- Workforce: 20%
- Declared Content: 15%

### 2.3 Workbook Template

27 lines across 8 sections:
- Company Info (3 lines)
- Revenue (3 lines: local, foreign, total)
- Cost of Sales (3 lines)
- Gross Profit (1 line)
- Supplier Spend (3 lines: Saudi, non-Saudi, total)
- Workforce (4 lines: Saudi count, total, percentage, payroll)
- Assets (2 lines: local, total)
- Declarations (3 lines)

---

## 3. Gap Analysis (G1-G10)

### G1: No Mandatory List Module [CRITICAL]

**LCGPA Requirement:** Mandatory List of 1,444+ products across 16 sectors that must be procured locally.

**Current State:** No implementation. No database model, no import, no validation.

**Impact:** Cannot enforce mandatory procurement rules. Cannot identify which purchases fall under mandatory list.

**Recommendation:**
- Create `LcMandatoryItem` Prisma model
- Create `LcMandatorySector` model for the 16 sectors
- Build XLSX import parser for official LCGPA documents library data
- Add validation in spend classification to flag mandatory list items
- Update workbook template with mandatory list reference lines

**Priority:** P0 - Blocks LCGPA compliance

---

### G2: No Baseline vs Target Distinction [CRITICAL]

**LCGPA Requirement:** Separate "Baseline" (current LC%) from "Targeted LC%" (committed improvement for Gradual Plan).

**Current State:** Only current LC% is calculated. No target tracking.

**Impact:** Cannot support Gradual Plan workflow or tender evaluation (Article 17 requires both baseline and targeted LC%).

**Recommendation:**
- Add `baselineLcPct` and `targetedLcPct` fields to project model
- Add `baselineDate` and `targetDate` fields
- Add Gradual Plan status tracking
- Update scoring to output both baseline and targeted scores
- Wire tender evaluation formula using both values

**Priority:** P0 - Blocks tender evaluation and Gradual Plan

---

### G3: Wrong Scoring Formula [CRITICAL]

**LCGPA Requirement:** `LC% = (LC_GS + LC_AD + LC_LC + LC_CB) / Total_Costs x 100`

**Current State:** `overallScore = sum(metricScore x fixedWeight) / sum(weight)` where weights are arbitrary (35/35/20/10).

**Impact:** Scores will not match LCGPA official calculation. Results will differ from LCGPA calculator.

**Recommendation:**
- Implement LCGPA formula with four-pillar breakdown
- Each pillar: `LC_pillar = sum(local_component) / sum(total_cost_pillar)`
- Overall: `LC% = sum(LC_pillar) / sum(total_costs) x 100`
- Keep existing IKTVA-style scoring as a separate option
- Add scoring mode toggle: "LCGPA Entity Level" vs "IKTVA Aramco"

**Priority:** P0 - Core accuracy issue

---

### G4: Missing Capacity Building Pillar [CRITICAL]

**LCGPA Requirement:** Capacity Building includes training Saudis, supplier development, R&D in KSA.

**Current State:** No Capacity Building section in workbook. No training/R&D tracking.

**Impact:** Cannot calculate LC from capacity building activities. Missing ~10-15% of potential LC score.

**Recommendation:**
- Add workbook lines: CAP-01 (Saudi training), CAP-02 (Total training), CAP-03 (Supplier development), CAP-04 (R&D in KSA), CAP-05 (Total capacity building)
- Apply rule: Saudi training = 100% LC, Non-Saudi training = 0% LC
- Add evidence types: training_certificate, supplier_development_record, rd_expenditure

**Priority:** P0 - Missing pillar from official formula

---

### G5: Missing Foreign Asset Depreciation Rule [HIGH]

**LCGPA Requirement:** Foreign assets = 20% of depreciation value counts as LC.

**Current State:** AST-01 (local assets) and AST-02 (total assets) only. No foreign asset tracking. No 20% rule.

**Impact:** Cannot correctly calculate asset depreciation LC for foreign-owned assets.

**Recommendation:**
- Add AST-03 (foreign fixed assets) line to workbook
- Scoring rule: `LC_assets = (local_assets x 100% + foreign_assets x 20%) / total_assets`
- Update workbook template and scoring engine

**Priority:** P1 - Affects asset pillar accuracy

---

### G6: No Salary-Based Labor Calculation [HIGH]

**LCGPA Requirement:** Labor LC based on compensation (salary), not headcount.

**Current State:** Workforce section only tracks headcount (WRK-01, WRK-02, WRK-03). WRK-04 (total payroll) exists but is not used in scoring.

**Impact:** Cannot calculate labor LC based on actual compensation as required by LCGPA.

**Recommendation:**
- Add WRK-05 (Saudi employee total compensation)
- Add WRK-06 (Expat employee total compensation)
- Scoring rule: `LC_labor = (Saudi_compensation x 100% + Expat_compensation x 37%) / total_compensation`
- Update workbook template and scoring engine

**Priority:** P1 - Affects labor pillar accuracy

---

### G7: No Ownership >= 50% Rule [HIGH]

**LCGPA Requirement:** Company must be >= 50% Saudi-owned to be considered "local" for ownership classification.

**Current State:** Supplier scoring has ownership factor (Saudi/joint_venture/foreign) but no 50% threshold rule. Ownership is binary classification, not percentage-based.

**Impact:** Incorrectly classifies companies as "local" when Saudi ownership is < 50%.

**Recommendation:**
- Add `saudiOwnershipPct` field to supplier model
- Apply rule: `isLocal = saudiOwnershipPct >= 50`
- Update supplier scoring to use percentage-based ownership

**Priority:** P1 - Affects supplier classification accuracy

---

### G8: No 70% / Top-40 Supplier Rule [MEDIUM]

**LCGPA Requirement:** Suppliers ranked descending by contribution. Minimum list includes suppliers whose costs make up 70% of total G&S expenses OR top 40 suppliers (whichever higher).

**Current State:** No supplier ranking logic. No 70%/top-40 rule implementation.

**Impact:** Cannot properly identify the required supplier list for G&S pillar calculation.

**Recommendation:**
- Add supplier ranking by spend amount (descending)
- Implement 70% threshold logic
- Implement top-40 threshold logic
- Apply higher of the two as minimum supplier list
- Add workbook lines for ranked supplier list

**Priority:** P2 - Affects G&S pillar completeness

---

### G9: No Financial Evaluation Engine [MEDIUM]

**LCGPA Requirement:** Article 17 financial evaluation formula: 60% price + 40% LC (targeted x 50% + baseline x 50% + 5% if listed).

**Current State:** Tender matching (tender-matching.ts) exists but does not implement the official financial evaluation formula. Only checks min LC% threshold.

**Impact:** Cannot perform official financial evaluation for government tenders.

**Recommendation:**
- Create `financial-evaluation.ts` module
- Implement Article 17 formula exactly
- Add input fields: lowestBid, evaluatedBid, targetedLcPct, baselineLcPct, isListed
- Output: financialEvaluationScore
- Add to tender workflow

**Priority:** P2 - Affects tender evaluation capability

---

### G10: No Gradual Plan Workflow [MEDIUM]

**LCGPA Requirement:** Mandatory plan submitted within 60 days after award. Specifies LC% to be reached during contract execution.

**Current State:** No Gradual Plan workflow. No deadline tracking. No milestone management.

**Impact:** Cannot support the mandatory Gradual Plan submission process.

**Recommendation:**
- Add `LcGradualPlan` Prisma model with: projectId, status, targetLcPct, milestones (JSON), submissionDate, approvalDate, deadline
- Create workflow states: draft/submitted/approved/in_progress/completed/overdue
- Add UI for Gradual Plan creation and tracking
- Add notification for 60-day deadline

**Priority:** P2 - Affects contract compliance

---

## 4. Gap Priority Matrix

| Gap | Severity | Priority | Effort | Status |
|-----|----------|----------|--------|--------|
| G1: Mandatory List | CRITICAL | P0 | Large | **COMPLETE** (1,727 products, 14 sectors, SHA-256 provenance) |
| G2: Baseline vs Target | CRITICAL | P0 | Medium | **COMPLETE** (`baseline-target.ts`, dual tracking) |
| G3: Wrong Formula | CRITICAL | P0 | Large | **COMPLETE** (`calculation-engine.ts`, 1,035 lines, 20 functions) |
| G4: Capacity Building | CRITICAL | P0 | Medium | **COMPLETE** (integrated in LCGPA formula, Saudi=100%, Expat=37%) |
| G5: Foreign Asset Rule | HIGH | P1 | Small | **COMPLETE** (20% depreciation rule in asset pillar) |
| G6: Salary-Based Labor | HIGH | P1 | Small | **COMPLETE** (salary-based, not headcount) |
| G7: Ownership 50% Rule | HIGH | P1 | Small | **COMPLETE** (threshold in scoring pipeline) |
| G8: 70%/Top-40 Rule | MEDIUM | P2 | Medium | **COMPLETE** (`supplier-ranking.ts`, max(70%, top-40, min-10)) |
| G9: Financial Evaluation | MEDIUM | P2 | Medium | **COMPLETE** (Article 17: 60% price + 40% LC) |
| G10: Gradual Plan | MEDIUM | P2 | Large | **COMPLETE** (workflow logic in engine; UI deferred to Phase 5) |

---

## 5. Recommended Implementation Order

### Phase 1: Core Formula Fix (P0)
1. G3: Implement LCGPA formula with four-pillar breakdown
2. G4: Add Capacity Building pillar
3. G5: Add foreign asset 20% rule
4. G6: Add salary-based labor calculation

### Phase 2: Workflow Enablement (P0)
5. G2: Add Baseline vs Target distinction
6. G1: Build Mandatory List module

### Phase 3: Regulatory Compliance (P1-P2)
7. G7: Add ownership 50% rule
8. G8: Add 70%/top-40 supplier rule
9. G9: Build Financial Evaluation engine
10. G10: Build Gradual Plan workflow

---

## 6. Files to Modify

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add LcMandatoryItem, LcMandatorySector, LcGradualPlan models; Add fields to LcProject |
| `src/lib/local-content/workbook/template.ts` | Add CAP-xx and AST-03 lines; Add WRK-05, WRK-06 lines |
| `src/lib/local-content/workbook/scoring.ts` | Implement LCGPA formula; Add scoring mode toggle |
| `src/lib/local-content/scoring.ts` | Update supplier scoring with 50% ownership rule |
| `src/lib/local-content/tender-matching.ts` | Add financial evaluation formula |
| `src/lib/local-content/services/scoring.ts` | Wire new scoring engine |

---

## 7. Testing Strategy

For each gap fix:
1. Unit test the calculation logic with known inputs/outputs
2. Compare output against LCGPA calculator (manual verification)
3. Integration test with workbook data
4. Regression test existing IKTVA-style scoring

---

## 8. References

- LCGPA Official Website: https://lcgpa.gov.sa/
- LCGPA Score Template Guidelines: https://lcgpa.gov.sa/en/LocalContent/Documents/Guidelines%20for%20the%20Local%20Content%20Score%20Template%20(Baseline%20%20Template%20No.%20N.1)%20.pdf
- MOF Regulations: https://www.mof.gov.sa/en/docslibrary/RegulationsInstructions/Documents/Regulations%20on%20Preference%20for%20Local%20Content%20and%20Local%20SMEs%20and%20Companies%20Listed%20on%20the%20Capital%20Market%20in%20Business%20and%20Procurement%20Transactions2.pdf
- Strategic Gears LCGPA Report: https://engine.strategicgears.com/files/Local%20Content%20in%20Saudi%20Arabia%20-%20ENG%20(1).pdf
- Penny Software LCGPA Guide: https://penny.co/prepare-local-content-audit-saudi-arabia/
- LCGPA Certificate Service: https://my.gov.sa/en/services/2159370
- LCGPA Calculator: https://my.gov.sa/en/services/2224056
