# Sunbul Phase 1 — Data Layer & Tenant Isolation Report

**Date:** 2026-05-18
**Status:** Complete
**Validation:** ✅ `npx tsc --noEmit` | ✅ `npm run lint` (0 errors) | ✅ `npm run build`

---

## Models Created

All models use the `Sunbul` prefix and are defined in `prisma/schema.prisma` (lines 1128–1300+).

| Model | Purpose | Key Fields |
|---|---|---|
| `SunbulClient` | Tenant/client isolation boundary | `id`, `name`, `slug` (unique), `status`, `config` (JSON) |
| `SunbulUserMembership` | Links existing `User` to `SunbulClient` with role | `clientId`, `userId`, `role` (enum), `status` (unique: clientId+userId) |
| `SunbulRecord` | Core case/record entity | `clientId`, `title`, `status` (4-state enum), `createdById`, `submittedAt`, `approvedAt`, `archivedAt` |
| `SunbulDocument` | File metadata attached to records | `clientId`, `recordId`, `fileName`, `fileType`, `fileSize`, `storageKey` |
| `SunbulReview` | Review/approve action on records | `clientId`, `recordId`, `reviewerId`, `status` (Pending/Approved/Returned), `notes` |
| `SunbulAuditEvent` | Immutable audit trail | `clientId`, `recordId?`, `actorId`, `action` (enum), `entityType`, `entityId`, `metadata` (JSON) |

**Enums added:** `SunbulUserRole` (PlatformAdmin, Operator, Reviewer), `SunbulMembershipStatus`, `SunbulRecordStatus` (Draft, UnderReview, Approved, Archived), `SunbulReviewStatus`, `SunbulAuditAction` (11 actions).

**Key design decision:** User-relation fields (`userId`, `createdById`, `uploadedById`, `reviewerId`, `actorId`) are stored as plain `String` fields without Prisma-level `@relation` decorators. This avoids modifying the existing `User` model while maintaining referential integrity at the application layer.

---

## Files Changed

| File | Change |
|---|---|
| `prisma/schema.prisma` | Added 6 models + 5 enums (lines 1128+) |
| `src/lib/sunbul/types.ts` | **New** — Type exports, input interfaces, role helpers |
| `src/lib/sunbul/tenant-guard.ts` | **New** — `requireClientAccess()`, `getUserSunbulMemberships()`, `canAccessSunbulClient()`, `requireSunbulAdmin()` |
| `src/lib/sunbul/audit.ts` | **New** — `createSunbulAuditEvent()`, `listSunbulAuditEvents()` |
| `src/lib/sunbul/services.ts` | **New** — All CRUD + workflow service functions (22 exported functions) |
| `src/actions/sunbul-actions.ts` | **New** — 18 server actions following existing `{ success, data/error }` pattern |
| `src/app/sunbul/page.tsx` | Updated status badge + Phase 1 completion notes |

**No existing files were modified** except schema.prisma (appended models) and sunbul/page.tsx (UI status update).

---

## Access Model

### `requireClientAccess(clientId, requiredRole?)`

Called at the start of every service function that touches client-scoped data.

1. Gets current user from NextAuth session via `getCurrentUser()`
2. If user is AQLIYA `ADMIN` → auto-granted PlatformAdmin access to any client
3. Otherwise, looks up `SunbulUserMembership` for the user + client
4. If no active membership → throws `"Access denied: no active Sunbul client membership"`
5. If `requiredRole` is specified, enforces role hierarchy (PlatformAdmin > Reviewer > Operator)
6. Returns user object with `sunbulRole` and `membershipId` attached

### `requireSunbulAdmin()`

Used for client management operations. Checks that the current user has AQLIYA `ADMIN` role.

### Scope rules

- **Platform Admin** (AQLIYA `ADMIN` role): Can access any client. Can create clients, manage memberships. Cannot create/review/approve records.
- **Operator**: Can create/edit/submit records they own. Document upload. View own records.
- **Reviewer**: Can view ALL records in their client. Can approve/return. Cannot create or edit records.

---

## Permission Model

