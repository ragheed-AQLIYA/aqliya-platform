import {
  SALES_L5_CRITERIA,
  SALES_L5_REPO_BASELINE,
  evaluateSalesL5Acceptance,
} from "../l5-acceptance";

describe("SalesOS L5 acceptance (S7-04)", () => {
  it("defines required criteria set", () => {
    const required = SALES_L5_CRITERIA.filter((c) => c.requiredForL5);
    expect(required.length).toBeGreaterThanOrEqual(10);
    expect(required.some((c) => c.id === "I1_INTELLIGENCE_HUB")).toBe(true);
    expect(required.some((c) => c.id === "I2_PIPELINE_FORECAST")).toBe(true);
  });

  it("repo baseline meets L5 criteria after S7-05 (pilot-ready with operator disclaimer)", () => {
    const result = evaluateSalesL5Acceptance(SALES_L5_REPO_BASELINE);
    expect(result.allRequiredMet).toBe(true);
    expect(result.readinessLabel).toBe("L5_PILOT_READY");
  });

  it("reports L5 pilot ready when all required met", () => {
    const allMet = Object.fromEntries(
      SALES_L5_CRITERIA.map((c) => [c.id, true]),
    ) as typeof SALES_L5_REPO_BASELINE;
    const result = evaluateSalesL5Acceptance(allMet);
    expect(result.allRequiredMet).toBe(true);
    expect(result.readinessLabel).toBe("L5_PILOT_READY");
  });
});
