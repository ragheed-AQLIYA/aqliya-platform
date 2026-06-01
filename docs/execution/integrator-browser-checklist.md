# SalesOS L6 — Integrator Browser Checklist

**Branch:** `feature/salesos-l6-unblock`  
**DB:** `aqliya_pilot`  
**Credentials:** seed user `admin@aqliya.com` (password in `prisma/seed.ts` — do not paste in tickets)

**Principle:** Agent/curl evidence ≠ institutional human sign-off. PO must physically sign below.

---

| Route | Curl smoke | Agent browser | Human evidence (screenshot / notes) | Human signature |
|-------|------------|---------------|-------------------------------------|-----------------|
| `/login` | — | | | |
| `/sales` | | | | |
| `/sales/deals` | | | | |
| `/sales/accounts` | | | | |
| `/sales/review` | | | | |
| `/workflowos` | | | | |
| `/audit` | | | | |
| `/local-content` | | | | |
| `/local-content/command-center` | | | | |

---

## Gates (integrator)

- [ ] `npx next build --webpack` — exit 0
- [ ] `npm test -- --testPathPatterns="sales-governance|sales-l5-governance"` — 16/16
- [ ] `npx tsx scripts/smoke-auth-routes.ts` — 8/8 (against `next start` or stable dev)
- [ ] GitHub Actions **Pilot CI** green on PR
- [ ] AuditUser for `admin@aqliya.com` present (`/audit` not empty fallback)

**Production:** no-go until human signatures above + CI green on GitHub.