| Action | Platform Admin | Operator | Reviewer |
|---|---|---|---|
| Create client | ✅ | — | — |
| List all clients | ✅ | — | — |
| View own client | ✅ | ✅ | ✅ |
| Invite user to client | ✅ | — | — |
| Create record | — | ✅ | — |
| Edit own draft | — | ✅ | — |
| Submit for review | — | ✅ | — |
| Review/Approve/Return | — | — | ✅ |
| Archive approved record | — | ✅ (own) | — |
| Upload document | — | ✅ | — |
| View record list | ✅ | ✅ (own) | ✅ |
| View audit events | ✅ | — | ✅ |

---

## Workflow Statuses Implemented

| Status | Transition | Allowed By |
|---|---|---|
| **Draft** | → UnderReview (submit) | Operator |
| **UnderReview** | → Approved (approve) | Reviewer |
| **UnderReview** | → Draft (return) | Reviewer |
| **Approved** | → Archived (archive) | Operator (own) |
| **Archived** | — (terminal) | — |

**Returned**: The "return" action transitions directly back to Draft, consistent with the Product Definition Lock. A `SunbulReview` record with status `Returned` is created to document the reason.

---

## Audit Events

Every create/update/status-transition function writes a `SunbulAuditEvent` with:

- `clientId` — always scoped
- `recordId` — when applicable
- `actorId` — from the authenticated user
- `action` — typed enum (11 values)
- `entityType` / `entityId` — polymorphic reference
- `metadata` — contextual JSON (previous/new status, changes, notes)

---

## Migration Status

Migration **has been applied** to the local PostgreSQL database.

| Step | Status | Details |
|---|---|---|
| Migration SQL file | ✅ Created | `prisma/migrations/20260518220001_sunbul_phase1/migration.sql` |
| Migration marked as applied | ✅ Resolved | `prisma migrate resolve --applied 20260518220001_sunbul_phase1` |
| Tables verified in DB | ✅ 6 tables | `SunbulClient`, `SunbulUserMembership`, `SunbulRecord`, `SunbulDocument`, `SunbulReview`, `SunbulAuditEvent` |
| Migration history clean | ✅ | `prisma migrate status` reports "Database schema is up to date!" |

For new environments (CI, staging, production), run:

```bash
npx prisma migrate deploy
```

This will apply all migrations including `sunbul_phase1`.

---

## Validation Results

| Check | Result |
|---|---|
| `npx prisma generate` | ✅ Generated Prisma Client v7.8.0 |
| `npx tsc --noEmit` | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors (128 pre-existing warnings — documented in PRODUCT_STATUS_MATRIX.md) |
| `npm run build` | ✅ Compiled successfully. `/sunbul` listed as static route. |

---

## Known Limitations

1. **No User model relations** — `userId`, `createdById`, etc. are plain String fields. Queries that need user info must either join manually via `prisma.user.findMany()` or fetch separately.
2. **No migration run** — `prisma migrate dev` must be executed in a development/staging environment with PostgreSQL access.
3. **No file upload implementation** — `createSunbulDocumentMetadata` stores metadata only. Actual file upload to storage requires Phase 2.
4. **Single-client user scope** — MVP assumes one client per user (enforced by `listSunbulClientsForUser`). Cross-client membership works at the data model level but is not tested.
5. **No UI yet** — Only the route shell is updated. Full workflow UI is Phase 2.
6. **No automatic reviewer assignment** — Records transition directly from Draft to UnderReview without an intermediate "assign reviewer" step. Any Reviewer in the client can approve.
7. **Last-save-wins concurrency** — No optimistic locking or concurrent edit prevention.

---

## Next Recommended Phase

**Phase 2: Workspace Shell + Client Dashboard UI**

1. Add Sunbul module to `platform-sidebar.tsx` navigation
2. Build Platform Admin client management UI (create client, invite users)
3. Build Operator record list + create form
4. Build Reviewer review queue
5. Implement document upload (real file storage or local filesystem)
6. Connect all UI to `src/actions/sunbul-actions.ts` server actions
7. Add role-aware navigation (hide admin pages from non-admins)
