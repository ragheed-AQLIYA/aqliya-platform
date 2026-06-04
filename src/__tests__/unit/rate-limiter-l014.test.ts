import { MemoryRateLimiter } from "@/lib/platform/rate-limiter/memory-rate-limiter"
import type { RateLimitConfig } from "@/lib/platform/rate-limiter/types"

// ─── Redis client mock ────────────────────────────────────────────────
// Provides a controllable mock for RedisRateLimiter tests.
// The 'eval' mock is reassigned in specific tests.

/** Simulates Redis INCR by tracking request counts per key. */
const __keyCounts = new Map<string, number>()

function resetKeyCounts() { __keyCounts.clear() }

const __defaultEval = jest.fn().mockImplementation(
  async (_script: string, _numKeys: number, key: string, maxReqs: string, windowMs: string) => {
    const max = parseInt(maxReqs, 10)
    const ms = parseInt(windowMs, 10)
    const current = (__keyCounts.get(key) || 0) + 1
    __keyCounts.set(key, current)
    if (current <= max) return [1, max - current, ms] as [number, number, number]
    return [0, 0, ms] as [number, number, number]
  },
)

jest.mock("@/lib/platform/redis-client", () => ({
  getRedisClient: jest.fn().mockReturnValue({
    status: "ready" as const,
    del: jest.fn().mockImplementation(async (redisKey: string) => {
      __keyCounts.delete(redisKey)
      return 1
    }),
    eval: __defaultEval,
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  }),
  ensureRedisConnected: jest.fn().mockResolvedValue(true),
}))

let originalEnv: NodeJS.ProcessEnv

beforeEach(() => {
  originalEnv = { ...process.env }
})

afterEach(() => {
  process.env = { ...originalEnv }
  jest.useRealTimers()
  jest.restoreAllMocks()
  resetKeyCounts()
})

// ─── MemoryRateLimiter ───────────────────────────────────────────────

describe("MemoryRateLimiter", () => {
  it("allows first request", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const r = await limiter.check("key")
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(59)
    expect(r.resetAt).toBeGreaterThan(Date.now())
    limiter.dispose()
  })

  it("allows requests up to maxRequests", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const config: RateLimitConfig = { maxRequests: 3, windowMs: 60_000 }
    expect((await limiter.check("key", config)).allowed).toBe(true)
    expect((await limiter.check("key", config)).allowed).toBe(true)
    expect((await limiter.check("key", config)).allowed).toBe(true)
    expect((await limiter.check("key", config)).allowed).toBe(false)
    expect((await limiter.check("key", config)).remaining).toBe(0)
    limiter.dispose()
  })

  it("tracks remaining count correctly", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const config: RateLimitConfig = { maxRequests: 5, windowMs: 60_000 }
    expect((await limiter.check("key", config)).remaining).toBe(4)
    expect((await limiter.check("key", config)).remaining).toBe(3)
    expect((await limiter.check("key", config)).remaining).toBe(2)
    limiter.dispose()
  })

  it("resets after window expires", async () => {
    jest.useFakeTimers()
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const config: RateLimitConfig = { maxRequests: 2, windowMs: 60_000 }
    await limiter.check("key", config)
    await limiter.check("key", config)
    expect((await limiter.check("key", config)).allowed).toBe(false)
    jest.advanceTimersByTime(61_000)
    expect((await limiter.check("key", config)).allowed).toBe(true)
    limiter.dispose()
  })

  it("reset clears key state", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const config: RateLimitConfig = { maxRequests: 2, windowMs: 60_000 }
    await limiter.check("key", config)
    await limiter.check("key", config)
    expect((await limiter.check("key", config)).allowed).toBe(false)
    await limiter.reset("key")
    expect((await limiter.check("key", config)).allowed).toBe(true)
    limiter.dispose()
  })

  it("uses separate windows per key", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const config: RateLimitConfig = { maxRequests: 2, windowMs: 60_000 }
    for (let i = 0; i < 2; i++) await limiter.check("key-a", config)
    expect((await limiter.check("key-a", config)).allowed).toBe(false)
    expect((await limiter.check("key-b", config)).allowed).toBe(true)
    limiter.dispose()
  })

  it("dispose clears store", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    await limiter.check("key", { maxRequests: 1, windowMs: 60_000 })
    limiter.dispose()
    const r = await limiter.check("key", { maxRequests: 1, windowMs: 60_000 })
    expect(r.allowed).toBe(true)
    limiter.dispose()
  })

  it("warns in constructor without suppressWarning", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation()
    const limiter = new MemoryRateLimiter()
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("in-memory rate limiter"))
    limiter.dispose()
  })

  it("does not warn with suppressWarning", () => {
    const spy = jest.spyOn(console, "warn").mockImplementation()
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    expect(spy).not.toHaveBeenCalled()
    limiter.dispose()
  })

  it("returns same resetAt within active window", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const r1 = await limiter.check("key")
    const r2 = await limiter.check("key")
    expect(r2.resetAt).toBe(r1.resetAt)
    limiter.dispose()
  })

  it("handles custom windowMs", async () => {
    const limiter = new MemoryRateLimiter({ suppressWarning: true })
    const config: RateLimitConfig = { maxRequests: 10, windowMs: 1000 }
    for (let i = 0; i < 10; i++) {
      expect((await limiter.check("burst", config)).allowed).toBe(true)
    }
    expect((await limiter.check("burst", config)).allowed).toBe(false)
    limiter.dispose()
  })
})

// ─── RedisRateLimiter ────────────────────────────────────────────────

