# AQLIYA Pilot — Trial Balance Intake Checklist

**Document:** 01-trial-balance-intake-checklist.md  
**Purpose:** Validate the customer's Trial Balance file before uploading into AuditOS.  
**Owner:** AQLIYA Technical Lead  

---

## Instructions

Run this checklist when the customer provides their Trial Balance file. If any **Critical** item fails, reject the file and request corrections before proceeding.

---

## Section 1: File Format

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 1.1 | File is readable | Excel (.xlsx, .xls) or CSV (.csv) | | Critical | |
| 1.2 | File opens without errors | No corruption, no password protection | | Critical | |
| 1.3 | File size is reasonable | < 50 MB | | Medium | |
| 1.4 | Sheet name is identifiable | First sheet or clearly labeled | | Medium | |
| 1.5 | Encoding is UTF-8 or Arabic-compatible | Arabic text renders correctly | | Low | |

## Section 2: Required Columns

| # | Column | Required? | Pass/Fail | Critical? | Notes |
|---|--------|-----------|-----------|-----------|-------|
| 2.1 | Account Code | Required | | Critical | Must be unique per row |
| 2.2 | Account Name | Required | | Critical | Arabic or English |
| 2.3 | Debit Amount | Required | | Critical | Must be numeric |
| 2.4 | Credit Amount | Required | | Critical | Must be numeric |
| 2.5 | Currency | Required | | Critical | Must match engagement currency |

## Section 3: Optional Columns

| # | Column | Recommended? | Present? | Notes |
|---|--------|--------------|----------|-------|
| 3.1 | Opening Balance | Recommended | | Useful for comparative analysis |
| 3.2 | Prior Year Balance | Recommended | | Useful for trend analysis |
| 3.3 | Account Type | Nice-to-have | | Helps with auto-classification |
| 3.4 | Reporting Period | Nice-to-have | | Should match engagement period |
| 3.5 | Entity Name | Nice-to-have | | For multi-entity TBs |

## Section 4: Data Validation

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 4.1 | Total Debits = Total Credits | Debits == Credits | | Critical | If not equal, request corrected file |
| 4.2 | All amounts are numeric | No text in amount columns | | Critical | |
| 4.3 | No negative amounts in Debit/Credit | All >= 0 | | Critical | Negatives indicate formatting issue |
| 4.4 | Account Codes are unique | No duplicates | | Critical | Duplicates cause mapping errors |
| 4.5 | Account Names are non-empty | All rows have names | | Critical | |
| 4.6 | Currency is consistent | Same currency for all rows | | Critical | |
| 4.7 | No merged cells in header row | Simple column layout | | Medium | Merged cells break parsing |
| 4.8 | No extra blank rows within data | Contiguous data range | | Medium | |

## Section 5: Reporting Period & Accounting Basis

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 5.1 | Reporting period is specified | e.g., FY2025, Q1 2026 | | Critical | Must match engagement |
| 5.2 | Accounting basis is known | Accrual or Cash basis | | Critical | |
| 5.3 | Reporting framework is identified | IFRS, GAAP, or other | | Medium | |

## Section 6: Company / Entity Details

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 6.1 | Company/Entity name is provided | Required for engagement | | Critical | |
| 6.2 | Entity type is known | Corporation, LLC, etc. | | Medium | |
| 6.3 | Registration/Jurisdiction noted | Optional but helpful | | Low | |

## Section 7: Chart of Accounts

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 7.1 | Account Code structure is consistent | e.g., all 4-digit or all 6-digit | | Medium | |
| 7.2 | Account categories are identifiable | Assets, Liabilities, Equity, Revenue, Expenses | | Medium | |
| 7.3 | Account names are clear | e.g., "Cash at Bank — Riyad Bank" vs "1120" | | Medium | |

## Section 8: Opening / Prior Year Balances

| # | Check | Expected | Pass/Fail | Critical? | Notes |
|---|-------|----------|-----------|-----------|-------|
| 8.1 | Opening balance format matches current | Same currency, same precision | | Medium | |
| 8.2 | Prior year balance format matches current | Same currency, same precision | | Low | |
| 8.3 | Opening balance = prior year closing | Logical continuity | | Medium | |

## Section 9: Missing Data Checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| 9.1 | All required columns present | | |
| 9.2 | No empty required cells | | |
| 9.3 | No formula errors in cells | | |
| 9.4 | Decimal separator is consistent | | |
| 9.5 | Thousands separator is consistent | | |
| 9.6 | Date format is consistent | | |

## Section 10: Reviewer Notes

```
Reviewer Name: _________________________________
Review Date: _________________________________
File Name: _________________________________

Additional Notes:
_______________________________________________
_______________________________________________
_______________________________________________
```

## Section 11: Rejection Criteria

The file **must be rejected** and corrected if any of the following are true:

- [ ] Total Debits ≠ Total Credits (off by more than rounding tolerance)
- [ ] File cannot be opened
- [ ] Required columns are missing
- [ ] Account Codes contain duplicates
- [ ] Amounts contain non-numeric values
- [ ] No reporting period specified
- [ ] Currency is ambiguous or missing

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Technical Lead | | | |
| Reviewer | | | |

---

**Result:** ☐ Accepted  ☐ Rejected — corrections requested  ☐ Rejected — cannot proceed
