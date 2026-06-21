/**
 * Knowledge Engine facade — governed RAG + knowledge document service.
 * IC-P1-04: KnowledgeEngine.retrieve() wraps retrieveGovernedContext.
 */
export {
  buildChunkGovernanceMetadata,
  buildEvidenceRefs,
  buildRankingMetrics,
  deleteDocumentEmbeddings,
  deleteKnowledgeDocument,
  embedAndStore,
  formatGovernedRAGForPrompt,
  formatRAGContext,
  getKnowledgeDocumentMetadata,
  getRagEmbeddingProvider,
  hybridSearchChunks,
  ingestKnowledgeDocument,
  isPgVectorAvailable,
  parseGovernanceFromChunkMetadata,
  resolveKnowledgeOrganizationId,
  retrieveContext,
  retrieveGovernedContext,
  searchChunks,
  searchKnowledge,
  setRagEmbeddingProvider,
  toGovernedRAGPayload,
  verifyDocumentChunkTable,
} from "@/lib/rag";

export type {
  GovernedRAGContext,
  HybridRetrievalMode,
  RAGEvidenceRef,
  RAGGovernanceMetadata,
  RAGRankingMetrics,
} from "@/lib/rag";

export {
  KnowledgeEngine,
  retrieve,
  type KnowledgeRetrieveInput,
} from "./engine";
