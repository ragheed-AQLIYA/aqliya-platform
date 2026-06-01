# AQLIYA Production Readiness Checklist (honest gates)

**Status:** production **no-go** as of 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**Principle:** evidence governs — no fake green

---

## Gate 1 — Build

| Check | Status | Evidence |
|-------|--------|----------|
| `npx next build --webpack` | **FAIL** | Residual LocalContent vnext (`buildPublishingGate`), platform access (`validateProductActionAccess`), sales brief export graph |
| `npx tsc --noEmit` (full repo) | **FAIL** | Dev compiles core routes; full repo has audit/local-content/platform debt |
| Dev compile (Turbopack) | **PASS** | `/sales/*`, `/workflowos`, `/audit` render after fixes |

**Human action:** Run build alone after `Remove-Item .next -Recurse`; do not run `npm run dev` concurrently.

---

## Gate 2 — Database

| Check | Status | Evidence |
|-------|--------|----------|
| Shared DB `aqliya` migrate | **BLOCKED** | B1 drift — use pilot only |
| Pilot DB `aqliya_pilot` | **PASS** | 18/18 migrations, seed, backfills |
| `scripts/check-db-drift.ts` | **PASS** | `SunbulClient.platformOrganizationId`; 11 Sales tables |
| `scripts/create-pilot-db.mjs` | **ADDED** | Idempotent CREATE DATABASE helper |

---

## Gate 3 — Auth & smoke

| Check | Status | Evidence |
|-------|--------|----------|
| `/login` | **PASS 200** | Client page loads |
| `/api/health` | **PASS 200** | |
| Authenticated curl smoke | **PASS 6/6** | `scripts/smoke-auth-routes.ts` — `/sales`, `/sales/deals`, `/sales/accounts`, `/sales/review`, `/workflowos`, `/audit` |
| Browser human sign-off | **NOT DONE** | Required for L6 |

**Pilot credentials:** seed user `admin@aqliya.com` — password in `prisma/seed.ts` only (not repeated here).

---

## Gate 4 — Tests

| Suite | Status | Evidence |
|-------|--------|----------|
| `sales-governance.test.ts` | **Partial** | Included in 11/16 aggregate |
| `sales-l5-governance.test.ts` | **Partial** | 11 pass / 5 fail — prisma mock gaps |

---

## Gate 5 — Product maturity (summary)

| Product | Pilot-ready? | Production? |
|---------|--------------|-------------|
| AuditOS L5 | Yes (protect) | **No** — build graph + browser sign-off pending |
| SalesOS L5 | **Conditional** on pilot DB | **No** — build red |
| WorkflowOS | **Conditional** on pilot DB | **No** |
| LocalContentOS | Conditional | **No** — build blockers |
| Platform Core | Partial stubs | **No** |

---

## Gate 6 — External-only (never automated)

- [ ] PO / institutional sign-off per product
- [ ] Penetration test / security review
- [ ] SSO / IdP integration decision
- [ ] Production infra + backup DR drill
- [ ] Bilingual UX human review
- [ ] Browser smoke sign-off (not curl-only)

---

## Recommended pilot DB bootstrap

```powershell
node scripts/create-pilot-db.mjs
# Update .env DATABASE_URL to postgresql://.../aqliya_pilot?schema=public
npx prisma migrate deploy
npx prisma db seed
npx tsx scripts/backfill-platform-organizations.ts --apply
npx tsx scripts/backfill-sunbul-platform-org.ts --apply
npx tsx scripts/check-db-drift.ts
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run dev
npx tsx scripts/smoke-auth-routes.ts
```
