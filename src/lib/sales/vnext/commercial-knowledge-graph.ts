/**
 * SalesOS vNext - Commercial Knowledge Graph facade (Wave C over v0.2).
 * In-memory graph only - no graph DB, no Prisma.
 */

import "server-only";

import {
  buildKnowledgeGraphFromSnapshot,
  getAccountSubgraph,
  getNode,
  readKnowledgeGraphStoreSnapshot,
} from "../v02/knowledge-graph";
import {
  KG_EDGE_TYPES,
  KG_NODE_TYPES,
} from "../v02/knowledge-graph/types";
import type {
  CommercialKnowledgeGraph,
  KnowledgeGraphEdgeKind,
  KnowledgeGraphNodeKind,
  KnowledgeGraphStoreSnapshot,
  SubgraphResult,
} from "../v02/knowledge-graph";

export const KNOWLEDGE_GRAPH_EDGE_KINDS = KG_EDGE_TYPES;
export const KNOWLEDGE_GRAPH_NODE_KINDS = KG_NODE_TYPES;

export {
  buildKnowledgeGraphFromSnapshot,
  getAccountSubgraph,
  getNode,
  readKnowledgeGraphStoreSnapshot,
};

export type {
  CommercialKnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeKind,
  KnowledgeGraphNode,
  KnowledgeGraphNodeKind,
  KnowledgeGraphStoreSnapshot,
  SubgraphResult,
} from "../v02/knowledge-graph";

export const COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN =
  "Commercial knowledge graph - derived structure for analytics only. Human review required.";

export const COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_AR =
  "Commercial knowledge graph - analytics structure only. Human review required.";

export const COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL =
  "Commercial knowledge graph recommendation";

export interface KnowledgeGraphRelationshipPattern {
  edgeKind: KnowledgeGraphEdgeKind;
  sourceKind: KnowledgeGraphNodeKind;
  targetKind: KnowledgeGraphNodeKind;
  count: number;
  sampleEdgeIds: string[];
}

export interface CommercialKnowledgeGraphSnapshot {
  organizationId: string;
  builtAt: string;
  totalNodes: number;
  totalEdges: number;
  nodeCounts: CommercialKnowledgeGraph["stats"]["nodeCounts"];
  edgeCounts: CommercialKnowledgeGraph["stats"]["edgeCounts"];
  topRelationships: KnowledgeGraphRelationshipPattern[];
  disclaimerEn: string;
  disclaimerAr: string;
  recommendationLabel: typeof COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL;
  outputStatus: "recommendation";
}

export function buildCommercialKnowledgeGraphFromSnapshot(
  snapshot: KnowledgeGraphStoreSnapshot,
): CommercialKnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(snapshot);
}

export function getTopRelationships(
  graph: CommercialKnowledgeGraph,
  limit = 10,
): KnowledgeGraphRelationshipPattern[] {
  const buckets = new Map<
    string,
    KnowledgeGraphRelationshipPattern & { edgeIds: string[] }
  >();

  for (const edge of graph.edges) {
    const source = getNode(graph, edge.sourceId);
    const target = getNode(graph, edge.targetId);
    if (!source || !target) continue;

    const key = `${edge.kind}|${source.kind}|${target.kind}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.count += 1;
      if (existing.edgeIds.length < 3) existing.edgeIds.push(edge.id);
      continue;
    }

    buckets.set(key, {
      edgeKind: edge.kind,
      sourceKind: source.kind,
      targetKind: target.kind,
      count: 1,
      sampleEdgeIds: [edge.id],
      edgeIds: [edge.id],
    });
  }

  return [...buckets.values()]
    .map(({ edgeIds: _edgeIds, ...row }) => row)
    .sort((a, b) => b.count - a.count || a.edgeKind.localeCompare(b.edgeKind))
    .slice(0, limit);
}

export function buildCommercialKnowledgeGraphSnapshot(
  graph: CommercialKnowledgeGraph,
  topRelationshipLimit = 10,
): CommercialKnowledgeGraphSnapshot {
  const summary = summarizeGraph(graph);
  return {
    organizationId: graph.organizationId,
    builtAt: graph.builtAt,
    totalNodes: summary.totalNodes,
    totalEdges: summary.totalEdges,
    nodeCounts: summary.nodeCounts,
    edgeCounts: summary.edgeCounts,
    topRelationships: getTopRelationships(graph, topRelationshipLimit),
    disclaimerEn: COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN,
    disclaimerAr: COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_AR,
    recommendationLabel: COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL,
    outputStatus: "recommendation",
  };
}

export function buildCommercialKnowledgeGraphView(
  organizationId: string,
  topRelationshipLimit = 10,
): {
  graph: CommercialKnowledgeGraph;
  snapshot: CommercialKnowledgeGraphSnapshot;
} {
  const graph = buildOrgKnowledgeGraph(organizationId);
  return {
    graph,
    snapshot: buildCommercialKnowledgeGraphSnapshot(graph, topRelationshipLimit),
  };
}

export function getAccountKnowledgeSubgraph(
  graph: CommercialKnowledgeGraph,
  accountRefId: string,
): SubgraphResult | undefined {
  return getAccountSubgraph(graph, accountRefId);
}

export function getIndustryKnowledgeSubgraph(
  graph: CommercialKnowledgeGraph,
  industryRefIdValue: string,
): SubgraphResult | undefined {
  return getIndustrySubgraph(graph, industryRefIdValue);
}

export function getProofKnowledgeSubgraph(
  graph: CommercialKnowledgeGraph,
  proofRefId: string,
): SubgraphResult | undefined {
  return getProofUsageNetwork(graph, proofRefId);
}
