# Workflow Friction Log — Real TB Intake

| Friction ID | Workflow Stage | Friction Type | Description | Severity (1-5) | Root Cause | Workaround Used? | Reviewer Comment |
|------------|---------------|--------------|-------------|----------------|------------|-----------------|------------------|
| F-001 | Data import | Delay | TB export in XLSX format required re-encoding for system ingestion | 3 | System expects CSV; no direct import path | Manual conversion in Excel | "Should accept native formats" |
| F-002 | Data import | Repeated action | Same client had to re-upload 3 times due to column mapping errors | 4 | Header naming convention mismatch | Pre-mapped template created mid-session | "Wasted 20 minutes on mapping" |
| F-003 | Account mapping | Confusion | "Revenue - Trade" vs "Revenue - Other" mapping unclear | 3 | Chart of accounts not standardised | Reviewer created ad-hoc mapping rule | "Needs a mapping memory from prior periods" |
| F-004 | Account mapping | Cognitive overload | 200+ GL accounts to map in one session with no grouping support | 5 | System presented flat list, no hierarchy | Grouped manually in separate spreadsheet | "Flat list is unusable at this volume" |
| F-005 | Evidence upload | Navigation | Could not find where to attach bank statement within workflow | 2 | Evidence upload hidden behind expandable section | Drag-drop to file area by trial and error | "Should be obvious where docs go" |
| F-006 | Evidence upload | Repeated action | Each document required separate upload, no batch | 3 | Single-file upload constraint | Zipped and uploaded as archive | "Need bulk upload" |
| F-007 | Reconciliation | Cognitive overload | Side-by-side comparison of GL vs bank required constant tab switching | 4 | No split-pane or diff view | Printed bank statements and compared manually | "Diff view would save hours" |
| F-008 | Reconciliation | Delay | System lag when loading large transaction sets (>5000 rows) | 3 | No pagination or virtual scrolling | Filtered to smaller date ranges | "Unusable with full-year data" |
| F-009 | Review entry | Confusion | "Save as Draft" vs "Submit for Review" buttons too similar | 2 | Button styling identical | Hover-to-confirm before clicking | "Almost submitted draft as final" |
| F-010 | Review entry | Navigation | Could not find previously started review after break | 4 | No session resume or recent-items list | Re-navigated from dashboard, took 5+ mins | "Needs a 'continue where I left off'" |
| F-011 | Governance check | Repeated action | Provenance panel auto-collapsed after each entry | 3 | Panel state not persisted | Re-opened manually each time | "Drives me crazy" |
| F-012 | Evidence review | Cognitive overload | 150 revenue line items with no grouping or filtering | 5 | No aggregation or materiality sorting | Focused on items > threshold manually | "Need materiality filter built in" |
| F-013 | Mapping adjustment | Confusion | Remapping an account did not cascade to already-entered evidence | 4 | Mapping applied per-entry, not global | Removed and re-added entries | "Map once, apply everywhere" |
| F-014 | Final review | Delay | System took >30s to generate summary report | 3 | Report generation not optimised | Refreshed page — lost unsaved work | "Frustrating" |
| F-015 | Escalation | Navigation | Could not find escalation button when needed | 2 | Escalation in sub-menu, not obvious | Verbally escalated instead | "Should be one click when you need it" |
