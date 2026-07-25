// ─── Unit Test: WorkflowOS Audit Events Single-Write ───
// Tests that createWorkflowAuditEvent writes to PlatformAuditLog only.

jest.mock("@/lib/prisma", () => ({
  prisma: {},
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
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import { createWorkflowAuditEvent } from "@/lib/workflowos/audit";
import { Product } from "@/lib/platform/audit-logger";

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

  it("writes to PlatformAuditLog with WORKFLOWOS productKey", async () => {
    await createWorkflowAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith({
      productKey: Product.WORKFLOWOS,
      action: "workflowos.record.created",
      clientWorkspaceId: "client-1",
      actorId: "user-1",
      targetType: "WorkflowRecord",
      targetId: "record-1",
      metadata: undefined,
    });
  });

  it("passes metadata to PlatformAuditLog", async () => {
    const metadata = { source: "automation", priority: "high" };
    const input = { ...baseInput, metadata };

    await createWorkflowAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata,
      }),
    );
  });

  // ─── Error handling ───

  it("does NOT throw when write returns { ok: false } (safe by default)", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    await expect(createWorkflowAuditEvent(baseInput)).resolves.toBeUndefined();

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge cases ───

  it("prepends workflowos. to the action", async () => {
    await createWorkflowAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "workflowos.record.created",
      }),
    );
  });

  it("maps field names correctly: clientId→clientWorkspaceId, entityType→targetType, entityId→targetId", async () => {
    await createWorkflowAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        clientWorkspaceId: "client-1",
        targetType: "WorkflowRecord",
        targetId: "record-1",
      }),
    );
  });

  // ─── Hash chain ───

  it("appends to hash chain when write returns ok:true with id", async () => {
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

  it("does NOT append to hash chain when write returns ok:false", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });

    await createWorkflowAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when write returns ok:true without id", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });

    await createWorkflowAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });
});
