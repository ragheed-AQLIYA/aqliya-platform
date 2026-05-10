# Missing Note Data

## Purpose

This document catalogs the data that AuditOS cannot derive from trial balance alone for each note type. This information must be provided separately or flagged as missing.

## Note-by-Note Missing Data

### 1. Basis of Preparation

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Entity registration details | Entity setup | Client information form |
| Regulatory framework specifics | Entity setup | Client information form |
| Departures from standard (if any) | Professional judgment | Reviewer input |

### 2. Significant Accounting Policies

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Entity-specific policy elections | Management | Policy selection form |
| Custom policies (not in library) | Entity's existing policies | Upload existing policy document |
| Changes in accounting policies | Management | Management representation |

### 3. Cash and Cash Equivalents

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Bank name and account details | Bank records | Bank confirmation |
| Restricted cash details | Management | Schedule of restricted balances |
| Short-term investment details | Investment records | Investment schedule |
| Bank facilities / overdraft arrangements | Bank records | Bank confirmation |

### 4. Trade Receivables

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Customer aging report | AR system | Upload aging report |
| Impairment / expected credit loss assessment | Management | ECL calculation schedule |
| Related party split | Management | Related party schedule |
| Subsequent receipts after period-end | Bank records | Post-period bank statements |
| Credit terms and concentration | Management | Revenue/AR analysis |

### 5. Inventory

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Inventory composition (raw materials, WIP, finished goods) | Inventory system | Upload inventory breakdown |
| Costing method details | Management | Policy confirmation |
| Net realizable value assessment | Management | NRV schedule |
| Obsolete or slow-moving items | Inventory system | Aging report |
| Inventory count procedures | Management | Count sheets |

### 6. Property, Plant and Equipment

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Asset register (opening cost, additions, disposals) | Fixed asset system | Upload fixed asset register |
| Depreciation method and useful lives | Management | Policy confirmation |
| Additions and disposals during the year | Fixed asset system | Upload movement schedule |
| Impairment indicators or assessment | Management | Impairment assessment |
| Assets under construction | Management | Project status report |
| Capital commitments | Management | Contracts and commitments |

### 7. Loans and Borrowings

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Lender name and type | Loan agreement | Upload loan agreement |
| Interest rate (fixed or floating) | Loan agreement | Upload loan agreement |
| Maturity date | Loan agreement | Upload loan agreement |
| Current/non-current split by agreement | Loan agreement | Calculate from payment schedule |
| Covenants and compliance | Loan agreement | Upload loan agreement |
| Collateral or guarantees | Loan agreement | Upload loan agreement |
| Repayment schedule | Loan agreement | Upload amortization schedule |

### 8. Trade Payables

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Supplier aging | AP system | Upload aging report |
| Terms and credit arrangements | Supplier agreements | Upload key agreements |
| Related party split | Management | Related party schedule |
| Subsequent payments | Bank records | Post-period bank statements |

### 9. Revenue

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Revenue recognition method details | Management | Policy confirmation |
| Revenue disaggregation (product, service, geography) | Revenue system | Upload revenue breakdown |
| Contract assets and liabilities | Revenue system | Contract schedule |
| Performance obligations | Customer contracts | Upload key contracts |
| Significant payment terms | Customer contracts | Upload key contracts |

### 10. Related Parties

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Identity of related parties | Management | Related party declaration |
| Nature of relationship | Management | Related party declaration |
| Transaction amounts and terms | Management | Transaction schedule |
| Outstanding balances | Trial balance + AP/AR | Trial balance |
| Key management compensation | Management | Payroll records |
| Terms and conditions | Management | Related party agreements |

### 11. Zakat and Tax

| Missing Data | Source | How to Obtain |
|--------------|--------|---------------|
| Zakat base calculation | Computation | Upload zakat calculation |
| Tax base adjustments | Tax records | Upload tax return |
| Deferred tax calculation | Computation | Upload deferred tax schedule |
| Tax rate applicable | Tax authority | Confirm jurisdiction rate |
| Prior year adjustments | Tax records | Upload prior year returns |
| Status of tax assessments | Tax authority | Correspondence |

## Missing Data Workflow

```txt
1. System identifies note type and determines required data
2. System checks trial balance and available schedules
3. Missing data is cataloged and flagged
4. Missing information checklist is generated
5. Client or management is notified of required information
6. As information is provided, it is uploaded and linked to the note
7. Note quality status updates: Missing → Partial → Complete
```
