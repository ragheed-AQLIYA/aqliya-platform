/**
 * Unit Test: Financial DB (AuditOS / financial-db)
 *
 * Tests trial balance CRUD, mappings CRUD, financial statements,
 * and rebuild triggers. All Prisma calls are mocked.
 */

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditTrialBalance: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    auditEngagement: {
      findUnique: jest.fn(),
    },
    auditAccountMapping: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    auditCanonicalAccount: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    auditFinancialStatement: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    auditReviewComment: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/tb-intelligence/firm-memory", () => ({
  getLatestClassificationSources: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/lib/tb-intelligence/classification-explanation", () => ({
  getMappingClassificationExplanations: jest.fn().mockResolvedValue({}),
}));

// Mock the rebuild module so mutation tests don't trigger deep FS engine chain
jest.mock("@/lib/audit/db/financial-db/rebuild", () => ({
  rebuildFinancialStatementsForEngagement: jest.fn().mockResolvedValue(undefined),
}));

import { prisma } from "@/lib/prisma";
import {
  getTrialBalance,
  getTrialBalanceLines,
  saveTrialBalance,
  getMappings,
  confirmMapping,
  confirmAllSuggestedMappings,
  getAccountMappingById,
  updateManualMapping,
  getUnmappedAccounts,
  createSuggestedMappingsForTrialBalance,
  getFinancialStatements,
  getEquityStatementLines,
} from "@/lib/audit/db/financial-db";

const mp = jest.mocked(prisma);

// ─── Shared test data ───────────────────────────────────────────────

const NOW = new Date("2026-07-21T00:00:00.000Z");
const ENGAGEMENT_ID = "eng-1";
const MAPPING_ID = "map-1";
const CANONICAL_ID = "ca-1";

function mockTrialBalanceRow(overrides?: Record<string, unknown>) {
  return {
    id: "tb-1",
    engagementId: ENGAGEMENT_ID,
    importTimestamp: NOW,
    sourceFile: "tb_2026.csv",
    fileHash: "abc123",
    trustState: "trusted",
    totalDebits: 1_000_000,
    totalCredits: 1_000_000,
    variance: 0,
    lines: [
      {
        id: "tbl-1",
        trialBalanceId: "tb-1",
        accountCode: "4000",
        accountName: "Revenue",
        debitAmount: 0,
        creditAmount: 1_000_000,
        balance: -1_000_000,
        accountType: "revenue",
        currency: "SAR",
      },
    ],
    createdAt: NOW,
    ...overrides,
  };
}

function mockMappingRow(overrides?: Record<string, unknown>) {
  return {
    id: MAPPING_ID,
    engagementId: ENGAGEMENT_ID,
    sourceAccountId: "src-eng-1-4000",
    sourceAccountCode: "4000",
    sourceAccountName: "Revenue",
    debitAmount: 0,
    creditAmount: 1_000_000,
    canonicalAccountId: CANONICAL_ID,
    canonicalAccount: { code: "REV-01", name: "Revenue" },
    confidence: 0.95,
    mappingType: "ai_suggested",
    status: "pending",
    statementClassification: "Revenue",
    mappedBy: null,
    mappedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

// ─── Trial Balance ──────────────────────────────────────────────────

describe("financial-db — Trial Balance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getTrialBalance returns parsed trial balance when found", async () => {
    mp.auditTrialBalance.findFirst.mockResolvedValue(mockTrialBalanceRow());
    const result = await getTrialBalance(ENGAGEMENT_ID);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("tb-1");
    expect(result!.lines).toHaveLength(1);
    expect(result!.lines[0]!.accountCode).toBe("4000");
  });

  it("getTrialBalance returns null when no trial balance exists", async () => {
    mp.auditTrialBalance.findFirst.mockResolvedValue(null);
    const result = await getTrialBalance(ENGAGEMENT_ID);
    expect(result).toBeNull();
  });

  it("getTrialBalanceLines returns lines array", async () => {
    mp.auditTrialBalance.findFirst.mockResolvedValue(mockTrialBalanceRow());
    const result = await getTrialBalanceLines(ENGAGEMENT_ID);
    expect(result).toHaveLength(1);
    expect(result[0]!.accountName).toBe("Revenue");
  });

  it("getTrialBalanceLines returns empty array when no TB", async () => {
    mp.auditTrialBalance.findFirst.mockResolvedValue(null);
    const result = await getTrialBalanceLines(ENGAGEMENT_ID);
    expect(result).toEqual([]);
  });

  it("saveTrialBalance creates a trusted TB when balanced", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue({
      client: { currencyCode: "SAR" },
    } as any);
    mp.auditTrialBalance.create.mockResolvedValue(mockTrialBalanceRow());

    const result = await saveTrialBalance(ENGAGEMENT_ID, "tb.csv", [
      { accountCode: "4000", accountName: "Revenue", debitAmount: 0, creditAmount: 1_000_000, balance: -1_000_000 },
      { accountCode: "1000", accountName: "Cash", debitAmount: 1_000_000, creditAmount: 0, balance: 1_000_000 },
    ]);

    expect(result.trustState).toBe("trusted");
    expect(mp.auditTrialBalance.create).toHaveBeenCalledTimes(1);
  });

  it("saveTrialBalance creates a conditional TB when unbalanced", async () => {
    mp.auditEngagement.findUnique.mockResolvedValue({
      client: { currencyCode: "SAR" },
    } as any);
    mp.auditTrialBalance.create.mockResolvedValue(mockTrialBalanceRow({ trustState: "conditional", totalDebits: 1000, totalCredits: 999, variance: 1 }));

    const result = await saveTrialBalance(ENGAGEMENT_ID, "tb.csv", [
      { accountCode: "1000", accountName: "Cash", debitAmount: 1000, creditAmount: 0, balance: 1000 },
      { accountCode: "4000", accountName: "Revenue", debitAmount: 0, creditAmount: 999, balance: -999 },
    ]);

    expect(mp.auditTrialBalance.create).toHaveBeenCalled();
  });
});

