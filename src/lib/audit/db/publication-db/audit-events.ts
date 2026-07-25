import { prisma, toAuditEvent, toAuditEventFromPlatformLog, protectedAuditReadUnavailable, recordAuditOsAuditEvent } from "./common";
import type { AuditEvent } from "./common";

export async function getAuditEvents(
  engagementId: string,
): Promise<AuditEvent[]> {
  try {
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    const events = await prisma.platformAuditLog.findMany({
      where: { productKey: "audit_os", sourceId: engagementId },
      orderBy: { createdAt: "desc" },
    });
    if (events.length === 0) return [];
    return events.map(toAuditEventFromPlatformLog);
  } catch (error) {
    protectedAuditReadUnavailable(`getAuditEvents(${engagementId})`, error);
  }
}

export async function recordAuditEvent(params: {
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  previousState?: string;
  newState?: string;
  description: string;
  aiRelated?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<AuditEvent> {
  const event = await recordAuditOsAuditEvent({
    engagementId: params.engagementId,
    eventType: params.eventType,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetType: params.targetType,
    targetId: params.targetId,
    previousState: params.previousState ?? "",
    newState: params.newState ?? "",
    description: params.description,
    aiRelated: params.aiRelated ?? false,
    metadata: params.metadata ?? undefined,
  });
  return toAuditEvent(event);
}
