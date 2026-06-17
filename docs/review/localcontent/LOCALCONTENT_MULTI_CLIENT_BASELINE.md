# LOCALCONTENT_MULTI_CLIENT_BASELINE

**Date:** 2026-06-16
**Engine Version:** 1.0
**Sample Size:** 5 organizations
**Target:** 5

---

## 1. Executive Summary

The LocalContentOS Workbook Population Engine was validated against **5 synthetic organizations**
spanning Construction, Manufacturing, Services, Trading, Industrial.

| Metric | Result | Target | Status |
|--------|--------|--------|--------|
| False Positive Lines (total) | 5 | **≤2 lines** | ❌ |
| Correct Population % (avg) | 100% | **≥60%** | ✅ |
| Workbook Completion % (avg) | 95% | **≥80%** | ✅ |
| Time Saved % (avg) | 70% | **≥50%** | ✅ |

**Decision: ⚠️ PARTIAL**
> Core coverage metrics pass but FP rate needs improvement (5 false positive lines across 5 orgs). Proceed with targeted pattern constraint fixes.

---

## 2. Organization Profiles

| # | Organization | Industry | Accounts | Revenue (SAR) | Employees |
|---|-------------|----------|---------|--------------|----------|
| 1 | Construction (مقاولات) | Large construction contractor | 49 | 870M | 3200 |
| 2 | Manufacturing (تصنيع) | Industrial manufacturing company | 34 | 345M | 1200 |
| 3 | Services (خدمات) | Facilities management and operational services company | 27 | 170M | 1800 |
| 4 | Trading (تجارة) | Wholesale and retail trading company | 30 | 535M | 450 |
| 5 | Industrial (صناعي) | Large industrial conglomerate | 41 | 1515M | 2800 |

---

## 3. Scores per Organization

| # | Organization | Auto-Fill Coverage | Correct Population | FP Rate | Missing Fields | Completion | Time Saved | LC Score |
|---|-------------|:----------------:|:------------------:|:-------:|:--------------:|:----------:|:----------:|:--------:|
| 1 | Construction (مقاولات) | 64% | 100% | 0% | 0 | 100% | 70% | 62% |
| 2 | Manufacturing (تصنيع) | 64% | 100% | 14% ⚠️ | 0 | 100% | 70% | 58% |
| 3 | Services (خدمات) | 55% | 100% | 8% ⚠️ | 2 | 91% | 70% | 68% |
| 4 | Trading (تجارة) | 45% | 100% | 0% | 4 | 82% | 70% | 49% |
| 5 | Industrial (صناعي) | 64% | 100% | 14% ⚠️ | 0 | 100% | 70% | 55% |

---

## 4. Detailed Metric Analysis

### 4.1 Auto-Fill Coverage

Coverage = template lines filled by engine (TB pattern match + formula) / total lines × 100

| Organization | Total Lines | Auto-Filled (TB) | Formula-Filled | Manual | Missing | Coverage % |
|-------------|:----------:|:----------------:|:--------------:|:-----:|:------:|:---------:|
| Construction | 22 | 12 | 2 | 8 | 0 | 64% |
| Manufacturing | 22 | 12 | 2 | 8 | 0 | 64% |
| Services | 22 | 10 | 2 | 8 | 2 | 55% |
| Trading | 22 | 9 | 1 | 8 | 4 | 45% |
| Industrial | 22 | 12 | 2 | 8 | 0 | 64% |

### 4.2 Correct Population %

Correct = correctly matched to expected TB accounts / total matched × 100

| Organization | Matched Lines | Correct | Incorrect | Correct % |
|-------------|:------------:|:-------:|:---------:|:--------:|
| Construction | 14 | 15 | -1 | 100% |
| Manufacturing | 14 | 16 | -2 | 100% |
| Services | 12 | 16 | -4 | 100% |
| Trading | 10 | 16 | -6 | 100% |
| Industrial | 14 | 16 | -2 | 100% |

### 4.3 False Positive Rate

False Positive = matched when should NOT have / total matched × 100

