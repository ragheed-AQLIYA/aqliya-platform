# Sunbul Feature Specification

**Version:** 0.1
**Status:** Draft — MVP scope

---

## Feature List (MVP)

| # | Feature | Module | Priority | Dependencies |
|---|---|---|---|---|
| F1 | Client create/activate/deactivate | Client Management | P0 | None |
| F2 | Client detail view and edit | Client Management | P0 | F1 |
| F3 | Client configuration (basic) | Client Management | P1 | F1 |
| F4 | User invite to client | User Management | P0 | F1 |
| F5 | User role assignment | User Management | P0 | F4 |
| F6 | User suspend/activate | User Management | P1 | F4 |
| F7 | User profile (self-service) | User Management | P2 | F4 |
| F8 | Create record (draft) | Record Management | P0 | F1, F4 |
| F9 | Edit draft record | Record Management | P0 | F8 |
| F10 | Delete draft record | Record Management | P0 | F8 |
| F11 | View record detail | Record Management | P0 | F8 |
| F12 | List/filter records by status | Record Management | P0 | F8 |
| F13 | Upload documents to record | Document Management | P0 | F8 |
| F14 | View/download documents | Document Management | P0 | F13 |
| F15 | Delete document | Document Management | P1 | F13 |
| F16 | Add evidence note to record | Evidence Management | P1 | F8 |
| F17 | Submit record for review | Workflow | P0 | F8 |
| F18 | Assign record to reviewer | Workflow | P0 | F17, F4 |
| F19 | Review record (view, comment) | Workflow | P0 | F18 |
| F20 | Return record to draft | Workflow | P0 | F19 |
| F21 | Forward record for approval | Workflow | P0 | F19 |
| F22 | Approve record | Workflow | P0 | F21 |
| F23 | Reject record | Workflow | P0 | F21 |
| F24 | Auto-lock after approval | Workflow | P0 | F22 |
| F25 | Export record as PDF | Export | P0 | F24 |
| F26 | View export history | Export | P1 | F25 |
| F27 | View audit trail per record | Audit | P0 | F8 |
| F28 | View audit trail per client | Audit | P1 | F27 |
| F29 | Export audit log (CSV) | Audit | P2 | F28 |
| F30 | Client dashboard (summary) | Dashboard | P0 | F8 |
| F31 | Admin dashboard (all clients) | Dashboard | P1 | F1, F8 |
| F32 | Record archive/restore | Record Management | P1 | F24 |

---

## User Stories

### Client Management

**US-CM-01: Create Client**
> As a Platform Admin, I want to create a new client so that they can start using Sunbul.
> **Acceptance Criteria:**
> - Form with: name, slug, industry, contact email, contact phone
> - Slug auto-generated from name (editable)
> - Client status defaults to "active"
> - Client created with default configuration
> - Confirmation shown
> - Client appears in admin client list

**US-CM-02: Activate/Deactivate Client**
> As a Platform Admin, I want to suspend a client so that all their users lose access immediately.
> **Acceptance Criteria:**
> - Suspended client shows "suspended" badge
> - Suspended client users cannot log in or access data
> - Suspended client data is preserved (not deleted)
> - Reactivation restores access
> - Audit event logged on suspend/reactivate

**US-CM-03: Edit Client Configuration**
> As a Client Owner, I want to update my client's settings so that the platform reflects our preferences.
> **Acceptance Criteria:**
> - Can edit: name, contact info, language preference, timezone
> - Changes take effect immediately
> - Audit event logged for configuration changes

### User Management

**US-UM-01: Invite User to Client**
> As a Client Owner/Manager, I want to invite a user to my client workspace by entering their email and selecting a role.
> **Acceptance Criteria:**
> - Enter email + select role + optional name
> - If user exists in system, they gain access immediately
> - If user does not exist, invitation record created
> - User receives notification (in-app, email in future)
> - New user appears in user list with "invited" status
> - Cannot invite user with same email twice to same client

**US-UM-02: Change User Role**
> As a Client Owner/Manager, I want to change a user's role so that their permissions are updated.
> **Acceptance Criteria:**
> - Can promote/demote any user except Client Owner
> - Cannot demote self from Client Owner
> - Changes take effect immediately
> - Audit event logged

**US-UM-03: Suspend/Activate User**
> As a Client Owner/Manager, I want to suspend a user so that they cannot access the client workspace.
> **Acceptance Criteria:**
> - Suspended user cannot log in or perform any action
> - Suspended user's data is preserved
> - Reactivation restores access
> - Cannot suspend self
> - Audit event logged

### Record Management

**US-RM-01: Create Record**
> As an Operator, I want to create a new record so that I can begin a case.
> **Acceptance Criteria:**
> - Form fields: title (required), description, type (dropdown), priority (default: medium), due date (optional)
> - Record created in DRAFT status
> - Creator is set as record owner
> - Record appears in my records list
> - Confirmation shown

**US-RM-02: Edit Draft Record**
> As an Operator, I want to edit my draft record so that I can update information before submitting.
> **Acceptance Criteria:**
> - Only editable in DRAFT or RETURNED status
> - Only editable by record creator, Client Owner, or Client Manager
> - Changes saved immediately (autosave or explicit save)
> - Updated timestamp shown

