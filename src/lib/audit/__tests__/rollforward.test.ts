import { buildRollforwardReport } from "../rollforward";

describe("rollforward (A1-04)", () => {
  it("flags material variances", () => {
    const report = buildRollforwardReport({
      current: [{ accountCode: "1000", accountName: "Cash", balance: 150_000 }],
      prior: [{ accountCode: "1000", accountName: "Cash", balance: 100_000 }],
      materialThresholdPct: 10,
    });
    expect(report.materialCount).toBeGreaterThan(0);
    expect(report.rows[0].variance).toBe(50_000);
  });

  it("includes new accounts in current period", () => {
    const report = buildRollforwardReport({
      current: [{ accountCode: "2000", accountName: "AR", balance: 10_000 }],
      prior: [],
    });
    expect(report.rows).toHaveLength(1);
    expect(report.rows[0].priorBalance).toBe(0);
  });
});
