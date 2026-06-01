# AQLIYA Production Readiness Checklist (honest gates)

**Status:** production **no-go** as of 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**Principle:** evidence governs — no fake green

---

## Gate 1 — Build

| Check | Status | Evidence |
|-------|--------|----------|
| `npx next build --webpack` | **FAIL / in progress** | TSC progressed through sales-actions; remaining LocalContent + webpack graph errors possible; parallel build+dev can corrupt `.next` |
| `npx tsc --noEmit` (full repo) | **FAIL** | Residual errors in audit-vnext pages, platform org actions, non-critical paths |

**Human action:** Run build alone after `Remove-Item .next -Recurse`; do not run `npm run dev` concurrently.

---

## Gate 2 — Database

| Check | Status | Evidence |
|-------|--------|----------|
| `npx prisma migrate deploy` on shared DB | **BLOCKED** | B1 drift — no `_prisma_migrations` history |
| Pilot DB (`aqliya_pilot`) | **Recommended** | `migrate deploy` + `db seed` + backfill scripts |
| `scripts/seed-sales-demo.ts` | **PASS** | Idempotent — pipeline, 3 accounts, 3 deals seeded |

---

## Gate 3 — Auth & smoke

| Check | Status | Evidence |
|-------|--------|----------|
| `/login` page | **BLOCKED** (env) | 500 when `.next/dev` corrupted by parallel build; auth config OK in repo |
| Authenticated `/sales/*` | **NOT VALIDATED** | Session curl blocked by dev instability |
| `/api/health` | **FAIL** during corruption | 500 with missing routes-manifest |

**Pilot credentials:** seed user `admin@aqliya.com` — password in seed only (not committed).

---

## Gate 4 — Tests

| Suite | Status | Evidence |
|-------|--------|----------|
| `sales-governance.test.ts` | **Partial** | Core governance rules pass; prisma mocks vary |
| `sales-l5-governance.test.ts` | **Partial** | 11 pass / 5 fail (mock/table-missing cases) |

---

## Gate 5 — Product maturity (summary)

| Product | Pilot-ready? | Production? |
|---------|--------------|-------------|
| AuditOS L5 | Yes (protect) | No — build/tsc debt |
| SalesOS L5 | Conditional | No |
| WorkflowOS | Conditional | No — Sunbul column drift on shared DB |
| LocalContentOS | Conditional | No |
| Platform Core | Partial stubs | No |

---

## Gate 6 — External-only (never automated)

- [ ] PO / institutional sign-off per product
- [ ] Penetration test / security review
- [ ] SSO / IdP integration decision
- [ ] Production infra + backup DR drill
- [ ] Bilingual UX human review

---

## Recommended pilot DB bootstrap

```powershell
# Create DB: CREATE DATABASE aqliya_pilot;
# Point .env DATABASE_URL to aqliya_pilot
npx prisma migrate deploy
npx prisma db seed
$env:SEED_SALES_DEMO="1"; npx prisma db seed   # or: npx tsx scripts/seed-sales-demo.ts
npx tsx scripts/backfill-platform-organizations.ts --apply
npx tsx scripts/backfill-sunbul-platform-org.ts --apply
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm run dev
```
