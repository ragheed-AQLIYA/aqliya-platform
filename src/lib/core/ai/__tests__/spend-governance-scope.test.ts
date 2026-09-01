jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformAuditLog: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}));

jest.mock("@/lib/core/ai/cost-mapping", () => ({
  getModelCost: () => null,
}));

import { prisma } from "@/lib/prisma";
import { getAISpendSummary } from "@/lib/core/ai/spend-tracker";
import { getAIGovernanceMetrics } from "@/lib/core/ai/governance-metrics";

const mockFindMany = jest.mocked(prisma.platformAuditLog.findMany);

describe("AI spend/governance tenant scope", () => {
  beforeEach(() => {
    mockFindMany.mockClear();
    mockFindMany.mockResolvedValue([]);
  });

  it("filters spend by organization when organizationId is provided", async () => {
    await getAISpendSummary(7, "org-a");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ organizationId: "org-a" }, { platformOrganizationId: "org-a" }],
        }),
      }),
    );
  });

  it("does not add an org filter for platform-wide spend reads", async () => {
    await getAISpendSummary(7);
    const where = mockFindMany.mock.calls[0][0].where as Record<string, unknown>;
    expect(where.OR).toBeUndefined();
    expect(where.organizationId).toBeUndefined();
  });

  it("filters governance metrics by organization when organizationId is provided", async () => {
    await getAIGovernanceMetrics(7, "org-b");
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: [{ organizationId: "org-b" }, { platformOrganizationId: "org-b" }],
        }),
      }),
    );
  });
});
