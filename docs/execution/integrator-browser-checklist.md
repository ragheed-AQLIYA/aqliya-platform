# SalesOS L6 — Integrator Browser Checklist

**Branch:** `feature/salesos-l6-unblock`  
**DB:** `aqliya_pilot`  
**Credentials:** seed user `admin@aqliya.com` (password in `prisma/seed.ts` — do not paste in tickets)

**Principle:** Agent/curl evidence ≠ institutional human sign-off. PO must physically sign below.

---

| Route | Curl smoke | Agent browser | Human evidence (screenshot / notes) | Human signature |
|-------|------------|---------------|-------------------------------------|-----------------|
| `/login` | — | FAIL (MCP form fill) | | |
| `/sales` | PASS 8/8 batch | NOT RUN | | |
| `/sales/deals` | PASS 8/8 batch | FAIL (session redirect) | | |
| `/sales/accounts` | PASS 8/8 batch | NOT RUN | | |
| `/sales/review` | PASS 8/8 batch | NOT RUN | | |
| `/workflowos` | PASS 8/8 batch | NOT RUN | | |
| `/audit` | PASS 8/8 batch | PASS (engagement tasks) | | |
| `/local-content` | PASS 8/8 batch | PASS (empty projects OK) | | |
| `/local-content/command-center` | PASS 8/8 batch | NOT RUN | | |

---

## Gates (integrator)

- [ ] `npx next build --webpack` — exit 0
- [ ] `npm test -- --testPathPatterns="sales-governance|sales-l5-governance"` — 16/16
- [ ] `npx tsx scripts/smoke-auth-routes.ts` — 8/8 (against `next start` or stable dev)
- [ ] GitHub Actions **Pilot CI** green on PR
- [ ] AuditUser for `admin@aqliya.com` present (`/audit` not empty fallback)

**Production:** no-go until human signatures above + CI green on GitHub.
