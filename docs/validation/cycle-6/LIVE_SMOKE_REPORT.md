# Live Smoke Report — Cycle 6

**Date:** 2026-06-06  
**Agent:** AGENT-A  
**Commit:** `4d24afd`

---

## Required Evidence checklist

| Field | Value | Status |
| ----- | ----- | ------ |
| `smoke_execution_timestamp` | 2026-06-06 (offline); proxy re-verify 2026-06-06 | Partial |
| `commit_sha` | `4d24afd` | OK |
| `staging_base_url` | **TBD** — `https://staging.aqliya.ai` not exercised | BLOCKED |
| `database_url_host` | `localhost:5434` (local proxy only) | Proxy only |
| `provider_used` | `deterministic` (offline `ic:smoke:cycle5`; no live API) | Offline |
| `tenant_id` | **TBD** — requires live staging action | BLOCKED |
| `audit_organization_id` | **TBD** | BLOCKED |
| `engagement_id` | **TBD** | BLOCKED |
| `generated_audit_event_id` | **TBD** | BLOCKED |
| `platform_audit_log_id` | **TBD** — `auditos_ai_generation` | BLOCKED |
| `audit_ai_bridge_record_ref` | Code present @ `audit-ai-bridge.ts`; no live invocation log | BLOCKED |
| `embedding_count` | **TBD** (FF_AI_RAG off on proxy run) | BLOCKED |
| `vector_search_result` | **TBD** | BLOCKED |
| `ic_smoke_metrics_json` | `docs/validation/cycle-6/evidence/ic-smoke-cycle5-offline.json` | Offline PASS |
| `pgvector_verify_json` | `evidence/pgvector-verify-output.txt` — `tableExists=true` after IC01 SQL on `:5434` | OK (proxy) |
| `flags_snapshot` | `FF_AI_RAG=false`, `FF_AI_REAL_PROVIDERS=false` (local shell) | Not staging |
| `human_review_required` | **true** (by design for AuditOS) | N/A until live |
| `screenshots_or_logs` | `evidence/` folder | Partial |

---

## Commands executed

| Command | Environment | Exit |
| ------- | ------------- | ---- |
| `npm run ic:smoke:cycle5` | local CLI | 0 — offline metrics PASS |
| `npm run ic:smoke:cycle5:live` | staging | **Not run** — no staging URL/keys |
| Governed AuditOS finding draft | staging app | **Not run** |

---

## G6-2 verdict

| Result | Label |
| ------ | ----- |
| Offline IC smoke | **PASS** |
| **Live staging smoke (G6-2)** | **BLOCKED** — incomplete Required Evidence |

**Cycle 6 cannot close on G6-2 until live row is filled with staging-only flags and real IDs.**

**Operator runbook:** `docs/operations/cycle-6-staging-operator-checklist.md`
