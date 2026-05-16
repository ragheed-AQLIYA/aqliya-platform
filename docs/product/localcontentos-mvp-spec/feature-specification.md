# LocalContentOS — Feature Specification

**Status:** Specification only — not implemented
**Version:** 1.0
**Format:** 13 MVP features with user stories, acceptance criteria, and edge cases

---

## Feature 1: Create LocalContent Engagement

| Field                   | Detail                                                                                                                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As an Engagement Owner, I want to create a new LocalContentOS engagement with a name and scope, so that I can begin collecting data and running the local content workflow.                                                         |
| **Acceptance Criteria** | 1. Engagement created with name, description, and organization<br>2. Status set to Draft<br>3. Reporting period can be created within the engagement<br>4. Unique URL/identifier assigned<br>5. Created event logged in audit trail |
| **Required Data**       | Organization context, engagement name, scope description                                                                                                                                                                            |
| **Permissions**         | Engagement Owner, Admin                                                                                                                                                                                                             |
| **Audit Event**         | `ENGAGEMENT_CREATED`                                                                                                                                                                                                                |
| **Validation Rules**    | Name required. Organization must exist.                                                                                                                                                                                             |
| **Edge Cases**          | Duplicate name within same organization — warn.                                                                                                                                                                                     |
| **Future Enhancement**  | Template-based engagement creation from previous periods.                                                                                                                                                                           |

---

## Feature 2: Import Vendor Master

| Field                   | Detail                                                                                                                                                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User Story**          | As a Data Owner, I want to upload a vendor master CSV file, so that the system imports and validates all supplier records for classification.                                                                                  |
| **Acceptance Criteria** | 1. CSV upload accepted with validation<br>2. Invalid records flagged with error messages<br>3. Duplicate vendors detected<br>4. Import summary shown (total, valid, errors, duplicates)<br>5. All vendors linked to engagement |
| **Required Data**       | CSV with vendor_id, vendor_name, commercial_registration_number, country, vendor_type, ownership_classification                                                                                                                |
| **Permissions**         | Data Owner, Engagement Owner, Admin                                                                                                                                                                                            |
| **Audit Event**         | `VENDORS_IMPORTED` — {count, errors, duplicates}                                                                                                                                                                               |
| **Validation Rules**    | vendor_id required and unique within engagement. CR format validated if Saudi. Country required.                                                                                                                               |
| **Edge Cases**          | Empty file — reject. Very large file (> 10K records) — async processing. Duplicate vendor_ids across imports — warn and allow merge.                                                                                           |

---

## Feature 3: Import Procurement Spend

| Field                   | Detail                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As a Data Owner, I want to upload procurement spend data, so that transactions are linked to vendors for local content classification.                                     |
| **Acceptance Criteria** | 1. CSV upload with validation<br>2. vendor_ids validated against Vendor Master<br>3. Unmatched vendor_ids flagged<br>4. Amount format validated<br>5. Import summary shown |
| **Required Data**       | CSV with vendor_id, amount_excluding_vat, spend_date, reporting_period, category                                                                                           |
| **Permissions**         | Data Owner, Engagement Owner, Admin                                                                                                                                        |
| **Audit Event**         | `SPEND_IMPORTED` — {count, total_amount, unmatched_vendors}                                                                                                                |
| **Validation Rules**    | vendor_id must exist in Vendor Master. Amount must be positive numeric. Date must be within reporting period.                                                              |
| **Edge Cases**          | Vendor created after spend import — flag for reprocessing. Zero-amount transactions — warn. Future dates — flag.                                                           |

---

## Feature 4: Import Contracts

| Field                   | Detail                                                                                                                                                            |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As a Data Owner, I want to upload contract records, so that local content commitments can be tracked against procurement spend.                                   |
| **Acceptance Criteria** | 1. CSV upload with validation<br>2. vendor_ids validated against Vendor Master<br>3. Contract dates validated (start before end)<br>4. LC clause presence tracked |
| **Required Data**       | CSV with contract_id, vendor_id, contract_start_date, contract_end_date, contract_value, local_content_clause_present                                             |
| **Permissions**         | Data Owner, Engagement Owner, Admin                                                                                                                               |
| **Audit Event**         | `CONTRACTS_IMPORTED` — {count, total_value}                                                                                                                       |
| **Edge Cases**          | Contract with no end date — allow (evergreen). Framework agreements without fixed value — allow zero.                                                             |

