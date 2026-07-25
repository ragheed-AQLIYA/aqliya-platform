export { industryRefId } from "./ids";

// v0.2 archived re-exports — match test import expectations

// Graph loading
export { buildOrgKnowledgeGraph, loadKnowledgeGraph } from "./loaders";

// Core traversal
export {
  getNode,
  getNodesByType,
  getNodesByKind,
  getOutgoingEdges,
  getEdgesForNode,
  getNeighbors,
  findNodesBySourceId,
  queryEdges,
  summarizeGraph,
} from "./traversal";

// Subgraph extraction
export {
  getIndustrySubgraph,
  getIndustryCluster,
  getAccountSubgraph,
  getProofUsagePaths,
  getProofUsageNetwork,
  listFindingsForOpportunity,
} from "./subgraph";

// Commercial graph layer
export {
  COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_EN,
  COMMERCIAL_KNOWLEDGE_GRAPH_DISCLAIMER_AR,
  COMMERCIAL_KNOWLEDGE_GRAPH_WAVE_C_LABEL,
  resolveCommercialKnowledgeGraph,
  readKnowledgeGraphSnapshot,
  buildCommercialKnowledgeGraphFromSnapshot,
  getTopRelationships,
  buildCommercialKnowledgeGraphSnapshot,
  buildCommercialKnowledgeGraphView,
  getAccountKnowledgeSubgraph,
  getIndustryKnowledgeSubgraph,
  getProofKnowledgeSubgraph,
} from "./commercial";

// Re-exports from other modules
export {
  buildKnowledgeGraphFromSnapshot,
  buildKnowledgeGraphFromStore,
} from "./builder";

export { readKnowledgeGraphStoreSnapshot } from "./store-reader";

// Types
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

export type CommercialKnowledgeGraph = import("./types").KnowledgeGraph;
export type { KnowledgeGraphStoreSnapshot } from "./store-reader";

export type {
  KnowledgeGraphRelationshipPattern,
  CommercialKnowledgeGraphSnapshot,
  SubgraphResult,
} from "./commercial";
