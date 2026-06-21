/** @jest-environment node */

jest.mock("@/lib/platform/audit-log", () => ({
  writePlatformAuditLog: jest.fn(async () => ({ ok: true, id: "log-1" })),
}));

jest.mock("@/lib/platform/audit/audit-store", () => ({
  appendToAuditChain: jest.fn(async () => {}),
}));

import { AuditEngine, write } from "@/lib/core/audit/engine";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";

describe("AuditEngine (IC-P1-05)", () => {
  it("writes platform audit log", async () => {
    const result = await write({
      productKey: "decision",
      action: "test.action",
      actorId: "user-1",
    });

    expect(result.ok).toBe(true);
    expect(writePlatformAuditLog).toHaveBeenCalled();
  });

  it("optionally appends hash chain", async () => {
    await AuditEngine.write({
      productKey: "audit",
      action: "test.chain",
      actorId: "user-1",
      appendToChain: true,
    });

    expect(appendToAuditChain).toHaveBeenCalledWith(
      "log-1",
      "test.chain",
      "user-1",
    );
  });
});
