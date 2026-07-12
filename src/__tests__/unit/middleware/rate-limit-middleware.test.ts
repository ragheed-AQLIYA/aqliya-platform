/**
 * Middleware Integration: Rate Limiting Tests
 *
 * Verifies that the rate limit middleware:
 * 1. Only applies to /api/ paths
 * 2. Returns 429 with proper headers when rate limit triggers
 * 3. Uses correct rate limit configs for different route types
 * 4. Extracts client IP from X-Forwarded-For header
 */

jest.mock("@/lib/rate-limit-edge", () => ({
  checkEdgeRateLimit: jest.fn(),
}));

jest.mock("@/lib/platform/rate-limiter/presets", () => ({
  RATE_LIMIT_PRESETS: {
    SCIM_ENDPOINTS: { maxRequests: 10, windowMs: 60_000 },
    HEALTH_ENDPOINTS: { maxRequests: 100, windowMs: 60_000 },
    SSO_CALLBACK: { maxRequests: 10, windowMs: 60_000 },
    STANDARD_API: { maxRequests: 60, windowMs: 60_000 },
    AUTH_ENDPOINTS: { maxRequests: 30, windowMs: 60_000 },
    AI_ENDPOINTS: { maxRequests: 20, windowMs: 60_000 },
    LCOS_EVIDENCE_DOWNLOAD: { maxRequests: 10, windowMs: 60_000 },
    LCOS_EXPORT: { maxRequests: 5, windowMs: 60_000 },
  },
}));

import { NextRequest } from "next/server";
import { rateLimitMiddleware } from "@/middleware-rate-limit";
import { checkEdgeRateLimit } from "@/lib/rate-limit-edge";

const mockCheckEdgeRateLimit = jest.mocked(checkEdgeRateLimit);

function makeRequest(
  url: string,
  options: { headers?: Record<string, string> } = {},
): NextRequest {
  return new NextRequest(url, {
    headers: options.headers ?? {},
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: allow all requests
  mockCheckEdgeRateLimit.mockResolvedValue({
    allowed: true,
    remaining: 59,
    resetAt: Date.now() + 60_000,
  });
});

describe("Rate Limit Middleware — Path Filtering", () => {
  it("returns null for non-API paths (skips rate limiting)", async () => {
    const req = makeRequest("http://localhost/audit/engagements");
    const response = await rateLimitMiddleware(req);

    expect(response).toBeNull();
    expect(mockCheckEdgeRateLimit).not.toHaveBeenCalled();
  });

  it("returns null for /api/auth paths (public prefix)", async () => {
    const req = makeRequest("http://localhost/api/auth/session");
    const response = await rateLimitMiddleware(req);

    expect(response).toBeNull();
  });

  it("applies rate limiting to /api/metrics", async () => {
    const req = makeRequest("http://localhost/api/metrics");
    const response = await rateLimitMiddleware(req);

    expect(response).toBeNull(); // allowed
    expect(mockCheckEdgeRateLimit).toHaveBeenCalled();
  });

  it("applies rate limiting to /api/local-content routes", async () => {
    const req = makeRequest("http://localhost/api/local-content/projects");
    await rateLimitMiddleware(req);

    expect(mockCheckEdgeRateLimit).toHaveBeenCalled();
  });
});

describe("Rate Limit Middleware — Rate Limit Triggered (429)", () => {
  it("returns 429 when rate limit is exceeded", async () => {
    const resetAt = Date.now() + 30_000;
    mockCheckEdgeRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt,
    });

    const req = makeRequest("http://localhost/api/metrics");
    const response = await rateLimitMiddleware(req);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(429);
  });

  it("includes Retry-After header in 429 response", async () => {
    const resetAt = Date.now() + 30_000;
    mockCheckEdgeRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt,
    });

    const req = makeRequest("http://localhost/api/metrics");
    const response = await rateLimitMiddleware(req);

    expect(response!.headers.get("Retry-After")).toBeDefined();
    const retryAfter = parseInt(response!.headers.get("Retry-After")!);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
  });

  it("includes X-RateLimit-Limit and X-RateLimit-Remaining headers", async () => {
    mockCheckEdgeRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const req = makeRequest("http://localhost/api/metrics");
    const response = await rateLimitMiddleware(req);

    expect(response!.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(response!.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("returns proper JSON error body on 429", async () => {
    mockCheckEdgeRateLimit.mockResolvedValue({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 60_000,
    });

    const req = makeRequest("http://localhost/api/metrics");
    const response = await rateLimitMiddleware(req);
    const body = await response!.json();

    expect(body.success).toBe(false);
    expect(body.error.code).toBe("RATE_LIMITED");
    expect(body.error.message).toBe("Too many requests. Please try again later.");
  });
});

describe("Rate Limit Middleware — IP Extraction", () => {
  it("extracts IP from X-Forwarded-For header", async () => {
    const req = makeRequest("http://localhost/api/metrics", {
      headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
    });
    await rateLimitMiddleware(req);

    const key = mockCheckEdgeRateLimit.mock.calls[0][0];
    expect(key).toContain("192.168.1.1");
  });

  it("extracts IP from X-Real-IP header when X-Forwarded-For is missing", async () => {
    const req = makeRequest("http://localhost/api/metrics", {
      headers: { "x-real-ip": "10.0.0.5" },
    });
    await rateLimitMiddleware(req);

    const key = mockCheckEdgeRateLimit.mock.calls[0][0];
    expect(key).toContain("10.0.0.5");
  });

  it("falls back to 'anonymous' when no IP headers present", async () => {
    const req = makeRequest("http://localhost/api/metrics");
    await rateLimitMiddleware(req);

    const key = mockCheckEdgeRateLimit.mock.calls[0][0];
    expect(key).toContain("anonymous");
  });
});

describe("Rate Limit Middleware — Config Selection", () => {
  it("uses SCIM_ENDPOINTS config for /api/scim/ routes", async () => {
    const req = makeRequest("http://localhost/api/scim/v2/Users");
    await rateLimitMiddleware(req);

    const config = mockCheckEdgeRateLimit.mock.calls[0][1];
    expect(config.maxRequests).toBe(10);
  });

  it("uses AI_ENDPOINTS config for /api/ai/ routes", async () => {
    const req = makeRequest("http://localhost/api/ai/completions");
    await rateLimitMiddleware(req);

    const config = mockCheckEdgeRateLimit.mock.calls[0][1];
    expect(config.maxRequests).toBe(20);
  });

  it("uses STANDARD_API config for general /api/ routes", async () => {
    const req = makeRequest("http://localhost/api/metrics");
    await rateLimitMiddleware(req);

    const config = mockCheckEdgeRateLimit.mock.calls[0][1];
    expect(config.maxRequests).toBe(60);
  });
});
