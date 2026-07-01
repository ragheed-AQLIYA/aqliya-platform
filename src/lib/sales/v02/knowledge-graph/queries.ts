import { graphNodeId } from "./ids";
import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
  NeighborQueryOptions,
  SubgraphResult,
} from "./types";

export function getNode(
  graph: KnowledgeGraph,
  nodeId: string,
): KnowledgeGraphNode | undefined {
  return graph.indexes.nodesById.get(nodeId);
}

export function getNodeByRef(
  graph: KnowledgeGraph,
  kind: KnowledgeGraphNodeType,
  refId: string,
): KnowledgeGraphNode | undefined {
  return getNode(graph, graphNodeId(kind, refId));
}

export function getNodesByKind(
  graph: KnowledgeGraph,
  kind: KnowledgeGraphNodeType,
): KnowledgeGraphNode[] {
  return graph.indexes.nodesByType.get(kind) ?? [];
}

export function getOutgoingEdges(
  graph: KnowledgeGraph,
  nodeId: string,
  edgeKind?: KnowledgeGraphEdgeType,
): KnowledgeGraphEdge[] {
  const edges = graph.indexes.edgesByFrom.get(nodeId) ?? [];
  return edgeKind ? edges.filter((e) => e.type === edgeKind) : edges;
}

export function getIncomingEdges(
  graph: KnowledgeGraph,
  nodeId: string,
  edgeKind?: KnowledgeGraphEdgeType,
): KnowledgeGraphEdge[] {
  const edges = graph.indexes.edgesByTo.get(nodeId) ?? [];
  return edgeKind ? edges.filter((e) => e.type === edgeKind) : edges;
}

export function getNeighbors(
  graph: KnowledgeGraph,
  nodeId: string,
  options: NeighborQueryOptions = {},
): KnowledgeGraphNode[] {
  const { edgeKind, direction = "both", nodeKind } = options;
  const neighborIds = new Set<string>();

  if (direction === "out" || direction === "both") {
    for (const edge of getOutgoingEdges(graph, nodeId, edgeKind)) {
      neighborIds.add(edge.to);
    }
  }
  if (direction === "in" || direction === "both") {
    for (const edge of getIncomingEdges(graph, nodeId, edgeKind)) {
      neighborIds.add(edge.from);
    }
  }

  const nodes: KnowledgeGraphNode[] = [];
  for (const id of neighborIds) {
    const node = getNode(graph, id);
    if (!node) continue;
    if (nodeKind && node.type !== nodeKind) continue;
    nodes.push(node);
  }
  return nodes;
}

export function findRelatedNodes(
  graph: KnowledgeGraph,
  startNodeId: string,
  maxDepth = 2,
  edgeKinds?: KnowledgeGraphEdgeType[],
): KnowledgeGraphNode[] {
  const visited = new Set<string>([startNodeId]);
  let frontier = [startNodeId];

  for (let depth = 0; depth < maxDepth; depth++) {
    const next: string[] = [];
    for (const nodeId of frontier) {
      const out = getOutgoingEdges(graph, nodeId);
      const inn = getIncomingEdges(graph, nodeId);
      for (const edge of [...out, ...inn]) {
        if (edgeKinds && !edgeKinds.includes(edge.type)) continue;
        const other =
          edge.from === nodeId ? edge.to : edge.from;
        if (visited.has(other)) continue;
        visited.add(other);
        next.push(other);
      }
    }
    frontier = next;
  }

  return [...visited]
    .filter((id) => id !== startNodeId)
    .map((id) => getNode(graph, id))
    .filter((n): n is KnowledgeGraphNode => n !== undefined);
}

export function getAccountSubgraph(
  graph: KnowledgeGraph,
  accountRefId: string,
): SubgraphResult | undefined {
  const root = getNodeByRef(graph, "account", accountRefId);
  if (!root) return undefined;

  const related = findRelatedNodes(graph, root.id, 2);
  const nodeIds = new Set([root.id, ...related.map((n) => n.id)]);
  const edges = graph.edges.filter(
    (e) => nodeIds.has(e.from) && nodeIds.has(e.to),
  );

  return {
    nodes: [root, ...related],
    edges,
  };
}

export function getIndustrySubgraph(
  graph: KnowledgeGraph,
  industryRefId: string,
): SubgraphResult | undefined {
  const root = getNodeByRef(graph, "industry", industryRefId);
  if (!root) return undefined;

  const related = findRelatedNodes(graph, root.id, 2);
  const nodeIds = new Set([root.id, ...related.map((n) => n.id)]);
  const edges = graph.edges.filter(
    (e) => nodeIds.has(e.from) && nodeIds.has(e.to),
  );

  return {
    nodes: [root, ...related],
    edges,
  };
}
