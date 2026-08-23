/**
 * RAG integration for LocalContentOS.
 * Provides IFRS knowledge context for local content classification.
 */

export interface LocalContentRagContext {
  relevantStandards: string[]
  citations: Array<{
    standardCode: string
    paragraphRef: string
    contentPreview: string
    relevance: number
  }>
}

/**
 * Search IFRS knowledge relevant to a local content classification task.
 */
export async function searchLocalContentRelevantStandards(
  classification: string,
  industry: string,
): Promise<LocalContentRagContext> {
  try {
    const { searchIfrsKnowledge, formatIfrsCitations } = await import(
      "@/lib/core/knowledge/rag/ifrs-search"
    )

    const query = `local content classification ${classification} ${industry} procurement spending`
    const results = await searchIfrsKnowledge(query, {
      limit: 3,
      minSimilarity: 0.3,
    })

    const citations = formatIfrsCitations(results)
    const relevantStandards = [...new Set(citations.map((c) => c.standardCode))]

    return { relevantStandards, citations }
  } catch {
    return { relevantStandards: [], citations: [] }
  }
}
