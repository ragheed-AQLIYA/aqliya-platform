/** Map Arabic marketing routes ↔ English /en routes (Week 2 MVP). */
const AR_TO_EN: Record<string, string> = {
  "/": "/en",
  "/platform": "/en/platform",
  "/about": "/en/about",
  "/industries": "/en/industries",
  "/executive-brief": "/en/executive-brief",
  "/security": "/en/security",
  "/products/audit": "/en/products/audit",
  "/products/decision": "/en/products/decision",
  "/products/local-content": "/en/products/local-content",
  "/soc2-roadmap": "/en/soc2-roadmap",
  "/demo": "/en/demo",
  "/contact": "/en/contact",
  "/proof": "/en/proof",
  "/governance": "/en/governance",
  "/engagement-models": "/en/engagement-models",
  "/deployment": "/en/deployment",
  "/procurement-pack": "/en/procurement-pack",
  "/how-we-work": "/en/how-we-work",
  "/products": "/en/products",
  "/start": "/en/start",
  "/use-cases": "/en/use-cases",
  "/pilot-proof": "/pilot-proof",
};

const EN_TO_AR: Record<string, string> = Object.fromEntries(
  Object.entries(AR_TO_EN).map(([ar, en]) => [en, ar]),
);

export function toEnglishPath(pathname: string): string {
  if (pathname === "/en" || pathname.startsWith("/en/")) return pathname;
  return AR_TO_EN[pathname] ?? "/en";
}

export function toArabicPath(pathname: string): string {
  if (!pathname.startsWith("/en")) return pathname;
  return EN_TO_AR[pathname] ?? "/";
}

export function isEnglishPath(pathname: string): boolean {
  return pathname === "/en" || pathname.startsWith("/en/");
}
