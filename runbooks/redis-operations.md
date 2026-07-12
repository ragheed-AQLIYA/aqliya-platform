# Redis Operations & Recovery Runbook

**Document Owner:** Infrastructure Agent
**Last Updated:** 2026-07-11
**Status:** Verified against code and IaC
**Applies to:** AQLIYA Platform — Redis Cache & Rate Limiter

---

## 1. Overview

AQLIYA uses **Redis 7** for distributed rate limiting, session caching, and application data caching. Redis is configured with password authentication and automatic TLS detection.

### Architecture Summary

| Component | Detail |
|-----------|--------|
| **Redis version** | 7.x (Alpine in Docker, ElastiCache 7.1 in AWS) |
| **Port** | 6379 |
| **Password auth** | Required (`--requirepass ${REDIS_PASSWORD:-changeme}`) |
| **Max memory** | 256 MB (`--maxmemory 256mb`) |
| **Eviction policy** | `allkeys-lru` |
| **TLS** | Auto-detected — `rediss://` prefix enables TLS in ioredis |
| **Client library** | ioredis (singleton, server-only) |
| **Production** | AWS ElastiCache Redis 7.1 with automatic failover |

---

## 2. Key Files

| File | Purpose |
|------|---------|
| `src/lib/platform/redis-client.ts` | Singleton Redis client (ioredis) with retry strategy, TLS auto-detect, lazy connect |
| `src/lib/platform/redis-cache-adapter.ts` | Cache adapter — `get`, `set`, `del`, `clear` with SCAN+DEL pattern (never FLUSHDB) |
| `src/lib/platform/rate-limiter/redis-rate-limiter.ts` | Redis rate limiter with Lua atomic script and in-memory fallback |
| `src/lib/platform/__tests__/redis-cache-adapter.test.ts` | Unit tests for cache adapter |
| `docker-compose.yml` | Redis service definition (lines 69-86) |
| `infra/terraform/modules/compute/main.tf` | ElastiCache Redis replication group (lines 443-463) |

---

## 3. Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection string. Use `rediss://` prefix for TLS. |
| `REDIS_PASSWORD` | For Docker | `changeme` | Redis password (set in docker-compose command line) |
| `RATE_LIMITER` | No | `memory` | Set to `redis` for distributed rate limiting |
| `CACHE_PREFIX` | No | `aqliya:cache:` | Key prefix for cache adapter namespace |

### Docker Compose Configuration

```yaml
redis:
  image: redis:7-alpine
  command: >
    redis-server
    --requirepass ${REDIS_PASSWORD:-changeme}
    --maxmemory 256mb
    --maxmemory-policy allkeys-lru
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-changeme}", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5
```

### ECS/ElastiCache Configuration (Terraform)

```hcl
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "aqliya-prod-redis-rg"
  engine               = "redis"
  engine_version       = "7.1"
  node_type            = var.redis_node_type
  parameter_group_name = "default.redis7"
  port                 = 6379
  num_cache_clusters            = var.environment == "prod" ? 2 : 1
  automatic_failover_enabled    = var.environment == "prod"
  multi_az_enabled              = var.environment == "prod"
}
```

---

## 4. Redis Client Details

### Singleton Pattern

The Redis client is a **global singleton** — one connection per process:

```typescript
// src/lib/platform/redis-client.ts
const globalForRedis = globalThis as unknown as { redisClient?: Redis }
```

### Connection Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| `maxRetriesPerRequest` | `null` | Infinite retries for rate limiter Lua scripts |
| `enableReadyCheck` | `true` | Validates connection is ready before use |
| `lazyConnect` | `true` | Connects on first command, not at import time |
| `retryStrategy` | Exponential backoff, max 3s, 10 retries | Prevents infinite reconnect loops |
| `tls` | Auto-enabled for `rediss://` URLs | Seamless TLS support |

### Health Status Values

The client uses `client.status` to track connection state:
- `"ready"` — Connected and ready for commands
- `"connecting"` — Connection in progress
- `"connect"` — TCP connected, not yet ready
- `"close"` / `"end"` — Disconnected

---

## 5. Cache Adapter

### Key Namespacing

All cache keys are prefixed with `CACHE_PREFIX` (default: `aqliya:cache:`):

```
aqliya:cache:dashboard-metrics:org-123
aqliya:cache:engagement-summary:eng-456
```

### SCAN+DEL Pattern (Safe Clear)

The `clear()` method uses `SCAN` + `DEL` to safely remove only cache keys — **never FLUSHDB**:

