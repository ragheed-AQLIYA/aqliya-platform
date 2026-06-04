import { buildCrossDecisionPatterns } from "../cross-decision-patterns";

describe("cross-decision-patterns (D3-04)", () => {
  it("detects recurring risk themes", () => {
    const snap = buildCrossDecisionPatterns([
      {
        id: "d1",
        type: "STRATEGIC",
        status: "APPROVED",
        risks: [{ level: "HIGH", description: "تأخير تنظيمي" }],
        outcomeStatus: "SUCCESS",
      },
      {
        id: "d2",
        type: "TACTICAL",
        status: "APPROVED",
        risks: [{ level: "HIGH", description: "تأخير تنظيمي" }],
        outcomeStatus: "FAILURE",
      },
    ]);
    expect(snap.recurringRiskThemes.length).toBe(1);
    expect(snap.recurringRiskThemes[0].count).toBe(2);
  });
});
