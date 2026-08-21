# LCGPA Financial Evaluation (Article 17) — Reality Audit

**Date:** 2026-08-20
**Status:** WAVE 5 PHASE A — Article 17 Reality Audit
**Branch:** staging
**Author:** Principal Regulatory Software Architect

---

## 0. Pre-Flight

```
Branch: staging
Last commit: 0826f193 security: close platform and SalesOS authorization findings
Working tree: Clean (no uncommitted LocalContentOS changes)
```

---

## 1. Regulatory Source

### 1.1 Primary Source

**LCGPA GAP Analysis Document** — `docs/local-content/LCGPA_GAP_ANALYSIS.md`

Section 1.5 "Financial Evaluation (Article 17)":

```
Evaluation = (Lowest bid / Evaluated bid) x 60% + (Targeted LC% x 50% + Baseline x 50% + 5% if listed) x 40%
```

### 1.2 Interpretation

The formula has two components:

1. **Price Score (60% weight)**
   - `PriceScore = (LowestBidPrice / EvaluatedBidPrice) × 60`
   - Range: [0, 60] (assuming EvaluatedBidPrice ≥ LowestBidPrice)
   - Higher is better (lower bid = higher score)

2. **LC Score (40% weight)**
   - `LCScore = ((TargetedLC% × 50% + BaselineLC% × 50%) + ListedBonus) / 100 × 40`
   - Where ListedBonus = 5% if supplier is listed on Tadawul/Nomu
   - Range: [0, 40] (assuming LC% values are 0-100 and ListedBonus = 5)
   - Higher is better (higher LC% = higher score)

### 1.3 Critical Normalization Issue

**Problem identified in existing implementation:**

The LC% values (TargetedLC%, BaselineLC%) are percentages in the range [0, 100]. If we apply the formula directly:

```
LCScore = (TargetedLC% × 50% + BaselineLC% × 50% + ListedBonus) × 40
```

This would produce a score in the range [0, 105] × 40 = [0, 4200], which is clearly wrong.

**Correct interpretation:**

The LC% values must be normalized to [0, 1] before applying the weight:

```
LCScore = ((TargetedLC% × 0.5 + BaselineLC% × 0.5) / 100 + ListedBonus / 100) × 40
```

Or equivalently:

```
LCBlend = (TargetedLC% + BaselineLC%) / 2  // Average in [0, 100]
LCNormalized = LCBlend / 100                 // Normalize to [0, 1]
LCScore = (LCNormalized + ListedBonus / 100) × 40
```

### 1.4 Conceptual Boundaries

**Financial Evaluation (Article 17) governs:**
- Tender bid evaluation for government procurement
- Price competitiveness scoring
- Local content commitment scoring
- Listed company bonus
- Ranking of multiple bids

**Financial Evaluation does NOT govern:**
- LCGPA entity-level scoring (4-pillar formula)
- Supplier eligibility classification
- Mandatory list compliance
- Gradual plan requirements
- Penalty assessment

---

## 2. Existing Implementation Analysis

### 2.1 Current Types

**File:** `src/lib/local-content/lcgpa/types.ts` (lines 198-230)

```typescript
interface FinancialEvaluationInputs {
  tenderReference: string;
  supplierId: string;
  supplierName: string;
  bidPrice: number;
  lowestBidPrice: number;
  baselineLcPct: number;
  targetedLcPct: number;
  isListedCompany: boolean;
}

interface FinancialEvaluationResult {
  priceScore: number;
  lcScore: number;
  listedCompanyBonus: number;
  overallScore: number;
  rank: number | null;
}
```

### 2.2 Current Implementation

**File:** `src/lib/local-content/lcgpa/calculation-engine.ts` (lines 310-350)

