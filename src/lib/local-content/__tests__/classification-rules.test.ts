import {
  DEFAULT_CLASSIFICATION_RULES,
  resolveClassificationRules,
  validateClassificationAgainstRules,
} from "../classification-rules";

describe("classification-rules (LC-04)", () => {
  it("returns defaults when metadata empty", () => {
    expect(resolveClassificationRules(null).length).toBe(
      DEFAULT_CLASSIFICATION_RULES.length,
    );
  });

  it("parses overrides from metadata", () => {
    const rules = resolveClassificationRules({
      classificationRules: [
        {
          id: "custom",
          category: "services",
          labelAr: "خدمات مخصصة",
          minLocalPct: 50,
          allowedBases: ["certificate"],
          minConfidence: "high",
          active: true,
        },
      ],
    });
    expect(rules[0].minLocalPct).toBe(50);
  });

  it("flags violations", () => {
    const rules = resolveClassificationRules(null);
    const res = validateClassificationAgainstRules(rules, {
      category: "services",
      localPercentage: 10,
      classificationBasis: "analyst_estimate",
      confidence: "low",
    });
    expect(res.ok).toBe(false);
    expect(res.violations.length).toBeGreaterThan(0);
  });
});
