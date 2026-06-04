/**
 * Intelligence Core RAG — public exports for all products.
 * Consume via orchestrator or call retrieveGovernedContext directly (server-only).
 */

export {
  retrieveGovernedContext,
  formatGovernedRAGForPrompt,
  toGovernedRAGPayload,
  type GovernedRAGContext,
  type RAGEvidenceRef,
  type RAGRankingMetrics,
} from "./intelligence-core-rag"

export {
  buildRankingMetrics,
  buildEvidenceRefs,
  parseGovernanceFromChunkMetadata,
  type RAGGovernanceMetadata,
} from "./governed-rag-metrics"

export { embedAndStore, deleteDocumentEmbeddings } from "./embedding-service"
export { searchChunks, retrieveContext, formatRAGContext } from "./rag-retriever"
export { buildChunkGovernanceMetadata } from "./governance-metadata"
export { isPgVectorAvailable, verifyDocumentChunkTable } from "./vector-store"
export { getRagEmbeddingProvider, setRagEmbeddingProvider } from "./embedding-provider"
export { hybridSearchChunks, type HybridRetrievalMode } from "./hybrid-search"
export {
  ingestKnowledgeDocument,
  searchKnowledge,
  getKnowledgeDocumentMetadata,
  deleteKnowledgeDocument,
  resolveKnowledgeOrganizationId,
} from "./knowledge-service"
