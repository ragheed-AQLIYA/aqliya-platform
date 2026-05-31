# Sunbul Product Definition Lock

**Version:** 1.0 (Locked)
**Status:** Decisive — supersedes all prior draft scoping documents
**Date:** 2026-05-18
**Parent Ecosystem:** AQLIYA

---

## 1. Final Product Definition

### Arabic
سنبل هي منصة تشغيلية محكومة تُمكّن المؤسسات من خدمة جهات متعددة من خلال مسار عمل متكرر ومعزول للبيانات، مع صلاحيات أدوار، وسجل تدقيق، ومراجعة بشرية لكل مخرج. سنبل منتج مستقل ضمن منظومة عقلية، وليست عقلية نفسها.

### English
Sunbul is a governed operational platform that enables organizations to serve multiple clients through a repeatable, data-isolated workflow with role-based access, audit trails, and human review for every output. Sunbul is an independent product within the AQLIYA ecosystem, not AQLIYA itself.

---

## 2. Final MVP Objective

Prove that a single deployment can serve multiple isolated clients through a complete governed record lifecycle — from creation through review, approval, and archival — with zero cross-client data leakage and full audit traceability.

The MVP validates three hypotheses:
1. Multi-client isolation works at the application layer with `clientId` scoping
2. The 4-state workflow (Draft → Under Review → Approved → Archived) is usable by Operators and Reviewers
3. Export integrity preserves provenance (who did what, when, based on what evidence)

---

## 3. MVP User Types (Minimum Viable)

Only **3 roles** for MVP:

| Role | Scope | What They Do |
|---|---|---|
| **Platform Admin** | All clients | Create clients, invite users, assign roles, view all data (read-only within clients) |
| **Operator** | Single client | Create/edit/submit records, upload documents, view assigned records |
| **Reviewer** | Single client | Review submitted records, approve or return to draft, view all records within client |

**Deferred from MVP:**
- Client Owner (Operator + user management within client → Pilot)
- Client Manager (user management only → Pilot)
- Approver (merged with Reviewer for MVP)
- Viewer (Pilot)
- External User (Production)

**MVP simplification:** Reviewer == Approver. One person reviews and approves. No separate approval chain in MVP.

---

## 4. MVP Workflow (Minimum States)

Locked to **4 states**:

```
DRAFT ──submit──► UNDER REVIEW ──approve──► APPROVED ──archive──► ARCHIVED
                     │
                     └──return──► DRAFT
```

| State | Description | Editable | Deletable |
|---|---|---|---|
| **DRAFT** | Being created/edited by Operator | Yes | Yes |
| **UNDER REVIEW** | Submitted, being examined by Reviewer | No | No |
| **APPROVED** | Approved by Reviewer, locked forever | No | No |
| **ARCHIVED** | Soft-deleted, hidden from active views | No | No |

**Removed states** (compared to earlier draft):
- `SUBMITTED` — merged into UNDER REVIEW (no intermediate "waiting for assignment" state)
- `RETURNED` — return transitions directly back to DRAFT
- `LOCKED` — same as APPROVED; approval = permanent lock
- `EXPORTED` — export is an action on APPROVED records, not a separate state

**Transitions:**

| From | To | Trigger | Required Role |
|---|---|---|---|
| DRAFT | UNDER REVIEW | Submit | Operator |
| UNDER REVIEW | DRAFT | Return (with comment) | Reviewer |
| UNDER REVIEW | APPROVED | Approve | Reviewer |
| APPROVED | ARCHIVED | Archive | Platform Admin, Operator (own) |

---

## 5. MVP Modules

