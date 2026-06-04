import { runSamplingEngine } from "../sampling/engine";

const population = [
  {
    id: "l1",
    accountCode: "1000",
    accountName: "Cash",
    debitAmount: 100,
    creditAmount: 0,
    balance: 100,
  },
  {
    id: "l2",
    accountCode: "2000",
    accountName: "Payables",
    debitAmount: 0,
    creditAmount: 50,
    balance: -50,
  },
  {
    id: "l3",
    accountCode: "3000",
    accountName: "Revenue",
    debitAmount: 0,
    creditAmount: 500,
    balance: -500,
  },
  {
    id: "l4",
    accountCode: "4000",
    accountName: "Expense",
    debitAmount: 200,
    creditAmount: 0,
    balance: 200,
  },
];

describe("A1-02 sampling engine", () => {
  it("produces reproducible random samples for the same seed", () => {
    const req = { method: "random" as const, sampleSize: 2, seed: "fixed-seed" };
    const a = runSamplingEngine("eng-1", population, req);
    const b = runSamplingEngine("eng-1", population, req);
    expect(a.selectedIds).toEqual(b.selectedIds);
    expect(a.seed).toBe("fixed-seed");
  });

  it("selects high-value lines by materiality threshold", () => {
    const result = runSamplingEngine("eng-1", population, {
      method: "high_value",
      sampleSize: 2,
      materialityThreshold: 150,
    });
    expect(result.selectedIds).toContain("l3");
    expect(result.selectedItems.length).toBeLessThanOrEqual(2);
  });

  it("ranks monetary unit sample by absolute balance", () => {
    const result = runSamplingEngine("eng-1", population, {
      method: "monetary_unit",
      sampleSize: 2,
    });
    expect(result.selectedIds[0]).toBe("l3");
  });
});
