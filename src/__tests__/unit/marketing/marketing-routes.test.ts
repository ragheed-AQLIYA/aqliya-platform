import fs from "node:fs";
import path from "node:path";
import { toEnglishPath } from "@/lib/marketing/locale-paths";

const APP_ROOT = path.join(process.cwd(), "src", "app");

/** Public marketing routes that must have a page module (Phase 1.5 smoke guard). */
const MARKETING_ROUTES: Array<{ route: string; file: string }> = [
  { route: "/", file: "(marketing)/page.tsx" },
  { route: "/platform", file: "(marketing)/platform/page.tsx" },
  { route: "/proof", file: "(marketing)/proof/page.tsx" },
  { route: "/procurement-pack", file: "(marketing)/procurement-pack/page.tsx" },
  { route: "/deployment", file: "(marketing)/deployment/page.tsx" },
  { route: "/start", file: "(marketing)/start/page.tsx" },
  { route: "/use-cases", file: "(marketing)/use-cases/page.tsx" },
  { route: "/en/products", file: "en/products/page.tsx" },
  { route: "/en/start", file: "en/start/page.tsx" },
  { route: "/en/use-cases", file: "en/use-cases/page.tsx" },
  { route: "/en", file: "en/page.tsx" },
  { route: "/en/platform", file: "en/platform/page.tsx" },
  { route: "/en/proof", file: "en/proof/page.tsx" },
  { route: "/en/procurement-pack", file: "en/procurement-pack/page.tsx" },
  { route: "/en/deployment", file: "en/deployment/page.tsx" },
  { route: "/en/products/audit", file: "en/products/audit/page.tsx" },
  { route: "/en/products/decision", file: "en/products/decision/page.tsx" },
  { route: "/en/products/local-content", file: "en/products/local-content/page.tsx" },
  { route: "/print/evaluation-sow-en", file: "print/evaluation-sow-en/page.tsx" },
];

describe("marketing route modules exist", () => {
  it.each(MARKETING_ROUTES)("$route → $file", ({ file }) => {
    const full = path.join(APP_ROOT, file);
    expect(fs.existsSync(full)).toBe(true);
  });
});

describe("locale path mappings for EN proof layer", () => {
  it.each([
    ["/procurement-pack", "/en/procurement-pack"],
    ["/engagement-models", "/en/start"],
    ["/deployment", "/en/deployment"],
    ["/how-we-work", "/en/start"],
    ["/buyers", "/en/start"],
    ["/products/decision", "/en/products/decision"],
    ["/products", "/en/products"],
    ["/start", "/en/start"],
    ["/use-cases", "/en/use-cases"],
    ["/executive-brief", "/en/proof"],
    ["/pilot-proof", "/en/proof"],
    ["/proof-library", "/en/proof"],
    ["/pilot-outcomes", "/en/proof"],
    ["/en", "/en"],
    ["/en/platform", "/en/platform"],
  ])("maps %s → %s", (ar, en) => {
    expect(toEnglishPath(ar)).toBe(en);
  });
});
