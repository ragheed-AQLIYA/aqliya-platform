import { NextResponse } from "next/server";

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
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';",
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
