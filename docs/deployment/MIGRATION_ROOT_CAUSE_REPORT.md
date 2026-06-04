# Migration Root Cause Report

**Migration:** `20260605000001_ic01_pgvector_document_chunk`  
**Date:** 2026-06-04  
**Status:** FAILED

---

## Root Cause

**pgvector extension not installed on database server.**

The migration's first SQL statement `CREATE EXTENSION IF NOT EXISTS vector` failed because the PostgreSQL 16 installation on this machine (Windows native `postgresql-x64-16` service) does not have the `pgvector` extension installed.

### Error

```
ERROR: extension "vector" is not available
DETAIL: Could not open extension control file
  "C:/Program Files/PostgreSQL/16/share/extension/vector.control": No such file or directory.
HINT: The extension must first be installed on the system where PostgreSQL is running.
```

### Database Environment

| Property | Value |
|----------|-------|
| PostgreSQL version | 16.8 (Windows native) |
| Service | `postgresql-x64-16` |
| Port | 5432 |
| pgvector extension | NOT INSTALLED |
| Docker PostgreSQL container | Not running |

### Migration State

| Property | Value |
|----------|-------|
| Migration file | `prisma/migrations/20260605000001_ic01_pgvector_document_chunk/` |
| Finished | No (failed at first statement) |
| Rolled back | No |
| Zero state created | **YES** (failed at `CREATE EXTENSION`, no table/indexes created) |
| Data loss risk | **NONE** |

### Schema Impact

| Model | In schema.prisma? | In DB? |
|-------|-------------------|--------|
| DocumentChunk | Yes (lines 2335-2349) | **NO** |

---

## Dependency Chain

```
20260603220000_add_notification_preferences (applied)
       ↓
20260605000001_ic01_pgvector_document_chunk ← BLOCKED
       ↓
(future migrations)
```

No migrations depend on `ic01_pgvector_document_chunk` — it is the latest migration. No downstream dependency chain is broken.

---

## Affected Components

| Component | Impact |
|-----------|--------|
| Prisma migrate status | Shows failed migration — blocks `migrate deploy` |
| DocumentChunk model | Not queryable (table doesn't exist) |
| RAG/embedding queries | Unaffected — `FF_AI_RAG=false` gates all RAG code paths |
| All other models (102) | Unaffected — 21 prior migrations fully applied |
| TypeScript compilation | Unaffected — schema is valid |
| Test suite (913 tests) | Unaffected — no DocumentChunk integration tests |

---

## Verification

- `npx prisma validate`: ✅ Schema valid
- `npx prisma migrate status`: ⚠️ 22 migrations found, 1 failed
- DocumentChunk table in DB: ❌ Does not exist (confirmed via direct query)
- pgvector extension in DB: ❌ Not installed

---

## Conclusion

**Severity:** Non-critical for pilot (RAG is feature-flagged off).  
**State safety:** Zero state created. No data loss risk.  
**Repair required for:** Deployment gate (`prisma migrate status` must be clean).
