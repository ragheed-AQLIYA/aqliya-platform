# LocalContentOS — Pilot Runtime Guide

**Date:** 2026-06-01  
**Scope:** Point the LocalContentOS pilot app at dedicated DB `aqliya_lc_pilot` without editing committed `.env`  
**Validation:** Documentation only — operator must confirm DB deploy per `localcontentos-lc-pilot-db-runbook.md`  
**Production claim:** **NO**

---

## Purpose

Engineering closed B1 on the dedicated pilot database (`aqliya_lc_pilot`). This guide wires the **Next.js dev runtime** to that database using a **session-only** environment override so shared dev `.env` (database `aqliya`) stays unchanged.

---

## Prerequisites

1. PostgreSQL reachable at the host in your `.env` (typically `localhost:5432`).
2. Pilot database **`aqliya_lc_pilot`** created and migrated (Option A — see `localcontentos-b1-option-a-execution-log.md` and `localcontentos-lc-pilot-db-runbook.md`).
3. Repo dependencies installed (`npm install` completed at least once).
4. Local `.env` (or `.env.local`) with valid `DATABASE_URL`, `AUTH_SECRET`, and auth URLs — same as normal dev.

**Do not** run blind `npx prisma migrate deploy` on shared `aqliya` until platform B1 is reconciled.

---

## Start the pilot (recommended)

From repo root:

```powershell
npm run dev:localcontent-pilot
```

Equivalent:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/localcontent/run-localcontent-pilot.ps1
```

Optional flags:

```powershell
# Custom port (default 3001)
powershell -ExecutionPolicy Bypass -File scripts/localcontent/run-localcontent-pilot.ps1 -Port 3002

# Use Turbopack instead of webpack (not recommended on all hosts — see AGENTS.md)
powershell -ExecutionPolicy Bypass -File scripts/localcontent/run-localcontent-pilot.ps1 -Turbopack
```

Open **`http://localhost:3001`** and sign in per `localcontentos-l5-pilot-operator-quickstart.md`.

---

## What the script does

| Item | Behavior |
|------|----------|
| Env source | Reads `.env.local` if present, else `.env` |
| `.env` on disk | **Not modified** |
| `DATABASE_URL` | Same host/user/password; database name swapped to `aqliya_lc_pilot` |
| `LOCALCONTENT_CONTENT_BACKEND` | Set to `prisma` for the dev process |
| Auth URLs | `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` set to `http://localhost:3001` (or `-Port`) |
| Next.js | `next dev -p 3001 --webpack` (webpack avoids Turbopack root issues on some hosts) |

Safe startup summary is printed (source db name → `aqliya_lc_pilot`; credentials are not logged).

---

## Environment template

See repo root **`.env.pilot.example`** for a checklist-style template (placeholder passwords only). It documents pilot-specific values when provisioning a dedicated host or secret store. Day-to-day local pilot use relies on the run script plus your existing `.env`.

There is no `.env.local.example` pattern in this repo; `.env.example` remains the shared baseline.

---

## Verify pilot wiring

Before Content Studio smoke:

```powershell
# In the same shell session as the run script (or export vars manually first)
npx prisma migrate status
```

Expect datasource **`aqliya_lc_pilot`** and schema up to date (17 migrations after Option A).

In the running app:

- Sign in as seed ADMIN (`admin@aqliya.com` / `admin123` on fresh pilot seed).
- Create a campaign item; confirm rows persist after hard refresh (Prisma backend).
- `describeContentRepositoryBackend()` should resolve to Prisma (`LOCALCONTENT_CONTENT_BACKEND=prisma`).

---

## Troubleshooting

| Symptom | Check |
|---------|-------|
| `DATABASE_URL not found` | Add `DATABASE_URL` to `.env` or `.env.local` |
| Persistence errors / empty data | Confirm pilot DB migrated; `npx prisma migrate status` against session `DATABASE_URL` |
| Auth redirect mismatch | Script sets `NEXTAUTH_URL` to pilot port; clear cookies if switching from `:3000` dev |
| Wrong database | Stop dev server; restart via `npm run dev:localcontent-pilot` — do not edit `.env` dbname for pilot |
| File backend used | Ensure `LOCALCONTENT_CONTENT_BACKEND=file` is **not** set in shell profile |

Escalation: `localcontentos-pilot-handoff.md`, `localcontentos-lc-pilot-db-runbook.md`.

---

## Related docs

| Doc | Use |
|-----|-----|
| `localcontentos-l5-pilot-operator-quickstart.md` | Login, routes, workflow |
| `localcontentos-lc-pilot-db-runbook.md` | DB create, migrate deploy, seed |
| `localcontentos-b1-option-a-execution-log.md` | B1 pilot DB evidence |
| `.env.pilot.example` | Template checklist (no secrets) |

**Classification:** Pilot operator runbook — **not validated** until operator confirms migrate status and browser smoke on `:3001`.
