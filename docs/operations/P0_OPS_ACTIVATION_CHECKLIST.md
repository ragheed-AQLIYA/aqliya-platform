# P0 Ops Activation Checklist — Redis Rate Limit + ClamAV

**Status:** Active operator checklist  
**Date:** 2026-07-19  
**Owner:** Platform / DevOps  
**Authority:** ADR-108 · CEAP residuals · GOVERNANCE FREEZE (ADR-109)  
**Blocks:** Unrestricted production / L6 claims

## Problem

Code supports Redis-backed rate limiting and ClamAV upload scanning, but production ECS task definitions may still run defaults (`RATE_LIMITER=memory`, empty `SCANNER_PROVIDER`). Memory rate limits are not shared across Fargate tasks; unscanned uploads are unsafe for evidence vaults.

## Required production settings

| Variable | Required value | Why |
|----------|----------------|-----|
| `RATE_LIMITER` | `redis` | Shared counters across ECS tasks (`ecs_desired_count` ≥ 2) |
| `REDIS_URL` | ElastiCache endpoint URL | Required when `RATE_LIMITER=redis` |
| `SCANNER_PROVIDER` | `clamav` | Production uploads must be scanned |
| `CLAMAV_HOST` / `CLAMAV_PORT` | Daemon address (e.g. sidecar or host) | Scanner reachability |

Canonical local defaults: `.env.example`.

## Activation steps (operator)

### A. Redis rate limiter

1. Confirm ElastiCache Redis is reachable from ECS tasks (security groups).
2. Set task definition env: `RATE_LIMITER=redis`, `REDIS_URL=<elasticache>`.
3. Redeploy ECS service (`aqliya-prod-service`).
4. Verify: enterprise health does **not** emit `RATE_LIMITER_MEMORY` in multi-instance mode.
5. Smoke: burst requests across ≥2 tasks; confirm shared throttle behavior.

### B. ClamAV scanner

1. Deploy ClamAV daemon (sidecar, EC2 host, or managed service) reachable from app tasks.
2. Set `SCANNER_PROVIDER=clamav`, `CLAMAV_HOST`, `CLAMAV_PORT`.
3. Redeploy ECS service.
4. Upload a clean test file → accept.
5. Upload EICAR test string (in non-prod first) → reject + audit event.
6. Confirm download routes still require auth + tenant + audit.

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
