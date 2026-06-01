# AQLIYA Production Readiness Checklist (honest gates)

**Status:** production **no-go** as of 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**Principle:** evidence governs — no fake green

---

## Gate 1 — Build

| Check | Status | Evidence |
|-------|--------|----------|
| `npx next build --webpack` | **PASS** | Phase 15 re-run: exit 0 (~98s); 70 static routes |
| `npx tsc --noEmit` (full repo) | **PASS** | 0 errors after test exclude + incremental fixes |
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
| Authenticated curl (`scripts/smoke-auth-routes.ts`) | **PASS 8/8** | Phase 16: + `/local-content`, `/local-content/command-center` |
| Browser agent evidence | **PARTIAL** | `/audit`, `/local-content` PASS; login MCP FAIL; `/sales/deals` session lost; human PO pending |
| Integrator checklist | **ADDED** | `docs/execution/integrator-browser-checklist.md` |

**Pilot credentials:** seed user `admin@aqliya.com` — password in `prisma/seed.ts` (redact in reports).

---

## Gate 3b — CI (pilot)

| Check | Status | Evidence |
|-------|--------|----------|
| .github/workflows/pilot-ci.yml | **COMMITTED** | Phase 16: file present; local simulation **PASS** (migrate, seed, build, jest, smoke 8/8) |
| GitHub Actions run | **NOT VALIDATED** | Await first green run on PR |

---

## Gate 4 — Tests

| Suite | Status | Evidence |
|-------|--------|----------|
| `sales-governance.test.ts` + `sales-l5-governance.test.ts` | **16/16 PASS** | Phase 15 re-run |

---

## Gate 5 — Product maturity (summary)

| Product | Pilot-ready? | Production? |
|---------|--------------|-------------|
| SalesOS | Conditional (pilot DB + curl + partial browser) | **No** (human sign-off pending) |
| WorkflowOS | Conditional (pilot DB + curl) | **No** |
| AuditOS | Conditional (pilot DB + curl + browser `/audit`) | **No** (human sign-off pending) |
| LocalContentOS | L5 with conditions | **No** (curl only) |
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
npx tsx scripts/ensure-audit-user-admin.ts
npx tsx scripts/smoke-auth-routes.ts
```