```typescript
function computeFinancialEvaluation(inputs: FinancialEvaluationInputs): FinancialEvaluationResult {
  const listedCompanyBonus = inputs.isListedCompany ? 5 : 0;

  // Price score: ratio of lowest bid to this bid, weighted 60%
  const priceRatio = inputs.lowestBidPrice > 0
    ? inputs.lowestBidPrice / inputs.bidPrice
    : 0;
  const priceScore = roundTo(priceRatio * 60, 4);

  // LC score: blended baseline + target, weighted 40%
  const lcBlend = inputs.targetedLcPct * 0.5 + inputs.baselineLcPct * 0.5;
  const lcScore = roundTo((lcBlend + listedCompanyBonus) * 0.4, 4);

  const overallScore = roundTo(priceScore + lcScore, 4);

  return {
    priceScore,
    lcScore,
    listedCompanyBonus,
    overallScore,
    rank: null,
  };
}
```

### 2.3 Identified Defects

**Defect 1: Missing LC% Normalization**

The current implementation does not normalize LC% values from [0, 100] to [0, 1] before applying the weight.

**Current (WRONG):**
```typescript
const lcBlend = inputs.targetedLcPct * 0.5 + inputs.baselineLcPct * 0.5;
const lcScore = roundTo((lcBlend + listedCompanyBonus) * 0.4, 4);
```

If `targetedLcPct = 75` and `baselineLcPct = 60`:
- `lcBlend = 75 × 0.5 + 60 × 0.5 = 67.5`
- `lcScore = (67.5 + 0) × 0.4 = 27.0`

This is in the range [0, 42], not [0, 40] as intended.

**Correct (FIXED):**
```typescript
const lcBlend = inputs.targetedLcPct * 0.5 + inputs.baselineLcPct * 0.5;
const lcNormalized = lcBlend / 100;  // Normalize to [0, 1]
const lcScore = roundTo((lcNormalized + listedCompanyBonus / 100) * 0.4, 4);
```

If `targetedLcPct = 75` and `baselineLcPct = 60`:
- `lcBlend = 67.5`
- `lcNormalized = 0.675`
- `lcScore = (0.675 + 0) × 0.4 = 0.27`

This is in the range [0, 0.42], which is correct when multiplied by 100 for display.

**Defect 2: Missing Input Validation**

The current implementation does not validate:
- `bidPrice > 0`
- `lowestBidPrice >= 0`
- `baselineLcPct` in range [0, 100]
- `targetedLcPct` in range [0, 100]
- `lowestBidPrice <= bidPrice` (logical constraint)

**Defect 3: Missing Traceability**

The current implementation does not produce a calculation trace that includes:
- Input values
- Formula used
- Intermediate calculations
- Rule version
- Timestamp

---

## 3. Regulatory Clarifications Needed

### 3.1 LC% Normalization

**Question:** Should the LC% values be normalized to [0, 1] before applying the 40% weight?

**Evidence:** The formula produces a score in the range [0, 40] for the LC component, which requires normalization.

**Decision:** YES — normalize LC% values to [0, 1] before applying the weight.

### 3.2 Listed Company Bonus

**Question:** Is the ListedBonus = 5% (i.e., 0.05) or 5 percentage points (i.e., 5)?

**Evidence:** The formula says "5% if listed". In the context of LC% values (0-100), this likely means 5 percentage points.

**Decision:** ListedBonus = 5 (percentage points), normalized to 0.05 when applied to the score.

### 3.3 Bid Price Constraints

**Question:** What happens if `bidPrice < lowestBidPrice`?

**Evidence:** The formula uses `LowestBid / EvaluatedBid`. If EvaluatedBid < LowestBid, the ratio > 1, which would produce a score > 60.

**Decision:** This is a logical error. The implementation should validate that `bidPrice >= lowestBidPrice` and return an error if violated.

### 3.4 Zero Bid Price

**Question:** What happens if `bidPrice = 0`?

**Evidence:** Division by zero is undefined.

**Decision:** Return validation error "BID_PRICE_ZERO".

### 3.5 Tie Handling

**Question:** How should tied bids be ranked?

