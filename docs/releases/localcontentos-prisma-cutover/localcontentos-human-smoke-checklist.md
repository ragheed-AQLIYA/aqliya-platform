# LocalContentOS Content Studio — Human Smoke Checklist (PostgreSQL)

**Browser smoke:** NOT DONE  
**Requires:** `DATABASE_URL` configured; app running locally

## Pre-flight

- [ ] Confirm `LOCALCONTENT_CONTENT_BACKEND` unset or `prisma`
- [ ] Confirm migration `20260601120000_localcontentos_content_studio` applied
- [ ] Sign in as org user with LocalContentOS access

## Flow

- [ ] **Create project** — `/local-content` → Content Studio → new content project
- [ ] **Create campaign** — link to project; channels saved
- [ ] **Add source** — URL/note attached to campaign
- [ ] **Create content item** — linked to campaign with source refs
- [ ] **Draft assist** — governed AI draft; `reviewRequired` visible
- [ ] **Submit review** — review dimensions recorded
- [ ] **Approve** — ADMIN approval; item status → approved
- [ ] **Generate output** — output package created
- [ ] **Refresh page** — all entities still visible
- [ ] **Confirm PostgreSQL** — query `ContentStudioProject` / related tables; rows match UI
- [ ] **Restart app** — stop and start dev server
- [ ] **Confirm persistence** — data still present after restart

## Regression (compliance track)

- [ ] `/local-content/projects/*` compliance flows unchanged

## Sign-off

| Field | Value |
|-------|-------|
| Tester | |
| Date | |
| Result | pass / fail |
| Notes | |
