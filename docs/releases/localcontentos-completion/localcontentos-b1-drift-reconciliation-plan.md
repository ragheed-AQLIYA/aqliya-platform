# LocalContentOS — B1 Migration Drift Reconciliation Plan

**Date:** 2026-06-01  
**Blocker:** B1 — SalesOS migration history drift on shared localhost DB  
**Product:** LocalContentOS (AQLIYA platform / shared Core)  
**Repo:** `C:\Users\PC\Documents\Aqliya`  
**Related:** `localcontentos-migration-readiness.md`, `localcontentos-pilot-handoff.md`, `localcontentos-l6-completion-status.md`

> **Agent scope:** Platform decision record. LocalContentOS agents do **not** execute SalesOS migration fixes, DBA reconciliation, or `migrate deploy` / `migrate dev` / `prisma generate` without explicit human approval per AQLIYA low-load protocol.

**Validation:** read-only `npx prisma migrate status` captured this session — **not validated** for staging, production, or other hosts.

**Production claim:** **NO**

---

## Problem statement

Prisma reports **migration history drift** on the shared PostgreSQL database (`aqliya` @ `localhost:5432`, schema `public`). LocalContentOS Content Studio migration `20260601120000_localcontentos_content_studio` is the **last common migration** — LC tables are recorded as applied. However:

- **Three local migrations are pending** (SalesOS P0/P1).
- **Six DB-only migration rows** exist in `_prisma_migrations` that do not match any folder under `prisma/migrations/`.

Blind `npx prisma migrate deploy` on this database is **unsafe** until history is reconciled or a scoped pilot database is used.

---

## Current state — `npx prisma migrate status` (2026-06-01)

Captured from repo root against datasource `postgresql://…@localhost:5432/aqliya`. **Exit code: 1** (Prisma history mismatch flag).

```
Loaded Prisma config from prisma.config.ts.

Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "aqliya", schema "public" at "localhost:5432"

16 migrations found in prisma/migrations
Your local migration history and the migrations table from your database are different:

The last common migration is: 20260601120000_localcontentos_content_studio

The migrations have not yet been applied:
20260601140000_salesos_p0_core
20260601150000_salesos_p1_interactions
20260601160000_salesos_p1_evidence

The migrations from the database are not found locally in prisma/migrations:
20260529120000_salesos_v1_persistence
20260530114715_add_core_tables
20260531143000_salesos_tier_a_intelligence
20260531150000_salesos_tier_b1_commercial
20260531153000_salesos_tier_b2_institutional
20260531160000_salesos_tier_b3_knowledge_graph
20260531160000_salesos_tier_b3_knowledge_graph
```

### Drift matrix

| Category | Migration names | Meaning |
|----------|-----------------|---------|
| **Last common** | `20260601120000_localcontentos_content_studio` | LC Content Studio DDL recorded as applied on this DB |
| **Pending (local only)** | `20260601140000` … `20260601160000` (SalesOS) | Repo expects these; DB has not applied them |
| **Orphan (DB only)** | Six SalesOS tier / v1 names (incl. duplicate B3 row) | Applied or recorded under names no longer in `prisma/migrations/` |

---

## Decision options

Human must choose **one primary path** before LocalContentOS pilot DB sign-off or shared `migrate deploy`.

---

### Option A — LC-only pilot database (recommended for LC pilot)

**Summary:** Provision a **fresh PostgreSQL database** dedicated to LocalContentOS pilot. Run the migration chain from repo on empty DB so `_prisma_migrations` matches `prisma/migrations/` exactly.

| Aspect | Detail |
|--------|--------|
| **When to choose** | Internal LC pilot (Sunbul / single tenant); SalesOS schema not required on pilot DB |
| **Scope** | Shared Core migrations through `20260601120000_localcontentos_content_studio`; platform decides whether to include pending SalesOS migrations on pilot DB |
| **Clean path** | Empty DB → `npx prisma migrate deploy` (after approval) → verify `\dt ContentStudio*` |
| **DATABASE_URL** | Point pilot app instance at new DB only; do not share with SalesOS dev on drifted DB |

**Steps (operator, after approval):**

