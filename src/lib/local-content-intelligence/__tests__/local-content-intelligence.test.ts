import {
  estimateLocalContentPercent,
  categorizeFromLcHint,
} from "@/lib/local-content-intelligence";
import type { LocalContentSignal } from "@/lib/local-content-intelligence";

describe("local-content-intelligence", () => {
  it("maps LC hint Salaries & Wages to payroll", () => {
    expect(categorizeFromLcHint("Salaries & Wages")).toBe("payroll");
  });

  it("maps LC hint Purchases to suppliers", () => {
    expect(categorizeFromLcHint("Purchases")).toBe("suppliers");
  });

  it("estimates local content percent from signals", () => {    const signals: LocalContentSignal[] = [
      {
        category: "payroll",
        accountCode: "5100",
        accountName: "رواتب",
        amount: 100000,
        localContentRelevant: true,
      },
    ];
    expect(estimateLocalContentPercent(signals, 0.65)).toBe(65);
  });
});
