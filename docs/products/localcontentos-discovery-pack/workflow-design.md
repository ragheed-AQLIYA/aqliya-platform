# LocalContentOS — Workflow Design

**Status:** Discovery / Planned (not implemented)
**Version:** 1.0 — Discovery Pack
**Reference:** Aligned with AQLIYA Workflow Engine state machine (Draft → Prepared → Reviewed → Returned → Approved → Locked → Exported → Archived)

---

## Workflow Overview

```
Organization Setup → Reporting Period Setup → Supplier/Vendor Upload → Contract/Procurement Upload
→ Spend Classification → Local/Non-Local Supplier Tagging → Evidence Attachment
→ Local Content Calculation Draft → Review Exceptions → Findings and Gaps
→ Management Review → Approval → Export/Report Package → Audit Trail
```

Each phase has defined inputs, actors, system actions, human review points, evidence requirements, outputs, and audit events.

---

## Step 1: Organization Setup

| Field                 | Detail                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Input**             | Organization name, registration details, industry sector, local content policy reference |
| **Actor**             | System administrator (AQLIYA side)                                                       |
| **System Action**     | Create organization profile, set workspace parameters, configure roles                   |
| **Human Review**      | Verify organization details match registration                                           |
| **Evidence Required** | Commercial registration (CR)                                                             |
| **Output**            | Active organization profile in LocalContentOS workspace                                  |
| **Audit Log Event**   | `ORGANIZATION_CREATED` — {org_id, name, sector, timestamp}                               |

---

## Step 2: Reporting Period Setup

| Field                 | Detail                                                                               |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Input**             | Period name, start date, end date, reporting type (quarterly, annual, project-based) |
| **Actor**             | LocalContentOS administrator (customer side)                                         |
| **System Action**     | Create reporting period, set status to "Open for data entry"                         |
| **Human Review**      | Confirm period dates and type are correct                                            |
| **Evidence Required** | None at this stage                                                                   |
| **Output**            | Active reporting period ready for data upload                                        |
| **Audit Log Event**   | `PERIOD_CREATED` — {period_id, name, start_date, end_date, status}                   |

---

## Step 3: Supplier / Vendor Upload

| Field                 | Detail                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Input**             | Vendor master list (CSV/Excel) — vendor ID, name, nationality, registration country, local status, CR number |
| **Actor**             | Procurement team / supplier data analyst                                                                     |
| **System Action**     | Import vendor data, match against existing vendors, flag duplicates                                          |
| **Human Review**      | Review flagged duplicates, confirm vendor locality classification                                            |
| **Evidence Required** | Vendor CR, commercial registration certificate (optional for initial upload, required for evidence stage)    |
| **Output**            | Clean vendor register linked to reporting period                                                             |
| **Audit Log Event**   | `VENDORS_UPLOADED` — {count, duplicates_flagged, timestamp}                                                  |

---

## Step 4: Contract / Procurement Data Upload

| Field                 | Detail                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Input**             | Procurement spend report, purchase orders, contracts — PO number, vendor ID, amount, currency, contract date, category |
| **Actor**             | Procurement team                                                                                                       |
| **System Action**     | Import transaction data, link to vendors, validate totals                                                              |
| **Human Review**      | Review import summary, verify totals match source                                                                      |
| **Evidence Required** | Source procurement report / ERP extract (PDF/XLSX)                                                                     |
| **Output**            | Transaction register linked to vendors and period                                                                      |
| **Audit Log Event**   | `TRANSACTIONS_UPLOADED` — {count, total_amount, period_id}                                                             |

---

## Step 5: Spend Classification

| Field                 | Detail                                                                                                                             |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Input**             | Transaction data with vendor links                                                                                                 |
| **Actor**             | System (AI-assisted classification) + Human reviewer                                                                               |
| **System Action**     | Apply classification rules based on vendor locality, contract type, category. Suggest local/non-local split. Flag ambiguous items. |
| **Human Review**      | Review and confirm each classification. Override system suggestion with justification.                                             |
| **Evidence Required** | Classification criteria / policy document (uploaded per period or organization)                                                    |
| **Output**            | Classified transactions — each with local/non-local tag, confidence level, classification reason                                   |
| **Audit Log Event**   | `CLASSIFICATION_COMPLETED` — {local_count, non_local_count, exceptions_flagged, reviewed_by}                                       |

---

## Step 6: Local / Non-Local Supplier Tagging

| Field                 | Detail                                                                                                                                   |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Input**             | Vendor register with initial locality classification                                                                                     |
| **Actor**             | Procurement team + Local content officer                                                                                                 |
| **System Action**     | Apply locality rules based on registration, ownership, manufacturing capability. Tag each vendor: Local, Non-Local, Mixed, Undetermined. |
| **Human Review**      | Confirm or override tags. For "Undetermined" — request additional evidence before final tagging.                                         |
| **Evidence Required** | Vendor certificate of local status, manufacturing capability statement, ownership structure (for complex cases)                          |
| **Output**            | Vendor register with final locality tags and supporting evidence references                                                              |
| **Audit Log Event**   | `VENDOR_TAGGING_COMPLETED` — {local_count, non_local_count, mixed_count, pending_count, reviewer}                                        |

---

## Step 7: Evidence Attachment

| Field                 | Detail                                                                                                                        |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Input**             | Supplier certificates, invoices, contracts, local content certificates, payment proofs                                        |
| **Actor**             | Procurement team / Data entry team                                                                                            |
| **System Action**     | Accept file uploads (PDF, XLSX, images), link to specific vendors or transactions, validate file integrity                    |
| **Human Review**      | Verify evidence matches the vendor/transaction it is linked to                                                                |
| **Evidence Required** | Per classification: supplier CR for local, invoice for spend, contract for commitment, local content certificate if available |
| **Output**            | Evidence vault — files linked to vendors, transactions, and classifications                                                   |
| **Audit Log Event**   | `EVIDENCE_UPLOADED` — {file_count, linked_entities, uploaded_by}                                                              |

