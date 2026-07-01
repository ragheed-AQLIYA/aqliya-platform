# LocalContentOS — Contracts Template

**Status:** Pilot Template Pack — not software
**Version:** 1.0

---

## Purpose

The Contracts template captures the customer's active contracts for the pilot period. It enables multi-period local content commitment tracking — linking procurement spend to contractual local content obligations.

---

## Required Fields

| #   | Field                                  | Required    | Description                                                                         |
| --- | -------------------------------------- | ----------- | ----------------------------------------------------------------------------------- |
| 1   | `contract_id`                          | Yes         | Unique contract identifier (from customer's contract management system or ERP).     |
| 2   | `contract_title`                       | Yes         | Contract name or brief description. Arabic preferred.                               |
| 3   | `vendor_id`                            | Yes         | Must match `vendor_id` in the Vendor Master template.                               |
| 4   | `vendor_name`                          | Yes         | Vendor name for cross-reference.                                                    |
| 5   | `contract_start_date`                  | Yes         | Contract effective date. Format: YYYY-MM-DD.                                        |
| 6   | `contract_end_date`                    | Recommended | Contract expiry or end date. Format: YYYY-MM-DD. Leave blank if evergreen.          |
| 7   | `contract_value`                       | Yes         | Total contract value in SAR.                                                        |
| 8   | `contract_category`                    | Recommended | Category matching Procurement Spend categories.                                     |
| 9   | `local_content_clause_present`         | Yes         | Yes / No. Whether the contract includes a local content commitment clause.          |
| 10  | `local_content_commitment_description` | Recommended | Description of the local content commitment: percentage, amount, scope, or targets. |
| 11  | `evidence_reference`                   | Recommended | Link to signed contract file or relevant evidence.                                  |
| 12  | `owner_department`                     | Recommended | Department or business unit that owns the contract.                                 |
| 13  | `review_status`                        | Yes         | Current status: Draft, Under Review, Reviewed, Linked to Spend, Exception.          |
| 14  | `notes`                                | Optional    | Additional context about the contract or its local content commitment.              |

---

## Optional Fields

| #   | Field                      | Description                                                                                |
| --- | -------------------------- | ------------------------------------------------------------------------------------------ |
| 15  | `contract_type`            | Type: Framework Agreement, Fixed Price, Time & Materials, Service Level, Other.            |
| 16  | `currency`                 | Currency if not SAR.                                                                       |
| 17  | `lc_commitment_percentage` | Local content commitment as percentage (0-100), if specified in contract.                  |
| 18  | `lc_commitment_amount`     | Local content commitment as amount in SAR, if specified.                                   |
| 19  | `lc_reporting_frequency`   | How often local content is reported under this contract: Quarterly, Annually, Per Project. |
| 20  | `lc_penalty_clause`        | Yes / No. Whether there are penalties for non-compliance with local content commitments.   |
| 21  | `lc_verified_last_period`  | Actual local content % achieved last reporting period, if available.                       |
| 22  | `renewal_date`             | Next renewal or review date for the contract.                                              |

---

## Example Rows

| contract_id  | contract_title                    | vendor_id | vendor_name                       | contract_start_date | contract_end_date | contract_value | contract_category    | local_content_clause_present | local_content_commitment_description            | evidence_reference      | owner_department | review_status   | notes                                            |
| ------------ | --------------------------------- | --------- | --------------------------------- | ------------------- | ----------------- | -------------- | -------------------- | ---------------------------- | ----------------------------------------------- | ----------------------- | ---------------- | --------------- | ------------------------------------------------ |
| CTR-2024-001 | عقد توريد خط إنتاج                | VEN-0001  | الشركة السعودية للصناعات المتطورة | 2024-01-01          | 2026-12-31        | 15,000,000.00  | Industrial Equipment | Yes                          | Minimum 70% local content across all deliveries | CTR-2024-001-signed.pdf | Manufacturing    | Reviewed        | Multi-year agreement with quarterly LC reporting |
| CTR-2023-045 | عقد أعمال إنشاءات المرحلة الثانية | VEN-0004  | مجموعة أعمال المتحدة المحدودة     | 2023-06-01          | 2025-05-31        | 8,500,000.00   | Construction         | Yes                          | 50% local content: materials + labor            | CTR-2023-045-signed.pdf | Projects         | Linked to Spend | Mixed — local distributor for imported materials |
| CTR-2025-012 | عقد خدمات تقنية معلومات           | VEN-0002  | التقنية المتقدمة للحلول الرقمية   | 2025-01-01          | 2025-12-31        | 1,200,000.00   | IT Services          | No                           | —                                               | CTR-2025-012-signed.pdf | IT               | Under Review    | New contract, LC clause under negotiation        |
| CTR-2025-030 | Professional Services Agreement   | VEN-0003  | Global Tech Solutions W.L.L.      | 2025-03-01          | 2026-02-28        | 3,000,000.00   | IT Services          | No                           | —                                               | CTR-2025-030-signed.pdf | IT               | Draft           | Non-local vendor, no LC commitment               |

---

## Validation Rules

| Rule                       | Logic                                                    | Severity |
| -------------------------- | -------------------------------------------------------- | -------- |
| Vendor ID exists           | Every `vendor_id` must exist in the Vendor Master        | Error    |
| Start date before end date | `contract_start_date` must be before `contract_end_date` | Warning  |
| Contract value positive    | Must be a positive number                                | Error    |
| Contract ID unique         | No duplicate contract IDs                                | Error    |
| LC clause present          | If Yes, description or percentage should be provided     | Warning  |
| LC percentage valid        | If provided, must be between 0 and 100                   | Warning  |

---

## Common Errors

| Error                                      | How to Avoid                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Same contract appears under different IDs  | Use the authoritative contract management system ID                                        |
| No local content clause documented         | If the commitment is verbal or informal, note it in `local_content_commitment_description` |
| Contract value mismatch with spend         | Total spend against a contract may differ from contract value — both are valid             |
| Missing end dates for fixed-term contracts | Confirm with customer — some contracts auto-renew                                          |
| Outdated review status                     | Update `review_status` when the contract is reviewed against spend                         |

---

## Sensitivity Level

- **High** — Contract values, terms, and local content commitments are commercially sensitive
- Customer may redact specific commercial terms while keeping local content data

---

## Evidence Role

The Contracts template supports:

- Multi-period local content commitment tracking
- Linking procurement spend to contractual obligations
- Gap analysis (committed vs. actual local content)
- Exception flagging (contracts with LC clauses but no evidence)
- Management reporting on commitment compliance
