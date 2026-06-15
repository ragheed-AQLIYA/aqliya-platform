import "server-only";

import {
  REPORTING_GRAPH_EDGE_TYPES,
  REPORTING_GRAPH_NODE_TYPES,
} from "@/lib/audit/reporting-graph/graph-constants";
import { isReportingGraphEnabled } from "@/lib/audit/reporting-graph/graph-sync-service";
import {
  ensureReportingGraph,
  upsertGraphEdge,
  upsertGraphNode,
} from "@/lib/audit/reporting-graph/graph-repository";
import type { ReconciliationRunResult } from "./types";

export async function syncReconciliationToReportingGraph(
  engagementId: string,
  result: ReconciliationRunResult,
): Promise<void> {
  if (!isReportingGraphEnabled()) return;

  const graph = await ensureReportingGraph(engagementId);

  const engNode = await upsertGraphNode({
    graphId: graph.id,
    nodeType: "engagement",
    entityType: "AuditEngagement",
    entityId: engagementId,
    label: "Engagement",
  });

  for (const check of result.checks) {
    const node = await upsertGraphNode({
      graphId: graph.id,
      nodeType: REPORTING_GRAPH_NODE_TYPES.RECONCILIATION_CHECK,
      entityType: "ReconciliationCheck",
      entityId: check.code,
      label: `${check.code} — ${check.passed ? "PASS" : "FAIL"}`,
      metadata: {
        passed: check.passed,
        checkType: check.checkType,
        messageEn: check.messageEn,
      },
    });

    await upsertGraphEdge({
      graphId: graph.id,
      edgeType: REPORTING_GRAPH_EDGE_TYPES.RECONCILES,
      sourceNodeId: engNode.id,
      targetNodeId: node.id,
      metadata: { passed: check.passed },
    });
  }
}
