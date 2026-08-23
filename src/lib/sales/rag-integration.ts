/**
 * RAG integration for SalesOS.
 * Provides IFRS knowledge context for revenue recognition and financial reporting.
 */

export interface SalesRagContext {
  relevantStandards: string[]
  citations: Array<{
    standardCode: string
    paragraphRef: string
    contentPreview: string
    relevance: number
  }>
}

/**
 * Search IFRS knowledge relevant to sales/revenue scenarios.
 */
export async function searchSalesRelevantStandards(
  scenario: string,
  productType: string,
): Promise<SalesRagContext> {
  try {
    const { searchIfrsKnowledge, formatIfrsCitations } = await import(
      "@/lib/core/knowledge/rag/ifrs-search"
    )

    const query = `revenue recognition sales ${scenario} ${productType}`
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
