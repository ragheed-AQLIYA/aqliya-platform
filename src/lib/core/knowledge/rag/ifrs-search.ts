import type { SearchResult } from "@/lib/core/ai/types"
import type { RagRateLimitPurpose } from "./rag-rate-limiter"

export interface IfrsSearchOptions {
  organizationId?: string
  standardCode?: string
  topic?: string
  limit?: number
  minSimilarity?: number
  /** Rate-limit purpose — "enrich" for engine/batch callers, "interactive" (default) for humans. */
  purpose?: RagRateLimitPurpose
}

/**
 * Enhanced IFRS search with metadata filtering.
 * Combines vector similarity search with standard code and topic filtering.
 */
export async function searchIfrsKnowledge(
  query: string,
  options: IfrsSearchOptions = {},
): Promise<SearchResult[]> {
  try {
    const { searchChunks } = await import("./rag-retriever")

    const rawResults = await searchChunks(query, {
      organizationId: options.organizationId ?? "platform",
      limit: (options.limit ?? 3) * 3,
      minSimilarity: options.minSimilarity ?? 0.2,
      purpose: options.purpose,
    })

    let filtered = rawResults

    if (options.standardCode) {
      const code = options.standardCode.toUpperCase()
      filtered = filtered.filter((r) => {
        const docId = (r.documentId ?? "").toUpperCase()
        const metaCode = ((r.metadata?.standardCode as string) ?? "").toUpperCase()
        return docId.includes(code.replace(/\s+/g, "-")) || metaCode === code
      })
    }

    if (options.topic) {
      const topic = options.topic.toLowerCase()
      filtered = filtered.filter((r) => {
        const content = (r.content ?? "").toLowerCase()
        return content.includes(`| ${topic}]`) || content.includes(`| ${topic} `)
      })
    }

    const reranked = filtered
      .map((r) => {
        let boost = 0
        if (options.standardCode) {
          const metaCode = ((r.metadata?.standardCode as string) ?? "").toUpperCase()
          if (metaCode === options.standardCode.toUpperCase()) {
            boost += 0.1
          }
        }
        if (options.topic) {
          if (r.content.toLowerCase().includes(`| ${options.topic.toLowerCase()}`)) {
            boost += 0.05
          }
        }
        return { ...r, adjustedSimilarity: r.similarity + boost }
      })
      .sort((a, b) => b.adjustedSimilarity - a.adjustedSimilarity)
      .slice(0, options.limit ?? 3)

    return reranked.map(({ adjustedSimilarity, ...r }) => ({
      ...r,
      similarity: adjustedSimilarity,
    }))
  } catch {
    return []
  }
}

/**
 * Build a targeted search query from an IFRS rule.
 */
export function buildIfrsQuery(
  standardCode: string,
  paragraphReference: string,
  topic: string,
  ruleText: string,
): string {
  return `${standardCode} ${paragraphReference} ${topic} ${ruleText.slice(0, 200)}`
}

/**
 * Format search results for citation display.
 */
export function formatIfrsCitations(
  results: SearchResult[],
): Array<{
  chunkId: string
  documentId: string
  standardCode: string
  paragraphRef: string
  contentPreview: string
  relevance: number
  sourceUrl?: string
}> {
  return results.map((r) => ({
    chunkId: r.chunkId,
    documentId: r.documentId,
    standardCode: (r.metadata?.standardCode as string) ?? "",
    paragraphRef: (r.metadata?.paragraphRef as string) ?? "",
    contentPreview: r.content.slice(0, 300),
    relevance: r.similarity,
    sourceUrl: r.metadata?.sourceUrl as string | undefined,
  }))
}
