# Sunbul Data Model Concept

**Version:** 0.1
**Status:** Conceptual — NOT a Prisma schema. Do NOT create migrations from this document without explicit approval.
**Rule:** No Prisma schema changes without validated implementation plan.

---

## Conceptual Entities

### Core Entities

```
Client (Tenant)
├── UserMembership
├── Record (Case / Request)
│   ├── Document
│   ├── Evidence
│   ├── Review
│   ├── Approval
│   └── AuditEvent
├── Configuration
└── Export
```

---

### 1. Client (Tenant)

The top-level isolation boundary. All client data is scoped within a client.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | String | Client/tenant name |
| slug | String | URL-safe identifier, unique |
| status | Enum | `active`, `suspended`, `archived` |
| industry | String | Industry classification |
| contactEmail | String? | Primary contact email |
| contactPhone | String? | Primary contact phone |
| config | JSON | Client-specific configuration |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |
| deletedAt | DateTime? | Soft delete timestamp |

**Relationships:**
- Client has many `UserMembership` records
- Client has many `Record` records
- Client has many `AuditEvent` records
- Client has one `Configuration` record

**Isolation rules:**
- Every entity that belongs to a client MUST have a `clientId` foreign key
- All queries MUST filter by `clientId`
- Cross-client access allowed ONLY for Platform Admin role

---

### 2. User / UserMembership

A User is a person who can access the system. Their access to a client is defined by a UserMembership.

**User table:**

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| email | String | Unique, used for login |
| name | String | Display name |
| passwordHash | String? | Hashed password |
| status | Enum | `active`, `suspended`, `invited` |
| language | String | `ar` or `en` |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**UserMembership table:**

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| userId | UUID | Reference to User |
| clientId | UUID | Reference to Client |
| role | Enum | `owner`, `manager`, `reviewer`, `operator`, `viewer` |
| status | Enum | `active`, `suspended` |
| invitedAt | DateTime | Invitation timestamp |
| acceptedAt | DateTime? | When user accepted invitation |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships:**
- User can have many UserMemberships (belong to many clients)
- UserMembership belongs to one User and one Client
- A User in the context of a Client has exactly one role (via UserMembership)
- Platform Admin is a special role on User (not via membership)

**Isolation rules:**
- UserMembership is the link between User and Client
- UserMembership determines which clients a user can access
- Cross-client access is possible IF the user has memberships in multiple clients
- Session determines which client the user is currently acting in

---

### 3. Record (Case / Request)

The core unit of work in Sunbul. A record flows through the state machine.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| clientId | UUID | Reference to Client |
| title | String | Record title |
| description | String? | Description of the record |
| type | String | Record type (configurable per client) |
| priority | Enum | `low`, `medium`, `high`, `critical` |
| status | Enum | Current workflow state |
| dueDate | DateTime? | Target completion date |
| createdById | UUID | Reference to User who created it |
| assignedToId | UUID? | Reference to assigned Reviewer |
| lockedAt | DateTime? | When record was locked |
| approvedAt | DateTime? | When record was approved |
| exportedAt | DateTime? | When record was exported |
| archivedAt | DateTime? | When record was archived |
| metadata | JSON? | Flexible metadata for custom fields |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships:**
- Record belongs to one Client
- Record has many Document records
- Record has many Evidence records
- Record has many Review records
- Record has many Approval records
- Record has many AuditEvent records

**Isolation rules:**
- `clientId` on Record ensures per-client isolation
- All document/evidence/review/approval queries must join through Record
- Records from different clients cannot be queried together

---

### 4. Document / File

Files uploaded and associated with a record.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| recordId | UUID | Reference to Record |
| clientId | UUID | Reference to Client |
| filename | String | Original filename |
| fileType | String | MIME type |
| fileSize | Int | Size in bytes |
| storageKey | String | Path in storage system |
| fileHash | String? | SHA-256 hash for integrity |
| uploadedById | UUID | Reference to User |
| uploadedAt | DateTime | Upload timestamp |
| description | String? | Optional description |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships:**
- Document belongs to one Record
- Document belongs to one Client (via Record)

