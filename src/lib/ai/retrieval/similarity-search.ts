import "server-only"
import { prisma } from "@/lib/prisma"
import { getDefaultEmbeddingProvider } from "@/lib/ai/embedding/embedding-provider"
import { isPgvectorAvailable } from "@/lib/platform/pgvector-compat"

export interface SearchOptions {
  k?: number
  minScore?: number
  engagementId?: string
  documentId?: string
  organizationId?: string
}

export interface SearchResult {
  chunkId: string
  documentId: string
  content: string
  chunkIndex: number
  tokenCount: number | null
  metadata: Record<string, unknown> | null
  score: number
  documentTitle?: string
  createdAt: Date
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

async function searchPgvector(
  queryEmbedding: number[],
  options: Required<SearchOptions>,
): Promise<SearchResult[]> {
  const conditions: string[] = ['"embedding" IS NOT NULL']
  const params: unknown[] = []
  let paramIdx = 1

  if (options.organizationId) {
    conditions.push(`"organizationId" = $${paramIdx++}`)
    params.push(options.organizationId)
  }
  if (options.documentId) {
    conditions.push(`"documentId" = $${paramIdx++}`)
    params.push(options.documentId)
  }

  const whereClause = conditions.join(" AND ")
  const vectorStr = JSON.stringify(queryEmbedding)
  const vectorParam = `$${paramIdx}`

  const sql = `
    SELECT id, "documentId", content, "chunkIndex", "tokenCount", metadata, "createdAt",
           1 - (embedding <=> ${vectorParam}::vector) AS score
    FROM "DocumentChunk"
    WHERE ${whereClause}
      AND 1 - (embedding <=> ${vectorParam}::vector) >= ${options.minScore}
    ORDER BY embedding <=> ${vectorParam}::vector
    LIMIT ${options.k}
  `

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string
    documentId: string
    content: string
    chunkIndex: number
    tokenCount: number | null
    metadata: unknown
    createdAt: Date
    score: number
  }>>(sql, ...params, vectorStr)

  return rows.map((r) => ({
    chunkId: r.id,
    documentId: r.documentId,
    content: r.content,
    chunkIndex: r.chunkIndex,
    tokenCount: r.tokenCount,
    metadata: (r.metadata ?? {}) as Record<string, unknown>,
    score: r.score,
    createdAt: r.createdAt,
  }))
}

async function searchJsonFallback(
  queryEmbedding: number[],
  options: Required<SearchOptions>,
): Promise<SearchResult[]> {
  const where: Record<string, unknown> = { embeddingJson: { not: null } }
  if (options.organizationId) where.organizationId = options.organizationId
  if (options.documentId) where.documentId = options.documentId

  const chunks = await prisma.documentChunk.findMany({
    where: where as never,
    select: {
      id: true,
      documentId: true,
      content: true,
      chunkIndex: true,
      tokenCount: true,
      metadata: true,
      embeddingJson: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const scored: SearchResult[] = []

  for (const c of chunks) {
    const embArr = c.embeddingJson as number[] | null
    if (!embArr || !Array.isArray(embArr)) continue

    const score = cosineSimilarity(queryEmbedding, embArr)
    if (score < options.minScore) continue

    scored.push({
      chunkId: c.id,
      documentId: c.documentId,
      content: c.content,
      chunkIndex: c.chunkIndex,
      tokenCount: c.tokenCount,
      metadata: (c.metadata ?? {}) as Record<string, unknown>,
      score,
      createdAt: c.createdAt,
    })
  }

  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, options.k)
}

async function searchLexicalFallback(
  query: string,
  options: Required<SearchOptions>,
): Promise<SearchResult[]> {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 5)

  if (terms.length === 0) return []

  const where: Record<string, unknown> = {}
  if (options.organizationId) where.organizationId = options.organizationId
  if (options.documentId) where.documentId = options.documentId

  const chunks = await prisma.documentChunk.findMany({
    where: {
      ...where,
      OR: terms.map((term) => ({
        content: { contains: term, mode: "insensitive" },
      })),
    } as never,
    select: {
      id: true,
      documentId: true,
      content: true,
      chunkIndex: true,
      tokenCount: true,
      metadata: true,
      createdAt: true,
    },
    take: options.k,
    orderBy: { createdAt: "desc" },
  })

  return chunks.map((c, i) => ({
    chunkId: c.id,
    documentId: c.documentId,
    content: c.content,
    chunkIndex: c.chunkIndex,
    tokenCount: c.tokenCount,
    metadata: (c.metadata ?? {}) as Record<string, unknown>,
    score: Math.max(0.35 - i * 0.02, 0.1),
    createdAt: c.createdAt,
  }))
}

export async function findSimilarChunks(
  query: string,
  options: SearchOptions = {},
): Promise<SearchResult[]> {
  const opts: Required<SearchOptions> = {
    k: options.k ?? 10,
    minScore: options.minScore ?? 0.0,
    engagementId: options.engagementId ?? "",
    documentId: options.documentId ?? "",
    organizationId: options.organizationId ?? "",
  }

  const provider = getDefaultEmbeddingProvider()
  const queryEmbedding = await provider.embed(query)

  const pgvectorAvail = await isPgvectorAvailable()

  let results: SearchResult[] = []

  if (pgvectorAvail) {
    try {
      results = await searchPgvector(queryEmbedding, opts)
    } catch {
      results = []
    }
  }

  if (results.length === 0) {
    try {
      results = await searchJsonFallback(queryEmbedding, opts)
    } catch {
      results = []
    }
  }

  if (results.length === 0) {
    results = await searchLexicalFallback(query, opts)
  }

  return results
}

export { cosineSimilarity }
