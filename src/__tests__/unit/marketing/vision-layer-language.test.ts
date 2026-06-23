import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "src", "app");

const VISION_FILES = [
  "(marketing)/page.tsx",
  "(marketing)/platform/page.tsx",
  "(marketing)/about/page.tsx",
  "(marketing)/products/page.tsx",
  "(marketing)/products/audit/page.tsx",
  "(marketing)/products/decision/page.tsx",
  "(marketing)/products/local-content/page.tsx",
  "(marketing)/industries/page.tsx",
  "(marketing)/governance/page.tsx",
  "en/page.tsx",
  "en/platform/page.tsx",
  "en/about/page.tsx",
  "en/industries/page.tsx",
  "en/governance/page.tsx",
  "en/products/audit/page.tsx",
  "en/products/decision/page.tsx",
  "en/products/local-content/page.tsx",
];

/** Patterns forbidden on vision-layer pages per docs/marketing/MARKETING_TERMINOLOGY.md */
const FORBIDDEN = [
  /pilot-ready/i,
  /pilot candidate/i,
  /\bL[456]\b/,
  /usable v0\.1/i,
  /جاهز للبايلوت/,
  /قيد التطوير/,
  /Go\/No-Go/i,
];

function readVisionFile(rel: string): string {
  const full = path.join(ROOT, rel);
  expect(fs.existsSync(full)).toBe(true);
  return fs.readFileSync(full, "utf8");
}

describe("marketing vision-layer language compliance", () => {
  it.each(VISION_FILES)("forbidden terms absent in %s", (rel) => {
    const content = readVisionFile(rel);
    for (const pattern of FORBIDDEN) {
      expect(content).not.toMatch(pattern);
    }
  });
});
