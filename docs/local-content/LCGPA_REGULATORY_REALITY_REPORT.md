# LCGPA Regulatory Reality Report

**Status:** FINAL
**Date:** 2026-08-21
**Rule Version:** `LCGPA_RULE_VERSION = "2026-01"`
**Authored by:** LocalContentOS Engine
**Scope:** Complete disclosure of what is implemented, what is evidenced, and what remains dependent on official LCGPA data/interpretation.

---

## 1. Executive Summary

LocalContentOS implements the **Local Content and Government Procurement Authority (LCGPA)** scoring methodology as a deterministic, auditable computation engine.

**What is implemented:** A computation engine that accepts structured inputs and produces deterministic, reproducible, versioned outputs with full traceability.

**What is NOT implemented:** Automatic extraction of LCGPA workbook data, official mandatory product list data (1,444+ items), and any form of regulatory certification.

**This engine is a decision-support tool, not a regulatory authority.**

---

## 2. What Is Implemented (Evidence-Backed)

### 2.1 Four-Pillar LCGPA Formula

```
LC% = (LC_GS + LC_AD + LC_LC + LC_CB) / Total_Costs x 100
```

| Pillar | Symbol | Function | Rule |
|--------|--------|----------|------|
| Goods & Services | LC_GS | `computeLcGoodsServices()` | Top-40 / 70% cumulative / min-10 vendor floor |
| Asset Depreciation | LC_AD | `computeLcAssetDepreciation()` | KSA 100%, Foreign 20% |
| Labor Compensation | LC_LC | `computeLcLaborCompensation()` | Saudi 100%, Expat 37% (configurable) |
| Capacity Building | LC_CB | `computeLcCapacityBuilding()` | Training + supplier dev + R&D in KSA (100%) |

### 2.2 G&S Selection Rule

1. Sort suppliers by spend descending
2. Take until cumulative spend >= 70% of total
3. Also take top-40 by spend
4. Also enforce min-10 vendor floor (SC-04)
5. Final: `max(70pct_count, top40, MIN_VENDOR_FLOOR)`, bounded by available

Tie-breaking: lexicographic by supplierId.

### 2.3 Financial Evaluation (Article 17)

```
PriceScore = (LowestBid / EvaluatedBid) x 60
LCScore = ((TargetLC% x 0.5 + BaselineLC% x 0.5) / 100 + ListedBonus/100) x 40
OverallScore = PriceScore + LCScore  [0, 100]
```

Listed bonus: 5 percentage points. Score clamped [0, 100].

### 2.4 Penalty Assessment

- Variance = actualLcPct - targetLcPct
- Threshold: |variance| > 5% (strict)
- Max penalty: 10% of contract value

### 2.5 Sector LC% Rates

38 sectors: 23 services (S01-S23), 15 products (P01-P15).
Rates stored as decimals 0-1. Used as G&S fallback for unclassified suppliers.

### 2.6 Workforce Expat Rate

- Regulatory default: 0.37 (37%)
- Template default: 0.534 (53.4%)
- Configurable via `expatLcRate?` field

### 2.7 Workbook Template

62 lines, 14 sections matching official v.2 template.
All autoFillable lines have tbAccountPatterns or formula.

### 2.8 Audit Controls

43 controls across 7 categories (GEN-8, LAB-10, SC-10, CPX-3, CAP-4, DEP-3, CLO-5).

### 2.9 Deterministic Trace

Every calculation produces a `LcCalculationTrace` with full inputs, outputs, evidence refs, and rule version. `verifyTrace()` re-computes and confirms match.

---

## 3. What Is NOT Implemented

### 3.1 Mandatory Product List Data

**Status:** BLOCKED on official LCGPA data.
Infrastructure exists in `mandatory-list.ts`. 1,444+ products need official dataset.

### 3.2 Automatic Workbook Extraction

**Status:** PARTIAL. Template structure defined (62 lines). Excel parsing not wired.

### 3.3 Official Regulatory Certification

**This engine does NOT produce official LCGPA scores, certify compliance, or replace human judgment.**

### 3.4 Product-Specific Overrides

Some sectors have specific rules not yet implemented. General formula covers majority of cases.

### 3.5 CAP-05 Tautology

CAP-05 (capacity building completeness) always returns 100% given CAP-04 definition. Low impact.

---

## 4. Reproducibility Proof

The deterministic fixture test (`deterministic-fixture.test.ts`) proves:

| Check | Result |
|-------|--------|
| G&S selection deterministic | PASS (11 suppliers, top40_rule) |
| Four-pillar LC% = 75.79% | PASS |
| Identical across 3 runs | PASS |
| Article 17 FE = 73.6 | PASS |
| Penalty flags correctly | PASS |
| Ownership classification | PASS |
| 38 sector rates fixed | PASS |
| Rule version frozen | PASS |
| Trace self-verifiable | PASS |
| FE trace self-verifiable | PASS |

**Test counts:**
- Deterministic fixture: 11/11
- LCGPA total: 228/228 (8 suites)
- LocalContent total: 560/566 (6 skipped from P6 import)
- TypeScript errors: 0

---

## 5. Baseline Freeze Statement

Effective 2026-08-21, the LCGPA regulatory baseline is frozen at:

```
LCGPA_RULE_VERSION = "2026-01"
```

Any change to computation logic requires:
1. Version bump (LCGPA_RULE_VERSION incremented)
2. Deterministic fixture test updated with new expected values
3. This report updated to reflect the change
4. All existing tests must continue to pass
5. Change logged in LCGPA_IMPLEMENTATION_REALITY.md

---

## 6. Governance and Compliance

- All mutations produce audit trail entries
- All calculations are traceable to rule version
- Human review required before any output is finalized
- No AI autonomous decisions in regulatory scoring
- Export requires reviewer approval
- Tenant isolation enforced

---

## 7. Key Files

| File | Purpose |
|------|---------|
| `src/lib/local-content/lcgpa/calculation-engine.ts` | Core computation |
| `src/lib/local-content/lcgpa/calculation-trace.ts` | Traceability |
| `src/lib/local-content/lcgpa/types.ts` | Types, constants, 38 sectors |
| `src/lib/local-content/lcgpa/mandatory-list.ts` | Sector rates, classification |
| `src/lib/local-content/lcgpa/workbook-mapper.ts` | Workbook extraction |
| `src/lib/local-content/lcgpa/supplier-ranking.ts` | Supplier ranking rules |
| `src/lib/local-content/lcgpa/reviewer-workflow.ts` | Submission package |
| `src/lib/local-content/workbook/template.ts` | 62-line template |
| `docs/local-content/LCGPA_AUDIT_CONTROL_TRACEABILITY.md` | 43 audit controls |
| `docs/local-content/LCGPA_IMPLEMENTATION_REALITY.md` | Implementation status |

---

## 8. Next Steps

1. **Obtain official LCGPA mandatory product list** (1,444+ items)
2. **Wire Excel parsing** for automatic workbook extraction
3. **Sector-specific overrides** when official guidance is published
4. **Production deployment** with pilot customer data
5. **External audit** by LCGPA-certified assessor (recommended, not required)