**Isolation rules:**
- Storage path includes `clientId`: `clients/{clientId}/records/{recordId}/{filename}`
- DB query always filtered by `clientId`

---

### 5. Evidence

Evidence notes/links attached to a record. Evidence can reference documents or be standalone notes.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| recordId | UUID | Reference to Record |
| clientId | UUID | Reference to Client |
| title | String | Evidence title |
| description | String | Evidence content/note |
| sourceType | Enum | `upload`, `note`, `reference` |
| sourceId | String? | ID of referenced source (e.g., document ID) |
| createdById | UUID | Reference to User |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships:**
- Evidence belongs to one Record
- Evidence optionally references one Document

---

### 6. Review

A review action performed on a record by a Reviewer.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| recordId | UUID | Reference to Record |
| clientId | UUID | Reference to Client |
| reviewerId | UUID | Reference to User |
| action | Enum | `comment`, `return_to_draft`, `forward_for_approval` |
| comment | String? | Review comment |
| requiredAction | Enum | `none`, `revision_required`, `more_evidence`, `clarification` |
| createdAt | DateTime | |

**Relationships:**
- Review belongs to one Record
- Review belongs to one Reviewer (User)

---

### 7. Approval

An approval action on a record.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| recordId | UUID | Reference to Record |
| clientId | UUID | Reference to Client |
| approverId | UUID | Reference to User |
| action | Enum | `approved`, `rejected` |
| comment | String? | Approval/rejection reason |
| createdAt | DateTime | |

**Relationships:**
- Approval belongs to one Record
- Approval belongs to one Approver (User)

---

### 8. AuditEvent

Every state-changing action logged immutably.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| clientId | UUID | Reference to Client |
| recordId | UUID? | Reference to Record (nullable for non-record events) |
| actorId | UUID | Reference to User or "system" |
| action | Enum | Audit action type |
| targetType | String | Entity type (e.g., "record", "document", "user") |
| targetId | String | Entity ID |
| previousState | String? | Previous workflow state or value |
| newState | String? | New workflow state or value |
| description | String | Human-readable description |
| metadata | JSON? | Additional context |
| createdAt | DateTime | |

---

### 9. Export

Record of each export action.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| recordId | UUID | Reference to Record |
| clientId | UUID | Reference to Client |
| exportedById | UUID | Reference to User |
| exportType | String | `pdf`, `csv`, etc. |
| fileKey | String | Storage key of exported file |
| version | Int | Export version number |
| metadata | JSON | Export metadata (included sections, etc.) |
| createdAt | DateTime | |

---

### 10. ClientConfiguration

Per-client configuration, separate from the Client record for cleaner schema.

| Field | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| clientId | UUID | Reference to Client (unique) |
| language | String | Default language |
| timezone | String | Client timezone |
| recordTypes | JSON | Available record types |
| approvalRules | JSON | Approval workflow configuration |
| exportTemplates | JSON | Export template preferences |
| aiConfig | JSON? | AI assistance configuration (future) |
| createdAt | DateTime | |
| updatedAt | DateTime | |

---

## Entity Relationship Summary

```
Client ──┬── UserMembership ─── User
         ├── Record ──┬── Document
         │            ├── Evidence
         │            ├── Review ─────── User (reviewer)
         │            ├── Approval ───── User (approver)
         │            ├── AuditEvent ─── User (actor)
         │            └── Export
         ├── ClientConfiguration
         └── AuditEvent (non-record events)
```

## Isolation Rules Summary

1. **Every table** with client-scoped data has `clientId`
2. **Record** is the primary isolation unit within a client
3. **UserMembership** is the only bridge between User and Client
4. **AuditEvent** is client-scoped and immutable
5. **Documents** are isolated both in DB (`clientId`) and in storage (path includes `clientId`)
6. **No cross-client relationships** — entities from different clients never relate directly

## Migration Strategy

When migrations are created:
1. Start with `Client` and `User` tables (foundation)
2. Add `UserMembership` (multi-client bridge)
3. Add `ClientConfiguration` (per-client settings)
4. Add `Record` and related entities
5. Add indexes on `clientId`, `status`, `recordId` for performance

**Do NOT create migrations until Phase 1 implementation is approved.**
