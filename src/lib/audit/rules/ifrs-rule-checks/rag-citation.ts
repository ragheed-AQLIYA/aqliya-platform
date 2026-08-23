import type { IfrsKnowledgeRule, IfrsRagCitation } from "@/lib/audit/rules/types"

/**
 * Searches the IFRS knowledge RAG for relevant citations to enrich a rule evaluation.
 * Returns up to 2 most relevant citations, or empty array if RAG is unavailable.
 *
 * Uses enhanced IFRS search with metadata filtering and reranking for higher
 * precision on standard code and topic matching.
 *
 * This function is designed to be called from server-side code only (evaluator, server actions).
 * It gracefully degrades to empty results if the RAG pipeline is unavailable.
 */
export async function searchRagCitations(
  rule: IfrsKnowledgeRule,
  organizationId?: string,
): Promise<IfrsRagCitation[]> {
  try {
    const { searchIfrsKnowledge, buildIfrsQuery, formatIfrsCitations } = await import(
      "@/lib/core/knowledge/rag/ifrs-search"
    )

    const query = buildIfrsQuery(
      rule.standardCode,
      rule.paragraphReference,
      rule.topic,
      rule.ruleText,
    )

    const results = await searchIfrsKnowledge(query, {
      organizationId: organizationId ?? "platform",
      standardCode: rule.standardCode,
      topic: rule.topic,
      limit: 2,
      minSimilarity: 0.3,
      // Engine enrichment runs in batches (48+ rules) — use the wide
      // enrich budget so full engine runs never starve on rate limits.
      purpose: "enrich",
    })

    const citations = formatIfrsCitations(results)

    return citations.map((c) => ({
      ...c,
      standardCode: c.standardCode || rule.standardCode,
      paragraphRef: c.paragraphRef || rule.paragraphReference,
    }))
  } catch {
    // Graceful degradation — RAG is optional enrichment
    return []
  }
}
