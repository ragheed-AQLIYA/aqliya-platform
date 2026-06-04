import "server-only"
import { prisma } from "@/lib/prisma"

const EMBEDDING_DIMENSIONS = 1536

export async function isPgVectorAvailable(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ extname: string }>>(
      `SELECT extname FROM pg_extension WHERE extname = 'vector' LIMIT 1`,
    )
    return rows.length > 0
  } catch {
    return false
  }
}

export async function storeChunkEmbedding(chunkId: string, embedding: number[]): Promise<void> {
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Embedding dimension mismatch: expected ${EMBEDDING_DIMENSIONS}, got ${embedding.length}`,
    )
  }
  const vectorStr = JSON.stringify(embedding)
  await prisma.$executeRawUnsafe(
    `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
    vectorStr,
    chunkId,
  )
}

export async function verifyDocumentChunkTable(): Promise<{
  tableExists: boolean
  pgvector: boolean
}> {
  try {
    const tables = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS (
         SELECT FROM information_schema.tables
         WHERE table_schema = 'public' AND table_name = 'DocumentChunk'
       ) AS exists`,
    )
    const pgvector = await isPgVectorAvailable()
    return { tableExists: Boolean(tables[0]?.exists), pgvector }
  } catch {
    return { tableExists: false, pgvector: false }
  }
}
