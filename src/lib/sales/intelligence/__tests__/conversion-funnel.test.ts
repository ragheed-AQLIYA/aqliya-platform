import { describe, expect, it } from "@jest/globals";
import { buildConversionFunnel } from "../conversion-funnel";
import type { SalesOpportunity } from "../../types";

describe("conversion-funnel (S7-06)", () => {
  const mk = (stage: SalesOpportunity["stage"], value = 50_000): SalesOpportunity =>
    ({
      id: `o-${stage}`,
      organizationId: "org",
      accountId: "a1",
      name: "Opp",
      stage,
      valueEstimate: value,
      ownerId: "u1",
      createdById: "u1",
    }) as SalesOpportunity;

  it("computes win rate from closed deals", () => {
    const snap = buildConversionFunnel([
      mk("ClosedWon"),
      mk("ClosedWon"),
      mk("ClosedLost"),
    ]);
    expect(snap.winRatePct).toBeCloseTo(66.7, 0);
    expect(snap.winCount).toBe(2);
  });

  it("returns stage rows in funnel order", () => {
    const snap = buildConversionFunnel([mk("Qualification"), mk("InReview")]);
    expect(snap.stages.find((s) => s.stage === "Qualification")?.count).toBe(1);
    expect(snap.transitions.length).toBeGreaterThan(0);
  });
});
