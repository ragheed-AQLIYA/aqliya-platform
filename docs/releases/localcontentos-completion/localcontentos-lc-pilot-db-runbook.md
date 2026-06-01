# LocalContentOS — B1 Option A: LC-Only Pilot DB Runbook

**Date:** 2026-06-01  
**Blocker addressed:** B1 — SalesOS migration history drift on shared `aqliya` @ `localhost:5432`  
**Path chosen:** **Option A** — dedicated PostgreSQL database for LocalContentOS internal pilot  
**Repo:** `C:\Users\PC\Documents\Aqliya`  
**Related:** `localcontentos-b1-drift-reconciliation-plan.md`, `localcontentos-migration-readiness.md`, `localcontentos-pilot-handoff.md`, `localcontentos-l5-pilot-operator-quickstart.md`

> **Agent scope:** Documentation only. LocalContentOS agents do **not** run `migrate deploy`, `migrate dev`, `prisma generate`, `prisma db seed`, or edit committed `.env` without explicit human approval per AQLIYA low-load protocol.

**Validation:** Not validated by this document — operator must capture read-only `npx prisma migrate status` and table checks on the target host.

**Production claim:** **NO**

**Classification:** Pilot operator runbook — **not production-ready**

---

## Purpose

Provision a **fresh PostgreSQL database** so `_prisma_migrations` matches `prisma/migrations/` exactly, avoiding blind deploy on the drifted shared `aqliya` database documented in `localcontentos-b1-drift-reconciliation-plan.md`.

This runbook is for **LocalContentOS internal pilot** (Sunbul / single tenant). It does **not** reconcile the shared dev DB (Option B) and does **not** accept drift as status quo (Option C).

---

## Scope decision (read before provisioning)

| Question | LC pilot default | Notes |
|----------|------------------|-------|
| Dedicated DB name | `aqliya_lc_pilot` (or org equivalent) | Do **not** point pilot at drifted shared `aqliya` |
| Migration chain on empty DB | **All 16** folder migrations apply in order | Includes shared Core **and** pending SalesOS P0/P1 (`20260601140000` … `20260601160000`) unless platform creates a separate baseline (out of scope here) |
| LC Content Studio DDL | `20260601120000_localcontentos_content_studio` | Seventh migration in chain; must be applied before Content Studio Prisma writes |
| SalesOS on pilot DB | Platform decision | Option A isolates **history**, not necessarily **SalesOS schema** — approve deploy scope with product owner |

**Why not "LC migrations only" on empty DB:** Prisma `migrate deploy` applies every pending migration in `prisma/migrations/`. There is no supported partial deploy to stop at `20260601120000` without DBA baseline work (Option B territory).

---

## Roles and approvals

