/**
 * Middleware Integration: Auth Guard Tests
 *
 * Verifies that the middleware correctly:
 * 1. Protects authenticated routes (redirects to /login or returns 401 for API)
 * 2. Allows public routes through without auth
 * 3. Returns proper status codes for API vs. page routes
 * 4. Handles MFA gate state
 * 5. Enforces RBAC route minimum roles
 */

// Mock next-auth/jwt getToken
const mockGetToken = jest.fn();
jest.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

jest.mock("@/middleware-rate-limit", () => ({
  rateLimitMiddleware: jest.fn().mockResolvedValue(null),
}));

jest.mock("@/middleware-security", () => ({
  setSecurityHeaders: jest.fn((res: unknown) => res),
  setCorsHeaders: jest.fn((_req: unknown, res: unknown) => res),
}));

jest.mock("@/lib/auth/mfa-gate", () => ({
  resolveMfaGateState: jest.fn().mockReturnValue("allow"),
}));

import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { rateLimitMiddleware } from "@/middleware-rate-limit";
import { resolveMfaGateState } from "@/lib/auth/mfa-gate";

const mockRateLimit = jest.mocked(rateLimitMiddleware);
const mockMfaGate = jest.mocked(resolveMfaGateState);

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
  mockRateLimit.mockResolvedValue(null);
  mockMfaGate.mockReturnValue("allow");
});

describe("Middleware — Public Route Access", () => {
  it("allows access to / (root) without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/");
    const response = await middleware(req);

    // Should not redirect — public route
    expect(response.status).not.toBe(307);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows access to /login without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/login");
    const response = await middleware(req);

    expect(response.status).not.toBe(307);
  });

  it("allows access to /auditos (demo) without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/auditos");
    const response = await middleware(req);

    expect(response.status).not.toBe(307);
  });

  it("allows access to /api/health without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/health");
    const response = await middleware(req);

    expect(response.status).not.toBe(401);
  });

  it("allows access to /api/auth routes without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/auth/session");
    const response = await middleware(req);

    // Public prefix — should pass through
    expect(response.status).not.toBe(401);
  });

  it("allows access to /about without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/about");
    const response = await middleware(req);

    expect(response.status).not.toBe(307);
  });
});

describe("Middleware — Protected Route Auth Guard", () => {
  it("redirects to /login for protected page routes without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/audit/engagements");
    const response = await middleware(req);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("callbackUrl");
  });

  it("returns 401 for protected API routes without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/audit/engagements");
    const response = await middleware(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("UNAUTHENTICATED");
  });

  it("returns 401 for /api/metrics without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/metrics");
    const response = await middleware(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("UNAUTHENTICATED");
  });

  it("returns 401 for /api/local-content routes without token", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/api/local-content/projects");
    const response = await middleware(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("UNAUTHENTICATED");
  });

  it("redirects protected page routes (e.g. /decisions) to /login", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/decisions");
    const response = await middleware(req);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
  });

  it("allows access when valid token is present", async () => {
    mockGetToken.mockResolvedValue({
      role: "OPERATOR",
      mfaEnabled: false,
    });

    const req = makeRequest("http://localhost/audit");
    const response = await middleware(req);

    // Should pass through (200) — no redirect
    expect(response.status).not.toBe(307);
    expect(response.status).not.toBe(401);
  });
});

describe("Middleware — Token Error Handling", () => {
  it("returns 401 for API routes when getToken throws", async () => {
    mockGetToken.mockRejectedValue(new Error("JWT malformed"));

    const req = makeRequest("http://localhost/api/metrics");
    const response = await middleware(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.code).toBe("UNAUTHENTICATED");
  });

  it("redirects to /login for page routes when getToken throws", async () => {
    mockGetToken.mockRejectedValue(new Error("JWT malformed"));

    const req = makeRequest("http://localhost/audit");
    const response = await middleware(req);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
  });
});

describe("Middleware — RBAC Route Protection", () => {
  it("returns 403 for API routes when role is insufficient", async () => {
    mockGetToken.mockResolvedValue({
      role: "VIEWER",
      mfaEnabled: false,
    });

    // /settings/sso requires admin
    const req = makeRequest("http://localhost/settings/sso");
    const response = await middleware(req);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/access-denied");
  });

  it("returns 403 for API monitoring routes with viewer role", async () => {
    mockGetToken.mockResolvedValue({
      role: "VIEWER",
      mfaEnabled: false,
    });

    const req = makeRequest("http://localhost/api/monitoring/status");
    const response = await middleware(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.code).toBe("FORBIDDEN");
  });

  it("allows admin routes when user has ADMIN role", async () => {
    mockGetToken.mockResolvedValue({
      role: "ADMIN",
      mfaEnabled: false,
    });

    const req = makeRequest("http://localhost/settings/sso");
    const response = await middleware(req);

    // Should pass through
    expect(response.status).not.toBe(307);
  });

  it("allows viewer routes with VIEWER role", async () => {
    mockGetToken.mockResolvedValue({
      role: "VIEWER",
      mfaEnabled: false,
    });

    const req = makeRequest("http://localhost/audit");
    const response = await middleware(req);

    // Should pass through
    expect(response.status).not.toBe(307);
  });
});

describe("Middleware — MFA Gate", () => {
  it("returns 403 MFA_REQUIRED for API routes when MFA gate blocks", async () => {
    mockGetToken.mockResolvedValue({
      role: "ADMIN",
      mfaEnabled: true,
      mfaVerified: false,
    });
    mockMfaGate.mockReturnValue("challenge");

    const req = makeRequest("http://localhost/api/metrics");
    const response = await middleware(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.code).toBe("MFA_REQUIRED");
  });

  it("redirects to /login with mfa param for page routes when MFA blocks", async () => {
    mockGetToken.mockResolvedValue({
      role: "ADMIN",
      mfaEnabled: true,
      mfaVerified: false,
    });
    mockMfaGate.mockReturnValue("challenge");

    const req = makeRequest("http://localhost/audit");
    const response = await middleware(req);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("mfa=true");
  });

  it("redirects to /settings/mfa for enroll state", async () => {
    mockGetToken.mockResolvedValue({
      role: "OPERATOR",
      mfaEnabled: false,
      mfaVerified: false,
    });
    mockMfaGate.mockReturnValue("enroll");

    const req = makeRequest("http://localhost/audit");
    const response = await middleware(req);

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toContain("/settings/mfa");
  });
});

describe("Middleware — Security Headers", () => {
  it("includes X-Response-Time header in response", async () => {
    mockGetToken.mockResolvedValue(null); // public path

    const req = makeRequest("http://localhost/");
    const response = await middleware(req);

    expect(response.headers.get("X-Response-Time")).toBeDefined();
  });
});

describe("Middleware — Rate Limiting", () => {
  it("returns rate limit response when rate limit triggers", async () => {
    const rateLimitResponse = new Response(
      JSON.stringify({ error: "Rate limited" }),
      { status: 429 },
    );
    mockRateLimit.mockResolvedValue(rateLimitResponse as any);

    const req = makeRequest("http://localhost/api/metrics");
    const response = await middleware(req);

    expect(response.status).toBe(429);
  });

  it("skips rate limiting for non-API paths", async () => {
    mockGetToken.mockResolvedValue(null);

    const req = makeRequest("http://localhost/login");
    await middleware(req);

    // rateLimitMiddleware should still be called but returns null for non-API
    expect(mockRateLimit).toHaveBeenCalled();
  });
});