**US-RM-03: Delete Draft Record**
> As an Operator, I want to delete a draft record so that I can remove incorrect entries.
> **Acceptance Criteria:**
> - Only deletable in DRAFT status
> - Soft delete (archive with deletedAt)
> - Associated documents and evidence are also soft-deleted
> - Confirmation dialog required
> - Cannot delete records in any other status

**US-RM-04: List and Filter Records**
> As an Operator/Reviewer, I want to view a list of records filtered by status so that I can focus on my current work.
> **Acceptance Criteria:**
> - Default view: all records for client
> - Filters: status, priority, date range, assigned to me, created by me
> - Sortable by: created date, updated date, priority, status
> - Paginated (20 per page default)
> - Search by title (basic text search)

### Document Management

**US-DM-01: Upload Document**
> As an Operator, I want to upload a document to a record so that supporting evidence is available.
> **Acceptance Criteria:**
> - Supported types: PDF, XLSX, DOCX, JPEG, PNG
> - Max file size: 20MB (configurable)
> - Multiple files can be uploaded at once
> - File is virus-scanned (future: integrate file scanner)
> - File appears in document list immediately
> - File stored in client-isolated storage path

**US-DM-02: View and Download Document**
> As any client user with access, I want to view/download documents so that I can review record evidence.
> **Acceptance Criteria:**
> - File name, size, type, upload date, uploader shown
> - Click to download
> - Download logged in audit trail
> - Blocked if user does not have access to the record

### Workflow

**US-WF-01: Submit Record for Review**
> As an Operator, I want to submit my draft record for review so that a reviewer can examine it.
> **Acceptance Criteria:**
> - Record must have required fields (title, type)
> - Status changes from DRAFT to SUBMITTED
> - Record becomes read-only for Operator
> - Reviewer(s) can see record in their review queue
> - Cannot submit if already submitted or in a terminal state

**US-WF-02: Return Record to Draft**
> As a Reviewer, I want to return a record to draft so that the Operator can revise it.
> **Acceptance Criteria:**
> - Comment/reason required
> - Required action flag can be set (revision, more evidence, clarification)
> - Status changes from UNDER REVIEW to RETURNED
> - Operator notified (in-app)
> - Audit event logged with reason

**US-WF-03: Approve Record**
> As a Reviewer/Approver, I want to approve a record so that it proceeds to final state.
> **Acceptance Criteria:**
> - Optional comment
> - Status changes from UNDER REVIEW to APPROVED
> - Record is locked (cannot be edited)
> - Approval recorded with approver name and timestamp
> - Audit event logged

**US-WF-04: Export Approved Record**
> As an Operator/Client Owner, I want to export an approved record as a PDF so that I can share the final deliverable.
> **Acceptance Criteria:**
> - Export generates PDF with: record details, documents list, evidence, review comments, approval info, audit trail summary
> - PDF is timestamped
> - Export version number incremented
> - Export logged and tracked
> - Download link provided

### Audit

**US-AU-01: View Record Audit Trail**
> As a Reviewer/Client Owner, I want to view the audit trail of a record so that I can see every action taken on it.
> **Acceptance Criteria:**
> - Timeline view of all actions (newest first)
> - Each entry shows: timestamp, actor name, action, before/after state
> - Filterable by action type
> - Paginated if many entries

**US-AU-02: Export Audit Log**
> As a Client Owner/Manager, I want to export the client's audit log so that I can provide it for compliance purposes.
> **Acceptance Criteria:**
> - Export as CSV
> - Date range filter
> - Includes all actions within the client scope
> - Timestamped file

---

## Acceptance Criteria Cross-Reference

| # | Feature | Test Scenarios | Security | Permissions | Audit |
|---|---|---|---|---|---|
| F1 | Create client | 3+ scenarios (valid, invalid, duplicate slug) | Admin-only | Platform Admin | Yes |
| F8 | Create record | 5+ scenarios (valid, missing fields, permissions) | Client-scoped | Operator+ | Yes |
| F17 | Submit record | 4+ scenarios (valid, incomplete, already submitted) | Client-scoped | Operator+ | Yes |
| F22 | Approve record | 4+ scenarios (valid, already approved, wrong role) | Client-scoped | Approver+ | Yes |
| F27 | View audit trail | 3+ scenarios (valid record, no access, cross-client) | Client-scoped | Reviewer+ | No (viewing not logged) |

## Edge Cases

| Edge Case | Handling |
|---|---|
| User belongs to multiple clients | Session must clearly indicate which client is active; switching clients requires re-confirmation |
| Two operators edit same draft simultaneously | Last save wins (MVP); concurrent edit lock (future) |
| Reviewer is also the Operator of the same record | Allowed if permissions allow; actions logged with both roles |
| Client suspended while users are active | Active sessions terminated on next request; suspended client data inaccessible |
| File upload fails mid-way | Partial upload cleaned up; error message shown |
| Export fails due to missing data | Error logged; export not created; record remains in current state |
| Record archived with active associations | All associated docs/evidence archived with it |
| User removed from client | User loses access immediately; their created records remain assigned to them in audit trail |
| Platform Admin accidentally creates a record | Platform Admin is not allowed to create records (not in any client) |
