# Phase 15 PR Draft

**Title:** feat(phase15): browser smoke evidence and CI pilot pipeline

**Branch:** `feature/salesos-l6-unblock` -> `main`

## Summary

- Agent browser smoke on `/login` and `/sales` with curl-backed **6/6** authenticated route pass (`scripts/smoke-auth-routes.ts`).
- Pilot CI workflow: Postgres service, `prisma migrate deploy`, seed + `seed:audit`, `next build --webpack`, sales governance Jest (16), production server + auth smoke.
- Idempotent `AuditUser` upsert for `admin@aqliya.com` in `prisma/seed.ts`.
- Docs: Phase 15 sections in master execution report, browser smoke report, production readiness checklist (CI + browser rows).

## Test plan

- [ ] `npx next build --webpack` — exit 0
- [ ] `npx jest src/lib/sales/__tests__/sales-governance.test.ts src/lib/sales/__tests__/sales-l5-governance.test.ts` — 16/16
- [ ] `npx tsx scripts/smoke-auth-routes.ts` (dev or `next start`) — 6/6 PASS
- [ ] GitHub Actions `Pilot CI` workflow — first run green on PR
- [ ] Human browser sign-off on `/sales/*`, `/workflowos`, `/audit`, `/local-content` (not agent substitute)
- [ ] Pilot DB: `npx prisma db seed` after merge if AuditUser row missing

## Production

**No-go** until human browser sign-off, CI green, and external gates (pen test / pilot SOP) per checklist.

## Honest labels

- Agent browser != human institutional sign-off
- CI scaffold != validated until Actions run succeeds
