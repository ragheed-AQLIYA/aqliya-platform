# Parallel Tracks Runbook — Track A + B + Phase 4

**Updated:** 2026-06-04  
**Baseline:** `main` after slice 31  
**Rule:** Tracks run **in parallel**; commits on `main` stay **sequential**.

---

## Track A — Ops / Cycle 6 remote

| Step | Command | Pass when |
| ---- | ------- | --------- |
| 1 | `npm run staging:probe` | DNS + HTTP 2xx |
| 2 | Set `DATABASE_URL`, `STAGING_BASE_URL`, `AUTH_SECRET` on staging | `node scripts/cycle6-operator-preflight.mjs` exit 0 |
| 3 | `npx prisma migrate deploy` | No failed migrations |
| 4 | `npm run cycle6:remote-smoke` | Evidence JSON updated |
| 5 | `node scripts/cycle6-smoke-report-stamp.mjs` | Remote row in `LIVE_SMOKE_REPORT.md` |
| 6 | Director G6-7 | `cycle-6-close.md` → CLOSED |

**Local substitute (engineering):** `npm run cycle6:full-run` — does **not** close program.

**Packet:** `cycle-6-remote-operator-packet.md`

---

## Track B — Engineering (OpenCode)

| Step | Command | Pass when |
| ---- | ------- | --------- |
| 1 | `npx tsc --noEmit` | Exit 0 |
| 2 | `npm run demo:smoke` | Pass |
| 3 | `npm test` | All pass (~12s) |
| 4 | `npm run build` | Standalone output |
| 5 | `npm run start:standalone` | `/api/health`, `/api/health/live`, `/api/health/ready` |
| 5b | `npm run smoke:local` | Post-deploy smoke vs localhost |
| 6 | Browser | `audit-sampling-browser-smoke.md` |

**Product slices (parallel with 1–6):** AuditOS polish, SalesOS L5 proof, WorkflowOS/LocalContactOS depth, IC consumption via `retrieveGovernedContext`.

---

## Phase 4 — L6 certification (after Gate 0)

| Gate | Owner | Blocker today |
| ---- | ----- | ------------- |
| 0 | Ops + Director | Remote Cycle 6 |
| 1 | Ops | L0-04 pentest, L0-01 apply |
| 4 | Engineering | `npm run lint` + build evidence in `PILOT_VALIDATION_MASTER_REPORT.md` |

**Checklist:** `phase-4-entry-checklist.md`

---

## One-shot local engineering bundle

```powershell
npx tsc --noEmit
npm run demo:smoke
npm test
npm run build
npm run cycle6:full-run
```

---

## Honest labels

| Label | Allowed when |
| ----- | ------------ |
| Repo engineering-stable | tsc + test + build + local cycle6 |
| Cycle 6 CLOSED | Remote smoke + G6-7 |
| L6 certified | Gate 0–4 + vendor evidence |
