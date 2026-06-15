import { prisma } from "@/lib/prisma";
import { loadReportingGraph } from "./graph-query";
import type { GraphSnapshotRecord, ReportingGraphStats } from "./types";
import { isEnabled } from "@/lib/platform/feature-flags/registry";

function isMindMapEnabled(): boolean {
  return isEnabled("audit.mind-map");
}

const SNAPSHOT_EVENT = "factory_graph.snapshot";

export async function captureReportingGraphSnapshot(params: {
  engagementId: string;
  milestone: "approval" | "manual";
  actorId: string;
  actorName: string;
  actorRole: string;
}): Promise<GraphSnapshotRecord | null> {
  if (!isMindMapEnabled()) return null;

  const graph = await loadReportingGraph(params.engagementId);
  const snapshotId = `snap-${Date.now()}`;

  await prisma.auditEvent.create({
    data: {
      engagementId: params.engagementId,
      eventType: SNAPSHOT_EVENT,
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      targetType: "reporting_graph",
      targetId: snapshotId,
      previousState: "",
      newState: params.milestone,
      description: `Factory graph snapshot captured at ${params.milestone} milestone`,
      metadata: {
        milestone: params.milestone,
        graphVersion: graph.graphVersion,
        stats: graph.stats,
        capturedAt: graph.builtAt,
        graph,
      } as any,
    },
  });

  return {
    id: snapshotId,
    engagementId: params.engagementId,
    milestone: params.milestone,
    capturedAt: graph.builtAt,
    stats: graph.stats,
    graph,
  };
}

export async function listGraphSnapshots(
  engagementId: string,
): Promise<
  Array<{
    id: string;
    milestone: string;
    capturedAt: string;
    stats: ReportingGraphStats;
  }>
> {
  const events = await prisma.auditEvent.findMany({
    where: { engagementId, eventType: SNAPSHOT_EVENT },
    orderBy: { timestamp: "desc" },
    take: 20,
  });

  return events.map((ev) => {
    const meta = (ev.metadata ?? {}) as Record<string, unknown>;
    return {
      id: ev.targetId,
      milestone: String(meta.milestone ?? ev.newState ?? "unknown"),
      capturedAt: String(meta.capturedAt ?? ev.timestamp.toISOString()),
      stats: (meta.stats ?? {
        tbAccounts: 0,
        mappings: 0,
        statements: 0,
        fsLines: 0,
        notes: 0,
        edges: 0,
      }) as ReportingGraphStats,
    };
  });
}

export async function getGraphSnapshotById(
  engagementId: string,
  snapshotId: string,
): Promise<GraphSnapshotRecord | null> {
  const ev = await prisma.auditEvent.findFirst({
    where: {
      engagementId,
      eventType: SNAPSHOT_EVENT,
      targetId: snapshotId,
    },
  });
  if (!ev?.metadata) return null;

  const meta = ev.metadata as Record<string, unknown>;
  const graph = meta.graph as GraphSnapshotRecord["graph"] | undefined;
  if (!graph) return null;

  return {
    id: snapshotId,
    engagementId,
    milestone: (meta.milestone as "approval" | "manual") ?? "manual",
    capturedAt: String(meta.capturedAt ?? ev.timestamp.toISOString()),
    stats: graph.stats,
    graph,
  };
}
