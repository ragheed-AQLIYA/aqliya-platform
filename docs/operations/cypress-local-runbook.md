# Cypress Local E2E Runbook

**Updated:** 2026-06-04

## Prerequisites

```powershell
npm run build
npm run start:standalone   # loads repo .env into standalone process
npx prisma db seed         # eng-gulf-2025 + admin user
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
| Standalone + Cypress cookie restore | Verify `cy.visit('/audit')` after login; may need `next dev --webpack` for full E2E |
| Marketing pages 500 on some routes | Track in QA; `smoke:local` covers critical paths |
| `staging.aqliya.ai` | `npm run staging:probe` — DNS still operator-owned |

## Automated sampling (no browser)

```bash
npm test -- src/lib/audit/__tests__/sampling-engine.test.ts
npm test -- src/lib/audit/__tests__/audit-sampling-action.test.ts
```

**Label:** sampling engine = **automated PASS**; full Cypress sampling = **conditional** until session/auth stable on standalone.
