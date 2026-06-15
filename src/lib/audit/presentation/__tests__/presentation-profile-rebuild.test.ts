import type { PresentationProfileRebuildResult } from "@/lib/audit/presentation/presentation-profile-rebuild-types";
import { rebuildFinancialStatementsAfterProfileChange } from "@/lib/audit/presentation/presentation-profile-rebuild";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditAccountMapping: {
      count: jest.fn(),
    },
  },
}));

jest.mock("@/lib/audit/fs-engine", () => ({
  isFsV2Enabled: jest.fn(() => true),
}));

jest.mock("@/lib/audit/db/index", () => ({
  rebuildFinancialStatementsForEngagement: jest.fn(),
}));

import { prisma } from "@/lib/prisma";
import { rebuildFinancialStatementsForEngagement } from "@/lib/audit/db/index";

const mockCount = prisma.auditAccountMapping.count as jest.Mock;
const mockRebuild = rebuildFinancialStatementsForEngagement as jest.Mock;

describe("rebuildFinancialStatementsAfterProfileChange", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("skips rebuild when engagement has no mappings", async () => {
    mockCount.mockResolvedValue(0);
    const result = await rebuildFinancialStatementsAfterProfileChange("eng-1");
    expect(result.status).toBe("skipped_no_mappings");
    expect(mockRebuild).not.toHaveBeenCalled();
  });

  it("rebuilds when mappings exist", async () => {
    mockCount.mockResolvedValue(12);
    mockRebuild.mockResolvedValue(undefined);
    const result: PresentationProfileRebuildResult =
      await rebuildFinancialStatementsAfterProfileChange("eng-1");
    expect(result.status).toBe("rebuilt");
    expect(result.method).toBe("v2");
    expect(mockRebuild).toHaveBeenCalledWith("eng-1");
  });

  it("returns failed when rebuild throws", async () => {
    mockCount.mockResolvedValue(5);
    mockRebuild.mockRejectedValue(new Error("DB unavailable"));
    const result = await rebuildFinancialStatementsAfterProfileChange("eng-1");
    expect(result.status).toBe("failed");
    expect(result.errorMessage).toContain("DB unavailable");
  });
});
