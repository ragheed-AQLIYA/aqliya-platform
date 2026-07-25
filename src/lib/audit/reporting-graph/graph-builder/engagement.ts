import type { ReportingGraphEdge, ReportingGraphNode } from "../types";
import { edgeId } from "./common";

export function addEngagementNode(
  engagementId: string,
  nodes: ReportingGraphNode[],
  edges: ReportingGraphEdge[],
  nodeIds: Set<string>,
): string {
  const engId = `eng-${engagementId}`;
  if (!nodeIds.has(engId)) {
    nodeIds.add(engId);
    nodes.push({
      id: engId,
      nodeType: "engagement",
      label: "Financial Statement Factory",
      labelAr: "مصنع القوائم المالية",
      layer: 0,
    });
  }
  return engId;
}

export function addTbRootNode(
  engId: string,
  nodes: ReportingGraphNode[],
  edges: ReportingGraphEdge[],
  nodeIds: Set<string>,
): void {
  if (!nodeIds.has("tb-root")) {
    nodeIds.add("tb-root");
    nodes.push({
      id: "tb-root",
      nodeType: "tb_root",
      label: "Trial Balance",
      labelAr: "ميزان المراجعة",
      layer: 1,
    });
    edges.push({
      id: edgeId(engId, "tb-root", "flow"),
      edgeType: "flows_to",
      sourceId: engId,
      targetId: "tb-root",
    });
  }
}
