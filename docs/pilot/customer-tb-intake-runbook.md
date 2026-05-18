# AuditOS — Customer Trial Balance Intake Runbook

**Status:** Pilot operations document
**Purpose:** Step-by-step procedure for receiving, inspecting, and accepting/rejecting a customer Trial Balance file

---

## 1. Pre-Arrival Preparation

Before the TB file arrives:

- [ ] Confirm customer has received the TB request message
- [ ] Confirm delivery channel (email, secure upload, encrypted link)
- [ ] Verify contact person and decision maker are identified
- [ ] Review pilot scope: entity, period, currency, accounting basis
- [ ] Prepare secure storage folder: `./pilot-data/[customer-name]/`
- [ ] Open Pilot Control Sheet and set stage to "Pending TB Arrival"

---

## 2. File Receipt

When the TB file arrives:

| Step | Action                                                                                 | Owner          |
| ---- | -------------------------------------------------------------------------------------- | -------------- |
| 2.1  | Receive file from customer                                                             | Pilot Lead     |
| 2.2  | Send confirmation: "We've received your file. We'll begin validation and report back." | Pilot Lead     |
| 2.3  | Log receipt date and time in Pilot Control Sheet                                       | Technical Lead |
| 2.4  | Save file to secure storage with naming convention: `tb-[customer]-[yyyymmdd].[ext]`   | Technical Lead |
| 2.5  | Verify file hash if available from customer                                            | Technical Lead |
| 2.6  | Update Pilot Control Sheet stage to "TB file received"                                 | Technical Lead |

---

## 3. File Inspection

### 3.1 File Format Checks

| Check                           | Expected                     | Critical? | Result      |
| ------------------------------- | ---------------------------- | --------- | ----------- |
| File opens without errors       | No corruption, no password   | Critical  | Pass / Fail |
| Format is accepted              | XLSX, XLS, or CSV            | Critical  | Pass / Fail |
| File size reasonable            | < 50 MB                      | Medium    | Pass / Fail |
| Sheet name identifiable         | First sheet or labeled       | Medium    | Pass / Fail |
| Arabic text renders correctly   | UTF-8 or compatible encoding | Low       | Pass / Fail |
| No merged cells in header       | Simple column layout         | Medium    | Pass / Fail |
| No extra blank rows within data | Contiguous data range        | Medium    | Pass / Fail |

### 3.2 Column Presence

| Column             | Requirement  | Present? | Critical? |
| ------------------ | ------------ | -------- | --------- |
| Account Code       | **Required** | Yes / No | Critical  |
| Account Name       | **Required** | Yes / No | Critical  |
| Debit Amount       | **Required** | Yes / No | Critical  |
| Credit Amount      | **Required** | Yes / No | Critical  |
| Currency           | **Required** | Yes / No | Critical  |
| Opening Balance    | Recommended  | Yes / No | Low       |
| Prior Year Balance | Recommended  | Yes / No | Low       |
| Account Type       | Nice-to-have | Yes / No | Info      |
| Reporting Period   | Nice-to-have | Yes / No | Low       |
| Entity Name        | Nice-to-have | Yes / No | Info      |

### 3.3 Data Quality

| Check                          | Expected                  | Critical? | Result      |
| ------------------------------ | ------------------------- | --------- | ----------- |
| Total Debits = Total Credits   | Within rounding tolerance | Critical  | Pass / Fail |
| All amounts numeric            | No text in amount columns | Critical  | Pass / Fail |
| No negative debits/credits     | All ≥ 0                   | Critical  | Pass / Fail |
| Account codes unique           | No duplicates             | Critical  | Pass / Fail |
| Account names non-empty        | All rows named            | Critical  | Pass / Fail |
| Currency consistent            | Same code for all rows    | Critical  | Pass / Fail |
| Decimal separator consistent   | Same across all amounts   | Low       | Pass / Fail |
| Thousands separator consistent | Same across all amounts   | Low       | Pass / Fail |

### 3.4 Context Validation

| Check                          | Expected                 | Critical? | Result      |
| ------------------------------ | ------------------------ | --------- | ----------- |
| Reporting period specified     | Matches engagement scope | Critical  | Pass / Fail |
| Accounting basis known         | Accrual or Cash          | Critical  | Pass / Fail |
| Company/entity name provided   | Matches engagement       | Critical  | Pass / Fail |
| Reporting framework identified | IFRS, GAAP, or other     | Medium    | Pass / Fail |
| Entity type known              | Corporation, LLC, etc.   | Medium    | Pass / Fail |

---

## 4. Intake Decision

### Accepted

All critical checks pass. Proceed to upload and processing.

### Accepted with Issues

All critical checks pass; medium/low issues found. Proceed to upload with documented issues.

### Rejected

| Rejection Reason           | Action                                         |
| -------------------------- | ---------------------------------------------- |
| Debits ≠ Credits           | Notify customer. Request corrected file.       |
| File cannot be opened      | Request resend in different format.            |
| Required columns missing   | Specify which columns. Request corrected file. |
| Duplicate account codes    | Request deduplicated file.                     |
| Non-numeric amounts        | Request formatted file.                        |
| No reporting period        | Request clarification.                         |
| Currency ambiguous/missing | Request clarification.                         |

---

## 5. Customer Follow-Up (If Rejected)

| Template                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Subject:** AuditOS Pilot — Trial Balance File Correction Required                                                                                                                                                              |
| **Body:** "Thank you for submitting your Trial Balance. During our validation, we found the following issue(s): [list issues]. Please correct and resend. We're happy to guide you on the required format. Best regards, [Name]" |

---

## 6. Post-Acceptance

When file is accepted:

- [ ] Update Pilot Control Sheet: Stage = "TB file received", Decision = Accepted
- [ ] Proceed to upload into AuditOS workspace
- [ ] Run account mapping process
- [ ] Begin Pilot Execution Checklist

---

## 7. Accepted File Formats Summary

| Field         | XLSX/XLS             | CSV                |
| ------------- | -------------------- | ------------------ |
| Header row    | First row            | First row          |
| Column names  | English or Arabic    | English or Arabic  |
| Amount format | Number (no formulas) | Number (no quotes) |
| Separators    | System locale        | Comma or semicolon |
| Encoding      | Auto                 | UTF-8 recommended  |
