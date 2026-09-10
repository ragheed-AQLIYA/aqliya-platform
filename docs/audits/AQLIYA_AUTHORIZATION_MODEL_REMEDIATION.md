# AQLIYA Authorization Model — Remediation Design

**Status:** Implementation design (code is authority after this change)  
**Date:** 2026-08-31  
**Related audit:** `docs/audits/AQLIYA_DEEP_SECURITY_AUDIT_2026-08-31.md`  
**Schema change:** None. Platform privilege is an explicit allow-list, not a new `UserRole`.

---

## Current model (before remediation)

| Concept | Implementation |
|---|---|
| Tenant | `User.organizationId` → `Organization`. Optional `Organization.platformOrganizationId` → `PlatformOrganization`. One user, one org. |
| Organization | Product org (`Organization`). |
| Workspace | `ClientWorkspace` under a `PlatformOrganization`. |
| Tenant privilege | Prisma `UserRole`: `ADMIN \| OPERATOR \| VIEWER` on the User row. |
| Platform privilege | **Does not exist.** `checkTenantAccess()` treated every `ADMIN` as cross-tenant superuser. |
| Membership | Home org FK only. No multi-org membership table for platform users. |
| Current tenant | JWT claim `organizationId` (snapshotted at login). |
| `checkTenantAccess()` | `src/lib/authorization/tenant-guard.ts` |
| `enforce()` | `src/lib/authorization/action-guard.ts` → `authorize()` |
| ADMIN interpretation | Tenant administrator **and** (incorrectly) platform superuser. |

Permission slug `platform.admin` exists in `src/lib/platform/access/seed-permissions.ts` but is **not** used by `authorize()`. Historical `require-platform-admin.ts` is not in the tree. DB `Role`/`Permission` tables are unused by the live facade.

---

## Intended model (after remediation)

```text
Request / Server Action
  → getCurrentUser()                    identity (required)
  → resolve tenant = user.organizationId
  → checkTenantAccess()                 org match UNLESS isPlatformAdmin()
  → enforce()/role permissions          action permission inside that tenant
  → product resource load + org compare (defense in depth)
  → Prisma query scoped to that tenant
```

### Tenant ADMIN

```text
ADMIN inside the user's authorized organization
  ALLOW: resources where resource.organizationId === user.organizationId
  DENY:  every other organization
  DENY:  platform-global jobs (outbox drain, unscoped retention, unscoped escalation)
```

### Platform admin

```text
isPlatformAdmin(user)
  = user.id in PLATFORM_ADMIN_USER_IDS
    OR user.email (lowercase) in PLATFORM_ADMIN_EMAILS
```

This is **not** a new Prisma role. Tenant ADMIN cannot mint platform admins (invites cannot write the env allow-list). Empty allow-list ⇒ no platform admin (fail closed).

Platform admin may:

- Cross-tenant `checkTenantAccess` (explicit exception)
- Run platform-scoped jobs (outbox, global retention only when they pass an explicit org or are the only callers of unscoped operational tables)
- SIEM / skills evaluate / retention of non-org tables

### Client-supplied security attributes

Never trusted as authority:

- `tenantId` / `organizationId` / `userId` / `role` / `ownerId` / `permission`

They may be **compared** to the session. They must not **replace** the session.

### Server Actions

Every exported `"use server"` function is an external entry point.

| Class | Rule |
|---|---|
| PUBLIC | Explicit allow-list only (invite accept, registration flag). |
| AUTHENTICATED | `getCurrentUser()` required. |
| TENANT-AUTHORIZED | Session org + resource org match. |
| ADMIN | Tenant `ADMIN` + tenant match. |
| PLATFORM-ADMIN | `isPlatformAdmin()` only. |
| SYSTEM-INTERNAL | Not a Server Action. `server-only` module. Job secret or platform-admin HTTP. |

---

## Invariants to implement

1. Tenant A ADMIN → Tenant A: ALLOW (for admin actions).
2. Tenant A ADMIN → Tenant B resources/users/org: DENY.
3. Tenant A ADMIN → platform administration: DENY.
4. Notifications, retention, webhooks, knowledge mining, DecisionOS gov: session tenant only.
5. Caller cannot grant a higher role than they hold. Tenant ADMIN cannot grant platform admin.
6. SSO list/get responses never include `clientSecret`.
7. User-controlled server-side URLs pass centralized SSRF validation (DNS + IP, revalidate redirects).
8. AI `generate()` applies `authorizeAIAction` using session identity/org, not prompt text.
9. Platform-global operator APIs (`enterprise-health`, `monitoring/health`, `skills/evaluate`, eval-gate thresholds, retention catalog/history, evidence health, event registry) and operator Server Actions (outbox process/retry, enterprise health snapshot) require `isPlatformAdmin()`. Tenant ADMIN may read tenant-scoped metrics, cache warm, AI spend/governance, org-bound retention policies/holds, and SIEM export for `user.organizationId`.
10. SCIM cannot assign `ADMIN` unless `SCIM_ALLOW_ADMIN_ROLE=true`.
11. Middleware is default-deny. Public routes live in `src/lib/auth/public-paths.ts`.
12. JWT role/org is refreshed from the database at least hourly; default maxAge is 12 hours.
