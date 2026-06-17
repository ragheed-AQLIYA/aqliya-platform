# LocalContentOS — Procurement Spend Template

**Status:** Pilot Template Pack — not software
**Version:** 1.0

---

## Purpose

The Procurement Spend template captures the customer's procurement transactions for the pilot reporting period. This is the primary data source for local spend calculation — each transaction is classified as local or non-local based on its linked vendor.

---

## Required Fields

| #   | Field                   | Required    | Description                                                                                         |
| --- | ----------------------- | ----------- | --------------------------------------------------------------------------------------------------- |
| 1   | `purchase_order_id`     | Recommended | PO number from customer's ERP. Used as transaction identifier.                                      |
| 2   | `invoice_id`            | Recommended | Invoice number. If PO is not available, use invoice as transaction ID.                              |
| 3   | `vendor_id`             | Yes         | Must match `vendor_id` in the Vendor Master template. Links transaction to supplier classification. |
| 4   | `vendor_name`           | Yes         | Vendor name for display and cross-reference. Should match Vendor Master.                            |
| 5   | `spend_date`            | Yes         | Date of the transaction (invoice date or goods receipt date). Format: YYYY-MM-DD.                   |
| 6   | `reporting_period`      | Yes         | Period label matching the pilot scope: e.g., "Q1-2026", "FY2025", "Project-A".                      |
| 7   | `category`              | Recommended | Procurement category. Use customer's category taxonomy.                                             |
| 8   | `subcategory`           | Optional    | More granular classification within the category.                                                   |
| 9   | `item_description`      | Recommended | Brief description of goods or services purchased. Arabic or English.                                |
| 10  | `amount_excluding_vat`  | Yes         | Transaction amount in SAR, excluding VAT. Use numeric format (no commas).                           |
| 11  | `currency`              | Yes         | ISO currency code: SAR, USD, EUR, etc.                                                              |
| 12  | `contract_reference`    | Recommended | Link to Contract ID if this transaction is under a specific contract.                               |
| 13  | `cost_center`           | Recommended | Cost center or department code that incurred the spend.                                             |
| 14  | `project_reference`     | Optional    | Project ID if the spend is project-specific.                                                        |
| 15  | `evidence_reference`    | Recommended | Reference to evidence supporting this transaction (invoice file name, evidence ID).                 |
| 16  | `classification_status` | Yes         | Current review status: Unclassified, Local, Non-Local, Mixed, Pending Review, Approved.             |
| 17  | `reviewer_notes`        | Optional    | Notes from the analyst reviewing this transaction.                                                  |

---

## Example Rows

| purchase_order_id | invoice_id    | vendor_id | vendor_name                       | spend_date | reporting_period | category             | subcategory        | item_description    | amount_excluding_vat | currency | contract_reference | cost_center | project_reference | evidence_reference | classification_status | reviewer_notes                                   |
| ----------------- | ------------- | --------- | --------------------------------- | ---------- | ---------------- | -------------------- | ------------------ | ------------------- | -------------------- | -------- | ------------------ | ----------- | ----------------- | ------------------ | --------------------- | ------------------------------------------------ |
| PO-2025-001       | INV-2025-1001 | VEN-0001  | الشركة السعودية للصناعات المتطورة | 2025-01-15 | Q1-2026          | Industrial Equipment | Machinery          | خط إنتاج تعبئة      | 1,250,000.00         | SAR      | CTR-2024-001       | CC-MFG      | PROJ-ALPHA        | INV-2025-1001.pdf  | Local                 | Verified local manufacturer with certificate     |
| PO-2025-002       | INV-2025-1002 | VEN-0003  | Global Tech Solutions W.L.L.      | 2025-01-20 | Q1-2026          | IT Services          | Software License   | تراخيص برامج مؤسسية | 450,000.00           | SAR      | —                  | CC-IT       | —                 | INV-2025-1002.pdf  | Non-Local             | Non-Saudi entity, Bahrain registered             |
| PO-2025-003       | INV-2025-1003 | VEN-0004  | مجموعة أعمال المتحدة المحدودة     | 2025-02-01 | Q1-2026          | Construction         | Building Materials | مواد بناء وتشطيب    | 780,000.00           | SAR      | CTR-2023-045       | CC-CONST    | PROJ-BETA         | INV-2025-1003.pdf  | Mixed                 | Local distributor, manufacturer is international |
| PO-2025-004       | INV-2025-1004 | VEN-0005  | International Construction Co.    | 2025-02-10 | Q1-2026          | Construction         | Consulting         | استشارات هندسية     | 320,000.00           | SAR      | —                  | CC-CONST    | PROJ-BETA         | —                  | Pending Review        | Saudi CR but need to verify operations           |
| PO-2025-005       | INV-2025-1005 | VEN-0002  | التقنية المتقدمة للحلول الرقمية   | 2025-02-20 | Q1-2026          | IT Services          | Cloud Services     | خدمات سحابية وحوسبة | 95,000.00            | SAR      | CTR-2025-012       | CC-IT       | PROJ-ALPHA        | INV-2025-1005.pdf  | Unclassified          | New vendor, awaiting evidence                    |

---

## Validation Rules

| Rule               | Logic                                                        | Severity |
| ------------------ | ------------------------------------------------------------ | -------- |
| Vendor ID exists   | Every `vendor_id` must exist in the Vendor Master template   | Error    |
| Amount positive    | `amount_excluding_vat` must be a positive number             | Error    |
| Valid date         | `spend_date` must be a valid date within a reasonable range  | Error    |
| Currency format    | Must be valid ISO 4217 code                                  | Warning  |
| Amount format      | Numeric only — no currency symbols, no thousand separators   | Error    |
| PO uniqueness      | Duplicate PO numbers flagged for review                      | Warning  |
| Period consistency | All transactions should be within the pilot reporting period | Warning  |

---

## Common Errors

| Error                                   | How to Avoid                                              |
| --------------------------------------- | --------------------------------------------------------- |
| Vendor ID does not match Vendor Master  | Ensure the same vendor_id scheme is used across templates |
| Amounts with commas or currency symbols | Use raw numbers: 1250000.00 not "1,250,000 SAR"           |
| Missing invoice_id or PO_id             | Include at least one transaction identifier               |
| Inconsistent category names             | Provide a category list alongside the spend template      |
| Out-of-period transactions              | Verify spend_date falls within the pilot reporting period |
| Missing evidence_reference              | Add file names or evidence IDs for traceability           |

---

## Sensitivity Level

- **High** — Contains commercially sensitive spend data, supplier rates, and contract amounts
- Customer may aggregate or anonymize if needed for the pilot

---

## Evidence Role

The Procurement Spend template provides the **transaction-level data** for:

- Local vs. non-local spend calculation
- Category-level local content breakdown
- Contract commitment tracking (via `contract_reference`)
- Evidence linkage (via `evidence_reference`)
- Exception identification (outlier amounts, uncategorized spend)
