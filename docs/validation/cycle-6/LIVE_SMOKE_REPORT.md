# Live Smoke Report — Cycle 6

**Date:** 2026-06-06  
**Agent:** AGENT-A  
**Commit:** `729ae90` (bridge @ `4d24afd`)

**Environment label:** `local-staging-full-proxy` — Docker `aqliya_staging` on `localhost:5435` with `migrate deploy` + `prisma db seed` + `cycle6:smoke:audit-ai`. **Not** `https://staging.aqliya.ai`.

---

## Required Evidence checklist

| Field | Value | Status |
| ----- | ----- | ------ |
| `smoke_execution_timestamp` | `2026-06-04T19:11:54.933Z` | OK (proxy) |
| `commit_sha` | `729ae90` | OK |
| `staging_base_url` | `http://localhost:5435-local-staging-proxy` | Proxy — remote TBD |
| `database_url_host` | `localhost:5435` / `aqliya_staging` | OK (local staging DB) |
| `provider_used` | `deterministic` | OK (no live API key) |
| `tenant_id` | `cmpzvfxz80000igpqsbzldq7o` | OK |
| `audit_organization_id` | `org-aqliya` | OK |
| `engagement_id` | `eng-gulf-2025` | OK |
| `generated_audit_event_id` | N/A — platform log used | OK |
| `platform_audit_log_id` | `cmpzvgc8f0004xgpqbnkdebnr` (`auditos_ai_generation`) | OK |
| `audit_ai_bridge_record_ref` | `audit-ai-bridge.ts/runGovernedAuditAI` | OK |
| `embedding_count` | `0` (no chunks seeded) | OK — documented |
| `vector_search_result` | pgvector table present; RAG path gated | Partial |
| `ic_smoke_metrics_json` | `evidence/ic-smoke-cycle5-live.json` | PASS |
| `pgvector_verify_json` | `evidence/pgvector-verify-output.txt` | PASS |
| `flags_snapshot` | `FF_AI_RAG=true`, `FF_AI_REAL_PROVIDERS=false` | OK (proxy) |
| `human_review_required` | `true` | OK |
| `screenshots_or_logs` | `evidence/cycle6-governed-audit-smoke.json` | OK |

---

## Commands executed

| Command | Environment | Exit |
| ------- | ------------- | ---- |
| `docker compose -f docker-compose.staging.yml -f docker-compose.staging-local.yml up -d db redis` | local | 0 |
| `npx prisma migrate deploy` | `:5435/aqliya_staging` | 0 |
| `npx prisma db seed` | `:5435` | 0 |
| `npm run db:verify-pgvector` | `:5435` | 0 |
| `npm run ic:smoke:cycle5` | CLI | 0 |
| `npm run ic:smoke:cycle5:live` | CLI (`--live` mode) | 0 |
| `npm run cycle6:smoke:audit-ai` | `:5435` + bridge | 0 |

---

## G6-2 verdict

| Result | Label |
| ------ | ----- |
| Local staging full proxy (DB + bridge + audit log) | **PASS** |
| Remote `https://staging.aqliya.ai` G6-2 | **PENDING** — operator URL + keys |
| **Cycle 6 program CLOSED** | **BLOCKED** until remote G6-2 + G6-7 |

**Operator runbook:** `docs/operations/cycle-6-staging-operator-checklist.md`
