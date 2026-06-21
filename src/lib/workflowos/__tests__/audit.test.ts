// ─── Unit Test: WorkflowOS Audit Events Dual-Write ───
// Tests that createWorkflowAuditEvent correctly dual-writes to PlatformAuditLog.

jest.mock("@/lib/prisma", () => ({
  prisma: {
    sunbulAuditEvent: {
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

jest.mock("@/lib/auth", () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock("@/lib/workflowos/tenant-guard", () => ({
  requireClientAccess: jest.fn(),
}));

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { prisma } from "@/lib/prisma";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import { createWorkflowAuditEvent } from "@/lib/workflowos/audit";
import { Product } from "@/lib/platform/audit-logger";

const mockSunbulAuditCreate = prisma.sunbulAuditEvent.create as jest.Mock;

describe("createWorkflowAuditEvent", () => {
  const baseInput = {
    clientId: "client-1",
    actorId: "user-1",
    action: "record.created" as const,
    entityType: "WorkflowRecord",
    entityId: "record-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy path ───

  it("writes to sunbulAuditEvent and dual-writes to PlatformAuditLog with WORKFLOWOS productKey", async () => {
    const createdRecord = {
      id: "sunbul-audit-1",
      clientId: "client-1",
      actorId: "user-1",
      action: "record.created",
      entityType: "WorkflowRecord",
      entityId: "record-1",
      recordId: null,
      metadata: {},
      createdAt: new Date(),
    };

    mockSunbulAuditCreate.mockResolvedValue(createdRecord);

    const result = await createWorkflowAuditEvent(baseInput);

    // Returns the created audit event
    expect(result).toEqual(createdRecord);

    // Primary write
    expect(mockSunbulAuditCreate).toHaveBeenCalledTimes(1);
    expect(mockSunbulAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        clientId: "client-1",
        actorId: "user-1",
        action: "record.created",
        entityType: "WorkflowRecord",
        entityId: "record-1",
      }),
    });

    // Dual-write
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith({
      productKey: Product.WORKFLOWOS,
      action: "workflowos.record.created",
      clientWorkspaceId: "client-1",
      actorId: "user-1",
      targetType: "WorkflowRecord",
      targetId: "record-1",
      sourceModel: "SunbulAuditEvent",
      sourceId: "sunbul-audit-1",
      metadata: undefined,
    });
  });

  it("passes recordId to primary write when provided", async () => {
    const createdRecord = {
      id: "sunbul-audit-2",
      recordId: "rec-1",
    };
    mockSunbulAuditCreate.mockResolvedValue(createdRecord);
    const input = { ...baseInput, recordId: "rec-1" };

    await createWorkflowAuditEvent(input);

    expect(mockSunbulAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recordId: "rec-1",
      }),
    });
  });

  it("passes metadata to both writes", async () => {
    const metadata = { source: "automation", priority: "high" };
    mockSunbulAuditCreate.mockResolvedValue({
      id: "sunbul-audit-3",
      metadata,
    });
    const input = { ...baseInput, metadata };

    await createWorkflowAuditEvent(input);

    expect(mockSunbulAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        metadata,
      }),
    });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata,
      }),
    );
  });

  // ─── Error handling ───

  it("throws when primary write fails (no try/catch in createWorkflowAuditEvent)", async () => {
    mockSunbulAuditCreate.mockRejectedValue(new Error("DB constraint violation"));

    await expect(createWorkflowAuditEvent(baseInput)).rejects.toThrow(
      "DB constraint violation",
    );

    // Dual-write should NOT fire if primary write throws
    expect(writePlatformAuditLog).not.toHaveBeenCalled();
  });

  it("does NOT throw when dual-write returns { ok: false } and still returns the created record", async () => {
    const createdRecord = {
      id: "sunbul-audit-4",
      clientId: "client-1",
    };
    mockSunbulAuditCreate.mockResolvedValue(createdRecord);
    // Real writePlatformAuditLog catches errors internally and returns { ok: false }
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    // Must not throw
    const result = await createWorkflowAuditEvent(baseInput);

    expect(result).toEqual(createdRecord);
    expect(mockSunbulAuditCreate).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge cases ───

  it("prepends workflowos. to the action in the dual-write", async () => {
    mockSunbulAuditCreate.mockResolvedValue({ id: "sunbul-audit-5" });

    await createWorkflowAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "workflowos.record.created",
      }),
    );
  });

  it("uses sourceModel=SunbulAuditEvent and sourceId from the result", async () => {
    mockSunbulAuditCreate.mockResolvedValue({ id: "sunbul-audit-6" });

    await createWorkflowAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceModel: "SunbulAuditEvent",
        sourceId: "sunbul-audit-6",
      }),
    );
  });

  it("handles optional recordId as null in primary write", async () => {
    mockSunbulAuditCreate.mockResolvedValue({ id: "sunbul-audit-7" });

    await createWorkflowAuditEvent(baseInput);

    expect(mockSunbulAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        recordId: null,
      }),
    });
  });

  // ─── Hash chain ───

  it("appends to hash chain when dual-write returns ok:true with id", async () => {
    mockSunbulAuditCreate.mockResolvedValue({ id: "sunbul-audit-8" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-1",
    });

    await createWorkflowAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-1",
      "workflowos.record.created",
      "user-1",
    );
  });

  it("does NOT append to hash chain when dual-write returns ok:false", async () => {
    mockSunbulAuditCreate.mockResolvedValue({ id: "sunbul-audit-9" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });

    await createWorkflowAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when dual-write returns ok:true without id", async () => {
    mockSunbulAuditCreate.mockResolvedValue({ id: "sunbul-audit-10" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });

    await createWorkflowAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

});

