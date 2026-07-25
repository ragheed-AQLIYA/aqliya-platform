import type {
  GraphBuildInput,
  ReportingGraph,
  ReportingGraphEdge,
  ReportingGraphNode,
  ReportingGraphStats,
} from "../types";
import { addEngagementNode, addTbRootNode } from "./engagement";
import { buildTbIndex } from "./trial-balance";
import { addMappingNodes } from "./mappings";
import { addStatementNodes } from "./statements";
import { addNoteNodes } from "./notes";

export function buildReportingGraph(input: GraphBuildInput): ReportingGraph {
  const nodes: ReportingGraphNode[] = [];
  const edges: ReportingGraphEdge[] = [];
  const nodeIds = new Set<string>();

  const engId = addEngagementNode(input.engagementId, nodes, edges, nodeIds);
  addTbRootNode(engId, nodes, edges, nodeIds);

  const tbByCode = buildTbIndex(input);
  addMappingNodes(input, tbByCode, nodes, edges, nodeIds);
  addStatementNodes(input, engId, nodes, edges, nodeIds);
  addNoteNodes(input, nodes, edges, nodeIds);

  const stats: ReportingGraphStats = {
    tbAccounts: nodes.filter((n) => n.nodeType === "tb_account").length,
    mappings: nodes.filter((n) => n.nodeType === "mapping").length,
    statements: nodes.filter((n) => n.nodeType === "fs_statement").length,
    fsLines: nodes.filter((n) => n.nodeType === "fs_line").length,
    notes: nodes.filter((n) => n.nodeType === "disclosure_note").length,
    edges: edges.length,
  };

  return {
    engagementId: input.engagementId,
    nodes,
    edges,
    stats,
    builtAt: new Date().toISOString(),
    graphVersion: 1,
  };
}
