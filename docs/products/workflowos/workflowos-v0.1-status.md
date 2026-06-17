# WorkflowOS v0.1 — Status Freeze

**Date:** 2026-05-28  
**Status:** L4 Usable v0.1 — Functionally Complete (Go)  
**Canonical identity:** Confirmed — WorkflowOS is the canonical product name. Sunbul is a legacy redirect alias.

---

## Canonical Routes

| Route                                                              | Type          | Status |
| ------------------------------------------------------------------ | ------------- | ------ |
| `/workflowos`                                                      | Dashboard     | Active |
| `/workflowos/admin`                                                | Admin panel   | Active |
| `/workflowos/clients/[clientId]/records/[recordId]`                | Record detail | Active |
| `/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf` | PDF export    | Active |
| `/api/workflowos/documents/[documentId]/download`                  | File download | Active |

## Legacy Redirect Aliases

| Route                                           | Behavior                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| `/sunbul`                                       | `permanentRedirect(302)` → `/workflowos`                         |
| `/sunbul/admin`                                 | `permanentRedirect(302)` → `/workflowos/admin`                   |
| `/sunbul/clients/[clientId]/records/[recordId]` | `permanentRedirect(302)` → `/workflowos/clients/.../records/...` |

## Legacy Compatibility

- `Product.SUNBUL` retained in audit logger for backward compatibility with existing log entries. New events use `Product.WORKFLOWOS`.
- `Sunbul*` Prisma models (`SunbulClient`, `SunbulRecord`, `SunbulDocument`, `SunbulUserMembership`, `SunbulAuditEvent`, `SunbulReview`) remain unrenamed. TypeScript type aliases in `src/lib/workflowos/types.ts` bridge the gap.
- `/organizations/sunbul` page retains Sunbul terminology (references Prisma models directly).

## Functional Capabilities

| Capability                  | Status | Details                                                                                |
| --------------------------- | ------ | -------------------------------------------------------------------------------------- |
| Client/workspace management | ✅     | Create, list, activate/suspend clients                                                 |
| Membership/RBAC             | ✅     | Create memberships, assign roles (PlatformAdmin, Operator, Reviewer), activate/suspend |
| Record CRUD                 | ✅     | Create, list, view, edit (Draft only by creator)                                       |
| Workflow states             | ✅     | Draft → UnderReview → Approved → Archived; Return (UnderReview → Draft)                |
| Role-gated actions          | ✅     | Submit: Operator+; Approve/Return: Reviewer+; Archive: PlatformAdmin only              |
| Document upload             | ✅     | Upload to Draft records; PDF/XLSX/DOCX/JPG/PNG/CSV; 20MB limit                         |
| Document download           | ✅     | Via `/api/workflowos/documents/[id]/download`                                          |
| Document delete             | ✅     | PlatformAdmin only                                                                     |
| PDF export                  | ✅     | Via `/api/workflowos/clients/[id]/records/[id]/export/pdf`; only after approval        |
| Audit trail                 | ✅     | All mutations logged to `sunbulAuditEvent`; visible in record detail                   |
| Review history              | ✅     | Review panel showing all reviews with notes                                            |
| Empty/loading/error states  | ✅     | Every component handles all three                                                      |
| Arabic-first RTL UX         | ✅     | Fully bilingual                                                                        |

## Security / Auth / Audit

- All route pages protected by `src/middleware.ts` auth middleware (JWT required)
- Layout-level auth guard in `/workflowos/layout.tsx`
- Admin route additionally checks `user.role === "ADMIN"`
- API routes: `getCurrentUser()` + `requireClientAccess()` (tenant isolation)
- Audit logging via `createWorkflowAuditEvent` for all mutations
- Download/export API routes: auth + RBAC + tenant check + audit trail

## Deferred Gaps (P2+)

| Gap                            | Priority | Reason                             |
| ------------------------------ | -------- | ---------------------------------- |
| Record assignment/routing      | P2       | Requires `assigneeId` schema field |
| Search/filter on record list   | P3       | Enhancement, not blocker           |
| Notifications on submit/return | P3       | Enhancement, not blocker           |
| Dashboard per-client metrics   | P3       | Basic counts exist, can expand     |

## Explicit No-Go Items

| Item                                           | Rationale                                                           |
| ---------------------------------------------- | ------------------------------------------------------------------- |
| Prisma schema rename (`Sunbul*` → `Workflow*`) | Migration risk, no operational need. TypeScript aliases sufficient. |
| Assignment schema (`assigneeId`)               | Requires Prisma change — not needed for v0.1 CRUD flow.             |
| Notifications infrastructure                   | Cross-cutting feature — not in v0.1 scope.                          |
| AI automation                                  | Violates trust principle (AI assists, human decides).               |

## Identity Note

WorkflowOS is a governed **workspace under AQLIYA**, not a standalone product. It shares the AQLIYA Core platform (auth, RBAC, audit, storage, export). It is not AuditOS, not a CRM, not a chatbot. It is a governed record management workflow with evidence, review, and audit trail.

---

## v0.1 Completion Checklist

- [x] Canonical routes at `/workflowos/*` and `/api/workflowos/*`
- [x] Legacy redirect aliases at `/sunbul/*`
- [x] Full CRUD with workflow states
- [x] Role-gated actions (RBAC)
- [x] Document upload/download/delete
- [x] PDF export after approval
- [x] Review/return with notes
- [x] Audit trail for all mutations
- [x] Arabic-first RTL UX
- [x] Empty/loading/error states
- [x] Tenant isolation via `requireClientAccess`
- [x] No stale `/api/sunbul/` or `/sunbul/` links in components
- [x] No user-facing Arabic "سنبل" strings in components
- [x] Docs aligned with code reality
- [x] Build/tsc/lint pass

## Next Lowest-Load Step

Run a feature-specific workflow test (create record → upload document → submit → approve → export PDF) to verify the complete flow end-to-end. No code changes required.