| Module | MVP | Pilot | Production | Notes |
|---|---|---|---|---|
| Client CRUD | ✅ MVP | — | — | Create, activate, deactivate, view. No config editing. |
| User invite + role assignment | ✅ MVP | — | — | Invite by email, assign Operator or Reviewer role. |
| Record CRUD | ✅ MVP | — | — | Title + description + type (single "Case" type for MVP). |
| Document upload/download | ✅ MVP | — | — | PDF, XLSX, DOCX, images. Max 20MB. No preview. |
| Submit + Review + Approve | ✅ MVP | — | — | Single reviewer-approver. Return requires comment. |
| Basic record list | ✅ MVP | — | — | Filter by status. Sort by date. No advanced search. |
| Record audit trail | ✅ MVP | — | — | Timeline view per record. Side-by-side with record. |
| PDF export of approved record | ✅ MVP | — | — | Single-button export. Includes record + audit summary. |
| Client dashboard | ✅ MVP | — | — | Records-by-status summary + recent activity. |
| Evidence notes | — | ✅ Pilot | — | Text notes attached to records, optionally linking files. |
| User management (edit/remove) | — | ✅ Pilot | — | Change role, suspend, remove. |
| Client configuration (basic) | — | ✅ Pilot | — | Language, timezone, name. |
| Client-level audit log page | — | ✅ Pilot | — | Full client audit log with date filter. |
| Audit log export (CSV) | — | — | ✅ Production | |
| Export history view | — | — | ✅ Production | |
| Admin dashboard (all clients) | — | — | ✅ Production | |
| Record archive/restore | — | ✅ Pilot | — | Soft-delete + restore. |
| Record return loop | ✅ MVP | — | — | Reviewer returns → DRAFT. Operator edits → re-submits. |
| Multi-user per client | ✅ MVP | — | — | Multiple operators, reviewers per client. |
| Cross-client user membership | — | ✅ Pilot | — | One user in multiple clients. |
| Email notifications | — | ✅ Pilot | — | In-app only for MVP. |
| File deletion | — | ✅ Pilot | — | |
| Evidence management | — | ✅ Pilot | — | |
| Advanced filtering/search | — | — | ✅ Production | |
| AI assistance | — | — | ✅ Production | Entirely removed from near-term scope. |

---

## 6. MVP Data Entities

| Entity | Required for MVP? | Reason |
|---|---|---|
| **Client** | ✅ Yes | Top-level isolation boundary. Creates the tenant. |
| **User** | ✅ Yes | Person who logs in. |
| **UserMembership** | ✅ Yes | Links User to Client with a role. Platform Admin excluded (no membership needed). |
| **Record** | ✅ Yes | Core workflow unit. Contains title, description, type, status, priority, due date, clientId, createdById. |
| **Document** | ✅ Yes | File uploads attached to Records. Contains filename, type, size, storageKey, clientId, recordId. |
| **Review** | ✅ Yes | Review action. Contains reviewerId, recordId, action (approve/return), comment, clientId. |
| **AuditEvent** | ✅ Yes | Immutable log. Contains clientId, recordId, actorId, action, before/after state, timestamp. |
| **Evidence** | ❌ No — Pilot | Evidence note = text field on Record for MVP. Separate entity deferred to Pilot. |
| **Approval** | ❌ No — MVP merged | Merged into Review. Review action "approve" serves as approval. |
| **Export** | ❌ No — implicit | Export = PDF file on disk + AuditEvent. No separate entity. |
| **ClientConfiguration** | ❌ No — JSON on Client | Per-client settings stored as JSON column on Client. No separate entity. |

---

## 7. MVP Permissions (Minimum)

### Permission Matrix (3 roles)

| Action | Platform Admin | Operator | Reviewer |
|---|---|---|---|
| Create client | ✅ | — | — |
| View all clients | ✅ | — | — |
| View own client | ✅ | ✅ | ✅ |
| Invite user to client | ✅ | — | — |
| Assign role to user | ✅ | — | — |
| Remove user from client | ✅ | — | — |
| Create record | — | ✅ | — |
| Edit own draft record | — | ✅ | — |
| Delete own draft record | — | ✅ | — |
| Submit record | — | ✅ | — |
| Upload document | — | ✅ | — |
| Delete own uploaded document | — | ✅ | — |
| Download document | ✅ | ✅ (assigned) | ✅ |
| View record list | ✅ | ✅ (own) | ✅ |
| View record detail | ✅ | ✅ (own) | ✅ |
| Review record | — | — | ✅ |
| Return record to draft | — | — | ✅ |
| Approve record | — | — | ✅ |
| Export approved record | — | ✅ (own) | — |
| View audit trail | ✅ | ✅ (own) | ✅ |
| Archive record | ✅ | ✅ (own approved) | — |

