import { NextResponse } from "next/server";

// Drop 'unsafe-eval' in production; keep it in development for HMR/tooling that
// relies on eval. 'unsafe-inline' is retained for now — fully removing it needs
// a nonce-based CSP, which is a separate, runtime-tested change.
const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  // OWASP guidance: disable the legacy XSS auditor (it can introduce
  // side-channels in older browsers; modern browsers ignore it). CSP is
  // the real XSS control.
  "X-XSS-Protection": "0",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  // Minimal CSP to reduce XSS risk without redesigning existing pages.
  // script-src drops 'unsafe-eval' in production (see scriptSrc above).
  "Content-Security-Policy": `default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';`,
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
