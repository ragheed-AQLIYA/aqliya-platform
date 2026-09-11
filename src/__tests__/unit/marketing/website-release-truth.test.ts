import fs from "node:fs";
import path from "node:path";
import ar from "../../../../messages/ar.json";
import en from "../../../../messages/en.json";

const ROOT = process.cwd();

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

describe("website release commercial truth", () => {
  it("does not sell private deployment as a live Enterprise feature", () => {
    const pricing = read("src/app/(marketing)/pricing/page.tsx");
    expect(pricing).not.toMatch(/"نشر خاص \(Private Deployment\)"/);
    expect(pricing).not.toMatch(/"Private deployment"/);
    expect(pricing).toMatch(/قيد التخطيط/);
    expect(pricing).toMatch(/not a production package/i);
  });

  it("labels Private / Air-Gapped as planned or strategic on platform pages", () => {
    const arPlatform = read("src/app/(marketing)/platform/page.tsx");
    const enPlatform = read("src/app/en/platform/page.tsx");
    expect(arPlatform).toMatch(/statusLabel: "قيد التخطيط"/);
    expect(arPlatform).not.toMatch(/متاح لعملاء منتقَين/);
    expect(enPlatform).toMatch(/statusLabel: "Planned"/);
    expect(enPlatform).not.toMatch(/Available to selected clients/);
  });
});

describe("website release FAQ namespaces", () => {
  it("includes faq.home and faq.pricing in Arabic and English messages", () => {
    for (const messages of [ar, en] as const) {
      expect(messages.faq.home.count).toMatch(/^\d+$/);
      expect(Number(messages.faq.home.count)).toBeGreaterThan(0);
      expect(messages.faq.pricing.count).toMatch(/^\d+$/);
      expect(messages.faq.home.q1.length).toBeGreaterThan(0);
      expect(messages.faq.pricing.a3).toMatch(/تخطيط|planning/i);
    }
  });

  it("associates FAQ answers with question ids", () => {
    const source = read("src/components/marketing/faq-section.tsx");
    expect(source).toMatch(/id=\{`faq-question-\$\{index\}`\}/);
    expect(source).toMatch(/aria-labelledby=\{`faq-question-\$\{index\}`\}/);
    expect(source).toMatch(/Number\.isFinite\(count\)/);
  });
});

describe("website release SEO guards", () => {
  it("does not advertise a public /search SearchAction", () => {
    const source = read("src/components/marketing/structured-data.tsx");
    expect(source).not.toMatch(/SearchAction/);
    expect(source).not.toMatch(/aqliya\.com\/search/);
    expect(source).not.toMatch(/potentialAction/);
  });

  it("does not double-brand Arabic marketing page titles", () => {
    const marketingDir = path.join(ROOT, "src", "app", "(marketing)");
    const offenders: string[] = [];

    function walk(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
          continue;
        }
        if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".ts")) continue;
        if (entry.name === "layout.tsx") continue;
        const text = fs.readFileSync(full, "utf8");
        if (/title:\s*["'`].*\| AQLIYA/.test(text) || /const title = ["'`].*\| AQLIYA/.test(text)) {
          offenders.push(path.relative(ROOT, full));
        }
      }
    }

    walk(marketingDir);
    expect(offenders).toEqual([]);
  });
});
