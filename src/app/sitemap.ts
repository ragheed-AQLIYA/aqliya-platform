import type { MetadataRoute } from "next";
import { localizedPagePairs, SITE_URL } from "@/lib/marketing/seo";

const baseUrl = SITE_URL;

/**
 * Priority hints per AR route family. EN counterparts inherit a slightly lower
 * priority. Anything not listed defaults to 0.6.
 */
const priorityByRoute: Record<string, number> = {
  "/": 1.0,
  "/platform": 0.95,
  "/proof": 0.95,
  "/industries": 0.9,
  "/start": 0.9,
  "/procurement-pack": 0.85,
  "/governance": 0.85,
  "/security": 0.8,
  "/about": 0.8,
  "/demo": 0.8,
  "/products/audit": 0.8,
  "/soc2-roadmap": 0.75,
  "/products": 0.7,
  "/products/decision": 0.7,
  "/products/local-content": 0.7,
  "/products/sales": 0.7,
  "/products/office-ai": 0.7,
  "/deployment": 0.7,
  "/use-cases": 0.7,
  "/case-studies": 0.7,
  "/insights": 0.7,
  "/custom-product": 0.6,
  "/contact": 0.6,
};

function priorityFor(arRoute: string): number {
  return Object.prototype.hasOwnProperty.call(priorityByRoute, arRoute)
    ? // eslint-disable-next-line security/detect-object-injection -- key is an internal route string from our own map
      priorityByRoute[arRoute]
    : 0.6;
}

function absolute(path: string): string {
  return `${baseUrl}${path === "/" ? "" : path}`;
}

/**
 * AR-only public pages (no EN counterpart; none invented).
 */
const arOnlyPages = ["/pricing"];

/**
 * Public procurement/print PDFs and the guided public demo surface.
 * These are genuine public marketing collateral (not app routes).
 */
const collateralPages = [
  "/print/executive-brief",
  "/print/executive-brief-en",
  "/print/security-summary",
  "/print/data-residency",
  "/print/subprocessors",
  "/print/dpa-summary",
  "/print/pilot-sow-template",
  "/print/industry-audit-firms",
  "/auditos",
  "/auditos/trial-balance",
  "/auditos/mapping",
  "/auditos/statements",
  "/auditos/evidence",
  "/auditos/traceability",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  const push = (
    path: string,
    priority: number,
    alternates?: Record<string, string>,
  ) => {
    const url = absolute(path);
    if (seen.has(url)) return;
    seen.add(url);
    entries.push({
      url,
      lastModified: now,
      changeFrequency: "monthly",
      priority,
      ...(alternates ? { alternates: { languages: alternates } } : {}),
    });
  };

  // Localized AR ↔ EN pairs with hreflang alternates in the sitemap.
  for (const { ar, en } of localizedPagePairs()) {
    const languages = {
      "ar-SA": absolute(ar),
      "en-US": absolute(en),
    };
    const p = priorityFor(ar);
    push(ar, p, languages);
    push(en, Math.max(0.4, p - 0.1), languages);
  }

  // AR-only public pages.
  for (const path of arOnlyPages) push(path, 0.6);

  // Public collateral / guided demo.
  for (const path of collateralPages) push(path, 0.5);

  return entries;
}
