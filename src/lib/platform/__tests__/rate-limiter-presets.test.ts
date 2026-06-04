import { RATE_LIMIT_PRESETS, rateLimitHeaders } from "../rate-limiter/presets"

describe("RATE_LIMIT_PRESETS", () => {
  it("STANDARD_API allows 100 requests per minute", () => {
    expect(RATE_LIMIT_PRESETS.STANDARD_API.maxRequests).toBe(100)
    expect(RATE_LIMIT_PRESETS.STANDARD_API.windowMs).toBe(60_000)
  })

  it("AUTH_ENDPOINTS allows 10 requests per minute", () => {
    expect(RATE_LIMIT_PRESETS.AUTH_ENDPOINTS.maxRequests).toBe(10)
    expect(RATE_LIMIT_PRESETS.AUTH_ENDPOINTS.windowMs).toBe(60_000)
  })

  it("EXPORT_ENDPOINTS allows 20 requests per minute", () => {
    expect(RATE_LIMIT_PRESETS.EXPORT_ENDPOINTS.maxRequests).toBe(20)
    expect(RATE_LIMIT_PRESETS.EXPORT_ENDPOINTS.windowMs).toBe(60_000)
  })

  it("AI_ENDPOINTS allows 30 requests per minute", () => {
    expect(RATE_LIMIT_PRESETS.AI_ENDPOINTS.maxRequests).toBe(30)
    expect(RATE_LIMIT_PRESETS.AI_ENDPOINTS.windowMs).toBe(60_000)
  })
})

describe("rateLimitHeaders", () => {
  it("returns correct headers", () => {
    const config = RATE_LIMIT_PRESETS.STANDARD_API
    const headers = rateLimitHeaders(config, 42, 1700000000000)
    expect(headers).toEqual({
      "X-RateLimit-Limit": 100,
      "X-RateLimit-Remaining": 42,
      "X-RateLimit-Reset": 1700000000000,
    })
  })

  it("returns zero remaining when exhausted", () => {
    const config = RATE_LIMIT_PRESETS.AUTH_ENDPOINTS
    const headers = rateLimitHeaders(config, 0, 1700000000000)
    expect(headers["X-RateLimit-Remaining"]).toBe(0)
  })
})
