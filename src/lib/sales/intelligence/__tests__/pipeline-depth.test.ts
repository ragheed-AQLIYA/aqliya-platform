import { describe, expect, it } from "@jest/globals";
import { buildPipelineDepthMetrics } from "../pipeline-depth";
import type { SalesOpportunity } from "../../types";

describe("pipeline-depth (S7-07)", () => {
  const base = (stage: SalesOpportunity["stage"]): SalesOpportunity =>
    ({
      id: "o1",
      organizationId: "org",
      accountId: "a1",
      name: "Deal",
      stage,
      valueEstimate: 100_000,
      ownerId: "u1",
      createdById: "u1",
      updatedAt: new Date().toISOString(),
    }) as SalesOpportunity;

  it("aggregates value by stage", () => {
    const snap = buildPipelineDepthMetrics([
      base("Qualification"),
      base("Qualification"),
      base("ClosedWon"),
    ]);
    expect(snap.stages.length).toBeGreaterThan(0);
    expect(snap.summary.totalValue).toBe(300_000);
  });
});
