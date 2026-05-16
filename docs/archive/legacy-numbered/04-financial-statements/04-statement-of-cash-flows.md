# Statement of Cash Flows

## Purpose

This document defines how AuditOS generates the draft Statement of Cash Flows from mapped trial balance data.

## Structure

### Indirect Method (Standard)

```txt
Statement of Cash Flows
  Operating Activities
    Profit Before Tax
    Adjustments for:
      Depreciation
      Finance Costs
      (Gain)/Loss on Disposal
    Changes in:
      Trade Receivables
      Inventory
      Trade Payables
    Cash Generated from Operations
    Finance Costs Paid
    Zakat and Tax Paid
    Net Cash from Operating Activities

  Investing Activities
    Purchase of PPE
    Proceeds from Disposal
    Net Cash from Investing Activities

  Financing Activities
    Proceeds from Loans
    Repayment of Loans
    Dividends Paid
    Net Cash from Financing Activities

  Net Change in Cash
  Cash at Beginning of Period
  Cash at End of Period
```

## Generation Rules

### Indirect Method Logic

```txt
Cash Flow from Operating Activities:
  Start with: Profit Before Tax
  Add back: Depreciation, Finance Costs
  Adjust for: Changes in working capital accounts
    Increase in Receivables → Deduct
    Decrease in Receivables → Add
    Increase in Inventory → Deduct
    Decrease in Inventory → Add
    Increase in Payables → Add
    Decrease in Payables → Deduct
  Deduct: Finance Costs Paid, Zakat/Tax Paid
```

### Investing Activities

| Activity | Source |
|----------|--------|
| Purchase of PPE | Increase in fixed assets at cost |
| Sale of PPE | Decrease in fixed assets, gain/loss on disposal |
| Purchase of investments | Increase in investment accounts |
| Sale of investments | Decrease in investment accounts |

### Financing Activities

| Activity | Source |
|----------|--------|
| Loan proceeds | Increase in loan accounts |
| Loan repayment | Decrease in loan accounts |
| Capital introduced | Increase in share capital |
| Dividends paid | Decrease in retained earnings / dividend account |

### Cash Reconciliation

```txt
Closing Cash = Opening Cash + Net Cash from Operating
             + Net Cash from Investing + Net Cash from Financing
```

## Data Requirements

| Data Point | Required | If Missing |
|------------|----------|------------|
| Opening cash balance | Yes | Use closing cash only, no movement |
| Current year profit | Yes | Cannot generate operating section |
| Comparative balance sheet | Recommended | Working capital changes unavailable |
| Depreciation amount | Recommended | Operating adjustment unavailable |
| Fixed asset purchases/sales | Recommended | Investing section incomplete |
| Loan movements | Recommended | Financing section incomplete |
| Dividend information | If applicable | Financing section incomplete |

## Limitations

| Limitation | Impact |
|------------|--------|
| No opening balances | Cannot calculate changes — operating section limited |
| No comparative data | Working capital changes unavailable |
| No fixed asset register | Investing activities incomplete |
| No loan schedule | Financing activities may be incomplete |

When data is insufficient, the system generates what it can and flags gaps.
