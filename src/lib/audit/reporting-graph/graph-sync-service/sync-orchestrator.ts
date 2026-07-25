import {
  ensureReportingGraph,
  clearReportingGraphContent,
  bumpReportingGraphVersion,
  upsertGraphNode,
  upsertGraphEdge,
} from "../graph-repository";
import { isReportingGraphEnabled, logGraphSync } from "./common";
import { syncTrialBalanceNodes } from "./sync-trial-balance";
import { syncMappingNodes } from "./sync-mappings";
import { syncStatementNodes } from "./sync-statements";
import { syncLeadScheduleNodes } from "./sync-lead-schedules";
import { syncDisclosureNoteNodes } from "./sync-notes";
import { createLogger } from "@/lib/observability/logger";

const logger = createLogger({ product: "auditos", action: "sync-orchestrator" });

export async function syncReportingGraphForEngagement(
  engagementId: string,
  trigger: "tb_upload" | "mapping" | "fs_rebuild" | "manual" = "manual",
): Promise<{ nodeCount: number; edgeCount: number } | null> {
  if (!isReportingGraphEnabled()) return null;

  const graph = await ensureReportingGraph(engagementId);
  await clearReportingGraphContent(graph.id);

  const nodeIdByEntity = new Map<string, string>();
  let edgeCount = 0;

  const registerNode = async (
    nodeType: string,
    entityType: string,
    entityId: string,
    label: string,
    metadata?: Record<string, unknown>,
  ) => {
    const node = await upsertGraphNode({
      graphId: graph.id,
      nodeType,
      entityType,
      entityId,
      label,
      metadata,
    });
    nodeIdByEntity.set(`${entityType}:${entityId}`, node.id);
    return node.id;
  };

  const link = async (
    edgeType: string,
    sourceKey: string,
    targetKey: string,
  ) => {
    const sourceNodeId = nodeIdByEntity.get(sourceKey);
    const targetNodeId = nodeIdByEntity.get(targetKey);
    if (!sourceNodeId || !targetNodeId) return;
    await upsertGraphEdge({
      graphId: graph.id,
      edgeType,
      sourceNodeId,
      targetNodeId,
    });
    edgeCount += 1;
  };

  const tbByCode = await syncTrialBalanceNodes(engagementId, registerNode);
  await syncMappingNodes(engagementId, registerNode, link, tbByCode);
  const statements = await syncStatementNodes(engagementId, registerNode, link);
  await syncLeadScheduleNodes(engagementId, registerNode, link);
  await syncDisclosureNoteNodes(engagementId, registerNode, link, statements);

  const nodeCount = nodeIdByEntity.size;
  await bumpReportingGraphVersion(graph.id);
  await logGraphSync(engagementId, "reporting_graph.synced", {
    trigger,
    nodeCount,
    edgeCount,
    version: graph.version + 1,
  });

  return { nodeCount, edgeCount };
}

export async function maybeSyncReportingGraphAfterTbUpload(
  engagementId: string,
): Promise<void> {
  try {
    await syncReportingGraphForEngagement(engagementId, "tb_upload");
  } catch (err) {
    logger.error(`[ReportingGraph] TB upload sync failed for ${engagementId}`, err instanceof Error ? err : new Error(String(err)));
  }
}

export async function maybeSyncReportingGraphAfterFsRebuild(
  engagementId: string,
): Promise<void> {
  try {
    await syncReportingGraphForEngagement(engagementId, "fs_rebuild");
  } catch (err) {
    logger.error(`[ReportingGraph] FS rebuild sync failed for ${engagementId}`, err instanceof Error ? err : new Error(String(err)));
  }
}
