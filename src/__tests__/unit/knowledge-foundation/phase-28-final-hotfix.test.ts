/**
 * Phase 28 Final Hotfix — R-01 through R-04 closure tests.
 */

import { jest } from "@jest/globals";
import { readFileSync } from "fs";
import { join } from "path";

const mockGetCurrentUser = jest.fn();
const mockVerifyIntegrity = jest.fn();
const mockFindFirst = jest.fn();
const mockFindUniqueOrThrow = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: jest.fn().mockResolvedValue(undefined),
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

jest.mock("@/lib/knowledge-foundation/audit-handler", () => ({
  registerFoundationAuditHandler: jest.fn(),
}));

jest.mock("@/lib/knowledge-foundation/release-integrity", () => ({
  verifyReleaseIntegrity: mockVerifyIntegrity,
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findFirst: mockFindFirst,
      findUniqueOrThrow: mockFindUniqueOrThrow,
      update: mockUpdate,
    },
  },
}));

import { executeRollback } from "@/lib/knowledge-foundation/rollback-service";
import { generateFoundationRelease } from "@/actions/knowledge-foundation/actions";

jest.mock("@/lib/knowledge-foundation/release-generator", () => ({
  generateReleasePackage: jest.fn().mockResolvedValue({ versionId: "kfv-1" }),
}));

describe("Phase 28 Final Hotfix — R-01/R-02 rollback gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    });
    mockFindFirst.mockResolvedValue({
      id: "v2",
      versionNumber: "2.0.0",
      status: "ACTIVE",
    });
    mockFindUniqueOrThrow.mockResolvedValue({
      id: "v1",
      versionNumber: "1.0.0",
      status: "RELEASED",
    });
    mockUpdate.mockImplementation((args: { where: { id: string }; data: Record<string, unknown> }) => ({
      id: args.where.id,
      status: args.data.status,
    }));
  });

  it("rollback → integrity fail → blocked (R-01)", async () => {
    mockVerifyIntegrity.mockResolvedValue({
      valid: false,
      blockers: ["Hash mismatch"],
    });

    await expect(
      executeRollback({
        versionId: "v2",
        targetVersionId: "v1",
        actorId: "admin-1",
        reason: "test",
      }),
    ).rejects.toThrow("Rollback integrity verification failed");

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("rollback → verified RELEASED target → allowed (R-01/R-02)", async () => {
    mockVerifyIntegrity.mockResolvedValue({
      valid: true,
      blockers: [],
      releaseId: "kfr-1",
    });

    const result = await executeRollback({
      versionId: "v2",
      targetVersionId: "v1",
      actorId: "admin-1",
      reason: "verified rollback",
    });

    expect(result.status).toBe("ACTIVE");
    expect(mockVerifyIntegrity).toHaveBeenCalledWith(
      "v1",
      expect.objectContaining({ forActivation: true }),
    );
  });
});

describe("Phase 28 Final Hotfix — R-03 release authorization", () => {
  it("viewer → generateFoundationRelease → denied", async () => {
    mockGetCurrentUser.mockResolvedValue({
      id: "viewer-1",
      role: "VIEWER",
    });

    await expect(
      generateFoundationRelease({
        versionId: "kfv-1",
        versionNumber: "1.0.0",
      }),
    ).rejects.toThrow("OPERATOR role required");
  });
});

describe("Phase 28 Final Hotfix — R-04 middleware coverage", () => {
  it("knowledge-foundation routes appear in universal middleware policy", () => {
    const middlewarePath = join(process.cwd(), "src", "middleware.ts");
    const source = readFileSync(middlewarePath, "utf-8");

    expect(source).toContain('"/knowledge-foundation": "viewer"');
    expect(source).toContain('"/knowledge-foundation"');
    expect(source).toContain('"/knowledge-foundation": "viewer"');
    expect(source).toContain("/((?!");
  });
});
