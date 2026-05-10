# Notes Generation Methodology

## Purpose

This document defines how AuditOS generates draft notes to financial statements from trial balance data and account mappings. The notes system is what differentiates AuditOS from a simple trial balance formatter — it creates structured, disclosure-aware draft notes that mirror professional financial statement presentation.

## Generation Approach

AuditOS generates notes using three data layers:

```txt
Layer 1: Trial Balance Data
  - Account balances
  - Comparative period data
  - Directly populate note amounts

Layer 2: Account Mapping Context
  - Mapped FS line items
  - Classification decisions
  - Inform note structure and grouping

Layer 3: Supporting Data (where available)
  - Asset registers
  - Aging reports
  - Loan schedules
  - Or flagged as missing
```

## Supported Notes

| # | Note | Data Source | Trial Balance Only? |
|---|------|-------------|-------------------|
| 1 | Basis of Preparation | Entity configuration | Yes |
| 2 | Significant Accounting Policies | Policy library + entity context | Partial |
| 3 | Cash and Cash Equivalents | Trial balance cash accounts | Yes |
| 4 | Trade Receivables | Trial balance receivables | Partial (aging needed) |
| 5 | Inventory | Trial balance inventory | Partial (composition needed) |
| 6 | Property, Plant and Equipment | Trial balance fixed assets | Partial (register needed) |
| 7 | Loans and Borrowings | Trial balance loan accounts | Partial (schedule needed) |
| 8 | Trade Payables | Trial balance payables | Yes |
| 9 | Revenue | Trial balance revenue accounts | Yes |
| 10 | Expenses | Trial balance expense accounts | Yes |
| 11 | Zakat and Tax | Trial balance tax accounts | Partial (calculation needed) |
| 12 | Related Parties | Trial balance related party accounts | Partial (details needed) |
| 13 | Contingencies | Not available from trial balance | No |
| 14 | Commitments | Not available from trial balance | No |
| 15 | Subsequent Events | Not available from trial balance | No |

## Note Quality Levels

| Level | Description | Data Available |
|-------|-------------|----------------|
| Complete | All required amounts and disclosures populated | Trial balance + supporting data |
| Partial | Amounts populated, some disclosures missing | Trial balance only |
| Placeholder | Structure generated, amounts missing | No data available |
| Flagged | Note is required but cannot be drafted | Requires external input |

## Missing Note Data Flagging

When a note cannot be fully populated from trial balance data, the system flags the specific missing information:

```txt
Note: Property, Plant and Equipment
Missing Information:
  - Opening cost balance
  - Additions during the year
  - Disposals during the year
  - Depreciation charge for the year
  - Accumulated depreciation
  - Closing carrying amount

Available from trial balance:
  - Closing net book value (single account balance)
```

## Accounting Policies Library

The system includes a library of standard accounting policy templates mapped to the accounting standard (IFRS, GAAS, SOCPA):

```txt
Policy Template:
  - Basis of measurement
  - Functional and presentation currency
  - Revenue recognition policy
  - Property, plant and equipment measurement
  - Financial instruments classification
  - Impairment methodology
  - Provisions recognition
  - Zakat and tax accounting
```

Policies are populated based on entity type, industry, and accounting standard. All policies are draft templates that require reviewer confirmation.

## Disclosure Requirements Mapping

Each note maps to specific disclosure requirements from the applicable accounting standard:

```txt
IFRS 7  → Financial Instruments disclosures
IFRS 9  → Expected Credit Loss methodology
IFRS 15 → Revenue disaggregation
IFRS 16 → Leases
IAS 1   → Presentation of Financial Statements
IAS 2   → Inventory disclosures
IAS 16  → Property, Plant and Equipment disclosures
```

## Note Generation Workflow

```txt
1. Identify required notes based on account types and balances
2. Generate note structure with standard headings
3. Populate note amounts from trial balance data
4. Apply accounting policy templates
5. Flag missing information items
6. Present draft notes for reviewer review
7. Reviewer confirms, edits, or supplements note content
8. Approved notes included in publication package
```
