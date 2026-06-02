// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import { buildPipelineAnalytics } from "../pipeline-analytics";
import type { SalesOpportunity } from "../types";

describe("SalesOS vNext pipeline analytics", () => {
  it("computes weighted pipeline value", () => {
    const opps: SalesOpportunity[] = [
      {
        id: "o1",
        organizationId: "org",
        accountId: "a1",
        name: "Deal A",
        stage: "Qualification",
        valueEstimate: 100000,
        ownerId: "u1",
        createdById: "u1",
      },
      {
        id: "o2",
        organizationId: "org",
        accountId: "a1",
        name: "Deal B",
        stage: "ClosedWon",
        valueEstimate: 50000,
        ownerId: "u1",
        createdById: "u1",
      },
    ];
    const summary = buildPipelineAnalytics(opps);
    expect(summary.totalValue).toBe(150000);
    expect(summary.weightedValue).toBeGreaterThan(0);
    expect(summary.stageDistribution.ClosedWon).toBe(1);
  });
});
