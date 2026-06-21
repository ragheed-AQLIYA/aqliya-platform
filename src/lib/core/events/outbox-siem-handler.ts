import "server-only";

import { AuditEngine } from "@/lib/core/audit/engine";
import type { OutboxDispatchPayload } from "./outbox-service";

const SIEM_BRIDGE_ACTIONS = new Set([
  "auth.access.denied",
  "auth.abac.enforced.denied",
  "auth.abac.shadow.mismatch",
]);

function shouldBridgeToSiem(payload: OutboxDispatchPayload): boolean {
  const action = payload.envelope.action;
  if (SIEM_BRIDGE_ACTIONS.has(action)) return true;
  if (action.includes(".denied") || action.includes(".rejected")) return true;
  const severity = (payload.envelope.metadata?.severity as string | undefined)?.toLowerCase();
  return severity === "warning" || severity === "error" || severity === "critical";
}

export async function handleSiemOutboxBridge(
  payload: OutboxDispatchPayload,
): Promise<void> {
  if (!shouldBridgeToSiem(payload)) return;

  await AuditEngine.write({
    productKey: "platform",
    sourceSystem: "siem_outbox_bridge",
    action: "siem.outbox.candidate",
    platformOrganizationId: payload.envelope.organizationId,
    actorId: payload.envelope.actorId,
    targetType: "PlatformAuditLog",
    targetId: payload.platformAuditLogId ?? payload.outboxId,
    severity: "info",
    status: "recorded",
    correlationId: payload.envelope.correlationId,
    metadata: {
      sourceAction: payload.envelope.action,
      correlationId: payload.envelope.correlationId,
      productSlug: payload.envelope.productSlug,
      outboxId: payload.outboxId,
    },
  }).catch(() => {});
}
