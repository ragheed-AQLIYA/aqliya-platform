# Staging pgvector Activation Report

**Date:** 2026-06-06  
**Agent:** AGENT-A  
**Commit:** `4d24afd`  
**Environment:** Local staging **full proxy** — `localhost:5435` / `aqliya_staging` (`docker-compose.staging.yml` + `docker-compose.staging-local.yml`)

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
| 1 | `docker compose … staging-local.yml up -d db redis` | OK |
| 2 | `npx prisma migrate deploy` | OK — 27 migrations on fresh `aqliya_staging` |
| 3 | `npx prisma db seed` | OK — `eng-gulf-2025` |
| 4 | `npm run db:pgvector-health` | `document_chunk_table=true`, `ff_ai_rag=enabled` |
| 5 | `npm run db:verify-pgvector` | PASS |
| 6 | `npm run cycle6:smoke:audit-ai` | PASS — `platform_audit_log_id` recorded |

**Database host (redacted):** `localhost:5435` / database `aqliya_staging`

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