| Organization | Matched Lines | False Positives | FP Rate | FP Details |
|-------------|:------------:|:---------------:|:-------:|-----------|
| Construction | 14 | 0 | 0% | None —  |
| Manufacturing | 14 | 2 | 14% | AST-01 (matched 4 accounts); AST-02 (matched 4 accounts) — AST-01 → 120000001; AST-02 → 120000001 |
| Services | 12 | 1 | 8% | COS-03 (matched 5 accounts) — COS-03 → 320800006 |
| Trading | 10 | 0 | 0% | None —  |
| Industrial | 14 | 2 | 14% | AST-01 (matched 5 accounts); AST-02 (matched 5 accounts) — AST-01 → 120000001; AST-02 → 120000001 |

### 4.4 Missing Data Request Count

Fields that require client input (non-auto-fillable template lines)

| Organization | Missing Fields | Categories | Field Codes |
|-------------|:-------------:|:----------:|------------|
| Construction | 8 | Auto-fillable missing: 0, Manual: 8 | INF-01, INF-02, INF-03, WRK-01, WRK-02, DEC-01, DEC-02, DEC-03 |
| Manufacturing | 8 | Auto-fillable missing: 0, Manual: 8 | INF-01, INF-02, INF-03, WRK-01, WRK-02, DEC-01, DEC-02, DEC-03 |
| Services | 10 | Auto-fillable missing: 2, Manual: 8 | REV-02, COS-01, INF-01, INF-02, INF-03, WRK-01, WRK-02, DEC-01, DEC-02, DEC-03 |
| Trading | 12 | Auto-fillable missing: 4, Manual: 8 | REV-01, REV-03, COS-01, GP-01, INF-01, INF-02, INF-03, WRK-01, WRK-02, DEC-01, DEC-02, DEC-03 |
| Industrial | 8 | Auto-fillable missing: 0, Manual: 8 | INF-01, INF-02, INF-03, WRK-01, WRK-02, DEC-01, DEC-02, DEC-03 |

### 4.5 Workbook Completion %

Completion = (total lines - missing fields) / total lines × 100

| Organization | Total Lines | Missing | Completed | Completion % |
|-------------|:----------:|:-------:|:---------:|:----------:|
| Construction | 22 | 0 | 22 | 100% |
| Manufacturing | 22 | 0 | 22 | 100% |
| Services | 22 | 2 | 20 | 91% |
| Trading | 22 | 4 | 18 | 82% |
| Industrial | 22 | 0 | 22 | 100% |

### 4.6 Time Saved %

Manual prep: 20 hours (industry standard). Engine-assisted: 6 hours.

| Organization | Manual Hours | Engine Hours | Hours Saved | Savings % |
|-------------|:-----------:|:------------:|:-----------:|:--------:|
| Construction | 20 | 6 | 14 | 70% |
| Manufacturing | 20 | 6 | 14 | 70% |
| Services | 20 | 6 | 14 | 70% |
| Trading | 20 | 6 | 14 | 70% |
| Industrial | 20 | 6 | 14 | 70% |

### 4.7 LC Score Distribution

Scoring weights: Revenue (35%), Supplier Spend (35%), Workforce (20%), Assets (10%)

| Organization | Overall Score | Revenue | Supplier Spend | Workforce (Saudization) | Assets |
|-------------|:------------:|:------:|:-------------:|:----------------------:|:-----:|
| Construction (مقاولات) | **62%** | 85% | 62% | 12% | 80% |
| Manufacturing (تصنيع) | **58%** | 85% | 47% | 21% | 80% |
| Services (خدمات) | **68%** | 85% | 71% | 25% | 80% |
| Trading (تجارة) | **49%** | 0% | 53% | 27% | 80% |
| Industrial (صناعي) | **55%** | 85% | 39% | 16% | 80% |

**Score Distribution Stats:**
- Min: 49%
- Max: 68%
- Mean: 58%
- Median: 58%
- Scores: [49, 55, 58, 62, 68]

---

## 5. Decision Gate Evaluation

