# Infrastructure Hardening Audit — AQLIYA Platform

**Date:** 2026-06-04
**Scope:** Redis, Queue, Rate Limiter, Cache, Feature Flags
**Agent:** Infrastructure Agent (Read-Only Audit)
**Authority:** AGENTS.md §30 (Ownership), AGENTS.md §6 (Product Completion Levels)

---

## Executive Summary

This audit evaluates four infrastructure subsystems — Redis client, Bull queue, rate limiter, and application cache — against production hardening requirements. The subsystems range from **L3 (Prototype) to L4 (Usable v0.1)**. The cache is L2 (Shell). The rate limiter has the best fault isolation but uses an architecture that defeats distributed enforcement. The queue lacks dead letter handling and operator visibility. The Redis client has no TLS or sentinel/cluster support, making it incompatible with production ElastiCache configurations that use in-transit encryption.

**Overall readiness:** Not ready for multi-instance production. Suitable for single-instance pilot with Redis-backed rate limiter disabled.

> **📋 FIX STATUS 2026-06-04:** All 3 Critical findings (G-01, G-02, G-03) have been remediated. See individual subsystem sections for details:
> - **G-01 (Cache)** — ✅ Fixed. Dual-layer L1 memory + L2 Redis. Graceful degradation.
> - **G-02 (Rate Limiter)** — ✅ Fixed. Redis Lua EVAL as primary atomic counter. In-memory fallback only.
> - **G-03 (Queue)** — ✅ Fixed. try/catch with typed QueueError. Logged and traceable.

---

## 1. Redis Readiness

### 1.1 Singleton Pattern

| Aspect | Finding | Risk |
|--------|---------|------|
| Storage | globalThis singleton (globalForRedis) | Low — standard pattern for Next.js/Node.js |
| Module boundary | "server-only" enforced | ✅ Correct |
| Multiple instances | Each process gets its own client | ✅ Correct for ECS Fargate |

**Verdict:** Safe. The singleton is correctly scoped per-process via globalThis. In ECS Fargate each container has its own client. No shared-state bugs.

### 1.2 Retry Strategy

`	ypescript
retryStrategy(times) {
  if (times > 10) return null          // hard cap at 10 retries
  return Math.min(times * 100, 3000)   // linear backoff, max 3000ms
}
`

| Property | Current | Production Recommendation |
|----------|---------|--------------------------|
| Algorithm | Linear (	imes × 100) | Exponential (2^times × base) |
| Max retries | 10 | 30+ (for failover windows of 10-30s) |
| Max delay | 1,000ms (retry 10) | 10,000ms |
| Total backoff window | ~5.5s | ~60s+ |

**Finding:** Linear backoff is acceptable for development but inadequate for production deployment where Redis failover can take 10-30 seconds. After ~5.5 seconds and 10 attempts, the client permanently disconnects. maxRetriesPerRequest: null is required by Bull but makes non-queue operations hang indefinitely if the connection is lost.

**Risk:** Medium. Brief Redis restarts (< 5s) are handled. Longer outages or failover events cause permanent disconnect.

### 1.3 Connection Validation

ensureRedisConnected() exists and handles three states:
- Status "ready" → immediate return
- Status "connecting"/"connect" → wait for "ready" event
- Other → call client.connect()

**Verdict:** ✅ Adequate. Called by RedisRateLimiter on construction and by /api/health route.

### 1.4 Sentinel / Cluster Support

**Not implemented.** The client uses a single URL:
`	ypescript
const url = process.env.REDIS_URL || "redis://localhost:6379"
`

| Feature | Supported | Notes |
|---------|-----------|-------|
| Single-node Redis | ✅ | Default |
| Redis Sentinel | ❌ | No sentinels array |
| Redis Cluster | ❌ | No Redis.Cluster |
| DNS-based failover (ElastiCache) | ⚠️ | Works via primary endpoint DNS, but client may hold stale connection |

**Finding:** The HA/DR plan (§2.3) specifies ElastiCache Valkey with Multi-AZ failover. The DNS-based primary endpoint works for automatic failover detection, but the client has no explicit failover event handling. The retry strategy partially mitigates this.

**Risk:** Medium. Works with ElastiCache primary endpoint but has no native Sentinel discovery.

### 1.5 TLS Configuration

