import "server-only";

import { pushRecentAuditEvent } from "@/lib/platform/audit/recent-audit-buffer";
import { handleGovernanceNotificationOutbox } from "./outbox-notification-handler";
import { handleSiemOutboxBridge } from "./outbox-siem-handler";
import {
  PLATFORM_AUDIT_OUTBOX_EVENT,
  registerOutboxHandler,
  type OutboxDispatchPayload,
} from "./outbox-service";

async function handlePlatformAuditActivityFeed(
  payload: OutboxDispatchPayload,
): Promise<void> {
  const envelope = payload.envelope;
  pushRecentAuditEvent({
    id: payload.platformAuditLogId ?? payload.outboxId,
    organizationId: envelope.organizationId,
    productSlug: envelope.productSlug,
    action: envelope.action,
    actorId: envelope.actorId,
    targetType: envelope.resourceType ?? "unknown",
    targetId: envelope.resourceId ?? envelope.action,
    timestamp: envelope.occurredAt,
    metadata: envelope.metadata,
    correlationId: envelope.correlationId,
  });
}

let registered = false;

export function ensureDefaultOutboxHandlers(): void {
  if (registered) return;
  registerOutboxHandler(
    PLATFORM_AUDIT_OUTBOX_EVENT,
    handlePlatformAuditActivityFeed,
  );
  registerOutboxHandler(PLATFORM_AUDIT_OUTBOX_EVENT, handleSiemOutboxBridge);
  registerOutboxHandler(
    PLATFORM_AUDIT_OUTBOX_EVENT,
    handleGovernanceNotificationOutbox,
  );
  registered = true;
}

ensureDefaultOutboxHandlers();
