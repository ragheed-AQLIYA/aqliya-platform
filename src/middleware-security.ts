import { NextResponse } from "next/server";

/**
 * Allowed CORS origins for API routes.
 * In development, allow localhost. In production, restrict to deployment domain.
 */
const ALLOWED_ORIGINS =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:3000", "http://localhost:3001"]
    : [process.env.NEXT_PUBLIC_APP_URL ?? "https://app.aqliya.com"].filter(
        Boolean,
      );

/**
 * API route prefixes that require CORS headers.
 */
const CORS_API_PREFIXES = [
  "/api/local-content",
  "/api/audit",
  "/api/decisions",
  "/api/platform/evidence",
];

/**
 * Add CORS headers to API responses if the request origin is allowed.
 */
export function setCorsHeaders(request: Request, response: NextResponse) {
  const origin = request.headers.get("origin");
  if (!origin) return response;

  const url = new URL(request.url);
  const needsCors = CORS_API_PREFIXES.some((prefix) =>
    url.pathname.startsWith(prefix),
  );
  if (!needsCors) return response;

  if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes("*")) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );
    response.headers.set("Access-Control-Max-Age", "86400");
  } else {
    // Deny: don't set ACAO, browser will block
    response.headers.delete("Access-Control-Allow-Origin");
  }

  return response;
}

const securityHeaders = {
  "Strict-Transport-Security":
    "max-age=31536000; includeSubDomains; preload",
  "X-DNS-Prefetch-Control": "on",
  "X-XSS-Protection": "1; mode=block",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // Strict CSP — no unsafe-eval.
  // style-src 'unsafe-inline' is required for Tailwind CSS v4 + shadcn/ui
  // which generate inline styles during server rendering.
  // script-src 'unsafe-inline' is required in development for Next.js dev mode inline scripts.
  // In production, script-src remains 'self' only (no unsafe-inline for scripts).
  "Content-Security-Policy":
    process.env.NODE_ENV === "production"
      ? "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.sentry.io;"
      : "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.sentry.io;",
  "X-Powered-By": "",
};

export function setSecurityHeaders(response: NextResponse) {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    } else {
      response.headers.delete(key);
    }
  });
  return response;
}
