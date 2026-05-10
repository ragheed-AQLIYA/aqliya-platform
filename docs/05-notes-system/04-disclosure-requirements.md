# Disclosure Requirements

## Purpose

This document defines the disclosure requirements that AuditOS checks when generating notes to financial statements. Disclosures are identified based on account balances, account types, and entity characteristics.

## Disclosure Requirement Triggers

### Account Balance Triggers

| Account Type | Required Disclosure | Standard Reference |
|--------------|---------------------|--------------------|
| Cash and Cash Equivalents | Components, restricted cash, bank facilities | IAS 1, IAS 7 |
| Trade Receivables | Aging, impairment, credit risk | IFRS 7, IFRS 9 |
| Inventory | Composition, costing method, NRV | IAS 2 |
| Property, Plant and Equipment | Movement schedule, depreciation method, useful lives | IAS 16 |
| Loans and Borrowings | Terms, interest rates, maturity, covenants | IFRS 7, IAS 1 |
| Trade Payables | Terms, currency, supplier concentration | IAS 1 |
| Revenue | Recognition policy, disaggregation | IFRS 15 |
| Related Party Balances | Nature of relationship, transaction amounts | IAS 24 |
| Zakat and Tax | Base calculation, provision, payments | SOCPA / IAS 12 |

### Entity Characteristic Triggers

| Characteristic | Required Disclosure |
|----------------|---------------------|
| Public interest entity | Enhanced related party disclosures, corporate governance |
| Group/Subsidiary | Consolidation basis, subsidiary information |
| First-time IFRS adopter | IFRS 1 reconciliations |
| Going concern uncertainty | Management's assessment, mitigation plans |
| Events after reporting period | Nature and financial effect |
| Significant estimates | Judgments, estimation uncertainty sources |

## Disclosure Checklist

### General Disclosures

| # | Disclosure | Required If | Generated |
|---|------------|-------------|-----------|
| 1 | Reporting entity information | Always | ✅ |
| 2 | Basis of preparation | Always | ✅ |
| 3 | Functional and presentation currency | Always | ✅ |
| 4 | Rounding level | Always | ✅ |
| 5 | Use of judgments and estimates | Always | ✅ |
| 6 | Going concern assessment | Always | ✅ |
| 7 | Events after reporting period | Events occurred | ⚠ Flagged |
| 8 | Related party transactions | Related party balances exist | ✅ |

### Asset Disclosures

| # | Disclosure | Required If | Generated |
|---|------------|-------------|-----------|
| 9 | PPE movement schedule | PPE balances exist | ✅ |
| 10 | Depreciation method and useful lives | PPE balances exist | ✅ |
| 11 | Impairment assessment | Impairment indicators | ⚠ Flagged |
| 12 | Receivables aging | Receivables exist | ⚠ Suggested |
| 13 | Credit loss allowance | Receivables exist | ✅ |
| 14 | Inventory composition | Inventory exists | ✅ |
| 15 | Inventory NRV assessment | Inventory exists | ⚠ Suggested |

### Liability Disclosures

| # | Disclosure | Required If | Generated |
|---|------------|-------------|-----------|
| 16 | Loan terms and covenants | Loans exist | ✅ |
| 17 | Current/non-current split | Loans exist | ✅ |
| 18 | Collateral and security | Secured loans | ⚠ Flagged |
| 19 | Contingent liabilities | Possible obligations | ⚠ Flagged |
| 20 | Commitments | Contractual obligations | ⚠ Flagged |

### Income Statement Disclosures

| # | Disclosure | Required If | Generated |
|---|------------|-------------|-----------|
| 21 | Revenue disaggregation | Revenue exists | ✅ |
| 22 | Employee benefits expense | Employees exist | ✅ |
| 23 | Depreciation and amortization | Fixed assets exist | ✅ |
| 24 | Finance costs components | Loans exist | ✅ |
| 25 | Auditor's remuneration | Audit fees paid | ⚠ Suggested |

### Specialized Disclosures

| # | Disclosure | Required If | Generated |
|---|------------|-------------|-----------|
| 26 | Zakat base and provision | Zakat applicable | ✅ |
| 27 | Deferred tax | Temporary differences | ⚠ Suggested |
| 28 | Earnings per share | Listed entity | ⚠ Suggested |
| 29 | Segment reporting | Multiple segments | ⚠ Suggested |
| 30 | Fair value disclosures | Fair value measurements | ⚠ Suggested |

## Disclosure Generation Status

| Status | Meaning |
|--------|---------|
| ✅ Generated | Disclosure populated from available data |
| ⚠️ Suggested | Disclosure identified as likely required |
| ⚠ Flagged | Disclosure may be required — cannot confirm from trial balance alone |
| ❌ Cannot Generate | Disclosure requires information not available in the system |

## Reviewer Responsibility

The reviewer must:

1. Confirm all ✅ disclosures are accurate
2. Investigate and populate ⚠️ and ⚠ flagged disclosures
3. Identify any additional disclosures not captured by automated checks
4. Document rationale for excluding any apparently required disclosure
