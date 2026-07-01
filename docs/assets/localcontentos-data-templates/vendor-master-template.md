# LocalContentOS — Vendor Master Template

**Status:** Pilot Template Pack — not software
**Version:** 1.0

---

## Purpose

The Vendor Master template captures the customer's supplier list with locality-related attributes. This is the foundation for all subsequent local content classification — every transaction and contract is linked back to a vendor record.

---

## Required Fields

| #   | Field                                 | Required    | Description                                                                                                     |
| --- | ------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | `vendor_id`                           | Yes         | Unique identifier for the vendor (from customer's ERP or master data). Must be consistent across all templates. |
| 2   | `vendor_name`                         | Yes         | Vendor legal name (Arabic preferred, English if Arabic not available).                                          |
| 3   | `commercial_registration_number`      | Yes         | CR number issued by Saudi Ministry of Commerce. 10-digit alphanumeric format.                                   |
| 4   | `country`                             | Yes         | Country of registration. Use ISO country code (SA, AE, US, etc.).                                               |
| 5   | `city`                                | Recommended | City of headquarters or primary operations in Saudi Arabia (if applicable).                                     |
| 6   | `vendor_type`                         | Yes         | Type: Manufacturer, Distributor, Agent, Service Provider, Contractor, Consultant, Other.                        |
| 7   | `ownership_classification`            | Yes         | Classification per customer's records: Local, Non-Local, Mixed, Undetermined.                                   |
| 8   | `local_content_certificate_available` | Yes         | Yes / No. Whether the vendor has a valid local content certificate.                                             |
| 9   | `certificate_reference`               | Recommended | Certificate number or reference, if applicable.                                                                 |
| 10  | `classification_status`               | Yes         | Current workflow status: Draft, Pending Evidence, Reviewed, Approved.                                           |
| 11  | `notes`                               | Optional    | Any additional context about this vendor's classification.                                                      |

---

## Optional Fields

| #   | Field                           | Description                                                                             |
| --- | ------------------------------- | --------------------------------------------------------------------------------------- |
| 12  | `vendor_name_en`                | Vendor name in English (for cross-reference).                                           |
| 13  | `vat_number`                    | VAT registration number (15 digits for Saudi Arabia).                                   |
| 14  | `cr_issuance_country`           | Country that issued the CR (if different from registration country).                    |
| 15  | `manufacturing_country`         | Country where the vendor manufactures products (for manufacturing suppliers).           |
| 16  | `parent_company`                | Parent company name, if the vendor is a subsidiary.                                     |
| 17  | `classification_basis`          | Basis for current classification: CR / Ownership / Certificate / Manufacturing / Other. |
| 18  | `classification_date`           | Date the current classification was last reviewed. Format: YYYY-MM-DD.                  |
| 19  | `certificate_expiry_date`       | Expiry date of local content certificate. Format: YYYY-MM-DD.                           |
| 20  | `certificate_local_content_pct` | Local content percentage per certificate (0-100).                                       |
| 21  | `certificate_issuing_body`      | Body that issued the certificate: LCGPA, SASO, Other.                                   |

---

## Example Rows

| vendor_id | vendor_name                       | commercial_registration_number | country | city   | vendor_type      | ownership_classification | local_content_certificate_available | certificate_reference | classification_status | notes                                           |
| --------- | --------------------------------- | ------------------------------ | ------- | ------ | ---------------- | ------------------------ | ----------------------------------- | --------------------- | --------------------- | ----------------------------------------------- |
| VEN-0001  | الشركة السعودية للصناعات المتطورة | 1010234567                     | SA      | الرياض | Manufacturer     | Local                    | Yes                                 | LCGPA-2024-01234      | Reviewed              | Certified local manufacturer, 85% local content |
| VEN-0002  | التقنية المتقدمة للحلول الرقمية   | 1010345678                     | SA      | جدة    | Service Provider | Local                    | No                                  | —                     | Draft                 | New vendor, CR verifies Saudi registration      |
| VEN-0003  | Global Tech Solutions W.L.L.      | —                              | BH      | —      | Distributor      | Non-Local                | No                                  | —                     | Draft                 | Non-Saudi registered, Bahraini entity           |
| VEN-0004  | مجموعة أعمال المتحدة المحدودة     | 1010456789                     | SA      | الدمام | Contractor       | Mixed                    | Yes                                 | LCGPA-2023-98765      | Pending Evidence      | Local distributor for international brand       |
| VEN-0005  | International Construction Co.    | 2020567890                     | SA      | —      | Contractor       | Undetermined             | No                                  | —                     | Draft                 | Saudi CR but operations base unclear            |

---

## Validation Rules

| Rule                           | Logic                                                    | Severity |
| ------------------------------ | -------------------------------------------------------- | -------- |
| Unique vendor_id               | No duplicate vendor_id values                            | Error    |
| CR format                      | Saudi CR: must be 10 digits for Saudi-registered vendors | Warning  |
| Country code                   | Must be valid ISO 3-letter country code                  | Error    |
| Classification valid           | Must be: Local, Non-Local, Mixed, or Undetermined        | Error    |
| Certificate reference required | Required if local_content_certificate_available = Yes    | Warning  |
| Classification basis required  | Required if ownership_classification = Local or Mixed    | Warning  |

---

## Common Errors

| Error                                    | How to Avoid                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| Vendor IDs not matching across templates | Use the same vendor_id in Procurement Spend and Contracts templates          |
| Missing CR numbers for Saudi vendors     | Ask customer to provide CR — it is primary evidence for local classification |
| Inconsistent vendor names                | Use the legal name from the CR, not trading names                            |
| Outdated classifications                 | Verify classification_date is within the reporting period                    |
| Missing certificate references           | Ask customer to retrieve certificate numbers before evidence review          |

---

## Sensitivity Level

- **Low-Moderate** — Vendor names and CR numbers are commercially available information
- **High** — Any classification decisions that could affect business relationships

---

## Evidence Role

The Vendor Master is the **primary evidence anchor** for:

- Supplier locality determination
- Spend classification (linking transactions to local/non-local vendors)
- Local content certificate verification
- Exception flagging (undetermined vendors, expired certificates)
