# Review Risk Framework

## Purpose

This document defines the risk framework AuditOS uses to categorize and prioritize review findings. The framework helps reviewers focus on the areas of highest risk and materiality.

## Risk Categories

### 1. Classification Risk

The risk that an account is classified in the wrong financial statement category.

| Indicator | Potential Impact |
|-----------|-----------------|
| Revenue classified as liability | Misstated revenue and liabilities |
| Asset classified as expense | Understated assets, overstated expenses |
| Current liability classified as non-current | Misstated liquidity ratios |
| Operating expense classified as cost of revenue | Misstated gross margin |

### 2. Completeness Risk

The risk that all transactions, accounts, or disclosures that should be included are not included.

| Indicator | Potential Impact |
|-----------|-----------------|
| Missing comparative data | Incomplete trend analysis |
| Zero-balance accounts without explanation | Potentially missing activity |
| No revenue account | Critical missing data |
| No cost of sales | Incomplete income statement |

### 3. Cut-off Risk

The risk that transactions are recorded in the wrong period.

| Indicator | Potential Impact |
|-----------|-----------------|
| Large period-end adjustments | Potential cut-off issues |
| Significant post-period transactions | May relate to current period |
| Unusual timing of revenue recognition | Potential cut-off misstatement |

### 4. Valuation Risk

The risk that account balances are not stated at appropriate values.

| Indicator | Potential Impact |
|-----------|-----------------|
| Fixed assets without depreciation | Overstated assets |
| Receivables at full value without impairment | Overstated assets |
| Inventory at cost without NRV assessment | Overstated assets |
| Investments at cost without fair value assessment | Potential misstatement |

### 5. Presentation Risk

The risk that financial statement presentation does not comply with the applicable framework.

| Indicator | Potential Impact |
|-----------|-----------------|
| Non-standard account names | Potential presentation issues |
| Unusual grouping or aggregation | May obscure important detail |
| Missing required line items | Non-compliant presentation |

### 6. Disclosure Risk

The risk that required disclosures are missing or inadequate.

| Indicator | Potential Impact |
|-----------|-----------------|
| Related party accounts without disclosure | Non-compliance with disclosure requirements |
| Loan balances without terms | Incomplete disclosure |
| Contingent liabilities present | Missing disclosure of potential obligations |
| Zakat/tax accounts without methodology | Incomplete tax disclosure |

### 7. Supporting Evidence Risk

The risk that account balances lack sufficient appropriate audit evidence.

| Indicator | Potential Impact |
|-----------|-----------------|
| Large balances with no evidence uploaded | Evidence gap |
| Complex estimates with limited evidence | Valuation support gap |
| Related party transactions without contracts | Transaction validity risk |

## Risk Scoring

Each finding is scored across three dimensions:

| Dimension | Scale | Weight |
|-----------|-------|--------|
| Likelihood | 1-5 (Low to Almost Certain) | 40% |
| Magnitude | 1-5 (Trivial to Critical) | 40% |
| Detection Difficulty | 1-5 (Easy to Impossible) | 20% |

**Risk Score = (Likelihood × 0.4) + (Magnitude × 0.4) + (Detection × 0.2)**

### Risk Score Interpretation

| Score | Rating | Required Action |
|-------|--------|----------------|
| 4.1-5.0 | Critical | Partner review required. Must be resolved before publication. |
| 3.1-4.0 | High | Manager review required. Should be resolved before publication. |
| 2.1-3.0 | Medium | Reviewer action recommended. Monitor before publication. |
| 1.0-2.0 | Low | Document for awareness. No specific action required. |
