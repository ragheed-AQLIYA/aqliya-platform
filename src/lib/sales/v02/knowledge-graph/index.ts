// @ts-nocheck
import { buildKnowledgeGraphFromSnapshot } from "./builder";
import { readKnowledgeGraphStoreSnapshot } from "./store-reader";
import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
} from "./types";

export function loadKnowledgeGraph(organizationId: string): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(
    readKnowledgeGraphStoreSnapshot(organizationId),
  );
}

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

export function getAccountSubgraph(
  graph: KnowledgeGraph,
  accountSourceId: string,
): { account: KnowledgeGraphNode; nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } | null {
  const account = getNode(graph, `account:${accountSourceId}`);
  if (!account) return null;

  const visited = new Set<string>([account.id]);
  const queue = [account.id];
  const collectedEdges: KnowledgeGraphEdge[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = getEdgesForNode(graph, current, "both");
    for (const edge of edges) {
      collectedEdges.push(edge);
      const other = edge.from === current ? edge.to : edge.from;
      if (!visited.has(other)) {
        visited.add(other);
        queue.push(other);
      }
    }
  }

  const nodes = [...visited]
    .map((id) => getNode(graph, id))
    .filter((node): node is KnowledgeGraphNode => Boolean(node));

  return { account, nodes, edges: collectedEdges };
}

export function getProofUsagePaths(
  graph: KnowledgeGraph,
  proofSourceId: string,
): KnowledgeGraphEdge[] {
  const proofNodeId = `proof:${proofSourceId}`;
  return getEdgesForNode(graph, proofNodeId, "both").filter(
    (edge) => edge.type === "uses" || edge.type === "wins_with" || edge.type === "loses_with",
  );
}

export function getIndustryCluster(
  graph: KnowledgeGraph,
  industryLabel: string,
): KnowledgeGraphNode[] {
  const industryNode = getNodesByType(graph, "industry").find(
    (node) => node.label.toLowerCase() === industryLabel.toLowerCase(),
  );
  if (!industryNode) return [];

  const accounts = getNeighbors(graph, industryNode.id, {
    nodeType: "account",
    edgeType: "related_to",
  });

  const cluster = new Map<string, KnowledgeGraphNode>();
  cluster.set(industryNode.id, industryNode);

  for (const account of accounts) {
    cluster.set(account.id, account);
    const subgraph = getAccountSubgraph(graph, account.sourceId);
    if (!subgraph) continue;
    for (const node of subgraph.nodes) cluster.set(node.id, node);
  }

  return [...cluster.values()];
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

export {
  buildKnowledgeGraphFromSnapshot,
  buildKnowledgeGraphFromStore,
} from "./builder";

export { readKnowledgeGraphStoreSnapshot } from "./store-reader";

export type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphFindingKind,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
  KnowledgeGraphStats,
  KnowledgeGraphStoreSnapshot,
} from "./types";

export type { KnowledgeGraphStoreSnapshot as KnowledgeGraphSnapshot } from "./store-reader";