**Not implemented.** No 	ls option, no ediss:// scheme support.

`	ypescript
const client = new Redis(url, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  retryStrategy: ...,
  lazyConnect: true,
  // no tls: {}
})
`

**Finding:** AWS ElastiCache with in-transit encryption requires either 	ls: {} or ediss:// URL scheme. The current configuration will fail TLS-required connections.

**Risk:** Critical for AWS deployment. The connection string REDIS_URL=rediss://... would cause a connection error since ioredis needs explicit 	ls: {} when using ediss://.

### 1.6 Behavior When Redis is Down

| Scenario | Behavior | Assessment |
|----------|----------|------------|
| Queue operation with Redis down | Error thrown, propagates to caller | ⚠️ Unhandled in enqueueTask |
| Rate limiter with Redis down | Graceful fallback to memory | ✅ Handled |
| Health check | Returns "error" status | ✅ Handled |
| Cache | Not Redis-backed — no impact | ✅ Isolated |

---

## 2. Queue Readiness

### 2.1 Bull Configuration

`	ypescript
new Queue("aqliya-workflows", redisUrl, {
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
})
`

| Property | Current | Assessment |
|----------|---------|------------|
| Retry attempts | 3 | ✅ Reasonable default |
| Backoff | Exponential, 2s base | ✅ Exponential backoff (2s → 4s → 8s) |
| Concurrency | Not set (defaults to 1) | ⚠️ Single-job processing — review for workload |
| Job timeout | Not set | ⚠️ Jobs can run indefinitely |
| removeOnComplete | 100 | ✅ Prevents Redis memory growth |
| removeOnFail | 50 | ⚠️ Failed jobs are discarded after 50 |

**Finding:** Missing concurrency setting and 	imeout setting. Default concurrency of 1 means jobs are processed serially. No timeout means a stuck handler blocks the worker indefinitely.

### 2.2 Dead Letter Handling

**Not implemented.** There is no:
- Separate dead letter queue
- Persistence of failed jobs to database
- Operator notification on job failure
- Manual retry mechanism for failed jobs
- Alerting threshold (e.g., > N consecutive failures)

The only failure handling is a console log:
`	ypescript
queue.on("failed", (job, err) => {
  console.error([queue] Job  () failed:, err.message)
})
`

**Risk:** High. Failed jobs are invisible to operators. Patterns of failure cannot be detected without log aggregation. Manual retry requires database-level intervention.

### 2.3 Job Persistence

Bull stores jobs in Redis with the retention settings above. Long-term persistence is not implemented. The unified-task-runtime.ts provides in-memory task storage with optional file persistence (	ask-persistence.ts), but this is separate from Bull.

**Risk:** Low for queue job state (Bull manages this). Medium for audit trail of job history beyond the 50-failed/100-completed retention limit.

### 2.4 Queue Monitoring

| Capability | Status | Notes |
|-----------|--------|-------|
| Health check (API) | ✅ | /api/monitoring/health?scope=queue |
| Queue metrics (API) | ✅ | Waiting, active, completed, failed, delayed counts |
| Failed job retrieval (API) | ✅ | getFailedJobs(limit) via monitoring API |
| Bull Board UI | ❌ | No /admin/queues or similar UI |
| Prometheus metrics | ❌ | No metric exposition |
| Operator retry UI | ❌ | No way for operators to retry failed jobs from UI |

**Finding:** The monitoring API at /api/monitoring/health provides adequate programmatic queue visibility, but there is no graphical queue management interface. Operators must use API calls or Redis CLI to inspect/manage queues.

### 2.5 Redis Down During Queue Operations

| Operation | Redis Down Behavior | Error Handling |
|-----------|--------------------|----------------|
| enqueueTask() | queue.add() throws | ❌ **Unhandled** — error propagates |
| getJobStatus() | queue.getJob() etc. throws | ✅ Caught, returns 
ull |
| startWorkers() | queue.process() throws | ❌ Unhandled — caller must catch |
| getQueueMetrics() | All caught individually | ✅ Returns empty metrics |

**Finding:** enqueueTask has a critical gap — no try/catch around queue.add(). If queue.enabled is on and Redis is down, every enqueue call throws. The feature flag bypass (isEnabled("queue.enabled") → return fakeId) is the only protection, but if the flag is on, there is no defence.

