// Each test gets a fresh rate limiter singleton via manual module mocking
import { MemoryRateLimiter } from "@/lib/platform/rate-limiter/memory-rate-limiter"
import type { RateLimitConfig } from "@/lib/platform/rate-limiter/types"

let testLimiter: MemoryRateLimiter | null = null

function makeNextRequest(pathname: string, ip?: string) {
  const url = new URL(`http://localhost${pathname}`)
  const headers = new Headers()
  if (ip) headers.set("x-forwarded-for", ip)
  return {
    nextUrl: url,
    headers,
    clone: function () {
      return makeNextRequest(pathname, ip)
    },
  } as unknown as import("next/server").NextRequest
}

jest.mock("@/lib/rate-limit-edge", () => {
  const { MemoryRateLimiter: MockLimiter } = jest.requireActual(
    "@/lib/platform/rate-limiter/memory-rate-limiter",
  )
  const limiter = new MockLimiter({ suppressWarning: true })
  testLimiter = limiter
  return {
    checkEdgeRateLimit: jest.fn(
      (key: string, config?: RateLimitConfig) => limiter.check(key, config),
    ),
  }
})

afterEach(() => {
  if (testLimiter) {
    testLimiter.dispose()
    testLimiter = null
  }
  jest.clearAllMocks()
})

describe("rateLimitMiddleware", () => {
  it("skips non-API routes", async () => {
    const { rateLimitMiddleware } = await import("@/middleware-rate-limit")
    expect(await rateLimitMiddleware(makeNextRequest("/"))).toBeNull()
  })

  it("passes API requests under limit", async () => {
    const { rateLimitMiddleware } = await import("@/middleware-rate-limit")
    expect(await rateLimitMiddleware(makeNextRequest("/api/test"))).toBeNull()
  })

  it("returns 429 when rate limited", async () => {
    const { rateLimitMiddleware } = await import("@/middleware-rate-limit")
    const req = makeNextRequest("/api/test")
    for (let i = 0; i < 60; i++) {
      await rateLimitMiddleware(req.clone())
    }
    const result = await rateLimitMiddleware(req.clone())
    expect(result).not.toBeNull()
    expect(result!.status).toBe(429)
    const body = await result!.json()
    expect(body.error.code).toBe("RATE_LIMITED")
  })

  it("uses unique keys per IP", async () => {
    const { rateLimitMiddleware } = await import("@/middleware-rate-limit")
    const reqA = makeNextRequest("/api/test", "1.1.1.1")
    const reqB = makeNextRequest("/api/test", "2.2.2.2")

    for (let i = 0; i < 60; i++) {
      await rateLimitMiddleware(reqA.clone())
    }
    expect(await rateLimitMiddleware(reqA.clone())).not.toBeNull()
    expect(await rateLimitMiddleware(reqB.clone())).toBeNull()
  })
})
