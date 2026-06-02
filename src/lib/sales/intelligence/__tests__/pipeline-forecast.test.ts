// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import { buildPipelineForecast } from "../pipeline-forecast";
import type { SalesOpportunity } from "../../types";

describe("pipeline-forecast", () => {
  const base: SalesOpportunity = {
    id: "o1",
    organizationId: "org",
    accountId: "a1",
    name: "Deal",
    stage: "Qualification",
    valueEstimate: 100_000,
    ownerId: "u1",
    createdById: "u1",
  };

  it("weights pipeline by stage", () => {
    const forecast = buildPipelineForecast([base]);
    expect(forecast.weightedTotal).toBeGreaterThan(0);
    expect(forecast.weightedTotal).toBeLessThan(forecast.totalRaw);
  });

  it("returns low confidence with few opportunities", () => {
    expect(buildPipelineForecast([base]).forecastConfidence).toBe("low");
  });
});