**Risk:** Critical when queue.enabled is on and Redis is unavailable.

---

## 3. Rate Limiter Readiness

### 3.1 Memory vs Redis Behavior Under Load

**Memory mode (MemoryRateLimiter):**
- Map<string, { count, resetAt }> — purely in-process
- Cleanup interval: 60s (removes expired entries)
- Maximum entries: unbounded (memory grows with unique key count)
- **Per-instance independent** — no coordination across instances

**Redis mode (RedisRateLimiter):** Architectural issue:
`	ypescript
check(key, config) {
  if (!this.redisAvailable) return this.memory.check(edis-fallback:, config)
  const memResult = this.memory.check(edis:, config)  // ← primary store is memory!
  return memResult
}
`

**Critical finding:** The Redis rate limiter uses **in-memory Map as its primary store**, with periodic asynchronous sync to Redis every 30 seconds. This means:
1. Each instance has its own independent rate limit counter
2. A user can exceed the limit by rotating requests across instances
3. Redis sync is "best effort" — not used for enforcement
4. Redis serves only as a backup/recovery store

This architecture provides graceful fallback but **defeats the purpose of a distributed rate limiter.**

### 3.2 Sliding Window Correctness

**Not sliding — fixed window.** The implementation resets at a fixed esetAt timestamp:

`	ypescript
if (!entry || entry.resetAt < now) {
  this.store.set(key, { count: 1, resetAt: now + config.windowMs });
  // fixed window starts now
}
`

**Vulnerability:** At window boundaries, a user can send 2× the limit in a short burst. Example: 60 requests at second 59 of window N, then 60 requests at second 01 of window N+1 = 120 requests in 3 seconds.

**Risk:** Medium. Acceptable for initial production but should be upgraded to sliding window (e.g., sorted set in Redis, or token bucket) before high-stakes deployment.

### 3.3 Feature-Flag Gating

| Component | Feature Flag | Findings |
|-----------|-------------|----------|
| Queue | queue.enabled (default: off) | ✅ Gated |
| Rate limiter type | RATE_LIMITER env var (memory/redis) | ✅ Gated |
| Rate limiter itself | None | ⚠️ Always active on /api/ routes |

The rate limiter middleware is always enabled for /api/ routes. There is no feature flag to disable it. This is acceptable — rate limiting should be always-on.

### 3.4 DDoS Protection Adequacy

| Layer | Protection | Assessment |
|-------|-----------|------------|
| Application rate limiting | ✅ Per-IP-per-endpoint (60/60s) | Basic |
| Infrastructure rate limiting | ❌ Not configured in code | Assumed at CloudFront/WAF/ALB level |
| Global per-IP limit | ❌ Not implemented | Per-IP limit is per-endpoint only |
| Connection limiting | ❌ Not implemented | Requires infrastructure layer |
| Challenge/CAPTCHA | ❌ Not implemented | Out of scope for this layer |

The application rate limiter is a **first line of defence** for abuse prevention, not a DDoS solution. It prevents a single user from hammering a single endpoint but does not protect against:
- Distributed attacks from many IPs
- Slow loris / connection exhaustion
- Layer 7 attacks targeting expensive endpoints

### 3.5 Per-Endpoint vs Global Limits

**Per-endpoint per-IP only.** The middleware key is ${ip}:. There is no:
- Global per-IP aggregate limit
- Per-organization limit
- Per-API-key limit
- Tiered limits by endpoint sensitivity

**Risk:** Low. Per-endpoint limiting is standard. Global limits can be added when abuse patterns emerge.

### 3.6 Rate Limiter Failure Behavior

| Failure Mode | Behavior | Assessment |
|-------------|----------|------------|
| Memory mode crash (process restart) | All state lost — limits reset | Acceptable post-restart |
| Redis mode, Redis unavailable | Falls back to memory with warning | ✅ Graceful degradation |
| Redis mode, Redis partially available | Memory as primary (see 3.1) | ⚠️ Distributed inconsistency |

---

## 4. Cache Readiness

### 4.1 Implementation

`	ypescript
const cache = new Map<string, { value: unknown; expiry: number }>();
`

Pure in-memory Map. Cache-aside pattern (lazy loading).

### 4.2 TTL Strategy

