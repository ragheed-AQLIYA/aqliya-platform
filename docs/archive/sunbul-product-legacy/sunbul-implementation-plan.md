# Sunbul Implementation Plan

**Version:** 0.1
**Status:** Draft phases — do not start Phase 1 until Phase 0 is fully validated

---

## Phase Overview

| Phase | Name | Duration Estimate | Dependencies | Key Deliverable |
|---|---|---|---|---|
| 0 | Documentation & Boundaries | Complete | None | 10 specification docs |
| 1 | Data Model & Tenant Isolation | 2-3 weeks | Phase 0 | Prisma models, migrations, tenant guard |
| 2 | Workspace Shell | 1-2 weeks | Phase 1 | `/sunbul` route, layout, dashboard |
| 3 | Core Workflow | 3-4 weeks | Phase 2 | Record CRUD, state machine, submit/review/approve |
| 4 | Review & Approval | 2-3 weeks | Phase 3 | Review comments, approval chain, locking |
| 5 | Evidence & Files | 2-3 weeks | Phase 3 | Upload, storage, evidence linking |
| 6 | Export & Reporting | 2-3 weeks | Phase 4 | PDF export, audit log export |
| 7 | AI Assistance | 3-4 weeks (future) | Phase 5 | AI suggestions, evidence of AI output |
| 8 | Pilot Hardening | 3-4 weeks | Phase 6 | Security review, testing, documentation, bug fixes |

---

## Phase 0: Documentation & Boundaries

**Status:** ✅ Complete (this documentation set)

**Deliverables:**
- [x] Product README
- [x] Product brief
- [x] MVP scope
- [x] Multi-client architecture
- [x] User roles and permissions
- [x] Workflow state machine
- [x] Data model concept
- [x] Feature specification
- [x] Implementation plan
- [x] Open questions

**Validation required before Phase 1:**
- [ ] All open questions answered
- [ ] MVP scope approved by stakeholders
- [ ] Target client type confirmed
- [ ] First pilot client identified (if possible)
- [ ] Deployment model confirmed (Cloud vs. Private)
- [ ] Route strategy decision: `/sunbul` top-level or under `/(dashboard)/sunbul`
- [ ] Decision on using existing AQLIYA platform components (auth, RBAC, audit) vs. building Sunbul-specific ones

---

## Phase 1: Data Model & Tenant Isolation

**Goal:** Create the database foundation with per-client isolation.

**Tasks:**
1. Create Prisma models: `SunbulClient`, `SunbulUser`, `SunbulUserMembership`, `SunbulClientConfiguration`
2. Create Prisma models: `SunbulRecord`, `SunbulDocument`, `SunbulEvidence`, `SunbulReview`, `SunbulApproval`, `SunbulAuditEvent`, `SunbulExport`
3. Create initial migration (namespaced with `Sunbul` prefix to avoid conflicts with existing models)
4. Implement tenant guard middleware/service:
   - `requireClientAccess()` — verify user-client membership and role
   - `enforceTenantIsolation()` — automatically scope queries to current client
5. Implement base server action pattern that enforces tenant guard on every data access
6. Write isolation tests (verify client A cannot access client B data)

**Key decisions:**
- Model prefix: `Sunbul` to avoid naming collisions with AuditOS (`Audit*`) and DecisionOS models
- Tenant guard as reusable function, not middleware that breaks existing flows
- Separate Prisma schema file or same schema with prefix? → Same schema with `Sunbul` prefix

**Do NOT:**
- Create routes or pages in this phase
- Modify existing models
- Remove or alter existing migrations

---

## Phase 2: Workspace Shell

**Goal:** Create the Sunbul route shell with client-scoped dashboard.

**Tasks:**
1. Add Sunbul to `platform-sidebar.tsx` navigation modules
2. Create `/sunbul` route (top-level, following SalesOS pattern)
3. Create workspace layout with PlatformSidebar + PlatformHeader
4. Create client selection/switching mechanism (for users with multiple client memberships)
5. Build client dashboard page:
   - Records summary by status (cards/charts)
   - Recent activity timeline
   - Pending reviews/approvals count
   - Quick action buttons (new record, view all records)
6. Add Sunbul marketing page under `/products/sunbul` (if appropriate)

