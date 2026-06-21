import "server-only"

/**
 * IC-01 — Intelligence Core RAG (product-agnostic entry point).
 * All products consume governed retrieval via this module.
 *
 * Chain: retrieval → ranking → evidence → governance metadata → auditability
 */

import { searchChunks, formatRAGContext, type SearchOptions } from "./rag-retriever"
import type { RAGContext, SearchResult } from "@/lib/ai/types"
import {
  buildEvidenceRefs,
  buildRankingMetrics,
  type RAGEvidenceRef,
  type RAGRankingMetrics,
  type RAGGovernanceMetadata,
} from "./governed-rag-metrics"

export type { RAGEvidenceRef, RAGRankingMetrics, RAGGovernanceMetadata }
export { buildEvidenceRefs, buildRankingMetrics }

export interface GovernedRAGContext extends RAGContext {
  evidence: RAGEvidenceRef[]
  ranking: RAGRankingMetrics
  governanceSummary: {
    productKeys: string[]
    sensitivities: string[]
  }
  retrievedAt: string
}

export function summarizeGovernance(evidence: RAGEvidenceRef[]): GovernedRAGContext["governanceSummary"] {
  const productKeys = new Set<string>()
  const sensitivities = new Set<string>()
  for (const e of evidence) {
    if (e.governance.productKey) productKeys.add(e.governance.productKey)
    sensitivities.add(e.governance.sensitivity)
  }
  return {
    productKeys: [...productKeys],
    sensitivities: [...sensitivities],
  }
}

/** Governed retrieval — use from orchestrator and future product adapters. */
export async function retrieveGovernedContext(
  query: string,
  options: SearchOptions = {},
): Promise<GovernedRAGContext> {
  const minSimilarity = options.minSimilarity ?? 0.0
  const chunks = await searchChunks(query, options)
  const evidence = buildEvidenceRefs(chunks)
  const ranking = buildRankingMetrics(chunks, minSimilarity)

  return {
    chunks,
    query,
    organizationId: options.organizationId,
    evidence,
    ranking,
    governanceSummary: summarizeGovernance(evidence),
    retrievedAt: new Date().toISOString(),
  }
}

export function formatGovernedRAGForPrompt(ctx: GovernedRAGContext): string {
  const body = formatRAGContext(ctx)
  if (!body) return ""

  const evidenceLine = ctx.evidence
    .map((e) => `[${e.rank}] chunk=${e.chunkId} doc=${e.documentId} sim=${(e.similarity * 100).toFixed(1)}%`)
    .join("; ")

  return `${body}\n\n[Evidence refs] ${evidenceLine}\n[Ranking] count=${ctx.ranking.resultCount} top=${ctx.ranking.topSimilarity?.toFixed(3) ?? "n/a"} min=${ctx.ranking.minSimilarityApplied}`
}

/** Serializable payload for taskInput / API responses (all products). */
export function toGovernedRAGPayload(ctx: GovernedRAGContext): Record<string, unknown> {
  return {
    query: ctx.query,
    organizationId: ctx.organizationId,
    retrievedAt: ctx.retrievedAt,
    ranking: ctx.ranking,
    evidence: ctx.evidence.map((e) => ({
      chunkId: e.chunkId,
      documentId: e.documentId,
      similarity: e.similarity,
      rank: e.rank,
      governance: e.governance,
    })),
    governanceSummary: ctx.governanceSummary,
    contextPreview: formatRAGContext(ctx).slice(0, 4000),
  }
}
