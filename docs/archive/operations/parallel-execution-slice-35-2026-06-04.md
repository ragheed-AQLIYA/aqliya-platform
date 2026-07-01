# Slice 35 — Cypress E2E green (sampling + API login + MFA e2e mode)

**Date:** 2026-06-04  
**Baseline:** `6795922`

## Root cause

ADMIN users hit **MFA middleware** → redirect to `/settings/mfa` before `/audit/.../sampling`.

## Fixes

| Fix | File |
| --- | ---- |
| API login (CSRF cookie + credentials callback) | `cypress/support/commands.ts` |
| `start:standalone --e2e` clears `MFA_REQUIRED_ROLES` | `scripts/platform/start-standalone.mjs` |
| `npm run start:standalone:e2e`, `auth:smoke-local` | `package.json` |
| CSRF probe with cookie jar | `scripts/platform/test-auth-csrf-login.mjs` |

## Validation (with `start:standalone:e2e`)

| Spec | Result |
| ---- | ------ |
| `audit-sampling.cy.ts` | **3/3 PASS** |
| `auth:smoke-local` | **PASS** |

**Status:** DONE
