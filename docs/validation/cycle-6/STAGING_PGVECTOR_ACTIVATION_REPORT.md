# Staging pgvector Activation Report

**Date:** 2026-06-06  
**Agent:** AGENT-A  
**Commit:** `4d24afd`  
**Environment:** Local pgvector **proxy** for schema validation — `localhost:5434` (Docker `aqliya-db-1`)

---

## Remote staging

| Item | Status |
| ---- | ------ |
| `DATABASE_URL` (staging RDS/VM) | **Not available in agent session** |
| `https://staging.aqliya.ai` live verify | **Not executed** |

**G6-1 for Cycle 6 CLOSED:** requires repeat of this report against **production-like staging DB**, not localhost only.

---

## Execution log (local proxy)

| Step | Command | Result |
| ---- | ------- | ------ |
| 1 | Docker `aqliya-db-1` running | OK |
| 2 | `npx prisma migrate deploy` | P3005 on non-baselined `:5434`; IC01 applied via `prisma db execute` on `20260605000001_ic01_pgvector_document_chunk` |
| 3 | `npm run db:pgvector-health` | `pgvector_extension=true`, `document_chunk_table=true` |
| 4 | `npm run db:verify-pgvector` | PASS JSON: `pgvector=true`, `tableExists=true` |

**Database host (redacted):** `localhost:5434` / database `aqliya`

---

## Evidence files

- `docs/validation/cycle-6/evidence/pgvector-verify-output.txt` (verify JSON)
- `docs/validation/cycle-6/evidence/pgvector-health-output.txt`

---

## Verdict

| Scope | Result |
| ----- | ------ |
| Schema + pgvector on Docker proxy | **PASS** |
| Remote staging G6-1 | **PENDING** — operator `DATABASE_URL` required |
