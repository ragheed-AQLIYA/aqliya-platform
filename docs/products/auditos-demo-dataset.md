# AuditOS — Demo Dataset v1

## Overview

This document describes the demo dataset seeded for AuditOS pilot demonstrations.

**Company:** Gulf Trading Co.
**Fiscal Period:** FY2025 (January 1 – December 31, 2025)
**Currency:** SAR (Saudi Riyal)
**Reporting Framework:** IFRS for SMEs
**Industry:** Wholesale Trade
**Registration:** CR-2021-88432

## Demo Status

All data in this dataset is **DEMO/SAMPLE** only. No financial outputs generated from this data should be treated as audited, verified, or suitable for official use.

## Default Demo Trial Balance — BALANCED

| Metric | Value |
|--------|-------|
| Total Accounts | 23 |
| Mapped Accounts | 23 (all confirmed) |
| Unmapped Accounts | 0 |
| Total Debits | SAR 10,505,000 |
| Total Credits | SAR 10,505,000 |
| Variance | SAR 0 (balanced) |

### Account Listing

#### Assets

| Code | Account | Debit (SAR) | Credit (SAR) | Balance (SAR) | PY Balance (SAR) |
|------|---------|-------------|--------------|---------------|-------------------|
| 1010 | Cash and Bank | 500,000 | — | 500,000 | 380,000 |
| 1020 | Accounts Receivable | 1,200,000 | — | 1,200,000 | 950,000 |
| 1030 | Inventory | 800,000 | — | 800,000 | 620,000 |
| 1040 | Prepayments | 75,000 | — | 75,000 | 60,000 |
| 1050 | Property and Equipment | 3,500,000 | — | 3,500,000 | 3,200,000 |
| 1051 | Accumulated Depreciation | — | 875,000 | (875,000) | (700,000) |

#### Liabilities

| Code | Account | Debit (SAR) | Credit (SAR) | Balance (SAR) | PY Balance (SAR) |
|------|---------|-------------|--------------|---------------|-------------------|
| 2010 | Accounts Payable | — | 950,000 | (950,000) | (780,000) |
| 2020 | Accrued Expenses | — | 95,000 | (95,000) | (95,000) |
| 2030 | Zakat/Tax Payable | — | 85,000 | (85,000) | (65,000) |
| 2040 | Short-term Loan | — | 500,000 | (500,000) | (500,000) |

#### Equity

| Code | Account | Debit (SAR) | Credit (SAR) | Balance (SAR) | PY Balance (SAR) |
|------|---------|-------------|--------------|---------------|-------------------|
| 3010 | Share Capital | — | 2,000,000 | (2,000,000) | (2,000,000) |
| 3020 | Retained Earnings | — | 705,000 | (705,000) | (520,000) |

#### Revenue

| Code | Account | Debit (SAR) | Credit (SAR) | Balance (SAR) | PY Balance (SAR) |
|------|---------|-------------|--------------|---------------|-------------------|
| 4010 | Sales Revenue | — | 4,500,000 | (4,500,000) | (3,800,000) |
| 4020 | Service Revenue | — | 750,000 | (750,000) | (520,000) |
| 5100 | Sundry Income (Other Income) | — | 45,000 | (45,000) | (25,000) |

#### Expenses

| Code | Account | Debit (SAR) | Credit (SAR) | Balance (SAR) | PY Balance (SAR) |
|------|---------|-------------|--------------|---------------|-------------------|
| 5010 | Cost of Sales | 2,800,000 | — | 2,800,000 | 2,200,000 |
| 5020 | Salaries and Wages | 900,000 | — | 900,000 | 780,000 |
| 5030 | Rent Expense | 240,000 | — | 240,000 | 240,000 |
| 5040 | Utilities Expense | 95,000 | — | 95,000 | 82,000 |
| 5050 | Depreciation Expense | 175,000 | — | 175,000 | 150,000 |
| 5060 | Professional Fees | 120,000 | — | 120,000 | 75,000 |
| 5070 | General and Administrative | 65,000 | — | 65,000 | 55,000 |
| 2050 | Finance Cost | 35,000 | — | 35,000 | 30,000 |

## Financial Statements

### Statement of Profit or Loss (Draft)

| Line | Amount (SAR) |
|------|-------------|
| Revenue | 5,295,000 |
| Cost of Sales | (2,800,000) |
| **Gross Profit** | **2,495,000** |
| Operating Expenses | (1,630,000) |
| **Net Profit** | **865,000** |

