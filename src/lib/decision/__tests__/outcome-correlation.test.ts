import { buildOutcomeCorrelation } from "../outcome-correlation";

describe("outcome-correlation (D3-06)", () => {
  it("groups success rate by priority", () => {
    const snap = buildOutcomeCorrelation([
      {
        id: "1",
        title: "A",
        status: "APPROVED",
        priority: "HIGH",
        outcome: {
          outcomeStatus: "SUCCESS",
          actualOutcome: "ok",
          variance: 0,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      {
        id: "2",
        title: "B",
        status: "APPROVED",
        priority: "HIGH",
        outcome: {
          outcomeStatus: "FAILURE",
          actualOutcome: "bad",
          variance: -1,
          reviewedAt: null,
          updatedAt: new Date(),
        },
      },
    ]);
    const high = snap.byPriority.find((r) => r.key === "HIGH");
    expect(high?.successRatePct).toBe(50);
  });
});
