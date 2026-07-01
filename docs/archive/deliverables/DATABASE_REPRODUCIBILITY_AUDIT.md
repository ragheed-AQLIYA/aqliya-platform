# Database Reproducibility Audit

**Generated:** 2026-06-23  
**Objective:** Prove fresh PostgreSQL → `prisma migrate deploy` → `prisma db seed` without manual recovery  
**Method:** Evidence-only; no `migrate resolve`, no `tabletop-minimal-schema.sql`, no schema patching

---

## Environment

| Item | Value |
|------|-------|
| Host OS | Windows 10 (build 26200) |
| PostgreSQL | Native install, port 5432 (`C:/Program Files/PostgreSQL/16/`) |
| Fresh DB name | `aqliya_p0_fresh` |
| Docker | **Not running** (`dockerDesktopLinuxEngine` pipe missing) |
| HEAD | `6f607840ac032e13c07564c7bbc873772ca076fa` |

### Fresh database creation (evidence)

```text
node -e "... DROP DATABASE IF EXISTS aqliya_p0_fresh WITH (FORCE); CREATE DATABASE aqliya_p0_fresh;"
→ DB_CREATED aqliya_p0_fresh
```

Connection string used:

```text
postgresql://postgres:postgres@localhost:5432/aqliya_p0_fresh
```

---

## Phase B — `npx prisma migrate deploy`

**Result: FAIL**

### Command output (abridged)

```text
51 migrations found in prisma/migrations

Applying migration `20260506103224_init_postgres`
...
Applying migration `20260605000001_ic01_pgvector_document_chunk`
Error: P3018

Migration name: 20260605000001_ic01_pgvector_document_chunk

Database error code: 0A000
Database error:
ERROR: extension "vector" is not available
DETAIL: Could not open extension control file "C:/Program Files/PostgreSQL/16/share/extension/vector.control": No such file or directory.
HINT: The extension must first be installed on the system where PostgreSQL is running.
```

### Failure analysis

| Field | Value |
|-------|-------|
| **Failing migration** | `20260605000001_ic01_pgvector_document_chunk` |
| **SQL trigger** | `CREATE EXTENSION IF NOT EXISTS vector;` |
| **Issue type** | Missing PostgreSQL extension (pgvector not installed on host) |
| **Migrations applied before fail** | 22 of 51 |
| **Dependency** | IC-01 DocumentChunk embedding column requires pgvector |

### Repository expectation vs host

| Source | PostgreSQL image / requirement |
|--------|-------------------------------|
| `.github/workflows/ci.yml` | `pgvector/pgvector:pg16` service |
| `docker-compose.pgvector.yml` | `pgvector/pgvector:pg16` on port 5434 |
| Native Windows PG16 | **No pgvector** — fails at migration 23 |

**Note:** Docker was unavailable on audit host, so CI-equivalent pgvector Postgres could not be started for a second deploy attempt.

---

## Predicted Second Failure (static analysis — not reached)

If pgvector were available, migration `20260622000000_add_knowledge_candidate_createdById` would run:

```sql
ALTER TABLE "KnowledgeCandidate" ADD COLUMN "createdById" TEXT;
```

Grep across `prisma/migrations/**/*.sql`:

```text
CREATE TABLE.*KnowledgeCandidate → No matches
KnowledgeCandidate references → only ALTER (20260622000000) and FK (20270622110000)
```

**Expected error:** `relation "KnowledgeCandidate" does not exist`  
See `MIGRATION_FORENSICS_REPORT.md` for full lineage evidence.

---

## Phase C — `npx prisma db seed`

**Result: NOT RUN**

Blocked by migrate deploy failure. Seed requires complete schema from migrations.

---

## Phase D — `npm run build`

**Result: PASS** (executed on developer machine with existing env; not gated on fresh DB seed)

Build completed successfully (~165s). This validates application compile, not database bootstrap.

---

## Phase E — `npm test`

**Result: PASS**

```text
Test Suites: 4 skipped, 307 passed, 307 of 311 total
Tests:       21 skipped, 2912 passed, 2933 total
Time:        17.113 s
```

Tests use mocks / isolated DB fixtures; they do **not** prove `migrate deploy` on empty Postgres.

---

## CI vs P0 Success Criteria Gap

| Step | P0 criteria | CI workflow (`.github/workflows/ci.yml`) |
|------|-------------|------------------------------------------|
| Schema apply | `prisma migrate deploy` | `prisma db push --force-reset` + extension SQL + `db push` |
| pgvector | Required via migration | Created manually in CI step before second push |
| KnowledgeCandidate gap | Would fail on deploy | **Masked** by `db push` from full `schema.prisma` |

**Finding:** CI green does not prove migration-chain reproducibility.

---

## Verdict (Database Chain)

| Step | Status |
|------|--------|
| Fresh DB created | **PASS** |
| `migrate deploy` | **FAIL** (pgvector @ migration 23; KnowledgeCandidate gap predicted @ ~40) |
| `db seed` | **NOT RUN** |
| Reproducible from source only | **NO** |

---

## Required Remediation (documentation only — not executed in P0)

1. Document mandatory Postgres image: `pgvector/pgvector:pg16` (or install pgvector on host).
2. Add missing `CREATE TABLE "KnowledgeCandidate"` (+ related enums/tables) migration **before** `20260622000000_add_knowledge_candidate_createdById`.
3. Re-run full chain: fresh DB → `migrate deploy` → `seed` on pgvector Postgres without `db push`.