1. Create database (e.g. `aqliya_lc_pilot`) and role with DDL rights.
2. Set `DATABASE_URL` to new database (do not edit committed `.env` in agent sessions without approval).
3. Run read-only `npx prisma migrate status` — expect pending migrations on empty DB.
4. After backup policy sign-off (N/A for empty DB): run `npx prisma migrate deploy`.
5. Confirm exit code 0 and no drift message.
6. Smoke: Content Studio workflow + `\dt ContentStudio*`.

**LC agent may:** Document connection string pattern, update pilot handoff checklist, run read-only status.

**LC agent may not:** Run deploy without approval; modify SalesOS migration files.

**Approvers:** Product owner (LC pilot scope) + DBA/Ops (new DB provisioning).

---

### Option B — DBA baseline `_prisma_migrations` reconciliation (shared DB)

**Summary:** Align the **existing shared** `aqliya` database `_prisma_migrations` table with current `prisma/migrations/` folder so `migrate status` is clean and future deploys are predictable.

**OUT OF SCOPE for LocalContentOS agent** — document only. Execution is **Platform / DBA + SalesOS program**.

| Aspect | Detail |
|--------|--------|
| **When to choose** | Single shared dev DB must remain; SalesOS tables already exist from orphan migrations; team accepts DBA-led history surgery |
| **Risk level** | **High** — incorrect rows can block deploy or mask schema/history mismatch |

**Reference steps for DBA (not executed by LC agent):**

1. **Freeze writes** — coordinate with SalesOS and LC devs; optional maintenance window.
2. **Full backup** — pg_dump / org backup before any `_prisma_migrations` change.
3. **Inventory**
   - `SELECT migration_name, finished_at, checksum FROM _prisma_migrations ORDER BY finished_at;`
   - Compare to `prisma/migrations/*/migration.sql` checksums (Prisma stores checksums on apply).
   - Document actual DDL on disk (`\dt`, `\d+`) vs what orphan migration names imply.
4. **Determine equivalence**
   - If orphan SalesOS migrations DDL is already present under different names, decide whether to:
     - Remove orphan rows and insert rows matching current folder names (if checksums can be aligned), or
     - Use `prisma migrate resolve` — mark applied / rolled-back per Prisma docs, or
     - Baseline — reset migration history to a known folder snapshot (history table only; requires schema match).
5. **Reconcile pending SalesOS migrations** (`20260601140000` … `20260601160000`)
   - If DDL overlaps orphan-era tables: SalesOS owner decides `resolve --applied` or migration edit strategy.
   - If net-new DDL only: apply via approved `migrate deploy` once history is consistent.
6. **Verify** — `npx prisma migrate status` exit code 0 on shared DB.
7. **Record** — change ticket with before/after `_prisma_migrations` export and approver sign-off.

**Approvers:** Platform architect + DBA + SalesOS program lead. LC product owner **informed**, not owner.

---

### Option C — Defer SalesOS migrations; accept LC on localhost (status quo)

**Summary:** **Do not run `migrate deploy`** on the drifted shared DB. LocalContentOS Content Studio is **already applied** through last common migration `20260601120000`. Continue LC development and localhost smoke against this DB while SalesOS drift remains unresolved.

| Aspect | Detail |
|--------|--------|
| **When to choose** | LC localhost validation sufficient; pilot delayed; SalesOS reconciliation scheduled later |
| **LC runtime** | Prisma repository for Content Studio works when `DATABASE_URL` points at this DB and tables exist |
| **Pilot impact** | **Blocks** clean `migrate status` on pilot DB L6 gate (B1 remains OPEN) |
| **Deploy impact** | Any future `migrate deploy` on shared DB applies **SalesOS P0/P1** pending migrations, not LC re-apply |

**Acceptance criteria for Option C:**

- Stakeholders accept B1 OPEN on scorecard (`localcontentos-v01-readiness-scorecard.md`).
- Pilot handoff condition #2 waived or deferred (file-backend-only pilot not recommended for persistence sign-off).
- No agent or CI job runs blind `migrate deploy` against shared DB.
- Ticket opened for Option A or B with owner and target date.

**Approvers:** LC product owner (waiver) + Platform lead (acknowledged shared DB risk).

---

## Option comparison

| Criterion | Option A (LC pilot DB) | Option B (DBA reconcile) | Option C (defer) |
|-----------|------------------------|--------------------------|------------------|
| Unblocks LC pilot persistence | **Yes** (clean DB) | **Yes** (if successful) | Partial (localhost only) |
| L6 B1 gate | **Closes** (on pilot DB) | **Closes** (on shared DB) | **Stays OPEN** |
| SalesOS coupling | Low (isolated DB) | High (shared) | Latent on shared DB |
| LC agent executable | Document + status only | **No** | Document only |
| Effort | Medium (new DB) | High (DBA) | Low |
| Risk | Low on fresh DB | High on shared DB | Medium (accidental deploy) |

