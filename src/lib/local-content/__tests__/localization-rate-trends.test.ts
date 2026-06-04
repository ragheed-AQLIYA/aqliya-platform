import { buildLocalizationRateTrends } from "../localization-rate-trends";

describe("localization-rate-trends (LC-07)", () => {
  it("builds period series with trend direction", () => {
    const snap = buildLocalizationRateTrends([
      {
        amount: 1000,
        period: "2024-Q1",
        supplier: {
          localityClassification: "local",
          localContentPercentage: 100,
        },
      },
      {
        amount: 1000,
        period: "2024-Q2",
        supplier: {
          localityClassification: "non_local",
          localContentPercentage: 0,
        },
      },
    ]);
    expect(snap.points).toHaveLength(2);
    expect(snap.points[0].localContentPercentage).toBe(100);
    expect(snap.points[1].localContentPercentage).toBe(0);
    expect(snap.trendDirection).toBe("down");
  });
});
