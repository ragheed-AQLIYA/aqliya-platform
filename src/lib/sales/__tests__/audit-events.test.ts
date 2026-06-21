// ─── Unit Test: SalesOS Audit Events Dual-Write ───
// Tests that recordSalesAuditEvent correctly dual-writes to PlatformAuditLog.

jest.mock("@/lib/prisma", () => ({
  prisma: {
    salesAuditEvent: {
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
import { recordSalesAuditEvent, SalesAuditActions } from "@/lib/sales/audit-events";
import { Product } from "@/lib/platform/audit-logger";

const mockSalesAuditCreate = prisma.salesAuditEvent.create as jest.Mock;

describe("recordSalesAuditEvent", () => {
  const baseInput = {
    organizationId: "org-1",
    actorId: "user-1",
    actorName: "Test User",
    action: SalesAuditActions.DEAL_CREATED,
    targetType: "Deal",
    targetId: "deal-1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Happy path ───

  it("writes to salesAuditEvent and dual-writes to PlatformAuditLog with SALES_OS productKey", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-1" });

    await recordSalesAuditEvent(baseInput);

    // Primary write
    expect(mockSalesAuditCreate).toHaveBeenCalledTimes(1);
    expect(mockSalesAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        organizationId: "org-1",
        actorId: "user-1",
        actorName: "Test User",
        action: "sales.deal.created",
        targetType: "Deal",
        targetId: "deal-1",
      }),
    });

    // Dual-write
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith({
      productKey: Product.SALES_OS,
      action: "sales.deal.created",
      platformOrganizationId: undefined,
      actorId: "user-1",
      actorName: "Test User",
      targetType: "Deal",
      targetId: "deal-1",
      metadata: undefined,
    });
  });

  it("passes platformOrganizationId to both writes when provided", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-2" });
    const input = { ...baseInput, platformOrganizationId: "plat-org-1" };

    await recordSalesAuditEvent(input);

    expect(mockSalesAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        platformOrganizationId: "plat-org-1",
      }),
    });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.SALES_OS,
        platformOrganizationId: "plat-org-1",
      }),
    );
  });

  it("passes metadata to both writes", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-3" });
    const metadata = { source: "manual", importance: "high" };
    const input = { ...baseInput, metadata };

    await recordSalesAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ metadata }),
    );
  });

  // ─── Error handling ───

  it("logs warning and does NOT throw when primary write fails, and still fires dual-write", async () => {
    mockSalesAuditCreate.mockRejectedValue(new Error("DB connection error"));
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    await expect(recordSalesAuditEvent(baseInput)).resolves.not.toThrow();

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[SalesOS] Audit event write failed: DB connection error"),
    );

    // Dual-write STILL fires (it is outside the try/catch)
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });

  it("does NOT throw when dual-write returns { ok: false } (writePlatformAuditLog is safe)", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-4" });
    // Real writePlatformAuditLog catches errors internally and returns { ok: false }
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    await expect(recordSalesAuditEvent(baseInput)).resolves.not.toThrow();

    expect(mockSalesAuditCreate).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge cases ───

  it("handles optional actorName and platformOrganizationId as undefined gracefully", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-5" });
    const input = {
      organizationId: "org-1",
      actorId: "user-2",
      action: "sales.account.created",
      targetType: "Account",
      targetId: "acc-1",
    };

    await recordSalesAuditEvent(input);

    expect(mockSalesAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorName: null,
        platformOrganizationId: null,
      }),
    });

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.SALES_OS,
        actorName: undefined,
        platformOrganizationId: undefined,
      }),
    );
  });

  it("preserves the full action string in both writes", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-6" });
    const input = {
      ...baseInput,
      action: "sales.governance.approval_granted",
    };

    await recordSalesAuditEvent(input);

    expect(mockSalesAuditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "sales.governance.approval_granted" }),
    });
    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "sales.governance.approval_granted" }),
    );
  });

  // ─── Hash chain ───

  it("appends to hash chain when dual-write returns ok:true with id", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-7" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: true,
      id: "plat-log-1",
    });

    await recordSalesAuditEvent(baseInput);

    expect(appendToAuditChain).toHaveBeenCalledTimes(1);
    expect(appendToAuditChain).toHaveBeenCalledWith(
      "plat-log-1",
      "sales.deal.created",
      "user-1",
    );
  });

  it("does NOT append to hash chain when dual-write returns ok:false", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-8" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });

    await recordSalesAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when dual-write returns ok:true without id", async () => {
    mockSalesAuditCreate.mockResolvedValue({ id: "audit-9" });
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });

    await recordSalesAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

});

