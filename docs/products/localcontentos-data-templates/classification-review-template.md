# LocalContentOS — Classification Review Template

**Status:** Pilot Template Pack — not software
**Version:** 1.0

---

## Purpose

The Classification Review template records human review decisions on local content classifications. It captures the original classification, the proposed change, the reviewer's decision, and the approval chain. This is how the AQLIYA trust principle "Humans decide" is operationalized in the pilot.

---

## Required Fields

| #   | Field                     | Required    | Description                                                                                |
| --- | ------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| 1   | `record_id`               | Yes         | ID of the record being reviewed (vendor_id, transaction ID, contract_id).                  |
| 2   | `record_type`             | Yes         | Type of record: Vendor, Transaction, Contract, Classification Override.                    |
| 3   | `current_classification`  | Yes         | Current classification before review: Local, Non-Local, Mixed, Undetermined, Unclassified. |
| 4   | `proposed_classification` | Yes         | Analyst's proposed classification after review.                                            |
| 5   | `reason`                  | Yes         | Justification for the proposed classification. Include evidence references.                |
| 6   | `evidence_id`             | Recommended | Link to evidence in the Evidence Register that supports this decision.                     |
| 7   | `reviewer`                | Yes         | Name or ID of the analyst performing the review.                                           |
| 8   | `review_decision`         | Yes         | Outcome: Accepted, Overridden, Returned for Evidence, Escalated.                           |
| 9   | `approval_required`       | Yes         | Yes / No. Whether this change requires higher-level approval.                              |
| 10  | `approver`                | Optional    | Name or ID of the person who approved the override.                                        |
| 11  | `approval_status`         | Recommended | Pending, Approved, Rejected, Not Required.                                                 |
| 12  | `notes`                   | Optional    | Additional context about the review decision.                                              |

---

## Review Decision Options

| Decision                  | Meaning                                            | Next Action                                     |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| **Accepted**              | Proposed classification accepted as final          | Update record classification status to Approved |
| **Overridden**            | Reviewer changes classification with justification | Requires approval if approval_required = Yes    |
| **Returned for Evidence** | Insufficient evidence to make a decision           | Request additional documentation from customer  |
| **Escalated**             | Decision requires management or committee review   | Move to Exceptions and Findings                 |

---

## Example Rows

| record_id     | record_type | current_classification | proposed_classification | reason                                                       | evidence_id                | reviewer | review_decision       | approval_required | approver   | approval_status | notes                                      |
| ------------- | ----------- | ---------------------- | ----------------------- | ------------------------------------------------------------ | -------------------------- | -------- | --------------------- | ----------------- | ---------- | --------------- | ------------------------------------------ |
| VEN-0001      | Vendor      | Local                  | Local                   | Verified CR + LCGPA certificate                              | EVD-2025-001, EVD-2025-002 | A.Alamri | Accepted              | No                | —          | Not Required    | Clear local vendor, official docs          |
| VEN-0005      | Vendor      | Undetermined           | Local                   | Saudi CR verified, operations base confirmed via declaration | EVD-2025-004               | A.Alamri | Returned for Evidence | Yes               | —          | Pending         | Declaration only, need manufacturing proof |
| INV-2025-1003 | Transaction | Mixed                  | Mixed                   | Local distributor for international brand. 50% attribution   | EVD-2025-005               | A.Alamri | Accepted              | No                | —          | Not Required    | Consistent with contract CTR-2023-045      |
| VEN-0003      | Vendor      | Non-Local              | Non-Local               | Bahrain registered, no Saudi CR or operations                | —                          | A.Alamri | Accepted              | No                | —          | Not Required    | Clear non-local classification             |
| VEN-0004      | Vendor      | Mixed                  | Local                   | Customer reclassified based on new manufacturing data        | EVD-2025-005               | A.Alamri | Overridden            | Yes               | K.AlOtaibi | Pending         | Override submitted for approval            |

---

## Validation Rules

| Rule                     | Logic                                                                         | Severity |
| ------------------------ | ----------------------------------------------------------------------------- | -------- |
| Record ID exists         | `record_id` must exist in Vendor Master, Spend, or Contracts                  | Error    |
| Classification valid     | Must be one of the defined classification options                             | Error    |
| Reason required          | Every review must have a justification                                        | Error    |
| Evidence reference valid | If provided, must exist in Evidence Register                                  | Warning  |
| Approval required check  | If `approval_required = Yes`, `approver` and `approval_status` must be filled | Warning  |
| Reviewer name            | Must be a valid person (cannot be blank)                                      | Error    |

---

## Common Errors

| Error                                        | How to Avoid                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------- |
| Reviewing a record that was already approved | Check the Vendor Master or Spend template classification_status first           |
| No reason for override                       | Always include a clear justification with evidence references                   |
| Skipping approval when required              | Customer should define which overrides require approval before the pilot starts |
| Evidence not linked                          | Reference specific evidence_id values to support the review decision            |

---

## Sensitivity Level

- **Moderate** — Contains internal classification decisions and reviewer judgments
  -- These decisions may be commercially sensitive if they affect supplier relationships

---

## Evidence Role

The Classification Review template captures the **human decision layer**:

- Records the reviewer's judgment on each classification
- Creates an audit trail of classification changes
- Ensures overrides are properly justified and approved
- Links every decision to supporting evidence
- Provides input to Exceptions and Findings for escalated items
