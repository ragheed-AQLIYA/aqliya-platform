# Pilot Scope — LocalContentOS v0.1 First Customer Pilot

## Objective

Run a controlled pilot engagement with one customer to validate LocalContentOS as a governed local content assessment workspace using customer-provided sample data. The pilot demonstrates the full workflow from supplier registration through evidence review, classification, findings, review, approval, and reporting.

## Included Workflows

All workflows are implemented, browser-verified, and ready for pilot use:

| Workflow               | Description                                                   | Browser Verified |
| ---------------------- | ------------------------------------------------------------- | ---------------- |
| Dashboard review       | Project overview with KPI cards and project list              | ✅               |
| Project assessment     | Project detail with score cards and navigation                | ✅               |
| Supplier register      | Supplier list with locality badges, ownership, workforce data | ✅               |
| Spend register         | Spend records per supplier with categories and totals         | ✅               |
| Evidence vault         | Evidence items with type/status badges                        | ✅               |
| Classification display | Supplier classification by locality and content %             | ✅               |
| Findings register      | Findings with severity badges and types                       | ✅               |
| Review                 | Submit and track review with comments and history             | ✅               |
| Approval               | Approve/reject with decision badge and governance record      | ✅               |
| Reports                | Report generation with text/CSV and binary PDF/XLSX export (disclaimer; not regulator-certified) | ✅               |
| Audit trail            | Full event log with Arabic action labels, actors, timestamps  | ✅               |

## Excluded Workflows

These capabilities are NOT included in the pilot and must not be claimed:

| Capability                    | Reason                                                                             |
| ----------------------------- | ---------------------------------------------------------------------------------- |
| Regulatory certification      | Not implemented — platform produces governed assessments, not certified compliance |
| Official authority submission | No integration with Saudi authorities (LCGPA, etc.)                                |
| Regulator-certified PDF/XLSX  | Binary PDF/XLSX export exists; not an official compliance submission; Arabic PDF font P2 |
| Production deployment         | Pilot runs on AQLIYA cloud workspace, not customer infrastructure                  |
| On-prem/private deployment    | Not implemented                                                                    |
| AI autonomous decisions       | AI is not wired for this product — all workflows are human-governed                |
| Full ERP integration          | No integration with customer ERP systems — data is provided as CSV/XLSX            |
| Supplier self-service portal  | Not implemented                                                                    |
| Real-time data sync           | Pilot uses snapshot/uploaded data, not live connections                            |

## Timeline

| Phase                | Duration              | Description                                    |
| -------------------- | --------------------- | ---------------------------------------------- |
| Pre-demo preparation | 2-3 days              | Review customer context, prepare environment   |
| Customer demo        | 1 session (60-90 min) | Walk through workspace with customer           |
| Data collection      | 1 week                | Customer provides sample data per data request |
| Data loading         | 1-2 days              | AQLIYA loads and validates customer data       |
| Workflow walkthrough | 1 session (2 hours)   | Guided walkthrough with customer data          |
| Findings review      | 1 session (1 hour)    | Review gaps and risks identified               |
| Report review        | 1 session (1 hour)    | Review generated outputs                       |
| Decision meeting     | 1 session (1 hour)    | Determine conversion or next steps             |
| Total duration       | 2-3 weeks             | From kickoff to closeout                       |

## Expected Customer Inputs

- Supplier master list (CSV/XLSX)
- Procurement/spend records (CSV/XLSX)
- Evidence files (PDF sample documents)
- Classification preferences or existing rules
- User roles for pilot access

## Expected Outputs

- Loaded supplier register
- Classified spend records with local content scores
- Evidence index with status
- Findings register
- Review record with comments
- Approval decision with governance record
- Generated reports with disclaimer
- Audit trail of all actions

## Success Criteria

All criteria listed in `pilot-success-criteria.md`. Minimum bar: customer can log in, view their data across all workflow stages, and explain the value of a governed assessment workflow.

## Exit Decision

At pilot closeout, one of:

- **Convert to paid:** Customer proceeds to paid engagement
- **Extend pilot:** Additional scope or data needed before decision
- **Hold:** Customer needs more time or internal alignment
- **No conversion:** Pilot completed but no immediate next step
