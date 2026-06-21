/** @jest-environment node */

const mockFindMany = jest.fn();
const mockCount = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformAuditLog: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}));

jest.mock("@/core/access/abac-gate", () => ({
  isAbacEnforceEnabledForOrg: jest.fn(() => false),
}));

import { getAbacShadowMismatchReport } from "@/core/access/abac-shadow-report";

describe("ABAC shadow mismatch report", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindMany.mockResolvedValue([
      {
        id: "log-1",
        action: "auth.abac.shadow.mismatch",
        actorId: "user-1",
        targetType: "action",
        targetId: "audit.export",
        createdAt: new Date(),
        metadata: { rbacGranted: true, abacAllowed: false },
      },
    ]);
    mockCount.mockResolvedValueOnce(3).mockResolvedValueOnce(10);
  });

  it("returns mismatch rate and recent rows", async () => {
    const report = await getAbacShadowMismatchReport("org-1", 30);
    expect(report.totalMismatches).toBe(3);
    expect(report.totalEvaluations).toBe(10);
    expect(report.mismatchRate).toBe(30);
    expect(report.recent).toHaveLength(1);
    expect(report.enforce.readyForPilot).toBe(false);
    expect(report.enforce.recommendation).toContain("exceeds");
  });

  it("marks org ready when evaluations and mismatch rate pass threshold", async () => {
    mockCount.mockReset();
    mockCount.mockResolvedValueOnce(0).mockResolvedValueOnce(20);
    const report = await getAbacShadowMismatchReport("org-1", 30);
    expect(report.mismatchRate).toBe(0);
    expect(report.enforce.readyForPilot).toBe(true);
    expect(report.enforce.recommendation).toContain("ABAC_ENFORCE_ORG_IDS");
  });
});