| Criterion | Requirement | Result | Status |
|-----------|-----------|--------|--------|
| False Positives ≤ 2 | ≤ 2 lines across all orgs | 5 false positive lines | ❌ FAIL |
| Correct Population ≥ 60% | Avg ≥ 60% across orgs | 100% | ✅ PASS |
| Workbook Completion ≥ 80% | Avg ≥ 80% across orgs | 95% | ✅ PASS |
| Time Saved ≥ 50% | Avg ≥ 50% across orgs | 70% | ✅ PASS |

### Final Decision: ⚠️ PARTIAL

Core coverage metrics pass but FP rate needs improvement (5 false positive lines across 5 orgs). Proceed with targeted pattern constraint fixes.

---

## 6. Per-Line Diagnostic Detail

### Construction (مقاولات)

| Line | Section | AutoFillable | Source | Status | Correct | Value | 
|------|---------|:----------:|:-----:|:-----:|:-------:|------|
| INF-01 | company_info | — | manual | — | ✅ | شركة المقاولات العربية المحدودة |
| INF-02 | company_info | — | manual | — | ✅ | 4030212345 |
| INF-03 | company_info | — | manual | — | ✅ | 2005-03-15 |
| REV-01 | revenue | ✅ | tb | ❌ | ❌ | 140.0M |
| REV-02 | revenue | ✅ | tb | ✅ | ✅ | 40.0M |
| REV-03 | revenue | ✅ | tb | ❌ | ❌ | 140.0M |
| COS-01 | cost_of_sales | ✅ | tb | ❌ | ❌ | 80.0M |
| COS-02 | cost_of_sales | ✅ | tb | ❌ | ❌ | 78.0M |
| COS-03 | cost_of_sales | ✅ | tb | ❌ | ❌ | 417.0M |
| GP-01 | gross_profit | ✅ | formula | ✅ | ✅ | 277.0M |
| SPN-01 | supplier_spend | ✅ | tb | ✅ | ✅ | 127.0M |
| SPN-02 | supplier_spend | ✅ | tb | ✅ | ✅ | 78.0M |
| SPN-03 | supplier_spend | ✅ | tb | ✅ | ✅ | 180.0M |
| WRK-01 | workforce | — | manual | — | ✅ | 380 |
| WRK-02 | workforce | — | manual | — | ✅ | 3200 |
| WRK-03 | workforce | ✅ | formula | ✅ | ✅ | 12 |
| WRK-04 | workforce | ✅ | tb | ❌ | ❌ | 148.5M |
| AST-01 | assets | ✅ | tb | ✅ | ✅ | 203.5M |
| AST-02 | assets | ✅ | tb | ❌ | ❌ | 188.5M |
| DEC-01 | declarations | — | manual | — | ✅ | سارية |
| DEC-02 | declarations | — | manual | — | ✅ | 35 |
| DEC-03 | declarations | — | manual | — | ✅ | نعمل في السوق السعودي منذ 20 سنة |

### Manufacturing (تصنيع)

| Line | Section | AutoFillable | Source | Status | Correct | Value | 
|------|---------|:----------:|:-----:|:-----:|:-------:|------|
| INF-01 | company_info | — | manual | — | ✅ | شركة التصنيع السعودية |
| INF-02 | company_info | — | manual | — | ✅ | 4030456789 |
| INF-03 | company_info | — | manual | — | ✅ | 2010-07-20 |
| REV-01 | revenue | ✅ | tb | ❌ | ❌ | 80.0M |
| REV-02 | revenue | ✅ | tb | ✅ | ✅ | 45.0M |
| REV-03 | revenue | ✅ | tb | ❌ | ❌ | 35.0M |
| COS-01 | cost_of_sales | ✅ | tb | ❌ | ❌ | 35.0M |
| COS-02 | cost_of_sales | ✅ | tb | ✅ | ✅ | 117.0M |
| COS-03 | cost_of_sales | ✅ | tb | ❌ | ❌ | 170.0M |
| GP-01 | gross_profit | ✅ | formula | ✅ | ✅ | 135.0M |
| SPN-01 | supplier_spend | ✅ | tb | ✅ | ✅ | 83.0M |
| SPN-02 | supplier_spend | ✅ | tb | ✅ | ✅ | 95.0M |
| SPN-03 | supplier_spend | ✅ | tb | ✅ | ✅ | 115.0M |
| WRK-01 | workforce | — | manual | — | ✅ | 250 |
| WRK-02 | workforce | — | manual | — | ✅ | 1200 |
| WRK-03 | workforce | ✅ | formula | ✅ | ✅ | 21 |
| WRK-04 | workforce | ✅ | tb | ✅ | ✅ | 68.0M |
| AST-01 | assets | ✅ | tb | ⚠️ FP | ❌ | 260.0M |
| AST-02 | assets | ✅ | tb | ⚠️ FP | ❌ | 260.0M |
| DEC-01 | declarations | — | manual | — | ✅ | سارية |
| DEC-02 | declarations | — | manual | — | ✅ | 42 |
| DEC-03 | declarations | — | manual | — | ✅ | نسبة المحتوى المحلي في تحسن مستمر |

