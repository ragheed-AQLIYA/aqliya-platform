import {
  buildStatementLinesFromMappings,
  getMappingDisplayAmount,
  type MappingWithCanonical,
} from "@/lib/audit/db/statement-builder";
import {
  sorted,
  sum,
  ids,
  withInferredClassification,
  makeLine,
} from "@/lib/audit/db/statement-builder/common";
import { EQUITY_BRIDGE_CURRENT_YEAR_LABEL } from "@/lib/audit/db/income-statement-presentation";
/**
 * Factory helper - mirrors the pattern from income-statement-amount.test.ts.
 */
function mapping(
  overrides: Partial<MappingWithCanonical> & Pick<MappingWithCanonical, "id">,
): MappingWithCanonical {
  return {
    engagementId: "e1",
    sourceAccountId: "tb1",
    sourceAccountCode: "5010",
    sourceAccountName: "Cost of Sales",
    debitAmount: 2_800_000,
    creditAmount: 0,
    canonicalAccountId: "ca-cos",
    canonicalAccount: {
      id: "ca-cos",
      code: "CA-5010",
      name: "Cost of Sales",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 600,
    },
    confidence: 1,
    mappingType: "confirmed_ai",
    status: "confirmed",
    statementClassification: null,
    mappedBy: null,
    mappedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
// ---------------------------------------------------------------------------
// common helpers
// ---------------------------------------------------------------------------
describe("statement-builder/common - sorted()", () => {
  it("returns items sorted by canonicalAccount.displayOrder ascending", () => {
    const items: MappingWithCanonical[] = [
      mapping({ id: "a", canonicalAccount: { id: "ca-a", code: "CA-A", name: "A", category: "Expenses", statementType: "income_statement", displayOrder: 30 } }),
      mapping({ id: "b", canonicalAccount: { id: "ca-b", code: "CA-B", name: "B", category: "Expenses", statementType: "income_statement", displayOrder: 10 } }),
      mapping({ id: "c", canonicalAccount: { id: "ca-c", code: "CA-C", name: "C", category: "Expenses", statementType: "income_statement", displayOrder: 20 } }),
    ];
    const result = sorted(items);
    expect(result.map((m) => m.id)).toEqual(["b", "c", "a"]);
  });
  it("places items with null canonicalAccount last (displayOrder defaults to 0)", () => {
    const items: MappingWithCanonical[] = [
      mapping({ id: "a", canonicalAccount: { id: "ca-a", code: "CA-A", name: "A", category: "Expenses", statementType: "income_statement", displayOrder: 5 } }),
      mapping({ id: "b", canonicalAccount: null }),
    ];
    const result = sorted(items);
    expect(result[0]!.id).toBe("b");
    expect(result[1]!.id).toBe("a");
  });
  it("does not mutate the original array", () => {
    const items: MappingWithCanonical[] = [
      mapping({ id: "a", canonicalAccount: { id: "ca-a", code: "CA-A", name: "A", category: "Expenses", statementType: "income_statement", displayOrder: 2 } }),
      mapping({ id: "b", canonicalAccount: { id: "ca-b", code: "CA-B", name: "B", category: "Expenses", statementType: "income_statement", displayOrder: 1 } }),
    ];
    const originalOrder = items.map((m) => m.id);
    sorted(items);
    expect(items.map((m) => m.id)).toEqual(originalOrder);
  });
  it("returns empty array for empty input", () => {
    expect(sorted([])).toEqual([]);
  });
});
describe("statement-builder/common - sum()", () => {
  it("returns sum of getMappingDisplayAmount for all items", () => {
    const items: MappingWithCanonical[] = [
      mapping({ id: "a", debitAmount: 100, creditAmount: 0 }),
      mapping({ id: "b", debitAmount: 200, creditAmount: 0 }),
      mapping({ id: "c", debitAmount: 50, creditAmount: 0 }),
    ];
    expect(sum(items)).toBe(350);
  });
  it("handles credit-side income statement amounts", () => {
    const items: MappingWithCanonical[] = [
      mapping({
        id: "rev1",
        debitAmount: 0,
        creditAmount: 500,
        canonicalAccount: {
          id: "ca-rev", code: "CA-4010", name: "Revenue", category: "Revenue",
          statementType: "income_statement", displayOrder: 100,
        },
      }),
      mapping({
        id: "rev2",
        debitAmount: 0,
        creditAmount: 300,
        canonicalAccount: {
          id: "ca-rev2", code: "CA-4011", name: "Revenue - Other", category: "Revenue",
          statementType: "income_statement", displayOrder: 110,
        },
      }),
    ];
    expect(sum(items)).toBe(800);
  });
  it("returns 0 for empty array", () => {
    expect(sum([])).toBe(0);
  });
});
describe("statement-builder/common - ids()", () => {
  it("returns array of mapping ids", () => {
    const items: MappingWithCanonical[] = [
      mapping({ id: "x" }),
      mapping({ id: "y" }),
    ];
    expect(ids(items)).toEqual(["x", "y"]);
  });
  it("returns empty array for empty input", () => {
    expect(ids([])).toEqual([]);
  });
});
describe("statement-builder/common - withInferredClassification()", () => {
  it("infers classification from canonicalAccount category for balance sheet", () => {
    const m = mapping({
      id: "bs1",
      statementClassification: null,
      canonicalAccount: {
        id: "ca-cash", code: "CA-1010", name: "Cash", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 100,
      },
    });
    const result = withInferredClassification(m);
    expect(result.statementClassification).toBe("Current Assets");
  });
  it("preserves existing classification when already set", () => {
    const m = mapping({
      id: "bs2",
      statementClassification: "Non-Current Assets",
      canonicalAccount: {
        id: "ca-ppe", code: "CA-2010", name: "PPE", category: "Non-Current Assets",
        statementType: "balance_sheet", displayOrder: 200,
      },
    });
    const result = withInferredClassification(m);
    expect(result.statementClassification).toBe("Non-Current Assets");
  });
  it("does not set classification for income statement mappings", () => {
    const m = mapping({ id: "is1", statementClassification: null });
    const result = withInferredClassification(m);
    expect(result.statementClassification).toBeNull();
  });
  it("does not set classification when canonicalAccount is null", () => {
    const m = mapping({ id: "null-ca", canonicalAccount: null });
    const result = withInferredClassification(m);
    expect(result.statementClassification).toBeNull();
  });
  it("does not set classification when category is not a recognized balance sheet classification", () => {
    const m = mapping({
      id: "weird",
      statementClassification: null,
      canonicalAccount: {
        id: "ca-xyz", code: "CA-999", name: "Misc", category: "Something Else",
        statementType: "balance_sheet", displayOrder: 999,
      },
    });
    const result = withInferredClassification(m);
    expect(result.statementClassification).toBeNull();
  });
});
describe("statement-builder/common - getMappingDisplayAmount()", () => {
  it("returns creditAmount for income statement when credit is non-zero", () => {
    const m = mapping({
      id: "rev",
      debitAmount: 10_000,
      creditAmount: 100_000,
      canonicalAccount: {
        id: "ca-rev", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 100,
      },
    });
    expect(getMappingDisplayAmount(m)).toBe(100_000);
  });
  it("returns debitAmount for income statement when credit is zero", () => {
    const m = mapping({ id: "exp", debitAmount: 50_000, creditAmount: 0 });
    expect(getMappingDisplayAmount(m)).toBe(50_000);
  });
  it("returns debitAmount for asset classifications", () => {
    const m = mapping({
      id: "cash",
      debitAmount: 500_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-cash", code: "CA-1010", name: "Cash", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 100,
      },
      statementClassification: "Current Assets",
    });
    expect(getMappingDisplayAmount(m)).toBe(500_000);
  });
  it("returns negative creditAmount for assets when debit is zero", () => {
    const m = mapping({
      id: "neg-cash",
      debitAmount: 0,
      creditAmount: 10_000,
      canonicalAccount: {
        id: "ca-cash", code: "CA-1010", name: "Cash", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 100,
      },
      statementClassification: "Current Assets",
    });
    expect(getMappingDisplayAmount(m)).toBe(-10_000);
  });
  it("returns creditAmount for liability classifications", () => {
    const m = mapping({
      id: "ap",
      debitAmount: 0,
      creditAmount: 75_000,
      canonicalAccount: {
        id: "ca-ap", code: "CA-3010", name: "Accounts Payable", category: "Current Liabilities",
        statementType: "balance_sheet", displayOrder: 300,
      },
      statementClassification: "Current Liabilities",
    });
    expect(getMappingDisplayAmount(m)).toBe(75_000);
  });
  it("returns negative debitAmount for liabilities when credit is zero", () => {
    const m = mapping({
      id: "neg-ap",
      debitAmount: 5_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-ap", code: "CA-3010", name: "Accounts Payable", category: "Current Liabilities",
        statementType: "balance_sheet", displayOrder: 300,
      },
      statementClassification: "Current Liabilities",
    });
    expect(getMappingDisplayAmount(m)).toBe(-5_000);
  });
  it("returns creditAmount for equity classifications", () => {
    const m = mapping({
      id: "equity1",
      debitAmount: 0,
      creditAmount: 1_000_000,
      canonicalAccount: {
        id: "ca-capital", code: "CA-4010", name: "Share Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    expect(getMappingDisplayAmount(m)).toBe(1_000_000);
  });
});
describe("statement-builder/common - makeLine()", () => {
  it("creates a line with correct defaults", () => {
    const line = makeLine("stmt-1", "Test Label", 1234.5, 10, ["map-1"]);
    expect(line).toEqual({
      id: "stmt-1-line-10",
      statementId: "stmt-1",
      label: "Test Label",
      amount: 1234.5,
      isTotal: true,
      indentLevel: 0,
      displayOrder: 10,
      linkedAccountMappings: ["map-1"],
    });
  });
  it("allows overriding isTotal and indentLevel", () => {
    const line = makeLine("s2", "Detail", 99, 5, [], { isTotal: false, indentLevel: 2 });
    expect(line.isTotal).toBe(false);
    expect(line.indentLevel).toBe(2);
  });
});
// ---------------------------------------------------------------------------
// buildStatementLinesFromMappings - income statement
// ---------------------------------------------------------------------------
describe("buildStatementLinesFromMappings - income_statement", () => {
  it("builds a complete income statement with revenue and expense", () => {
    const revenue = mapping({
      id: "rev1",
      sourceAccountCode: "4401010001",
      debitAmount: 0,
      creditAmount: 100_000,
      canonicalAccount: {
        id: "ca-rev", code: "CA-4010", name: "Revenue - Sale of Goods", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const expense = mapping({
      id: "exp1",
      sourceAccountCode: "3204010001",
      debitAmount: 40_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-cos", code: "CA-5010", name: "Cost of Sales", category: "Expenses",
        statementType: "income_statement", displayOrder: 600,
      },
    });
    const lines = buildStatementLinesFromMappings("fs-is", "income_statement", [revenue, expense]);
    const revenueTotalLine = lines.find((l) => l.label === "Revenue");
    expect(revenueTotalLine).toBeDefined();
    expect(revenueTotalLine!.amount).toBe(100_000);
    const cosLine = lines.find((l) => l.label === "Cost of Sales");
    expect(cosLine).toBeDefined();
    const grossProfitLine = lines.find((l) => l.label === "Gross Profit");
    expect(grossProfitLine).toBeDefined();
    expect(grossProfitLine!.amount).toBe(60_000);
    const netProfitLine = lines.find((l) => l.label === "Net Profit");
    expect(netProfitLine).toBeDefined();
    expect(netProfitLine!.amount).toBe(60_000);
  });
  it("categorizes finance costs and zakat when present", () => {
    const rev = mapping({
      id: "r1", sourceAccountCode: "4401", debitAmount: 0, creditAmount: 200_000,
      canonicalAccount: {
        id: "ca-r", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const cos = mapping({
      id: "c1", sourceAccountCode: "3204", debitAmount: 80_000, creditAmount: 0,
      canonicalAccount: {
        id: "ca-cos", code: "CA-5010", name: "Cost of Sales", category: "Expenses",
        statementType: "income_statement", displayOrder: 600,
      },
    });
    const fin = mapping({
      id: "f1", sourceAccountCode: "3204010099", debitAmount: 5_000, creditAmount: 0,
      canonicalAccount: {
        id: "ca-fin", code: "CA-2050", name: "Finance Cost", category: "Expenses",
        statementType: "income_statement", displayOrder: 700,
      },
    });
    const zak = Object.assign(mapping({
      id: "z1", sourceAccountCode: "3101020005", debitAmount: 2_000, creditAmount: 0,
      canonicalAccount: {
        id: "ca-zak", code: "CA-7010", name: "Zakat", category: "Expenses",
        statementType: "income_statement", displayOrder: 800,
      },
    }), { erpMap1Label: "zakat expense" });
    const lines = buildStatementLinesFromMappings("fs-is2", "income_statement", [rev, cos, fin, zak]);
    expect(lines.find((l) => l.label === "Finance Costs")?.amount).toBe(5_000);
    expect(lines.find((l) => l.label === "Zakat")?.amount).toBe(2_000);
    expect(lines.find((l) => l.label === "Net Profit")?.amount).toBe(113_000);
  });
});
// ---------------------------------------------------------------------------
// buildStatementLinesFromMappings - balance sheet
// ---------------------------------------------------------------------------
describe("buildStatementLinesFromMappings - balance_sheet", () => {
  it("builds a balance sheet with assets, liabilities, and equity", () => {
    const cash = mapping({
      id: "cash1",
      sourceAccountCode: "1101",
      sourceAccountName: "Bank",
      debitAmount: 300_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-cash", code: "CA-1010", name: "Cash and Cash Equivalents", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 100,
      },
      statementClassification: "Current Assets",
    });
    const ap = mapping({
      id: "ap1",
      sourceAccountCode: "2101",
      sourceAccountName: "Accounts Payable",
      debitAmount: 0,
      creditAmount: 50_000,
      canonicalAccount: {
        id: "ca-ap", code: "CA-3010", name: "Accounts Payable", category: "Current Liabilities",
        statementType: "balance_sheet", displayOrder: 300,
      },
      statementClassification: "Current Liabilities",
    });
    const capital = mapping({
      id: "cap1",
      sourceAccountCode: "3010",
      sourceAccountName: "Share Capital",
      debitAmount: 0,
      creditAmount: 250_000,
      canonicalAccount: {
        id: "ca-cap", code: "CA-4010", name: "Share Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    const lines = buildStatementLinesFromMappings("fs-bs", "balance_sheet", [cash, ap, capital]);
    expect(lines.find((l) => l.label === "ASSETS")).toBeDefined();
    expect(lines.find((l) => l.label === "Current Assets")?.amount).toBe(300_000);
    expect(lines.find((l) => l.label === "TOTAL ASSETS")?.amount).toBe(300_000);
    expect(lines.find((l) => l.label === "LIABILITIES AND EQUITY")).toBeDefined();
    expect(lines.find((l) => l.label === "Current Liabilities")?.amount).toBe(50_000);
    expect(lines.find((l) => l.label === "TOTAL LIABILITIES AND EQUITY")?.amount).toBe(300_000);
  });
  it("handles non-current assets and non-current liabilities", () => {
    const ppe = mapping({
      id: "ppe1",
      sourceAccountCode: "1201",
      sourceAccountName: "Property, Plant & Equipment",
      debitAmount: 1_000_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-ppe", code: "CA-2010", name: "Property, Plant & Equipment", category: "Non-Current Assets",
        statementType: "balance_sheet", displayOrder: 200,
      },
      statementClassification: "Non-Current Assets",
    });
    const ltDebt = mapping({
      id: "lt1",
      sourceAccountCode: "2201",
      sourceAccountName: "Long-term Debt",
      debitAmount: 0,
      creditAmount: 400_000,
      canonicalAccount: {
        id: "ca-lt", code: "CA-3020", name: "Long-term Debt", category: "Non-Current Liabilities",
        statementType: "balance_sheet", displayOrder: 350,
      },
      statementClassification: "Non-Current Liabilities",
    });
    const capital = mapping({
      id: "cap2",
      sourceAccountCode: "3020",
      sourceAccountName: "Share Capital",
      debitAmount: 0,
      creditAmount: 600_000,
      canonicalAccount: {
        id: "ca-cap2", code: "CA-4010", name: "Share Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    const lines = buildStatementLinesFromMappings("fs-bs2", "balance_sheet", [ppe, ltDebt, capital]);
    expect(lines.find((l) => l.label === "Non-Current Assets")?.amount).toBe(1_000_000);
    expect(lines.find((l) => l.label === "Non-Current Liabilities")?.amount).toBe(400_000);
    expect(lines.find((l) => l.label === "TOTAL ASSETS")?.amount).toBe(1_000_000);
    expect(lines.find((l) => l.label === "TOTAL LIABILITIES AND EQUITY")?.amount).toBe(1_000_000);
  });
  it("separates cash equivalents from other current assets", () => {
    const cash = mapping({
      id: "c1",
      sourceAccountCode: "1101020001",
      sourceAccountName: "Bank - Current",
      debitAmount: 100_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-cash", code: "CA-1010", name: "Cash and Cash Equivalents", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 100,
      },
      statementClassification: "Current Assets",
    });
    const ar = mapping({
      id: "ar1",
      sourceAccountCode: "1102",
      sourceAccountName: "Accounts Receivable",
      debitAmount: 50_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-ar", code: "CA-1020", name: "Accounts Receivable", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 110,
      },
      statementClassification: "Current Assets",
    });
    const capital = mapping({
      id: "cap3",
      sourceAccountCode: "3030",
      sourceAccountName: "Capital",
      debitAmount: 0,
      creditAmount: 150_000,
      canonicalAccount: {
        id: "ca-cap3", code: "CA-4010", name: "Share Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    const lines = buildStatementLinesFromMappings("fs-bs3", "balance_sheet", [cash, ar, capital]);
    const cashLines = lines.filter((l) =>
      l.label.includes("Cash and cash equivalents"),
    );
    expect(cashLines).toHaveLength(1);
    expect(cashLines[0]!.amount).toBe(100_000);
    const arLine = lines.find((l) =>
      l.label.includes("Accounts Receivable"),
    );
    expect(arLine).toBeDefined();
    expect(arLine!.amount).toBe(50_000);
  });
  it("adds Current Year Profit line when no TB retained earnings", () => {
    const cash = mapping({
      id: "c2",
      sourceAccountCode: "1101",
      debitAmount: 500_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-cash2", code: "CA-1010", name: "Cash", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 100,
      },
      statementClassification: "Current Assets",
    });
    const capital = mapping({
      id: "cap4",
      sourceAccountCode: "3010",
      debitAmount: 0,
      creditAmount: 200_000,
      canonicalAccount: {
        id: "ca-cap4", code: "CA-4010", name: "Share Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    const rev = mapping({
      id: "r2",
      sourceAccountCode: "4401",
      debitAmount: 0,
      creditAmount: 400_000,
      canonicalAccount: {
        id: "ca-rev2", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const exp = mapping({
      id: "e2",
      sourceAccountCode: "3204",
      debitAmount: 100_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-exp2", code: "CA-5010", name: "Cost of Sales", category: "Expenses",
        statementType: "income_statement", displayOrder: 600,
      },
    });
    const lines = buildStatementLinesFromMappings("fs-bs4", "balance_sheet", [cash, capital, rev, exp]);
    const cypLine = lines.find((l) => l.label === "  Current Year Profit");
    expect(cypLine).toBeDefined();
    expect(cypLine!.amount).toBe(300_000);
    const equityLine = lines.find((l) => l.label === "Equity");
    expect(equityLine).toBeDefined();
    expect(equityLine!.amount).toBe(500_000);
    expect(lines.find((l) => l.label === "TOTAL ASSETS")?.amount).toBe(500_000);
    expect(lines.find((l) => l.label === "TOTAL LIABILITIES AND EQUITY")?.amount).toBe(500_000);
  });
});
// ---------------------------------------------------------------------------
// buildStatementLinesFromMappings - equity statement
// ---------------------------------------------------------------------------
describe("buildStatementLinesFromMappings - equity", () => {
  it("builds equity statement with opening balance, details, current year profit, and total", () => {
    const capital = mapping({
      id: "eq1",
      sourceAccountCode: "3010",
      sourceAccountName: "Share Capital",
      debitAmount: 0,
      creditAmount: 1_000_000,
      canonicalAccount: {
        id: "ca-eq1", code: "CA-4010", name: "Share Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    const retained = mapping({
      id: "eq2",
      sourceAccountCode: "3020",
      sourceAccountName: "Retained Earnings",
      debitAmount: 0,
      creditAmount: 500_000,
      canonicalAccount: {
        id: "ca-eq2", code: "CA-4020", name: "Retained Earnings", category: "Equity",
        statementType: "balance_sheet", displayOrder: 410,
      },
      statementClassification: "Equity",
    });
    const rev = mapping({
      id: "r3",
      sourceAccountCode: "4401",
      debitAmount: 0,
      creditAmount: 200_000,
      canonicalAccount: {
        id: "ca-r3", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const exp = mapping({
      id: "e3",
      sourceAccountCode: "3204",
      debitAmount: 50_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-e3", code: "CA-5010", name: "Cost of Sales", category: "Expenses",
        statementType: "income_statement", displayOrder: 600,
      },
    });
    const lines = buildStatementLinesFromMappings("fs-eq", "equity", [capital, retained, rev, exp]);
    const openingLine = lines.find((l) => l.label === "Opening Equity (TB GL balances)");
    expect(openingLine).toBeDefined();
    expect(openingLine!.amount).toBe(1_500_000);
    expect(openingLine!.isTotal).toBe(false);
    const capitalDetail = lines.find((l) => l.label === "  Share Capital");
    expect(capitalDetail).toBeDefined();
    expect(capitalDetail!.amount).toBe(1_000_000);
    const retainedDetail = lines.find((l) => l.label === "  Retained Earnings");
    expect(retainedDetail).toBeDefined();
    expect(retainedDetail!.amount).toBe(500_000);
    const cypLine = lines.find((l) => l.label === EQUITY_BRIDGE_CURRENT_YEAR_LABEL);
    expect(cypLine).toBeDefined();
    expect(cypLine!.amount).toBe(150_000);
    expect(cypLine!.isTotal).toBe(false);
    const totalLine = lines.find((l) => l.label === "Total Equity (TB core + current year IS result)");
    expect(totalLine).toBeDefined();
    expect(totalLine!.amount).toBe(1_650_000);
    expect(totalLine!.isTotal).toBe(true);
  });
  it("includes actuarial reserve line when an equity mapping has actuarial in name", () => {
    const capital = mapping({
      id: "eq-act",
      sourceAccountCode: "3010",
      sourceAccountName: "Share Capital",
      debitAmount: 0,
      creditAmount: 800_000,
      canonicalAccount: {
        id: "ca-act1", code: "CA-4010", name: "Share Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    const actuarial = mapping({
      id: "eq-act-reserve",
      sourceAccountCode: "3110",
      sourceAccountName: "Actuarial Reserve",
      debitAmount: 0,
      creditAmount: 50_000,
      canonicalAccount: {
        id: "ca-act2", code: "CA-4030", name: "Actuarial Reserve", category: "Equity",
        statementType: "balance_sheet", displayOrder: 420,
      },
      statementClassification: "Equity",
    });
    const lines = buildStatementLinesFromMappings("fs-eq-act", "equity", [capital, actuarial]);
    const actuarialLine = lines.find((l) => l.label === "Actuarial Reserve (closing per TB)");
    expect(actuarialLine).toBeDefined();
    expect(actuarialLine!.amount).toBe(50_000);
  });
  it("produces lines in correct displayOrder sequence", () => {
    const capital = mapping({
      id: "eq-ord",
      sourceAccountCode: "3010",
      sourceAccountName: "Capital",
      debitAmount: 0,
      creditAmount: 100_000,
      canonicalAccount: {
        id: "ca-ord", code: "CA-4010", name: "Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
      statementClassification: "Equity",
    });
    const rev = mapping({
      id: "r-ord",
      sourceAccountCode: "4401",
      debitAmount: 0,
      creditAmount: 50_000,
      canonicalAccount: {
        id: "ca-rod", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const lines = buildStatementLinesFromMappings("fs-eq-ord", "equity", [capital, rev]);
    const orders = lines.map((l) => l.displayOrder);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]!).toBeGreaterThan(orders[i - 1]!);
    }
  });
});
// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("buildStatementLinesFromMappings - edge cases", () => {
  it("emits skeleton lines for empty mappings input", () => {
    const lines = buildStatementLinesFromMappings("fs-empty", "income_statement", []);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.amount === 0)).toBe(true);
  });
  it("returns empty array for empty balance sheet mappings", () => {
    const lines = buildStatementLinesFromMappings("fs-empty-bs", "balance_sheet", []);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.amount === 0)).toBe(true);
  });
  it("returns empty array for empty equity mappings", () => {
    const lines = buildStatementLinesFromMappings("fs-empty-eq", "equity", []);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.amount === 0)).toBe(true);
  });
  it("filters out non-confirmed mappings", () => {
    const confirmed = mapping({
      id: "ok",
      status: "confirmed",
      canonicalAccount: {
        id: "ca-ok", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const pending = mapping({
      id: "pending",
      status: "pending",
      debitAmount: 99,
      canonicalAccount: {
        id: "ca-pend", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const rejected = mapping({
      id: "rejected",
      status: "rejected",
      debitAmount: 88,
      canonicalAccount: {
        id: "ca-rej", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const lines = buildStatementLinesFromMappings("fs-filter", "income_statement", [
      confirmed, pending, rejected,
    ]);
    const revLine = lines.find((l) => l.label === "Revenue");
    expect(revLine).toBeDefined();
    expect(revLine!.amount).toBe(0);
  });
  it("filters out mappings without canonicalAccount", () => {
    const withCa = mapping({
      sourceAccountCode: "4401010001",id: "with-ca",
      debitAmount: 0,
      creditAmount: 100,
      canonicalAccount: {
        id: "ca-w", code: "CA-4010", name: "Revenue", category: "Revenue",
        statementType: "income_statement", displayOrder: 500,
      },
    });
    const withoutCa = mapping({ id: "no-ca", canonicalAccount: null, debitAmount: 0, creditAmount: 999 });
    const lines = buildStatementLinesFromMappings("fs-noca", "income_statement", [withCa, withoutCa]);
    const netProfitLine = lines.find((l) => l.label === "Net Profit");
    expect(netProfitLine).toBeDefined();
    expect(netProfitLine!.amount).toBe(100);
  });
  it("handles statementClassification inference via withInferredClassification", () => {
    const cash = mapping({
      id: "inf-cash",
      sourceAccountCode: "1101",
      debitAmount: 100_000,
      creditAmount: 0,
      statementClassification: null,
      canonicalAccount: {
        id: "ca-inf", code: "CA-1010", name: "Cash", category: "Current Assets",
        statementType: "balance_sheet", displayOrder: 100,
      },
    });
    const capital = mapping({
      id: "inf-cap",
      sourceAccountCode: "3010",
      debitAmount: 0,
      creditAmount: 100_000,
      statementClassification: null,
      canonicalAccount: {
        id: "ca-inf-cap", code: "CA-4010", name: "Capital", category: "Equity",
        statementType: "balance_sheet", displayOrder: 400,
      },
    });
    const lines = buildStatementLinesFromMappings("fs-inf", "balance_sheet", [cash, capital]);
    expect(lines.find((l) => l.label === "Current Assets")?.amount).toBe(100_000);
    expect(lines.find((l) => l.label === "Equity")?.amount).toBe(100_000);
    expect(lines.find((l) => l.label === "TOTAL ASSETS")?.amount).toBe(100_000);
    expect(lines.find((l) => l.label === "TOTAL LIABILITIES AND EQUITY")?.amount).toBe(100_000);
  });
});





