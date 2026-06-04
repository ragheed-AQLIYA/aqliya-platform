import {
  buildMaterialitySummary,
  calculatePerformanceMateriality,
  calculateSamplingThreshold,
  classifyBalanceMateriality,
} from "../materiality";

describe("audit materiality (A1-03)", () => {
  it("derives performance materiality from revenue", () => {
    expect(
      calculatePerformanceMateriality({ revenue: 10_000_000, performancePct: 5 }),
    ).toBe(500_000);
  });

  it("derives sampling threshold at 80% of performance", () => {
    expect(calculateSamplingThreshold(500_000)).toBe(400_000);
  });

  it("classifies balances against threshold", () => {
    expect(classifyBalanceMateriality(500_000, 400_000)).toBe("material");
    expect(classifyBalanceMateriality(100, 400_000)).toBe("immaterial");
  });

  it("builds summary with disclaimer", () => {
    const s = buildMaterialitySummary({ revenue: 1_000_000, performancePct: 5 });
    expect(s.performanceMateriality).toBe(50_000);
    expect(s.disclaimerAr.length).toBeGreaterThan(0);
  });
});
