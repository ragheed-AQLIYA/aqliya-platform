// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import { scoreOpportunity } from "../opportunity-scoring";
import type { SalesOpportunity } from "../../types";

describe("opportunity-scoring", () => {
  it("flags blockers for high value without review", () => {
    const result = scoreOpportunity({
      id: "o1",
      organizationId: "org",
      accountId: "a1",
      name: "Big",
      stage: "Qualification",
      valueEstimate: 1_000_000,
      ownerId: "u1",
      createdById: "u1",
      risks: ["unreviewed_high_value"],
    });
    expect(result.blockers.length).toBeGreaterThan(0);
    expect(result.riskIndicators).toContain("high_value_unreviewed");
  });
});
