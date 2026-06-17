# LocalContentOS — Exceptions and Findings Template

**Status:** Pilot Template Pack — not software
**Version:** 1.0

---

## Purpose

The Exceptions and Findings template captures issues identified during the local content review process. It is the primary output for management review — showing what gaps exist, what is at risk, and what needs to be addressed. This template bridges the analyst's technical review and the customer's management decision-making.

---

## Required Fields

| #   | Field                         | Required    | Description                                                                                 |
| --- | ----------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| 1   | `finding_id`                  | Yes         | Unique identifier for the finding. Format: FND-YYYY-NNNN.                                   |
| 2   | `finding_type`                | Yes         | Type: Data Gap, Evidence Gap, Classification Gap, Policy Gap, Process Gap, Compliance Risk. |
| 3   | `severity`                    | Yes         | Critical, High, Medium, Low, Info.                                                          |
| 4   | `affected_vendor_or_contract` | Recommended | Vendor ID, contract ID, or transaction ID affected by this finding.                         |
| 5   | `affected_amount`             | Recommended | Spend amount affected (SAR), if applicable.                                                 |
| 6   | `description`                 | Yes         | Detailed description of the finding. Include what was expected vs. what was found.          |
| 7   | `evidence_gap`                | Yes         | Description of missing or insufficient evidence. What is needed to resolve.                 |
| 8   | `recommendation`              | Yes         | Recommended action to resolve the finding.                                                  |
| 9   | `owner`                       | Recommended | Person or department responsible for resolving the finding.                                 |
| 10  | `due_date`                    | Recommended | Target date for resolution. Format: YYYY-MM-DD.                                             |
| 11  | `status`                      | Yes         | Current status: Open, In Progress, Resolved, Accepted (no action), Escalated.               |
| 12  | `management_response`         | Optional    | Management's response or decision on this finding.                                          |
| 13  | `closure_evidence`            | Optional    | Reference to evidence that the finding has been resolved.                                   |

---

## Severity Definitions

| Severity     | Meaning                                                   | Example                                           |
| ------------ | --------------------------------------------------------- | ------------------------------------------------- |
| **Critical** | Material impact on local content metrics, regulatory risk | Major supplier classified without evidence        |
| **High**     | Significant impact, requires management attention         | Large contract without LC commitment clause       |
| **Medium**   | Moderate impact, should be addressed                      | Evidence expired for multiple vendors             |
| **Low**      | Minor issue, process improvement                          | Inconsistent vendor naming across templates       |
| **Info**     | Observation, no action required                           | Classification methodology change between periods |

---

## Finding Types

| Type                   | Description                                | Example                                             |
| ---------------------- | ------------------------------------------ | --------------------------------------------------- |
| **Data Gap**           | Required data not provided                 | Vendor CR numbers missing for 15 suppliers          |
| **Evidence Gap**       | Classification without supporting evidence | 40% of local vendors have no CR on file             |
| **Classification Gap** | Classification inconsistent or unclear     | 3 vendors classified as "Undetermined"              |
| **Policy Gap**         | No documented classification policy        | Customer has no written local content criteria      |
| **Process Gap**        | Workflow issue in data collection          | Spend data covers different period than vendor data |
| **Compliance Risk**    | Potential regulatory exposure              | Local content certificate expired for 6 months      |

---

## Example Rows

| finding_id   | finding_type       | severity | affected_vendor_or_contract | affected_amount | description                                                                                                                            | evidence_gap                                                                                      | recommendation                                                                                            | owner                 | due_date   | status      | management_response                      | closure_evidence |
| ------------ | ------------------ | -------- | --------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------- | ---------- | ----------- | ---------------------------------------- | ---------------- |
| FND-2025-001 | Evidence Gap       | Critical | VEN-0005                    | 320,000.00      | Vendor VEN-0005 classified as Local with 320K SAR spend, but only self-declaration provided. No CR or certificate.                     | CR not provided. Vendor contacted but unresponsive.                                               | Request CR from vendor. If not provided within 30 days, reclassify as Undetermined.                       | Procurement           | 2025-04-15 | Open        | —                                        | —                |
| FND-2025-002 | Classification Gap | High     | VEN-0004                    | 780,000.00      | Vendor VEN-0004 classified as Mixed but has Saudi CR and LCGPA certificate (narrow scope). Customer pending reclassification to Local. | Certificate scope may not cover all categories. Need broader certificate or policy clarification. | Either obtain broader certificate or formally accept Limited Local classification with documented policy. | Local Content Officer | 2025-03-31 | In Progress | Reviewing certificate scope with vendor  | —                |
| FND-2025-003 | Data Gap           | Medium   | Multiple                    | —               | 12 vendors in the Vendor Master have missing CR numbers. These represent potential Local classification risk.                          | CR documents missing from evidence register.                                                      | Request CRs for all 12 vendors. Update classification_status to Pending Evidence until received.          | Procurement           | 2025-04-30 | Open        | —                                        | —                |
| FND-2025-004 | Policy Gap         | Low      | —                           | —               | No documented local content classification policy. Current classification appears ad-hoc without formal criteria.                      | No policy document available.                                                                     | Document the classification criteria used. Formalize as company local content policy.                     | Local Content Officer | 2025-05-31 | Open        | —                                        | —                |
| FND-2025-005 | Compliance Risk    | High     | CTR-2024-001                | 15,000,000.00   | Contract CTR-2024-001 requires minimum 70% local content. Current period actual is 65%. Below commitment.                              | Spend data for current period shows 65% local. Need evidence of efforts to close the gap.         | Review contract compliance. Document gap reason. Submit mitigation plan.                                  | Contract Owner        | 2025-04-15 | In Progress | Gap acknowledged, mitigation in progress | —                |

---

## Validation Rules

| Rule                                   | Logic                                                     | Severity |
| -------------------------------------- | --------------------------------------------------------- | -------- |
| Unique finding_id                      | No duplicate finding IDs                                  | Error    |
| Severity valid                         | Must be: Critical, High, Medium, Low, Info                | Error    |
| Finding type valid                     | Must be one of the defined types                          | Error    |
| Status valid                           | Must be: Open, In Progress, Resolved, Accepted, Escalated | Error    |
| Recommendation required                | Every finding must have a recommended action              | Error    |
| Due date required for Open/In Progress | If status is Open or In Progress, due date should be set  | Warning  |

---

## Common Errors

| Error                    | How to Avoid                                                                      |
| ------------------------ | --------------------------------------------------------------------------------- |
| Vague recommendations    | Be specific: "Request CR from vendor" not "Follow up on documentation"            |
| Missing affected amounts | Quantify the financial impact of each finding where possible                      |
| No owner assigned        | Every open finding should have a responsible person or team                       |
| Duplicate findings       | Review existing findings before adding new ones — consolidate if same issue       |
| Severity inflation       | Reserve Critical and High for items with material impact on local content metrics |

---

## Sensitivity Level

- **High** — Contains findings that may affect supplier relationships, contract compliance, and regulatory exposure

---

## Evidence Role

The Exceptions and Findings template captures the **outcome of the review process**:

- Aggregates all issues identified during classification and evidence review
- Quantifies the financial impact of gaps
- Provides management with a clear action plan
- Tracks resolution progress
- Feeds into the management summary and pilot report
- Creates an audit trail of identified risks and recommended actions
