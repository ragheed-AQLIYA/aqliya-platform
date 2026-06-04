import type { RateLimiter, RateLimitConfig, RateLimitResult } from "./types"
import { MemoryRateLimiter } from "./memory-rate-limiter"
import { getRedisClient } from "@/lib/platform/redis-client"

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
}

/**
 * Lua script for atomic rate-limit check-and-increment.
 *
 * KEYS[1]  - ratelimit:<key>
 * ARGV[1]  - maxRequests (number as string)
 * ARGV[2]  - windowMs in milliseconds (number as string)
 *
 * Returns [allowed: 0|1, remaining: number, ttl_ms: number]
 *
 * Uses INCR + PEXPIRE atomically so multiple instances share
 * a single source of truth without race conditions.
 */
const CHECK_AND_INCREMENT_SCRIPT = `
local key = KEYS[1]
local max_req = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])

local count = redis.call("INCR", key)

if count == 1 then
  redis.call("PEXPIRE", key, window_ms)
end

local ttl = redis.call("PTTL", key)
if ttl < 0 then
  redis.call("PEXPIRE", key, window_ms)
  ttl = window_ms
end

local allowed = 0
if count <= max_req then
  allowed = 1
end

local remaining = math.max(0, max_req - count)

return {allowed, remaining, ttl}
`

export class RedisRateLimiter implements RateLimiter {
  readonly type = "redis" as const

  /**
   * In-memory fallback used ONLY when Redis is unreachable.
   * Not a read-through cache -- it is a degraded-mode store.
   */
  private memoryFallback = new MemoryRateLimiter({ suppressWarning: true })
  private warnedFallback = false

  private warnFallback(reason: string): void {
    if (!this.warnedFallback) {
      console.warn(`[rate-limit] RATE_LIMITER=redis but ${reason} -- using in-memory fallback`)
      this.warnedFallback = true
    }
  }

  /**
   * Check and increment the rate-limit counter.
   *
   * Redis (via EVAL + INCR + PEXPIRE) is the authoritative store.
   * The in-memory Map is used ONLY as a degraded fallback when
   * Redis is unreachable.
   */
  async check(key: string, config: RateLimitConfig = DEFAULT_CONFIG): Promise<RateLimitResult> {
    try {
      const client = getRedisClient()
      const redisKey = `ratelimit:${key}`

      const result = (await client.eval(
        CHECK_AND_INCREMENT_SCRIPT,
        1,
        redisKey,
        String(config.maxRequests),
        String(config.windowMs),
      )) as [number, number, number]

      const [allowed, remaining, ttl] = result

      return {
        allowed: allowed === 1,
        remaining,
        resetAt: Date.now() + ttl,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      this.warnFallback(`Redis eval failed (${message})`)
      return this.memoryFallback.check(`redis-fallback:${key}`, config)
    }
  }

  /**
   * Reset the rate-limit counter for a key.
   * Always clears both Redis (if available) and the in-memory fallback.
   */
  async reset(key: string): Promise<void> {
    // Always clear in-memory fallback first
    this.memoryFallback.reset(`redis-fallback:${key}`)

    try {
      const client = getRedisClient()
      const redisKey = `ratelimit:${key}`
      await client.del(redisKey)
    } catch {
      // Redis reset is best-effort -- memory was already cleared
    }
  }

  dispose(): void {
    this.memoryFallback.dispose()
  }
}
