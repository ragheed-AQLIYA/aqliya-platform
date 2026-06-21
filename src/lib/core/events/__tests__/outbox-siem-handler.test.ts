/** @jest-environment node */

jest.mock("@/lib/core/audit/engine", () => ({
  AuditEngine: {
    write: jest.fn(async () => ({ ok: true, id: "siem-log-1" })),
  },
}));

import { AuditEngine } from "@/lib/core/audit/engine";
import { handleSiemOutboxBridge } from "@/lib/core/events/outbox-siem-handler";
import type { OutboxDispatchPayload } from "@/lib/core/events/outbox-service";

function basePayload(action: string): OutboxDispatchPayload {
  return {
    outboxId: "out-1",
    eventType: "platform.audit.recorded",
    organizationId: "org-1",
    platformAuditLogId: "log-1",
    envelope: {
      schemaVersion: "1.0",
      correlationId: "corr-1",
      productSlug: "platform",
      domain: "auth",
      action,
      occurredAt: new Date().toISOString(),
      organizationId: "org-1",
      actorId: "user-1",
    },
  };
}

describe("Outbox SIEM bridge handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("bridges ABAC mismatch events to siem.outbox.candidate", async () => {
    await handleSiemOutboxBridge(basePayload("auth.abac.shadow.mismatch"));
    expect(AuditEngine.write).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "siem.outbox.candidate",
        sourceSystem: "siem_outbox_bridge",
      }),
    );
  });
});
