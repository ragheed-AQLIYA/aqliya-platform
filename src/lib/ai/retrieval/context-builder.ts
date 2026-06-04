import "server-only"
import { findSimilarChunks, type SearchResult, type SearchOptions } from "./similarity-search"

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function formatContext(chunks: SearchResult[]): string {
  if (chunks.length === 0) return ""

  return chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}] (relevance: ${(c.score * 100).toFixed(1)}%${c.documentTitle ? `, document: ${c.documentTitle}` : ""})\n${c.content}`,
    )
    .join("\n\n---\n\n")
}

export function formatContextWithEvidence(chunks: SearchResult[]): {
  context: string
  evidence: Array<{ chunkId: string; documentId: string; score: number }>
} {
  const evidence = chunks.map((c) => ({
    chunkId: c.chunkId,
    documentId: c.documentId,
    score: c.score,
  }))

  return {
    context: formatContext(chunks),
    evidence,
  }
}

export interface ContextBuildResult {
  context: string
  evidence: Array<{ chunkId: string; documentId: string; score: number }>
  chunks: SearchResult[]
  totalTokens: number
  truncated: boolean
}

export async function buildContext(
  query: string,
  maxTokens: number = 3000,
  options: SearchOptions = {},
): Promise<ContextBuildResult> {
  const chunks = await findSimilarChunks(query, options)

  if (chunks.length === 0) {
    return { context: "", evidence: [], chunks: [], totalTokens: 0, truncated: false }
  }

  let totalTokens = 0
  let truncated = false
  const includedChunks: SearchResult[] = []

  for (const chunk of chunks) {
    const tokens = estimateTokens(chunk.content)
    if (totalTokens + tokens > maxTokens) {
      truncated = true
      break
    }
    totalTokens += tokens
    includedChunks.push(chunk)
  }

  const { context, evidence } = formatContextWithEvidence(includedChunks)

  return {
    context,
    evidence,
    chunks: includedChunks,
    totalTokens,
    truncated,
  }
}
