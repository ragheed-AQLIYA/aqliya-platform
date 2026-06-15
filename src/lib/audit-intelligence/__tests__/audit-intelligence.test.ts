import { describe, expect, it, jest, beforeEach } from "@jest/globals";

const mockAuditAccountMappingFindMany = jest.fn();
const mockTBClassificationHistoryCount = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditAccountMapping: {
      findMany: mockAuditAccountMappingFindMany,
    },
    tBClassificationHistory: {
      count: mockTBClassificationHistoryCount,
    },
  },
}));

jest.mock("@/lib/tb-intelligence/org-resolver", () => ({
  resolveFirmMemoryOrganizationId: jest
    .fn<() => Promise<string>>()
    .mockResolvedValue("org-resolved"),
}));

import { analyzeEngagementIntelligence } from "@/lib/audit-intelligence";

describe("analyzeEngagementIntelligence", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("flags unmapped accounts", async () => {
    mockAuditAccountMappingFindMany.mockResolvedValueOnce([
      {
        sourceAccountCode: "1101",
        sourceAccountName: "Cash",
        debitAmount: 1000,
        creditAmount: 0,
        canonicalAccountId: null,
        confidence: null,
      },
      {
        sourceAccountCode: "2101",
        sourceAccountName: "Payables",
        debitAmount: 0,
        creditAmount: 500,
        canonicalAccountId: "ca-7",
        confidence: 0.95,
      },
    ]);
    mockTBClassificationHistoryCount.mockResolvedValueOnce(0);

    const findings = await analyzeEngagementIntelligence(
      "eng-1",
      "audit-org-1",
    );

    expect(findings.some((f) => f.type === "missing_evidence")).toBe(true);
    expect(findings.every((f) => f.requiresHumanReview)).toBe(true);
  });

  it("uses resolved organization for classification history", async () => {
    mockAuditAccountMappingFindMany.mockResolvedValueOnce([]);
    mockTBClassificationHistoryCount.mockResolvedValueOnce(3);

    await analyzeEngagementIntelligence("eng-1", "audit-org-1");

    expect(mockTBClassificationHistoryCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          organizationId: "org-resolved",
          engagementId: "eng-1",
        }),
      }),
    );
  });
});