describe("RedisRateLimiter", () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it("falls back to memory when eval throws", async () => {
    const { getRedisClient } = await import("@/lib/platform/redis-client")
    const mockClient = getRedisClient()
    // Override eval to throw — simulates Redis being unreachable
    mockClient.eval = jest.fn().mockRejectedValue(new Error("Connection refused"))

    const { RedisRateLimiter } = await import("@/lib/platform/rate-limiter/redis-rate-limiter")
    const limiter = new RedisRateLimiter()
    const r = await limiter.check("key")
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(59)
    limiter.dispose()
  })

  it("uses Redis when available", async () => {
    const { RedisRateLimiter } = await import("@/lib/platform/rate-limiter/redis-rate-limiter")
    const limiter = new RedisRateLimiter()
    const r = await limiter.check("key")
    expect(r.allowed).toBe(true)
    expect(r.remaining).toBe(59)
    limiter.dispose()
  })

  it("reset clears both memory and Redis", async () => {
    const { getRedisClient } = await import("@/lib/platform/redis-client")
    const { RedisRateLimiter } = await import("@/lib/platform/rate-limiter/redis-rate-limiter")
    const limiter = new RedisRateLimiter()
    const config: RateLimitConfig = { maxRequests: 1, windowMs: 60_000 }

    // First request — allowed
    const r1 = await limiter.check("key", config)
    expect(r1.allowed).toBe(true)

    // Second request — blocked (mock Lua INCR simulation tracks state)
    const r2 = await limiter.check("key", config)
    expect(r2.allowed).toBe(false)

    // Reset — calls del which clears __keyCounts in mock
    await limiter.reset("key")

    // After reset — allowed again (key counter was reset by del)
    const r3 = await limiter.check("key", config)
    expect(r3.allowed).toBe(true)

    // Redis DEL was called
    expect(getRedisClient().del).toHaveBeenCalledWith("ratelimit:key")
    limiter.dispose()
  })

  it("warns about Redis fallback once", async () => {
    const spy = jest.spyOn(console, "warn").mockImplementation()
    const { getRedisClient } = await import("@/lib/platform/redis-client")
    const mockClient = getRedisClient()
    mockClient.eval = jest
      .fn()
      .mockRejectedValueOnce(new Error("Connection refused"))
      .mockResolvedValueOnce([1, 59, 60000])

    const { RedisRateLimiter } = await import("@/lib/platform/rate-limiter/redis-rate-limiter")
    const limiter = new RedisRateLimiter()

    // First call falls back to memory — warns once
    const r1 = await limiter.check("key")
    expect(r1.allowed).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("RATE_LIMITER=redis"))

    // Second call succeeds on Redis — no additional warning
    const r2 = await limiter.check("key")
    expect(r2.allowed).toBe(true)
    expect(spy).toHaveBeenCalledTimes(1)

    limiter.dispose()
  })
})

// ─── createRateLimiter / getRateLimiter ──────────────────────────────

describe("rate limiter factory", () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it("creates memory limiter when env is memory", async () => {
    process.env.RATE_LIMITER = "memory"
    const { createRateLimiter } = await import("@/lib/platform/rate-limiter")
    const limiter = await createRateLimiter()
    expect(limiter.type).toBe("memory")
    ;(limiter as unknown as { dispose(): void }).dispose()
  })

  it("defaults to memory when env is not set", async () => {
    delete process.env.RATE_LIMITER
    const { createRateLimiter } = await import("@/lib/platform/rate-limiter")
    const limiter = await createRateLimiter()
    expect(limiter.type).toBe("memory")
    ;(limiter as unknown as { dispose(): void }).dispose()
  })

  it("creates redis limiter when env is redis", async () => {
    process.env.RATE_LIMITER = "redis"
    const { createRateLimiter } = await import("@/lib/platform/rate-limiter")
    const limiter = await createRateLimiter()
    expect(limiter.type).toBe("redis")
    ;(limiter as unknown as { dispose(): void }).dispose()
  })

  it("getRateLimiter caches and returns same instance", async () => {
    delete process.env.RATE_LIMITER
    const { getRateLimiter } = await import("@/lib/platform/rate-limiter")
    const a = await getRateLimiter()
    const b = await getRateLimiter()
    expect(a).toBe(b)
    ;(a as unknown as { dispose(): void }).dispose()
  })

  it("throws for unknown type", async () => {
    process.env.RATE_LIMITER = "hologram"
    const { createRateLimiter } = await import("@/lib/platform/rate-limiter")
    await expect(createRateLimiter()).rejects.toThrow("Unknown rate limiter type")
  })
})

describe("checkRateLimit", () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it("uses memory limiter on the server when env is memory", async () => {
    process.env.RATE_LIMITER = "memory"
    const { checkRateLimit } = await import("@/lib/rate-limit")

    const config: RateLimitConfig = { maxRequests: 1, windowMs: 60_000 }
    const first = await checkRateLimit("server-memory", config)
    const second = await checkRateLimit("server-memory", config)

    expect(first.allowed).toBe(true)
    expect(second.allowed).toBe(false)
  })

  it("uses redis limiter on the server when env is redis", async () => {
    process.env.RATE_LIMITER = "redis"
    const { checkRateLimit } = await import("@/lib/rate-limit")
    const { getRedisClient } = await import("@/lib/platform/redis-client")

    const result = await checkRateLimit("server-redis")

    expect(result.allowed).toBe(true)
    expect(getRedisClient().eval).toHaveBeenCalled()
  })
})
