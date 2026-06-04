/**
 * Pure governed RAG metrics (no server-only) — safe for CLI smoke and unit tests.
 */

import type { SearchResult } from "@/lib/ai/types"

export type RAGSensitivity = "public" | "internal" | "confidential" | "restricted"

export interface RAGGovernanceMetadata {
  productKey?: string
  sourceDocumentId?: string
  sourceType?: string
  sensitivity: RAGSensitivity
  retentionDays?: number
  ingestedAt?: string
}

export interface RAGEvidenceRef {
  chunkId: string
  documentId: string
  similarity: number
  rank: number
  contentPreview: string
  governance: RAGGovernanceMetadata
}

export interface RAGRankingMetrics {
  resultCount: number
  topSimilarity: number | null
  minSimilarityApplied: number
  avgSimilarity: number | null
}

function parseSensitivity(value: unknown): RAGSensitivity {
  if (
    value === "public" ||
    value === "internal" ||
    value === "confidential" ||
    value === "restricted"
  ) {
    return value
  }
  return "internal"
}

export function parseGovernanceFromChunkMetadata(
  metadata: Record<string, unknown> | null | undefined,
): RAGGovernanceMetadata {
  const raw = metadata?.governance
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const g = raw as Record<string, unknown>
    return {
      productKey: typeof g.productKey === "string" ? g.productKey : undefined,
      sourceDocumentId: typeof g.sourceDocumentId === "string" ? g.sourceDocumentId : undefined,
      sourceType: typeof g.sourceType === "string" ? g.sourceType : undefined,
      sensitivity: parseSensitivity(g.sensitivity),
      retentionDays: typeof g.retentionDays === "number" ? g.retentionDays : undefined,
      ingestedAt: typeof g.ingestedAt === "string" ? g.ingestedAt : undefined,
    }
  }
  return { sensitivity: "internal" }
}

export function buildRankingMetrics(
  chunks: SearchResult[],
  minSimilarity: number,
): RAGRankingMetrics {
  if (chunks.length === 0) {
    return {
      resultCount: 0,
      topSimilarity: null,
      minSimilarityApplied: minSimilarity,
      avgSimilarity: null,
    }
  }
  const scores = chunks.map((c) => c.similarity)
  const sum = scores.reduce((a, b) => a + b, 0)
  return {
    resultCount: chunks.length,
    topSimilarity: scores[0] ?? null,
    minSimilarityApplied: minSimilarity,
    avgSimilarity: sum / scores.length,
  }
}

export function buildEvidenceRefs(chunks: SearchResult[]): RAGEvidenceRef[] {
  return chunks.map((c, index) => ({
    chunkId: c.chunkId,
    documentId: c.documentId,
    similarity: c.similarity,
    rank: index + 1,
    contentPreview: c.content.slice(0, 200),
    governance: parseGovernanceFromChunkMetadata(c.metadata),
  }))
}
