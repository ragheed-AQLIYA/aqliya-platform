# LCGPA Financial Evaluation (Article 17) — Implementation Guide

**Date:** 2026-08-20
**Status:** WAVE 5 COMPLETE
**Author:** Principal Regulatory Software Architect

---

## 1. Overview

The Financial Evaluation module implements the Article 17 tender scoring formula for government procurement. It evaluates supplier bids based on price competitiveness and local content commitment.

---

## 2. Regulatory Formula

### 2.1 Article 17 Formula

```
Evaluation = PriceScore + LCScore

Where:
  PriceScore = (LowestBid / EvaluatedBid) × 60
  LCScore = ((TargetedLC% × 50% + BaselineLC% × 50%) / 100 + ListedBonus / 100) × 40
  ListedBonus = 5 if supplier is listed on Tadawul/Nomu (else 0)
```

### 2.2 Score Ranges

| Component | Range | Weight | Description |
|-----------|-------|--------|-------------|
| PriceScore | [0, 60] | 60% | Price competitiveness |
| LCScore | [0, 40] | 40% | Local content commitment |
| OverallScore | [0, 100] | 100% | Combined evaluation score |

### 2.3 LC% Normalization

**Critical:** LC% values are percentages in the range [0, 100]. The formula normalizes them to [0, 1] before applying the weight:

```
lcNormalized = (TargetedLC% × 0.5 + BaselineLC% × 0.5) / 100
lcScore = (lcNormalized + ListedBonus / 100) × 40
```

This produces a score in the range [0, 40] as intended.

---

## 3. Implementation Details

### 3.1 Files

| File | Purpose |
|------|---------|
| `src/lib/local-content/lcgpa/types.ts` | Type definitions |
| `src/lib/local-content/lcgpa/calculation-engine.ts` | Calculation functions |
| `src/lib/local-content/lcgpa/calculation-trace.ts` | Traceability functions |
| `src/lib/local-content/lcgpa/__tests__/calculation-engine.test.ts` | Unit tests |

### 3.2 Types

#### FinancialEvaluationInputs

```typescript
interface FinancialEvaluationInputs {
  tenderReference: string;      // Tender reference number
  supplierId: string;           // Supplier being evaluated
  supplierName: string;         // Supplier name
  bidPrice: number;             // This supplier's bid price (SAR)
  lowestBidPrice: number;       // Lowest qualifying bid price (SAR)
  baselineLcPct: number;        // Supplier's baseline LC% [0, 100]
  targetedLcPct: number;        // Supplier's committed LC% target [0, 100]
  isListedCompany: boolean;     // Whether supplier is listed on Tadawul/Nomu
}
```

#### FinancialEvaluationResult

```typescript
interface FinancialEvaluationResult {
  priceScore: number;           // Price component [0, 60]
  lcScore: number;              // LC component [0, 40]
  listedCompanyBonus: number;   // Bonus: 0 or 5
  overallScore: number;         // Combined score [0, 100]
  rank: number | null;          // Rank among all bids (1 = best)
}
```

#### FinancialEvaluationOutput

```typescript
interface FinancialEvaluationOutput {
  success: boolean;             // Whether calculation succeeded
  result: FinancialEvaluationResult | null;  // Result (null if failed)
  error: FinancialEvaluationError | null;    // Error code (null if succeeded)
  errorMessage: string | null;  // Human-readable error (null if succeeded)
  warnings: string[];           // Input validation warnings
}
```

#### FinancialEvaluationTrace

```typescript
interface FinancialEvaluationTrace {
  evaluationRunId: string;      // Unique run ID (fev_{timestamp}_{random})
  method: CalculationMethod;    // "lcgpa_v1"
  ruleVersion: string;          // Regulatory rule version
  evaluatedAt: string;          // ISO timestamp
  evaluatedById: string | null; // User who triggered evaluation
  inputs: FinancialEvaluationInputs;  // Complete input snapshot
  intermediates: {              // Intermediate calculations
    priceRatio: number;
    lcBlendRaw: number;
    lcNormalized: number;
    listedBonusRaw: number;
    listedBonusNormalized: number;
  };
  result: FinancialEvaluationResult;
  evidenceRefs: EvidenceReference[];
}
```

### 3.3 Functions

#### computeFinancialEvaluation

```typescript
function computeFinancialEvaluation(
  inputs: FinancialEvaluationInputs,
): FinancialEvaluationOutput
```

Computes Article 17 Financial Evaluation score.

