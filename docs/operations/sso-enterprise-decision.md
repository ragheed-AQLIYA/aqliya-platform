# Enterprise SSO — Decision Record (L0-05 / L0-06)

**Date:** 2026-06-07 (updated)  
**Status:** **Partial** — OAuth invite-only + org SSO registry + SCIM v2 API (API-key gated)

## Implemented in repository

| Capability | Status | Evidence |
| ---------- | ------ | -------- |
| Credentials + JWT | ✅ | `auth-config.ts` |
| MFA TOTP | ✅ | `/settings/mfa` |
| OAuth (Google/GitHub/Azure/Okta) via env | ✅ | Invite-only — `oauth-invite-only.ts` |
| Org `SsoProvider` CRUD | ✅ | `sso-service.ts`, `/settings/sso` |
| SCIM v2 Users/Groups | ✅ | `/api/scim/v2/*`, `scim-service.ts` |
| SCIM auth | ✅ | `SCIM_API_KEY` + `SCIM_DEFAULT_ORG_ID` |
| Migration | ✅ | `20260608120000_l0_05_sso_scim` |

## Not implemented (do not market)

- SAML 2.0 end-to-end login flow
- LDAP / Active Directory bind
- Auto-provision on OAuth (SCIM may create users; OAuth may not)
- Full enterprise IdP certification / pentest sign-off

## Commercial rules

| OK to say | Not OK |
| --------- | ------ |
| Optional OAuth for pre-provisioned users | “Full enterprise SSO suite” |
| SCIM provisioning when API key configured | “SAML/LDAP ready” without evidence |
| SSO provider registry per organization | Production L6 without Cycle 6 + pentest |

## Operator quick start

**OAuth:** seed user → set `AUTH_*` env → `/login`

**SCIM:**

```bash
# .env
SCIM_API_KEY=<long-random>
SCIM_DEFAULT_ORG_ID=<organization-cuid>
npx prisma migrate deploy
curl -H "Authorization: Bearer $SCIM_API_KEY" https://<host>/api/scim/v2/Users
```

**SSO registry:** `/settings/sso` (admin) after migration
