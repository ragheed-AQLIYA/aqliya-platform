﻿# Rate Limiter Runbook

**Document Owner:** Infrastructure Agent
**Last Updated:** 2026-06-08
**Status:** Verified
**Applies to:** AQLIYA Platform Core

---

## 1. Overview

AQLIYA has a **two-layer** rate limiting architecture:

| Layer | Runtime | Implementation | Scope |
|-------|---------|----------------|-------|
| **Edge Middleware** | Edge Runtime (Next.js) | Memory-only (MemoryRateLimiter) | Per-IP + per-path via middleware.ts matcher |
| **Server Actions** | Node.js Runtime | Configurable (MemoryRateLimiter | RedisRateLimiter) | Per-action via checkRateLimit() and enforceAuditRateLimit() |

### Key Design Decisions

1. **Edge Middleware is intentionally memory-only** — Redis/ioredis cannot run on Edge Runtime. The middleware bundle must never import Node-only modules.
2. **Redis is only available on the Node server** — via src/lib/rate-limit.ts (import "server-only").
3. **AuditOS has its own separate rate limiter** — src/lib/audit/rate-limit.ts is a standalone in-memory limiter for AuditOS server actions. It does **not** share the platform rate limiter.
4. **Graceful degradation** — When RATE_LIMITER=redis is set but Redis is unreachable, the RedisRateLimiter falls back to in-memory with a one-time warning.

---

## 2. Rate Limit Presets

### 2.1 Edge Middleware Presets (applied by path prefix)

