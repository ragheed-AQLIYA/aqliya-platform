# Missing Information Checklist

## Purpose

This document defines the missing information checklist that AuditOS generates for each engagement. The checklist identifies what data, evidence, or disclosures are required but not yet available.

## Checklist Categories

### 1. Trial Balance Gaps

| Gap | Impact | How Identified |
|-----|--------|----------------|
| Missing comparative period data | Cannot generate comparative financial statements | Prior year column empty |
| Missing opening balances | Cannot generate cash flow statement (indirect method) | Opening balance column empty |
| Unbalanced trial balance | Cannot proceed to mapping | Credits ≠ Debits |
| Incomplete account codes | May affect mapping accuracy | Code parsing fails |
| Non-numeric balance values | Data quality issue | Validation failure |

### 2. Mapping Gaps

| Gap | Impact | How Identified |
|-----|--------|----------------|
| Unmapped accounts | Cannot generate complete financial statements | Mapping completion check |
| Low-confidence mappings | May misstate financial statement lines | Confidence threshold check |
| Missing canonical category | Account excluded from financial statements | Classification failure |

### 3. Financial Statement Gaps

| Gap | Impact | How Identified |
|-----|--------|----------------|
| Missing statement line | Incomplete financial statement presentation | Standard template comparison |
| Unusual classification | Potential misstatement | Classification rule check |
| Balance sheet doesn't balance | Data integrity issue | Assets minus Liabilities ≠ Equity |

### 4. Notes Gaps

| Gap | Impact | How Identified |
|-----|--------|----------------|
| Required note not generated | Incomplete disclosure | Disclosure requirement check |
| Note populated but missing supporting data | Incomplete note | Note data availability check |
| Accounting policy not selected | Missing policy disclosure | Policy assignment check |
| Missing comparative note data | Incomplete comparative disclosure | Note generation check |

### 5. Evidence Gaps

| Gap | Impact | How Identified |
|-----|--------|----------------|
| Material account without evidence | Insufficient audit evidence | Evidence coverage check |
| Evidence not verified | Evidence not yet reliable | Evidence state check |
| Critical assertion not covered | Audit risk | Assertion coverage check |

### 6. Disclosure Gaps

| Gap | Impact | How Identified |
|-----|--------|----------------|
| Related party disclosure missing | Non-compliance if material | Related party account detection |
| Loan terms not disclosed | Incomplete disclosure | Loan account detection |
| Zakat/tax methodology missing | Incomplete disclosure | Zakat/tax account detection |
| Fixed asset movement missing | Incomplete disclosure | Fixed asset detection |
| Going concern assessment missing | Required disclosure | Standard requirement |

## Checklist Output Format

```txt
Engagement: Client A — FY 2026
Status: Incomplete — 12 items identified

TRIAL BALANCE (3 items)
  ⚠ Missing: Prior Year Balances for 5 accounts (impact: comparative statements)
  ⚠ Missing: Opening Balances for 3 accounts (impact: cash flow statement)
  ✅ Trial Balance Balances: PASS

MAPPING (2 items)
  ⚠ Unmapped: Account 4100 (Sundry Income)
  ⚠ Low Confidence: Account 3100 (Share Capital) — mapped to Equity, 55% confidence

NOTES (5 items)
  ⚠ Missing: Property, Plant and Equipment movement schedule
  ⚠ Missing: Loan terms and repayment schedule
  ⚠ Missing: Related party transaction details
  ⚠ Missing: Zakat base calculation methodology
  ⚠ Missing: Accounting policy for revenue recognition

EVIDENCE (2 items)
  ⚠ Missing: Bank confirmation for Cash and Cash Equivalents (SAR 2.5M)
  ⚠ Missing: Fixed asset register
```

## Checklist Usage

The checklist is used to:

1. **Guide data collection** — Client team knows what information to provide
2. **Track readiness** — Engagement team sees progress toward completion
3. **Identify blockers** — Critical missing items that prevent publication
4. **Support scope discussions** — Missing items that require additional procedures
