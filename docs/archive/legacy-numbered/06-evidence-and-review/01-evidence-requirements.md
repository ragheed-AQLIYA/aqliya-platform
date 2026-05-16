# Evidence Requirements

## Purpose

This document defines the evidence requirements methodology used by AuditOS to identify what supporting evidence is needed for each account area.

## Evidence Identification Approach

AuditOS identifies evidence requirements by mapping each account area to:

1. **Assertions** — The financial statement assertions that evidence must support
2. **Evidence types** — The types of evidence typically sufficient for each assertion
3. **Required vs. recommended** — Which evidence is mandatory vs. supplementary

## Financial Statement Assertions

| Assertion | Description |
|-----------|-------------|
| Existence | Assets, liabilities, and equity exist at the reporting date |
| Completeness | All transactions and accounts that should be presented are included |
| Rights and Obligations | The entity holds rights to assets and obligations for liabilities |
| Valuation | Assets, liabilities, and equity are recorded at appropriate amounts |
| Presentation | Items are appropriately classified, described, and disclosed |
| Cut-off | Transactions are recorded in the correct period |

## Evidence Requirements by Assertion

### Cash and Cash Equivalents

| Assertion | Evidence Required | Type |
|-----------|------------------|------|
| Existence | Bank confirmation, bank statements | Required |
| Completeness | Bank reconciliation, list of all bank accounts | Required |
| Rights | Account ownership documentation | Required |
| Valuation | Foreign currency translation (if applicable) | Recommended |
| Presentation | Restricted cash schedule | Required if applicable |

### Trade Receivables

| Assertion | Evidence Required | Type |
|-----------|------------------|------|
| Existence | Customer confirmation, subsequent receipts | Required |
| Completeness | Aging report, sales records | Required |
| Rights | Customer contracts, credit notes | Required |
| Valuation | Impairment/ECL assessment | Required |
| Presentation | Related party split, aging categories | Required |

### Inventory

| Assertion | Evidence Required | Type |
|-----------|------------------|------|
| Existence | Physical count sheets, inventory listing | Required |
| Completeness | Purchase records, receiving reports | Required |
| Rights | Purchase invoices, supplier agreements | Required |
| Valuation | Costing method documentation, NRV assessment | Required |
| Presentation | Composition breakdown (RM, WIP, FG) | Required |

### Property, Plant and Equipment

| Assertion | Evidence Required | Type |
|-----------|------------------|------|
| Existence | Fixed asset register, physical verification | Required |
| Completeness | Purchase invoices, capital addition records | Required |
| Rights | Title deeds, registration documents | Required |
| Valuation | Depreciation schedule, impairment assessment | Required |
| Presentation | Classification (owned vs. leased, by class) | Required |

### Loans and Borrowings

| Assertion | Evidence Required | Type |
|-----------|------------------|------|
| Existence | Loan agreement, bank confirmation | Required |
| Completeness | Loan schedule, debt listing | Required |
| Rights and Obligations | Loan agreement, collateral documents | Required |
| Valuation | Amortization schedule, interest calculation | Required |
| Presentation | Current/non-current split, covenant compliance | Required |

### Revenue

| Assertion | Evidence Required | Type |
|-----------|------------------|------|
| Occurrence | Sales invoices, customer contracts, delivery receipts | Required |
| Completeness | Revenue listing, period-end cut-off analysis | Required |
| Accuracy | Pricing documentation, contract terms | Required |
| Cut-off | Period-end sales records | Required |
| Presentation | Revenue recognition policy, disaggregation | Required |

## Evidence Quality Levels

| Level | Meaning | Acceptance |
|-------|---------|------------|
| High | Original document, third-party source | Accepted without qualification |
| Medium | Copy or scan of original, internal document | Accepted with reviewer confirmation |
| Low | Uncorroborated internal record or management representation | Requires additional supporting evidence |

## Evidence Gathering Workflow

```txt
1. System identifies required evidence per account area and assertion
2. Evidence requirements are presented as a structured checklist
3. Responsible party gathers and uploads evidence
4. Reviewer verifies evidence sufficiency
5. Evidence state transitions: Candidate → Verified → Accepted
6. Accepted evidence links to specific accounts and findings
7. Evidence coverage report shows completeness by account and assertion
```