---

## Feature 5: Create Evidence Register

| Field                   | Detail                                                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As an Analyst, I want to create evidence records linked to vendors, transactions, or contracts, so that every classification has supporting documentation.           |
| **Acceptance Criteria** | 1. Evidence record created with type, file, and related record<br>2. File uploaded and stored<br>3. Confidence level assigned<br>4. Related record verified to exist |
| **Required Data**       | evidence_type, related_record_type, related_record_id, file_name, confidence_level                                                                                   |
| **Permissions**         | Data Owner, Analyst, Engagement Owner, Admin                                                                                                                         |
| **Audit Event**         | `EVIDENCE_CREATED` — {evidence_type, related_record}                                                                                                                 |
| **Edge Cases**          | Duplicate file upload — warn. Very large file (> 50MB) — limit. Invalid file type — reject.                                                                          |

---

## Feature 6: Link Evidence to Records

| Field                   | Detail                                                                                                                                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As an Analyst, I want to link existing evidence records to vendors, transactions, or contracts, so that the evidence graph is complete.                                                              |
| **Acceptance Criteria** | 1. Evidence linked to one or more related records<br>2. Link verified (both records exist)<br>3. Multiple evidence items can link to one record<br>4. One evidence item can link to multiple records |
| **Required Data**       | evidence_id, related_record_type, related_record_id                                                                                                                                                  |
| **Permissions**         | Analyst, Engagement Owner, Admin                                                                                                                                                                     |
| **Audit Event**         | `EVIDENCE_LINKED`                                                                                                                                                                                    |
| **Edge Cases**          | Circular linking — detect and warn. Link to non-existent record — reject.                                                                                                                            |

---

## Feature 7: Classify Vendors / Spend / Contracts

| Field                   | Detail                                                                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As an Analyst, I want to propose a classification (Local, Non-Local, Mixed, Undetermined) for each vendor, transaction, and contract, so that the local content calculation can proceed.                                                      |
| **Acceptance Criteria** | 1. Analyst proposes classification with reason<br>2. Reviewer can accept, override, or return for evidence<br>3. Classification status tracked (Draft → Proposed → Reviewed → Approved)<br>4. Evidence linked to each classification decision |
| **Required Data**       | record_id, record_type, current_classification, proposed_classification, reason, evidence_id                                                                                                                                                  |
| **Permissions**         | Analyst (propose), Reviewer (review), Approver (finalize)                                                                                                                                                                                     |
| **Audit Event**         | `CLASSIFICATION_PROPOSED`, `CLASSIFICATION_REVIEWED`, `CLASSIFICATION_APPROVED`                                                                                                                                                               |
| **Edge Cases**          | Reclassification of previously approved item — requires override and re-approval. Bulk classification — track per record individually.                                                                                                        |

---

## Feature 8: Review Classification Exceptions

| Field                   | Detail                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As a Reviewer, I want to see all classification exceptions in one view, so that I can systematically review gaps and take action.                                                                           |
| **Acceptance Criteria** | 1. Exceptions grouped by severity (Critical, High, Medium, Low)<br>2. Each exception shows affected records and amounts<br>3. Reviewer can clear, escalate, or return for evidence<br>4. All actions logged |
| **Required Data**       | Exception log generated from classification and evidence gaps                                                                                                                                               |
| **Permissions**         | Reviewer, Engagement Owner, Admin                                                                                                                                                                           |
| **Audit Event**         | `EXCEPTION_REVIEWED`                                                                                                                                                                                        |
| **Edge Cases**          | Exception severity changes after evidence added — auto-update. Bulk resolve — require confirmation.                                                                                                         |

---

