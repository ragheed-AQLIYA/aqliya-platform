# LocalContentOS — User Roles and Permissions

**Status:** Specification only — not implemented
**Version:** 1.0

---

## Role Definitions

### System Admin

| Field                       | Detail                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| **Description**             | Configures the system, manages users, sets organization parameters                       |
| **Allowed Actions**         | Create/update organizations, manage user roles, configure system settings, view all data |
| **Forbidden Actions**       | Cannot change classification decisions, cannot approve reports                           |
| **Data Access**             | Full — all organizations and all data                                                    |
| **Approval Responsibility** | None — admin is not an approval role                                                     |
| **Export Permission**       | Full — can export any report                                                             |
| **Audit Log Implications**  | All admin actions logged with `SYSTEM_ADMIN` actor type                                  |

### Engagement / Pilot Owner

| Field                       | Detail                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Description**             | Owns the LocalContentOS engagement — manages scope, timeline, and team                                          |
| **Allowed Actions**         | Create engagement, set reporting period, invite users, assign roles, monitor progress, view all engagement data |
| **Forbidden Actions**       | Cannot classify vendors, cannot approve findings (unless also has Reviewer role)                                |
| **Data Access**             | Full — all data within their engagement                                                                         |
| **Approval Responsibility** | None directly — but can assign reviewers and approvers                                                          |
| **Export Permission**       | Full — engagement-level reports                                                                                 |
| **Audit Log Implications**  | All scope/timeline/team changes logged                                                                          |

### Data Owner

| Field                       | Detail                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **Description**             | Provides and maintains data quality — typically procurement or finance team member            |
| **Allowed Actions**         | Import vendor master, import spend data, import contracts, upload evidence, edit data records |
| **Forbidden Actions**       | Cannot classify vendors, cannot approve findings, cannot export reports                       |
| **Data Access**             | Write access to raw data, read-only to classification results                                 |
| **Approval Responsibility** | None                                                                                          |
| **Export Permission**       | None                                                                                          |
| **Audit Log Implications**  | All data imports and edits logged with `DATA_OWNER` actor type                                |

### Analyst

| Field                       | Detail                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Description**             | Classifies vendors and transactions, reviews evidence, identifies exceptions — core operational role |
| **Allowed Actions**         | View all data, propose classification, review evidence, flag exceptions, draft findings              |
| **Forbidden Actions**       | Cannot finalize classification without review, cannot approve findings, cannot modify raw data       |
| **Data Access**             | Full read on all engagement data, write on classification and findings                               |
| **Approval Responsibility** | None — proposes, does not approve                                                                    |
| **Export Permission**       | Create draft export — cannot publish final                                                           |
| **Audit Log Implications**  | All classification proposals and finding drafts logged                                               |

### Reviewer

| Field                       | Detail                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Description**             | Reviews analyst classifications and findings — ensures quality and evidence adequacy                       |
| **Allowed Actions**         | Accept or return classifications, accept or return findings, request additional evidence, add review notes |
| **Forbidden Actions**       | Cannot modify raw data, cannot approve report for final export                                             |
| **Data Access**             | Full read, write on review decisions and notes                                                             |
| **Approval Responsibility** | Classification quality — signs off on methodology                                                          |
| **Export Permission**       | Can generate review-ready report                                                                           |
| **Audit Log Implications**  | All review decisions logged with `REVIEWER` actor type                                                     |

### Approver

| Field                       | Detail                                                                   |
| --------------------------- | ------------------------------------------------------------------------ |
| **Description**             | Final decision maker — approves the local content report for export      |
| **Allowed Actions**         | View final report, approve or return for revision, add executive notes   |
| **Forbidden Actions**       | Cannot modify detailed classification, cannot change individual findings |
| **Data Access**             | Read-only on all engagement data, write on approval decision             |
| **Approval Responsibility** | Full — final sign-off on report accuracy and completeness                |
| **Export Permission**       | Full — can authorize final export                                        |
| **Audit Log Implications**  | Approval decision logged with `APPROVER` actor type — irreversible       |

### Viewer

| Field                       | Detail                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| **Description**             | Read-only access — executives, auditors, stakeholders                                    |
| **Allowed Actions**         | View reports, view classification summaries, view audit trail, download approved exports |
| **Forbidden Actions**       | Cannot modify any data, cannot propose classifications, cannot approve                   |
| **Data Access**             | Read-only on engagement data (may be restricted to summary level)                        |
| **Approval Responsibility** | None                                                                                     |
| **Export Permission**       | Can download approved exports only                                                       |
| **Audit Log Implications**  | View actions logged at summary level (not per-record)                                    |

---

## RBAC Matrix

| Action                   | Admin | Owner | Data Owner | Analyst | Reviewer | Approver | Viewer |
| ------------------------ | ----- | ----- | ---------- | ------- | -------- | -------- | ------ |
| Manage organization      | ✓     | —     | —          | —       | —        | —        | —      |
| Create engagement        | ✓     | ✓     | —          | —       | —        | —        | —      |
| Set reporting period     | ✓     | ✓     | —          | —       | —        | —        | —      |
| Invite users             | ✓     | ✓     | —          | —       | —        | —        | —      |
| Import vendor master     | ✓     | ✓     | ✓          | —       | —        | —        | —      |
| Import spend data        | ✓     | ✓     | ✓          | —       | —        | —        | —      |
| Import contracts         | ✓     | ✓     | ✓          | —       | —        | —        | —      |
| Upload evidence          | ✓     | ✓     | ✓          | ✓       | —        | —        | —      |
| Link evidence to records | ✓     | ✓     | ✓          | ✓       | —        | —        | —      |
| Propose classification   | ✓     | ✓     | —          | ✓       | —        | —        | —      |
| Review classification    | ✓     | ✓     | —          | —       | ✓        | —        | —      |
| Return classification    | ✓     | ✓     | —          | —       | ✓        | ✓        | —      |
| Draft findings           | ✓     | ✓     | —          | ✓       | —        | —        | —      |
| Review findings          | ✓     | ✓     | —          | —       | ✓        | ✓        | —      |
| Approve report           | ✓     | —     | —          | —       | —        | ✓        | —      |
| Generate draft export    | ✓     | ✓     | —          | ✓       | ✓        | —        | —      |
| Authorize final export   | ✓     | ✓     | —          | —       | —        | ✓        | —      |
| Download approved export | ✓     | ✓     | ✓          | ✓       | ✓        | ✓        | ✓      |
| View audit trail         | ✓     | ✓     | —          | —       | ✓        | ✓        | ✓      |
| Manage users/roles       | ✓     | —     | —          | —       | —        | —        | —      |

---

## Permission Boundaries by Data Sensitivity

| Data Level              | Description                                                  | Roles with Access                         |
| ----------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| **Public**              | Vendor names, categories                                     | All roles                                 |
| **Internal**            | Vendor IDs, contract references                              | All roles                                 |
| **Confidential**        | Spend amounts, contract values                               | Owner, Analyst, Reviewer, Approver, Admin |
| **Highly Confidential** | Classification decisions, override reasons, evidence content | Owner, Reviewer, Approver, Admin          |
