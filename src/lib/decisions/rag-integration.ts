/**
 * RAG integration for DecisionOS.
 * Provides IFRS knowledge context for decision analysis.
 */

export interface DecisionRagContext {
  relevantStandards: string[]
  citations: Array<{
    standardCode: string
    paragraphRef: string
    contentPreview: string
    relevance: number
  }>
}

/**
 * Search IFRS knowledge relevant to a financial decision.
 */
export async function searchDecisionRelevantStandards(
  decisionType: string,
  description: string,
): Promise<DecisionRagContext> {
  try {
    const { searchIfrsKnowledge, formatIfrsCitations } = await import(
      "@/lib/core/knowledge/rag/ifrs-search"
    )

    const query = `financial decision ${decisionType} ${description}`
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
