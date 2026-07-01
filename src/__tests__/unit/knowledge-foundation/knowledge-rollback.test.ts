/**
 * Phase 9 — Knowledge Foundation Rollback Tests.
 *
 * Tests the rollback engine:
 * - Rollback requires ADMIN
 * - Rollback requires reason
 * - Rollback preserves previous version (not deleted)
 * - Rollback re-activates target version
 * - Audit event emitted
 */

import { jest } from "@jest/globals";

/* ── Mock auth layer ───────────────────────────── */
const mockGetCurrentUser = jest.fn<() => Promise<Record<string, unknown>>>();
const mockWritePlatformAuditLog = jest.fn().mockResolvedValue({ ok: true });

jest.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: mockWritePlatformAuditLog,
}));

/* ── Mock events ───────────────────────────────── */
const mockEmitFoundationEvent = jest.fn().mockResolvedValue(undefined);
jest.mock("@/lib/knowledge-foundation/events", () => ({
  emitFoundationEvent: mockEmitFoundationEvent,
  onFoundationEvent: jest.fn().mockReturnValue(() => {}),
  onAnyFoundationEvent: jest.fn().mockReturnValue(() => {}),
  clearFoundationHandlers: jest.fn(),
}));

const mockVerifyIntegrity = jest.fn();

jest.mock("@/lib/knowledge-foundation/release-integrity", () => ({
  verifyReleaseIntegrity: mockVerifyIntegrity,
}));

jest.mock("@/lib/knowledge-foundation/audit-handler", () => ({
  registerFoundationAuditHandler: jest.fn(),
}));

/* ── Mock Prisma ───────────────────────────────── */
const mockFindFirst = jest.fn();
const mockFindUniqueOrThrow = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/lib/prisma", () => {
  const base = jest.requireActual<{ default: Record<string, unknown> }>(
    "@/__mocks__/prisma-mock.js",
  );
  return {
    __esModule: true,
    default: {
      ...base.default,
      knowledgeFoundationVersion: {
        ...(base.default.knowledgeFoundationVersion as Record<string, unknown>),
        findFirst: mockFindFirst,
        findUniqueOrThrow: mockFindUniqueOrThrow,
        update: mockUpdate,
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    },
    prisma: {
      ...base.default,
      knowledgeFoundationVersion: {
        ...(base.default.knowledgeFoundationVersion as Record<string, unknown>),
        findFirst: mockFindFirst,
        findUniqueOrThrow: mockFindUniqueOrThrow,
        update: mockUpdate,
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    },
  };
});

/* ── Import after mocks ────────────────────────── */
import { executeRollback } from "@/lib/knowledge-foundation/rollback-service";

function makeUser(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "admin-user",
    email: "admin@test.com",
    name: "Admin User",
    role: "ADMIN",
    organizationId: "org-1",
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyIntegrity.mockResolvedValue({
    valid: true,
    blockers: [],
    releaseId: "kfr-1",
    hashMatch: true,
    chainValid: true,
  });
  // Default: version 2 is active, version 1 is RELEASED rollback target
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
    activatedAt: args.data.activatedAt ?? null,
    rollbackVersionId: args.data.rollbackVersionId ?? null,
    versionNumber: "1.0.0",
  }));
});

