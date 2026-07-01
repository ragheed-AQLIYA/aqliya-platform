/** @jest-environment node */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

const mockWriteAuditLog = jest.fn();

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: (...args) => mockWriteAuditLog(...args),
}));

import { SignalEngine } from "@/lib/core/signals/engine";

describe("SignalsEngine", () => {
  beforeEach(() => { jest.clearAllMocks(); });

  describe("produce", () => {
    it("produces a signal with default severity info", async () => {
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const signal = await SignalEngine.produce({
        organizationId: "org-1",
        productSlug: "audit",
        action: "engagement.created",
        resourceId: "eng-1",
        resourceType: "AuditEngagement",
      });
      expect(signal.organizationId).toBe("org-1");
      expect(signal.productSlug).toBe("audit");
      expect(signal.action).toBe("engagement.created");
      expect(signal.severity).toBe("info");
      expect(signal.id).toMatch(/^sig-/);
      expect(signal.timestamp).toBeDefined();
      expect(mockWriteAuditLog).toHaveBeenCalledWith(
        expect.objectContaining({ action: "signal.produced.engagement.created", severity: "info" }),
      );
    });

    it("produces a signal with explicit severity and summaries", async () => {
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const signal = await SignalEngine.produce({
        organizationId: "org-1", productSlug: "local_content", action: "supplier.flagged",
        severity: "warning", summaryEn: "Supplier flagged", summaryAr: "تم الإبلاغ",
        resourceId: "sup-1", resourceType: "Supplier",
      });
      expect(signal.severity).toBe("warning");
      expect(signal.summaryEn).toBe("Supplier flagged");
      expect(signal.summaryAr).toBeDefined();
    });

    it("includes metadata when provided", async () => {
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      const signal = await SignalEngine.produce({
        organizationId: "org-1", productSlug: "workflow", action: "task.overdue",
        severity: "critical", resourceId: "task-1", resourceType: "WorkflowTask",
        metadata: { overdueDays: 5, assignee: "user-1" },
      });
      expect(signal.metadata).toEqual({ overdueDays: 5, assignee: "user-1" });
    });

    it("handles audit log failure gracefully", async () => {
      mockWriteAuditLog.mockRejectedValue(new Error("Audit log unavailable"));
      const signal = await SignalEngine.produce({
        organizationId: "org-1", productSlug: "sales", action: "deal.won",
        resourceId: "deal-1", resourceType: "SalesDeal",
      });
      expect(signal).toBeDefined();
      expect(signal.id).toMatch(/^sig-/);
    });
  });

  describe("acknowledge", () => {
    it("acknowledges a signal and logs audit event", async () => {
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      await SignalEngine.acknowledge({ signalId: "sig-abc", organizationId: "org-1", acknowledgedBy: "user-1", notes: "Reviewed" });
      expect(mockWriteAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "signal.acknowledged", actorId: "user-1" }));
    });
    it("handles audit log failure gracefully", async () => {
      mockWriteAuditLog.mockRejectedValue(new Error("Log down"));
      await expect(SignalEngine.acknowledge({ signalId: "sig-xyz", organizationId: "org-1", acknowledgedBy: "user-1" })).resolves.toBeUndefined();
    });
  });

  describe("resolve", () => {
    it("resolves a signal and logs audit event", async () => {
      mockWriteAuditLog.mockResolvedValue({ ok: true });
      await SignalEngine.resolve({ signalId: "sig-abc", organizationId: "org-1", resolvedBy: "user-1", resolution: "Fixed" });
      expect(mockWriteAuditLog).toHaveBeenCalledWith(expect.objectContaining({ action: "signal.resolved" }));
    });
  });
});
