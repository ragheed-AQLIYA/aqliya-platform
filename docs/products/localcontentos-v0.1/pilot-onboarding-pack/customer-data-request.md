# Customer Data Request — LocalContentOS v0.1 Pilot

To run the pilot, AQLIYA needs sample data from the customer. Data can be real or anonymized. All data is handled under the pilot agreement terms.

## Acceptable Formats

| Format   | Use Case                                           |
| -------- | -------------------------------------------------- |
| CSV      | Preferred for structured data (suppliers, spend)   |
| XLSX     | Acceptable — export as CSV if possible             |
| PDF      | Evidence files (certificates, contracts, invoices) |
| DOCX/DOC | Evidence files (attestations, reports)             |
| JPG/PNG  | Scanned documents as evidence                      |

Maximum file size: 10MB per upload.

## 1. Supplier Master List

Required for supplier register setup.

| Field                      | Required | Type           | Example                                  |
| -------------------------- | -------- | -------------- | ---------------------------------------- |
| Supplier name              | Yes      | Text           | شركة التقنية المتقدمة                    |
| CR number                  | Yes      | Text           | 1010123456                               |
| Locality classification    | Yes      | Enum           | local / non_local / mixed / unclassified |
| Ownership type             | Yes      | Enum           | saudi / foreign / joint_venture          |
| Local content percentage   | Yes      | Number (0-100) | 85                                       |
| Workforce Saudi percentage | No       | Number (0-100) | 92                                       |
| Contact person             | No       | Text           | Ahmed Al-Mansouri                        |
| Email                      | No       | Email          | ahmed@example.com                        |
| Phone                      | No       | Text           | +966501234567                            |

**Acceptable if incomplete:** At minimum supplier name, CR number, and locality classification are required. Other fields can be estimated by the AQLIYA analyst.

## 2. Procurement / Spend Records

Required for spend register and classification.

| Field                      | Required | Type          | Example                                                          |
| -------------------------- | -------- | ------------- | ---------------------------------------------------------------- |
| Supplier name              | Yes      | Text          | شركة التقنية المتقدمة                                            |
| Supplier CR (if available) | Yes      | Text          | 1010123456                                                       |
| Amount                     | Yes      | Number (SAR)  | 1250000                                                          |
| Category                   | Yes      | Enum          | goods / services / construction / technology / logistics / other |
| Contract reference         | No       | Text          | CON-2025-001                                                     |
| Period                     | No       | Text (YYYY/Q) | FY2025/Q2                                                        |
| Description                | No       | Text          | تطوير نظام إدارة المشتريات                                       |
| Currency                   | No       | Text (ISO)    | SAR                                                              |

**Expected volume:** 20-200 records for a meaningful pilot.

## 3. Supplier Classification Info

Optional but helpful for accurate classification.

| Field                         | Description                                                        |
| ----------------------------- | ------------------------------------------------------------------ |
| Existing classification rules | How the customer currently classifies suppliers as local/non-local |
| Policy thresholds             | What % thresholds define "local" for your organization             |
| Certificate references        | Any existing local content certificates or attestations            |

## 4. Evidence Files

Optional — sample documents to demonstrate evidence linking.

| Document Type        | Purpose                                  |
| -------------------- | ---------------------------------------- |
| Supplier certificate | Demonstrate evidence upload and linking  |
| Contract sample      | Show evidence attachment to spend record |
| Invoice sample       | Show evidence attachment to spend record |
| Attestation letter   | Self-declaration evidence type           |

## 5. User Access Information

| Field                   | Required | Example                              |
| ----------------------- | -------- | ------------------------------------ |
| Pilot users' full names | Yes      | Sara Al-Otaibi                       |
| Email addresses         | Yes      | sara@customer.com                    |
| Roles                   | Yes      | ADMIN / REVIEWER / APPROVER / VIEWER |

## CSV Import Guidelines

CSV files should use UTF-8 encoding with Arabic support.

Required columns for supplier CSV import:

```csv
supplier_name,cr_number,locality_classification,ownership_type,local_content_pct,workforce_saudi_pct
شركة التقنية المتقدمة,1010123456,local,saudi,85,92
```

Required columns for spend CSV import:

```csv
supplier_name,cr_number,amount,category,contract_ref,period,description
شركة التقنية المتقدمة,1010123456,1250000,technology,CON-2025-001,FY2025/Q2,تطوير نظام
```

Arabic and English column headers are both supported.

## Data Protection

- All customer data remains customer property
- Data is stored in the AQLIYA cloud environment with tenant isolation
- Data can be exported and deleted at pilot closeout
- Anonymized data is acceptable if customer prefers
- No data is shared across workspaces or organizations