| Preset | Path Prefix | Limit | Window | Effective Rate |
|--------|------------|-------|--------|----------------|
| STANDARD_API | default (any unmatched /api/*) | 100 | 60s | 100 req/min |
| AUTH_ENDPOINTS | /api/auth/* (except session & callback) | 10 | 60s | 10 req/min |
| SSO_CALLBACK | /api/auth/callback/* | 20 | 60s | 20 req/min |
| AI_ENDPOINTS | /api/ai/* | 30 | 60s | 30 req/min |
| EXPORT_ENDPOINTS | (defined but not wired in middleware path matcher) | 20 | 60s | 20 req/min |
| SCIM_ENDPOINTS | /api/scim/* | 15 | 60s | 15 req/min |
| HEALTH_ENDPOINTS | /api/health | 300 | 60s | 300 req/min |

### 2.2 AuditOS Action Presets (separate system)

| Category | Limit | Window | Applied To |
|----------|-------|--------|------------|
| default | 60 | 60s | General actions |
| upload | 10 | 60s | Trial balance upload, evidence file upload |
| download | 30 | 60s | Evidence download |
| i_generate | 10 | 60s | AI review generation |
| export | 20 | 60s | Export engagement, financial statements, audit files |
| mutation | 30 | 60s | Finding/recommendation/approval creation |

### 2.3 Server CheckRateLimit Default

| Config | Limit | Window |
|--------|-------|--------|
| DEFAULT_CONFIG | 60 | 60s |

---

## 3. Configuration

### 3.1 Environment Variables

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| RATE_LIMITER | memory | edis | memory | Selects the rate limiter backend for Node/server paths. **Does not affect Edge middleware.** |
| REDIS_URL | edis://host:port | edis://localhost:6379 | Redis connection string. Only used when RATE_LIMITER=redis. |

### 3.2 Configuration Files

- **.env.example** — Sets RATE_LIMITER=memory by default for local dev.
- **docker-compose.staging.yml** — Sets RATE_LIMITER=redis and REDIS_URL=redis://redis:6379 with a dedicated Redis 7 container.

### 3.3 Changing Presets

Presets are defined in src/lib/platform/rate-limiter/presets.ts as exported constants. To change a preset threshold:

`	ypescript
// Example: Increase AI endpoint limit from 30 to 50
AI_ENDPOINTS: { maxRequests: 50, windowMs: 60_000 } as RateLimitConfig,
`

**Note:** The EXPORT_ENDPOINTS preset exists in the presets file but is **not wired** in src/middleware-rate-limit.ts path matcher. To activate it, add:

`	ypescript
if (pathname.startsWith("/api/export/")) return RATE_LIMIT_PRESETS.EXPORT_ENDPOINTS;
`

---

## 4. Architecture

### 4.1 File Map

`
src/
├── middleware.ts                              # Main middleware — calls rateLimitMiddleware()
├── middleware-rate-limit.ts                   # Path-based rate limit logic
├── middleware-security.ts                     # Security headers (applied alongside rate limit)
├── lib/
│   ├── rate-limit.ts                          # Server-only entrypoint (import "server-only")
│   ├── rate-limit-edge.ts                     # Edge-safe entrypoint (memory-only singleton)
│   ├── platform/
│   │   └── rate-limiter/
│   │       ├── index.ts                       # Factory: createRateLimiter(), getRateLimiter()
│   │       ├── types.ts                       # RateLimiter, RateLimitConfig, RateLimitResult interfaces
│   │       ├── presets.ts                     # RATE_LIMIT_PRESETS, rateLimitHeaders()
│   │       ├── memory-rate-limiter.ts         # In-memory Map implementation
│   │       └── redis-rate-limiter.ts          # Redis + Lua script implementation
│   │   └── redis-client.ts                    # Singleton Redis client (ioredis)
│   │   └── feature-flags/
│   │       ├── registry.ts                    # Feature flag registry (has no rate-limit flags)
│   │       └── types.ts
│   └── audit/
│       └── rate-limit.ts                      # AuditOS-specific in-memory rate limiter
└── __tests__/
    └── unit/
        ├── rate-limiter-l014.test.ts          # MemoryRateLimiter, RedisRateLimiter, factory tests
        └── middleware-rate-limit-l014.test.ts # Middleware integration tests
    └── (presets test) lib/platform/__tests__/rate-limiter-presets.test.ts
`

### 4.2 Request Flow

`
Client Request
  |
  v
Next.js Edge Middleware (middleware.ts)
  |
  +-- rateLimitMiddleware() ----------- checkEdgeRateLimit() --- MemoryRateLimiter
  |     +-- 429 response if over limit
  |
  +-- Auth check (JWT token)
  +-- MFA check (if required)
  |
  v
NextResponse.next() -> Server Action / Route Handler
  |
  +-- checkRateLimit() -------- createRateLimiter() ---+
  |   (server-only)                                    |
  |                +-- env RATE_LIMITER=redis --- RedisRateLimiter (with memory fallback)
  |                +-- env RATE_LIMITER=memory --- MemoryRateLimiter
  |
  +-- enforceAuditRateLimit() --- MemoryRateLimiter (AuditOS-specific, always in-memory)
`

### 4.3 Lua Script (Redis Atomicity)

The RedisRateLimiter uses a custom Lua script (CHECK_AND_INCREMENT_SCRIPT) passed to edis.eval():

`lua
-- KEYS[1]: ratelimit:<key>
-- ARGV[1]: maxRequests (number as string)
-- ARGV[2]: windowMs in milliseconds (number as string)
-- Returns: {allowed: 0|1, remaining: number, ttl_ms: number}

local count = redis.call("INCR", KEYS[1])
if count == 1 then redis.call("PEXPIRE", KEYS[1], ARGV[2]) end
local ttl = redis.call("PTTL", KEYS[1])
if ttl < 0 then redis.call("PEXPIRE", KEYS[1], ARGV[2]); ttl = ARGV[2] end
local allowed = (count <= tonumber(ARGV[1])) and 1 or 0
local remaining = math.max(0, tonumber(ARGV[1]) - count)
return {allowed, remaining, ttl}
`

**Why this is correct:**
- INCR + PEXPIRE in a single Lua script ensures **atomic** check-and-increment
- No race conditions between concurrent instances
- PTTL fallback handles edge case where TTL was not set

---

## 5. Redis Fallback Behavior

### 5.1 When Redis is unreachable

`
RATE_LIMITER=redis
Redis connection fails / EVAL throws
  |
  v
RedisRateLimiter.check()
  +-- try: client.eval(script, ...)
  |     +-- throws ConnectionRefused / timeout
  |
  +-- catch: this.memoryFallback.check(edis-fallback:, config)
        +-- One-time warning: "[rate-limit] RATE_LIMITER=redis but ..."
`

### 5.2 Fallback characteristics

| Property | Behavior |
|----------|----------|
| **Warning** | Emitted **once** per RedisRateLimiter instance lifetime (not per-request) |
| **Fallback store** | Separate MemoryRateLimiter with edis-fallback: key prefix |
| **per-key** | Uses different key namespace to avoid collision with direct memory usage |
| **Reset** | eset() always clears both Redis and in-memory fallback |
| **Recovery** | Next request retries Redis. If Redis is back, resumes normal operation. |
| **Multi-instance** | Fallback is per-process - not shared across instances. Acceptable for transient Redis blips. |

### 5.3 When to be concerned

- **Prolonged Redis outage** - Each instance uses its own in-memory fallback. Rate limit state diverges across instances.
- **High traffic under fallback** - In-memory state is not persisted. Restarting a pod loses all rate limit counters.

---

## 6. Key Structure

### 6.1 Redis Keys

| Pattern | Example | Description |
|---------|---------|-------------|
| atelimit:<key> | atelimit:192.168.1.1:/api/ai/generate | Per-IP + per-path counters |

### 6.2 Memory Keys (Edge Middleware)

Keys are constructed as:
`
:
`
Where ip is derived from (in order):
1. x-forwarded-for header (first IP in comma-separated list)
2. x-real-ip header
3. "anonymous" fallback

### 6.3 Memory Keys (Redis Fallback)

Prefixed with edis-fallback: to isolate from direct memory keys:
`
redis-fallback:192.168.1.1:/api/ai/generate
`

### 6.4 AuditOS Rate Limiter Keys

`
::
`
Example: org-1:user-123:upload_evidence_file

---

## 7. Monitoring

### 7.1 Log Signals

| Signal | Source | What to look for |
|--------|--------|------------------|
| [rate-limit] RATE_LIMITER=redis but ... | RedisRateLimiter | Redis is unreachable; using in-memory fallback |
| Using in-memory rate limiter | MemoryRateLimiter constructor | No Redis configured; running on memory only |
| 429 response | Edge middleware | Client is being rate-limited |
| [redis] connection error: | edis-client.ts | Redis connectivity issues |

### 7.2 HTTP Response Headers

When rate-limited (429), the response includes:

| Header | Example | Description |
|--------|---------|-------------|
| Retry-After | 45 | Seconds until the rate limit window resets |
| X-RateLimit-Limit | 100 | Maximum requests allowed in the window |
| X-RateLimit-Remaining |   | Requests remaining in the current window |

### 7.3 What is NOT monitored (gaps)

- No metrics/logging for rate limit hits beyond console output
- No structured logging (e.g., structured JSON to stdout for log aggregation)
- No Prometheus metrics or counters
- No alerting threshold for high rate limit hit rates

---

## 8. Testing

### 8.1 Unit Tests

| Test File | Tests | Run Command |
|-----------|-------|-------------|
| src/__tests__/unit/rate-limiter-l014.test.ts | 17 tests: MemoryRateLimiter (9), RedisRateLimiter (4), factory (4), checkRateLimit (2) | 
px jest src/__tests__/unit/rate-limiter-l014.test.ts |
| src/__tests__/unit/middleware-rate-limit-l014.test.ts | 4 tests: skip non-API, pass under limit, 429 response, per-IP keys | 
px jest src/__tests__/unit/middleware-rate-limit-l014.test.ts |
| src/lib/platform/__tests__/rate-limiter-presets.test.ts | 6 tests: preset values, headers | 
px jest src/lib/platform/__tests__/rate-limiter-presets.test.ts |

### 8.2 Manual Testing

**Test rate limiting via curl:**
`ash
# Send 101 requests to test STANDARD_API (100 req/min)
for i in {1..101}; do
  curl -s -o /dev/null -w "%{http_code}" \
    -H "x-forwarded-for: 192.168.1.1" \
    http://localhost:3000/api/platform/health
done
`
Expect: first 100 return 200/302, last 1 returns 429.

**Test per-IP isolation:**
`ash
# Two different IPs should not interfere
curl -H "x-forwarded-for: 1.1.1.1" http://localhost:3000/api/ai/generate  # -> allowed
curl -H "x-forwarded-for: 2.2.2.2" http://localhost:3000/api/ai/generate  # -> allowed
`

**Test Redis fallback:**
`ash
# Stop Redis, set RATE_LIMITER=redis, check logs for fallback warning
docker compose stop redis
# Restart app, check logs for "[rate-limit] RATE_LIMITER=redis but ..."
`

### 8.3 Test Weaknesses

- **No direct tests for src/lib/audit/rate-limit.ts** - the AuditOS rate limiter is only tested indirectly through mocked calls in udit-sampling-action.test.ts.
- **No tests for concurrent/burst behavior** - all tests are sequential.
- **No integration tests** - RedisRateLimiter is tested against a mock Redis client, never a real Redis.

---

## 9. Incident Response

### 9.1 False Positives (legitimate traffic being rate-limited)

**Symptoms:** Users report 429 errors during normal usage. Logs show RATE_LIMITED responses.

**Checklist:**
1. Identify which preset is being hit (check the path in the 429 response).
2. Check if traffic is from a single IP (NAT/proxy) or distributed.
3. If from a single IP (e.g., office NAT), consider adjusting the preset or adding the IP to an allowlist (not yet implemented).
4. If sustained, increase the preset's maxRequests or windowMs.

**Temporary mitigation:** Set RATE_LIMITER=memory and restart to use memory-only (no Redis key persistence across restart, resets all counters).

### 9.2 Redis Outage

**Symptoms:** Log shows [rate-limit] RATE_LIMITER=redis but Redis eval failed. No 429 errors (fallback is operational).

**Checklist:**
1. Check Redis health: edis-cli ping or docker compose exec redis redis-cli ping.
2. If Redis is down, the app falls back to in-memory seamlessly.
3. Redis recovery is automatic - no restart required.
4. After Redis recovers, verify it's being used: edis-cli keys 'ratelimit:*'.

**WARNING:** During fallback, rate limit state is per-process. If you have multiple instances, rate limiting is not coordinated. Consider scaling down to 1 instance during prolonged Redis outage, or accept the degraded behavior.

### 9.3 Memory Exhaustion (In-Memory Limiter)

**Symptoms:** High memory usage, OOM risk in long-running processes.

**Mitigation:**
- The MemoryRateLimiter runs a periodic cleanup every 60 seconds to evict expired entries.
- The dispose() method should be called when the limiter is no longer needed.
- In production, prefer Redis to avoid memory buildup.

### 9.4 Rate Limit Evasion

**Current protections:**
- IP-based key derived from x-forwarded-for and x-real-ip headers.
- Per-path isolation (different paths have different limits).
- Separate Auth endpoint limits (stricter at 10/min).

**What is NOT protected:**
- No API key-based rate limiting (all authenticated users share the same IP bucket for a given path).
- No user-based rate limiting on the edge (only IP-based).
- x-forwarded-for is client-respectable (can be spoofed). In production behind a reverse proxy, the proxy should strip client-sent x-forwarded-for and set the correct one.

---

## 10. Security Considerations

### 10.1 Current Security Posture

| Concern | Status | Notes |
|---------|--------|-------|
| IP spoofing via x-forwarded-for | Medium | Clients behind proxies need trusted reverse proxy stripping client headers |
| Anonymous IP fallback | Low | Falls back to a single "anonymous" bucket - all requests without IP share one counter |
| Auth endpoint protection | Good | 10 req/min for /api/auth/* - limits brute-force attempts |
| AI endpoint protection | Good | 30 req/min for /api/ai/* - prevents runaway AI costs |
| Health check exemption | Good | 300 req/min for /api/health - monitoring systems won't trigger rate limits |
| No X-RateLimit-Reset header | Low | Standard header X-RateLimit-Reset is not set in middleware; only Retry-After is present |

### 10.2 Recommended Improvements

1. **Wire EXPORT_ENDPOINTS preset** - The preset exists but is not connected to any path matcher in middleware-rate-limit.ts.
2. **Add X-RateLimit-Reset header** - Complement Retry-After for API client compatibility.
3. **User-based rate limiting** - For authenticated API endpoints, include user ID in rate limit key to prevent IP-sharing issues.
4. **Audit rate limiter migration** - Move src/lib/audit/rate-limit.ts to use the shared platform rate limiter for consistency and Redis support.
5. **Structured logging** - Log rate limit hits as JSON for log aggregation (e.g., {"event":"rate_limit","ip":"...","path":"...","preset":"STANDARD_API"}).
6. **Rate limit metrics** - Expose rate limit hit counts for Prometheus or monitoring.

---

## 11. Deployment Notes

### 11.1 Production Configuration

For production deployment:
`env
RATE_LIMITER=redis
REDIS_URL=redis://<redis-host>:6379
`

### 11.2 Staging Configuration

`env
RATE_LIMITER=redis
REDIS_URL=redis://redis:6379
`
(Already configured in docker-compose.staging.yml)

### 11.3 Local Development

`env
RATE_LIMITER=memory
`
(Default in .env.example) - No Redis needed for development.

### 11.4 Multiple Instance Deployments

**Required:** Use RATE_LIMITER=redis to share rate limit state across instances.

**If Redis is not available:** Each instance maintains its own counters. Rate limit enforcement is per-instance, not global. Acceptable for low-traffic or short-lived bursts only.

---

## 12. Key Files Reference

| File | Purpose |
|------|---------|
| src/lib/platform/rate-limiter/types.ts | Interfaces: RateLimiter, RateLimitConfig, RateLimitResult |
| src/lib/platform/rate-limiter/index.ts | Factory: createRateLimiter(), singleton: getRateLimiter() |
| src/lib/platform/rate-limiter/presets.ts | RATE_LIMIT_PRESETS constants, ateLimitHeaders() utility |
| src/lib/platform/rate-limiter/memory-rate-limiter.ts | MemoryRateLimiter - Map-based with periodic cleanup |
| src/lib/platform/rate-limiter/redis-rate-limiter.ts | RedisRateLimiter - Lua-based with memory fallback |
| src/lib/platform/redis-client.ts | Singleton Redis client (ioredis) with retry strategy |
| src/lib/rate-limit.ts | Server entrypoint - checkRateLimit() with "server-only" guard |
| src/lib/rate-limit-edge.ts | Edge entrypoint - checkEdgeRateLimit() memory-only |
| src/middleware-rate-limit.ts | Edge middleware - path-based preset selection, 429 response |
| src/middleware.ts | Main middleware - calls ateLimitMiddleware() first |
| src/lib/audit/rate-limit.ts | AuditOS-specific - separate in-memory limiter |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-06-08 | Infrastructure Agent | Initial runbook created from codebase verification |