```typescript
// redis-cache-adapter.ts — clear()
let cursor = "0"
do {
  const [nextCursor, keys] = await client.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100)
  cursor = nextCursor
  if (keys.length > 0) {
    await client.del(...keys)
  }
} while (cursor !== "0")
```

**Why this matters:** FLUSHDB would destroy rate limiter keys, session data, queue data, and any other Redis data. SCAN+DEL only removes our namespaced cache keys.

### TTL Support

Cache entries support optional TTL in milliseconds:

```typescript
await cacheAdapter.set("key", data, 30_000) // Expires in 30 seconds
```

Redis uses the `PX` command for millisecond precision TTL.

---

## 6. Health Checks

### Quick Health Check

```bash
# From Docker or ECS Exec:
redis-cli -a <password> ping
# Expected: PONG

# Check memory usage:
redis-cli -a <password> info memory | grep used_memory_human
# Expected: under 200MB (of 256MB limit)

# Check connected clients:
redis-cli -a <password> info clients | grep connected_clients
```

### From Application

```bash
# Health endpoint includes Redis check:
curl -s http://localhost:3000/api/health/ready | jq '.checks.redis'
# Expected: { "ok": true, "latencyMs": 3, "detail": "connected" }
```

### Key Statistics

```bash
# All cache keys:
redis-cli -a <password> keys 'aqliya:cache:*' | wc -l

# Rate limiter keys:
redis-cli -a <password> keys 'ratelimit:*' | wc -l

# Memory breakdown:
redis-cli -a <password> info memory
# Key fields: used_memory_human, maxmemory_human, evicted_keys
```

---

## 7. Recovery Procedures

### Redis Outage Recovery

**Symptoms:** Application logs show `[redis] connection error: ...`, rate limiter falls back to in-memory.

**Steps:**

1. **Check Redis status:**
   ```bash
   docker compose ps redis
   docker compose logs redis --tail 50
   # Or for ECS:
   aws elasticache describe-replication-groups --replication-group-id aqliya-prod-redis-rg
   ```

2. **Restart Redis (Docker):**
   ```bash
   docker compose restart redis
   docker compose exec redis redis-cli -a <password> ping
   ```

3. **For ECS/ElastiCache:** Redis recovery is automatic with failover enabled. Check CloudWatch metrics for `CacheHitRate` and `CurrConnections`.

4. **Verify application reconnection:** The app automatically reconnects on next request after Redis recovers. No restart needed.

### Safe Data Flush (Cache Only)

**NEVER use `FLUSHDB` or `FLUSHALL`.** Use the SCAN+DEL pattern:

```bash
# List cache keys before deleting:
redis-cli -a <password> keys 'aqliya:cache:*'

# Delete only cache keys (safe):
redis-cli -a <password> --scan --pattern 'aqliya:cache:*' | \
  xargs -L 100 redis-cli -a <password> del

# Verify rate limiter keys are intact:
redis-cli -a <password> keys 'ratelimit:*' | wc -l
```

### Rate Limiter Key Cleanup

If rate limiter keys are accumulating (e.g., after a traffic spike):

```bash
# Check rate limiter key count:
redis-cli -a <password> keys 'ratelimit:*' | wc -l

# Rate limiter keys auto-expire via PEXPIRE, but if stuck:
redis-cli -a <password> --scan --pattern 'ratelimit:*' | \
  xargs -L 100 redis-cli -a <password> del
```

### Cache Invalidation Patterns

| Pattern | Command | Notes |
|---------|---------|-------|
| Clear all cache | Use `cacheAdapter.clear()` in code | SCAN+DEL, safe |
| Clear specific org cache | `redis-cli keys 'aqliya:cache:*org-id*' \| xargs del` | Manual, targeted |
| Clear dashboard cache | `redis-cli keys 'aqliya:cache:dashboard*' \| xargs del` | After metric updates |
| Clear rate limiter | `redis-cli keys 'ratelimit:*' \| xargs del` | Nuclear option — resets all rate limits |

---

## 8. Monitoring

### CloudWatch Metrics (ElastiCache)

| Metric | Warning | Critical | Source |
|--------|---------|----------|--------|
| `CacheHitRate` | < 80% | < 50% | CloudWatch |
| `CurrConnections` | > 100 | > 500 | CloudWatch |
| `Evictions` | > 0/min | > 100/min | CloudWatch |
| `CPUUtilization` | > 70% | > 90% | CloudWatch |
| `DatabaseMemoryUsagePercentage` | > 80% | > 95% | CloudWatch |
| `ReplicationLag` | > 1s | > 5s | CloudWatch (multi-AZ) |

### Application-Level Monitoring