## Feature 9: Create Findings

| Field                   | Detail                                                                                                                                                                                                                     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As an Analyst, I want to create structured findings from exceptions, so that management has clear, actionable items to address.                                                                                            |
| **Acceptance Criteria** | 1. Finding created with type, severity, description, evidence gap, recommendation<br>2. Financial impact quantified where applicable<br>3. Owner and due date assigned<br>4. Status tracked (Open → InProgress → Resolved) |
| **Required Data**       | Standard finding fields per data model                                                                                                                                                                                     |
| **Permissions**         | Analyst (draft), Reviewer (review), Engagement Owner (assign)                                                                                                                                                              |
| **Audit Event**         | `FINDING_CREATED`, `FINDING_RESOLVED`                                                                                                                                                                                      |
| **Edge Cases**          | Finding linked to vendor that was later reclassified — flag for review. Duplicate findings from same exception — consolidate.                                                                                              |

---

## Feature 10: Management Review

| Field                   | Detail                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User Story**          | As an Approver, I want to review all findings, classification decisions, and evidence coverage before final approval.                                  |
| **Acceptance Criteria** | 1. Full report package presented<br>2. Approver can add comments<br>3. Approver can approve or return for revision<br>4. All data locked upon approval |
| **Required Data**       | Full findings report, classification summary, evidence report, metrics                                                                                 |
| **Permissions**         | Approver, Engagement Owner                                                                                                                             |
| **Audit Event**         | `MANAGEMENT_REVIEW_COMPLETED` — {disposition}                                                                                                          |
| **Edge Cases**          | Approval with conditions — document conditions. Multiple approvers — any can approve, first approval locks.                                            |

---

## Feature 11: Approve Report

| Field                   | Detail                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As an Approver, I want to approve the final local content report, so that it can be exported as an official engagement deliverable.                                               |
| **Acceptance Criteria** | 1. Approval locks all data<br>2. No further edits allowed after approval<br>3. Approval event logged with timestamp and approver identity<br>4. Report status updated to Approved |
| **Required Data**       | Final report package                                                                                                                                                              |
| **Permissions**         | Approver                                                                                                                                                                          |
| **Audit Event**         | `REPORT_APPROVED`                                                                                                                                                                 |
| **Edge Cases**          | Approval after findings changed — require re-review. Accidental approval — irreversible by design.                                                                                |

---

## Feature 12: Export Pilot Summary

| Field                   | Detail                                                                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As an Engagement Owner, I want to export the pilot summary as PDF and XLSX with evidence index, so that I can share it with stakeholders.                                 |
| **Acceptance Criteria** | 1. PDF export with executive summary, metrics, findings<br>2. XLSX export with detailed data<br>3. Evidence index with all files listed<br>4. Export package downloadable |
| **Required Data**       | Approved report, classification data, evidence register                                                                                                                   |
| **Permissions**         | Approver, Engagement Owner, Admin (Viewer can download approved exports only)                                                                                             |
| **Audit Event**         | `REPORT_EXPORTED` — {format, exported_by}                                                                                                                                 |
| **Edge Cases**          | Export before approval — blocked. Export of very large dataset — async generation with notification.                                                                      |

---

## Feature 13: View Audit Trail

| Field                   | Detail                                                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Story**          | As a Viewer or Reviewer, I want to see the full audit trail of an engagement, so that I can verify who did what and when.                                                                     |
| **Acceptance Criteria** | 1. Audit events displayed in reverse chronological order<br>2. Each event shows: actor, action, timestamp, details<br>3. Filterable by actor, action type, date range<br>4. Exportable as CSV |
| **Required Data**       | AuditEvent model (AQLIYA Core)                                                                                                                                                                |
| **Permissions**         | All roles (data scope varies by role)                                                                                                                                                         |
| **Audit Event**         | `AUDIT_TRAIL_VIEWED`                                                                                                                                                                          |
| **Edge Cases**          | Very long audit trail — pagination. Sensitive events (e.g., override reasons) — role-gated visibility.                                                                                        |
