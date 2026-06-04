# Enterprise SSO — Decision Record (L0-05)

**Date:** 2026-06-07 (updated)  
**Status:** **Partial** — conditional OAuth invite-only in repo; enterprise SAML/LDAP pending

## Current implementation (repo @ `main`)

| Capability | Status |
| ---------- | ------ |
| NextAuth v5 JWT sessions | ✅ |
| Credentials (email/password) | ✅ |
| MFA TOTP + backup codes | ✅ `/settings/mfa` |
| Google / GitHub / Azure AD / Okta OAuth | ✅ **When env vars set** — **invite-only** (user must exist in DB) |
| Login UI OAuth buttons | ✅ When provider env configured |
| `isOAuthInviteAllowed` guard | ✅ `src/lib/auth/oauth-invite-only.ts` |

## Not implemented (do not market)

- SAML 2.0
- LDAP / Active Directory
- Generic OIDC registry / `SsoProvider` DB config (schema WIP — not deployed)
- SCIM provisioning production package
- Auto-provision users on first OAuth login

## Commercial rule

- May state: “Optional OAuth sign-in for **pre-provisioned** users when configured.”
- Do **not** state: “Enterprise SSO”, “SAML”, “LDAP”, or “full IdP integration” until this record shows **Implemented** with vendor test evidence.

## Operator setup

1. Create user in DB (seed or admin invite).
2. Set provider env vars in `.env` (see `.env.example`).
3. Sign in at `/login` via provider button.

## Recommendation for first paying customer

| Option | When |
| ------ | ---- |
| Credentials + MFA | Pilot &lt; 20 users |
| OAuth invite-only | Customer has Google/Azure — users pre-created |
| SAML/OIDC enterprise | Contract requires IdP — budget 4–8 weeks after L0-05 schema + pentest |