### Statement of Financial Position (Draft)

| Line | Amount (SAR) |
|------|-------------|
| **TOTAL ASSETS** | **5,200,000** |
| **TOTAL LIABILITIES AND EQUITY** | **5,200,000** |

## Demo Findings

| # | Title | Type | Severity | Status |
|---|-------|------|----------|--------|
| 1 | Revenue Concentration Risk | Observation | Medium | Open |
| 2 | Short-term Loan Classification | Disclosure Gap | High | Open |
| 3 | Missing Inventory Evidence | Disclosure Gap | High | In Review |
| 4 | Professional Fees Variance | Observation | Low | Draft |
| 5 | Finance Cost Disclosure | Disclosure Gap | Low | Draft |

## Recommendations

| # | Title | Linked Finding | Status |
|---|-------|---------------|--------|
| 1 | Perform Customer Concentration Analysis | Finding 1 | Suggested |
| 2 | Reclassify Short-term Loan as Non-Current | Finding 2 | Under Review |
| 3 | Request Inventory Count Sheet from Client | Finding 3 | Suggested |

## Evidence Requirements

| Evidence | Status | Linked To |
|----------|--------|-----------|
| gulf_trading_tb_fy2025.xlsx | Accepted | All accounts |
| bank_confirmation_samba.pdf | Accepted | Cash and Bank |
| ar_aging_report.pdf | Accepted | Accounts Receivable |
| ppe_schedule.xlsx | Accepted | Property and Equipment |
| loan_agreement.pdf | Reviewed | Short-term Loan |
| inventory_count_sheet.pdf | **Missing** | Inventory |

## Audit Team

| Name | Role | Email |
|------|------|-------|
| Khalid Al Saud | Partner | khalid@aqliya.sa |
| Farida Al Zamil | Manager | farida@aqliya.sa |
| Sarah Al Otaibi | Reviewer | sarah@aqliya.sa |
| Ahmed Al Ghamdi | Operator | ahmed@aqliya.sa |
| Faisal Al Harbi | Client Representative | client@gulf-trading.sa |

## Validation Warnings (Non-Blocking)

| Issue | Type | Severity | Description |
|-------|------|----------|-------------|
| Loan Classification | Validation | Warning | Short-term Loan may be non-current (24-month term) |
| Professional Fees Variance | Validation | Warning | 60% YoY increase without explanation |

## Unbalanced Trial Balance — Validation Scenario

For QA and validation testing, an unbalanced trial balance scenario can be created by modifying the default seed data. This scenario demonstrates AuditOS's ability to detect and report TB imbalances.

### How to Create Unbalanced Scenario

Modify the following accounts in the seed data to simulate a real-world unbalanced TB:

1. **Accrued Expenses (2020):** Change creditAmount from `95,000` to `-20,000` (negative credit anomaly)
2. **Retained Earnings (3020):** Change creditAmount from `705,000` to `1,200,000` (overstated RE)
3. **Sundry Income (5100):** Change mapping status from `confirmed` to `pending` (unmapped account)

This produces:
- Total Debits: SAR 10,505,000
- Total Credits: SAR 10,885,000
- Variance: SAR -380,000

### Validation Scenario Findings

When using the unbalanced scenario, additional findings appear:
- TB Variance (Error): Debits ≠ Credits
- Unmapped Account (Error): Sundry Income (5100) not confirmed
- Negative Accrued Expenses (Warning): Credit balance anomaly

### Purpose

The unbalanced scenario is used for:
- Testing the validation engine's ability to detect TB imbalances
- Demonstrating the mapping workflow with unmapped accounts
- Showing how AuditOS handles anomalous balances
- QA testing of error reporting and trust state transitions

## Seeding

Run: `npm run seed:audit`

This seeds the **balanced** default demo dataset:
1. Organization, users, client, engagement
2. Trial balance (23 lines, balanced)
3. Canonical accounts (23)
4. Account mappings (23, all confirmed)
5. Financial statements (3)
6. Disclosure notes (10)
7. Evidence (6, 1 missing)
8. Findings (5)
9. Recommendations (3)
10. Review comments (2)
11. Approval records (1)
12. Publication package (1)
13. Audit events (16)
14. AI outputs (5)
15. Second organization (multi-tenant test)
16. Production blockers (7)

## Prior Year Comparatives

Prior year (FY2024) balances are included for all 23 accounts to support analytical review and variance analysis. These are stored as metadata in the seed data and can be used by the Notes Engine, Evidence Engine, and analytical review features.
