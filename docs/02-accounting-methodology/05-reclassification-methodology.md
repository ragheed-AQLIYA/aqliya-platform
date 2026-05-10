# Reclassification Methodology

## Purpose

This document defines how AuditOS identifies, generates, and applies reclassification entries. Reclassifications adjust the presentation of accounts without changing their underlying balances — they ensure financial statements are presented in accordance with the applicable accounting standard.

## Reclassification vs. Adjustment

| Type | Description | Effect | Requires Journal Entry? |
|------|-------------|--------|------------------------|
| Reclassification | Change in presentation only | No change to net income or equity | No — presentation change only |
| Adjustment | Change to account balance | Changes net income or equity | Yes — requires journal entry |

AuditOS handles reclassifications. Adjustments require professional judgment and are outside system scope.

## When Reclassification Is Needed

| Scenario | Example |
|----------|---------|
| Wrong category | Marketing expense classified as administrative |
| Wrong classification | Loan classified as current when portion is non-current |
| Wrong statement | Capital expenditure classified as expense |
| Netting | Asset and liability netted instead of gross presentation |
| Gross presentation | Revenue and cost presented net instead of gross |

## Reclassification Types

### Category Reclassification

```txt
Original:    Legal Fees → Administrative Expenses
Reclassify:  Legal Fees → Professional Fees
Reason:      More accurate presentation for legal services
```

### Classification Reclassification

```txt
Original:    Loan Payable → Current Liability (full amount)
Reclassify:  Loan Payable → Current Portion (due within 12 months)
             Loan Payable → Non-Current Portion (due after 12 months)
Reason:      IFRS requires current/non-current split
```

### Statement Reclassification

```txt
Original:    Equipment Purchase → Operating Expense
Reclassify:  Equipment Purchase → Property, Plant and Equipment
Reason:      Capital expenditure, not operating expense
```

## Reclassification Generation Rules

### Balance Sheet Reclassifications

| Condition | Reclassification |
|-----------|------------------|
| Bank overdraft in cash account | Reclassify to Loans and Borrowings (current liability) |
| Director current account (debit) | Reclassify to Related Party Receivables |
| Director current account (credit) | Reclassify to Related Party Payables |
| Advances to suppliers | Reclassify to Prepayments (if not yet delivered) |
| Provisions included in payables | Reclassify to Provisions (separate line) |

### Income Statement Reclassifications

| Condition | Reclassification |
|-----------|------------------|
| Bank charges in administrative expenses | Reclassify to Finance Costs |
| Foreign exchange gains/losses in other income | Reclassify to Finance Costs (or separate line) |
| Gain on asset disposal in revenue | Reclassify to Other Income |
| Exceptional items in operating expenses | Reclassify to Exceptional Items (separate line) |

## Reclassification Workflow

```txt
1. System identifies potential reclassification from mapping and classification analysis
2. System generates reclassification proposal with rationale
3. Reviewer reviews and confirms or rejects proposal
4. Confirmed reclassification is applied to the financial statement draft
5. Reclassification is recorded in the audit trail with reviewer attribution
```

## Reclassification Output

Each applied reclassification produces:

```txt
Reclassification Entry
  From: Administrative Expenses (6110)
  To:   Professional Fees (6120)
  Amount: SAR 50,000
  Rationale: Legal fees are professional fees, not administrative
  Approved By: Reviewer Name
  Date: 2026-05-08
```
