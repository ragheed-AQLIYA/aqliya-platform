import type { AuditEventCategory } from "./audit-event-contract";

const buffer: AuditEventContractEntry[] = [];

export interface AuditEventContractEntry {
  category: AuditEventCategory;
  productSlug: string;
  action: string;
  actorId: string;
  organizationId: string;
  platformOrganizationId?: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  persist?: boolean;
}

export function getRecentAuditBuffer(
  count: number,
): { organizationId?: string; productSlug?: string; action?: string; actorId?: string; targetType?: string; targetId?: string; timestamp: string; metadata?: Record<string, unknown> }[] {
  return buffer.slice(-count).map((e) => ({
    organizationId: e.organizationId,
    productSlug: e.productSlug,
    action: e.action,
    actorId: e.actorId,
    targetType: e.targetType,
    targetId: e.targetId,
    timestamp: new Date().toISOString(),
    metadata: e.metadata,
  }));
}

export function recordAuditEventSafe(entry: AuditEventContractEntry): void {
  buffer.push(entry);
}
