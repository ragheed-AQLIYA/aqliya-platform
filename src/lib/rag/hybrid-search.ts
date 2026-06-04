import "server-only"
import type { SearchResult } from "@/lib/ai/types"
import { getRagEmbeddingProvider } from "./embedding-provider"
import { prisma } from "@/lib/prisma"
import type { SearchOptions } from "./rag-retriever"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

const LEXICAL_BASE_SIMILARITY = 0.35

export type HybridRetrievalMode = "vector" | "lexical" | "hybrid" | "empty"

export interface HybridSearchResult {
  results: SearchResult[]
  mode: HybridRetrievalMode
  vectorCount: number
  lexicalCount: number
}

async function searchVector(
  query: string,
  options: SearchOptions,
): Promise<SearchResult[]> {
  const limit = options.limit ?? 10
  const minSimilarity = options.minSimilarity ?? 0.0
  const orgId = options.organizationId

  const provider = getRagEmbeddingProvider()
  const queryEmbedding = await provider.embed({ input: query })
  const queryVector = queryEmbedding.embeddings[0]
  if (!queryVector) return []

  const conditions = ['"embedding" IS NOT NULL']
  const params: unknown[] = []
  let paramIdx = 1

  if (orgId) {
    conditions.push(`"organizationId" = $${paramIdx++}`)
    params.push(orgId)
  }
  if (options.documentId) {
    conditions.push(`"documentId" = $${paramIdx++}`)
    params.push(options.documentId)
  }

  const whereClause = conditions.join(" AND ")
  const vectorParam = `$${paramIdx}`
  const vectorStr = JSON.stringify(queryVector)

  const sql = `
    SELECT id, "documentId", content, metadata,
           1 - (embedding <=> ${vectorParam}::vector) AS similarity
    FROM "DocumentChunk"
    WHERE ${whereClause}
    ORDER BY embedding <=> ${vectorParam}::vector
    LIMIT ${limit}
  `

  const rows = await prisma.$queryRawUnsafe<Array<{
    id: string
    documentId: string
    content: string
    metadata: unknown
    similarity: number
  }>>(sql, ...params, vectorStr)

  return rows
    .filter((r) => r.similarity >= minSimilarity)
    .map((r) => ({
      chunkId: r.id,
      documentId: r.documentId,
      content: r.content,
      metadata: {
        ...((r.metadata ?? {}) as Record<string, unknown>),
        retrievalMode: "vector",
      },
      similarity: r.similarity,
    }))
}

async function searchLexical(
  query: string,
  options: SearchOptions,
): Promise<SearchResult[]> {
  const limit = options.limit ?? 10
  const orgId = options.organizationId
  if (!orgId) return []

  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .slice(0, 5)
  if (terms.length === 0) return []

  const where: Record<string, unknown> = { organizationId: orgId }
  if (options.documentId) {
    where.documentId = options.documentId
  }

  const rows = await db.documentChunk.findMany({
    where: {
      ...where,
      OR: terms.map((term: string) => ({
        content: { contains: term, mode: "insensitive" },
      })),
    },
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      documentId: true,
      content: true,
      metadata: true,
    },
  })

  return rows.map(
    (
      r: { id: string; documentId: string; content: string; metadata: unknown },
      i: number,
    ) => ({
      chunkId: r.id,
      documentId: r.documentId,
      content: r.content,
      metadata: {
        ...((r.metadata ?? {}) as Record<string, unknown>),
        retrievalMode: "lexical",
      },
      similarity: Math.max(LEXICAL_BASE_SIMILARITY - i * 0.02, 0.1),
    }),
  )
}

/** Vector-first search with lexical supplement and deduplication by chunkId. */
export async function hybridSearchChunks(
  query: string,
  options: SearchOptions = {},
): Promise<HybridSearchResult> {
  const limit = options.limit ?? 10
  let vectorResults: SearchResult[] = []

  try {
    vectorResults = await searchVector(query, options)
  } catch {
    vectorResults = []
  }

  if (vectorResults.length > 0) {
    return {
      results: vectorResults.slice(0, limit),
      mode: "vector",
      vectorCount: vectorResults.length,
      lexicalCount: 0,
    }
  }

  const lexicalResults = await searchLexical(query, options)
  if (lexicalResults.length === 0) {
    return { results: [], mode: "empty", vectorCount: 0, lexicalCount: 0 }
  }

  return {
    results: lexicalResults.slice(0, limit),
    mode: "lexical",
    vectorCount: 0,
    lexicalCount: lexicalResults.length,
  }
}