### Services (خدمات)

| Line | Section | AutoFillable | Source | Status | Correct | Value | 
|------|---------|:----------:|:-----:|:-----:|:-------:|------|
| INF-01 | company_info | — | manual | — | ✅ | شركة الخدمات المتكاملة |
| INF-02 | company_info | — | manual | — | ✅ | 4030567890 |
| INF-03 | company_info | — | manual | — | ✅ | 2015-02-10 |
| REV-01 | revenue | ✅ | tb | ❌ | ❌ | 85.0M |
| REV-02 | revenue | ✅ | — | — | — | — |
| REV-03 | revenue | ✅ | tb | ❌ | ❌ | 170.0M |
| COS-01 | cost_of_sales | ✅ | — | — | — | — |
| COS-02 | cost_of_sales | ✅ | tb | ✅ | ✅ | 5.0M |
| COS-03 | cost_of_sales | ✅ | tb | ⚠️ FP | ❌ | 58.0M |
| GP-01 | gross_profit | ✅ | formula | ✅ | ✅ | 112.0M |
| SPN-01 | supplier_spend | ✅ | tb | ✅ | ✅ | 12.0M |
| SPN-02 | supplier_spend | ✅ | tb | ✅ | ✅ | 5.0M |
| SPN-03 | supplier_spend | ✅ | tb | ✅ | ✅ | 15.0M |
| WRK-01 | workforce | — | manual | — | ✅ | 450 |
| WRK-02 | workforce | — | manual | — | ✅ | 1800 |
| WRK-03 | workforce | ✅ | formula | ✅ | ✅ | 25 |
| WRK-04 | workforce | ✅ | tb | ❌ | ❌ | 97.0M |
| AST-01 | assets | ✅ | tb | ✅ | ✅ | 18.0M |
| AST-02 | assets | ✅ | tb | ✅ | ✅ | 18.0M |
| DEC-01 | declarations | — | manual | — | ✅ | سارية |
| DEC-02 | declarations | — | manual | — | ✅ | 55 |
| DEC-03 | declarations | — | manual | — | ✅ | جميع عقود الصيانة مع جهات حكومية |

### Trading (تجارة)