// ─── Mappings ───────────────────────────────────────────────────────

describe("financial-db — Mappings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getMappings returns enriched mapping list", async () => {
    mp.auditAccountMapping.findMany.mockResolvedValue([mockMappingRow()]);
    const result = await getMappings(ENGAGEMENT_ID);
    expect(result).toHaveLength(1);
    expect(result![0]!.sourceAccountCode).toBe("4000");
  });

  it("getMappings returns empty array when no mappings", async () => {
    mp.auditAccountMapping.findMany.mockResolvedValue([]);
    const result = await getMappings(ENGAGEMENT_ID);
    expect(result).toEqual([]);
  });

  it("confirmMapping updates mapping and triggers rebuild", async () => {
    mp.auditAccountMapping.update.mockResolvedValue(
      mockMappingRow({ status: "confirmed", mappingType: "human_mapped", mappedAt: NOW }),
    );
    const result = await confirmMapping(ENGAGEMENT_ID, MAPPING_ID);
    expect(result).not.toBeNull();
    expect(mp.auditAccountMapping.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: MAPPING_ID },
        data: expect.objectContaining({ status: "confirmed" }),
      }),
    );
  });

  it("confirmAllSuggestedMappings confirms pending mappings", async () => {
    mp.auditAccountMapping.findMany
      .mockResolvedValueOnce([mockMappingRow()]) // pending list
      .mockResolvedValueOnce([mockMappingRow({ status: "confirmed", mappingType: "confirmed_ai" })]); // after update
    mp.auditAccountMapping.updateMany.mockResolvedValue({ count: 1 });

    const result = await confirmAllSuggestedMappings(ENGAGEMENT_ID);
    expect(result.confirmedCount).toBe(1);
    expect(mp.auditAccountMapping.updateMany).toHaveBeenCalled();
  });

  it("confirmAllSuggestedMappings returns zero when none pending", async () => {
    mp.auditAccountMapping.findMany.mockResolvedValue([]);
    const result = await confirmAllSuggestedMappings(ENGAGEMENT_ID);
    expect(result.confirmedCount).toBe(0);
  });

  it("getAccountMappingById returns mapping by id", async () => {
    mp.auditAccountMapping.findUnique.mockResolvedValue(mockMappingRow());
    const result = await getAccountMappingById(MAPPING_ID);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(MAPPING_ID);
  });

  it("getAccountMappingById returns null when not found", async () => {
    mp.auditAccountMapping.findUnique.mockResolvedValue(null);
    const result = await getAccountMappingById("nonexistent");
    expect(result).toBeNull();
  });

  it("updateManualMapping updates with canonical account", async () => {
    mp.auditCanonicalAccount.findUnique.mockResolvedValue({ id: CANONICAL_ID, code: "REV-01", name: "Revenue", category: "Revenue" });
    mp.auditAccountMapping.update.mockResolvedValue(
      mockMappingRow({ status: "confirmed", mappingType: "human_mapped", canonicalAccountId: CANONICAL_ID, mappedBy: "user-1", mappedAt: NOW }),
    );
    const result = await updateManualMapping({
      engagementId: ENGAGEMENT_ID,
      mappingId: MAPPING_ID,
      canonicalAccountId: CANONICAL_ID,
      mappedBy: "user-1",
    });
    expect(result).not.toBeNull();
    expect(mp.auditAccountMapping.update).toHaveBeenCalled();
  });

  it("getUnmappedAccounts returns pending mappings", async () => {
    mp.auditAccountMapping.findMany.mockResolvedValue([mockMappingRow()]);
    const result = await getUnmappedAccounts(ENGAGEMENT_ID);
    expect(result).toHaveLength(1);
    expect(mp.auditAccountMapping.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { engagementId: ENGAGEMENT_ID, status: "pending" },
      }),
    );
  });

  it("createSuggestedMappings skips duplicate account codes", async () => {
    mp.auditAccountMapping.findFirst.mockResolvedValue(mockMappingRow());
    const count = await createSuggestedMappingsForTrialBalance(ENGAGEMENT_ID, "org-1", [
      {
        accountCode: "4000",
        accountName: "Revenue",
        debitAmount: 0,
        creditAmount: 1000,
        balance: -1000,
        canonicalAccountId: CANONICAL_ID,
        confidence: 0.95,
        source: "ai",
      },
    ]);
    expect(count).toBe(0);
    expect(mp.auditAccountMapping.createMany).not.toHaveBeenCalled();
  });

  it("createSuggestedMappings creates new mappings", async () => {
    mp.auditAccountMapping.findFirst.mockResolvedValue(null);
    mp.auditCanonicalAccount.findMany.mockResolvedValue([{ id: CANONICAL_ID, code: "REV-01", name: "Revenue", category: "Revenue" }]);
    mp.auditAccountMapping.createMany.mockResolvedValue({ count: 1 });

    const count = await createSuggestedMappingsForTrialBalance(ENGAGEMENT_ID, "org-1", [
      {
        accountCode: "5000",
        accountName: "Expenses",
        debitAmount: 500,
        creditAmount: 0,
        balance: 500,
        canonicalAccountId: CANONICAL_ID,
        confidence: 0.85,
        source: "ai",
      },
    ]);
    expect(count).toBe(1);
    expect(mp.auditAccountMapping.createMany).toHaveBeenCalledTimes(1);
  });
});

