// ─── Unit Test: AuditOS Audit Event Single-Write + Hash Chain ───
// Tests that recordAuditOsAuditEvent correctly writes to PlatformAuditLog
// via writePlatformAuditLog and appends to hash chain.

jest.mock("@/lib/prisma", () => ({
  prisma: {
    platformAuditLog: {
      findUnique: jest.fn(),
    },
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

const mockFindUnique = prisma.platformAuditLog.findUnique as jest.Mock;

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

  const createdPal = {
    id: "audit-event-1",
    action: "test.event.completed",
    productKey: "audit_os",
    actorId: "user-1",
    actorName: "Test User",
    targetType: "test_target",
    targetId: "target-1",
    beforeState: null,
    afterState: "",
    eventDescription: "Test event description",
    aiRelated: false,
    metadata: { engagementId: "eng-1" },
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy path ───

  it("creates AuditEvent via writePlatformAuditLog and reads back from platformAuditLog", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true, id: "audit-event-1" });
    mockFindUnique.mockResolvedValue(createdPal);

    const result = await recordAuditOsAuditEvent(baseInput);

    // Primary write
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.AUDIT_OS,
        action: "test.event.completed",
        platformOrganizationId: undefined,
        projectId: undefined,
        clientWorkspaceId: undefined,
        actorId: "user-1",
        actorName: "Test User",
        targetType: "test_target",
        targetId: "target-1",
        sourceId: "eng-1",
        metadata: expect.objectContaining({
          engagementId: "eng-1",
        }),
      }),
    );

    // Reads back from platformAuditLog
    expect(mockFindUnique).toHaveBeenCalledTimes(1);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "audit-event-1" },
    });

    // Returns the read-back record
    expect(result).toEqual(expect.objectContaining({
      id: "audit-event-1",
      eventType: "test.event.completed",
    }));
  });

  it("passes optional platform context to dual-write", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true, id: "audit-event-1" });
    mockFindUnique.mockResolvedValue(createdPal);
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

  it("passes aiRelated flag and metadata to the write", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true, id: "audit-event-1" });
    mockFindUnique.mockResolvedValue(createdPal);
    const input = {
      ...baseInput,
      aiRelated: true,
      metadata: { source: "auto", confidence: 0.95 },
    };

    await recordAuditOsAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        aiRelated: true,
        metadata: expect.objectContaining({
          source: "auto",
          confidence: 0.95,
          engagementId: "eng-1",
        }),
      }),
    );
  });

  it("sets defaults for optional fields", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true, id: "audit-event-1" });
    mockFindUnique.mockResolvedValue(createdPal);

    await recordAuditOsAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        beforeState: undefined,
        afterState: undefined,
        eventDescription: "Test event description",
        aiRelated: false,
      }),
    );
  });

  // ─── Hash chain ───

  it("appends to hash chain when dual-write returns ok:true with id", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-1",
    });
    mockFindUnique.mockResolvedValue({ ...createdPal, id: "plat-log-1" });

    await recordAuditOsAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-1",
      "test.event.completed",
      "user-1",
    );
  });

  it("does NOT append to hash chain when dual-write returns ok:false", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });
    mockFindUnique.mockResolvedValue({ ...createdPal, id: "plat-log-2" });

    await recordAuditOsAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when dual-write returns ok:true without id", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });
    // Returns null (not found) from findUnique since id is undefined
    mockFindUnique.mockResolvedValue(null);

    await expect(recordAuditOsAuditEvent(baseInput)).rejects.toThrow("PlatformAuditLog not found after write");

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  // ─── Error handling ───

  it("throws when PlatformAuditLog not found after write", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true, id: "missing-id" });
    mockFindUnique.mockResolvedValue(null);

    await expect(recordAuditOsAuditEvent(baseInput)).rejects.toThrow("PlatformAuditLog not found after write");
  });

  it("does NOT throw when dual-write fails (writePlatformAuditLog returns ok:false)", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Dual-write failed" });

    await expect(recordAuditOsAuditEvent(baseInput)).rejects.toThrow();

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });
});
