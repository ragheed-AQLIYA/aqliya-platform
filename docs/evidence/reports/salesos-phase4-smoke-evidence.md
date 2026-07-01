# SalesOS L6 — Phase 4 smoke evidence (consolidated)

**Date:** 2026-06-01  
**Branch:** `feature/salesos-l6-unblock` (uncommitted)  
**Agent:** Cursor subagent (Phase 4)  
**Base URL:** `http://localhost:3001` (existing dev server — not started by agent)

---

## Executive summary

| Gate | Result | Label |
|------|--------|-------|
| Phase 3 boundary files present | PASS | light validated |
| Dev server reachable | PASS | port 3001 HTTP 200 |
| Prisma schema | PASS | `prisma validate` |
| Targeted Jest (`sales-governance.test.ts`) | PASS | 11/11 (after export fix) |
| Authenticated browser smoke | **BLOCKED** | ModuleParseError + auth session |
| Unauthenticated route registration | PARTIAL | 307 → login only |
| L6 browser sign-off | **NO** | — |

---

## 1. Pre-smoke readiness (light)

### Phase 3 artifacts (grep)

| File | Status |
|------|--------|
| `src/lib/sales/institutional-memory-shared.ts` | present |
| `src/lib/sales/signals-shared.ts` | present |
| `src/lib/sales/governance-shared.ts` | present |
| Client imports to `*-shared` | verified on timeline components + `account-brief-view` |

### Dev server

- **Detected:** `http://localhost:3001` responding (root 200).
- **Not started** by agent (low-load compliant).
- **Note:** Multiple prior `next dev -p 3001` terminals show ended/crashed states; operator should confirm one healthy instance.

### `.env.example` (no `.env` read)

Required for runtime: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`. Recommended: `DOWNLOAD_TOKEN_SECRET`, `LOCAL_STORAGE_DIR`, `STORAGE_PROVIDER`.

---

## 2. Browser smoke (cursor-ide-browser MCP)

### Environment

| Item | Value |
|------|-------|
| Login page | **PASS** — form renders, title OK |
| Agent login attempt | **BLOCKED** — `admin@aqliya.com` / seed password stayed on `/login?` (no session; likely DB not seeded or auth misconfig) |
| Authenticated session | **Not available** to agent |

### Target routes (Phase 4 scope)

| Route | Unauth HTTP | Authenticated browser | Notes |
|-------|-------------|----------------------|-------|
| `/sales` | 307 → login | **FAIL** | 500 / `ModuleParseError` duplicate `syncInstitutionalMemoryForAccount` in flight bundle |
| `/sales/deals` | 307 | **FAIL** | Same blocker (not individually re-tested post-fix) |
| `/sales/accounts` | 307 | **FAIL** | Same |
| `/sales/review` | 307 | **FAIL** | Same |

### Blocker evidence (2026-06-01)

```
ModuleParseError: Identifier 'syncInstitutionalMemoryForAccount' has already been declared (5:9)
| import { syncInstitutionalMemoryForAccount } from "../institutional-memory";
| import { icpBandFromScore, ICP_SEGMENT_RULES, readAccountSegmentHint } from "../icp-types";
> import { syncInstitutionalMemoryForAccount } from "../institutional-memory";
| function clampScore(value) {
```

Terminal logs match `icp-fit-agent` + institutional-memory collision in webpack flight loader.

### Phase 4 code delta (not browser-validated)

- `governance.ts`: dynamic import for `syncInstitutionalMemoryForAccount` (removes static edge).
- Requires **human**: stop dev → delete `.next` (approval) → `npx next dev -p 3001 --webpack` → re-smoke with valid session.

---

## 3. Optional hardening

| Item | Action |
|------|--------|
| `account-brief-view.tsx` | Already on `signals-shared` — no change |
| `governance.ts` dynamic import | Applied (minimal) |

---

## 4. Targeted validation (medium)

```text
npm test -- src/lib/sales/__tests__/sales-governance.test.ts
Tests: 11 passed, 11 total
```

Hook allowed execution. **Not** full `src/lib/sales/__tests__` suite (heavy / not requested).

---

## 5. Classification (honest)

| Label | Applies |
|-------|---------|
| not validated (browser) | **Yes** for authenticated Sales UI |
| light validated | grep + prisma validate + 1 Jest file |
| build validated | **No** |
| pilot-ready with conditions | **No** for browser gate |
| production / L6 institutional | **No-go** |

---

## 6. Human actions required

1. **Restart dev** with clean `.next` after pulling Phase 3–4 boundary fixes.
2. **Confirm DB seeded** (`prisma db seed` or Phase 0 script) so login works.
3. **Re-run** authenticated smoke per `salesos-l6-browser-smoke-report.md` §7–14.
4. **`migrate deploy`** on target DB (operator only — not run by agent).
5. Sign integrator checklist when smoke passes.

---

## Related docs

- `docs/reports/salesos-l6-browser-smoke-report.md` (checklist master)
- `docs/reports/salesos-phase3-unblock-fix.md` (boundary fix log)
- `docs/pilot/salesos-pilot-readiness.md`

---

## Phase 5 addendum (2026-06-01)

**Agent:** Cursor Phase 5 subagent (approved: dev restart, browser MCP, targeted jest)

### Completed

1. **Test drift fix** — `sales-governance.test.ts` imports split: `governance-shared` vs `governance`.
2. **Targeted jest** — `npm test -- src/lib/sales/__tests__/sales-governance.test.ts` → **11/11 PASS**.
3. **Cache hygiene** — removed `.next` and `node_modules/.cache` before dev restarts.
4. **Dev server** — `npx next dev -p 3001 --webpack` (Ready); HTTP probes without session.

### HTTP probes (no session cookie)

| Route | Status |
|-------|--------|
| `/login` | 200 |
| `/sales` | 307 → `/login?callbackUrl=/sales` |
| `/sales/deals` | 307 |
| `/sales/accounts` | 307 |
| `/sales/review` | 307 |
| `/api/auth/session` | 200 body `null` |

### Browser MCP (cursor-ide-browser)

| Check | Result |
|-------|--------|
| `/login` snapshot + screenshot | **PASS** |
| Agent credential login | **BLOCKED** — no session established |
| `/sales` authenticated UI | **FAIL** — blank page; ModuleParseError in dev terminal |
| Screenshots | Login form captured; `/sales` blank/black frame |

### Not fixed in Phase 5

- Authenticated Sales UI bundler error (`syncInstitutionalMemoryForAccount` duplicate in flight-loader transform).
- Agent login (likely needs operator DB seed verification on active `DATABASE_URL`).
- UTF-8 invalid Sales page sources (found via `next build --webpack`).

### Phase 5 validation label

**light validated** (jest + unauth HTTP + login UI) — **not validated** (authenticated browser smoke). Unchanged vs Phase 4 for L6 browser gate.