describe("Knowledge Foundation Rollback", () => {
  it("executes rollback when user is ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));

    const result = await executeRollback({
      versionId: "v2",
      targetVersionId: "v1",
      actorId: "admin-user",
      reason: "Rolling back due to incorrect rules",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("ACTIVE");
    expect(mockVerifyIntegrity).toHaveBeenCalledWith(
      "v1",
      expect.objectContaining({ forActivation: true }),
    );
    expect(mockEmitFoundationEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "knowledge.foundation.rollback.executed" }),
    );
  });

  it("throws when user is not ADMIN", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "OPERATOR" }));

    await expect(
      executeRollback({
        versionId: "v2",
        targetVersionId: "v1",
        actorId: "operator-user",
        reason: "Need rollback",
      }),
    ).rejects.toThrow("Access denied");
  });

  it("throws when reason is empty", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));

    await expect(
      executeRollback({
        versionId: "v2",
        targetVersionId: "v1",
        actorId: "admin-user",
        reason: "",
      }),
    ).rejects.toThrow("Rollback reason is required");
  });

  it("throws when target is already active", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockFindFirst.mockResolvedValue({
      id: "v1",
      versionNumber: "1.0.0",
      status: "ACTIVE",
    });
    mockFindUniqueOrThrow.mockResolvedValue({
      id: "v1",
      versionNumber: "1.0.0",
      status: "ACTIVE",
    });

    await expect(
      executeRollback({
        versionId: "v1",
        targetVersionId: "v1",
        actorId: "admin-user",
        reason: "No-op rollback",
      }),
    ).rejects.toThrow("No rollback needed");
  });

  it("deprecates current version during rollback", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));

    await executeRollback({
      versionId: "v2",
      targetVersionId: "v1",
      actorId: "admin-user",
      reason: "Rolling back to v1",
    });

    // Current active version should be deprecated
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "v2" },
        data: expect.objectContaining({ status: "DEPRECATED" }),
      }),
    );
  });

  it("emits deprecation and rollback events", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));

    await executeRollback({
      versionId: "v2",
      targetVersionId: "v1",
      actorId: "admin-user",
      reason: "Testing events",
    });

    // Should have at least 2 events: deprecation + rollback
    const deprecationCalls = mockEmitFoundationEvent.mock.calls.filter(
      (c) => c[0].type === "knowledge.foundation.version.deprecated",
    );
    const rollbackCalls = mockEmitFoundationEvent.mock.calls.filter(
      (c) => c[0].type === "knowledge.foundation.rollback.executed",
    );

    expect(deprecationCalls.length).toBeGreaterThanOrEqual(1);
    expect(rollbackCalls.length).toBeGreaterThanOrEqual(1);
  });

  it("preserves previous version (no destructive overwrite)", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));

    await executeRollback({
      versionId: "v2",
      targetVersionId: "v1",
      actorId: "admin-user",
      reason: "Testing preservation",
    });

    // Target version is re-activated, not deleted
    const updateCalls = mockUpdate.mock.calls.filter(
      (c) => c[0].where.id === "v1",
    );
    expect(updateCalls.length).toBeGreaterThanOrEqual(1);
    expect(updateCalls[0][0].data.status).toBe("ACTIVE");
  });

  it("rejects DEPRECATED rollback target", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockFindUniqueOrThrow.mockResolvedValue({
      id: "v1",
      versionNumber: "1.0.0",
      status: "DEPRECATED",
    });

    await expect(
      executeRollback({
        versionId: "v2",
        targetVersionId: "v1",
        actorId: "admin-user",
        reason: "Invalid target",
      }),
    ).rejects.toThrow("RELEASED or ACTIVE");
    expect(mockVerifyIntegrity).not.toHaveBeenCalled();
  });

  it("rejects APPROVED rollback target", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockFindUniqueOrThrow.mockResolvedValue({
      id: "v1",
      versionNumber: "1.0.0",
      status: "APPROVED",
    });

    await expect(
      executeRollback({
        versionId: "v2",
        targetVersionId: "v1",
        actorId: "admin-user",
        reason: "Invalid target",
      }),
    ).rejects.toThrow("RELEASED or ACTIVE");
  });

  it("blocks rollback when integrity verification fails", async () => {
    mockGetCurrentUser.mockResolvedValue(makeUser({ role: "ADMIN" }));
    mockVerifyIntegrity.mockResolvedValue({
      valid: false,
      blockers: ["Hash mismatch"],
    });

    await expect(
      executeRollback({
        versionId: "v2",
        targetVersionId: "v1",
        actorId: "admin-user",
        reason: "Should fail integrity",
      }),
    ).rejects.toThrow("Rollback integrity verification failed");

    expect(mockUpdate).not.toHaveBeenCalled();
  });
});
