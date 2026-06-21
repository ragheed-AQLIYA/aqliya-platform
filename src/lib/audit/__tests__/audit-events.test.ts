// ─── Unit Test: AuditOS Audit Event Dual-Write + Hash Chain ───
// Tests that recordAuditOsAuditEvent correctly writes to AuditEvent,
// dual-writes to PlatformAuditLog, and appends to hash chain.

jest.mock("@/lib/prisma", () => ({
  prisma: {
    auditEvent: {
      create: jest.fn(),
    },
  },
}));

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn().mockResolvedValue(undefined),
}));

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
import { Product } from "@/lib/platform/audit-logger";

const mockAuditEventCreate = prisma.auditEvent.create as jest.Mock;

describe("recordAuditOsAuditEvent", () => {
  const baseInput = {
    engagementId: "eng-1",
    eventType: "test.event.completed",
    actorId: "user-1",
    actorName: "Test User",
    actorRole: "reviewer" as const,
    targetType: "test_target",
    targetId: "target-1",
    description: "Test event description",
  };

  const createdEvent = {
    id: "audit-event-1",
    engagementId: "eng-1",
    eventType: "test.event.completed",
    actorId: "user-1",
    actorName: "Test User",
    actorRole: "reviewer",
    targetType: "test_target",
    targetId: "target-1",
    previousState: "",
    newState: "",
    description: "Test event description",
    aiRelated: false,
    metadata: null,
    timestamp: new Date(),
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy path ───

  it("creates AuditEvent and dual-writes with AUDIT_OS productKey", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);

    const result = await recordAuditOsAuditEvent(baseInput);

    // Primary write
    expect(mockAuditEventCreate).toHaveBeenCalledTimes(1);
    expect(mockAuditEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        engagementId: "eng-1",
        eventType: "test.event.completed",
        actorId: "user-1",
        actorName: "Test User",
        targetType: "test_target",
      }),
    });

    // Returns the created event
    expect(result).toEqual(createdEvent);

    // Dual-write
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith({
      productKey: Product.AUDIT_OS,
      action: "test.event.completed",
      platformOrganizationId: undefined,
      projectId: undefined,
      clientWorkspaceId: undefined,
      actorId: "user-1",
      actorName: "Test User",
      targetType: "test_target",
      targetId: "target-1",
      sourceModel: "AuditEvent",
      sourceId: "audit-event-1",
      metadata: expect.objectContaining({
        engagementId: "eng-1",
      }),
    });
  });

  it("passes optional platform context to dual-write", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);
    const input = {
      ...baseInput,
      platformOrganizationId: "plat-org-1",
      projectId: "proj-1",
      clientWorkspaceId: "ws-1",
    };

    await recordAuditOsAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        platformOrganizationId: "plat-org-1",
        projectId: "proj-1",
        clientWorkspaceId: "ws-1",
      }),
    );
  });

  it("passes aiRelated flag and metadata to the primary write", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);
    const input = {
      ...baseInput,
      aiRelated: true,
      metadata: { source: "auto", confidence: 0.95 },
    };

    await recordAuditOsAuditEvent(input);

    expect(mockAuditEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        aiRelated: true,
        metadata: { source: "auto", confidence: 0.95 },
      }),
    });
  });

  it("sets defaults for optional fields", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);

    await recordAuditOsAuditEvent(baseInput);

    expect(mockAuditEventCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorRole: "reviewer",
        previousState: "",
        newState: "",
        aiRelated: false,
      }),
    });
  });

  // ─── Hash chain ───

  it("appends to hash chain when dual-write returns ok:true with id", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-1",
    });

    await recordAuditOsAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-1",
      "test.event.completed",
      "user-1",
    );
  });

  it("does NOT append to hash chain when dual-write returns ok:false", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });

    await recordAuditOsAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when dual-write returns ok:true without id", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });

    await recordAuditOsAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  // ─── Error handling ───

  it("throws when primary write fails (no try/catch around primary write)", async () => {
    mockAuditEventCreate.mockRejectedValue(new Error("DB error"));

    await expect(recordAuditOsAuditEvent(baseInput)).rejects.toThrow("DB error");

    // Dual-write should NOT fire if primary write throws
    expect(writePlatformAuditLog).not.toHaveBeenCalled();
  });

  it("does NOT throw when dual-write fails (best-effort dual-write)", async () => {
    mockAuditEventCreate.mockResolvedValue(createdEvent);
    (writePlatformAuditLog as jest.Mock).mockRejectedValueOnce(
      new Error("Dual-write failed"),
    );

    await expect(recordAuditOsAuditEvent(baseInput)).resolves.not.toThrow();

    // Primary write still succeeds
    expect(mockAuditEventCreate).toHaveBeenCalledTimes(1);
    // Dual-write was attempted (but failed silently)
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });
});
