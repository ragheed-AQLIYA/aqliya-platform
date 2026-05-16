# Statement of Financial Position (Balance Sheet)

## Purpose

This document defines how AuditOS generates the draft Statement of Financial Position (Balance Sheet) from mapped trial balance data.

## Structure

### Standard IFRS Presentation

```txt
Statement of Financial Position
  ASSETS
    Non-Current Assets
      Property, Plant and Equipment
      Intangible Assets
      Investments
      Deferred Tax Assets
    Current Assets
      Inventory
      Trade Receivables
      Prepayments
      Cash and Cash Equivalents
  TOTAL ASSETS

  EQUITY AND LIABILITIES
    Equity
      Share Capital
      Reserves
      Retained Earnings
    Non-Current Liabilities
      Loans and Borrowings
      Provisions
      Deferred Tax Liabilities
    Current Liabilities
      Trade Payables
      Accruals
      Loans and Borrowings (Current Portion)
      Zakat and Tax Payable
  TOTAL EQUITY AND LIABILITIES
```

### Standard SOCPA Presentation

Same IFRS structure with additional zakat-related line items.

## Generation Rules

### Line Item Mapping

Each account mapped to the canonical financial model is assigned to a statement line. Multiple accounts may map to the same line:

```txt
Accounts:    1100 Bank - Current (SAR 500,000)
             1200 Cash on Hand (SAR 50,000)
             1300 Petty Cash (SAR 5,000)
Line Item:   Cash and Cash Equivalents (SAR 555,000)
```

### Aggregation Rules

| Rule | Description |
|------|-------------|
| All accounts mapped to same line | Sum balances to produce line item total |
| Negative balances within category | Flag for reclassification (e.g., overdraft) |
| Missing line items | Omit from statement (no zero-balance lines) |
| Comparative period | Include prior year amounts where available |

### Validation Rules

| Check | Condition |
|-------|-----------|
| Total Assets = Total Liabilities + Equity | Statement balances |
| Current Assets ≥ 0 | Reasonable range |
| Non-Current Assets ≥ 0 | Reasonable range |
| Equity section complete | All required equity accounts present |

## Balancing

The system automatically ensures the statement balances:

```txt
Total Assets = Total Liabilities + Total Equity

If not balanced (due to mapping gaps):
  → Identify missing or misclassified accounts
  → Generate balancing observation
  → Add suspense line item (clearly marked) if temporary
```

## Draft Output Format

```txt
AuditOS — Draft Statement of Financial Position
Client:     ABC Company
Period:     31 December 2026
Status:     DRAFT — NOT FINAL

                                   Note   2026           2025
ASSETS
Non-Current Assets
  Property, Plant and Equipment    6      2,500,000      2,300,000
  Intangible Assets                 7        200,000        150,000
Total Non-Current Assets                   2,700,000      2,450,000

Current Assets
  Inventory                         8        800,000        650,000
  Trade Receivables                  9      1,200,000      1,100,000
  Cash and Cash Equivalents        10        600,000        550,000
Total Current Assets                        2,600,000      2,300,000

TOTAL ASSETS                                5,300,000      4,750,000

EQUITY AND LIABILITIES
...
```

## Review Checklist

| Check | Action | Verified |
|-------|--------|----------|
| All accounts mapped to correct line items | Review mapping | ☐ |
| Statement balances | Verify totals | ☐ |
| Comparative data correct (if available) | Review prior year | ☐ |
| Classification (current/non-current) correct | Review each line | ☐ |
| Negative items properly classified | Review flagged items | ☐ |
| Suspense items identified and resolved | Review suspense | ☐ |
