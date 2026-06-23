import fs from "node:fs";
import path from "node:path";
import {
  getSafeDemoActorLabel,
  getSafeDemoEventDescription,
  sanitizeDemoNarrative,
} from "@/app/auditos/demo-safety";

const AUDITOS_PAGES = [
  "page.tsx",
  "trial-balance/page.tsx",
  "mapping/page.tsx",
  "statements/page.tsx",
  "evidence/page.tsx",
  "traceability/page.tsx",
];

const ROOT = path.join(process.cwd(), "src", "app", "auditos");

describe("AuditOS public demo (/auditos)", () => {
  it.each(AUDITOS_PAGES)("page module exists: %s", (rel) => {
    expect(fs.existsSync(path.join(ROOT, rel))).toBe(true);
  });

  it("layout declares Demo Only safety banner", () => {
    const layout = fs.readFileSync(path.join(ROOT, "layout.tsx"), "utf8");
    expect(layout).toMatch(/Demo Only/);
    expect(layout).toMatch(/بيانات تجريبية/);
  });

  it("demo-safety sanitizes customer names from narrative", () => {
    const raw = "Send formal evidence request to Gulf Trading Co.";
    expect(sanitizeDemoNarrative(raw)).not.toContain("Gulf Trading Co.");
    expect(sanitizeDemoNarrative(raw)).toContain("demo entity");
  });

  it("demo-safety maps known audit events to safe descriptions", () => {
    const desc = getSafeDemoEventDescription(
      "trial_balance.uploaded",
      "fallback",
    );
    expect(desc).toMatch(/تجريب/);
  });

  it("demo-safety neutralizes actor labels", () => {
    expect(getSafeDemoActorLabel("Ahmed Al Ghamdi")).toBe("فريق العرض");
    expect(getSafeDemoActorLabel("AI Assistant")).toBe("المساعد الذكي");
  });

  it.each(AUDITOS_PAGES)("step navigation present on %s", (rel) => {
    const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
    expect(content).toMatch(/StepNav/);
  });
});

describe("AuditOS demo pages avoid engineering maturity language", () => {
  const FORBIDDEN = [/pilot-ready/i, /\bL[456]\b/, /Go\/No-Go/i];

  it.each(AUDITOS_PAGES)("forbidden terms absent in %s", (rel) => {
    const content = fs.readFileSync(path.join(ROOT, rel), "utf8");
    for (const pattern of FORBIDDEN) {
      expect(content).not.toMatch(pattern);
    }
  });
});
