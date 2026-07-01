# Customer Data Handling Rules — AQLIYA

## Purpose

Define rules for receiving, storing, using, protecting, and deleting customer data during a controlled pilot. These rules are non-negotiable and apply to all AQLIYA pilot engagements.

## When to Use

Before any customer data enters AQLIYA systems. Must be attached to the pilot agreement.

---

## Data Classification

| Category           | Examples                              | Handling Rule                                                    |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------- |
| Financial records  | Trial balances, GL accounts, invoices | Encrypt at rest and in transit. Access limited to assigned team. |
| Supplier data      | Vendor names, contracts, spend data   | Tenant-isolated. Never shared across organizations.              |
| Personnel data     | Reviewer names, roles, comments       | Pseudonymize in reports. Retain only for pilot duration.         |
| Uploaded documents | PDFs, XLSX, images                    | Checksum on upload. Access logged. Retention limited.            |

## General Rules

1. **Minimization** — Collect only data explicitly required for the agreed pilot scope.
2. **Isolation** — Customer data is tenant-isolated by `organizationId`. No cross-organization access.
3. **Access control** — Only assigned AQLIYA team members with explicit role may access. All access logged in `AuditEvent`.
4. **Encryption** — Data encrypted at rest (AES-256) and in transit (TLS 1.2+).
5. **No sharing** — Customer data is never used for training, demos, or analytics outside the customer's own pilot.
6. **No subprocessing** — Data stays within AQLIYA-controlled infrastructure. No third-party AI model training.
7. **Retention** — Data retained only for pilot duration + 30 days for closeout, then deleted unless customer explicitly agrees to conversion.

## Data Deletion Process

| Trigger                      | Action                                                        |
| ---------------------------- | ------------------------------------------------------------- |
| Pilot ends (no conversion)   | Full deletion within 30 days. Confirm by audit log.           |
| Pilot ends (paid conversion) | Data retained per paid agreement. Update data handling rules. |
| Customer requests deletion   | Delete within 7 business days. Written confirmation.          |
| Security incident            | Isolate data. Notify customer within 24h.                     |

## Data Export Rules

- Exports must be approved by the reviewer before download.
- Each export includes: status disclaimer, generation timestamp, organization, reviewer name.
- Exports do not claim certified or regulator-approved status.

## Prohibited

- Using customer data for AQLIYA internal product demos
- Uploading customer data to public AI services (ChatGPT, Claude, etc.)
- Storing customer data on personal devices
- Sharing credentials or access links

## Owner

- **Data Protection Lead:** AQLIYA Product Team
- **Review cycle:** Before each pilot engagement

## Status

- [ ] Draft
- [ ] Reviewed
- [ ] Approved
- [ ] Active
