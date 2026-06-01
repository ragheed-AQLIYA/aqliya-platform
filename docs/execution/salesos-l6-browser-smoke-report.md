# SalesOS L6 Browser Smoke Report

**Date:** 2026-06-01  
**Branch:** `feature/salesos-l6-unblock`  
**DB:** `aqliya_pilot`  
**Validation:** light validated with conditions — **production no-go**

---

## Environment

- Dev server: `npm run dev` (port 3000); restarted after `npx next build --webpack` to avoid `.next` corruption
- DB: `aqliya_pilot` — seed + `scripts/ensure-audit-user-admin.ts` (AuditUser for `admin@aqliya.com`)
- Credentials: seed user `admin@aqliya.com` — password in `prisma/seed.ts` (redact in reports)

---

## Phase 15 — Browser smoke (agent evidence)

**Method:** Cursor IDE browser MCP; session via credentials API + in-page navigation (React login form automation unreliable in MCP — slow-type still hit signIn error; API login + `location.assign` used for protected routes).

**Label:** agent browser evidence — **human institutional sign-off pending**

### Unauthenticated

| Route | Result | Evidence |
|-------|--------|----------|
| `/login` | **PASS** | Login form renders (AR); demo accounts panel visible |

### Authenticated (admin@aqliya.com)

| Route | Browser | Curl (`smoke-auth-routes.ts`) | Snapshot evidence |
|-------|---------|----------------------------------|-------------------|
| `/sales` | **PASS** | **PASS 200** | h1 `SalesOS`; KPI cards; pipeline stages |
| `/sales/deals` | **PARTIAL** | **PASS 200** | Browser redirected to login (MCP session); curl OK |
| `/sales/accounts` | **PARTIAL** | **PASS 200** | Not captured in browser; curl OK |
| `/sales/review` | **PARTIAL** | **PASS 200** | Not captured in browser; curl OK |
| `/workflowos` | **PARTIAL** | **PASS 200** | Browser redirected to login; curl OK |
| `/audit` | **PASS** | **PASS 200** | h1 `AuditOS`; Gulf Trading Co. FY2025 engagement; AuditUser provisioned |
| `/local-content` | **PARTIAL** | **PASS 200** | Browser fetch 200; page nav not captured; curl OK |

### Session

| Check | Result |
|-------|--------|
| Credentials API login | **PASS** — session `admin@aqliya.com` |
| React login form (MCP) | **FAIL** — signIn error despite correct demo credentials |

---

## Phase 14 carry-over (resolved)

- Prior `.next` corruption during parallel build+dev — **mitigated** by dev restart post-build
- Authenticated curl — **6/6 PASS** (Phase 15 re-run)

---

## Human sign-off

**NOT DONE** — PO / institutional browser walkthrough required. Agent evidence ≠ human sign-off.

---

## Verdict

**Light validated with conditions** — curl smoke 6/6 + browser snapshots for `/sales` and `/audit`; MCP browser session inconsistent on sub-routes. **Production no-go** until human sign-off + external gates.
