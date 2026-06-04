# Platform Server Action Guards

**Updated:** 2026-06-05  
**Purpose:** CI guard script semantics and platform tenant action security model.

## CI script

Run: `node scripts/audit-action-guards.mjs`

Recognized guard signals:

- `requireServerActionAccess` (unified Core access)
- `requireUserContext` / `requireEnabled` (platform tenant flows)
- Product guards: `getAuditActor`, `assertEngagementAccess`, `assertProjectAccess`, etc.

File-level guard detection: at least one recognized pattern must appear in the module.
Per-export analysis is documented in `docs/validation/testing/TEST_COVERAGE_AUDIT.md` (known gap).

Public-by-design flows in `registration-actions.ts`:

- `registerTenantAction` — `requireEnabled("tenant.self-service")` + validation (no session)
- `verifyInvitationAction` / `acceptInvitationAction` — token-hash invitation flows

## Tenant actions (`tenant-actions.ts`)

- Gated by `tenant.lifecycle` feature flag (default **off** unless `FF_TENANT_LIFECYCLE=true`).
- Mutations require `requireUserContext("ADMIN")`.
- Reads/writes are scoped to the actor's `platformOrganizationId` (no cross-tenant platform org IDOR).

## Registration actions (`registration-actions.ts`)

- Self-service signup gated by `tenant.self-service` (default on unless `FF_TENANT_SELF_SERVICE=false`).
- Team invite/list flows use `requireUserContext` with role checks.
- Invitation accept/verify are token-hash gated public flows.
