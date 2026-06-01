import {
  buildCommercialKnowledgeGraphFromSnapshot,
  buildCommercialKnowledgeGraphSnapshot,
  buildCommercialKnowledgeGraphView,
  getAccountKnowledgeSubgraph,
  getIndustryKnowledgeSubgraph,
  getProofKnowledgeSubgraph,
  getTopRelationships,
  industryRefId,
  resolveCommercialKnowledgeGraph,
  readKnowledgeGraphSnapshot,
  type CommercialKnowledgeGraph,
  type CommercialKnowledgeGraphSnapshot,
  type KnowledgeGraphRelationshipPattern,
  type KnowledgeGraphStoreSnapshot,
  type SubgraphResult,
} from "../vnext/commercial-knowledge-graph";

export type {
  CommercialKnowledgeGraph,
  CommercialKnowledgeGraphSnapshot,
  KnowledgeGraphRelationshipPattern,
  KnowledgeGraphStoreSnapshot,
  SubgraphResult,
};

export {
  COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN,
  COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_AR,
  COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL,
} from "../vnext/commercial-knowledge-graph";

export function salesReadKnowledgeGraphSnapshot(
  organizationId: string,
): KnowledgeGraphStoreSnapshot {
  return readKnowledgeGraphSnapshot(organizationId);
}

export function salesBuildCommercialKnowledgeGraph(
  organizationId: string,
): CommercialKnowledgeGraph {
  return resolveCommercialKnowledgeGraph(organizationId);
}

export function salesGetCommercialKnowledgeGraphSnapshot(
  organizationId: string,
  topRelationshipLimit = 10,
): CommercialKnowledgeGraphSnapshot {
  const graph = salesBuildCommercialKnowledgeGraph(organizationId);
  return buildCommercialKnowledgeGraphSnapshot(graph, topRelationshipLimit);
}

export function salesGetCommercialKnowledgeGraphView(
  organizationId: string,
  topRelationshipLimit = 10,
): {
  graph: CommercialKnowledgeGraph;
  snapshot: CommercialKnowledgeGraphSnapshot;
} {
  return buildCommercialKnowledgeGraphView(
    organizationId,
    topRelationshipLimit,
  );
}

export function salesGetTopKnowledgeRelationships(
  organizationId: string,
  limit = 10,
): KnowledgeGraphRelationshipPattern[] {
  return getTopRelationships(
    salesBuildCommercialKnowledgeGraph(organizationId),
    limit,
  );
}

export function salesGetAccountKnowledgeSubgraph(
  organizationId: string,
  accountRefId: string,
): SubgraphResult | undefined {
  const graph = salesBuildCommercialKnowledgeGraph(organizationId);
  return getAccountKnowledgeSubgraph(graph, accountRefId);
}

export function salesGetIndustryKnowledgeSubgraph(
  organizationId: string,
  industryLabel: string,
): SubgraphResult | undefined {
  const graph = salesBuildCommercialKnowledgeGraph(organizationId);
  return getIndustryKnowledgeSubgraph(graph, industryRefId(industryLabel));
}

export function salesGetProofKnowledgeSubgraph(
  organizationId: string,
  proofRefId: string,
): SubgraphResult | undefined {
  const graph = salesBuildCommercialKnowledgeGraph(organizationId);
  return getProofKnowledgeSubgraph(graph, proofRefId);
}
