import {
  canonicalizeOpportunityStage,
  type SalesOpportunity,
} from "../../types";
import { graphEdgeId, graphNodeId, industryRefId } from "./ids";
import type {
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphIndexes,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
  KnowledgeGraphStats,
} from "./types";
import {
  KNOWLEDGE_GRAPH_EDGE_KINDS,
  KNOWLEDGE_GRAPH_NODE_KINDS,
} from "./types";

export interface GraphBuilder {
  nodes: Map<string, KnowledgeGraphNode>;
  edges: Map<string, KnowledgeGraphEdge>;
  addNode(node: KnowledgeGraphNode): void;
  addEdge(edge: KnowledgeGraphEdge): void;
}

export function createBuilder(): GraphBuilder {
  const nodes = new Map<string, KnowledgeGraphNode>();
  const edges = new Map<string, KnowledgeGraphEdge>();

  return {
    nodes,
    edges,
    addNode(node) {
      if (!nodes.has(node.id)) nodes.set(node.id, node);
    },
    addEdge(edge) {
      if (!edges.has(edge.id)) edges.set(edge.id, edge);
    },
  };
}

export function emptyStats(): KnowledgeGraphStats {
  const nodeCounts = Object.fromEntries(
    KNOWLEDGE_GRAPH_NODE_KINDS.map((k) => [k, 0]),
  ) as KnowledgeGraphStats["nodeCounts"];
  const edgeCounts = Object.fromEntries(
    KNOWLEDGE_GRAPH_EDGE_KINDS.map((k) => [k, 0]),
  ) as KnowledgeGraphStats["edgeCounts"];
  return { nodeCounts, edgeCounts };
}

export function buildIndexes(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): KnowledgeGraphIndexes {
  const nodesById = new Map<string, KnowledgeGraphNode>();
  const nodesByType = new Map<KnowledgeGraphNodeType, KnowledgeGraphNode[]>();
  const edgesByFrom = new Map<string, KnowledgeGraphEdge[]>();
  const edgesByTo = new Map<string, KnowledgeGraphEdge[]>();

  for (const kind of KNOWLEDGE_GRAPH_NODE_KINDS) {
    nodesByType.set(kind, []);
  }

  for (const node of nodes) {
    nodesById.set(node.id, node);
    nodesByType.get(node.type)!.push(node);
  }

  for (const edge of edges) {
    const out = edgesByFrom.get(edge.from) ?? [];
    out.push(edge);
    edgesByFrom.set(edge.from, out);

    const inn = edgesByTo.get(edge.to) ?? [];
    inn.push(edge);
    edgesByTo.set(edge.to, inn);
  }

  return { nodesById, nodesByType, edgesByFrom, edgesByTo };
}

export function computeStats(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): KnowledgeGraphStats {
  const stats = emptyStats();
  for (const node of nodes) {
    stats.nodeCounts[node.type] += 1;
  }
  for (const edge of edges) {
    stats.edgeCounts[edge.type] += 1;
  }
  return stats;
}

export function isClosedWon(opp: SalesOpportunity): boolean {
  return canonicalizeOpportunityStage(opp.stage) === "closed_won";
}

export function isClosedLost(opp: SalesOpportunity): boolean {
  return canonicalizeOpportunityStage(opp.stage) === "closed_lost";
}

export function ensureIndustryNode(
  builder: GraphBuilder,
  industryLabel: string,
): string | undefined {
  const trimmed = industryLabel.trim();
  if (!trimmed) return undefined;
  const ref = industryRefId(trimmed);
  const id = graphNodeId("industry", ref);
  builder.addNode({
    id,
    type: "industry",
    sourceId: ref,
    label: trimmed,
    meta: { normalized: ref },
  });
  return id;
}

export function link(
  builder: GraphBuilder,
  kind: KnowledgeGraphEdgeType,
  from: string,
  to: string,
  meta?: Record<string, unknown>,
  suffix?: string,
): void {
  builder.addEdge({
    id: graphEdgeId(kind, from, to, suffix),
    type: kind,
    from,
    to,
    meta,
  });
}
