# AuditOS — Pilot Success Criteria

## 1. Functional Criteria

| #   | Criterion                                                       | Measure                                  | Target                        |
| --- | --------------------------------------------------------------- | ---------------------------------------- | ----------------------------- |
| F1  | User can complete end-to-end audit workflow                     | Walkthrough from dashboard to export     | < 30 minutes                  |
| F2  | Trial balance upload processes correctly                        | All accounts appear, variance displayed  | 22 accounts, variance visible |
| F3  | Account mapping confirmation updates status                     | Status changes from pending to confirmed | < 5 seconds                   |
| F4  | Evidence-to-finding link creates traceable path                 | Evidence link visible in traceability    | Link persists after refresh   |
| F5  | Approval readiness gate correctly blocks incomplete engagements | Blockers match actual state              | 100% accuracy                 |
| F6  | Approval transitions engagement to approved status              | Status change + audit event              | < 5 seconds                   |
| F7  | Export produces complete JSON package                           | All components present                   | 3 statements, 10 notes        |

## 2. Audit Methodology Criteria

| #   | Criterion                                                        | Measure                              | Target                |
| --- | ---------------------------------------------------------------- | ------------------------------------ | --------------------- |
| A1  | Every material action creates an AuditEvent                      | Count matches actions performed      | 100%                  |
| A2  | TraceabilityDrawer shows real DB links                           | Nodes reflect actual linked entities | All links match       |
| A3  | AI drafts are clearly marked as "Not final"                      | Badge visible on AI outputs          | 100% of AI outputs    |
| A4  | Human acceptance required before AI output affects real entities | No auto-creation without accept      | 100% of AI workflows  |
| A5  | Review comments target real entity IDs                           | Target selector uses DB entities     | No free-text IDs      |
| A6  | Approval blocked when readiness checks fail                      | Approve button disabled              | 100% of blocked cases |
| A7  | Rejection remains available when approval is blocked             | Reject button active                 | Always                |

## 3. Usability Criteria

| #   | Criterion                                        | Measure                         | Target                 |
| --- | ------------------------------------------------ | ------------------------------- | ---------------------- |
| U1  | Dashboard loads within acceptable time           | Page load                       | < 3 seconds            |
| U2  | Navigation between tabs works without errors     | Tab clicks                      | 100% success           |
| U3  | Filter controls work correctly                   | Filtered results match criteria | 100%                   |
| U4  | Error messages are user-friendly                 | Non-technical language          | All errors             |
| U5  | Loading states are shown during async operations | Spinner/skeleton visible        | All operations > 500ms |

## 4. Security Criteria

| #   | Criterion                                    | Measure                          | Target                   |
| --- | -------------------------------------------- | -------------------------------- | ------------------------ |
| S1  | Unauthorized role receives Access Denied     | Server action throws error       | 100%                     |
| S2  | File type validation rejects invalid types   | Error message shown              | Rejected before DB write |
| S3  | File size validation rejects oversized files | Error message shown              | Rejected before DB write |
| S4  | Demo fallback cannot execute in production   | Throws "Authentication required" | Verified via NODE_ENV    |

## 5. Reporting Criteria

| #   | Criterion                                              | Measure                         | Target         |
| --- | ------------------------------------------------------ | ------------------------------- | -------------- |
| R1  | Export JSON includes all expected fields               | Schema validation               | 100%           |
| R2  | Draft label present when engagement not approved       | `labels.isDraft = true`         | Correct value  |
| R3  | Approval metadata present when engagement approved     | `labels.approvalInfo` populated | Correct value  |
| R4  | Bilingual export has Arabic prefix on statement titles | Title starts with "بيان"        | Correct prefix |

## 6. Stakeholder Acceptance Criteria

| #   | Criterion                                                          | Measure                              | Target            |
| --- | ------------------------------------------------------------------ | ------------------------------------ | ----------------- |
| K1  | Stakeholder acknowledges current limitations                       | Signed risk disclosure               | Yes               |
| K2  | Stakeholder agrees pilot scope                                     | Reviewed and accepted scope document | Yes               |
| K3  | Stakeholder can articulate difference between pilot and production | Post-demo discussion                 | Yes               |
| K4  | Stakeholder provides actionable feedback                           | Documented feedback items            | ≥ 3 items         |
| K5  | Stakeholder indicates interest in production deployment            | Verbal or written confirmation       | Yes / Conditional |

## Success Determination

| Rating      | Criteria Met                                                                              |
| ----------- | ----------------------------------------------------------------------------------------- |
| **Exceeds** | All functional, methodology, usability, security, reporting, and stakeholder criteria met |
| **Meets**   | All functional and methodology criteria met; minor usability or reporting gaps            |
| **Below**   | Functional or methodology criteria not met; stakeholder does not accept limitations       |
| **Fails**   | Critical workflow broken; security criteria not met; build fails                          |

## Scorecard

| Category    | # Criteria | # Passed | Score   |
| ----------- | ---------- | -------- | ------- |
| Functional  | 7          |          | /7      |
| Methodology | 7          |          | /7      |
| Usability   | 5          |          | /5      |
| Security    | 4          |          | /4      |
| Reporting   | 4          |          | /4      |
| Stakeholder | 5          |          | /5      |
| **Total**   | **32**     |          | **/32** |

**Result:** ☐ Exceeds (≥30) ☐ Meets (≥24) ☐ Below (≥16) ☐ Fails (<16)
