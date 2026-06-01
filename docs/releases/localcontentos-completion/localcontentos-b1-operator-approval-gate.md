# LocalContentOS — B1 Operator Approval Gate

**Date:** 2026-06-01  
**Product:** LocalContentOS (AQLIYA platform)  
**Repo:** `C:\Users\PC\Documents\Aqliya`  
**Blocker:** B1 — SalesOS migration history drift on shared PostgreSQL  
**Related:** `localcontentos-b1-drift-reconciliation-plan.md`, `localcontentos-lc-pilot-db-runbook.md`, `localcontentos-l6-completion-status.md`, `localcontentos-l6-readiness-scorecard.md`

> **Agent scope:** Documentation only. No `migrate deploy`, no `.env` edit, no git commit from this gate document alone.

**Validation:** Read-only `npx prisma migrate status` captured 2026-06-01 — **not validated** on pilot DB, staging, or production.

**Production claim:** **NO**

**Classification:** Operator approval gate — **not production-ready**

---

## What B1 is

**B1** is the open program blocker for **SalesOS migration history drift** on the shared PostgreSQL database (`aqliya` @ `localhost:5432`, schema `public`).

Prisma compares folder migrations under `prisma/migrations/` with rows in `_prisma_migrations`. On the shared DB they **do not match**:

| Category | Migrations | Meaning |
|----------|------------|---------|
| **Last common** | `20260601120000_localcontentos_content_studio` | LocalContentOS Content Studio DDL is recorded as applied |
| **Pending (repo only)** | `20260601140000_salesos_p0_core` … `20260601170000_salesos_p1_contacts` | Repo expects these; DB has not applied them |
| **Orphan (DB only)** | Six SalesOS tier / v1 names (incl. duplicate B3 row) | Applied under names no longer in `prisma/migrations/` |

**Consequence:** Blind `npx prisma migrate deploy` on the shared DB is **unsafe** — it may fail mid-chain, apply unexpected SalesOS DDL, or mask schema/history mismatch.

LocalContentOS engineering blockers **B2, B3, B4 are CLOSED**. **B1 remains the sole engineering gate** before institutional L6 closure.

---

## Why B1 blocks L6

L6 program status (see `localcontentos-l6-completion-status.md`):

- **Honest level:** L5 with conditions — **NOT L6**, **NOT Production Ready**
- **Program blockers open:** **B1 only** (plus human PO sign-off)
- **Persistence dimension:** **PARTIAL** — Prisma-only guard is closed (B3), but shared `migrate deploy` is blocked

L6 scorecard gate criteria **not met** until:

1. `npx prisma migrate status` is **clean on the target pilot DB** (or documented DBA baseline on shared DB), and
2. Human PO sign-off on `localcontentos-l6-readiness-scorecard.md`

**Option C (defer)** keeps B1 **OPEN** and L6 **blocked** for institutional pilot persistence sign-off.

---

## Decision — choose one primary path

Human must record **one** option before any deploy approval. Platform recommendation: **Option A** for near-term LC internal pilot; **Option B** as parallel backlog if shared `aqliya` must stay canonical.

| | **Option A — Fresh pilot DB** | **Option B — DBA reconcile shared DB** | **Option C — Defer (status quo)** |
|--|-------------------------------|----------------------------------------|-----------------------------------|
| **Summary** | New empty DB (e.g. `aqliya_lc_pilot`); run full migration chain from repo | DBA aligns `_prisma_migrations` on shared `aqliya` with folder | Do not deploy; LC Content Studio already applied on shared DB |
| **Closes B1 for LC pilot** | **Yes** (on pilot DB) | **Yes** (if successful on shared DB) | **No** — B1 stays OPEN |
| **Unblocks L6 persistence gate** | **Yes** | **Yes** (if verified) | **No** (localhost smoke only) |
| **LC agent may execute** | Document + read-only status | **No** — Platform / DBA + SalesOS | Document only |
| **Runbook** | `localcontentos-lc-pilot-db-runbook.md` | `localcontentos-b1-drift-reconciliation-plan.md` § Option B | Waive pilot handoff #2; open ticket for A or B |
| **Risk** | Low on fresh DB | **High** on shared DB | Medium (accidental deploy) |

