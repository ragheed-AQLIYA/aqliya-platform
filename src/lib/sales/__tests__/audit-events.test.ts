// ─── Unit Test: SalesOS Audit Events Single-Write ───
// Tests that recordSalesAuditEvent writes to PlatformAuditLog only.

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn().mockResolvedValue(undefined),
}));

import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import { recordSalesAuditEvent, SalesAuditActions } from "@/lib/sales/audit-events";
import { Product } from "@/lib/platform/audit-logger";

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

  it("writes to PlatformAuditLog with SALES_OS productKey (single-write)", async () => {
    await recordSalesAuditEvent(baseInput);

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.SALES_OS,
        action: "sales.deal.created",
        platformOrganizationId: undefined,
        actorId: "user-1",
        actorName: "Test User",
        targetType: "Deal",
        targetId: "deal-1",
        metadata: undefined,
        organizationId: "org-1",
      }),
    );
  });

  it("passes platformOrganizationId to write when provided", async () => {
    const input = { ...baseInput, platformOrganizationId: "plat-org-1" };

    await recordSalesAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.SALES_OS,
        platformOrganizationId: "plat-org-1",
      }),
    );
  });

  it("passes metadata to write", async () => {
    const metadata = { source: "manual", importance: "high" };
    const input = { ...baseInput, metadata };

    await recordSalesAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ metadata }),
    );
  });

  // ─── Error handling ───

  it("does NOT throw when write returns { ok: false } (writePlatformAuditLog is safe)", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: false, error: "Write failed" });

    await expect(recordSalesAuditEvent(baseInput)).resolves.not.toThrow();

    expect(writePlatformAuditLog).toHaveBeenCalledTimes(1);
  });

  // ─── Edge cases ───

  it("handles optional actorName and platformOrganizationId as undefined gracefully", async () => {
    const input = {
      organizationId: "org-1",
      actorId: "user-2",
      action: "sales.account.created",
      targetType: "Account",
      targetId: "acc-1",
    };

    await recordSalesAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        productKey: Product.SALES_OS,
        actorName: undefined,
        platformOrganizationId: undefined,
      }),
    );
  });

  it("preserves the full action string in write", async () => {
    const input = {
      ...baseInput,
      action: "sales.governance.approval_granted",
    };

    await recordSalesAuditEvent(input);

    expect(writePlatformAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: "sales.governance.approval_granted" }),
    );
  });

  // ─── Hash chain ───

  it("appends to hash chain when write returns ok:true with id", async () => {
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

  it("does NOT append to hash chain when write returns ok:false", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({
      ok: false,
      id: "plat-log-2",
    });

    await recordSalesAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });

  it("does NOT append to hash chain when write returns ok:true without id", async () => {
    (writePlatformAuditLog as jest.Mock).mockResolvedValueOnce({ ok: true });

    await recordSalesAuditEvent(baseInput);

    expect(appendToAuditChain).not.toHaveBeenCalled();
  });
});
