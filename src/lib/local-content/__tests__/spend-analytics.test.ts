import { describe, expect, it } from "@jest/globals";
import { buildOrganizationSpendAnalytics } from "../spend-analytics";

describe("spend-analytics (LC-06)", () => {
  it("aggregates spend across projects", () => {
    const analytics = buildOrganizationSpendAnalytics({
      projects: [
        {
          id: "p1",
          name: "Alpha",
          reportingPeriod: "2025",
          status: "InReview",
          spendRecords: [
            {
              amount: 1000,
              category: "goods",
              supplier: {
                localityClassification: "local",
                localContentPercentage: 100,
              },
            },
          ],
        },
        {
          id: "p2",
          name: "Beta",
          reportingPeriod: "2025",
          status: "Draft",
          spendRecords: [
            {
              amount: 500,
              category: "services",
              supplier: {
                localityClassification: "non_local",
                localContentPercentage: 0,
              },
            },
          ],
        },
      ],
    });

    expect(analytics.projectCount).toBe(2);
    expect(analytics.totalSpend).toBe(1500);
    expect(analytics.localSpend).toBe(1000);
    expect(analytics.nonLocalSpend).toBe(500);
    expect(analytics.projects[0].projectName).toBe("Alpha");
  });
});
