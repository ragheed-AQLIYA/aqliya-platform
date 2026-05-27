---
name: aqliya-security-gate
description: Security inspection gate for AQLIYA. Checks auth, proxy, API routes, download routes, tenant isolation, RBAC, audit trail, and forbidden changes before any mutation.
---

# AQLIYA Security Gate

> **Purpose:** Prevent security regressions by checking auth coverage, RBAC enforcement, tenant isolation, audit logging, and protected routes before every non-trivial change.

---

## 1. Mandatory Security Checks (Pre-Mutation)

Before modifying or creating any:

- API route (`src/app/api/`)
- Server Action (`src/actions/`)
- Download/export handler
- Middleware (`src/middleware.ts`)
- Dashboard or workspace page

### Check 1: Auth Coverage

```
Is the route behind authentication?
  ├── middleware.ts session check?
  ├── route handler session check?
  ├── Server Action session check?
  └── Client component redirect if unauthenticated?
```

### Check 2: Tenant Isolation

```
Does the mutation enforce organizationId?
  ├── Prisma query includes organizationId filter?
  ├── Server Action validates organization membership?
  ├── Route handler scopes data to user's organization?
  └── No cross-tenant data leak possibility?
```

### Check 3: RBAC

```
Does the operation check user role?
  ├── Admin-only routes guard with role check?
  ├── Viewer role cannot mutate?
  ├── Reviewer role has appropriate scope?
  └── Role is checked server-side (not just UI)?
```

### Check 4: Audit Trail

```
Does the mutation log to AuditEvent?
  ├── Every create/update/delete is logged?
  ├── Log includes: who, what, when, organization, resource type, resource ID?
  └── Sensitive actions include before/after state?
```

### Check 5: Download/Export Route

```
Does the export/download route:
  ├── Require authentication?
  ├── Verify file ownership/permissions?
  ├── Log the download event?
  └── Prevent path traversal (../../etc/passwd)?
```

---

## 2. Protected Files (Do Not Modify Without Approval)

| File                               | Reason                                                 |
| ---------------------------------- | ------------------------------------------------------ |
| `src/middleware.ts`                | Auth/redirect/proxy logic — breaking this breaks login |
| `src/auth.ts`, `src/app/api/auth/` | Auth configuration                                     |
| `prisma/schema.prisma`             | Database schema — migration-impacting                  |
| `.env`, `.env.example`             | Secrets structure                                      |
| `next.config.mjs`                  | Build/redirect/header configuration                    |
| `docker-compose.yml`, `Dockerfile` | Deployment configuration                               |

### Exception: If a task explicitly targets these files for a security fix or auth hardening, you may modify them after:

1. Reading the entire file
2. Understanding the existing auth flow
3. Creating a decision brief (D<N> format from AGENTS.md §30.1)
4. Getting explicit approval

---

## 3. Forbidden Changes Without Clear Report

- Bypassing auth for any route
- Removing `organizationId` filter from queries
- Exposing download routes without permission checks
- Adding public API endpoints that access private data
- Removing audit event logging
- Changing middleware rewrite/proxy rules
- Exposing environment variables to client

---

## 4. Security Regression Detection

After any change to auth/proxy/middleware:

1. `git status` to see what auth files changed
2. `git diff src/middleware.ts` to inspect middleware changes
3. Verify that auth-protected routes still 401/redirect without session
4. Verify that demo routes (/auditos) still function without auth
5. Verify that download routes check permissions
6. Report any regression immediately

---

## 5. Demo Route Safety (see also: aqliya-demo-safety)

The `/auditos` demo route must:

- Never access real customer data
- Use mock/sample data only
- Not require authentication
- Not expose upload or download functionality
- Not expose real API keys or database credentials

Any change touching `/auditos` must pass the demo safety gate first.

---

## 6. Auth Middleware Quick Reference

Current auth middleware pattern:

- `middleware.ts` redirects unauthenticated users to `/auth/login`
- API routes check `session?.user?.id`
- Server Actions call `auth()` or `getServerSession()`
- Demo route is excluded from middleware via `matcher` config

Do not change this pattern without decision brief + approval.
