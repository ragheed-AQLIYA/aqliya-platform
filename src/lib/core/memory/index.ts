/**
 * Institutional Memory Engine — unifies platform institutional memory
 * (graph, collections, search) and AI memory (queries, insights, entities).
 * IC-P1-06: Memory Engine Consolidation.
 */
export {
  addNodeToCollection,
  createCollection,
  createEdge,
  createNode,
  deleteEdge,
  deleteNode,
  findPath,
  getCollectionNodes,
  getEdge,
  getIngestionStatus,
  getMemoryStats,
  getNode,
  getNodeNeighbors,
  getSubgraph,
  ingestDocument,
  logQuery,
  removeNodeFromCollection,
  searchMemory,
  updateNode,
} from "./institutional-memory-service";

export type {
  CollectionInput,
  CreateEdgeInput,
  CreateNodeInput,
  IngestDocumentInput,
  MemoryStats,
  SearchMemoryInput,
} from "./institutional-memory-service";

// Unified AI memory — queries, insights, entity/relation CRUD
export {
  createEntity,
  createRelation,
  findEntitiesByType,
  getEntityRelations,
  getQueryHistory,
  getRelatedInsights,
  storeInsight,
  storeQuery,
} from "./ai-memory";

export type {
  HistoryOptions,
  QueryRecord,
} from "./ai-memory";
