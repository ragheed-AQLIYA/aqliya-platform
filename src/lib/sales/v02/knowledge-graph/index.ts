import { buildKnowledgeGraphFromSnapshot } from "./builder";
import { readKnowledgeGraphStoreSnapshot } from "./store-reader";
import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
} from "./types";

export { industryRefId } from "./ids";

// v0.2 archived re-exports — match test import expectations

function _buildKnowledgeGraphFromStoreSnapshot(
  organizationId: string,
): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(
    readKnowledgeGraphStoreSnapshot(organizationId),
  );
}

export function getIndustrySubgraph(
  graph: KnowledgeGraph,
  industryLabel: string,
): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } | null {
  const industryNode = getNodesByType(graph, "industry").find(
    (node) => node.label.toLowerCase() === industryLabel.toLowerCase(),
  );
  if (!industryNode) return null;
  const cluster = getIndustryCluster(graph, industryLabel);
  const edges = graph.edges.filter(
    (e) => cluster.some((n) => n.id === e.from) || cluster.some((n) => n.id === e.to),
  );
  return { nodes: cluster, edges };
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

export function getProofUsageNetwork(
  graph: KnowledgeGraph,
  proofSourceId: string,
): { edges: KnowledgeGraphEdge[] } | null {
  const edges = getProofUsagePaths(graph, proofSourceId);
  return edges.length > 0 ? { edges } : null;
}

export function listFindingsForOpportunity(
  graph: KnowledgeGraph,
  oppId: string,
): KnowledgeGraphNode[] {
  const oppNodeId = `opp:${oppId}`;
  return graph.nodes.filter(
    (n) => n.type === "finding" && getEdgesForNode(graph, oppNodeId, "both").some(
      (e) => e.from === n.id || e.to === n.id,
    ),
  );
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

export function buildOrgKnowledgeGraph(organizationId: string): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(
    readKnowledgeGraphStoreSnapshot(organizationId),
  );
}

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
} from "./types";

export type { KnowledgeGraphStoreSnapshot as KnowledgeGraphSnapshot } from "./store-reader";

export type CommercialKnowledgeGraph = KnowledgeGraph;
export type { KnowledgeGraphStoreSnapshot } from "./store-reader";

export const COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN = "Commercial knowledge graph - derived structure for analytics only. Human review required.";
export const COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_AR = "Commercial knowledge graph - analytics structure only. Human review required.";
export const COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL = "Commercial knowledge graph recommendation";

export interface KnowledgeGraphRelationshipPattern {
  edgeKind: string;
  sourceKind: string;
  targetKind: string;
  count: number;
  sampleEdgeIds: string[];
}

export interface CommercialKnowledgeGraphSnapshot {
  organizationId: string;
  builtAt: string;
  totalNodes: number;
  totalEdges: number;
  nodeCounts: KnowledgeGraph["stats"]["nodeCounts"];
  edgeCounts: KnowledgeGraph["stats"]["edgeCounts"];
  topRelationships: KnowledgeGraphRelationshipPattern[];
  disclaimerEn: string;
  disclaimerAr: string;
  recommendationLabel: typeof COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL;
  outputStatus: "recommendation";
}

export type SubgraphResult = NonNullable<ReturnType<typeof getAccountSubgraph>>;

export function resolveCommercialKnowledgeGraph(organizationId: string): KnowledgeGraph {
  return loadKnowledgeGraph(organizationId);
}

export function readKnowledgeGraphSnapshot(organizationId: string) {
  return readKnowledgeGraphStoreSnapshot(organizationId);
}

export function buildCommercialKnowledgeGraphFromSnapshot(snapshot: Parameters<typeof buildKnowledgeGraphFromSnapshot>[0]): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(snapshot);
}

export function getTopRelationships(graph: KnowledgeGraph, limit = 10): KnowledgeGraphRelationshipPattern[] {
  const buckets = new Map<string, KnowledgeGraphRelationshipPattern & { edgeIds: string[] }>();
  for (const edge of graph.edges) {
    const source = graph.indexes.nodesById.get(edge.from);
    const target = graph.indexes.nodesById.get(edge.to);
    if (!source || !target) continue;
    const key = `${edge.type}|${source.type}|${target.type}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      if (existing.sampleEdgeIds.length < 3) existing.sampleEdgeIds.push(edge.id);
      continue;
    }
    buckets.set(key, { edgeKind: edge.type, sourceKind: source.type, targetKind: target.type, count: 1, sampleEdgeIds: [edge.id], edgeIds: [edge.id] });
  }
  return [...buckets.values()].map(({ edgeIds: _e, ...row }) => row).sort((a, b) => b.count - a.count).slice(0, limit);
}

export function buildCommercialKnowledgeGraphSnapshot(graph: KnowledgeGraph, topRelationshipLimit = 10): CommercialKnowledgeGraphSnapshot {
  return {
    organizationId: graph.organizationId,
    builtAt: graph.builtAt,
    totalNodes: graph.nodes.length,
    totalEdges: graph.edges.length,
    nodeCounts: graph.stats.nodeCounts,
    edgeCounts: graph.stats.edgeCounts,
    topRelationships: getTopRelationships(graph, topRelationshipLimit),
    disclaimerEn: COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN,
    disclaimerAr: COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_AR,
    recommendationLabel: COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL,
    outputStatus: "recommendation",
  };
}

export function buildCommercialKnowledgeGraphView(organizationId: string, topRelationshipLimit = 10) {
  const graph = resolveCommercialKnowledgeGraph(organizationId);
  return { graph, snapshot: buildCommercialKnowledgeGraphSnapshot(graph, topRelationshipLimit) };
}

export function getAccountKnowledgeSubgraph(graph: KnowledgeGraph, accountRefId: string) {
  return getAccountSubgraph(graph, accountRefId) ?? undefined;
}

export function getIndustryKnowledgeSubgraph(graph: KnowledgeGraph, industryRefIdValue: string) {
  const nodes = getIndustryCluster(graph, industryRefIdValue.replace(/-/g, " "));
  if (!nodes.length) return undefined;
  return { account: nodes[0], nodes, edges: [] as KnowledgeGraph["edges"] };
}

export function getProofKnowledgeSubgraph(graph: KnowledgeGraph, proofRefId: string) {
  const edges = getProofUsagePaths(graph, proofRefId);
  if (!edges.length) return undefined;
  return { account: graph.nodes[0], nodes: graph.nodes.filter((n) => edges.some((e) => e.from === n.id || e.to === n.id)), edges };
}
