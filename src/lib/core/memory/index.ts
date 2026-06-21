/**
 * Institutional Memory Engine facade — unifies platform institutional memory
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
} from "@/lib/platform/institutional-memory";

export type {
  CollectionInput,
  CreateEdgeInput,
  CreateNodeInput,
  IngestDocumentInput,
  MemoryStats,
  SearchMemoryInput,
} from "@/lib/platform/institutional-memory";

// Unified AI memory — queries, insights, entity/relation CRUD
// Merged from src/lib/ai/memory/institutional-memory.ts (IC-P1-06)
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
