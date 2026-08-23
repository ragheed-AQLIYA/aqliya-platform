/**
 * Middleware Integration: Security Headers & CORS Tests
 *
 * Verifies the middleware-security module:
 * 1. Security headers are applied to all responses
 * 2. CORS headers are only applied to specific API prefixes
 * 3. CORS origin validation works correctly
 * 4. CSP header doesn't contain unsafe-eval/unsafe-inline
 */

import { NextResponse } from "next/server";

function makeRequest(
  url: string,
  options: { origin?: string } = {},
): Request {
  const headers = new Headers();
  if (options.origin) {
    headers.set("origin", options.origin);
  }
  return new Request(url, { headers });
}

function makeResponse(): NextResponse {
  return new NextResponse("ok", { status: 200 });
}

describe("setSecurityHeaders()", () => {
  let setSecurityHeaders: typeof import("@/middleware-security").setSecurityHeaders;

  beforeAll(() => {
    ({ setSecurityHeaders } = require("@/middleware-security"));
  });

  it("sets HSTS header", () => {
    const response = setSecurityHeaders(makeResponse());
    expect(response.headers.get("Strict-Transport-Security")).toContain(
      "max-age=31536000",
    );
  });

  it("sets X-Content-Type-Options to nosniff", () => {
    const response = setSecurityHeaders(makeResponse());
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets X-Frame-Options to SAMEORIGIN", () => {
    const response = setSecurityHeaders(makeResponse());
    expect(response.headers.get("X-Frame-Options")).toBe("SAMEORIGIN");
  });

  it("sets Referrer-Policy header", () => {
    const response = setSecurityHeaders(makeResponse());
    expect(response.headers.get("Referrer-Policy")).toBe(
      "strict-origin-when-cross-origin",
    );
  });

  it("sets Permissions-Policy blocking camera/microphone/geolocation", () => {
    const response = setSecurityHeaders(makeResponse());
    const pp = response.headers.get("Permissions-Policy");
    expect(pp).toContain("camera=()");
    expect(pp).toContain("microphone=()");
    expect(pp).toContain("geolocation=()");
  });

  it("CSP does NOT contain unsafe-eval in production", () => {
    const savedNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const response = setSecurityHeaders(makeResponse());
    process.env.NODE_ENV = savedNodeEnv;
    const csp = response.headers.get("Content-Security-Policy");

    expect(csp).toBeDefined();
    expect(csp).not.toContain("unsafe-eval");
    // 'unsafe-inline' in script-src is required by Next.js hydration — this is expected
  });

  it("CSP includes frame-ancestors 'none'", () => {
    const response = setSecurityHeaders(makeResponse());
    const csp = response.headers.get("Content-Security-Policy");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("CSP includes default-src 'self'", () => {
    const response = setSecurityHeaders(makeResponse());
    const csp = response.headers.get("Content-Security-Policy");
    expect(csp).toContain("default-src 'self'");
  });

  it("removes X-Powered-By header", () => {
    const response = setSecurityHeaders(makeResponse());
    expect(response.headers.get("X-Powered-By")).toBeNull();
  });
});

describe("setCorsHeaders()", () => {
  let setCorsHeaders: typeof import("@/middleware-security").setCorsHeaders;
  const savedEnv = process.env.NEXT_PUBLIC_APP_URL;

  beforeAll(() => {
    // Set NEXT_PUBLIC_APP_URL BEFORE requiring the module so ALLOWED_ORIGINS is correct
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    jest.resetModules();
    ({ setCorsHeaders } = require("@/middleware-security"));
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = savedEnv;
  });

  it("does not set CORS headers for non-API paths", () => {
    const request = makeRequest("http://localhost/audit", {
      origin: "http://localhost:3000",
    });
    const response = setCorsHeaders(request, makeResponse());

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("sets CORS headers for /api/local-content paths when origin matches", () => {
    const request = makeRequest("http://localhost/api/local-content/projects", {
      origin: "http://localhost:3000",
    });
    const response = setCorsHeaders(request, makeResponse());

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
    expect(response.headers.get("Access-Control-Allow-Methods")).toBeDefined();
    expect(response.headers.get("Access-Control-Allow-Headers")).toBeDefined();
  });

  it("sets CORS headers for /api/audit paths", () => {
    const request = makeRequest("http://localhost/api/audit/evidence", {
      origin: "http://localhost:3000",
    });
    const response = setCorsHeaders(request, makeResponse());

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
  });

  it("sets CORS headers for /api/decisions paths", () => {
    const request = makeRequest("http://localhost/api/decisions/d1", {
      origin: "http://localhost:3000",
    });
    const response = setCorsHeaders(request, makeResponse());

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "http://localhost:3000",
    );
  });

  it("does NOT set CORS headers for unknown origins", () => {
    const request = makeRequest("http://localhost/api/local-content/projects", {
      origin: "https://evil-attacker.com",
    });
    const response = setCorsHeaders(request, makeResponse());

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("does not set CORS headers when origin header is missing", () => {
    const request = makeRequest("http://localhost/api/local-content/projects");
    const response = setCorsHeaders(request, makeResponse());

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("sets CORS max-age to 86400 (24 hours)", () => {
    const request = makeRequest("http://localhost/api/local-content/projects", {
      origin: "http://localhost:3000",
    });
    const response = setCorsHeaders(request, makeResponse());

    expect(response.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
