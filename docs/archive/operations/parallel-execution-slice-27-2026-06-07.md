# Slice 27 — OAuth invite-only (L0-05 partial)

**Date:** 2026-06-07  
**Baseline:** `b72d82a`

## Delivered

| ID | Deliverable |
| -- | ----------- |
| **AUTH** | Conditional OAuth providers (Google, GitHub, Azure AD, Okta) |
| **GOV** | `oauth-invite-only.ts` — deny OAuth if email not in DB |
| **UI** | Login page OAuth buttons via `sso-login-actions.ts` |
| **DOC** | `sso-enterprise-decision.md` — Partial (honest) |
| **ENV** | `.env.example` OAuth vars documented |

## Explicitly not shipped

| Item | Reason |
| ---- | ------ |
| `PrismaAdapter` + Account/Session tables | Avoids large schema WIP (CRM/ERP/SCIM) |
| `SsoProvider` model migration | Future enterprise slice |
| SCIM `/api/scim` routes | Separate slice |

## Validation

| Command | Result |
| ------- | ------ |
| `npm test -- src/lib/auth/__tests__/oauth-invite-only.test.ts` | **PASS** (3) |
| `npx tsc --noEmit` | **PASS** |

**Status:** DONE_WITH_CONCERNS (no live OAuth provider test without keys)