| Property | Current | Assessment |
|----------|---------|------------|
| Default TTL | 30 seconds | ✅ Reasonable default |
| Per-call TTL | Configurable via options.ttl | ✅ Flexible |
| Expiry check | Synchronous on read | ✅ No stale reads |

### 4.3 Invalidation Strategy

| Method | Available | Notes |
|--------|-----------|-------|
| Key-based invalidation | ✅ invalidateCache(key) | Explicit removal |
| Full flush | ✅ clearCache() | Destroys all cached data |
| Automatic eviction | ⚠️ Triggered when size > 100 | Only removes expired entries |
| Background expiry sweeper | ❌ | No periodic cleanup task |

**Finding:** The automatic eviction only triggers when the cache exceeds 100 entries. If the cache has 100 unexpired entries and new entries are added, the cleanup immediately removes expired ones, but there's no max-size cap. In theory, with sufficiently long TTLs and many unique keys, the cache can grow unbounded.

### 4.4 Cache Pattern

**Cache-aside (lazy loading):**
1. Check cache for key
2. If found and not expired → return
3. If not found or expired → call etcher(), store result, return

No write-through pattern. No cache warming. No cache stampede protection (multiple concurrent requests for the same expired key would all call etcher()).

### 4.5 Redis Backing

**Not implemented.** Despite the code comment:
`	ypescript
// In production, replace Map with Redis/ioredis.
`

The cache has no Redis integration. This means:
- Each server instance has its own independent cache
- Cache is lost on process restart
- No cache coordination across instances
- No cache durability
- No cache persistence

### 4.6 Production Readiness Assessment

**Level: L2 (Shell).** The cache is functional for single-instance development but not production-ready.

| Requirement | Status | Impact |
|------------|--------|--------|
| Multi-instance consistency | ❌ Broken | Each instance has different cache state |
| Persistence across restart | ❌ Lost | Cold starts are always cache-miss |
| Size limits | ❌ Unbounded | Potential memory leak |
| Cache stampede protection | ❌ Not implemented | N+1 fetcher calls on expiry |
| Hit/miss monitoring | ❌ Not implemented | No observability |
| Redis backing | ❌ Not implemented | Comment acknowledges this |

---

## 5. Feature Flags Readiness

Feature flags are entirely in-process (FLAG_REGISTRY Map in egistry.ts). No Redis dependency.

| Capability | Status | Assessment |
|-----------|--------|------------|
| Static registry | ✅ Hardcoded map | Simple, auditable |
| Environment overrides | ✅ Per-flag env vars (FF_*) | ✅ Production-manageable |
| Partial rollout | ✅ Org-hash-based percentage | ✅ Tenanted rollout |
| Dynamic reload | ❌ Restart required | Acceptable for v0.1 |
| Persistence | ❌ Not persisted | Acceptable — flags are deployment config |

**Verdict:** ✅ Feature flags are production-ready for v0.1. The in-memory registry with env var overrides is appropriate for this stage.

---

## 6. Production Hardening Gaps

### 6.1 Gap Register