**Validation:**
- `BID_PRICE_ZERO`: bidPrice = 0
- `BID_PRICE_NEGATIVE`: bidPrice < 0
- `LOWEST_BID_PRICE_NEGATIVE`: lowestBidPrice < 0
- `BID_BELOW_LOWEST`: bidPrice < lowestBidPrice
- `BASELINE_LC_PCT_OUT_OF_RANGE`: baselineLcPct not in [0, 100]
- `TARGETED_LC_PCT_OUT_OF_RANGE`: targetedLcPct not in [0, 100]

**Warnings:**
- "Bid price equals lowest bid price"
- "Both baseline and target LC% are zero"

#### rankFinancialEvaluations

```typescript
function rankFinancialEvaluations(
  evaluations: FinancialEvaluationOutput[],
): FinancialEvaluationOutput[]
```

Ranks multiple financial evaluation results. Returns array sorted by rank (best first), with failed evaluations at the end.

**Behavior:**
- Filters successful evaluations
- Sorts by overallScore descending
- Assigns ranks (tied scores get same rank)
- Returns sorted array with failed evaluations at end

#### validateFinancialEvaluationInputs

```typescript
function validateFinancialEvaluationInputs(
  inputs: FinancialEvaluationInputs,
): FinancialEvaluationError[]
```

Validates financial evaluation inputs. Returns array of errors (empty = valid).

#### createFinancialEvaluationTrace

```typescript
function createFinancialEvaluationTrace(
  inputs: FinancialEvaluationInputs,
  evaluatedById?: string,
  evidenceRefs?: EvidenceReference[],
): FinancialEvaluationTrace
```

Creates a full traceability record for a financial evaluation run.

#### verifyFinancialEvaluationTrace

```typescript
function verifyFinancialEvaluationTrace(
  trace: FinancialEvaluationTrace,
): boolean
```

Verifies that a trace's result matches a fresh computation from its inputs.

---

## 4. Test Coverage

### 4.1 Test Categories

| Category | Tests | Coverage |
|----------|-------|----------|
| Unit Tests | 12 | Core calculation functions |
| Ranking Tests | 3 | Multi-bid ranking |
| Validation Tests | 8 | Input validation |
| Traceability Tests | 4 | Trace creation and verification |
| **Total** | **27** | **100% of functions** |

### 4.2 Test Cases

**Unit Tests:**
- Correct Article 17 score calculation
- Listed company bonus (+5%)
- Same price as lowest bid
- Zero bid price error
- Negative bid price error
- Bid below lowest error
- LC% out of range error
- Negative LC% error
- Boundary: LC% = 0%
- Boundary: LC% = 100%
- Equal baseline and target
- Warning: bid equals lowest
- Warning: both LC% zero

**Ranking Tests:**
- Correct ranking of bids
- Same rank for tied scores
- Preserve failed evaluations at end

**Validation Tests:**
- Valid inputs return empty array
- Detect zero bid price
- Detect negative bid price
- Detect bid below lowest
- Detect LC% out of range
- Detect multiple errors
- Allow zero lowest bid
- Allow bid equals lowest

**Traceability Tests:**
- Create reproducible trace
- Verify trace reproducibility
- Detect tampered trace
- Include evidence references

---

## 5. Usage Examples

### 5.1 Basic Evaluation

```typescript
import { computeFinancialEvaluation } from "@/lib/local-content/lcgpa";

const output = computeFinancialEvaluation({
  tenderReference: "T-2026-001",
  supplierId: "SUP-001",
  supplierName: "Saudi Supplier",
  bidPrice: 1000000,
  lowestBidPrice: 900000,
  baselineLcPct: 60,
  targetedLcPct: 75,
  isListedCompany: false,
});

if (output.success) {
  console.log(`Price Score: ${output.result!.priceScore}`);
  console.log(`LC Score: ${output.result!.lcScore}`);
  console.log(`Overall: ${output.result!.overallScore}`);
} else {
  console.error(`Error: ${output.error}`);
}
```

### 5.2 Ranking Multiple Bids

```typescript
import {
  computeFinancialEvaluation,
  rankFinancialEvaluations,
} from "@/lib/local-content/lcgpa";

const bids = [
  { bidPrice: 1000000, baselineLcPct: 60, targetedLcPct: 70, ... },
  { bidPrice: 900000, baselineLcPct: 65, targetedLcPct: 75, ... },
  { bidPrice: 1100000, baselineLcPct: 55, targetedLcPct: 65, ... },
];

const outputs = bids.map(bid => computeFinancialEvaluation({
  ...bid,
  tenderReference: "T-2026-001",
  supplierId: bid.supplierId,
  lowestBidPrice: Math.min(...bids.map(b => b.bidPrice)),
  isListedCompany: false,
}));

const ranked = rankFinancialEvaluations(outputs);
// ranked[0] = best bid (rank 1)
// ranked[1] = second best (rank 2)
// etc.
```

