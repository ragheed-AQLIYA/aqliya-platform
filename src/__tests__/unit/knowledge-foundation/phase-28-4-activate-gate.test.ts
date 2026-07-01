/**
 * Phase 28.4 — Activation integrity gate tests.
 */

import { jest } from "@jest/globals";

const mockGetCurrentUser = jest.fn();
const mockVerifyIntegrity = jest.fn();
const mockFindUniqueOrThrow = jest.fn();
const mockUpdateMany = jest.fn();
const mockUpdate = jest.fn();
const mockEmitFoundationEvent = jest.fn<() => Promise<void>>();

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

jest.mock("@/lib/knowledge-foundation/release-integrity", () => ({
  verifyReleaseIntegrity: mockVerifyIntegrity,
}));

jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: mockEmitFoundationEvent,
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

jest.mock("@/lib/knowledge-foundation/audit-handler", () => ({
  registerFoundationAuditHandler: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    knowledgeFoundationVersion: {
      findUniqueOrThrow: mockFindUniqueOrThrow,
      updateMany: mockUpdateMany,
      update: mockUpdate,
    },
  },
}));

import { activateVersion } from "@/lib/knowledge-foundation/kf-service";

describe("Phase 28.4 — activateVersion integrity gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({
      id: "admin-1",
      role: "ADMIN",
    });
    mockFindUniqueOrThrow.mockResolvedValue({
      id: "kfv-1",
      status: "RELEASED",
      versionNumber: "1.0.0",
    });
    mockUpdateMany.mockResolvedValue({ count: 1 });
    mockUpdate.mockResolvedValue({
      id: "kfv-1",
      status: "ACTIVE",
    });
  });

  it("blocks activation when integrity verification fails", async () => {
    mockVerifyIntegrity.mockResolvedValue({
      valid: false,
      blockers: ["Hash mismatch"],
      hashMatch: false,
    });

    await expect(activateVersion({ versionId: "kfv-1" })).rejects.toThrow(
      "Release integrity verification failed",
    );

    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("activates when RELEASED + COMPLETE + integrity valid", async () => {
    mockVerifyIntegrity.mockResolvedValue({
      valid: true,
      blockers: [],
      hashMatch: true,
      chainValid: true,
    });

    const result = await activateVersion({ versionId: "kfv-1" });

    expect(mockVerifyIntegrity).toHaveBeenCalledWith("kfv-1", {
      actorId: "admin-1",
      versionNumber: "1.0.0",
      emitAudit: true,
      forActivation: true,
    });
    expect(mockUpdate).toHaveBeenCalled();
    expect(result.status).toBe("ACTIVE");
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "knowledge.foundation.version.activated",
      }),
    );
  });
});
