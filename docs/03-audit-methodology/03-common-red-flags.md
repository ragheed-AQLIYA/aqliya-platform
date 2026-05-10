# Common Red Flags

## Purpose

This document catalogs common red flags that AuditOS identifies during trial balance review. Red flags are indicators of potential misstatement, misclassification, or evidence gaps that require reviewer attention.

## Balance Sheet Red Flags

| Red Flag | Possible Issue | Severity |
|----------|----------------|----------|
| Negative cash balance | Overdraft not reclassified, data error | High |
| Large receivables relative to revenue | Revenue recognition issues, collectability risk | High |
| Receivables with no impairment | Overstated assets | Medium |
| Inventory significantly changed without explanation | Valuation or completeness risk | High |
| Fixed assets with no depreciation charge | Valuation risk | High |
| Fixed assets with accumulated depreciation exceeding cost | Potential impairment or data error | Medium |
| Large payables relative to cost of sales | Liquidity risk, potential omitted liabilities | Medium |
| Loans with no current/non-current split | Classification risk | Medium |
| Intercompany balances not eliminated | Consolidation error | Medium |
| Negative equity | Going concern risk | High |
| Intangible assets with no amortization | Valuation risk | Medium |

## Income Statement Red Flags

| Red Flag | Possible Issue | Severity |
|----------|----------------|----------|
| Revenue classified as liability | Classification error | High |
| Negative revenue | Data error or returns not separately presented | Medium |
| Zero revenue | Incomplete data | Critical |
| Major revenue decline without explanation | Going concern, completeness | High |
| Cost of sales exceeds revenue | Negative gross margin — going concern | High |
| Operating expenses classified as cost of sales | Classification error | High |
| Finance costs absent despite loans | Missing expense | Medium |
| Other income unusually large compared to operations | Classification or one-off item | Medium |

## Classification Red Flags

| Red Flag | Possible Issue | Severity |
|----------|----------------|----------|
| Asset account with credit balance | Potential reclassification need | Medium |
| Liability account with debit balance | Potential reclassification need | Medium |
| Revenue account with debit balance | Sales returns or data error | Medium |
| Expense account with credit balance | Reimbursement or data error | Medium |
| Account mapped to unexpected category | Mapping error | High |
| Same account name mapped to different categories across periods | Inconsistent mapping | High |

## Disclosure Red Flags

| Red Flag | Possible Issue | Severity |
|----------|----------------|----------|
| Related party account balances present | Related party disclosure required | Medium |
| Loan balances present | Loan terms disclosure required | Medium |
| Fixed asset balances present | Depreciation policy and movement disclosure required | Medium |
| Zakat/tax accounts present | Zakat/tax provision and payment disclosure required | Medium |
| Foreign currency accounts present | Foreign currency risk disclosure required | Medium |
| Contingent liability mention in notes | Contingent liability disclosure required | High |

## Evidence Red Flags

| Red Flag | Possible Issue | Severity |
|----------|----------------|----------|
| Material account with no evidence | Evidence gap | High |
| Evidence uploaded but not verified | Incomplete evidence review | Medium |
| Evidence linked but insufficient per reviewer | Insufficient evidence | Medium |
| Bank confirmation not provided for cash balances | Critical evidence gap | High |
| No supporting schedules for complex estimates | Valuation support gap | High |

## Red Flag Workflow

```txt
1. System identifies red flag during trial balance analysis
2. Red flag is presented to reviewer with:
   - Account context
   - Nature of the flag
   - Potential impact
   - Suggested action
3. Reviewer triages: investigate, dismiss, or escalate
4. Investigation may lead to finding creation
5. Dismissal requires documented rationale
6. Escalation routes to Manager or Partner
```