```bash
# Check Redis latency from app perspective:
curl -s http://localhost:3000/api/health/ready | jq '.checks.redis.latencyMs'
# Warning: > 10ms, Critical: > 100ms

# Check if rate limiter is using Redis or memory fallback:
# Look for log message: "[rate-limit] RATE_LIMITER=redis but Redis eval failed"
# If present → Redis is unreachable, using in-memory fallback
```

### MEMORY USAGE for Individual Keys

```bash
# Check memory usage of a specific key:
redis-cli -a <password> memory usage 'aqliya:cache:some-key'

# Find largest keys:
redis-cli -a <password> --bigkeys
```

---

## 9. Troubleshooting

### High Memory Usage

**Symptoms:** `Evictions` metric increasing, `DatabaseMemoryUsagePercentage` near 100%.

**Causes:**
- Cache keys without TTL accumulating
- Rate limiter keys from high traffic
- Large cached objects

**Resolution:**
```bash
# Check key count by prefix:
redis-cli -a <password> keys 'aqliya:cache:*' | wc -l
redis-cli -a <password> keys 'ratelimit:*' | wc -l

# Check for keys without TTL:
redis-cli -a <password> keys 'aqliya:cache:*' | head -20 | \
  xargs -I {} redis-cli -a <password> ttl {}

# Clear cache if safe:
# Use cacheAdapter.clear() in application code
```

### Connection Refused

**Symptoms:** `[redis] connection error: connect ECONNREFUSED 127.0.0.1:6379`

**Resolution:**
```bash
# Docker:
docker compose ps redis
docker compose start redis

# ECS: Check ElastiCache endpoint is correct in REDIS_URL
aws elasticache describe-replication-groups \
  --replication-group-id aqliya-prod-redis-rg \
  --query 'replicationGroups[0].nodeGroups[0].primaryEndpoint.Address'
```

### TLS Issues

**Symptoms:** `UNABLE_TO_VERIFY_LEAF_SIGNATURE` or `DEPTH_ZERO_SELF_SIGNED_CERT`

**Cause:** `REDIS_URL` uses `rediss://` but the server doesn't have valid TLS, or uses `redis://` but TLS is required.

**Resolution:**
- Use `rediss://` prefix only if Redis has TLS enabled
- For self-signed certs in dev, use `redis://` (no TLS)
- For ElastiCache with at-rest encryption, TLS is required: use `rediss://`

### Slow Performance

**Symptoms:** High latency on cache reads/writes.

**Diagnosis:**
```bash
# Check slow log:
redis-cli -a <password> slowlog get 10

# Check connected clients:
redis-cli -a <password> info clients

# Check CPU:
redis-cli -a <password> info stats | grep used_cpu
```

---

## 10. Backup & Persistence

### Data Persistence

Redis is used as a **cache and rate limiter**, not as primary data storage. Data loss on restart is acceptable for:
- Rate limiter counters (reset to zero — temporary)
- Cache entries (regenerated on next access)
- Session data (users re-authenticate)

**DO NOT store critical business data in Redis.** All business data lives in PostgreSQL.

### RDB Snapshots (Docker)

The Docker Redis config does not persist RDB snapshots by default (no `save` directive). This is intentional — Redis is ephemeral.

For ElastiCache, AWS handles backups automatically if configured.

---

## 11. Security Considerations

| Concern | Status | Notes |
|---------|--------|-------|
| Password authentication | Required | `--requirepass` in Docker, ElastiCache auth token in AWS |
| TLS in transit | Auto-detect | `rediss://` URL prefix enables TLS |
| At-rest encryption | AWS managed | ElastiCache at-rest encryption in transit encryption |
| Network isolation | Enforced | Redis only accessible within VPC/ECS task network |
| No FLUSHDB | Enforced in code | `cacheAdapter.clear()` uses SCAN+DEL pattern |
| No secrets in Redis | Enforced | Only cached data and rate limiter counters |

---

## 12. Reference

| Document | Path |
|----------|------|
| Redis client | `src/lib/platform/redis-client.ts` |
| Cache adapter | `src/lib/platform/redis-cache-adapter.ts` |
| Cache adapter tests | `src/lib/platform/__tests__/redis-cache-adapter.test.ts` |
| Redis rate limiter | `src/lib/platform/rate-limiter/redis-rate-limiter.ts` |
| Rate limiter runbook | `runbooks/rate-limiter.md` |
| Docker Compose | `docker-compose.yml` (lines 69-86) |
| Terraform ElastiCache | `infra/terraform/modules/compute/main.tf` (lines 434-463) |

---

## Change Log

| Date | Author | Change |
|------|--------|--------|
| 2026-07-11 | Documentation Agent | Initial runbook created from codebase and IaC verification |
