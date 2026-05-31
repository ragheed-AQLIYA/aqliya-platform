# Sunbul User Roles & Permissions

**Version:** 0.1
**Status:** Draft — may evolve during implementation

---

## Role Hierarchy

```
Platform Admin (super-admin, outside any client)
│
├── Client Owner (full control within a client)
│   ├── Client Manager (administrative within a client)
│   │   ├── Reviewer (review and approve records)
│   │   │   └── Operator (create and manage records)
│   │   │       └── Viewer (read-only access)
```

## Role Definitions

### Platform Admin
- **Scope:** All clients, platform-wide
- **Description:** Super-admin role that exists outside any client. Can manage clients, platform configuration, and all users.
- **Who holds it:** AQLIYA/Sunbul operations team, system administrators
- **Limitations:** Cannot operate within a client workflow (no record creation, review, or approval)

### Client Owner
- **Scope:** Single client
- **Description:** The highest role within a client. Full control over client configuration, users, and all records.
- **Who holds it:** Client's senior representative or Sunbul account manager
- **Can do:** Everything within the client, including inviting users, changing client config, viewing all data

### Client Manager
- **Scope:** Single client
- **Description:** Administrative role within a client. Manages users, roles, and client configuration but does not create or approve records.
- **Who holds it:** Client's operations manager, internal administrator
- **Can do:** Manage users, manage roles, view client config, view all records, view audit logs

### Reviewer
- **Scope:** Single client
- **Description:** Reviews records submitted for review. Can return to draft or forward for approval. Cannot create or edit records.
- **Who holds it:** Senior team member, quality assurance, subject matter expert
- **Can do:** View all records within client, review submitted records, add comments, return to draft, forward for approval

### Operator
- **Scope:** Single client
- **Description:** Creates and manages records. Submits records for review. Uploads documents and evidence.
- **Who holds it:** Regular operational staff, engagement team members
- **Can do:** Create/edit own records, upload files, attach evidence, submit for review, view own records and records assigned to them

### Viewer
- **Scope:** Single client
- **Description:** Read-only access to records within a client. Cannot create, edit, review, or approve any records.
- **Who holds it:** External stakeholders, auditors, observers
- **Can do:** View all records within client, view documents, view audit logs (read-only)

### External User (Future)
- **Scope:** Single client, limited to specific records
- **Description:** A user who belongs to the client organization but has very limited access, typically only to submit information or view specific outputs.
- **Who holds it:** Client's end customer, third-party contributor
- **MVP scope:** NOT included in MVP (future enhancement)

## Permission Matrix

| Action | Platform Admin | Client Owner | Client Manager | Reviewer | Operator | Viewer |
|---|---|---|---|---|---|---|
| **Client Management** | | | | | | |
| Create client | ✅ | — | — | — | — | — |
| Update client config | ✅ | ✅ | ✅ | — | — | — |
| Suspend/archive client | ✅ | — | — | — | — | — |
| Delete client | ✅ | — | — | — | — | — |
| View client list (all) | ✅ | — | — | — | — | — |
| View own client details | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **User Management (within client)** | | | | | | |
| Invite user to client | ✅ | ✅ | ✅ | — | — | — |
| Remove user from client | ✅ | ✅ | ✅ | — | — | — |
| Change user role | ✅ | ✅ | ✅ | — | — | — |
| Suspend user | ✅ | ✅ | ✅ | — | — | — |
| **Record / Case Management** | | | | | | |
| Create record | — | ✅ | — | — | ✅ | — |
| Edit own draft record | — | ✅ | — | — | ✅ | — |
| Edit any draft record | — | ✅ | ✅ | — | — | — |
| Delete draft record | — | ✅ | ✅ | — | ✅ (own) | — |
| Submit record for review | — | ✅ | — | — | ✅ | — |
| Update record after submission | — | ✅ | — | — | — | — |
| Lock/unlock record | — | ✅ | ✅ | ✅* | — | — |
| View record (within client) | ✅ | ✅ | ✅ | ✅ | ✅ (assigned) | ✅ |
| **Documents** | | | | | | |
| Upload document | — | ✅ | — | — | ✅ | — |
| Delete own uploaded document | — | ✅ | — | — | ✅ | — |
| Delete any document | — | ✅ | ✅ | — | — | — |
| Download document | ✅ | ✅ | ✅ | ✅ | ✅ (assigned) | ✅ |
| **Review & Approval** | | | | | | |
| View review queue | ✅ | ✅ | ✅ | ✅ | — | — |
| Add review comment | — | ✅ | ✅ | ✅ | — | — |
| Return record to draft | — | ✅ | ✅ | ✅ | — | — |
| Forward for approval | — | ✅ | ✅ | ✅ | — | — |
| Approve record | — | ✅ | ✅ (if designated) | — | — | — |
| Reject record | — | ✅ | ✅ (if designated) | — | — | — |
| Override approval | ✅ | — | — | — | — | — |
| **Audit Logs** | | | | | | |
| View audit log (client scoped) | ✅ | ✅ | ✅ | ✅ | ✅ (own actions) | ✅ |
| Export audit log | ✅ | ✅ | ✅ | — | — | — |
| **Export** | | | | | | |
| Export record as PDF | ✅ | ✅ | ✅ | — | ✅ (own approved) | — |
| View export history | ✅ | ✅ | ✅ | ✅ | ✅ (own) | ✅ |
| **Configuration** | | | | | | |
| Change workflow rules | ✅ | ✅ | ✅ | — | — | — |
| Change export templates | ✅ | ✅ | ✅ | — | — | — |
| Configure AI assistance | ✅ | ✅ | ✅ | — | — | — |

\* Reviewer can lock a record only by approving it (state transition to approved/locked).

## Permission Enforcement Rules

1. **Deny by default** — any action not explicitly permitted is denied
2. **Client scoping** — all permissions are scoped to a specific client; Platform Admin scope is all clients
3. **Own vs. any** — Operator permissions on records are typically scoped to records they created ("own")
4. **State-dependent** — some actions are only allowed in certain workflow states (e.g., editing only in Draft)
5. **Audited** — every permission check that denies access should be logged (optional: for debugging)
6. **No escalation** — a user cannot perform an action that gives themselves higher permissions
