import "server-only";

import { dispatch } from "@/lib/platform/notification/engine";
import type { OutboxDispatchPayload } from "./outbox-service";

const GOVERNANCE_ACTION_PATTERNS = [
  /^auth\.abac\./,
  /^auth\.access\.denied$/,
  /\.rejected$/,
  /\.denied$/,
];

function isGovernanceCriticalAction(action: string): boolean {
  return GOVERNANCE_ACTION_PATTERNS.some((pattern) => pattern.test(action));
}

export async function handleGovernanceNotificationOutbox(
  payload: OutboxDispatchPayload,
): Promise<void> {
  const { envelope } = payload;
  if (!isGovernanceCriticalAction(envelope.action)) return;

  const organizationId = envelope.organizationId;
  const recipientId = envelope.actorId;
  if (!organizationId || !recipientId) return;

  await dispatch(
    "on_error",
    {
      recipientId,
      organizationId,
    },
    {
      type: "platform_governance_alert",
      subjectAr: "تنبيه حوكمة — حدث أمني",
      bodyAr: `تم تسجيل حدث: ${envelope.action}`,
      subjectEn: "Governance alert — security event",
      bodyEn: `Recorded event: ${envelope.action}`,
      metadata: {
        correlationId: envelope.correlationId,
        platformAuditLogId: payload.platformAuditLogId,
        productSlug: envelope.productSlug,
      },
    },
    ["in_app"],
  ).catch(() => {});
}
