import { buildDecisionSectorIntelligence } from "../sector-intelligence";

describe("buildDecisionSectorIntelligence (D3-03)", () => {
  it("returns assign guidance when sector missing", () => {
    const snap = buildDecisionSectorIntelligence({
      sectorId: null,
      sector: null,
    });
    expect(snap.assigned).toBe(false);
    expect(snap.guidance.length).toBeGreaterThan(0);
  });

  it("includes benchmarks and patterns when sector assigned", () => {
    const snap = buildDecisionSectorIntelligence({
      sectorId: "sec-1",
      sector: {
        id: "sec-1",
        name: "طاقة",
        code: "ENERGY",
        description: "قطاع الطاقة",
        benchmarks: [
          {
            metricName: "avg_deal_cycle",
            value: 90,
            unit: "days",
            benchmarkType: "median",
          },
        ],
        patterns: [
          {
            patternType: "risk",
            patternKey: "regulatory_delay",
            confidenceScore: 0.7,
            occurrenceCount: 3,
          },
        ],
      },
    });
    expect(snap.assigned).toBe(true);
    expect(snap.benchmarks).toHaveLength(1);
    expect(snap.patterns).toHaveLength(1);
    expect(snap.guidance.some((g) => g.includes("طاقة"))).toBe(true);
  });
});