**Platform Admin rules:**
- Can view any client's data (read-only unless explicitly acting as admin)
- Cannot create, review, or approve records (not a client member)
- Can export any approved record

**Operator rules:**
- Actions scoped to records they created ("own")
- Cannot review or approve
- Cannot view other operators' records unless explicitly shared (future)

**Reviewer rules:**
- Can view ALL records within their client
- Cannot create, edit, or delete records
- Can return with comment (required)
- Can approve (which locks permanently)

---

## 8. Multi-Client Boundary (Minimum for First Version)

| Aspect | MVP Decision |
|---|---|
| **Isolation level** | Application layer only. Single PostgreSQL database. `clientId` column on every data table. |
| **Tenant guard** | Function `requireClientAccess(userId, clientId, requiredRole?)` called at the start of every server action. No middleware. |
| **User scope** | A user belongs to exactly ONE client in MVP. Cross-client membership deferred to Pilot. |
| **File storage** | Single filesystem. Path: `clients/{clientId}/records/{recordId}/{filename}`. |
| **Audit events** | `clientId` on every event. Queryable by client. Platform Admin can query all. |
| **Client config** | JSON column on Client model. No separate configuration table. |
| **Schema** | Single Prisma schema. `Sunbul` prefix on all tables. Separate from AuditOS/DecisionOS models. |

---

## 9. Implementation Sequence (Locked)

| Step | What | Depends On |
|---|---|---|
| 1 | **Data model** — Prisma schema with Sunbul-prefixed models: Client, User, UserMembership, Record, Document, Review, AuditEvent | None |
| 2 | **Migration** — Single initial migration | Step 1 |
| 3 | **Tenant guard** — `requireClientAccess()` function + server action pattern | Step 1 |
| 4 | **Auth integration** — User login, session management, client-scoped session | Step 3 |
| 5 | **Client CRUD** — Platform Admin creates/manages clients | Step 4 |
| 6 | **User invite + role assignment** — Invite users to clients as Operator or Reviewer | Step 5 |
| 7 | **Record CRUD** — Create, edit, delete, list, view records | Step 5, 6 |
| 8 | **Document upload + download** — Upload files, attach to records, download | Step 7 |
| 9 | **Workflow: Submit** — DRAFT → UNDER REVIEW | Step 7 |
| 10 | **Workflow: Review + Approve/Return** — Reviewer actions | Step 9 |
| 11 | **Audit trail** — Record-level audit timeline | Step 7 (events logged from start) |
| 12 | **Export** — PDF export of approved records | Step 10 |
| 13 | **Archive** — APPROVED → ARCHIVED | Step 10 |
| 14 | **Client dashboard** — Status summary, recent activity | Step 7 |
| 15 | **Pilot hardening** — Testing, security review, documentation | Steps 1-14 |

This sequence delivers a usable vertical slice after Step 10 (Submit → Review → Approve), with export at Step 12 completing the core value chain.

---

## 10. Removed / Deferred Scope

### Removed from MVP (must NOT build)

