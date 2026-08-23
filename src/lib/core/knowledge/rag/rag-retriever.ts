import "server-only"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import type { EmbeddingProvider, SearchResult, RAGContext } from "@/lib/core/ai/types"
import { setRagEmbeddingProvider } from "./embedding-provider"
import { hybridSearchChunks } from "./hybrid-search"
import {
  checkRateLimit,
  getRemainingRequests,
  type RagRateLimitPurpose,
} from "./rag-rate-limiter"
import { cacheKey, getCached, setCached } from "./rag-cache"
import { RagError, wrapRagError, logRagError } from "./rag-errors"
import { recordSearch, recordCacheHit, recordCacheMiss, recordError } from "./rag-metrics"

/** @deprecated Use setRagEmbeddingProvider from embedding-provider.ts */
export function setEmbeddingProvider(provider: EmbeddingProvider): void {
  setRagEmbeddingProvider(provider)
}

export interface SearchOptions {
  organizationId?: string
  limit?: number
  minSimilarity?: number
  documentId?: string
  /**
   * Rate-limit purpose. "interactive" (default) for human-triggered searches;
   * "enrich" for engine/batch enrichment with a wider budget.
   */
  purpose?: RagRateLimitPurpose
}

export async function searchChunks(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const limit = options.limit ?? 10
  const minSimilarity = options.minSimilarity ?? 0.0
  const orgId = options.organizationId ?? "anonymous"
  const purpose: RagRateLimitPurpose = options.purpose ?? "interactive"

  // Cache BEFORE the rate limiter: a cache hit must never consume quota.
  const key = cacheKey(query, { limit, minSimilarity, documentId: options.documentId ?? null, orgId })
  const cached = getCached<SearchResult[]>(key)
  if (cached) {
    recordCacheHit()
    return cached
  }

  recordCacheMiss()

  if (!checkRateLimit(orgId, purpose)) {
    const remaining = getRemainingRequests(orgId, purpose)
    throw new RagError(
      `Rate limit exceeded for organization ${orgId}. Remaining: ${remaining}`,
      "RATE_LIMITED",
      true,
      { organizationId: orgId, purpose, remaining },
    )
  }

  const start = Date.now()
  try {
    const hybrid = await hybridSearchChunks(query, { ...options, limit, minSimilarity })
    const results = hybrid.results
    const latencyMs = Date.now() - start

    setCached(key, results)
    recordSearch(latencyMs, results.length)

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
        latencyMs,
        cached: false,
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
  } catch (err) {
    recordError()
    const ragErr = wrapRagError(err, `searchChunks(query="${query.slice(0, 50)}")`)
    logRagError(ragErr, { query: query.slice(0, 100), organizationId: orgId })
    throw ragErr
  }
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
