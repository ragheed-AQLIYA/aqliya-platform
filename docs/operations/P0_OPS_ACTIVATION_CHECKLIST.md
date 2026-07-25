# P0 Ops Activation Checklist — Redis Rate Limit + ClamAV

**Status:** Active operator checklist  
**Date:** 2026-07-25 (updated)  
**Owner:** Platform / DevOps  
**Authority:** ADR-108 · CEAP residuals · GOVERNANCE FREEZE (ADR-109)  
**Blocks:** Unrestricted production / L6 claims

## Code-level status (2026-07-25)

| Item | Status | Detail |
|------|--------|--------|
| Terraform: ClamAV sidecar defined | ✅ Done | `compute/main.tf` lines 222-249 — `clamav/clamav:1.3` |
| Terraform: `SCANNER_PROVIDER=clamav` env var | ✅ Done | `compute/main.tf` line 185 |
| Terraform: `RATE_LIMITER=redis` env var | ✅ Done | `compute/main.tf` line 184 |
| Scanner code: fail-closed in production | ✅ Done | `file-scanner.ts` — blocks uploads without ClamAV |
| Rate limiter code: memory+redis providers | ✅ Done | `rate-limit/index.ts` — ioredis + Lua script |
| Verification scripts | ✅ Done | `verify:redis-rate-limiter`, `platform:scanner-smoke`, `platform:rate-limit-load` |
| Middleware: `/api/platform/health` public | ✅ Done | 2026-07-25 — LB health checks unblocked |
| `RATE_LIMITER=redis` in prod task def | 🔴 Live verify | Requires AWS ECS access |
| Redis connectivity from tasks | 🔴 Live verify | Requires AWS ECS access |
| ClamAV daemon healthy | 🔴 Live verify | Requires AWS ECS access |
| EICAR test (malware rejection) | 🔴 Live verify | Requires staging environment |

## Activation steps (operator) — remaining live-infra work

### A. Redis rate limiter

1. SSH/console into ECS → confirm ElastiCache Redis reachable from tasks.
2. Verify `RATE_LIMITER=redis` in live task definition (Terraform: already set, confirm applied).
3. Run: `npm run verify:redis-rate-limiter` from within ECS task.
4. Run: `npm run platform:rate-limit-load` — 15 requests against 10-request limit → 10 allowed + 5 denied.
5. Confirm enterprise health does **not** emit `RATE_LIMITER_MEMORY` in multi-instance mode.

### B. ClamAV scanner

1. Confirm ClamAV sidecar is running: `aws ecs describe-tasks --cluster aqliya-prod --tasks <task-id>` → `clamav` container health = HEALTHY.
2. Run: `npm run platform:scanner-smoke` from within ECS task.
3. Upload EICAR test string (in staging first) → verify rejection + audit event.

## Verification record

| Check | Owner | Date | Result |
|-------|-------|------|--------|
| `RATE_LIMITER=redis` in prod task def | | | ☐ |
| Redis connectivity from tasks | | | ☐ |
| No `RATE_LIMITER_MEMORY` alert at desired count ≥ 2 | | | ☐ |
| ClamAV daemon healthy | | | ☐ |
| `SCANNER_PROVIDER=clamav` set | | | ☐ |
| Clean upload accepted | | | ☐ |
| Malware sample rejected (staging) | | | ☐ |

## Explicitly not claimed until both A and B pass

- Unrestricted “production-hardened / L6” maturity
- Full multi-instance rate-limit guarantees
- Production upload malware scanning as certified control

## Related

- `docs/audits/PENTEST_SCOPE_B-01.md`
- `infra/terraform/environments/prod/` (canonical; not `production/`)
- `docs/deployment/production-deployment-runbook.md` (if present)
