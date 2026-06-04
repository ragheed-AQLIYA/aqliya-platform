import { buildDecisionPortfolioSnapshot } from "../decision-portfolio";

describe("decision-portfolio (D3-05)", () => {
  it("counts active and high priority", () => {
    const snap = buildDecisionPortfolioSnapshot([
      {
        id: "1",
        title: "A",
        status: "IN_PROGRESS",
        type: "STRATEGIC",
        priority: "HIGH",
      },
      { id: "2", title: "B", status: "APPROVED", type: "TACTICAL", priority: "LOW" },
    ]);
    expect(snap.active).toBe(1);
    expect(snap.highPriorityOpen).toBe(1);
    expect(snap.approved).toBe(1);
  });
});
