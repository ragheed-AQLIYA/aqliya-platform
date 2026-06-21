import "server-only";

const MAX_BUFFER = 200;

export type RecentAuditEvent = {
  id: string;
  organizationId?: string | null;
  productSlug: string;
  action: string;
  actorId?: string | null;
  targetType: string;
  targetId: string;
  timestamp: string;
  severity?: string;
  metadata?: Record<string, unknown>;
  correlationId?: string;
};

const buffer: RecentAuditEvent[] = [];

export function pushRecentAuditEvent(event: RecentAuditEvent): void {
  buffer.unshift(event);
  if (buffer.length > MAX_BUFFER) buffer.length = MAX_BUFFER;
}

export function getRecentAuditEvents(
  organizationId?: string,
  limit = 50,
): RecentAuditEvent[] {
  const filtered = organizationId
    ? buffer.filter((e) => e.organizationId === organizationId)
    : buffer;
  return filtered.slice(0, limit);
}

export function clearRecentAuditBuffer(): void {
  buffer.length = 0;
}
