# LocalContentOS — Data Requirements

**Status:** Discovery / Planned (not implemented)
**Version:** 1.0 — Discovery Pack

---

## Required Customer Files

Below are the data files a customer would need to provide for a LocalContentOS pilot or implementation. These are conceptual requirements — no system exists yet to accept them.

---

### 1. Vendor Master List

| Field                                | Required                | Sensitivity | Validation                  | Evidence Role             | Common Issues                          |
| ------------------------------------ | ----------------------- | ----------- | --------------------------- | ------------------------- | -------------------------------------- |
| Vendor ID                            | Required                | Low         | Must be unique per vendor   | Primary key for linking   | Missing IDs, duplicates across systems |
| Vendor Name (Arabic)                 | Required                | Low         | Non-empty                   | Display, search           | Inconsistent spelling                  |
| Vendor Name (English)                | Optional                | Low         | —                           | Cross-reference           | Missing for local-only vendors         |
| Nationality / Country                | Required                | Low         | Must be a valid country     | Locality classification   | Mixed ownership unclear                |
| CR Number                            | Recommended             | Medium      | Validate format (10 digits) | Evidence for local status | Missing for small vendors              |
| CR Issuance Country                  | Required if CR provided | Low         | Must match nationality      | Evidence for local status | Missing                                |
| VAT Number                           | Optional                | Low         | Validate format             | Tax reference             | Missing for non-VAT vendors            |
| Local Classification (self-declared) | Recommended             | Medium      | Local / Non-Local / Mixed   | Starting classification   | Often inaccurate, requires review      |
| Vendor Category                      | Optional                | Low         | Match to category list      | Spend analysis            | Inconsistent across datasets           |

---

### 2. Procurement Spend Report

| Field                      | Required            | Sensitivity | Validation                   | Evidence Role          | Common Issues                             |
| -------------------------- | ------------------- | ----------- | ---------------------------- | ---------------------- | ----------------------------------------- |
| Transaction ID / PO Number | Required            | Low         | Must be unique               | Primary key            | Gaps in numbering                         |
| Vendor ID                  | Required            | Medium      | Must match vendor master     | Linking to supplier    | Missing vendor IDs, orphan transactions   |
| Transaction Date           | Required            | Low         | Must be within period        | Period filtering       | Out-of-period entries                     |
| Amount (SAR)               | Required            | High        | Must be positive numeric     | Spend calculation      | Decimal/currency format issues            |
| Currency                   | Required if non-SAR | Low         | ISO code                     | Conversion             | Missing for SAR amounts                   |
| Category / Material Group  | Recommended         | Low         | Match to category list       | Spend classification   | Free-text categories, inconsistent naming |
| Description                | Optional            | Low         | —                            | Context                | Arabic/English mixed                      |
| Contract Reference         | Recommended         | Medium      | Must match contract register | Linking to commitments | Missing for PO-based spend                |

---

### 3. Purchase Orders

| Field                          | Required    | Sensitivity | Validation               | Evidence Role       | Common Issues                     |
| ------------------------------ | ----------- | ----------- | ------------------------ | ------------------- | --------------------------------- |
| PO Number                      | Required    | Low         | Must be unique           | Primary key         | Duplicate PO numbers across years |
| Vendor ID                      | Required    | Medium      | Must match vendor master | Supplier link       | Vendor merged/changed ID          |
| PO Date                        | Required    | Low         | Must be within period    | Period filtering    | Date outside period               |
| PO Amount                      | Required    | High        | Positive numeric         | Commitment tracking | Amount vs. actual mismatches      |
| Line Items                     | Optional    | Medium      | —                        | Detailed analysis   | Missing in summary extracts       |
| Category                       | Recommended | Low         | Match to category list   | Classification      | Inconsistent                      |
| Status (Open/Closed/Cancelled) | Recommended | Low         | Valid status             | Data quality filter | Outdated statuses                 |

---

### 4. Contracts

| Field                    | Required    | Sensitivity | Validation                  | Evidence Role            | Common Issues                               |
| ------------------------ | ----------- | ----------- | --------------------------- | ------------------------ | ------------------------------------------- |
| Contract ID / Number     | Required    | Low         | Must be unique              | Primary key              | Same contract, different IDs across systems |
| Vendor ID                | Required    | Medium      | Must match vendor master    | Supplier link            | Multiple vendors on one contract            |
| Contract Value           | Required    | High        | Positive numeric            | Baseline for commitments | Framework agreements without fixed value    |
| Start Date               | Required    | Low         | Must be valid date          | Period alignment         | Rollover contracts without end date         |
| End Date                 | Recommended | Low         | Must be after start date    | Period alignment         | Missing or expired                          |
| Local Content Commitment | Recommended | Medium      | Percentage or value (0-100) | Target tracking          | Verbal commitments not documented           |
| Description / Scope      | Optional    | Low         | —                           | Context                  | Too vague for classification                |

---

### 5. Supplier Classification (from customer)

| Field                   | Required    | Sensitivity | Validation                             | Evidence Role        | Common Issues                                 |
| ----------------------- | ----------- | ----------- | -------------------------------------- | -------------------- | --------------------------------------------- |
| Vendor ID               | Required    | Medium      | Must match vendor master               | Link to master       | Not matching                                  |
| Customer Classification | Recommended | Medium      | Local / Non-Local / Mixed              | Cross-reference      | Political/external pressure on classification |
| Classification Basis    | Recommended | Medium      | CR / Ownership / Manufacturing / Other | Evidence requirement | Missing or vague                              |
| Classification Date     | Recommended | Low         | Must be valid                          | Recency check        | Outdated classification                       |
| Certifying Body         | Optional    | Low         | —                                      | Credibility          | Self-certification vs. third-party            |

