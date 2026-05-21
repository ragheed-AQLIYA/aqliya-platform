# Production Auth Provisioning

## Overview

AuditOS authenticates users via NextAuth (Credentials provider) against the `User` table. For AuditOS operations, session users must have a corresponding `AuditUser` record in the `AuditUser` table.

## How Auth Flows

```
Request → NextAuth session → getCurrentUser() → getAuditActor()
                                                 ↓
                                     Lookup AuditUser by email + org
                                                 ↓
                                     Found? → Return AuditActor
                                     Not found? → Error: "Audit user not provisioned"
```

## AuditUser Fields

| Field            | Required | Description                                    | Source                        |
| ---------------- | -------- | ---------------------------------------------- | ----------------------------- |
| `id`             | Auto     | CUID                                           | Generated                     |
| `organizationId` | Yes      | Links to AuditOrganization                     | From session user's org       |
| `email`          | Yes      | User email                                     | From session user             |
| `name`           | Yes      | Display name                                   | From session user             |
| `role`           | Yes      | admin / operator / reviewer / partner / viewer | Mapped from session user role |
| `status`         | Yes      | active / inactive                              | Default: active               |
| `lastLoginAt`    | No       | Auto-updated                                   | Updated each login            |

## Role Mapping

| Session User Role | AuditUser Role | Permissions                                         |
| ----------------- | -------------- | --------------------------------------------------- |
| ADMIN             | admin          | Full access: create, upload, draft, review, approve |
| OPERATOR          | operator       | Create, upload, draft (cannot approve)              |
| VIEWER            | viewer         | Read-only                                           |

## Provisioning Methods

### 4. Admin UI (Production)

An Admin Users page is available at `/audit/admin/users` (requires admin role).

Features:

- List all audit users in your organization
- Create/provision new audit users
- Update user roles
- Deactivate users
- Organization-scoped (admins see only their org's users)
- All actions recorded as AuditEvents

### 1. Auto-provisioning (Development/Demo)

`ensureAuditUserProvisioned()` creates an AuditUser from the session user if none exists.

```ts
import { ensureAuditUserProvisioned } from "@/lib/audit/actor-context";

const actor = await ensureAuditUserProvisioned();
```

This function is safe to call in development. In production, provisioning should happen through the admin workflow below.

### 2. Manual provisioning (Production)

An admin creates the AuditUser record directly. The session user and AuditUser are linked by email + organizationId.

```sql
INSERT INTO "AuditUser" (id, "organizationId", email, name, role, status)
VALUES (
  gen_random_uuid()::text,
  '<organization-id>',
  '<user-email>',
  '<user-name>',
  '<role>',
  'active'
);
```

### 3. Via Seed Data

`npm run seed:audit` creates AuditUser records for all demo users. See `prisma/seed-audit.ts`.

## Production Behavior

- `getAuditActor()` **never falls back to demo** in production
- If no session → throws `"Authentication required"`
- If session user has no AuditUser → throws `"Audit user not provisioned"`
- If AuditUser is inactive → throws `"Audit user status is <status>"`

## Development Behavior

- If no session or no AuditUser → returns demo fallback actor
- Demo actor: `"Ahmed Al Ghamdi"`, role: `"operator"`, org: `"org-aqliya"`
- `isUsingDemoFallback()` returns `true` when demo fallback is active

## Error Messages

| Scenario                | Error                                                     |
| ----------------------- | --------------------------------------------------------- |
| No session (production) | "Authentication required"                                 |
| No AuditUser mapping    | "Audit user not provisioned"                              |
| Inactive AuditUser      | "Audit user status is inactive"                           |
| Role denied             | "Access denied: operator role cannot perform this action" |

## Testing

1. Ensure a session user has a matching AuditUser record
2. Call `getAuditActor()` — should return the AuditUser's info
3. Remove the AuditUser — should throw "Audit user not provisioned"
4. In development without session — should return demo fallback
5. Set NODE_ENV=production without session — should throw

## Files

| File                             | Purpose                                   |
| -------------------------------- | ----------------------------------------- |
| `src/lib/auth.ts`                | Session user resolution                   |
| `src/lib/auth-config.ts`         | NextAuth configuration                    |
| `src/lib/audit/actor-context.ts` | AuditActor resolution + AuditUser mapping |
| `prisma/schema.prisma`           | `AuditUser` model definition              |
