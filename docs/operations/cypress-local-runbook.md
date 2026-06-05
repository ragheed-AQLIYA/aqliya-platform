# Cypress Local E2E Runbook

**Updated:** 2026-06-04

## Prerequisites

```powershell
npm run build
npm run start:standalone:e2e   # MFA_REQUIRED_ROLES cleared for E2E
npx prisma db seed             # eng-gulf-2025 + admin user
```

Terminal 2:

```powershell
npm run cy:local -- --spec cypress/e2e/audit-sampling.cy.ts
```

## Commands

| Command | Purpose |
| ------- | ------- |
| `npm run cy:local` | Run all E2E vs `http://localhost:3000` |
| `npm run cy:local -- --spec cypress/e2e/audit-sampling.cy.ts` | Sampling browser smoke |
| `npm run cy:open` | Interactive debugger |

## Known limitations (2026-06-04)

| Issue | Workaround |
| ----- | ---------- |
| `MissingCSRF` on rapid `signIn` | Use `cy.loginAdmin()` session helper |
| MFA redirect to `/settings/mfa` | Use **`npm run start:standalone:e2e`** (not plain `start:standalone`) |
| Standalone + Cypress cookie restore | Use **`cy.loginAdmin()`** (CSRF API login) in `cypress/support/commands.ts` |
| Marketing pages 500 on some routes | Track in QA; `smoke:local` covers critical paths |
| `staging.aqliya.ai` | `npm run staging:probe` — DNS still operator-owned |

## Automated sampling (no browser)

```bash
npm test -- src/lib/audit/__tests__/sampling-engine.test.ts
npm test -- src/lib/audit/__tests__/audit-sampling-action.test.ts
```

**Label:** sampling engine = **automated PASS**; full Cypress sampling = **conditional** until session/auth stable on standalone.
