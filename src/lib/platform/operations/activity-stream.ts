export type ActivityStreamSeverity = "critical" | "warning" | "info";

export interface ActivityStreamEntry {
  id: string;
  organizationId: string;
  productSlug: string;
  action: string;
  actorId: string;
  resourceType: string;
  resourceId: string;
  summaryAr?: string;
  summaryEn?: string;
  timestamp: string;
  severity: ActivityStreamSeverity;
  metadata?: Record<string, unknown>;
}

export interface ActivityStreamFilter {
  productSlug?: string;
  severity?: ActivityStreamSeverity;
  limit?: number;
  resourceType?: string;
}

export function filterActivityStream(
  entries: ActivityStreamEntry[],
  filter: ActivityStreamFilter,
): ActivityStreamEntry[] {
  let result = entries;
  if (filter.productSlug) {
    result = result.filter((e) => e.productSlug === filter.productSlug);
  }
  if (filter.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  if (filter.resourceType) {
    result = result.filter((e) => e.resourceType === filter.resourceType);
  }
  const limit = filter.limit ?? 50;
  return result.slice(0, limit);
}

export function mergeActivityStreams(
  streams: ActivityStreamEntry[][],
): ActivityStreamEntry[] {
  const merged: ActivityStreamEntry[] = [];
  for (const stream of streams) {
    merged.push(...stream);
  }
  return merged.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}
