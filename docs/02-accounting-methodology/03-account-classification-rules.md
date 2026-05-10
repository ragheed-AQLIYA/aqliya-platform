# Account Classification Rules

## Purpose

This document defines the rules AuditOS uses to classify accounts into financial statement categories. Classification is the foundation of financial statement generation — correct classification produces accurate statements; misclassification produces misleading drafts.

## Classification Dimensions

Every account is classified along four dimensions:

| Dimension | Values | Source |
|-----------|--------|--------|
| Statement | Balance Sheet, Income Statement, Equity, Cash Flow, Notes | Mapping |
| Category | Asset, Liability, Equity, Revenue, Expense | Account type + balance nature |
| Classification | Current, Non-Current, Operating, Financing, Investing | Account nature + standard classification |
| Presentation Order | Standard IFRS/GAAP order | Accounting standard |

## Classification Rules

### Primary Rule: Balance Nature + Account Type

| Balance Nature | Typical Account Type | Classification |
|----------------|---------------------|----------------|
| Debit | Asset | Asset |
| Credit | Liability | Liability |
| Credit | Equity | Equity |
| Credit | Revenue | Revenue |
| Debit | Expense | Expense |

### Current vs. Non-Current Classification

| Account Type | Current Classification | Non-Current Classification |
|-------------|----------------------|---------------------------|
| Cash | Current | — |
| Receivables | Current (trade) | Non-current (if > 12 months) |
| Inventory | Current | — |
| Prepayments | Current | Non-current (if > 12 months) |
| Investments | Current (trading) | Non-current (held-to-maturity) |
| Property, Plant & Equipment | — | Non-current |
| Intangible Assets | — | Non-current |
| Payables | Current (trade) | Non-current |
| Loans | Current portion (≤ 12 months) | Non-current portion (> 12 months) |
| Provisions | Current | Non-current |

### Operating vs. Non-Operating Classification (Income Statement)

| Revenue/Expense Type | Classification |
|----------------------|----------------|
| Primary business revenue | Operating |
| Cost of sales | Operating |
| Selling expenses | Operating |
| Administrative expenses | Operating |
| Finance costs | Financing |
| Investment income | Investing |
| Other income | Non-operating |
| Exceptional items | Non-operating |

## Reclassification Rules

When an account's natural classification differs from its mapped classification, a reclassification entry is generated:

```txt
Example:
Account:     Legal Fees (Expense)
Original:    Operating Expense — Administrative
Reclassify:  Operating Expense — Professional Fees
Rationale:   IFRS Presentation — Legal fees are professional fees, not administrative
```

### Common Reclassification Patterns

| Scenario | Reclassification |
|----------|-----------------|
| Rent classified as administrative expense | Reclassify to Operating Expenses |
| Bank charges classified as administrative | Reclassify to Finance Costs |
| Gain on asset sale classified as revenue | Reclassify to Other Income |
| Provisions classified as payables | Reclassify to Provisions (non-current or current) |
| Advances to suppliers classified as receivables | Reclassify to Prepayments or Advances |

## Classification Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Negative balance in asset account | Flag — may indicate credit balance or reclassification need |
| Overdraft classified as cash | Reclassify to Loans and Borrowings (current liability) |
| Director loans | Classify as Related Party Receivables/Payables |
| Intercompany accounts | Classify as Related Party — separate from trade |
| Provisions with uncertain timing | Classify as non-current unless expected within 12 months |
| Deferred tax | Classify as non-current (standard practice) |
