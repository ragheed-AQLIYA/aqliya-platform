/** @jest-environment node */

import { clearIsaRulesCache, loadIsaKnowledgeRules } from "@/lib/audit/rules/isa-rules-loader";

describe("ISA rules loader", () => {
  beforeEach(() => {
    clearIsaRulesCache();
  });

  it("loads executable ISA rules from knowledge foundation", () => {
    const rules = loadIsaKnowledgeRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((rule) => rule.standardCode.includes("ISA 315"))).toBe(
      true,
    );
  });
});
