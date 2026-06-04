# Deployment Readiness Report

**Date:** 2026-06-04  
**Infrastructure:** localhost (Windows PostgreSQL 16 + optional Docker)  
**Target:** Pilot deployment

---

## 1. Database (PostgreSQL 16)

| Check | Status | Detail |
|-------|--------|--------|
| Connection | ✅ | localhost:5432, database `aqliya_pilot` |
| Version | ✅ | PostgreSQL 16.8 |
| Migrations | ✅ | 21 applied, 1 rolled back (safe), 0 pending |
| Prisma client | ✅ | Generated v7.8.0 |
| Schema drift | ⚠️ | Local-only models without migrations (not deployment-relevant) |

## 2. pgvector

| Check | Status | Detail |
|-------|--------|--------|
| Extension installed | ❌ | Not available on Windows PostgreSQL |
| Required for pilot | ❌ | `FF_AI_RAG=false` gates all RAG code |
| Deployment path | ✅ | Use `pgvector/pgvector:pg16` Docker image |
| Migration idempotent | ✅ | `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` |
| Rollback reversible | ✅ | `migrate resolve --applied` when pgvector ready |

## 3. Redis

| Check | Status | Detail |
|-------|--------|--------|
| Port 6379 | ❌ | Not running (optional) |
| Required for pilot | ❌ | Graceful fallback to in-memory |
| Server-only rate limiter with Redis | ✅ | `RATE_LIMITER=redis` remains available through `src/lib/rate-limit.ts` + `RedisRateLimiter` |
| Rate limiter fallback | ✅ | MemoryRateLimiter when Redis unavailable |
| Queue with Redis | ✅ | `FF_QUEUE_ENABLED=false` disables queue |

## 4. Rate Limiter

| Check | Status | Detail |
|-------|--------|--------|
| Middleware wiring | ✅ | Uses `checkEdgeRateLimit()` from `src/lib/rate-limit-edge.ts` |
| Edge runtime behavior | ✅ | Middleware path is intentionally memory-only and does not load Redis/ioredis |
| Redis-backed server path | ✅ | `RedisRateLimiter` with Lua EVAL atomic counters remains available for Node/server consumers |
| Tests | ✅ | 26 total rate limiter tests pass (4 middleware + 22 rate limiter) |
| Production path | ✅ | Set `RATE_LIMITER=redis` for Node/server consumers when Redis is available; Edge middleware remains memory-only |

## 5. Queue Workers

| Check | Status | Detail |
|-------|--------|--------|
| Queue enabled | ❌ | `FF_QUEUE_ENABLED=false` (pilot default) |
| Queue runtime | ✅ | `src/lib/platform/operations/queue-runtime.ts` with error handling |
| Queue tests | ✅ | Pass (try/catch + QueueError) |

## 6. Observability

| Check | Status | Detail |
|-------|--------|--------|
| Health endpoint | ✅ | `/api/health` — 7/7 checks pass |
| AI spend tracking | ✅ | `src/lib/ai/spend-tracker.ts` (O(n)→O(n)+O(m) fix applied) |
| pgvector health | ✅ | `checkPgVectorHealth()` in system-monitor.ts |
| HTTP metrics | ⚠️ | P0 gap — no request/error rate monitoring |
| Error tracking | ⚠️ | P0 gap — centralized error tracking scattered |

## 7. CI/CD

| Check | Status | Detail |
|-------|--------|--------|
| GitHub Actions | ✅ | 5 workflows |
| PostgreSQL in CI | ✅ | With pgvector |
| Terraform IaC | ✅ | 5 modules |
| Automated tests | ✅ | 919 tests in CI |
| E2E tests | ❌ | Not in CI (accepted gap) |
| SAST/DAST | ❌ | Not in CI (accepted gap) |

## 8. Backup & Recovery

| Check | Status | Detail |
|-------|--------|--------|
| Backup scripts | ✅ | 6 scripts (simple, advanced, scheduled, verify, restore, drill) |
| Automated backup | ✅ | `npm run db:backup:scheduled` |
| Restore with guard | ✅ | `CONFIRM_RESTORE` env var required |
| Restore drill | ✅ | `npm run db:restore:drill` (dry-run + verify) |
| CI backup test | ❌ | Not in CI (accepted gap) |

## 9. Health Checks

| Check | Result |
|-------|--------|
| `npx prisma validate` | ✅ |
| `npx prisma generate` | ✅ |
| `npx tsc --noEmit` | ✅ Clean |
| `npm test` | ✅ 919 passed, 0 failures |
| `npm run audit:health` | ✅ 7/7 passed |
| `npx prisma migrate status` | ✅ Up to date |

## 10. Deployment Gate Checks

| Gate Item | Status | Notes |
|-----------|--------|-------|
| Failed migration | ✅ RESOLVED | `ic01_pgvector_document_chunk` marked rolled back |
| Migrations pending | ✅ 0 | All accounted for |
| Schema valid | ✅ | Prisma validate passes |
| TypeScript | ✅ | Clean compile |
| Tests | ✅ | 919 pass |
| Health checks | ✅ | 7/7 |
| Rollback plan | ✅ | Documented |
| Docker compose | ✅ | 3 services (app, db, redis) |
| Production secrets | ⚠️ | `AUTH_SECRET` and `DOWNLOAD_TOKEN_SECRET` must be overridden |
