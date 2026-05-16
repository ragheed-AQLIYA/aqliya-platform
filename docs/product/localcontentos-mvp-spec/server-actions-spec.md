# LocalContentOS — Server Actions Spec

**Status:** Specification only — not implemented
**Version:** 1.0
**Note:** Server actions must NOT be implemented until explicit implementation approval. This document defines the proposed action signatures.

---

## Action: createLocalContentEngagement

| Field                | Detail                                                             |
| -------------------- | ------------------------------------------------------------------ |
| **Input**            | `{ organizationId, name, scopeDescription?, pilotType }`           |
| **Output**           | `{ engagementId, status: "Draft" }`                                |
| **Permission Check** | User must have Engagement Owner or Admin role for the organization |
| **Validation**       | Name required. Organization must exist.                            |
| **Audit Event**      | `ENGAGEMENT_CREATED` — { engagementId, name, createdBy }           |
| **Failure Modes**    | Organization not found. Duplicate name. User not authorized.       |

---

## Action: updateReportingPeriod

| Field                | Detail                                                          |
| -------------------- | --------------------------------------------------------------- |
| **Input**            | `{ engagementId, periodId?, name, startDate, endDate, status }` |
| **Output**           | `{ periodId }`                                                  |
| **Permission Check** | Engagement Owner or Admin                                       |
| **Validation**       | startDate before endDate. Period within engagement timeframe.   |
| **Audit Event**      | `PERIOD_UPDATED` — { periodId, status }                         |
| **Failure Modes**    | Overlapping periods. Invalid date range.                        |

---

## Action: importVendorMaster

| Field                | Detail                                                                 |
| -------------------- | ---------------------------------------------------------------------- |
| **Input**            | `{ engagementId, fileBuffer, format: "csv" }`                          |
| **Output**           | `{ imported, errors, duplicates, total }`                              |
| **Permission Check** | Data Owner, Engagement Owner, or Admin                                 |
| **Validation**       | File format. Required fields present. vendor_id uniqueness. CR format. |
| **Audit Event**      | `VENDORS_IMPORTED` — { count, errors, duplicates }                     |
| **Failure Modes**    | Empty file. Column mismatch. All rows invalid (reject import).         |

---

## Action: importProcurementSpend

| Field                | Detail                                                                  |
| -------------------- | ----------------------------------------------------------------------- |
| **Input**            | `{ engagementId, reportingPeriodId, fileBuffer }`                       |
| **Output**           | `{ imported, errors, unmatchedVendors, total }`                         |
| **Permission Check** | Data Owner, Engagement Owner, or Admin                                  |
| **Validation**       | vendor_id must exist in Vendor Master. Amount positive. Date in period. |
| **Audit Event**      | `SPEND_IMPORTED` — { count, totalAmount, unmatchedVendors }             |
| **Failure Modes**    | Unmatched vendor_ids (allow with flag). Amount format errors.           |

---

## Action: importContracts

| Field                | Detail                                                              |
| -------------------- | ------------------------------------------------------------------- |
| **Input**            | `{ engagementId, fileBuffer }`                                      |
| **Output**           | `{ imported, errors, total }`                                       |
| **Permission Check** | Data Owner, Engagement Owner, or Admin                              |
| **Validation**       | vendor_id must exist. contract_start_date before contract_end_date. |
| **Audit Event**      | `CONTRACTS_IMPORTED` — { count, totalValue }                        |
| **Failure Modes**    | Unmatched vendors. Date inversion. Duplicate contract_ids.          |

---

## Action: uploadEvidenceRecord

| Field                | Detail                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Input**            | `{ engagementId, evidenceType, relatedRecordType, relatedRecordId, file, confidenceLevel }` |
| **Output**           | `{ evidenceId }`                                                                            |
| **Permission Check** | Data Owner, Analyst, Engagement Owner, or Admin                                             |
| **Validation**       | Related record must exist. File type allowed (PDF, XLSX, JPG, PNG). Max file size.          |
| **Audit Event**      | `EVIDENCE_UPLOADED` — { evidenceId, type, relatedRecord }                                   |
| **Failure Modes**    | Related record not found. File too large. Invalid file type.                                |

---

## Action: linkEvidenceToRecord

| Field                | Detail                                                   |
| -------------------- | -------------------------------------------------------- |
| **Input**            | `{ evidenceId, relatedRecordType, relatedRecordId }`     |
| **Output**           | `{ success }`                                            |
| **Permission Check** | Analyst, Engagement Owner, or Admin                      |
| **Validation**       | Both evidence and record must exist.                     |
| **Audit Event**      | `EVIDENCE_LINKED` — { evidenceId, recordType, recordId } |
| **Failure Modes**    | Evidence or record not found. Circular link detected.    |