| Item | Rationale | When |
|---|---|---|
| AI assistance of any kind | Not needed to prove core value proposition | Production |
| Evidence as separate entity | Text note on Record is sufficient for MVP | Pilot |
| Approval as separate entity | Reviewer == Approver for MVP | Pilot |
| Export as separate entity | Single PDF action; no export history | Pilot |
| Advanced search/filtering | Basic status/date sort is sufficient | Pilot |
| Email notifications | In-app status changes suffice | Pilot |
| Viewer role | Not needed for workflow participants | Pilot |
| Client Owner role | Platform Admin + Operator covers needs | Pilot |
| Client Manager role | Platform Admin handles user management | Pilot |
| Cross-client user membership | One user per client simplifies MVP | Pilot |
| Client configuration editing | Fixed config for MVP (Arabic, Riyadh time) | Pilot |
| Client-level audit log page | Record-level audit trail is enough | Pilot |
| Admin dashboard | Platform Admin can view client list | Production |
| File deletion | Upload with replace; no separate delete | Pilot |
| Record restore from archive | Archive = permanent for MVP | Pilot |
| Concurrent edit lock | Last-save-wins for MVP | Pilot |
| Any marketing pages | Documentation only | Production |
| Mobile/responsive beyond desktop | Desktop-first MVP | Production |
| API/webhooks | No integrations in MVP | Production |
| SSO/SAML/AD | Built-in auth only | Production |
| Any On-Prem or Private deployment | Cloud-only MVP | Production |

### Explicit Anti-Scope (will not build)

The following were mentioned in earlier drafts but are now explicitly out of scope for the foreseeable future:
- AI features
- Billing/invoicing
- White-label/branding
- Template engine
- Digital signatures
- Real-time collaboration
- Automated triggers
- Client portal (external user self-service)

---

## 11. Final Open Questions (True Blockers Only)

The 40 original questions are classified below. Only the **bolded** questions block MVP implementation.

### Must Answer Before MVP (Blockers)

| # | Question | Recommended Answer |
|---|---|---|
| **1** | **Is Sunbul deployed on existing AQLIYA infrastructure or separately?** | **Same deployment.** Reuse existing Next.js app, PostgreSQL, auth. Reduces overhead. |
| **2** | **Does Sunbul reuse AQLIYA auth (NextAuth v5) or build its own?** | **Reuse NextAuth v5.** Add Sunbul-specific user model with UserMembership. |
| **3** | **What is the model prefix?** | **`Sunbul`** prefix. E.g., `SunbulClient`, `SunbulRecord`. |
| **4** | **What is the default record type for MVP?** | **Single type: "Case" (قضية).** Configurable types deferred. |
| **5** | **Minimum required fields for record submission?** | **Title + at least one document.** Ensures every record has content before review. |
| **6** | **Record numbering scheme?** | **UUID for internal ID. Auto-increment per client for human-readable reference number.** |
| **7** | **Expected record volume per client?** | **< 100/month.** MVP does not need sharding or performance optimization. |
| **8** | **What database infrastructure is used?** | **Existing AQLIYA PostgreSQL.** Same database, new schema with `Sunbul` prefix. |

### Can Defer Until Pilot

Questions 9-18, 20, 22-24 (from original): Evidence entity, cross-client membership, client config editing, file deletion, record restore, advanced search, email notifications, Viewer role, Client Owner role, pilot client details, client-level audit log.

### Can Defer Until Production

Questions 19, 25-30: Admin dashboard, audit log export, AI assistance, export history, billing/commercial, On-Prem.

### Not Needed / Remove

Questions 29 (free trial/demo mode), 30 (active client billing def) — premature.

---

## 12. Go / No-Go Decision

### **CONDITIONAL GO**

**Reason:** The product definition, workflow, data model, permission model, and multi-client boundary are decisively locked. Eight open questions remain but all have recommended answers that are low-risk implementation decisions (not product strategy unknowns).

**Conditions to clear before starting Step 1 (Data Model):**

1. **Confirm deployment approach** — Same AQLIYA deployment, reuse NextAuth v5, `Sunbul` prefix on models (recommended answers above are low-risk defaults)
2. **Confirm the record type** — Type "Case" (قضية) with title + description + documents is sufficient
3. **Confirm target client type** — Even a generic "professional services firm" answer unlocks all design decisions
4. **Decide on import approach** — Should Sunbul import AQLIYA's existing `User` model or create its own `SunbulUser`? Recommended: create `SunbulUser` to avoid coupling with existing auth models, but link to the same auth provider

**If all four conditions are confirmed with answers aligning to the recommended resolutions above → Full GO.**
