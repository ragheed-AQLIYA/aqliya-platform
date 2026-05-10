# Trial Balance Requirements

## Purpose

This document defines the data requirements for trial balance ingestion in AuditOS. The quality and completeness of the trial balance directly affect the accuracy of financial statement drafts, note generation, and evidence requirement identification.

## Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Account Code | String | Yes | Client account identifier (numeric or alphanumeric) |
| Account Name | String | Yes | Client account name (Arabic, English, or both) |
| Debit | Decimal | Yes* | Debit balance for the period |
| Credit | Decimal | Yes* | Credit balance for the period |
| Opening Balance | Decimal | No | Beginning balance for comparative purposes |
| Current Year Balance | Decimal | Yes | Balance for the current reporting period |
| Prior Year Balance | Decimal | No | Comparative period balance |
| Currency | String | No | Transaction currency (default: SAR or reporting currency) |
| Period | String | No | Reporting period identifier |
| Accounting Standard | String | No | IFRS, GAAS, SOCPA, etc. |
| Entity Type | String | No | Company type classification |

*At least one of Debit or Credit must be provided. Net balance may be calculated.

## Recommended Fields

| Field | Purpose |
|-------|---------|
| Opening Balance | Enables movement analysis and cash flow statement generation |
| Prior Year Balance | Enables comparative analysis and period-over-period flagging |
| Account Type | Category hint (Asset, Liability, Equity, Revenue, Expense) |
| Department/Cost Center | Enables segment reporting where applicable |
| Sub-account of | Parent account code for hierarchical account structures |

## File Format Requirements

### CSV Format

```csv
AccountCode,AccountName,OpeningBalance,CurrentYearDebit,CurrentYearCredit,PriorYearBalance
1000,نقد / Cash on Hand,50000,50000,0,45000
1100,بنك / Bank Account - Current,200000,300000,50000,180000
1200,حسابات قبض / Accounts Receivable,150000,200000,50000,120000
```

### Required Structure Rules

| Rule | Enforcement |
|------|-------------|
| Header row must exist | Required — column names parsed for mapping |
| At least one balance column | Required — debit or credit for current period |
| Account Code must be unique | Required — duplicate codes are flagged |
| Total Debits = Total Credits | Required — unbalanced trial balance is blocked |
| No empty account codes | Required — each row must have a code |
| Numeric balances | Required — non-numeric values are flagged |

## Validation Rules

| Validation | Action on Failure |
|------------|-------------------|
| File format recognized (CSV/XLSX) | Reject with format guidance |
| Required columns present | Reject with missing column details |
| Total debits = Total credits | Warning — blocked until resolved |
| All account codes unique | Flag duplicates — require resolution |
| Balance values are numeric | Flag non-numeric values |
| Reasonable balance ranges | Flag extreme values for review |
| Comparative period consistency | Flag unusual period-over-period changes |

## Trust Assessment

After validation, each trial balance receives a trust state:

| State | Criteria |
|-------|----------|
| Trusted | All validations pass, reasonable balances, clean structure |
| Conditionally Trusted | Minor issues (missing comparative data, some warnings) — usable with caution |
| Blocked | Major issues (unbalanced, missing required fields, format errors) — must be corrected before proceeding |

## Handling Multi-Entity Trial Balances

When a trial balance contains data for multiple entities:

- Each entity should be identified by a unique entity code or column
- The system can process consolidated or individual entity views
- Entity-level validation is performed separately
- Consolidated balance is validated as a separate view
