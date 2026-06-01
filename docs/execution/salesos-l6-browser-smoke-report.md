# SalesOS L6 Browser Smoke Report

**Date:** 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**Validation:** light validated with conditions — **production no-go**

---

## Environment

- Dev server: `npm run dev` (port 3000)
- DB: local PostgreSQL with seed + `scripts/seed-sales-demo.ts` applied
- Note: parallel `next build` + `dev` caused `.next/dev` corruption (ENOENT routes-manifest) — **clear `.next` before smoke**

---

## Unauthenticated smoke

| Route | HTTP | Result | Notes |
|-------|------|--------|-------|
| `/api/health` | 500 | **FAIL** | During `.next` corruption from parallel build |
| `/login` | 500 | **FAIL** | Same — not auth logic verified broken |
| `/sales` | 302→login | **BLOCKED** | Expected redirect when unauth |

---

## Authenticated smoke

| Route | HTTP | Auth | Result |
|-------|------|------|--------|
| Session via `/api/auth/callback/credentials` | — | — | **NOT COMPLETED** — dev instability / timeout |
| `/sales` | — | admin | **NOT VALIDATED** |
| `/sales/deals` | — | admin | **NOT VALIDATED** |
| `/sales/accounts` | — | admin | **NOT VALIDATED** |
| `/sales/review` | — | admin | **NOT VALIDATED** |
| `/workflowos` | — | admin | **NOT VALIDATED** |

---

## Pilot DB instructions (local)

See `docs/execution/aqliya-production-readiness-checklist.md` — use `aqliya_pilot` with full migrate deploy, not shared drifted DB.

---

## Human sign-off

**NOT DONE** — browser PO signature required after clean build + stable dev.

---

## Verdict

**BLOCKED** — fix build stability, run smoke on clean `.next`, then re-run authenticated curl/browser pass.
