# Slice 28 — L0-05/06 SSO config + SCIM API (enterprise foundation)

**Date:** 2026-06-07  
**Baseline:** `764f3dc`

## Delivered (shipped)

| ID | Deliverable |
| -- | ----------- |
| **Schema** | `SsoProvider`, `Account`, `Session`, `VerificationToken`, `ScimProvisioningEvent` + User OAuth fields |
| **Migration** | `20260608120000_l0_05_sso_scim` (SSO/SCIM tables only) |
| **SCIM** | `/api/scim/v2/Users`, `/Groups` + Bearer auth + audit events |
| **SSO admin** | `sso-service`, `sso-admin-actions`, `/settings/sso` UI |
| **Middleware** | Public `/api/scim` prefix for Bearer auth |
| **TEST** | `scim-auth.test.ts` (3) |

## Schema note (not deployed in this migration)

`CrmConnection` / `ErpConnection` models exist in `schema.prisma` for WIP S7-03/LC-08 code on disk — **no CRM/ERP migration** in slice 28.

## Validation

| Command | Result |
| ------- | ------ |
| `npx prisma validate` | PASS |
| `npx prisma generate` | PASS |
| `npx tsc --noEmit` | PASS |
| `npm test -- scim-auth` | PASS (3) |

## Still operator / vendor

| Item | Owner |
| ---- | ----- |
| Cycle 6 remote | Ops |
| `migrate deploy` on staging | Ops |
| SAML / LDAP | Future |
| Live OAuth/SCIM keys | Env |

**Status:** DONE_WITH_CONCERNS