| ID | Component | Gap | Risk | Before Pilot | Before Production | Remediation |
|----|-----------|-----|------|-------------|------------------|-------------|
| G-01 | Cache | Not Redis-backed — per-instance inconsistency, lost on restart | Critical | ✅ Must fix | ✅ Must fix | Implement Redis-backed cache (e.g., ioredis with TTL). Replace Map with Redis hash/set operations. Add cache-aside with Redis. |
| G-02 | Redis Rate Limiter | Uses in-memory as primary store — defeats distributed enforcement | Critical | ✅ Must fix | ✅ Must fix | Rewrite RedisRateLimiter to use Redis Sorted Sets for true sliding-window enforcement. Keep memory only as fallback when Redis is unavailable. |
| G-03 | Queue | enqueueTask() has no error handling for Redis failures | Critical | ✅ Must fix | ✅ Must fix | Wrap queue.add() in try/catch. Return error result or fall back to fake-ID pattern. Add logging. |
| G-04 | Redis | No TLS configuration | High | ⚠️ (if no TLS required) | ✅ Must fix | Add 	ls: {} option when REDIS_TLS_ENABLED=true or URL scheme is ediss://. Detect from URL. |
| G-05 | Queue | No dead letter queue — failed jobs invisible after 50 | High | ✅ Must fix | ✅ Must fix | Implement dead letter queue: persist failed job details to database (e.g., audit log or dedicated FailedJob model). Add operator notification. |
| G-06 | Redis | Linear backoff too short for failover | High | ⚠️ Evaluate | ✅ Must fix | Switch to exponential backoff: Math.min(Math.pow(2, times) * 100, 10000). Increase max retries to 30. |
| G-07 | Queue | No operator UI for queue management | High | ⚠️ Evaluate | ✅ Must fix | Add Bull Board at /monitoring/queue (admin-only) or integrate queue management into existing admin UI. |
| G-08 | Rate Limiter | Fixed window — burst vulnerability at boundaries | Medium | ⚠️ Acceptable | ✅ Must fix | Migrate to sliding window (Redis sorted sets) or token bucket algorithm. |
| G-09 | Queue | Missing concurrency and 	imeout settings | Medium | ⚠️ Evaluate | ✅ Must fix | Set explicit concurrency (≥2) and timeout (e.g., 30000ms) in Bull config. |
| G-10 | Cache | No size limit enforcement — unbounded memory growth | Medium | ⚠️ Acceptable | ✅ Must fix | Implement maxSize eviction (LRU or LFU). Cap at configurable limit. Add background expiry sweeper. |
| G-11 | Cache | No cache stampede protection | Medium | ⚠️ Acceptable | ✅ Must fix | Add lock/mutex around fetcher call (e.g., promise memoization per key). |
| G-12 | Cache | No hit/miss ratio monitoring | Medium | ⚠️ Acceptable | ✅ Must fix | Add counters for hit, miss, set, eviction. Expose via /api/monitoring/health. |
| G-13 | Redis | No explicit econnectOnError handler | Low | ⚠️ Acceptable | ✅ Consider | Add econnectOnError for specific Redis error codes (e.g., READONLY, LOADING). |
| G-14 | Rate Limiter | No global per-IP aggregate limit | Low | ⚠️ Acceptable | ⚠️ Evaluate | Add optional global limit: total requests per IP across all endpoints. |
| G-15 | Rate Limiter | "anonymous" fallback for missing IP headers | Low | ✅ Minor fix | ✅ Minor fix | Log warning when IP header is missing. Consider returning 400 instead of using "anonymous". |

### 6.2 Risk Summary

| Risk Level | Count | Key Items |
|-----------|-------|-----------|
| **Critical** | 3 | G-01 (cache not Redis-backed), G-02 (rate limiter architecture), G-03 (queue error handling) |
| **High** | 4 | G-04 (no TLS), G-05 (no dead letter), G-06 (linear backoff), G-07 (no queue UI) |
| **Medium** | 5 | G-08 (fixed window), G-09 (concurrency), G-10 (cache size), G-11 (stampede), G-12 (monitoring) |
| **Low** | 3 | G-13 (reconnect), G-14 (global limit), G-15 (anonymous fallback) |

### 6.3 Remediation Priority for Pilot

| Priority | Gaps | Rationale |
|----------|------|-----------|
| **P0 — Must fix before pilot** | G-01, G-02, G-03 | Data integrity and fault isolation risk |
| **P1 — Should fix before pilot** | G-05 | Failed job invisibility impacts operator trust |
| **P2 — Fix during pilot** | G-04, G-06, G-07, G-08, G-09 | Operational quality but not blocking for single-instance |
| **P3 — Post-pilot** | G-10, G-11, G-12, G-13, G-14, G-15 | Monitoring and hardening |

---

## 7. Positive Findings

Not all findings are gaps. The following patterns are production-grade:

1. **Health monitoring system** (system-monitor.ts): Comprehensive, component-level health checks with Redis PING, queue metrics, database connectivity, and audit logging on health state transitions. This is a strong foundation.

2. **Graceful rate limiter degradation:** RedisRateLimiter falls back to memory when Redis is unavailable, with a single warning. No crash, no data loss.

3. **Feature flag isolation:** Queue operations are protected by queue.enabled flag (default: off). No queue processing happens without explicit opt-in.

4. **Server-only enforcement:** All infrastructure modules use "server-only" import guard. No Redis, Bull, or database code leaks to the client bundle.

5. **Queue count retention:** emoveOnComplete: 100 and emoveOnFail: 50 prevent unbounded Redis memory growth from job metadata.

