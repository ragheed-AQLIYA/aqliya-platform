# Slice 34 — Cypress sampling + standalone .env

**Date:** 2026-06-04  
**Baseline:** `32d2677`

## Delivered

| ID | Deliverable |
| -- | ----------- |
| **OPS** | `start-standalone.mjs` loads root `.env` via dotenv |
| **QA** | `cypress/e2e/audit-sampling.cy.ts` — browser smoke spec |
| **QA** | `cy.loginAdmin()` session in `cypress/support/commands.ts` |
| **QA** | `npm run cy:local` |
| **DOC** | `cypress-local-runbook.md` |

## Validation

| Check | Result |
| ----- | ------ |
| Sampling unit tests | **PASS** (7) |
| `auth-flow` Cypress | **8/9** (operator login flaky) |
| `audit-sampling` Cypress | **FAIL** — visit/auth on standalone (documented) |
| `staging:probe` | **DNS FAIL** |

**Status:** DONE_WITH_CONCERNS
