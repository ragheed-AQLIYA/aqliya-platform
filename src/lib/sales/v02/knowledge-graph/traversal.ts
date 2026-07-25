import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
} from "./types";

export function getNode(
  graph: KnowledgeGraph,
  nodeId: string,
): KnowledgeGraphNode | undefined {
  return graph.indexes.nodesById.get(nodeId);
}

export function getNodesByType(
  graph: KnowledgeGraph,
  type: KnowledgeGraphNodeType,
): KnowledgeGraphNode[] {
  return graph.indexes.nodesByType.get(type) ?? [];
}

export function getNodesByKind(
  graph: KnowledgeGraph,
  kind: KnowledgeGraphNodeType,
): KnowledgeGraphNode[] {
  return getNodesByType(graph, kind);
}

export function getOutgoingEdges(
  graph: KnowledgeGraph,
  nodeId: string,
  edgeType?: KnowledgeGraphEdgeType,
): KnowledgeGraphEdge[] {
  return (graph.indexes.edgesByFrom.get(nodeId) ?? []).filter(
    (e) => !edgeType || e.type === edgeType,
  );
}

export function getEdgesForNode(
  graph: KnowledgeGraph,
  nodeId: string,
  direction: "out" | "in" | "both" = "both",
  edgeType?: KnowledgeGraphEdgeType,
): KnowledgeGraphEdge[] {
  const out =
    direction === "in"
      ? []
      : (graph.indexes.edgesByFrom.get(nodeId) ?? []);
  const incoming =
    direction === "out"
      ? []
      : (graph.indexes.edgesByTo.get(nodeId) ?? []);

  const merged = [...out, ...incoming];
  if (!edgeType) return merged;
  return merged.filter((edge) => edge.type === edgeType);
}

export function getNeighbors(
  graph: KnowledgeGraph,
  nodeId: string,
  options?: {
    edgeType?: KnowledgeGraphEdgeType;
    nodeType?: KnowledgeGraphNodeType;
    direction?: "out" | "in" | "both";
  },
): KnowledgeGraphNode[] {
  const edges = getEdgesForNode(
    graph,
    nodeId,
    options?.direction ?? "both",
    options?.edgeType,
  );
  const neighborIds = new Set<string>();

  for (const edge of edges) {
    if (edge.from === nodeId) neighborIds.add(edge.to);
    if (edge.to === nodeId) neighborIds.add(edge.from);
  }

  const neighbors: KnowledgeGraphNode[] = [];
  for (const id of neighborIds) {
    const node = getNode(graph, id);
    if (!node) continue;
    if (options?.nodeType && node.type !== options.nodeType) continue;
    neighbors.push(node);
  }

  return neighbors;
}

export function findNodesBySourceId(
  graph: KnowledgeGraph,
  sourceId: string,
): KnowledgeGraphNode[] {
  return graph.nodes.filter((node) => node.sourceId === sourceId);
}

export function queryEdges(
  graph: KnowledgeGraph,
  filter: {
    type?: KnowledgeGraphEdgeType;
    fromNodeId?: string;
    toNodeId?: string;
  },
): KnowledgeGraphEdge[] {
  return graph.edges.filter((edge) => {
    if (filter.type && edge.type !== filter.type) return false;
    if (filter.fromNodeId && edge.from !== filter.fromNodeId) return false;
    if (filter.toNodeId && edge.to !== filter.toNodeId) return false;
    return true;
  });
}

export function summarizeGraph(graph: KnowledgeGraph): {
  nodeCounts: Record<string, number>;
  edgeCounts: Record<string, number>;
} {
  const nodeCounts: Record<string, number> = {
    account: 0, opp: 0, proof: 0, signal: 0, content: 0, finding: 0, industry: 0,
  };
  for (const node of graph.nodes) {
    const kind = node.type;
    if (kind in nodeCounts) nodeCounts[kind]++;
    else nodeCounts[kind] = 1;
  }
  return {
    nodeCounts,
    edgeCounts: graph.stats?.edgeCounts ?? {},
  };
}
