import type { Metadata } from "next";

/**
 * AQLIYA SEO helper — canonical + hreflang alternates.
 *
 * Source of truth for AR ↔ EN page counterparts. Built from VERIFIED 1:1 page
 * existence (see docs/website/AQLIYA_PHASE3_ROUTE_LOCALE_MATRIX.md), NOT the
 * lossy language-switcher map. Redirecting routes and AR-only pages are handled
 * explicitly — no counterparts are invented.
 *
 * Respects the existing `/en` duplicate-tree architecture (no locale routing).
 */

export const SITE_URL = "https://aqliya.com";

/**
 * AR route (path only, no origin) → EN counterpart route.
 * Every entry here is a real, existing page pair in both locales.
 */
const AR_TO_EN_PAIRS: Record<string, string> = {
  "/": "/en",
  "/platform": "/en/platform",
  "/products": "/en/products",
  "/products/audit": "/en/products/audit",
  "/products/local-content": "/en/products/local-content",
  "/products/decision": "/en/products/decision",
  "/products/sales": "/en/products/sales",
  "/products/office-ai": "/en/products/office-ai",
  "/governance": "/en/governance",
  "/security": "/en/security",
  "/deployment": "/en/deployment",
  "/proof": "/en/proof",
  "/demo": "/en/demo",
  "/procurement-pack": "/en/procurement-pack",
  "/case-studies": "/en/case-studies",
  "/industries": "/en/industries",
  "/use-cases": "/en/use-cases",
  "/insights": "/en/insights",
  "/insights/ai-institutional-failures": "/en/insights/ai-institutional-failures",
  "/insights/assistant-vs-governed-intelligence": "/en/insights/assistant-vs-governed-intelligence",
  "/insights/governance-over-intelligence": "/en/insights/governance-over-intelligence",
  "/about": "/en/about",
  "/start": "/en/start",
  "/contact": "/en/contact",
  "/custom-product": "/en/custom-product",
  "/soc2-roadmap": "/en/soc2-roadmap",
  "/privacy": "/en/privacy",
  "/terms": "/en/terms",
};

const EN_TO_AR_PAIRS: Record<string, string> = Object.fromEntries(
  Object.entries(AR_TO_EN_PAIRS).map(([ar, en]) => [en, ar]),
);

/** Safe own-property lookup (avoids object-injection on external route strings). */
function lookup(map: Record<string, string>, key: string): string | undefined {
  // eslint-disable-next-line security/detect-object-injection -- guarded by hasOwnProperty; key is an internal route string
  return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : undefined;
}

/** AR routes that are intentionally AR-only (no EN counterpart, none invented). */
const AR_ONLY = new Set<string>(["/pricing"]);

function absolute(path: string): string {
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

/**
 * Build canonical + hreflang alternates for a marketing page.
 *
 * @param route  Path-only route of the CURRENT page (e.g. "/platform" or "/en/platform").
 * @returns Next.js `Metadata["alternates"]`.
 */
export function buildAlternates(route: string): NonNullable<Metadata["alternates"]> {
  const isEn = route === "/en" || route.startsWith("/en/");

  // Resolve the AR/EN pair (if any).
  let arRoute: string | undefined;
  let enRoute: string | undefined;

  if (isEn) {
    enRoute = route;
    arRoute = lookup(EN_TO_AR_PAIRS, route);
  } else {
    arRoute = route;
    enRoute = lookup(AR_TO_EN_PAIRS, route);
  }

  const canonical = absolute(route);

  // AR-only page: canonical + single ar hreflang, no fabricated EN.
  if (!isEn && AR_ONLY.has(route)) {
    return {
      canonical,
      languages: { "ar-SA": absolute(route) },
    };
  }

  // No known counterpart: canonical only (safe default).
  if (!arRoute || !enRoute) {
    return { canonical };
  }

  return {
    canonical,
    languages: {
      "ar-SA": absolute(arRoute),
      "en-US": absolute(enRoute),
      "x-default": absolute(arRoute),
    },
  };
}

/** All AR routes that have a verified EN counterpart (for sitemap generation). */
export function localizedPagePairs(): Array<{ ar: string; en: string }> {
  return Object.entries(AR_TO_EN_PAIRS).map(([ar, en]) => ({ ar, en }));
}

export { AR_TO_EN_PAIRS, AR_ONLY };
