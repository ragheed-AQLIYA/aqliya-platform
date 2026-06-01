# AQLIYA Production Readiness Checklist (honest gates)

**Status:** production **no-go** as of 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**Principle:** evidence governs — no fake green

---

## Gate 1 — Build

| Check | Status | Evidence |
|-------|--------|----------|
| `npx next build --webpack` | **FAIL** | Webpack compile OK; TypeScript phase fails (~169 errors in LocalContent/platform graph) |
| `npx tsc --noEmit` (full repo) | **FAIL** | Residual non-critical paths |
| Dev compile (sales/auth routes) | **PASS** | Authenticated curl smoke 6/6 |

**Human action:** Run build alone after `Remove-Item .next\lock`; do not run `npm run dev` concurrently.

---

## Gate 2 — Database

| Check | Status | Evidence |
|-------|--------|----------|
| Shared DB `aqliya` drift | **BLOCKED** | Use pilot only |
| Pilot DB `aqliya_pilot` | **PASS** | 18/18 migrations, seed, backfills |
| `scripts/check-db-drift.ts` | **PASS** | `SunbulClient.platformOrganizationId`; 11 Sales tables |

---

## Gate 3 — Auth & smoke

| Check | Status | Evidence |
|-------|--------|----------|
| `/login` | **PASS 200** | Unauthenticated |
| `/api/health` | **PASS 200** | |
| Authenticated curl (`scripts/smoke-auth-routes.ts`) | **PASS 6/6** | `/sales`, `/sales/deals`, `/sales/accounts`, `/sales/review`, `/workflowos`, `/audit` |
| Browser human sign-off | **NOT DONE** | Required for L6 |

**Pilot credentials:** seed user `admin@aqliya.com` — password in `prisma/seed.ts` (redact in reports).

---

## Gate 4 — Tests

| Suite | Status | Evidence |
|-------|--------|----------|
| `sales-governance.test.ts` + `sales-l5-governance.test.ts` | **11 pass / 5 fail** | Prisma mock gaps |

---

## Gate 5 — Product maturity (summary)

| Product | Pilot-ready? | Production? |
|---------|--------------|-------------|
| SalesOS | Conditional (pilot DB + curl) | **No** (build red, browser unsigned) |
| WorkflowOS | Conditional (pilot DB + curl) | **No** |
| AuditOS | Protected L5 | **No** (build graph) |
| LocalContentOS | L5 with conditions | **No** (build blockers) |
| Platform Core | Partial stubs | **No** |

---

## Gate 6 — External-only (never automate)

- [ ] PO / institutional sign-off per product
- [ ] Pen test / security review scope
- [ ] SSO + backup automation decision
- [ ] Production infra provisioning

---

## Recommended pilot bootstrap

```powershell
node scripts/create-pilot-db.mjs
# Point DATABASE_URL to aqliya_pilot in .env
npx prisma migrate deploy
npx prisma db seed
npx tsx scripts/backfill-platform-organizations.ts --apply
npx tsx scripts/backfill-sunbul-platform-org.ts --apply
npx tsx scripts/check-db-drift.ts
npx tsx scripts/smoke-auth-routes.ts
```
