# Statement of Profit or Loss

## Purpose

This document defines how AuditOS generates the draft Statement of Profit or Loss (Income Statement) from mapped trial balance data.

## Structure

### Standard IFRS Presentation (by Function)

```txt
Statement of Profit or Loss
  Revenue
  Cost of Revenue
  Gross Profit
  Other Income
  Selling and Distribution Expenses
  Administrative Expenses
  Operating Profit
  Finance Costs
  Profit Before Tax
  Zakat and Tax Expense
  Profit for the Year
```

### Standard IFRS Presentation (by Nature)

```txt
Statement of Profit or Loss
  Revenue
  Raw Materials and Consumables Used
  Employee Benefits Expense
  Depreciation and Amortization
  Other Expenses
  Total Expenses
  Other Income
  Finance Costs
  Profit Before Tax
  Zakat and Tax Expense
  Profit for the Year
```

## Generation Rules

### Revenue Recognition

| Criteria | Treatment |
|----------|-----------|
| Single revenue account | Report as Revenue |
| Multiple revenue streams | Aggregate or separate based on IFRS 15 disclosure |
| Revenue returns or discounts | Show as reduction of revenue (not expense) |

### Cost of Revenue

| Criteria | Treatment |
|----------|-----------|
| Cost of sales accounts | Aggregate as Cost of Revenue |
| Purchases and inventory change | Calculate: Purchases + Opening Inventory - Closing Inventory |

### Gross Profit Calculation

```txt
Gross Profit = Revenue - Cost of Revenue
```

### Operating Expenses

| Classification | Examples |
|----------------|----------|
| Selling expenses | Marketing, sales commissions, advertising |
| Administrative expenses | Salaries, rent, office supplies, professional fees |
| Other operating expenses | Research, IT, facilities |

### Finance Costs

| Item | Treatment |
|------|-----------|
| Interest on loans | Finance Costs |
| Bank charges | Finance Costs |
| Foreign exchange losses | Finance Costs or separate line |
| Interest income | Other Income |

### Zakat and Tax

| Item | Treatment | Applicable Standard |
|------|-----------|---------------------|
| Zakat expense | Separate line after Profit Before Tax | SOCPA |
| Corporate income tax | Income Tax Expense | IFRS |
| Deferred tax | Income Tax Expense | IFRS |

## Validation Rules

| Check | Condition |
|-------|-----------|
| Gross Profit ≤ Revenue | Gross margin cannot exceed 100% |
| Operating Expenses ≤ Revenue | Unusual if not |
| Finance costs reasonable | Should correlate with loan balances |
| Profit Before Tax = Revenue - All Expenses | Formula check |

## Draft Output Format

```txt
AuditOS — Draft Statement of Profit or Loss
Client:     ABC Company
Period:     Year Ended 31 December 2026
Status:     DRAFT — NOT FINAL

                                   Note   2026           2025
Revenue                            11     8,000,000      7,200,000
Cost of Revenue                    12    (4,800,000)    (4,320,000)
Gross Profit                              3,200,000      2,880,000

Other Income                        13       150,000        100,000
Selling Expenses                    14      (800,000)      (720,000)
Administrative Expenses             15    (1,200,000)    (1,080,000)
Operating Profit                            1,350,000      1,180,000

Finance Costs                       16      (200,000)      (180,000)
Profit Before Tax                           1,150,000      1,000,000

Zakat and Tax Expense               17      (172,500)      (150,000)

PROFIT FOR THE YEAR                          977,500        850,000
```

## Review Checklist

| Check | Action | Verified |
|-------|--------|----------|
| Revenue correctly classified | Review revenue accounts | ☐ |
| Cost of Revenue matches inventory movement (if applicable) | Verify formula | ☐ |
| Operating expenses correctly classified | Review each expense line | ☐ |
| Finance costs reasonable | Compare to loan balances | ☐ |
| All income and expense accounts mapped | Review completeness | ☐ |
| Comparative data correct | Review prior year | ☐ |
| Zakat/tax calculated correctly (if applicable) | Review methodology | ☐ |
