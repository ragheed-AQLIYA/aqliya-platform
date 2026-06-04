# Cycle 6 — Remote Operator Packet (single page)

**Purpose:** Close G6-2 + G6-7 on **real** staging — not local `:5435` proxy.  
**Baseline:** `main` ≥ `e791cc1`  
**Full checklist:** `cycle-6-staging-operator-checklist.md`  
**Blockers:** `docs/validation/cycle-6/CERTIFICATION_BLOCKERS.md`

---

## 1. Environment (set once)

```powershell
$env:DATABASE_URL = "postgresql://USER:PASS@HOST:5432/DB?schema=public"
$env:STAGING_BASE_URL = "https://staging.aqliya.ai"   # or actual host
$env:AUTH_SECRET = "<same as staging deployment>"
$env:FF_AI_RAG = "true"
$env:FF_AI_REAL_PROVIDERS = "true"   # required for live row; use deterministic only for diagnosis
```

| Check | Command |
| ----- | ------- |
| Preflight (no network) | `node scripts/cycle6-operator-preflight.mjs` |
| DNS / health | `curl -fsS "$env:STAGING_BASE_URL/api/health"` |

If preflight warns `localhost:5435` — you are still on **proxy**; Cycle 6 will not close.

---

## 2. Database migrations (staging)

Deploy **all** pending migrations, including:

| Migration | Purpose |
| --------- | ------- |
| `20260605000001_ic01_pgvector_document_chunk` | pgvector / DocumentChunk |
| `20260607100000_audit_evidence_version` | AuditOS evidence versions |
| `20260608000001_add_embedding_json_fallback` | IC embedding fallback |
| `20260608000002_add_ingestion_batch_document` | Ingestion batch |

```powershell
npx prisma migrate deploy
npm run db:pgvector-health
npm run db:verify-pgvector
```

**Pass:** verify exits 0, `"pgvector": true`, `"tableExists": true`.

---

## 3. Automated remote smoke (preferred)

```powershell
npm run cycle6:remote-smoke
```

Runs (in order): migrate deploy → verify pgvector → `ic:smoke:cycle5:live` → `cycle6:smoke:audit-ai` (when env set).

**Local equivalent (does not close remote):** `npm run cycle6:full-run`

---

## 4. Evidence capture

```powershell
node scripts/cycle6-smoke-report-stamp.mjs
```

Paste output into `docs/validation/cycle-6/LIVE_SMOKE_REPORT.md`:

- Replace `staging_base_url` with real HTTPS URL (not `localhost:5435-local-staging-proxy`)
- Set `commit_sha` to stamped SHA
- Set `platform_audit_log_id` from smoke JSON / DB query

Copy artifacts:

| Artifact | Path |
| -------- | ---- |
| IC live smoke | `docs/validation/cycle-6/evidence/ic-smoke-cycle5-live.json` |
| Governed audit smoke | `docs/validation/cycle-6/evidence/cycle6-governed-audit-smoke.json` |
| pgvector verify | `docs/validation/cycle-6/evidence/pgvector-verify-output.txt` |

---

## 5. Human UI spot-check (5 min)

1. Sign in: `admin@aqliya.com` / `admin123` (or staging seed user).
2. `/audit` → open seeded engagement → one governed AI action.
3. Confirm **human review required** — no auto-approval.
4. Optional: `/local-content`, `/decisions` — tenant-scoped data only.

**Demo script (customer-facing):** `customer-demo-runbook.md` + `npm run demo:smoke`

---

## 6. Close program gates

| Step | File / action |
| ---- | ------------- |
| G6-7 PASS | `parallel-execution-cycle-2026-06-06-cycle-6-close.md` — all rows PASS |
| Activation log | `ai-intelligence-activation.md` — live staging row |
| Program state | `program-execution-state.md` — Cycle 6 **CLOSED** |
| Phase 4 | `phase-4-entry-checklist.md` Gate 0 complete |

**Director rule:** Do **not** set CLOSED if `REMOTE_STAGING_PROBE.md` still shows DNS FAIL for the target URL.

---

## 7. Escalation

| Symptom | Action |
| ------- | ------ |
| DNS FAIL | Provision host; update probe doc after `curl` PASS |
| Migrate P3005 | Baseline per Prisma — no production reset |
| pgvector verify fail | `pgvector-staging-validation-runbook.md` |
| Provider errors | Keys + `FF_AI_*`; retry with `FF_AI_REAL_PROVIDERS=false` for diagnosis only |
| Cycle 6 still BLOCKED | Re-read `CERTIFICATION_BLOCKERS.md` #1 and #7 |

---

**Status when complete:** Cycle 6 **CLOSED** → Phase 4 Gate 0 unblocked (pentest/Terraform remain).