---

## Action: createClassificationReview

| Field                | Detail                                                                                |
| -------------------- | ------------------------------------------------------------------------------------- |
| **Input**            | `{ engagementId, recordType, recordId, proposedClassification, reason, evidenceId? }` |
| **Output**           | `{ reviewId, status: "Proposed" }`                                                    |
| **Permission Check** | Analyst, Engagement Owner, or Admin                                                   |
| **Validation**       | Record must exist. Proposed classification must be valid. Reason required.            |
| **Audit Event**      | `CLASSIFICATION_PROPOSED` — { reviewId, recordType, recordId, proposed }              |
| **Failure Modes**    | Record already approved (must use override). Reason too short.                        |

---

## Action: approveClassification

| Field                | Detail                                                                   |
| -------------------- | ------------------------------------------------------------------------ | ------------- | ------------------------------------------------------ |
| **Input**            | `{ reviewId, decision: "Accepted"                                        | "Overridden"  | "ReturnedForEvidence", overrideReason?, evidenceId? }` |
| **Output**           | `{ reviewId, status: "Approved"                                          | "Returned" }` |
| **Permission Check** | Reviewer or Approver                                                     |
| **Validation**       | If Overridden, override reason required. If Returned, guidance required. |
| **Audit Event**      | `CLASSIFICATION_APPROVED` or `CLASSIFICATION_RETURNED`                   |
| **Failure Modes**    | Review already complete. Cannot override without reason.                 |

---

## Action: createLocalContentFinding

| Field                | Detail                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Input**            | `{ engagementId, findingType, severity, description, evidenceGap, recommendation, affectedAmount?, affectedVendorOrContract?, ownerId?, dueDate? }` |
| **Output**           | `{ findingId }`                                                                                                                                     |
| **Permission Check** | Analyst, Engagement Owner, or Admin                                                                                                                 |
| **Validation**       | Severity required. Description required. Recommendation required.                                                                                   |
| **Audit Event**      | `FINDING_CREATED` — { findingId, severity }                                                                                                         |
| **Failure Modes**    | Duplicate finding from same exception.                                                                                                              |

---

## Action: submitForManagementReview

| Field                | Detail                                                                         |
| -------------------- | ------------------------------------------------------------------------------ |
| **Input**            | `{ engagementId }`                                                             |
| **Output**           | `{ reviewPackageId }`                                                          |
| **Permission Check** | Reviewer or Engagement Owner                                                   |
| **Validation**       | All findings must have severity and recommendation. Report must not be locked. |
| **Audit Event**      | `MANAGEMENT_REVIEW_SUBMITTED` — { engagementId, submittedBy }                  |
| **Failure Modes**    | Critical findings without management response. Engagement already approved.    |

---

## Action: approveLocalContentReport

| Field                | Detail                                                        |
| -------------------- | ------------------------------------------------------------- | ----------------------------------- |
| **Input**            | `{ engagementId, disposition: "Approved"                      | "ReturnedForRevision", comments? }` |
| **Output**           | `{ reportStatus: "Approved"                                   | "ReturnedForRevision" }`            |
| **Permission Check** | Approver                                                      |
| **Validation**       | Report must be in ManagementReview state.                     |
| **Audit Event**      | `REPORT_APPROVED` — { approverId, date } or `REPORT_RETURNED` |
| **Failure Modes**    | Report not in reviewable state. Approver not authorized.      |

---

## Action: exportLocalContentSummary

| Field                | Detail                                                              |
| -------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| **Input**            | `{ engagementId, format: "pdf"                                      | "xlsx", includeEvidenceIndex: boolean }` |
| **Output**           | `{ downloadUrl, format }`                                           |
| **Permission Check** | Approver or Engagement Owner (Viewer can download approved exports) |
| **Validation**       | Report must be in Approved state.                                   |
| **Audit Event**      | `REPORT_EXPORTED` — { format, exportedBy }                          |
| **Failure Modes**    | Report not approved. Very large export — async processing.          |

---

## Action: listAuditEvents

| Field                | Detail                                                                       |
| -------------------- | ---------------------------------------------------------------------------- |
| **Input**            | `{ engagementId, actorId?, actionType?, dateFrom?, dateTo?, limit, offset }` |
| **Output**           | `{ events: AuditEvent[], total }`                                            |
| **Permission Check** | All assigned roles (filtered by role sensitivity)                            |
| **Validation**       | Engagement must exist. Actor must be assigned to engagement.                 |
| **Audit Event**      | `AUDIT_TRAIL_VIEWED` (logged at session level, not per-page)                 |
| **Failure Modes**    | Pagination overflow. Invalid date filters.                                   |
