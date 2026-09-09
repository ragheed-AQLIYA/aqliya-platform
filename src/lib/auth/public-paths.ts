/**
 * Default-deny public surface. Everything else requires a session.
 * Keep this list explicit — new public routes must be added here and tested.
 */

export const PUBLIC_EXACT = new Set([
  "/",
  "/about",
  "/contact",
  "/custom-product",
  "/demo",
  "/deployment",
  "/engagement-models",
  "/executive-brief",
  "/executive-briefing",
  "/governance",
  "/how-we-work",
  "/industries",
  "/insights",
  "/login",
  "/procurement-pack",
  "/proof",
  "/en",
  "/signup",
  "/access-denied",
  "/pilot-outcomes",
  "/pilot-proof",
  "/soc2-roadmap",
  "/platform",
  "/pricing",
  "/start",
  "/privacy",
  "/proof-library",
  "/products",
  "/security",
  "/terms",
  "/use-cases",
  "/case-studies",
  "/auditos",
  "/api/custom-product-submit",
  "/api/pilot-review",
  "/api/sales/intel/webhook",
  "/api/sales/intel/oauth",
  "/api/platform/health",
  "/api/pow/challenge",
  "/api/crm/webhook",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

export const PUBLIC_PREFIXES = [
  "/_next",
  "/invite/",
  "/api/auth",
  "/api/scim",
  "/api/health",
  "/auditos/",
  "/en/",
  "/print/",
  "/products/",
  "/buyers/",
  "/insights/",
  "/opengraph-image",
  "/twitter-image",
];

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  return false;
}
