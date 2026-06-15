import { buildCashFlowLinesFromContext, deriveCashFlowContext } from "@/lib/audit/fs-engine/cash-flow-builder";
import { canTransitionFsStatus, isFsV2Enabled } from "@/lib/audit/fs-engine";
import {
  buildStatementLinesFromMappings,
  type MappingWithCanonical,
} from "@/lib/audit/db/statement-builder";

function baseMapping(
  overrides: Partial<MappingWithCanonical> & Pick<MappingWithCanonical, "id">,
): MappingWithCanonical {
  return {
    engagementId: "e1",
    sourceAccountId: "tb1",
    sourceAccountCode: "3204010090",
    sourceAccountName: "Cost of Sales",
    debitAmount: 2_800_000,
    creditAmount: 0,
    canonicalAccountId: "ca-cos",
    canonicalAccount: {
      id: "ca-cos",
      code: "IS-COS",
      name: "Cost of Sales",
      category: "Expenses",
      statementType: "income_statement",
      displayOrder: 1,
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

describe("buildStatementLinesFromMappings", () => {
  it("emits per-mapping Cost of Sales detail line for RC-002 tie-out", () => {
    const mapping = baseMapping({ id: "map-cos" });
    const lines = buildStatementLinesFromMappings(
      "fs-is-1",
      "income_statement",
      [mapping],
    );

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
});

describe("buildCashFlowLinesFromContext", () => {
  it("builds indirect cash flow with cash at end from TB cash mappings", () => {
    const mappings: MappingWithCanonical[] = [
      {
        id: "m-cash",
        engagementId: "e1",
        sourceAccountId: "tb1",
        sourceAccountCode: "1000",
        sourceAccountName: "Cash and Bank",
        debitAmount: 500_000,
        creditAmount: 0,
        canonicalAccountId: "ca1",
        canonicalAccount: {
          id: "ca1",
          code: "CA-1010",
          name: "Cash and Cash Equivalents",
          category: "Current Assets",
          statementType: "balance_sheet",
          displayOrder: 1,
        },
        confidence: 1,
        mappingType: "human_mapped",
        status: "confirmed",
        statementClassification: "Current Assets",
        mappedBy: null,
        mappedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const ctx = deriveCashFlowContext({
      mappings,
      incomeStatementLines: [{ label: "Net Profit", amount: 120_000 }],
    });

    expect(ctx.tbCashTotal).toBe(500_000);
    expect(ctx.cashAtEnd).toBe(500_000);

    const lines = buildCashFlowLinesFromContext("cf-1", ctx);
    const endLine = lines.find((l) => l.label.includes("Cash at End"));
    expect(endLine?.amount).toBe(500_000);
  });
});

describe("canTransitionFsStatus", () => {
  it("allows draft to reviewed only", () => {
    expect(canTransitionFsStatus("draft", "reviewed")).toBe(true);
    expect(canTransitionFsStatus("draft", "approved")).toBe(false);
    expect(canTransitionFsStatus("reviewed", "approved")).toBe(true);
  });
});

describe("isFsV2Enabled", () => {
  const prev = process.env.FF_AUDIT_FS_V2;

  afterEach(() => {
    if (prev === undefined) delete process.env.FF_AUDIT_FS_V2;
    else process.env.FF_AUDIT_FS_V2 = prev;
  });

  it("defaults off", () => {
    delete process.env.FF_AUDIT_FS_V2;
    expect(isFsV2Enabled()).toBe(false);
  });
});