**Platform recommendation:** **Option A** for near-term LC internal pilot; parallel **Option B** backlog if shared `aqliya` DB must remain canonical for multi-product dev.

---

## Risks

| Risk | Affected options | Mitigation |
|------|------------------|------------|
| Blind `migrate deploy` applies SalesOS DDL unexpectedly | B, C | Approval gate; read-only status first; no CI deploy to drifted DB |
| Orphan `_prisma_migrations` rows cause deploy failure mid-chain | B, C | DBA reconciliation or isolated pilot DB (A) |
| Schema on disk ≠ migration history after manual fixes | B | DDL inventory before resolve/baseline |
| Duplicate B3 row in DB-only list | B | DBA dedupe investigation |
| Pilot points at drifted DB; false ready assumption | C | Explicit `DATABASE_URL` check; pilot handoff condition #2 |
| `migrate reset` on shared DB | All | **Forbidden** without explicit approval |
| No automated rollback for LC migration | All | Backup before any deploy; manual reverse DDL only with DBA |

---

## Rollback

| Scenario | Rollback action | Owner |
|----------|-----------------|-------|
| Failed deploy mid-chain | Restore DB from pre-deploy backup; do not partial-delete `_prisma_migrations` without DBA | DBA |
| LC migration wrongly applied on wrong DB | Restore backup **or** manual `DROP TABLE` for Content Studio tables (destructive) | DBA + LC lead |
| Option A pilot DB unsuitable | Drop pilot DB; revert `DATABASE_URL`; no impact on shared DB | Ops |
| Option B reconciliation error | Restore backup taken at step 2; re-run inventory | DBA |
| Option C accidental deploy | Stop app; restore backup; open incident ticket | DBA + Platform |

No shipped automated rollback script for `20260601120000_localcontentos_content_studio`. See `localcontentos-migration-readiness.md`.

---

## Approval matrix

| Action | Approver(s) | LC agent |
|--------|-------------|----------|
| Read-only `npx prisma migrate status` | None (allowed light command) | **May run** |
| Create LC pilot database (Option A) | Product owner + DBA/Ops | Document only |
| `npx prisma migrate deploy` (any DB) | Product owner + DBA; backup confirmed | **Requires explicit approval** |
| `npx prisma migrate dev` / `prisma generate` | Same as deploy | **Requires explicit approval** |
| `_prisma_migrations` edits (Option B) | Platform architect + DBA + SalesOS lead | **Out of scope** |
| Option C waiver (B1 OPEN) | LC product owner + Platform lead | Document only |
| Production / pilot-ready claim | Human sign-off on scorecard | **NO** from agent pass |

---

## Commands reference (gated)

```bash
# From repo root — ALLOWED without deploy approval (read-only)
npx prisma migrate status

# REQUIRES EXPLICIT HUMAN APPROVAL — do not run in LC agent sessions without sign-off
npx prisma migrate deploy
npx prisma migrate dev
npx prisma generate
npx prisma migrate reset   # never on shared DB without explicit approval
```

---

## Next steps (human)

1. **Choose option** A, B, or C (or A now + B later for shared DB).
2. If **A:** Provision `aqliya_lc_pilot` (or equivalent); schedule approved deploy window.
3. If **B:** Open DBA ticket with drift matrix above; attach `_prisma_migrations` export.
4. If **C:** Update pilot handoff waiver; keep B1 OPEN on L6 scorecard.
5. Re-run read-only `migrate status` on target DB after any change; attach output to ticket.

---

## Agent pass record

| Item | Status |
|------|--------|
| `move_agent_to_root` → `C:\Users\PC\Documents\Aqliya` | Done |
| Read-only `npx prisma migrate status` | Done (exit code 1 — drift confirmed) |
| Read `localcontentos-migration-readiness.md` | Done |
| Created this plan | Done |
| `migrate deploy` / `dev` / `generate` | **Not run** |
| Git commit | **Not requested** |
| Production claim | **NO** |

**Classification:** Documentation only — **not validated** beyond localhost status capture.