import { loadKnowledgeGraph, getAccountSubgraph, getProofUsagePaths, getIndustryCluster, readKnowledgeGraphStoreSnapshot, buildKnowledgeGraphFromSnapshot, type KnowledgeGraph } from "../v02/knowledge-graph";

export type CommercialKnowledgeGraph = KnowledgeGraph;
export type { KnowledgeGraphStoreSnapshot } from "../v02/knowledge-graph/store-reader";

export function industryRefId(industryLabel: string): string {
  return industryLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function resolveCommercialKnowledgeGraph(organizationId: string): KnowledgeGraph {
  return loadKnowledgeGraph(organizationId);
}

export function readKnowledgeGraphSnapshot(organizationId: string) {
  return readKnowledgeGraphStoreSnapshot(organizationId);
}

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