**Selected option (operator fills in):** ☐ A ☐ B ☐ C

**Ticket / change ID:** _________________________  
**Decision owner:** _________________________  
**Date:** _________________________

---

## Pre-deploy approval checkboxes

**Do not run `npx prisma migrate deploy` until every applicable box is checked and signed.**

### Gate 0 — Decision recorded

- [ ] Option **A**, **B**, or **C** selected above with owner and date
- [ ] If **C:** LC product owner + Platform lead waiver recorded; B1 remains OPEN on scorecard
- [ ] If **B:** DBA ticket opened; LC agent **not** executing reconciliation

### Gate 1 — Target database confirmed

- [ ] `DATABASE_URL` points at the **intended** database only (pilot DB for A; shared `aqliya` for B)
- [ ] Pilot app will **not** share `DATABASE_URL` with SalesOS dev on drifted shared DB (Option A)
- [ ] Database role has DDL rights; connection tested (`psql` or org tool)
- [ ] For Option A: database is **empty** (no prior drifted `_prisma_migrations` rows)

### Gate 2 — Read-only status captured (required)

- [ ] Read-only `npx prisma migrate status` run from repo root in shell with target `DATABASE_URL`
- [ ] Full stdout attached to ticket (see [Evidence templates](#evidence-to-attach-after-execution))
- [ ] For Option A on empty DB: pending migrations listed; **no** drift/orphan message
- [ ] For shared DB: drift matrix understood; deploy **not** approved until B reconciliation complete (Option B)

### Gate 3 — Scope and backup

- [ ] Operator accepts **full** `prisma/migrations/` chain on deploy (17 folder migrations as of 2026-06-01), including SalesOS P0/P1 — **or** documented platform baseline exception
- [ ] Backup policy: N/A for empty pilot DB; **full backup taken** for non-empty or shared DB (Option B)
- [ ] `LOCALCONTENT_CONTENT_BACKEND=prisma` set on pilot process (not `file`)
- [ ] No agent/CI blind deploy against drifted shared DB without this gate

### Gate 4 — Approver sign-off (required for deploy)

| Role | Name | Signature / date |
|------|------|------------------|
| LC product owner (pilot scope) | | |
| DBA / Ops | | |
| Platform lead (Option B or C only) | | |

**Deploy approved:** ☐ Yes ☐ No — if No, stop here.

---

## Commands — ONLY after Gate 4 approval

**Forbidden before approval:** `npx prisma migrate deploy`, `npx prisma db seed`, `npx prisma migrate dev`, `npx prisma generate`, `npx prisma migrate reset`.

### Allowed anytime (read-only)

```bash
cd C:\Users\PC\Documents\Aqliya
npx prisma migrate status
```

### Option A — provision pilot DB (operator / DBA; before deploy)

```sql
-- Example only — use org naming and password policy
CREATE DATABASE aqliya_lc_pilot;
CREATE USER aqliya_lc_pilot_app WITH ENCRYPTED PASSWORD '<REPLACE_WITH_SECRET>';
GRANT ALL PRIVILEGES ON DATABASE aqliya_lc_pilot TO aqliya_lc_pilot_app;
-- Connect to aqliya_lc_pilot, then:
GRANT ALL ON SCHEMA public TO aqliya_lc_pilot_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aqliya_lc_pilot_app;
```

Set on **pilot app process only** (not committed `.env` in agent sessions):

```bash
DATABASE_URL="postgresql://aqliya_lc_pilot_app:<PASSWORD>@localhost:5432/aqliya_lc_pilot?schema=public"
LOCALCONTENT_CONTENT_BACKEND=prisma
```

### Deploy (requires Gate 4 approval)

```bash
cd C:\Users\PC\Documents\Aqliya
npx prisma migrate deploy
```

**Success:** exit code **0**; no drift/orphan message.

### Post-deploy verification (requires deploy to have completed)

```bash
npx prisma migrate status
```

```bash
psql "$DATABASE_URL" -c "\dt \"ContentStudio*\""
```

Or SQL:

```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'ContentStudio%'
ORDER BY tablename;
```

**Expected Content Studio tables (7):** `ContentStudioProject`, `ContentStudioCampaign`, `ContentStudioSource`, `ContentStudioItem`, `ContentStudioReview`, `ContentStudioApproval`, `ContentStudioOutput`.

### Optional seed (separate explicit approval — destructive on many tables)

```bash
npx prisma db seed
```

See `localcontentos-lc-pilot-db-runbook.md` Step 4 — use only on **fresh pilot DB** after deploy.

### Option B — reference only (DBA / Platform; not LC agent)

See `localcontentos-b1-drift-reconciliation-plan.md` Option B: backup, `_prisma_migrations` inventory, reconcile orphans, then approved `migrate deploy` when status is clean.

---

## Evidence to attach after execution

Attach the following to the B1 / L6 ticket. **No production-ready claim** from evidence alone.

### 1. Read-only `migrate status` — before deploy

```text
[Paste full stdout from: npx prisma migrate status]
Target DATABASE_URL host/db: _________________________
Captured by: _________________________ Date: _________________________
```

### 2. Read-only `migrate status` — after deploy (Option A or B)

```text
[Paste full stdout — expect all migrations applied, exit code 0]
```

### 3. Content Studio table list

```text
[Paste output from psql \dt "ContentStudio*" or SELECT tablename query]

Checklist:
[ ] All 7 ContentStudio* tables present
[ ] _prisma_migrations row for 20260601120000_localcontentos_content_studio with finished_at set
```

### 4. Environment confirmation (no secrets in ticket)

```text
DATABASE_URL points to: _________________________ (dbname only)
LOCALCONTENT_CONTENT_BACKEND: prisma
Shared aqliya drift resolved: Yes / No / N/A (Option A)
```

---

## Read-only baseline — shared `aqliya` (2026-06-01)

Captured from repo root against datasource `postgresql://…@localhost:5432/aqliya`. **Exit code: 1** (history mismatch — expected on shared drifted DB).

```text
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "aqliya", schema "public" at "localhost:5432"

17 migrations found in prisma/migrations
Your local migration history and the migrations table from your database are different:

The last common migration is: 20260601120000_localcontentos_content_studio

The migrations have not yet been applied:
20260601140000_salesos_p0_core
20260601150000_salesos_p1_interactions
20260601160000_salesos_p1_evidence
20260601170000_salesos_p1_contacts

The migrations from the database are not found locally in prisma/migrations:
20260529120000_salesos_v1_persistence
20260530114715_add_core_tables
20260531143000_salesos_tier_a_intelligence
20260531150000_salesos_tier_b1_commercial
20260531153000_salesos_tier_b2_institutional
20260531160000_salesos_tier_b3_knowledge_graph
20260531160000_salesos_tier_b3_knowledge_graph
```

**Interpretation:** B1 **OPEN**. Do not deploy on this DB without Option B reconciliation or switching to Option A pilot DB.

---

## B1 closure criteria (documentation)

| Check | Option A (pilot DB) | Option B (shared DB) | Option C |
|-------|---------------------|----------------------|----------|
| Clean `migrate status` on target | Required | Required | Not required — B1 stays OPEN |
| `migrate deploy` exit 0 | Required | Required | **Do not run** |
| Seven `ContentStudio*` tables | Required | Required | Already on shared DB |
| Closes B1 on scorecard | Yes (pilot path) | Yes (if verified) | **No** |
| Closes L6 program gate alone | **No** — PO sign-off still required | **No** | **No** |

**Still NOT production-ready** after B1 closes — human PO sign-off and remaining L6 dimensions apply.

---

## Document record

| Item | Status |
|------|--------|
| `migrate deploy` executed in agent session | **No** |
| `.env` edited in agent session | **No** |
| Git commit | **Not requested** |
| Read-only `npx prisma migrate status` | **Done** (shared `aqliya`, exit code 1) |
| Production claim | **NO** |

**Classification:** Operator gate documentation — **not validated** beyond localhost status capture.