---

### 6. Invoices

| Field                | Required    | Sensitivity | Validation               | Evidence Role       | Common Issues                                          |
| -------------------- | ----------- | ----------- | ------------------------ | ------------------- | ------------------------------------------------------ |
| Invoice Number       | Required    | Medium      | Must be unique           | Evidence for spend  | Duplicate invoices                                     |
| Vendor ID            | Required    | Medium      | Must match vendor master | Supplier link       | Consolidated invoices from holding companies           |
| Invoice Date         | Required    | Low         | Must be within period    | Period alignment    | Invoice issued in different period than goods/services |
| Amount (SAR)         | Required    | High        | Positive numeric         | Spend verification  | Credit notes and adjustments                           |
| PO Reference         | Recommended | Medium      | Must match PO number     | Commitment tracking | Invoices without PO linkage                            |
| Tax Invoice (Yes/No) | Recommended | Low         | —                        | Compliance          | Missing for small vendors                              |

---

### 7. Payment Data

| Field             | Required | Sensitivity | Validation                | Evidence Role             | Common Issues                            |
| ----------------- | -------- | ----------- | ------------------------- | ------------------------- | ---------------------------------------- |
| Payment ID        | Required | High        | Unique                    | Evidence for actual spend | Not tracked at transaction level         |
| Invoice Reference | Required | High        | Must match invoice number | Payment confirmation      | Partial payments                         |
| Payment Date      | Required | Low         | Valid date                | Cash flow tracking        | Payment dates unrelated to invoice dates |
| Amount Paid       | Required | High        | Positive numeric          | Actual spend verification | Discounts, adjustments, withholdings     |
| Payment Method    | Optional | Low         | —                         | Audit trail               | Not recorded                             |

---

### 8. Employee / Local Workforce Data (if relevant)

| Field                   | Required                     | Sensitivity | Validation                         | Evidence Role                | Common Issues                                     |
| ----------------------- | ---------------------------- | ----------- | ---------------------------------- | ---------------------------- | ------------------------------------------------- |
| Employee ID             | Required                     | High        | Unique                             | Workforce link               | Multiple systems                                  |
| Nationality             | Required                     | High        | Valid country                      | Local workforce %            | Expats considered non-local in some frameworks    |
| Job Category            | Recommended                  | Medium      | Match to category list             | Workforce classification     | Inconsistent categories                           |
| Contract Type           | Recommended                  | Medium      | Full-time / Part-time / Contractor | Workforce scope              | Contractors not in HR system                      |
| Department              | Recommended                  | Medium      | —                                  | Cost center allocation       | Cost centers not linked to procurement categories |
| Saudi National (Yes/No) | Required (if workforce data) | High        | Boolean                            | Saudi local workforce metric | Nationality vs. Saudi status confusion            |

---

### 9. Local Content Certificates (if available)

| Field                     | Required             | Sensitivity | Validation               | Evidence Role          | Common Issues                             |
| ------------------------- | -------------------- | ----------- | ------------------------ | ---------------------- | ----------------------------------------- |
| Certificate ID            | Required if provided | Low         | Unique                   | Official evidence      | Not available for most suppliers          |
| Vendor ID                 | Required             | Medium      | Must match vendor master | Supplier link          | Certificate registered to parent company  |
| Issuing Body              | Required             | Low         | Valid authority          | Credibility            | Non-recognized bodies                     |
| Certificate Type          | Required             | Low         | LCGPA / SASO / Other     | Classification support | Different schemes with different criteria |
| Issue Date                | Required             | Low         | Valid date               | Recency                | Expired certificates                      |
| Expiry Date               | Required             | Low         | Must be after issue date | Validity               | Not tracked by procurement team           |
| Certified Local Content % | Required             | Medium      | 0-100%                   | Official metric        | May not cover all categories              |
| Scope / Categories        | Recommended          | Low         | —                        | Applicability          | Narrow scope                              |

---

### 10. Previous Reports (if available)

| Field                    | Required             | Sensitivity | Validation       | Evidence Role         | Common Issues                        |
| ------------------------ | -------------------- | ----------- | ---------------- | --------------------- | ------------------------------------ |
| Report ID / Period       | Required if provided | Low         | Must be distinct | Baseline              | Different reporting formats          |
| Reported Local Content % | Required             | Medium      | 0-100%           | Performance baseline  | Inconsistent calculation methodology |
| Reporting Standard       | Recommended          | Low         | —                | Methodology reference | Unknown or custom methodology        |
| Previous Exceptions/Gaps | Optional             | Medium      | —                | Improvement tracking  | Not documented in prior periods      |

---

## Summary Table

| Data Type                  | Role in Workflow                           | Priority for Pilot | Recommended Format |
| -------------------------- | ------------------------------------------ | ------------------ | ------------------ |
| Vendor Master              | Supplier identification and locality       | Essential          | CSV / XLSX         |
| Procurement Spend          | Transaction classification and calculation | Essential          | CSV / XLSX         |
| Purchase Orders            | Commitment tracking and evidence           | High               | CSV / XLSX         |
| Contracts                  | Multi-period commitment reference          | High               | CSV / XLSX         |
| Supplier Classification    | Starting classification basis              | High               | CSV / XLSX         |
| Invoices                   | Spend verification evidence                | Medium             | PDF / CSV          |
| Payment Data               | Actual spend confirmation                  | Medium             | CSV / XLSX         |
| Workforce Data             | Workforce local content (if applicable)    | Low                | CSV / XLSX         |
| Local Content Certificates | Official evidence                          | Low                | PDF                |
| Previous Reports           | Baseline and trend                         | Low                | PDF / XLSX         |
