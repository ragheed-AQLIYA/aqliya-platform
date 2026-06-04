# Cycle 6 — Staging Operator Checklist (G6-2 unblock)

**Purpose:** Fill `docs/validation/cycle-6/LIVE_SMOKE_REPORT.md` Required Evidence on **remote staging** so G6-7 can move from BLOCKED → CLOSED.  
**Not a substitute for:** local Docker `:5434` (proxy only).

---

## 0. Preflight (optional, local)

```powershell
$env:DATABASE_URL="<staging-connection-string>"
$env:STAGING_BASE_URL="https://staging.aqliya.ai"
node scripts/cycle6-operator-preflight.mjs
```

Exits 0 when required env vars are present (does not hit the network).

---

## 0. Prerequisites (operator)

| Item | Required |
| ---- | -------- |
| Staging `DATABASE_URL` | `postgresql://…@<host>:5432/<db>?schema=public` |
| Staging app URL | e.g. `https://staging.aqliya.ai` |
| `AUTH_SECRET` / session | Smoke user can sign in |
| Provider keys | Per `AI_PROVIDER` when `FF_AI_REAL_PROVIDERS=true` |
| Repo checkout | `main` ≥ `3bf3734` (Roadmap Phase 3 slices 1–9) + `4d24afd` (A1-09 bridge) |

---

## 1. Database (AGENT-A CP-1–CP-2)

On a host with repo + `DATABASE_URL` pointing at **staging** (not localhost proxy):

```powershell
# From repo root — set DATABASE_URL to staging first
npx prisma migrate deploy
npm run db:pgvector-health
npm run db:verify-pgvector
```

**Pass criteria:** verify JSON shows `"pgvector": true`, `"tableExists": true`, script exits 0.

If extension missing on Linux DB server, follow `docs/operations/pgvector-staging-validation-runbook.md` §2–3.

**Local full staging proxy** (dev/CI — does **not** close Cycle 6 on remote URL):

```powershell
docker compose -f docker-compose.staging.yml -f docker-compose.staging-local.yml up -d db redis
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5435/aqliya_staging"
npx prisma migrate deploy
npx prisma db seed
npm run db:verify-pgvector
npm run cycle6:smoke:audit-ai
```

---

## 2. Staging app flags (CP-3)

Set on staging deployment (staging only):

| Variable | Value |
| -------- | ----- |
| `FF_AI_RAG` | `true` |
| `FF_AI_REAL_PROVIDERS` | `true` |
| `AI_PROVIDER` | configured provider |
| API keys | per provider docs |

Confirm: `GET <staging_base_url>/api/health` → 200.

---

## 3. Live IC smoke (CP-4)

```powershell
$env:STAGING_BASE_URL="https://staging.aqliya.ai"   # actual URL
$env:DATABASE_URL="<staging>"
npm run ic:smoke:cycle5:live
```

Save stdout/JSON to `docs/validation/cycle-6/evidence/ic-smoke-cycle5-live.json`.

---

## 4. Governed AuditOS action (CP-5)

1. Sign in as tenant user with AuditOS access.
2. Open a seeded engagement; run one governed AI action (e.g. finding draft).
3. Capture from DB/UI:
   - `tenant_id` / `audit_organization_id`
   - `engagement_id`
   - `generated_audit_event_id` / `platform_audit_log_id` (`auditos_ai_generation`)
4. Confirm human-review state visible (not auto-approved).

---

## 5. Close the loop (CP-6–CP-8)

1. Fill every **BLOCKED** row in `docs/validation/cycle-6/LIVE_SMOKE_REPORT.md`.
2. Add live row to `docs/operations/ai-intelligence-activation.md`.
3. Re-run **G6-7** in `docs/operations/parallel-execution-cycle-2026-06-06-cycle-6-close.md` → set **CLOSED** only if all criteria PASS.
4. Update `docs/operations/program-execution-state.md` Cycle 6 status to **CLOSED**.

---

## 6. Escalation

| Blocker | Action |
| ------- | ------ |
| No staging URL/DB | Provision staging per `docker-compose.staging.yml` + secrets store |
| Migrate P3005 on non-empty DB | Baseline per Prisma docs; do not reset production |
| Verify fails after migrate | Runbook OPS-RB-IC01-001 |
| Live smoke provider fail | Check flags + keys; fall back to deterministic only for diagnosis |

**Director rule:** Cycle 6 stays **BLOCKED** until §3–§5 complete on **remote staging**.
