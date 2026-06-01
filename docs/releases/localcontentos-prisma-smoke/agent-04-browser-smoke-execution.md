# Agent 04 — Browser Smoke Execution (Round 2)

**Date:** 2026-06-01  
**Browser Smoke:** **partial / not complete**

## Root cause of Round 1 failure

- Dev server bound to **port 3001** (3000 occupied); smoke targeted **3000**.
- Login form uses React controlled inputs; `browser_fill` did not update React state.

## Round 2 attempt

1. Retargeted to `http://localhost:3001`.
2. Confirmed `admin@aqliya.com` exists in PostgreSQL with org `cmpr0j9hm0000l4pq6k41xa9w`.
3. Auth via CDP + `fetch('/api/auth/callback/credentials')` → session valid (`/api/auth/session` shows ADMIN).
4. After full reload, authenticated shell renders (sidebar visible).
5. Form submit blocked in Glass browser: repeated **"Router action dispatched before initialization"** errors in dev console.
6. Dev server logs (earlier in session) show **successful UI path**:
   - `POST /local-content/campaigns` → `createContentStudioProjectAction` → `INSERT INTO ContentStudioProject` (Prisma).

## PostgreSQL verification (read-only)

- Row exists: `Smoke Test Project v0.1` (`cproj_mpugq4xp_zpbo4do`) for demo org.
- Confirms at least one UI → Server Action → Prisma write succeeded.

## Not verified in browser automation

- Full checklist (campaign, source, item, draft assist, review, approve, output, refresh, restart).
- Campaign form visibility (depends on projects list loading in RSC).

## Fixes applied this round (minimal)

- `create-content-project-form.tsx` — explicit submit handler + `router.refresh()` (matches campaign form).
- `campaigns/page.tsx` — surface `projectsRes` errors (was silent).

## Manual completion steps

1. Open **`http://localhost:3001`** (not 3000).
2. Login: `admin@aqliya.com` / `admin123`.
3. Run checklist in `localcontentos-human-smoke-checklist.md`.
4. Confirm PostgreSQL rows after refresh and dev server restart.
