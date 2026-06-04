import "server-only"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import type { EmbeddingProvider, SearchResult, RAGContext } from "@/lib/ai/types"
import { setRagEmbeddingProvider } from "./embedding-provider"
import { hybridSearchChunks } from "./hybrid-search"

/** @deprecated Use setRagEmbeddingProvider from embedding-provider.ts */
export function setEmbeddingProvider(provider: EmbeddingProvider): void {
  setRagEmbeddingProvider(provider)
}

export interface SearchOptions {
  organizationId?: string
  limit?: number
  minSimilarity?: number
  documentId?: string
}

export async function searchChunks(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const limit = options.limit ?? 10
  const minSimilarity = options.minSimilarity ?? 0.0
  const orgId = options.organizationId

  const hybrid = await hybridSearchChunks(query, { ...options, limit, minSimilarity })
  const results = hybrid.results

  const topSimilarity = results[0]?.similarity ?? null
  const avgSimilarity =
    results.length > 0
      ? results.reduce((s, r) => s + r.similarity, 0) / results.length
      : null

  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "rag_search",
    platformOrganizationId: orgId,
    severity: "info",
    status: "recorded",
    sourceSystem: "rag_retriever",
    metadata: {
      query,
      resultCount: results.length,
      retrievalMode: hybrid.mode,
      vectorCount: hybrid.vectorCount,
      lexicalCount: hybrid.lexicalCount,
      limit,
      minSimilarity,
      documentId: options.documentId,
      ranking: {
        topSimilarity,
        avgSimilarity,
        minSimilarityApplied: minSimilarity,
      },
      evidenceChunkIds: results.map((r) => r.chunkId),
      evidenceDocumentIds: [...new Set(results.map((r) => r.documentId))],
    },
  })

  return results
}

export async function retrieveContext(
  query: string,
  options: SearchOptions = {},
): Promise<RAGContext> {
  const chunks = await searchChunks(query, options)

  return {
    chunks,
    query,
    organizationId: options.organizationId,
  }
}

export function formatRAGContext(context: RAGContext): string {
  if (context.chunks.length === 0) return ""

  return context.chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] (relevance: ${(c.similarity * 100).toFixed(1)}%)\n${c.content}`,
    )
    .join("\n\n---\n\n")
}
