"use server";

import { getAuditActor, requireRole } from "@/lib/audit/actor-context";
import { assertEngagementAccess } from "@/lib/audit/tenant-guard";
import {
  captureReportingGraphSnapshot,
  getGraphSnapshotById,
  isMindMapEnabled,
  listGraphSnapshots,
  loadReportingGraph,
} from "@/lib/audit/reporting-graph";
import type {
  GraphSnapshotRecord,
  ReportingGraph,
} from "@/lib/audit/reporting-graph/types";

export async function isMindMapEnabledAction(): Promise<boolean> {
  return isMindMapEnabled();
}

export async function getReportingGraphAction(
  engagementId: string,
): Promise<ReportingGraph | null> {
  const actor = await getAuditActor();
  requireRole(actor, [
    "admin",
    "operator",
    "reviewer",
    "manager",
    "partner",
    "viewer",
  ]);
  await assertEngagementAccess(engagementId, actor);
  if (!isMindMapEnabled()) return null;
  return loadReportingGraph(engagementId);
}

export async function listGraphSnapshotsAction(engagementId: string) {
  const actor = await getAuditActor();
  requireRole(actor, [
    "admin",
    "operator",
    "reviewer",
    "manager",
    "partner",
    "viewer",
  ]);
  await assertEngagementAccess(engagementId, actor);
  if (!isMindMapEnabled()) return [];
  return listGraphSnapshots(engagementId);
}

export async function getGraphSnapshotAction(
  engagementId: string,
  snapshotId: string,
): Promise<GraphSnapshotRecord | null> {
  const actor = await getAuditActor();
  requireRole(actor, [
    "admin",
    "operator",
    "reviewer",
    "manager",
    "partner",
    "viewer",
  ]);
  await assertEngagementAccess(engagementId, actor);
  if (!isMindMapEnabled()) return null;
  return getGraphSnapshotById(engagementId, snapshotId);
}

export async function captureGraphSnapshotAction(
  engagementId: string,
): Promise<GraphSnapshotRecord | null> {
  const actor = await getAuditActor();
  requireRole(actor, ["admin", "operator", "reviewer", "manager", "partner"]);
  await assertEngagementAccess(engagementId, actor);
  if (!isMindMapEnabled()) return null;

  return captureReportingGraphSnapshot({
    engagementId,
    milestone: "manual",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
  });
}
