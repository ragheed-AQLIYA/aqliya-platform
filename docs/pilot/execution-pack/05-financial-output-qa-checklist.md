# AQLIYA Pilot — Financial Output QA Checklist

**Document:** 05-financial-output-qa-checklist.md  
**Purpose:** QA checklist for validating the accuracy and completeness of generated financial outputs.  
**Owner:** AQLIYA Reviewer  

---

## Instructions

Run this checklist **after** account mapping is confirmed and financial statements are generated. This checklist focuses on numerical accuracy, classification correctness, and presentation quality.

---

## Section 1: Statement of Financial Position

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 1.1 | Total Assets = Total Liabilities + Total Equity | Balance sheet balances | | Critical | |
| 1.2 | All asset accounts appear under Assets | No asset classified as liability/equity | | Critical | |
| 1.3 | All liability accounts appear under Liabilities | No liability classified as asset/equity | | Critical | |
| 1.4 | All equity accounts appear under Equity | No equity classified as asset/liability | | Critical | |
| 1.5 | Current/Non-current classification is correct | If applicable to framework | | Medium | |
| 1.6 | Subtotals are correct (Total Current Assets, etc.) | Subtotal = sum of line items | | Critical | |
| 1.7 | Currency symbol/display is correct | Matches engagement currency | | Medium | |
| 1.8 | Reporting period is displayed correctly | e.g., "As at 31 December 2025" | | Medium | |

## Section 2: Statement of Profit or Loss

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 2.1 | All revenue accounts appear under Revenue | No revenue classified as expense | | Critical | |
| 2.2 | All expense accounts appear under Expenses | No expense classified as revenue | | Critical | |
| 2.3 | Revenue - Expenses = Net Profit/Loss | P&L balances | | Critical | |
| 2.4 | Gross Profit subtotal is correct | Revenue - Cost of Sales | | Critical | |
| 2.5 | Operating Profit subtotal is correct | Gross Profit - Operating Expenses | | Critical | |
| 2.6 | Net Profit/Loss before tax is calculated | Matches total income - total expenses | | Critical | |
| 2.7 | Reporting period is displayed correctly | e.g., "For the year ended 31 December 2025" | | Medium | |

## Section 3: Statement of Changes in Equity

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 3.1 | Opening equity balance matches prior year | If prior year data provided | | Critical | |
| 3.2 | Net profit/loss is added correctly | Matches P&L net income | | Critical | |
| 3.3 | Dividends/withdrawals are reflected | If applicable | | Medium | |
| 3.4 | Closing equity balance matches SFP | Equity section ties out | | Critical | |

## Section 4: Account Mapping Accuracy

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 4.1 | All accounts are mapped to a statement | No orphan accounts | | Critical | |
| 4.2 | Revenue accounts mapped to P&L | Correct statement assignment | | Critical | |
| 4.3 | Expense accounts mapped to P&L | Correct statement assignment | | Critical | |
| 4.4 | Asset accounts mapped to SFP | Correct statement assignment | | Critical | |
| 4.5 | Liability accounts mapped to SFP | Correct statement assignment | | Critical | |
| 4.6 | Equity accounts mapped to SFP | Correct statement assignment | | Critical | |

## Section 5: Reclassifications

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 5.1 | Reclassification suggestions are flagged | Visible to reviewer | | Medium | |
| 5.2 | Reclassification impact is shown | Before/after comparison | | Medium | |
| 5.3 | Reviewer can accept/reject reclassification | Action available | | Critical | |

## Section 6: Totals and Subtotals

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 6.1 | All totals are computed correctly | No manual calculation errors | | Critical | |
| 6.2 | Subtotals nested correctly | Hierarchical totals accurate | | Critical | |
| 6.3 | Rounding differences are within tolerance | < 1 currency unit per statement | | Medium | |
| 6.4 | Negative values displayed correctly | (Parentheses) or minus sign | | Medium | |

## Section 7: Debit/Credit Consistency

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 7.1 | Debit balances show as positive | Standard accounting presentation | | Medium | |
| 7.2 | Credit balances show as positive | Standard accounting presentation | | Medium | |
| 7.3 | Contra accounts presented correctly | e.g., Accumulated depreciation reduces assets | | Medium | |
| 7.4 | Debit/credit sign convention is consistent | Same convention used throughout | | Critical | |

## Section 8: Currency Display

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 8.1 | Currency symbol is correct | SAR, USD, etc. | | Medium | |
| 8.2 | Currency formatting is consistent | Same decimal places, same symbol position | | Medium | |
| 8.3 | Thousands separator is used | 1,000,000 vs 1000000 | | Low | |
| 8.4 | Decimal precision is appropriate | 2 decimal places for most currencies | | Medium | |

## Section 9: Reporting Period Display

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 9.1 | Period start/end dates are correct | Matches engagement | | Critical | |
| 9.2 | Period description is accurate | "Q1 2026", "FY2025", etc. | | Medium | |
| 9.3 | Comparative periods displayed (if applicable) | Prior year column shown | | Medium | |

## Section 10: Draft Status & Disclaimer

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 10.1 | "Draft" watermark/badge is visible | On every financial statement | | Critical | |
| 10.2 | Disclaimer text is present | "Draft · Requires human review · Not final" | | Critical | |
| 10.3 | No "Final" or "Approved" status shown | Unless actually approved | | Critical | |

## Section 11: Cross-Statement Consistency

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 11.1 | Net profit matches across P&L and Equity | Same number | | Critical | |
| 11.2 | Closing equity matches SFP and Equity | Same number | | Critical | |
| 11.3 | Total assets match across statements | Consistent totals | | Critical | |

## Section 12: Reviewer Sign-Off

| # | Item | Status |
|---|------|--------|
| 12.1 | All critical checks pass | ☐ Pass ☐ Fail |
| 12.2 | All medium checks pass | ☐ Pass ☐ Fail (document failures) |
| 12.3 | Financial statements are ready for customer review | ☐ Yes ☐ Conditional ☐ No |
| 12.4 | Reviewer name | ________________ |
| 12.5 | Date | ________________ |
| 12.6 | Signature | ________________ |

## Critical Blocker Summary

List any critical failures that must be resolved before proceeding:

| # | Item | Description | Resolution | Owner |
|---|------|-------------|------------|-------|
| | | | | |
| | | | | |
