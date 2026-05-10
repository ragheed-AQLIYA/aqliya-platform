# Note-to-Financial-Statement Mapping

## Purpose

This document defines how AuditOS maps notes to financial statement line items. Each note corresponds to one or more statement lines and provides the detailed breakdown, movement schedule, or disclosure required by the applicable accounting standard.

## Mapping Structure

```txt
Statement Line                Note Reference       Note Title
──────────────────────────────────────────────────────────────
Cash and Cash Equivalents     Note 10              Cash and Cash Equivalents
Trade Receivables             Note 9               Trade Receivables
Inventory                     Note 8               Inventory
Property, Plant & Equipment   Note 6               Property, Plant and Equipment
Loans and Borrowings          Note 18              Loans and Borrowings
Trade Payables                Note 19              Trade Payables
Revenue                       Note 11              Revenue
Cost of Revenue               Note 12              Cost of Revenue
```

## Standard Note Mapping

### Statement of Financial Position

| SFP Line Item | Note Number | Note Title |
|---------------|-------------|------------|
| Property, Plant and Equipment | 6 | Property, Plant and Equipment |
| Intangible Assets | 7 | Intangible Assets |
| Inventory | 8 | Inventory |
| Trade Receivables | 9 | Trade Receivables |
| Cash and Cash Equivalents | 10 | Cash and Cash Equivalents |
| Share Capital | 22 | Share Capital |
| Reserves | 23 | Reserves |
| Retained Earnings | 24 | Retained Earnings |
| Loans and Borrowings | 18 | Loans and Borrowings |
| Trade Payables | 19 | Trade Payables |
| Zakat and Tax Payable | 17 | Zakat and Taxation |

### Statement of Profit or Loss

| P&L Line Item | Note Number | Note Title |
|---------------|-------------|------------|
| Revenue | 11 | Revenue |
| Cost of Revenue | 12 | Cost of Revenue |
| Selling Expenses | 14 | Selling and Distribution Expenses |
| Administrative Expenses | 15 | Administrative Expenses |
| Finance Costs | 16 | Finance Costs |
| Zakat and Tax Expense | 17 | Zakat and Taxation |

## Movement Schedule Notes

Some notes require movement schedules showing opening balance, additions, disposals, and closing balance:

### Property, Plant and Equipment Movement

```txt
                      Land    Buildings    Equipment    Total
Opening Cost          XXX     XXX          XXX          XXX
Additions             XXX     XXX          XXX          XXX
Disposals            (XXX)   (XXX)        (XXX)        (XXX)
Closing Cost          XXX     XXX          XXX          XXX

Opening Depreciation  XXX     XXX          XXX          XXX
Depreciation Charge   XXX     XXX          XXX          XXX
Disposals            (XXX)   (XXX)        (XXX)        (XXX)
Closing Depreciation  XXX     XXX          XXX          XXX

Net Book Value        XXX     XXX          XXX          XXX
```

### Loans and Borrowings Movement

```txt
                     Current    Non-Current   Total
Opening Balance      XXX        XXX           XXX
New Loans            XXX        XXX           XXX
Repayments          (XXX)      (XXX)         (XXX)
Closing Balance      XXX        XXX           XXX
```

## Automatic Note Generation

For each statement line, the system:

1. Identifies the corresponding note from the mapping
2. Populates note amounts from the trial balance
3. Generates movement schedules where opening data is available
4. Flags notes that require additional information
5. Assigns note numbers in standard order

## Note Numbering Convention

```txt
Notes 1-5:    General notes (basis of preparation, accounting policies)
Notes 6-10:   Asset notes
Notes 11-17:  Income statement notes
Notes 18-22:  Liability and equity notes
Notes 23+:    Other disclosures (commitments, contingencies, etc.)
```