| Action | Who runs it | Approval required |
|--------|-------------|-------------------|
| Create PostgreSQL database + role | DBA / Ops | Product owner (LC pilot scope) |
| Set `DATABASE_URL` on pilot app instance | Ops / lead dev | None (local / deployment config) |
| Read-only `npx prisma migrate status` | Operator or LC agent | **None** (allowed light command) |
| `npx prisma migrate deploy` | DBA / lead dev | **Explicit approval** — see [Deploy gate](#deploy-gate-explicit-approval-required) |
| `npx prisma db seed` | Lead dev | **Explicit approval** (writes data; destructive re-seed) |
| `npx prisma migrate dev` / `prisma generate` / `migrate reset` | — | **Forbidden** in agent sessions without same approval bar as deploy |
| Production / pilot-ready claim | Human sign-off | **NO** from this runbook alone |

---

## Prerequisites

1. PostgreSQL reachable from the pilot app host (local or internal network).
2. Database role with **CREATE** / DDL rights on the new database.
3. Repo checkout at `C:\Users\PC\Documents\Aqliya` (or deployed equivalent).
4. Node.js + dependencies installed (`npm install` — operator responsibility; not run by LC agent without approval).
5. Pilot handoff conditions understood (`localcontentos-pilot-handoff.md`).

---

## Step 1 — Create the pilot database (operator / DBA)

Run on PostgreSQL as a superuser or provisioning role. Adjust names to org policy.

```sql
-- Example only — use org naming and password policy
CREATE DATABASE aqliya_lc_pilot;
CREATE USER aqliya_lc_pilot_app WITH ENCRYPTED PASSWORD '<REPLACE_WITH_SECRET>';
GRANT ALL PRIVILEGES ON DATABASE aqliya_lc_pilot TO aqliya_lc_pilot_app;

-- Connect to aqliya_lc_pilot, then:
GRANT ALL ON SCHEMA public TO aqliya_lc_pilot_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aqliya_lc_pilot_app;
```

**Checklist**

- [ ] Database is **empty** (no prior `_prisma_migrations` rows from drifted hosts).
- [ ] Pilot app will **not** share `DATABASE_URL` with SalesOS dev on drifted `aqliya`.
- [ ] Connection tested (`psql` or org tool) before migration steps.

---

## Step 2 — `DATABASE_URL` (template only)

**Do not commit secrets.** **Do not edit `.env` in LC agent sessions without explicit approval.** Set these on the **pilot app process** only (local `.env`, deployment secret store, or CI secret — operator choice).

```bash
# Template — replace user, password, host, port, dbname
DATABASE_URL="postgresql://aqliya_lc_pilot_app:<PASSWORD>@localhost:5432/aqliya_lc_pilot?schema=public"
```

Reference shape from repo `.env.example` (shared dev uses database name `aqliya`; pilot must use the **new** database name):

```bash
# .env.example pattern (NOT pilot target)
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aqliya
```

**Also set for institutional Content Studio path:**

```bash
LOCALCONTENT_CONTENT_BACKEND=prisma
```

| Variable | Pilot value | Why |
|----------|-------------|-----|
| `DATABASE_URL` | Points at `aqliya_lc_pilot` (or equivalent) | Prisma datasource + auth/session data |
| `LOCALCONTENT_CONTENT_BACKEND` | `prisma` | Production-like guard in `repository-instance.ts`; refuses file backend when Prisma expected |
| `LOCALCONTENT_CONTENT_BACKEND=file` | **Must not** be set on pilot | Forbidden on institutional pilot per L5 sign-off template |

Optional but typical for local pilot (see `.env.example`):

```bash
AUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

**Verify env without starting deploy:**

```powershell
# PowerShell — confirm variable is visible to the shell that will run Prisma
$env:DATABASE_URL
$env:LOCALCONTENT_CONTENT_BACKEND
```

---

## Step 3 — Read-only migration status (required before deploy)

From repo root, with pilot `DATABASE_URL` exported in the **same shell**:

```bash
cd C:\Users\PC\Documents\Aqliya
npx prisma migrate status
```

**Allowed without deploy approval.** Capture full stdout for the change ticket.

### Expected result on empty pilot database

- Prisma loads config from `prisma.config.ts` and schema from `prisma/schema.prisma`.
- **No** "last common migration" drift message (that pattern indicates shared DB history mismatch).
- **All** migrations under `prisma/migrations/` listed as **not yet applied** (16 migrations as of 2026-06-01), including:
  - `20260506103224_init_postgres` … shared Core chain
  - `20260521053231_add_localcontentos_foundation`
  - `20260601120000_localcontentos_content_studio` ← LocalContentOS Content Studio
  - `20260601140000_salesos_p0_core` … `20260601160000_salesos_p1_evidence` ← SalesOS P0/P1

Exit code may be **non-zero** when pending migrations exist — that is normal on an empty DB. **Do not** interpret non-zero alone as "drift"; drift is the specific "local migration history and the migrations table … are different" message on the shared DB (documented in B1 plan).

### Stop conditions (do not deploy)

| Observation | Action |
|-------------|--------|
| Drift message (DB-only migrations not in folder) on **new** DB | Investigate — DB was not empty or wrong `DATABASE_URL` |
| `DATABASE_URL` still points at shared `aqliya` | Fix env; re-run status |
| Pending count ≠ folder count | Stop; compare `prisma/migrations/` to output |

Attach status output to ticket before requesting deploy approval.

---

## Deploy gate — explicit approval required

**Do not run the block below until a human explicitly approves** in ticket / chat / runbook sign-off with:

1. **Target confirmed:** `DATABASE_URL` → dedicated pilot DB only.
2. **Scope confirmed:** Operator accepts full migration chain (including SalesOS P0/P1 on empty DB) **or** platform provided an alternate baseline (document exception).
3. **Backup policy:** N/A for empty DB; for re-run on non-empty pilot DB, backup first.
4. **Approvers recorded:** LC product owner + DBA/Ops.

### Command (when approved)

```bash
# From repo root — REQUIRES EXPLICIT HUMAN APPROVAL
npx prisma migrate deploy
```

### Success criteria

- Exit code **0**.
- No drift / orphan migration message.
- Re-run read-only status:

```bash
npx prisma migrate status
```

Expect: all migrations **applied**, no pending list.

### Post-deploy generate (separate approval in agent sessions)

If client is stale after deploy:

```bash
# REQUIRES EXPLICIT HUMAN APPROVAL in agent sessions
npx prisma generate
```

### Risks (summary)

- Applies **SalesOS** DDL as well as LocalContentOS — not Content Studio only.
- No automated rollback for `20260601120000_localcontentos_content_studio` — restore from backup or manual DDL reversal with DBA.
- **Never** `npx prisma migrate reset` on shared or pilot DB without explicit approval.

Full detail: `localcontentos-migration-readiness.md` — USER APPROVAL GATE section.

---

## Step 4 — Seed minimal admin (if approved)

Documented pilot credentials come from `prisma/seed.ts` (also referenced in `localcontentos-l5-pilot-operator-quickstart.md`):

| User | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@aqliya.com` | `admin123` | ADMIN |
| Operator | `sara@aqliya.com` | `operator123` | OPERATOR |
| Viewer | `mohammad@aqliya.com` | `viewer123` | VIEWER |

**Warning:** `prisma/seed.ts` **deletes existing rows** in many tables (`deleteMany` on users, organizations, decisions, etc.) then inserts demo data — it is **not** a minimal upsert-only admin seed. Use only on **fresh pilot DB** after deploy, with explicit approval.

Configured in `prisma.config.ts`:

```typescript
migrations: {
  seed: "tsx prisma/seed.ts",
},
```

### Command (when approved)

```bash
# REQUIRES EXPLICIT HUMAN APPROVAL — writes and deletes data
npx prisma db seed
```

**Pilot minimum for Content Studio smoke:** ADMIN user (`admin@aqliya.com`) sufficient for approve/export steps; OPERATOR user recommended for create/review path per handoff.

If seed is skipped, ensure at least one ADMIN user exists via org onboarding — Content Studio RBAC requires authenticated session.

---

## Step 5 — Verify Content Studio tables

After successful `migrate deploy` (and optional seed), confirm LocalContentOS Content Studio DDL.

### Option A — `psql`

```bash
psql "$DATABASE_URL" -c "\dt \"ContentStudio*\""
```

### Option B — SQL

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ContentStudio%'
ORDER BY tablename;
```

### Expected tables (7)

From `localcontentos-migration-readiness.md` / `20260601120000_localcontentos_content_studio`:

| Table |
|-------|
| `ContentStudioProject` |
| `ContentStudioCampaign` |
| `ContentStudioSource` |
| `ContentStudioItem` |
| `ContentStudioReview` |
| `ContentStudioApproval` |
| `ContentStudioOutput` |

**Checklist**

- [ ] All seven tables present.
- [ ] `_prisma_migrations` includes row `20260601120000_localcontentos_content_studio` with `finished_at` set.
- [ ] No `LOCALCONTENT_CONTENT_BACKEND=file` in pilot env.
- [ ] `describeContentRepositoryBackend()` resolves to Prisma (app log / dev diagnostic) — reason `LOCALCONTENT_CONTENT_BACKEND=prisma` or `DATABASE_URL present`.

---

## Step 6 — Application smoke (operator)

With pilot env loaded and app started (operator responsibility):

1. Sign in at `/login` with seeded ADMIN (or org user).
2. Walk Content Studio path per `localcontentos-l5-pilot-operator-quickstart.md` (campaign → item → review → approve → output).
3. Confirm persistence survives app restart (Prisma rows remain).

Escalation: `localcontentos-pilot-handoff.md` — persistence errors → migration status + `DATABASE_URL`.

---

## Rollback (pilot DB)

| Scenario | Action |
|----------|--------|
| Wrong DB targeted | Stop app; drop pilot DB or restore; fix `DATABASE_URL` — shared `aqliya` unaffected |
| Failed deploy mid-chain | Restore empty DB from snapshot (if any) or drop/recreate DB; do not hand-edit `_prisma_migrations` without DBA |
| Bad seed on pilot | Drop/recreate DB or restore pre-seed backup; re-run deploy + seed with approval |

See rollback matrix in `localcontentos-b1-drift-reconciliation-plan.md`.

---

## B1 gate closure (documentation criterion)

On the **pilot database** (not shared drifted `aqliya`):

| Check | Closes B1 for LC pilot? |
|-------|-------------------------|
| Read-only `migrate status` — no drift message | Required |
| `migrate deploy` exit 0 — full folder history applied | Required (after approval) |
| `\dt ContentStudio*` — seven tables | Required |
| `LOCALCONTENT_CONTENT_BACKEND=prisma` + pilot `DATABASE_URL` | Required |
| Shared `aqliya` drift resolved | **Not required** for Option A |

**Still NOT production-ready** — human sign-off on `localcontentos-v01-readiness-scorecard.md` and L5/L6 gates remain.

---

## Commands reference

```bash
# ALLOWED without deploy approval (read-only)
npx prisma migrate status

# REQUIRES EXPLICIT HUMAN APPROVAL — do not run in LC agent sessions without sign-off
npx prisma migrate deploy
npx prisma db seed
npx prisma migrate dev
npx prisma generate
npx prisma migrate reset
```

---

## Related next steps (human)

1. Update pilot handoff condition #2 when deploy completes on pilot DB (or attach waiver if file-only — not recommended).
2. Attach `migrate status` before/after output to B1 ticket.
3. Schedule Option B separately if shared `aqliya` must remain canonical for multi-product dev.
4. Re-run read-only status after any migration folder change.

---

## Document record

| Item | Status |
|------|--------|
| Source plan | `localcontentos-b1-drift-reconciliation-plan.md` Option A |
| `migrate deploy` executed in agent session | **No** |
| `.env` edited in agent session | **No** |
| Git commit | **Not requested** |
| Production claim | **NO** |

**Classification:** Documentation only — operator must execute and attach evidence on target environment.