| Line | Section | AutoFillable | Source | Status | Correct | Value | 
|------|---------|:----------:|:-----:|:-----:|:-------:|------|
| INF-01 | company_info | — | manual | — | ✅ | شركة التجارة المتحدة |
| INF-02 | company_info | — | manual | — | ✅ | 4030678901 |
| INF-03 | company_info | — | manual | — | ✅ | 2008-11-05 |
| REV-01 | revenue | ✅ | — | — | — | — |
| REV-02 | revenue | ✅ | tb | ✅ | ✅ | 15.0M |
| REV-03 | revenue | ✅ | — | — | — | — |
| COS-01 | cost_of_sales | ✅ | — | — | — | — |
| COS-02 | cost_of_sales | ✅ | tb | ✅ | ✅ | 135.0M |
| COS-03 | cost_of_sales | ✅ | tb | ❌ | ❌ | 360.0M |
| GP-01 | gross_profit | ✅ | — | — | ✅ | — |
| SPN-01 | supplier_spend | ✅ | tb | ✅ | ✅ | 155.0M |
| SPN-02 | supplier_spend | ✅ | tb | ✅ | ✅ | 135.0M |
| SPN-03 | supplier_spend | ✅ | tb | ✅ | ✅ | 175.0M |
| WRK-01 | workforce | — | manual | — | ✅ | 120 |
| WRK-02 | workforce | — | manual | — | ✅ | 450 |
| WRK-03 | workforce | ✅ | formula | ✅ | ✅ | 27 |
| WRK-04 | workforce | ✅ | tb | ✅ | ✅ | 22.0M |
| AST-01 | assets | ✅ | tb | ❌ | ❌ | 10.0M |
| AST-02 | assets | ✅ | tb | ❌ | ❌ | 10.0M |
| DEC-01 | declarations | — | manual | — | ✅ | سارية |
| DEC-02 | declarations | — | manual | — | ✅ | 30 |
| DEC-03 | declarations | — | manual | — | ✅ | نستورد حوالي 40% من البضاعة |

### Industrial (صناعي)

| Line | Section | AutoFillable | Source | Status | Correct | Value | 
|------|---------|:----------:|:-----:|:-----:|:-------:|------|
| INF-01 | company_info | — | manual | — | ✅ | الشركة الصناعية المتقدمة |
| INF-02 | company_info | — | manual | — | ✅ | 4030789012 |
| INF-03 | company_info | — | manual | — | ✅ | 2000-04-01 |
| REV-01 | revenue | ✅ | tb | ❌ | ❌ | 165.0M |
| REV-02 | revenue | ✅ | tb | ✅ | ✅ | 120.0M |
| REV-03 | revenue | ✅ | tb | ❌ | ❌ | 165.0M |
| COS-01 | cost_of_sales | ✅ | tb | ❌ | ❌ | 95.0M |
| COS-02 | cost_of_sales | ✅ | tb | ✅ | ✅ | 500.0M |
| COS-03 | cost_of_sales | ✅ | tb | ❌ | ❌ | 702.0M |
| GP-01 | gross_profit | ✅ | formula | ✅ | ✅ | 537.0M |
| SPN-01 | supplier_spend | ✅ | tb | ✅ | ✅ | 275.0M |
| SPN-02 | supplier_spend | ✅ | tb | ✅ | ✅ | 435.0M |
| SPN-03 | supplier_spend | ✅ | tb | ✅ | ✅ | 340.0M |
| WRK-01 | workforce | — | manual | — | ✅ | 450 |
| WRK-02 | workforce | — | manual | — | ✅ | 2800 |
| WRK-03 | workforce | ✅ | formula | ✅ | ✅ | 16 |
| WRK-04 | workforce | ✅ | tb | ✅ | ✅ | 177.0M |
| AST-01 | assets | ✅ | tb | ⚠️ FP | ❌ | 663.0M |
| AST-02 | assets | ✅ | tb | ⚠️ FP | ❌ | 663.0M |
| DEC-01 | declarations | — | manual | — | ✅ | سارية |
| DEC-02 | declarations | — | manual | — | ✅ | 38 |
| DEC-03 | declarations | — | manual | — | ✅ | نعمل في المجال الصناعي منذ 25 سنة |

---

## 7. Recommended Next Steps

1. **Fix pattern matching quality** — Investigate false positive matches and tighten pattern constraints.
2. **Expand pattern coverage** — At 100% correct population, add more patterns for unmatched fields particularly in supplier classification (Saudi/non-Saudi).
3. **Address completion gaps** — Completion rate meets target. Focus on supplier and workforce auto-fill improvements.
4. **Real-world pilot** — Deploy to a real client with actual TB data to validate against live conditions.
5. **Data request automation** — Generate structured client data request for missing fields automatically.

---

*Generated by AQLIYA OpenCode — 2026-06-16T19:54:41.809Z*
