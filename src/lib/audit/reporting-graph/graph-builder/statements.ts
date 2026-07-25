import type {
  GraphBuildInput,
  ReportingGraphEdge,
  ReportingGraphNode,
} from "../types";
import { edgeId } from "./common";

export function addStatementNodes(
  input: GraphBuildInput,
  engId: string,
  nodes: ReportingGraphNode[],
  edges: ReportingGraphEdge[],
  nodeIds: Set<string>,
): void {
  for (const stmt of input.statements) {
    const stmtNodeId = `fs-${stmt.id}`;
    nodeIds.add(stmtNodeId);
    nodes.push({
      id: stmtNodeId,
      nodeType: "fs_statement",
      label: stmt.title,
      layer: 4,
      entityId: stmt.id,
      metadata: {
        statementType: stmt.statementType,
        status: stmt.status,
      },
    });
    edges.push({
      id: edgeId(engId, stmtNodeId, "fs"),
      edgeType: "flows_to",
      sourceId: engId,
      targetId: stmtNodeId,
    });

    for (const line of stmt.lines) {
      const lineNodeId = `fsl-${line.id}`;
      nodeIds.add(lineNodeId);
      nodes.push({
        id: lineNodeId,
        nodeType: "fs_line",
        label: line.label,
        layer: 5,
        entityId: line.id,
        metadata: {
          amount: line.amount,
          isTotal: line.isTotal,
          statementId: stmt.id,
        },
      });
      edges.push({
        id: edgeId(stmtNodeId, lineNodeId, "roll"),
        edgeType: "rolls_into",
        sourceId: stmtNodeId,
        targetId: lineNodeId,
      });

      for (const mappingId of line.linkedAccountMappings) {
        const mapNodeId = `map-${mappingId}`;
        if (nodeIds.has(mapNodeId)) {
          edges.push({
            id: edgeId(mapNodeId, lineNodeId, "roll"),
            edgeType: "rolls_into",
            sourceId: mapNodeId,
            targetId: lineNodeId,
          });
        }
      }
    }
  }
}