**Design patterns to follow:**
- SalesOS prototype pattern: Arabic-first, RTL, clear "prototype" badge
- Dashboard components use existing `WorkspaceStatus`, `KPICard`, `RecentEntitiesPanel`, etc.
- PlatformSidebar and PlatformHeader for consistent navigation

---

## Phase 3: Core Workflow

**Goal:** Implement the record lifecycle with state machine.

**Tasks:**
1. Implement Record CRUD server actions:
   - `createRecord()`, `updateRecord()`, `deleteRecord()`, `getRecord()`, `listRecords()`
   - All actions enforce tenant guard and role permissions
2. Implement state machine logic:
   - `submitRecord()` — DRAFT → SUBMITTED
   - `assignReviewer()` — SUBMITTED → UNDER REVIEW
   - `returnRecord()` — UNDER REVIEW → RETURNED
   - `approveRecord()` — UNDER REVIEW → APPROVED
   - `lockRecord()` — APPROVED → LOCKED (auto)
   - `archiveRecord()` — EXPORTED → ARCHIVED
   - `restoreRecord()` — ARCHIVED → DRAFT
3. Implement Record UI pages:
   - Record list page (filterable, sortable, paginated)
   - Record detail page (status-based view)
   - Record create/edit form
4. Implement state-dependent UI:
   - Show/hide actions based on current state and user role
   - Disable editing when not in DRAFT/RETURNED
   - Show status badge with contextual colors

---

## Phase 4: Review & Approval

**Goal:** Implement the review and approval workflow.

**Tasks:**
1. Implement Review server actions:
   - `addReviewComment()` — adds comment without state change
   - `returnToDraft()` — changes status with required comment
   - `forwardForApproval()` — changes status to UNDER REVIEW with approval intent
2. Implement Approval server actions:
   - `approveRecord()` — changes status to APPROVED
   - `rejectRecord()` — changes status to RETURNED
3. Implement Review UI:
   - Review panel on record detail page
   - Review queue page (records assigned to current user as reviewer)
   - Add comment form with required action flag
4. Implement Approval UI:
   - Approval panel on record detail page
   - Approval queue page
5. Configure approval chain logic (MVP: single approval)

---

## Phase 5: Evidence & Files

**Goal:** Implement document upload and evidence management.

**Tasks:**
1. Implement file upload server action with:
   - File type validation
   - File size validation
   - Virus scanning integration (future)
   - Storage path: `clients/{clientId}/records/{recordId}/{filename}`
   - File hash for integrity
2. Implement document list on record detail with download
3. Implement evidence creation (notes linked to records, optionally linked to documents)
4. Implement file deletion (with permission check)
5. Add evidence panel to record detail view
6. Implement download tracking (audit event on each download)

---

## Phase 6: Export & Reporting

**Goal:** Implement PDF export and audit log export.

**Tasks:**
1. Implement PDF export server action:
   - Generate PDF with record details, documents list, evidence, review comments, approval info
   - Include audit trail summary
   - Include cover page with record title, client name, export date
   - Arabic-first layout with RTL support
2. Implement export version tracking
3. Implement audit log export (CSV)
4. Implement export history page
5. Implement download link for exported files

---

## Phase 7: AI Assistance (Future)

**Goal:** Add AI-powered assistance features with governance guards.

**Tasks:**
1. Define AI assistance scope for Sunbul:
   - AI-suggested record summaries
   - AI-suggested evidence gaps
   - AI-suggested review comments (draft)
   - AI quality check before submission
2. Implement AI provider abstraction (reuse AQLIYA AI Orchestration if available)
3. Implement AI output governance:
   - All AI outputs marked as "suggested" / "AI-generated draft"
   - AI output linked to input source data
   - Human review required before acceptance
   - AI actions logged in audit trail
4. Add AI indicator UI components
5. Never make AI autonomous for any decision or output

---

## Phase 8: Pilot Hardening

**Goal:** Prepare for a real client pilot.

**Tasks:**
1. Security review:
   - Tenant isolation penetration test
   - RBAC enforcement test
   - Input validation audit
   - File upload security review
2. Performance testing:
   - Record list with 1,000+ records
   - Concurrent users simulation
   - Export speed
3. Test coverage:
   - Unit tests for all server actions
   - Integration tests for workflow state machine
   - Isolation tests for multi-client data access
4. Documentation:
   - Operator guide
   - Reviewer guide
   - Admin guide
   - Pilot runbook
5. Bug fixes and polish
6. Production readiness checklist completion
