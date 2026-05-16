# LocalContentOS — Pilot Summary Template

**Status:** Pilot Template Pack — not software
**Version:** 1.0

---

## Purpose

The Pilot Summary template captures the final assessment of the LocalContentOS pilot. It consolidates the scope, data received, review results, findings, and recommendation into a single management-ready summary. This is the deliverable that informs the customer's decision on next steps.

---

## Required Fields

| #   | Field                  | Required | Description                                                                                                                 |
| --- | ---------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | `pilot_scope`          | Yes      | Description of the pilot scope: reporting period, business unit, categories covered.                                        |
| 2   | `reporting_period`     | Yes      | The reporting period covered by the pilot.                                                                                  |
| 3   | `dataset_received`     | Yes      | List of data templates and files received from the customer.                                                                |
| 4   | `records_reviewed`     | Yes      | Count of records reviewed: vendors, transactions, contracts.                                                                |
| 5   | `records_classified`   | Yes      | Count of records successfully classified (Local, Non-Local, Mixed).                                                         |
| 6   | `evidence_gaps`        | Yes      | Count of identified evidence gaps and summary description.                                                                  |
| 7   | `major_findings`       | Yes      | Summary of major findings (top 3–5).                                                                                        |
| 8   | `management_decisions` | Yes      | Key decisions required from management.                                                                                     |
| 9   | `unresolved_items`     | Yes      | Items that could not be resolved during the pilot.                                                                          |
| 10  | `pilot_success_score`  | Yes      | Score 1–5 across key dimensions (data quality, classification confidence, evidence coverage, customer engagement, overall). |
| 11  | `recommendation`       | Yes      | Final recommendation: Proceed to MVP, Extend Pilot, Wait and Revisit, Not Proceed.                                          |

---

## Scoring Guide (1–5)

| Score | Data Quality                 | Classification Confidence           | Evidence Coverage        | Customer Engagement        | Overall          |
| ----- | ---------------------------- | ----------------------------------- | ------------------------ | -------------------------- | ---------------- |
| 5     | Complete, clean, consistent  | All records confidently classified  | >90% evidence coverage   | Highly engaged, responsive | Excellent pilot  |
| 4     | Minor gaps, easily resolved  | Most records confidently classified | 70-90% evidence coverage | Engaged, mostly responsive | Strong pilot     |
| 3     | Moderate gaps, workable      | Mixed confidence across records     | 50-70% evidence coverage | Moderately engaged         | Acceptable pilot |
| 2     | Significant gaps, incomplete | Low confidence on many records      | 25-50% evidence coverage | Low engagement             | Weak pilot       |
| 1     | Data largely unusable        | Most records unclassified           | <25% evidence coverage   | Disengaged or unresponsive | Failed pilot     |

---

## Example

| Field                    | Value                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **pilot_scope**          | Q1-2026 procurement spend for Saudi Manufacturing Co. — Industrial Equipment and IT Services categories. 5 vendors, 5 transactions, 4 contracts reviewed. |
| **reporting_period**     | Q1-2026 (January – March 2026)                                                                                                                            |
| **dataset_received**     | Vendor Master (5 vendors), Procurement Spend (5 transactions), Contracts (4 contracts), Evidence Register (6 items)                                       |
| **records_reviewed**     | 5 vendors, 5 transactions, 4 contracts                                                                                                                    |
| **records_classified**   | 4 vendors classified (3 Local, 1 Non-Local), 1 vendor pending (Undetermined)                                                                              |
| **evidence_gaps**        | 3 evidence gaps identified: 1 CR missing, 1 certificate scope narrow, 1 self-declaration without supporting docs                                          |
| **major_findings**       | 1) VEN-0005 (320K SAR) has no CR — Critical evidence gap; 2) VEN-0004 pending reclassification; 3) No formal classification policy documented             |
| **management_decisions** | 1) Approve override for VEN-0004 (Mixed → Local); 2) Set policy for Undetermined vendor handling; 3) Assign owner for CR collection                       |
| **unresolved_items**     | VEN-0005 CR still pending from vendor; policy documentation not yet created                                                                               |
| **pilot_success_score**  | Data Quality: 4, Classification Confidence: 3, Evidence Coverage: 3, Customer Engagement: 4, Overall: 3.5                                                 |
| **recommendation**       | Proceed to MVP Implementation with conditions: customer commits to resolving evidence gaps and formalizing classification policy                          |

---

## CSV Format

The Pilot Summary is a single-record template (not a row-per-item template). The CSV contains one row with all fields as columns.

| pilot_scope                                           | reporting_period | dataset_received                                          | records_reviewed                              | records_classified | evidence_gaps                                            | major_findings                                                | management_decisions                                            | unresolved_items                        | pilot_success_score                                    | recommendation |
| ----------------------------------------------------- | ---------------- | --------------------------------------------------------- | --------------------------------------------- | ------------------ | -------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------ | -------------- |
| Q1-2026 procurement spend for Saudi Manufacturing Co. | Q1-2026          | Vendor Master (5), Spend (5), Contracts (4), Evidence (6) | 14 (5 vendors + 5 transactions + 4 contracts) | 13 of 14           | 3 gaps: CR missing, certificate narrow, self-declaration | 1) VEN-0005 no CR; 2) VEN-0004 reclassification; 3) No policy | 1) Approve VEN-0004 override; 2) Set policy; 3) Assign CR owner | VEN-0005 CR pending; Policy not created | Data:4, Class:3, Evidence:3, Engagement:4, Overall:3.5 | Proceed to MVP |

---

## Validation Rules

| Rule                 | Logic                                  | Severity |
| -------------------- | -------------------------------------- | -------- |
| All fields populated | All required fields should have values | Error    |
| Scores in range      | Each score must be between 1 and 5     | Error    |
| Recommendation valid | Must be one of the four options        | Error    |

---

## Sensitivity Level

- **High** — Contains the overall pilot assessment with business recommendations

---

## Evidence Role

The Pilot Summary is the **final pilot deliverable**:

- Consolidates all pilot work into a single management-ready assessment
- Provides a clear recommendation on next steps
- Documents unresolved items for future follow-up
- Creates the baseline for measuring progress in subsequent pilots or MVP
- Enables the customer to make an informed go/no-go decision
