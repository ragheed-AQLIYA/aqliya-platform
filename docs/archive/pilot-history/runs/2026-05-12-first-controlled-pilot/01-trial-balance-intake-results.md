# Trial Balance Intake Results

**Run ID:** PILOT-RUN-2026-05-12-01  
**Date:** May 12, 2026  
**Status:** ⏳ Awaiting File — No TB File Received  

---

## Intake Decision

**Decision:** ⏳ Pending

---

## Section 1: File Format

| # | Check | Result | Critical? | Notes |
|---|-------|--------|-----------|-------|
| 1.1 | File is readable | ⏳ Pending | Critical | |
| 1.2 | File opens without errors | ⏳ Pending | Critical | |
| 1.3 | File size is reasonable | ⏳ Pending | Medium | |
| 1.4 | Sheet name is identifiable | ⏳ Pending | Medium | |
| 1.5 | Encoding is UTF-8 or Arabic-compatible | ⏳ Pending | Low | |

## Section 2: Required Columns

| # | Column | Required? | Result | Critical? |
|---|--------|-----------|--------|-----------|
| 2.1 | Account Code | Required | ⏳ Pending | Critical |
| 2.2 | Account Name | Required | ⏳ Pending | Critical |
| 2.3 | Debit Amount | Required | ⏳ Pending | Critical |
| 2.4 | Credit Amount | Required | ⏳ Pending | Critical |
| 2.5 | Currency | Required | ⏳ Pending | Critical |

## Section 3: Optional Columns

| # | Column | Recommended? | Present? |
|---|--------|--------------|----------|
| 3.1 | Opening Balance | Recommended | ⏳ Pending |
| 3.2 | Prior Year Balance | Recommended | ⏳ Pending |
| 3.3 | Account Type | Nice-to-have | ⏳ Pending |
| 3.4 | Reporting Period | Nice-to-have | ⏳ Pending |
| 3.5 | Entity Name | Nice-to-have | ⏳ Pending |

## Section 4: Data Validation

| # | Check | Result | Critical? |
|---|-------|--------|-----------|
| 4.1 | Total Debits = Total Credits | ⏳ Pending | Critical |
| 4.2 | All amounts are numeric | ⏳ Pending | Critical |
| 4.3 | No negative amounts in Debit/Credit | ⏳ Pending | Critical |
| 4.4 | Account Codes are unique | ⏳ Pending | Critical |
| 4.5 | Account Names are non-empty | ⏳ Pending | Critical |
| 4.6 | Currency is consistent | ⏳ Pending | Critical |
| 4.7 | No merged cells in header row | ⏳ Pending | Medium |
| 4.8 | No extra blank rows within data | ⏳ Pending | Medium |

## Section 5: Reporting Period & Accounting Basis

| # | Check | Result | Critical? |
|---|-------|--------|-----------|
| 5.1 | Reporting period is specified | ⏳ Pending | Critical |
| 5.2 | Accounting basis is known | ⏳ Pending | Critical |
| 5.3 | Reporting framework is identified | ⏳ Pending | Medium |

## Section 6: Company / Entity Details

| # | Check | Result | Critical? |
|---|-------|--------|-----------|
| 6.1 | Company/Entity name is provided | ⏳ Pending | Critical |
| 6.2 | Entity type is known | ⏳ Pending | Medium |
| 6.3 | Registration/Jurisdiction noted | ⏳ Pending | Low |

## Section 7: Chart of Accounts

| # | Check | Result | Critical? |
|---|-------|--------|-----------|
| 7.1 | Account Code structure is consistent | ⏳ Pending | Medium |
| 7.2 | Account categories are identifiable | ⏳ Pending | Medium |
| 7.3 | Account names are clear | ⏳ Pending | Medium |

## Section 8: Opening / Prior Year Balances

| # | Check | Result | Critical? |
|---|-------|--------|-----------|
| 8.1 | Opening balance format matches current | ⏳ Pending | Medium |
| 8.2 | Prior year balance format matches current | ⏳ Pending | Low |
| 8.3 | Opening balance = prior year closing | ⏳ Pending | Medium |

## Section 9: Missing Data

| # | Item | Status |
|---|------|--------|
| 9.1 | All required columns present | ⏳ Pending |
| 9.2 | No empty required cells | ⏳ Pending |
| 9.3 | No formula errors in cells | ⏳ Pending |
| 9.4 | Decimal separator is consistent | ⏳ Pending |
| 9.5 | Thousands separator is consistent | ⏳ Pending |
| 9.6 | Date format is consistent | ⏳ Pending |

## Section 10: Rejection Criteria

| Criterion | Status |
|-----------|--------|
| Total Debits ≠ Total Credits (beyond rounding) | ⏳ Pending |
| File cannot be opened | ⏳ Pending |
| Required columns missing | ⏳ Pending |
| Account Codes contain duplicates | ⏳ Pending |
| Amounts contain non-numeric values | ⏳ Pending |
| No reporting period specified | ⏳ Pending |
| Currency is ambiguous or missing | ⏳ Pending |

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Technical Lead | TBD | |
| Reviewer | TBD | |