// ─── Financial Statements ───────────────────────────────────────────

describe("financial-db — Financial Statements", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getFinancialStatements returns parsed statements with linked data", async () => {
    mp.auditFinancialStatement.findMany.mockResolvedValue([
      {
        id: "fs-1",
        engagementId: ENGAGEMENT_ID,
        statementType: "income_statement",
        title: "Statement of Profit or Loss",
        status: "draft",
        lines: JSON.stringify([
          { id: "is-l1", statementId: "fs-1", label: "Revenue", amount: 1_000_000, isTotal: false, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
        ]),
        createdAt: NOW,
        updatedAt: NOW,
      },
    ]);
    mp.auditAccountMapping.findMany.mockResolvedValue([]);
    mp.auditReviewComment.findMany.mockResolvedValue([]);

    const result = await getFinancialStatements(ENGAGEMENT_ID);
    expect(result).toHaveLength(1);
    expect(result![0]!.statementType).toBe("income_statement");
    expect(result![0]!.lines).toHaveLength(1);
    expect(result![0]!.linkedAccounts).toEqual([]);
  });

  it("getFinancialStatements returns empty array when none exist", async () => {
    mp.auditFinancialStatement.findMany.mockResolvedValue([]);
    const result = await getFinancialStatements(ENGAGEMENT_ID);
    expect(result).toEqual([]);
  });

  it("getEquityStatementLines returns lines from the latest equity statement", async () => {
    mp.auditFinancialStatement.findFirst.mockResolvedValue({
      id: "eq-1",
      engagementId: ENGAGEMENT_ID,
      statementType: "equity",
      title: "Statement of Changes in Equity",
      status: "draft",
      lines: JSON.stringify([
        { id: "eq-l1", statementId: "eq-1", label: "Retained Earnings", amount: 500_000, isTotal: true, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
      ]),
      createdAt: NOW,
      updatedAt: NOW,
    });
    const result = await getEquityStatementLines();
    expect(result).toHaveLength(1);
    expect(result[0]!.label).toBe("Retained Earnings");
  });

  it("getEquityStatementLines returns empty array when no equity statement", async () => {
    mp.auditFinancialStatement.findFirst.mockResolvedValue(null);
    const result = await getEquityStatementLines();
    expect(result).toEqual([]);
  });
});
