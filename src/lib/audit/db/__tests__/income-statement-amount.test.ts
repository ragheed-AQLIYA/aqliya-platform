import {
  buildStatementLinesFromMappings,
  getMappingDisplayAmount,
  type MappingWithCanonical,
} from "@/lib/audit/db/statement-builder";
import {
  computeIncomeStatementNetProfit,
  getIncomeStatementPeriodAmount,
  getSignedTrialBalanceNet,
  isIncomeStatementSourceAccount,
} from "@/lib/audit/db/income-statement-amount";

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

describe("income-statement-amount", () => {
  it("uses signed net for revenue (credit minus debit)", () => {
    const rev = mapping({
      id: "rev",
      sourceAccountCode: "4401010001",
      debitAmount: 14_081_620,
      creditAmount: 370_599_332,
      canonicalAccount: {
        id: "ca-rev",
        code: "CA-4010",
        name: "Revenue - Sale of Goods",
        category: "Revenue",
        statementType: "income_statement",
        displayOrder: 500,
      },
    });

    expect(getSignedTrialBalanceNet(rev)).toBe(356_517_712);
    expect(getIncomeStatementPeriodAmount(rev, "revenue")).toBe(356_517_712);
    expect(getMappingDisplayAmount(rev)).toBe(370_599_332);
  });

  it("excludes balance-sheet source accounts from income statement buckets", () => {
    const contractAsset = mapping({
      id: "ca-bs",
      sourceAccountCode: "1107040007",
      sourceAccountName: "Contract asset receivable",
      debitAmount: 60_395_590,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-rev-wrong",
        code: "CA-4010",
        name: "Revenue - Sale of Goods",
        category: "Revenue",
        statementType: "income_statement",
        displayOrder: 500,
      },
    });

    expect(isIncomeStatementSourceAccount("1107040007")).toBe(false);
    expect(getIncomeStatementPeriodAmount(contractAsset, "revenue")).toBe(0);
    expect(getMappingDisplayAmount(contractAsset)).toBe(60_395_590);
  });

  it("classifies 32xx expense GL as cost of revenue", () => {
    const wages = mapping({
      id: "wages",
      sourceAccountCode: "3204010001",
      sourceAccountName: "Wages",
      debitAmount: 179_655_890,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-5020",
        code: "CA-5020",
        name: "Employee Benefits",
        category: "Expenses",
        statementType: "income_statement",
        displayOrder: 610,
      },
    });

    expect(getIncomeStatementPeriodAmount(wages, "cost_of_revenue")).toBe(
      179_655_890,
    );
  });

  it("computes pilot-like net profit from signed IS-source nets", () => {
    const rows: MappingWithCanonical[] = [
      mapping({
        id: "r1",
        sourceAccountCode: "4401010001",
        debitAmount: 0,
        creditAmount: 356_517_711,
        canonicalAccount: {
          id: "ca-rev",
          code: "CA-4010",
          name: "Revenue - Sale of Goods",
          category: "Revenue",
          statementType: "income_statement",
          displayOrder: 500,
        },
      }),
      mapping({
        id: "c1",
        sourceAccountCode: "3204010001",
        debitAmount: 179_655_890,
        creditAmount: 0,
        canonicalAccount: {
          id: "ca-5020",
          code: "CA-5020",
          name: "Employee Benefits",
          category: "Expenses",
          statementType: "income_statement",
          displayOrder: 610,
        },
      }),
    ];

    expect(computeIncomeStatementNetProfit(rows)).toBe(176_861_821);
  });
});

describe("buildStatementLinesFromMappings — income statement engine", () => {
  it("emits per-mapping Cost of Sales detail line for RC-002 tie-out", () => {
    const cos = mapping({
      id: "map-cos",
      sourceAccountCode: "3204010090",
    });
    const lines = buildStatementLinesFromMappings("fs-is-1", "income_statement", [
      cos,
    ]);

    const cosDetail = lines.find(
      (l) =>
        !l.isTotal &&
        l.linkedAccountMappings.length === 1 &&
        l.linkedAccountMappings[0] === "map-cos",
    );

    expect(cosDetail).toBeDefined();
    expect(cosDetail?.amount).toBe(2_800_000);
    expect(cosDetail?.label).toContain("Cost of Sales");
  });

  it("reports net profit from signed nets instead of gross closing sides", () => {
    const revenue = mapping({
      id: "rev",
      sourceAccountCode: "4401010001",
      debitAmount: 0,
      creditAmount: 100,
      canonicalAccount: {
        id: "ca-rev",
        code: "CA-4010",
        name: "Revenue - Sale of Goods",
        category: "Revenue",
        statementType: "income_statement",
        displayOrder: 500,
      },
    });
    const bsOnRevenue = mapping({
      id: "bs-rev",
      sourceAccountCode: "1107040007",
      debitAmount: 900,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-rev2",
        code: "CA-4010",
        name: "Revenue - Sale of Goods",
        category: "Revenue",
        statementType: "income_statement",
        displayOrder: 500,
      },
    });
    const expense = mapping({
      id: "exp",
      sourceAccountCode: "3204010001",
      debitAmount: 40,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-cos",
        code: "CA-5010",
        name: "Cost of Sales",
        category: "Expenses",
        statementType: "income_statement",
        displayOrder: 600,
      },
    });

    const lines = buildStatementLinesFromMappings("fs-is-2", "income_statement", [
      revenue,
      bsOnRevenue,
      expense,
    ]);

    const revenueTotal = lines.find((l) => l.label === "Revenue")?.amount;
    const netProfit = lines.find((l) => l.label === "Net Profit")?.amount;

    expect(revenueTotal).toBe(100);
    expect(netProfit).toBe(60);
  });

  it("keeps balance sheet amounts on gross closing logic", () => {
    const cash = mapping({
      id: "cash",
      sourceAccountCode: "1101020017",
      sourceAccountName: "Bank",
      debitAmount: 500_000,
      creditAmount: 0,
      canonicalAccount: {
        id: "ca-cash",
        code: "CA-1010",
        name: "Cash and Cash Equivalents",
        category: "Current Assets",
        statementType: "balance_sheet",
        displayOrder: 100,
      },
      statementClassification: "Current Assets",
    });

    const lines = buildStatementLinesFromMappings("fs-bs-1", "balance_sheet", [
      cash,
    ]);
    const caLine = lines.find((l) =>
      l.label.toLowerCase().includes("cash and cash equivalents"),
    );
    expect(caLine?.amount).toBe(500_000);
  });

  it("rolls up multiple cash GL accounts into one FS line", () => {
    const mkCash = (id: string, code: string, amount: number) =>
      mapping({
        id,
        sourceAccountCode: code,
        sourceAccountName: `Bank ${code}`,
        debitAmount: amount,
        creditAmount: 0,
        canonicalAccount: {
          id: "ca-1",
          code: "CA-1010",
          name: "Cash and Cash Equivalents",
          category: "Current Assets",
          statementType: "balance_sheet",
          displayOrder: 100,
        },
        statementClassification: "Current Assets",
      });

    const lines = buildStatementLinesFromMappings("fs-bs-rollup", "balance_sheet", [
      mkCash("c1", "1101020001", 1_000_000),
      mkCash("c2", "1101020002", 500_000),
    ]);
    const cashLines = lines.filter((l) =>
      l.label.toLowerCase().includes("cash and cash equivalents"),
    );
    expect(cashLines).toHaveLength(1);
    expect(cashLines[0]?.amount).toBe(1_500_000);
    expect(cashLines[0]?.linkedAccountMappings).toEqual(["c1", "c2"]);
  });
});
