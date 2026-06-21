import "server-only";

import {
  writePlatformAuditLog,
  type PlatformAuditLogInput,
  type PlatformAuditLogWriteOptions,
  type PlatformAuditLogWriteResult,
} from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";
import { pushRecentAuditEvent } from "@/lib/platform/audit/recent-audit-buffer";
import {
  stampPlatformAuditEvent,
  type StampAuditEventInput,
} from "@/lib/core/contracts/event-envelope";

export interface AuditWriteInput extends StampAuditEventInput {
  appendToChain?: boolean;
}

export type AuditWriteOptions = PlatformAuditLogWriteOptions;

export async function write(
  input: AuditWriteInput,
  options?: AuditWriteOptions,
): Promise<PlatformAuditLogWriteResult> {
  const { appendToChain, ...rawInput } = input;
  const logInput = stampPlatformAuditEvent(rawInput);
  const result = await writePlatformAuditLog(logInput, options);

  if (result.ok && result.id) {
    const { isOutboxEnabled } = await import("@/lib/core/events/outbox-service");
    if (!isOutboxEnabled()) {
      pushRecentAuditEvent({
        id: result.id,
        organizationId: logInput.platformOrganizationId ?? "",
        productSlug: logInput.productKey,
        action: logInput.action,
        actorId: logInput.actorId,
        targetType: logInput.targetType ?? "unknown",
        targetId: logInput.targetId ?? logInput.action,
        timestamp: new Date().toISOString(),
        severity: logInput.severity,
        metadata:
          logInput.metadata && typeof logInput.metadata === "object"
            ? (logInput.metadata as Record<string, unknown>)
            : undefined,
        correlationId: logInput.requestId ?? undefined,
      });
    }
  }

  if (appendToChain && result.ok && result.id) {
    await appendToAuditChain(
      result.id,
      logInput.action,
      logInput.actorId ?? "system",
    ).catch(() => {});
  }

  return result;
}

export const AuditEngine = {
  write,
};
