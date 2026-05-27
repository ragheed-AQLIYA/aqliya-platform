# Pilot Data Intake Checklist — AQLIYA

## Purpose

Ensure every piece of customer data entering AQLIYA systems during a pilot is properly classified, verified, and tracked. Prevents prohibited data from entering the system.

## When to Use

- Before any customer data is uploaded to the pilot environment
- After each batch of data from the customer
- During data quality review at weekly rhythm

## Inputs

- Customer data handling rules (`pilot-control-pack/customer-data-handling-rules.md`)
- Signed pilot scope template

---

## Data Intake Checklist

### General Information

| Field                           | Value |
| ------------------------------- | ----- |
| Pilot ID                        |       |
| Customer Name                   |       |
| Data Source (person/department) |       |
| Date Received                   |       |
| Date of Expected Deletion       |       |

### Accepted Data Types (per scope)

| Data Type                       | Scope Coverage   | Accepted?  | Notes              |
| ------------------------------- | ---------------- | ---------- | ------------------ |
| Financial trial balances        | ☐ AuditOS        | ☐ Yes ☐ No |                    |
| General ledger accounts         | ☐ AuditOS        | ☐ Yes ☐ No |                    |
| Supplier/vendor records         | ☐ LocalContentOS | ☐ Yes ☐ No |                    |
| Spend/procurement data          | ☐ LocalContentOS | ☐ Yes ☐ No |                    |
| Organizational structure        | ☐ General        | ☐ Yes ☐ No |                    |
| User/employee names (reviewers) | ☐ General        | ☐ Yes ☐ No | Minimum necessary  |
| Anonymized/synthetic data       | ☐ Any            | ☐ Yes ☐ No | Preferred for demo |

### Prohibited Data

| Type                                                   | Check                | Action if Found        |
| ------------------------------------------------------ | -------------------- | ---------------------- |
| Personally Identifiable Information (PII) beyond names | ☐ None found ☐ Found | Remove or pseudonymize |
| National ID / Social Security numbers                  | ☐ None found ☐ Found | Reject immediately     |
| Passport / government ID numbers                       | ☐ None found ☐ Found | Reject immediately     |
| Credit card / bank account numbers                     | ☐ None found ☐ Found | Reject immediately     |
| Health / medical records                               | ☐ None found ☐ Found | Reject immediately     |
| Classified / confidential gov data                     | ☐ None found ☐ Found | Reject immediately     |
| Trade secrets / proprietary code                       | ☐ None found ☐ Found | Reject immediately     |

### Sanitization Check

| Check                                        | Pass?         | Notes |
| -------------------------------------------- | ------------- | ----- |
| All prohibited data types confirmed absent   | ☐ Pass ☐ Fail |       |
| File names are descriptive (no PII in names) | ☐ Pass ☐ Fail |       |
| Data is in agreed format (XLSX, CSV, PDF)    | ☐ Pass ☐ Fail |       |
| File size within platform limits             | ☐ Pass ☐ Fail |       |
| Encoding is UTF-8 or compatible              | ☐ Pass ☐ Fail |       |

### Ownership Confirmation

| Question                                                | Answer                 |
| ------------------------------------------------------- | ---------------------- |
| Does the customer confirm this data is theirs to share? | ☐ Yes ☐ No             |
| Does the customer understand deletion timeline?         | ☐ Yes ☐ No             |
| Has the customer designated a data owner?               | ☐ Yes, name: ☐ Not yet |

### Deletion Expectation

| Rule                                   | Value                             |
| -------------------------------------- | --------------------------------- |
| Retention period                       | Pilot duration + 30 days          |
| Deletion trigger                       | Pilot closeout (if no conversion) |
| Customer can request earlier deletion? | ☐ Yes — within 7 business days    |
| Confirmation of deletion provided?     | ☐ Yes — written confirmation      |

### Evidence Tracking

Each data file received should have:

| File Name | Type | Size | Checksum (SHA-256) | Uploaded By | Date | Evidence ID |
| --------- | ---- | ---- | ------------------ | ----------- | ---- | ----------- |
|           |      |      |                    |             |      |             |
|           |      |      |                    |             |      |             |

---

## Approval

| Role                         | Name | Signature | Date |
| ---------------------------- | ---- | --------- | ---- |
| Data received by (AQLIYA)    |      |           |      |
| Data confirmed by (Customer) |      |           |      |

## Owner

- **Data Intake Lead:** AQLIYA Technical Lead
- **Customer Contact:** Customer Technical Contact

## Related Files in Pilot Control Pack

- `pilot-control-pack/customer-data-handling-rules.md`
- `pilot-control-pack/pilot-scope-template.md`

## Status

- [ ] Draft
- [ ] In Progress
- [ ] Complete