**Evidence:** The regulation does not specify tie-breaking rules for financial evaluation.

**Decision:** Do not invent a tie-breaking rule. Leave rank as null for tied scores and document the limitation.

---

## 4. Implementation Plan

### 4.1 Domain Model

**Reuse existing types:**
- `FinancialEvaluationInputs` (types.ts)
- `FinancialEvaluationResult` (types.ts)

**Add new types:**
- `FinancialEvaluationTrace` (for traceability)
- `FinancialEvaluationError` (for error handling)

### 4.2 Calculation Contract

```
Input: FinancialEvaluationInputs + ruleVersion
  ↓
Validation: Check all inputs are valid
  ↓
Normalization: Convert LC% to [0, 1]
  ↓
Calculation: Apply Article 17 formula
  ↓
Intermediate values: Store all intermediate calculations
  ↓
Result: FinancialEvaluationResult
  ↓
Trace: FinancialEvaluationTrace
```

### 4.3 Error Model

```
INVALID_INPUT: bidPrice <= 0
MISSING_REQUIRED_DATA: missing baselineLcPct or targetedLcPct
REGULATORY_RULE_NOT_FOUND: ruleVersion not found
CALCULATION_NOT_PERMITTED: bidPrice < lowestBidPrice
VERSION_MISMATCH: ruleVersion mismatch
```

### 4.4 Test Categories

1. **Unit Tests**: Test each calculation function independently
2. **Contract Tests**: Verify input → calculation → result
3. **Edge Tests**: Zero, negative, boundary, decimal, duplicate, tie, multiple bids
4. **Regulatory Tests**: Every formula/condition has a corresponding test
5. **Trace Tests**: Verify trace contains inputs, formula, intermediates, result, rule version
6. **Regression Tests**: Run all existing LCGPA tests

---

## 5. Decision Record

| # | Question | Decision | Regulatory Basis |
|---|----------|----------|-----------------|
| D1 | LC% normalization | Normalize to [0, 1] | Formula produces score in [0, 40] |
| D2 | ListedBonus value | 5 percentage points = 0.05 | "5% if listed" in LC context |
| D3 | Bid < LowestBid | Return error | Logical constraint |
| D4 | Zero bid price | Return error | Division by zero |
| D5 | Tied bids | Leave rank null | No tie-breaking rule in regulation |
| D6 | Rounding | 4 decimal places | Existing convention in calculation-engine.ts |

---

## 6. Open Regulatory Questions

| # | Question | Impact | Status |
|---|----------|--------|--------|
| Q1 | Should the LC score be capped at 40? | Affects maximum possible score | BLOCKED — regulation unclear |
| Q2 | How to handle missing baselineLcPct? | Affects input validation | BLOCKED — regulation unclear |
| Q3 | Should financial evaluation be persisted? | Affects database schema | DECISION: No persistence in WAVE 5 |
| Q4 | Should financial evaluation be wired to tender ranking? | Affects integration | DECISION: Keep separate in WAVE 5 |

---

## 7. Validation Commands

```bash
npx tsc --noEmit
npx jest --testPathPatterns="local-content" --silent
npm run build
```

---

## 8. Next Phase

**WAVE 5 PHASE B — Domain Model + Calculation Contract**
- Fix the financial evaluation formula
- Add input validation
- Add traceability
- Write comprehensive tests

---

## 9. Sign-Off

**Status:** PHASE A COMPLETE — Ready for PHASE B

**Findings:**
1. Current implementation has a critical formula error (missing LC% normalization)
2. Missing input validation
3. Missing traceability

**Decisions:**
1. Normalize LC% to [0, 1] before applying weight
2. ListedBonus = 5 percentage points = 0.05
3. Validate bidPrice >= lowestBidPrice
4. Return error for zero bid price
5. Leave rank null for tied bids
6. Use 4 decimal places for rounding

**Next Phase:** PHASE B — Fix formula and implement traceability
