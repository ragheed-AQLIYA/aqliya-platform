// ─── Unified cross-product activity runtime ───
// Aggregates audit trail buffer, SalesOS audit log, and LC-shaped events into one stream.

import type { V1ProductKey } from "@/lib/platform/registry/product-contracts";
import type { AuditEventContract } from "@/lib/platform/contracts/audit-event-contract";
import { getRecentAuditBuffer } from "@/lib/platform/contracts/audit-trail-runtime";
import { enforceCoreOnMutation } from "@/lib/platform/integration/core-adoption-enforcer";
import {
  filterActivityStream,
  mergeActivityStreams,
  type ActivityStreamEntry,
  type ActivityStreamFilter,
  type ActivityStreamSeverity,
} from "./activity-stream";

export interface LocalContentActivityLike {
  id: string;
  organizationId: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  summaryAr?: string;
  summaryEn?: string;
}

export interface SalesAuditActivityLike {
  id: string;
  organizationId: string;
  action: string;
  actorId: string;
  targetType: string;
  targetId: string;
  timestamp: string;
}

function severityFromAction(action: string): ActivityStreamSeverity {
  if (action.includes("blocked") || action.includes("reject")) return "critical";
  if (action.includes("review") || action.includes("approval")) return "warning";
  return "info";
}

export function mapAuditTrailToActivity(
  event: AuditEventContract,
): ActivityStreamEntry {
  const orgId = event.organizationId ?? "unknown";
  return {
    id: `audit-trail-${event.timestamp}-${event.targetId}`,
    organizationId: orgId,
    productSlug: event.productSlug === "platform" ? "audit" : event.productSlug,
    action: event.action,
    actorId: event.actorId,
    resourceType: event.targetType,
    resourceId: event.targetId,
    summaryAr: `نشاط ${event.targetType}: ${event.action}`,
    summaryEn: `${event.targetType}: ${event.action}`,
    timestamp: event.timestamp,
    severity: severityFromAction(event.action),
    metadata: event.metadata,
  };
}

export function mapSalesAuditToActivity(
  entry: SalesAuditActivityLike,
): ActivityStreamEntry {
  return {
    id: `sales-${entry.id}`,
    organizationId: entry.organizationId,
    productSlug: "sales",
    action: entry.action,
    actorId: entry.actorId,
    resourceType: entry.targetType,
    resourceId: entry.targetId,
    summaryAr: `مبيعات: ${entry.action}`,
    summaryEn: `Sales: ${entry.action}`,
    timestamp: entry.timestamp,
    severity: severityFromAction(entry.action),
  };
}

export function mapLocalContentAuditToActivity(
  entry: LocalContentActivityLike,
): ActivityStreamEntry {
  return {
    id: `lc-${entry.id}`,
    organizationId: entry.organizationId,
    productSlug: "local_content",
    action: entry.action,
    actorId: entry.actorId,
    resourceType: entry.targetType,
    resourceId: entry.targetId,
    summaryAr: entry.summaryAr ?? `محتوى محلي: ${entry.action}`,
    summaryEn: entry.summaryEn ?? `Local content: ${entry.action}`,
    timestamp: entry.timestamp,
    severity: severityFromAction(entry.action),
  };
}

export interface ActivitySourceBundle {
  auditTrail?: readonly AuditEventContract[];
  salesAudit?: readonly SalesAuditActivityLike[];
  localContent?: readonly LocalContentActivityLike[];
}

export function listActivitiesForOrg(
  organizationId: string,
  sources: ActivitySourceBundle = {},
  filter: ActivityStreamFilter = {},
): ActivityStreamEntry[] {
  enforceCoreOnMutation({ productSlug: "audit", operation: "read" });

  const trail =
    sources.auditTrail ??
    getRecentAuditBuffer(200).filter(
      (e) => e.organizationId === organizationId || !e.organizationId,
    );

  const streams: ActivityStreamEntry[][] = [
    trail.map(mapAuditTrailToActivity),
    (sources.salesAudit ?? [])
      .filter((e) => e.organizationId === organizationId)
      .map(mapSalesAuditToActivity),
    (sources.localContent ?? [])
      .filter((e) => e.organizationId === organizationId)
      .map(mapLocalContentAuditToActivity),
  ];

  return filterActivityStream(mergeActivityStreams(streams), {
    ...filter,
    limit: filter.limit ?? 50,
  });
}

export function countActivitiesByProduct(
  entries: ActivityStreamEntry[],
): Record<V1ProductKey, number> {
  const counts = { audit: 0, local_content: 0, sales: 0 } as Record<
    V1ProductKey,
    number
  >;
  for (const e of entries) {
    counts[e.productSlug] = (counts[e.productSlug] ?? 0) + 1;
  }
  return counts;
}

function runtimeSignalToActivity(signal: {
  id: string;
  organizationId: string;
  productSlug: V1ProductKey;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  summaryAr?: string;
  summaryEn?: string;
  metadata?: Record<string, unknown>;
}): ActivityStreamEntry {
  return {
    id: signal.id,
    organizationId: signal.organizationId,
    productSlug: signal.productSlug,
    action: signal.action,
    actorId: "system",
    resourceType: signal.resourceType,
    resourceId: signal.resourceId,
    summaryAr: signal.summaryAr ?? signal.action,
    summaryEn: signal.summaryEn ?? signal.action,
    timestamp: signal.timestamp,
    severity: severityFromAction(signal.action),
    metadata: signal.metadata,
  };
}

/** Collect cross-product activities from signal producers into one stream. */
export async function collectProductActivities(
  organizationId: string,
  userId: string,
): Promise<ActivityStreamEntry[]> {
  const streams: ActivityStreamEntry[][] = [];

  try {
    const { collectSalesActivitySignals } = await import(
      "@/lib/platform/signals/sales-signal-producer"
    );
    const sales = await collectSalesActivitySignals(organizationId, userId);
    streams.push(sales.map(runtimeSignalToActivity));
  } catch {
    // optional bridge
  }

  return mergeActivityStreams(streams).slice(0, 50);
}
