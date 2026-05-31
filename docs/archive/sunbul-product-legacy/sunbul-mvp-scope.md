# Sunbul MVP Scope

**Version:** 0.1
**Status:** Draft — must be validated before Phase 1 implementation

---

## MVP Objective

Deliver a single repeatable governed workflow (a case/request lifecycle) running in a multi-client isolated workspace, with audit trail, role-based access, document management, and export capabilities.

The MVP must prove that the platform can serve multiple clients simultaneously with strict data isolation, and that the core workflow is usable by all defined roles.

## In-Scope Modules

### 1. Client / Tenant Management
- Create, activate, deactivate clients
- Per-client configuration (name, industry, contact info, branding)
- Client status tracking (active, suspended, archived)
- **Admin only** — not visible to client-level users

### 2. Workspace (Per-Client)
- Each client sees only their own workspace
- Workspace shows client-specific dashboard (active records, recent activity, status summary)
- Workspace branding (optional: client logo, name in header)

### 3. User Management
- Invite users to specific clients
- Assign roles within a client (Operator, Reviewer, Approver, Viewer)
- User can belong to multiple clients with different roles
- User status (active, suspended, invited)
- Self-service profile (name, email, language preference)

### 4. Role-Based Access Control (RBAC)
- Permissions enforced at every action
- Role matrix as defined in `sunbul-user-roles-permissions.md`
- Tenant guard ensures no cross-client data access

### 5. Core Record / Case / Request Lifecycle
- Create a new record (title, description, type, priority, due date)
- Upload supporting documents
- Attach evidence notes
- Submit for review
- Reviewer comments (with required action flags)
- Approver approval/rejection
- Record locking after approval
- Status tracking and filtering

### 6. Document / File Management
- Upload files (PDF, XLSX, DOCX, images)
- Associate files with records
- Per-client file isolation in storage
- File metadata (name, size, type, upload timestamp, uploader)
- Download files

### 7. Review Workflow
- Submit record → assigned reviewer(s) receive notification
- Reviewer can:
  - View record, documents, evidence
  - Add comments (with required action flag)
  - Return to draft (with reason)
  - Forward for approval
- Each review action logged in audit trail

### 8. Approval Workflow
- Approved record → locked (no further edits)
- Rejected record → returned to draft with reason
- Each approval action logged

### 9. Audit Trail
- Every action on every record logged
- Log entry: timestamp, actor, action, before/after state, target type/ID, client ID
- Audit trail viewable per record and per client
- Exportable audit log (CSV)

### 10. Export
- Export approved record as PDF
- Export includes: record details, documents list, evidence, review comments, approval info, audit trail
- Exported file is timestamped and immutable
- Export log

### 11. Dashboard
- Per-client dashboard
- Summary: total records by status, recent activity, pending reviews/approvals
- Admin dashboard: all clients summary, system health

## Out-of-Scope Items (Explicitly Excluded from MVP)

- AI assistance features (Phase 7)
- Advanced reporting / BI dashboards
- Real-time collaboration
- Email integration / automated notifications
- SSO / SAML / AD integration
- API / webhook access
- Bulk import / export
- Advanced search (beyond basic filtering)
- Automated workflow triggers
- Client portal (external user self-service)
- Mobile app
- Real-time file preview / editing
- Digital signatures
- Billing / invoicing
- Scheduled / recurring records
- Template engine for record types

## Success Criteria

| Criterion | Measure |
|---|---|
| Multi-client isolation | No data from client A is accessible by client B user in any query or view |
| Core workflow completion | Record can be created, submitted, reviewed, approved, exported, and archived |
| Role enforcement | Operator cannot approve; Approver cannot edit drafts; Viewer cannot create |
| Audit trail completeness | Every state change and action creates an audit entry |
| Export integrity | Exported PDF includes all relevant data and provenance trail |
| File isolation | Client A files cannot be accessed from client B workspace |
| Performance | Record list loads under 2s with 1,000 records; export under 10s |
| Test coverage | All critical paths have automated tests |

## Pilot-Readiness Criteria

Before the system can be piloted with a real client:

1. All success criteria met
2. Automated tests pass for all critical paths
3. Security review complete (tenant isolation, RBAC, input validation)
4. Manual QA of full workflow end-to-end with 2+ simulated clients
5. Documentation for pilot operators and reviewers
6. Export integrity verified (PDF matches record state)
7. Data backup and restore verified
8. Pilot support plan documented
9. Known limitations documented and shared with pilot client

## What Must Be Validated Before Coding

| Question | Why It Matters |
|---|---|
| Is the core workflow general enough for the target client types? | A workflow that only fits one client type limits Sunbul's value |
| What is the minimum viable client configuration? | Avoid over-engineering client setup |
| How will clients be split in storage? | File isolation strategy affects storage architecture |
| What is the default record type / structure? | MVP needs at least one concrete record type |
| Who is the first pilot client? | Pilot client needs shape MVP priorities |
| Is there an existing database infrastructure to build on? | Reuse vs. new schema decision |
| What is the deployment target for MVP? | Cloud-only, or Private-capable from day one? |
