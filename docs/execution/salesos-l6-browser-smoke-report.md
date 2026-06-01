# SalesOS L6 Browser Smoke Report

**Date:** 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**Validation:** light validated with conditions — **production no-go**

---

## Environment

- Dev server: `npm run dev` on port 3000 (pre-existing listener)
- DB: pilot/local PostgreSQL (`aqliya_pilot` per ops checklist)
- Credentials: `admin@aqliya.com` / password from `prisma/seed.ts` (**redacted** in reports; seed default)
- Parallel build: completed `npx next build --webpack` **exit 0** after lock cleared (Phase 15)

---

## Phase 15 — Browser smoke (cursor-ide-browser MCP)

**Label:** agent browser evidence — **not** human institutional sign-off.

| Step | Result | Evidence |
|------|--------|----------|
| `/login` page load | **PASS** | Snapshot: login form (email, password, submit) |
| Admin login (browser) | **PARTIAL** | Form submit observed; Glass session did not retain cookies on deep-link navigation to `/sales/deals` (redirect to login) |
| `/sales` (authenticated) | **PASS** | Snapshot: `SalesOS` heading, pipeline sections |
| `/sales/deals` | **FAIL** (browser session) / **PASS** (curl) | Browser: redirect to `/login?callbackUrl=...`; curl smoke **200** |
| `/sales/accounts` | **PASS** (curl) | `scripts/smoke-auth-routes.ts` **200** |
| `/sales/review` | **PASS** (curl) | curl **200** |
| `/workflowos` | **PASS** (curl) | curl **200** |
| `/audit` | **PASS** (curl) | curl **200** |
| `/local-content` | **NOT RUN** (browser) | Route exists; extend smoke script in Phase 16 |

### Authenticated curl smoke (authoritative for CI)

`npx tsx scripts/smoke-auth-routes.ts` — **6/6 PASS**; session user `admin@aqliya.com`.

| Route | HTTP | Result |
|-------|------|--------|
| `/sales` | 200 | PASS |
| `/sales/deals` | 200 | PASS |
| `/sales/accounts` | 200 | PASS |
| `/sales/review` | 200 | PASS |
| `/workflowos` | 200 | PASS |
| `/audit` | 200 | PASS |

---

## Unauthenticated smoke (historical — Phase 12)

| Route | HTTP | Result | Notes |
|-------|------|--------|-------|
| `/api/health` | 500 | **FAIL** | During `.next` corruption from parallel build |
| `/login` | 500 | **FAIL** | Same — not auth logic verified broken |
| `/sales` | 302→login | **BLOCKED** | Expected redirect when unauth |

---

## Pilot DB instructions (local)

See `docs/execution/aqliya-production-readiness-checklist.md` — use `aqliya_pilot` with full migrate deploy, not shared drifted DB.

---

## Human sign-off

**NOT DONE** — institutional PO browser sign-off pending. Phase 15 adds **agent browser + curl** evidence only.

---

## Verdict

**CONDITIONAL** — curl authenticated smoke **6/6 PASS**; production build **exit 0**; browser UI pass on `/sales` with session retention gap on subsequent navigations in Glass. Re-run human sign-off on stable dev after `Remove-Item -Recurse .next` if dev corrupts.