### 5.3 Creating Trace for Audit

```typescript
import { createFinancialEvaluationTrace } from "@/lib/local-content/lcgpa";

const trace = createFinancialEvaluationTrace(
  inputs,
  "user-001",  // evaluatedById
  [],           // evidenceRefs (auto-generated if empty)
);

// Store trace for audit trail
await saveAuditRecord(trace);
```

### 5.4 Verifying Trace

```typescript
import { verifyFinancialEvaluationTrace } from "@/lib/local-content/lcgpa";

const isReproducible = verifyFinancialEvaluationTrace(storedTrace);
if (!isReproducible) {
  console.error("Trace verification failed — possible tampering");
}
```

---

## 6. Error Handling

### 6.1 Error Codes

| Code | Arabic Message | English Message |
|------|----------------|-----------------|
| BID_PRICE_ZERO | سعر العرض لا يمكن أن يكون صفر | Bid price cannot be zero |
| BID_PRICE_NEGATIVE | سعر العرض لا يمكن أن يكون سالباً | Bid price cannot be negative |
| LOWEST_BID_PRICE_NEGATIVE | سعر أقل عرض لا يمكن أن يكون سالباً | Lowest bid price cannot be negative |
| BID_BELOW_LOWEST | سعر العرض أقل من أقل عرض مسجل | Bid price is below lowest recorded bid |
| BASELINE_LC_PCT_OUT_OF_RANGE | نسبة المحتوى المحلي الأساسية يجب أن تكون بين 0 و 100 | Baseline LC% must be between 0 and 100 |
| TARGETED_LC_PCT_OUT_OF_RANGE | نسبة المحتوى المحلي المستهدفة يجب أن تكون بين 0 و 100 | Targeted LC% must be between 0 and 100 |

### 6.2 Error Response Pattern

```typescript
const output = computeFinancialEvaluation(inputs);
if (!output.success) {
  // Handle error
  switch (output.error) {
    case "BID_PRICE_ZERO":
      // Show error: Bid price cannot be zero
      break;
    case "BID_BELOW_LOWEST":
      // Show error: Bid price is below lowest recorded bid
      break;
    // ... handle other errors
  }
}
```

---

## 7. Audit Trail

### 7.1 Traceability Record

Every financial evaluation produces a `FinancialEvaluationTrace` that includes:

1. **Input snapshot** — Complete inputs for deterministic replay
2. **Intermediates** — All intermediate calculation values
3. **Result** — Final evaluation scores
4. **Evidence** — References to source data
5. **Metadata** — Run ID, method, rule version, timestamp, actor

### 7.2 Verification

Stored traces can be verified against fresh computations:

```typescript
const isReproducible = verifyFinancialEvaluationTrace(storedTrace);
```

This ensures:
- No tampering with historical evaluations
- Regulatory compliance can be demonstrated
- Calculations are deterministic and reproducible

---

## 8. Known Limitations

1. **No persistence** — Evaluations are not automatically saved to database. Persistence must be implemented separately if needed.

2. **No integration with tender ranking** — Financial evaluation is standalone. Integration with tender matching system requires additional wiring.

3. **No bid comparison** — The function evaluates a single bid. Multi-bid comparison requires calling the function multiple times and using `rankFinancialEvaluations`.

4. **Tie-breaking** — Tied bids receive the same rank. No tie-breaking rule is implemented (regulation does not specify one).

---

## 9. Next Steps

1. **WAVE 6: Mandatory List module** — XLSX import parser + search + classification wiring
2. **WAVE 7: Gradual Plan + Penalties** — Workflow logic + 60-day deadline
3. **WAVE 8: SME + Ownership % + Listed Company + Price Preference**
4. **WAVE 9: Reviewer workflow** — Submission package for external LCGPA auditor
5. **WAVE 10: UI + integration + full regression**

---

## 10. Validation

### TypeScript

```bash
npx tsc --noEmit
```

### Unit Tests

```bash
npx jest --testPathPatterns="lcgpa/__tests__/calculation-engine" --silent
```

### Full LocalContentOS Suite

```bash
npx jest --testPathPatterns="local-content" --silent
```

**Results:**
- TypeScript: 0 errors
- Calculation engine: 66/66 tests pass
- LocalContentOS: 484/490 tests pass (6 skipped = AI advisor)
