# Database State Audit

**Generated:** 2026-06-22  
**Host:** local `DATABASE_URL` → `localhost:5432/aqliya`  
**Method:** `prisma validate`, `prisma migrate status`, `prisma db seed` attempt, `npm run build`, `tabletop-db-probe.mjs`, migration file grep.

---

## Prisma Commands Executed

| Command | Result |
|---------|--------|
| `npx prisma validate` | **Pass** |
| `npx prisma migrate status` | **Database schema is up to date!** (51 migrations) |
| `npx prisma db seed` | **Fail** — `AuditRiskProcedure` table does not exist (P2021) at `prisma/seed.ts:53` |
| `npm run build` | **Pass** (exit 0) with runtime warnings: `SsoProvider` table missing during SSG |

---

## Schema vs Migration History

### Knowledge Foundation

KF tables created by migrations:

- `20270622100000_knowledge_foundation_versioning`
- `20270622110000_knowledge_foundation_version_candidate_bridge`
- `20270622120000_knowledge_foundation_release_provenance`
- `20270622130000_knowledge_foundation_release_artifact_status`
- `20270622140000_knowledge_foundation_release_trust_chain`

### Knowledge Mining gap (code evidence)

**`KnowledgeCandidate` has no `CREATE TABLE` migration.**

Grep `prisma/migrations/**/*.sql` for `CREATE TABLE "KnowledgeCandidate"` → **no matches**.

Only references:

- `20260622000000_add_knowledge_candidate_createdById` — `ALTER TABLE "KnowledgeCandidate" ADD COLUMN`

**Implication:** Fresh `prisma migrate deploy` on empty DB would fail at KF bridge migration (FK to missing table) unless schema was previously created via `db push` or manual SQL.

### Local recovery path used

`scripts/platform/tabletop-minimal-schema.sql` applied via `prisma db execute` + `migrate resolve --applied` for pending migrations (documented in bootstrap script).

---

## Local DB State (probe)

`node scripts/platform/tabletop-db-probe.mjs`:

| Check | Result |
|-------|--------|
| KF schema | present |
| ACTIVE version | 1 row (`ACTIVE`) |
| PROMOTED candidates | 2 |
| Failed releases | 0 |
| Seed users | admin, sara, mohammad with password hashes |

---

## CI Database Strategy (`.github/workflows/ci.yml`)

CI does **not** use `migrate deploy`. It runs:

```yaml
npx prisma db push --force-reset --accept-data-loss
CREATE EXTENSION IF NOT EXISTS vector;
npx prisma db push --accept-data-loss
```

This diverges from production-style migration discipline.

---

## Answers

| # | Question | Answer |
|---|----------|--------|
| 1 | Is local DB healthy? | **Partial** — KF/tabletop path works; full seed fails; many non-KF tables missing (`SsoProvider`, `AuditRiskProcedure`, …) |
| 2 | Are migrations clean? | **History marked up-to-date locally** after resolve + minimal SQL; **not proven** on empty DB via `migrate deploy` alone |
| 3 | Did bootstrap hide deeper issue? | **Yes** — it bypassed failed `migrate deploy` (drift/pgvector) and missing `KnowledgeCandidate` CREATE migration |
| 4 | Can `migrate deploy` be relied on? | **Not on drifted/partial local DB without fixes** — needs pgvector extension + `KnowledgeCandidate` baseline migration |
| 5 | Correct plan? | See Platform Recovery Plan P0/P1 |

---

## Production DB (remote)

Only indirect evidence: `https://aqliya.com/api/health` → `checks.database.ok: true`.  
KF state on production **not probed** (no DB credentials in this run).

---

## Recommended Baseline Plan

1. Add migration: `CREATE TABLE "KnowledgeCandidate"` (+ evidence/promotion tables if absent).
2. Document pgvector prerequisite or gate vector columns behind extension check.
3. Replace local drift with either fresh DB + `migrate deploy` **or** documented `db push` dev path.
4. Fix `backup.yml` secret so scheduled backups run against real `DATABASE_URL`.
