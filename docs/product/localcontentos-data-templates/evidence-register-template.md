# LocalContentOS — Evidence Register Template

**Status:** Pilot Template Pack — not software
**Version:** 1.0

---

## Purpose

The Evidence Register template tracks all supporting evidence files linked to vendor classifications, transactions, and contracts. Evidence is the foundation of the AQLIYA trust principle: every local content claim must be backed by verifiable documentation.

---

## Required Fields

| #   | Field                 | Required    | Description                                                                            |
| --- | --------------------- | ----------- | -------------------------------------------------------------------------------------- |
| 1   | `evidence_id`         | Yes         | Unique identifier for the evidence item. Format: EVD-YYYY-NNNN or similar.             |
| 2   | `evidence_type`       | Yes         | Type: CR, Invoice, Contract, Certificate, PO, Payment Proof, Declaration, Other.       |
| 3   | `related_record_type` | Yes         | What this evidence relates to: Vendor, Transaction, Contract, Classification Override. |
| 4   | `related_record_id`   | Yes         | The ID of the record this evidence supports (vendor_id, contract_id, etc.).            |
| 5   | `file_name`           | Yes         | Original file name including extension.                                                |
| 6   | `file_owner`          | Recommended | Person or department that provided the file.                                           |
| 7   | `received_date`       | Yes         | Date the evidence was received. Format: YYYY-MM-DD.                                    |
| 8   | `evidence_status`     | Yes         | Current status: Received, Verified, Expired, Missing, Rejected.                        |
| 9   | `confidence_level`    | Yes         | Classification confidence this evidence provides: High, Medium, Low, None.             |
| 10  | `missing_issue`       | Optional    | Description of any issue: expired, illegible, incorrect entity, missing pages, etc.    |
| 11  | `reviewer`            | Recommended | Name or ID of the analyst who reviewed this evidence.                                  |
| 12  | `review_date`         | Recommended | Date of review. Format: YYYY-MM-DD.                                                    |
| 13  | `notes`               | Optional    | Any additional context about this evidence item.                                       |

---

## Confidence Level Definitions

| Level      | Meaning                                          | Example Evidence                                     |
| ---------- | ------------------------------------------------ | ---------------------------------------------------- |
| **High**   | Official, verifiable, unambiguous                | LCGPA certificate, valid CR, audited financials      |
| **Medium** | Strong supporting but not official certification | Supplier declaration, contract clause, valid invoice |
| **Low**    | Self-declared without independent verification   | Vendor self-classification form, verbal commitment   |
| **None**   | No evidence provided                             | Classification with no supporting documentation      |

---

## Example Rows

| evidence_id  | evidence_type | related_record_type | related_record_id | file_name                    | file_owner  | received_date | evidence_status | confidence_level | missing_issue            | reviewer | review_date | notes                                          |
| ------------ | ------------- | ------------------- | ----------------- | ---------------------------- | ----------- | ------------- | --------------- | ---------------- | ------------------------ | -------- | ----------- | ---------------------------------------------- |
| EVD-2025-001 | CR            | Vendor              | VEN-0001          | CR-1010234567.pdf            | Procurement | 2025-01-10    | Verified        | High             | —                        | A.Alamri | 2025-01-15  | Saudi CR, 10 digits, valid                     |
| EVD-2025-002 | Certificate   | Vendor              | VEN-0001          | LCGPA-2024-01234.pdf         | Vendor      | 2025-01-10    | Verified        | High             | —                        | A.Alamri | 2025-01-15  | LCGPA certificate, 85% LC, expires 2026-06     |
| EVD-2025-003 | Invoice       | Transaction         | INV-2025-1001     | INV-2025-1001.pdf            | Procurement | 2025-01-20    | Verified        | Medium           | —                        | A.Alamri | 2025-01-22  | Matches PO-2025-001                            |
| EVD-2025-004 | Declaration   | Vendor              | VEN-0005          | VEN0005-self-declaration.pdf | Vendor      | 2025-02-15    | Received        | Low              | Self-declaration, no CR  | —        | —           | Waiting for CR from vendor                     |
| EVD-2025-005 | Certificate   | Vendor              | VEN-0004          | LCGPA-2023-98765.pdf         | Procurement | 2025-01-10    | Verified        | Medium           | Certificate scope narrow | A.Alamri | 2025-01-15  | Certificate only covers construction materials |
| EVD-2025-006 | Contract      | Contract            | CTR-2024-001      | CTR-2024-001-signed.pdf      | Legal       | 2025-01-05    | Verified        | High             | —                        | A.Alamri | 2025-01-15  | Signed contract with LC clause                 |

---

## Validation Rules

| Rule                   | Logic                                                   | Severity |
| ---------------------- | ------------------------------------------------------- | -------- |
| Unique evidence_id     | No duplicate evidence IDs                               | Error    |
| Related record exists  | `related_record_id` must exist in the relevant template | Error    |
| File name extension    | Should include extension (.pdf, .xlsx, .jpg)            | Warning  |
| Received date valid    | Must be within or before the pilot period               | Warning  |
| Confidence level valid | Must be: High, Medium, Low, or None                     | Error    |
| Evidence status valid  | Must be: Received, Verified, Expired, Missing, Rejected | Error    |

---

## Common Errors

| Error                                    | How to Avoid                                                                |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Evidence linked to non-existent record   | Verify `related_record_id` exists in Vendor Master or Spend template        |
| Missing confidence level                 | Assign based on evidence type — official doc = High, self-declaration = Low |
| No file name                             | Every evidence item should have a corresponding file                        |
| Expired evidence not flagged             | Check certificate expiry dates and update status to Expired                 |
| Multiple evidence items not consolidated | Group related files under one evidence_id with clear notes                  |

---

## Sensitivity Level

- **Moderate-High** — Contains documentary evidence of business relationships and classifications
- Evidence files may contain sensitive commercial data — handle per data processing agreement

---

## Evidence Role

The Evidence Register is the **governance backbone** of LocalContentOS. It:

- Links every classification (vendor, transaction, contract) to source documentation
- Provides confidence levels for each local content claim
- Enables evidence gap analysis (what is missing, what is expired)
- Supports exception handling (classifications without adequate evidence)
- Creates the audit trail for all local content decisions
- Enables export of an evidence index with the final report