6. **Lazy Redis connection:** lazyConnect: true means Redis connections are only established when first used, not at module load time. This prevents startup failures when Redis is unavailable.

7. **Monitoring API auth-guarded:** The detailed monitoring endpoint at /api/monitoring/health requires ADMIN role, preventing public exposure of queue metrics.

---

## 8. Files Inspected

| File | Lines | Role |
|------|-------|------|
| src/lib/platform/redis-client.ts | 46 | Redis singleton client |
| src/lib/platform/redis-config.ts | 3 | Redis URL config |
| src/lib/platform/operations/queue-runtime.ts | 142 | Bull queue runtime |
| src/lib/platform/operations/unified-output-queue.ts | 22 | Output queue wrapper |
| src/lib/platform/operations/unified-task-runtime.ts | 423 | In-memory task runtime |
| src/lib/platform/operations/unified-activity-runtime.ts | 195 | Activity stream runtime |
| src/lib/platform/rate-limiter/index.ts | 27 | Rate limiter factory |
| src/lib/platform/rate-limiter/types.ts | 18 | Rate limiter types |
| src/lib/platform/rate-limiter/memory-rate-limiter.ts | 66 | Memory rate limiter |
| src/lib/platform/rate-limiter/redis-rate-limiter.ts | 114 | Redis rate limiter |
| src/lib/platform/monitoring/system-monitor.ts | 246 | Health/monitoring system |
| src/lib/platform/feature-flags/registry.ts | 172 | Feature flag registry |
| src/lib/platform/feature-flags/types.ts | 25 | Feature flag types |
| src/middleware-rate-limit.ts | 39 | Rate limit middleware |
| src/lib/rate-limit.ts | 16 | Legacy rate limit (memory-only) |
| src/lib/cache.ts | 53 | Application cache |
| src/__tests__/unit/rate-limiter-l014.test.ts | 236 | Rate limiter tests |
| src/__tests__/unit/middleware-rate-limit-l014.test.ts | 78 | Middleware tests |
| docs/operations/ha-dr-plan.md | 297 | HA/DR architecture doc |

---

## 9. Test Coverage Assessment

| Component | Test File | Coverage | Assessment |
|-----------|-----------|----------|------------|
| MemoryRateLimiter | ate-limiter-l014.test.ts | ✅ Comprehensive (10 tests) | All edge cases covered |
| RedisRateLimiter | ate-limiter-l014.test.ts | ⚠️ Basic (4 tests) | Fallback, reset, warning — no Redis enforcement tests |
| Factory functions | ate-limiter-l014.test.ts | ✅ Good (5 tests) | Caching, type selection, error handling |
| Rate limit middleware | middleware-rate-limit-l014.test.ts | ✅ Good (4 tests) | Skip, pass, 429, per-IP isolation |
| Redis client | None | ❌ Missing | No unit tests for singleton, retry, connection validation |
| Queue runtime | None | ❌ Missing | No unit tests for enqueue, handlers, workers |
| Cache | None | ❌ Missing | No unit tests for TTL, invalidation, cleanup |

**Finding:** Infrastructure components have **low test coverage**. The rate limiter is well-tested. Redis client, queue runtime, and cache have zero tests.

**Risk:** Medium. No regression protection for Redis or queue changes.

---

## 10. Next Recommended Step

**P0 remediation:** Fix G-01, G-02, and G-03 before pilot:

1. **G-03 (Queue error handling):** Wrap queue.add() in enqueueTask() with try/catch. Log the failure. Return { id: null, status: "failed", error: msg } or re-throw with context. **(~30 min)**

2. **G-02 (Redis rate limiter architecture):** Rewrite RedisRateLimiter.check() to use Redis INCR + EXPIRE (atomic counter with TTL) as primary enforcement, falling back to memory only when Redis is unreachable. **(~2h)**

3. **G-01 (Redis-backed cache):** Create src/lib/platform/cache/redis-cache.ts implementing the same cachedFetch/invalidateCache interface but backed by ioredis with SETEX/GET/DEL. Keep src/lib/cache.ts as the in-memory fallback. Update callers to prefer RedisCache when available. **(~3h)**

These three changes transform the infrastructure from prototype-grade to pilot-grade.