---

## Step 8: Local Content Calculation Draft

| Field                 | Detail                                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Input**             | Classified transactions, vendor tags, evidence, calculation logic                                                 |
| **Actor**             | System (calculation engine)                                                                                       |
| **System Action**     | Calculate draft local content metrics: local spend %, local vendor %, category-level breakdown, period comparison |
| **Human Review**      | Preview draft metrics, compare against expectations                                                               |
| **Evidence Required** | All evidence from previous steps (aggregated)                                                                     |
| **Output**            | Draft local content report — metrics, breakdowns, confidence indicators                                           |
| **Audit Log Event**   | `CALCULATION_DRAFTED` — {metrics_summary, calculation_version, generated_by}                                      |

---

## Step 9: Review Exceptions

| Field                 | Detail                                                                                             |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| **Input**             | Draft calculation, flagged exceptions (ambiguous classifications, missing evidence, data gaps)     |
| **Actor**             | Local content officer                                                                              |
| **System Action**     | Present exception list with severity: Critical, Warning, Info                                      |
| **Human Review**      | Review each exception. Clear, accept with note, or escalate.                                       |
| **Evidence Required** | Depends on exception type — additional supplier docs, contract clauses, etc.                       |
| **Output**            | Resolved exception list with review decisions                                                      |
| **Audit Log Event**   | `EXCEPTIONS_REVIEWED` — {critical_count, warning_count, resolved_count, escalated_count, reviewer} |

---

## Step 10: Findings and Gaps

| Field                 | Detail                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| **Input**             | Exception review outcomes, missing evidence log, data quality assessment                        |
| **Actor**             | Local content officer                                                                           |
| **System Action**     | Aggregate findings from exceptions, generate gap analysis                                       |
| **Human Review**      | Draft gap narrative, classify findings (Data Gap, Evidence Gap, Classification Gap, Policy Gap) |
| **Evidence Required** | Exception review log, missing evidence list                                                     |
| **Output**            | Findings and gaps report — narrative + categorized gaps + recommendations                       |
| **Audit Log Event**   | `FINDINGS_DRAFTED` — {findings_count, gap_categories, drafted_by}                               |

---

## Step 11: Management Review

| Field                 | Detail                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------- |
| **Input**             | Draft report, exceptions log, findings and gaps                                             |
| **Actor**             | Management reviewer (Procurement Director / Local Content Manager)                          |
| **System Action**     | Present full report package for review. Lock editing during review.                         |
| **Human Review**      | Review all sections. Add management comments. Return for revision or approve.               |
| **Evidence Required** | Full evidence vault accessible during review                                                |
| **Output**            | Reviewed report — with management comments and disposition (Approved / Return for Revision) |
| **Audit Log Event**   | `MANAGEMENT_REVIEWED` — {disposition, comments_count, reviewer}                             |

---

## Step 12: Approval

| Field                 | Detail                                                                   |
| --------------------- | ------------------------------------------------------------------------ |
| **Input**             | Reviewed report package                                                  |
| **Actor**             | Approver (CFO / CEO / Local Content Committee)                           |
| **System Action**     | Present final report for approval. Lock all data upon approval.          |
| **Human Review**      | Final sign-off. Review summary, not details.                             |
| **Evidence Required** | Executive summary report, key metrics, findings summary                  |
| **Output**            | Approved local content report — locked, timestamped, with approval chain |
| **Audit Log Event**   | `REPORT_APPROVED` — {approver, approval_date, report_version}            |

---

## Step 13: Export / Report Package

| Field                 | Detail                                                                |
| --------------------- | --------------------------------------------------------------------- |
| **Input**             | Approved locked report                                                |
| **Actor**             | System (authorized user triggers export)                              |
| **System Action**     | Generate export package: PDF report, XLSX data sheets, evidence index |
| **Human Review**      | Verify export contents before distribution                            |
| **Evidence Required** | N/A — export is the final output                                      |
| **Output**            | Export package — distributable report with evidence appendix          |
| **Audit Log Event**   | `REPORT_EXPORTED` — {export_format, exported_by, export_timestamp}    |

---

## Step 14: Audit Trail

| Field                 | Detail                                                                               |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Input**             | All events from steps 1–13                                                           |
| **Actor**             | System (automatic)                                                                   |
| **System Action**     | Compile full audit trail: who did what, when, what changed, what source, what result |
| **Human Review**      | Available for auditors and reviewers on demand                                       |
| **Evidence Required** | All events and evidence from the period                                              |
| **Output**            | Immutable audit trail — available as view or export                                  |
| **Audit Log Event**   | `AUDIT_TRAIL_GENERATED` — {period_id, event_count, generated_at}                     |

---

## Workflow State Machine

```
                    ┌──────────┐
                    │   DRAFT  │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │ PREPARED │
                    └────┬─────┘
                         │
                    ┌────▼──────┐
              ┌─────│ REVIEWED  │─────┐
              │     └────┬──────┘     │
         (Return)        │        (Return)
              │     ┌────▼──────┐     │
              └─────│ RETURNED  │─────┘
                    └───────────┘
                         │
                    ┌────▼──────┐
                    │ APPROVED  │
                    └────┬──────┘
                         │
                    ┌────▼──────┐
                    │  LOCKED   │
                    └────┬──────┘
                         │
                    ┌────▼────────┐
                    │  EXPORTED   │
                    └────┬────────┘
                         │
                    ┌────▼─────────┐
                    │  ARCHIVED    │
                    └──────────────┘
```
