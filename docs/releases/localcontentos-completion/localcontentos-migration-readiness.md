# LocalContentOS — Migration Readiness

**Date:** 2026-06-01  
**Migration:** `20260601120000_localcontentos_content_studio`  
**Path:** `prisma/migrations/20260601120000_localcontentos_content_studio/`  
**Checked:** 2026-06-01 (read-only `npx prisma migrate status`)

> **Decision required:** Applying **new** migrations or reconciling history drift requires **explicit user approval** per AQLIYA low-load protocol. Do not run `migrate deploy`, `migrate dev`, or `prisma generate` without approval.

**Status:** **APPLIED on localhost DB (last common migration) — history drift present — further deploy needs approval**

---

## `npx prisma migrate status` (exact output)

Captured 2026-06-01 against datasource `postgresql://…@localhost:5432/aqliya` (schema `public`). Exit code: **1** (Prisma reports history mismatch).

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

### Interpretation (this environment)

| Finding | Meaning |
|--------|---------|
| Last common migration = `20260601120000_localcontentos_content_studio` | **LocalContentOS Content Studio tables are recorded as applied** on this database. |
| Three pending local migrations (SalesOS) | Not applied on this DB yet. |
| Six DB-only migration names (SalesOS tiers) | **History drift** — DB `_prisma_migrations` rows do not match current `prisma/migrations/` folder. |
| Exit code 1 | Status check succeeded in reporting; Prisma flags **do not deploy blindly**. |

**Validation:** read-only status only — **not validated** for other hosts, staging, or production.

---

## What the migration adds

Tables (PostgreSQL) — from `migration.sql`:

- `ContentStudioProject`
- `ContentStudioCampaign`
- `ContentStudioSource`
- `ContentStudioItem`
- `ContentStudioReview`
- `ContentStudioApproval`
- `ContentStudioOutput`

Indexes and FKs align with `prisma/schema.prisma` Content Studio models. **No destructive drops** in this migration.

---

## Runtime behavior today

| Condition | Persistence |
|-----------|-------------|
| `DATABASE_URL` set + migration **applied** | Prisma repository |
| `DATABASE_URL` set + migration **pending** | May error on Content Studio writes |
| `LOCALCONTENT_CONTENT_BACKEND=file` (tests) | `.data/localcontentos-content/store.json` |

Unit tests use file backend (`content-studio.test.ts` — 9/9 PASS per prior handoff).

---

## Pre-apply checklist (human)

1. Backup database (org policy).
2. Confirm no conflicting manual DDL on Content Studio table names.
3. Run **read-only** status: `npx prisma migrate status` (allowed light command).
4. Review SQL in `migration.sql` (no destructive drops in this migration).
5. **If status shows history drift:** resolve SalesOS migration naming mismatch with DBA/platform owner **before** `migrate deploy`.

---

## USER APPROVAL GATE

**Do not run the commands below until a human explicitly approves** (ticket / chat / runbook sign-off).

### When to approve

| Target | LocalContentOS migration `20260601120000` |
|--------|-------------------------------------------|
| **This localhost DB** (`aqliya` @ `localhost:5432`) | **Already applied** — no re-apply needed for Content Studio tables. |
| **Fresh or empty database** | Approve deploy to apply full migration chain including this migration. |
| **Other environment (staging/prod)** | Run read-only `npx prisma migrate status` there first; approve only if this migration is listed as pending. |

### Command to run when approved

```bash
# From repo root: C:\Users\PC\Documents\Aqliya
# After backup + drift resolution (if any):
npx prisma migrate deploy
```

**On this localhost DB today:** `migrate deploy` would attempt to apply the **three pending SalesOS migrations** (`20260601140000` … `20260601160000`), not re-run LocalContentOS. Approve only if SalesOS P0/P1 schema changes are intended for this database.

Optional dev workflow (creates/applies in dev — **also requires approval** in agent sessions):

```bash
npx prisma migrate dev
```

Post-apply (separate approval in agent sessions):

```bash
npx prisma generate
```

### Risks

- **History drift:** Deploy on a DB with orphan `_prisma_migrations` rows may fail or leave Prisma in a inconsistent state until history is reconciled (baseline, resolve, or DBA-led alignment).
- **SalesOS pending migrations:** `migrate deploy` on this host applies SalesOS P0/P1 DDL, not only LocalContentOS — scope approval accordingly.
- **Downtime / locks:** `CREATE TABLE` / `CREATE INDEX` on live DBs can lock briefly; schedule maintenance window for production-like DBs.
- **No automated rollback:** Failed mid-deploy may require manual cleanup + restore.

### Rollback note

No automated rollback script is shipped for `20260601120000_localcontentos_content_studio`.

- **Rollback** = restore from backup taken immediately before deploy, **or** manual `DROP TABLE` / reverse DDL documented in a change ticket (destructive; only with DBA approval).
- Do not use `prisma migrate reset` on shared or production databases without explicit approval.

---

## Recommendation

- **LocalContentOS Content Studio on localhost:** Tables should exist; verify with `\dt ContentStudio*` or app smoke test — **light validated** via migrate status only.
- **Before pilot/production-like use:** Run `migrate status` on each target DB; resolve SalesOS drift before any deploy.
- See `localcontentos-pilot-handoff.md` for pilot conditions.

---

## L6 persistence status (Worker 5 — Governance & Persistence)

**Date:** 2026-06-01  
**Validation:** read-only `npx prisma migrate status` (re-run this session; exit code 1 = history drift flag only)

| Layer | Status | Notes |
|-------|--------|-------|
| **Content Studio (L6)** | **Applied on localhost** | Last common migration `20260601120000_localcontentos_content_studio` — Prisma repository active when `DATABASE_URL` is set. |
| **Compliance workspace (L5)** | **Prisma** | Existing `LocalContent*` tables; mutations in `localcontent-actions.ts`. |
| **File backend fallback** | **Test / explicit env** | `LOCALCONTENT_CONTENT_BACKEND=file` → `.data/localcontentos-content/store.json` (unit tests; not pilot path). |
| **Pilot / production-like DB** | **Not validated** | Run read-only status per environment before any deploy. |

**Governance persistence coupling:** Platform audit events use `Product.LOCAL_CONTENT` (`local_content`) via `auditLogger` on compliance actions, Content Studio workspace actions, and report/evidence download API routes. Dual-write failures are swallowed so mutations are not blocked.

---

## OUT OF SCOPE — SalesOS migration drift (blocker note)

**Do not fix SalesOS in LocalContentOS L6 work.**

| Symptom | Impact on LocalContentOS |
|---------|--------------------------|
| Six DB-only `_prisma_migrations` rows (SalesOS tier names) | `migrate status` exit code **1** on shared localhost DB |
| Three pending local migrations (`20260601140000` … `20260601160000`) | `migrate deploy` would apply **SalesOS P0/P1 DDL**, not re-apply LocalContentOS Content Studio |
| Repo-wide tsc noise (SalesOS binary corruption) | Unrelated to LocalContentOS file scope; see scorecard |

**Resolution owner:** Platform / DBA + SalesOS program — baseline, resolve, or reconcile history **before** any shared `migrate deploy`. LocalContentOS L6 does **not** include SalesOS migration edits.

---

## Production claim

**NO** — agent pass performed read-only status only. No `migrate deploy`, no `migrate dev`, no `prisma generate`. Not production-ready.
