import "server-only"
import { prisma } from "@/lib/prisma"
import { chunkText } from "./chunking-engine"
import { buildChunkGovernanceMetadata } from "./governance-metadata"
import { storeChunkEmbedding } from "./vector-store"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import type { EmbeddingProvider } from "@/lib/core/ai/types"
import type { Prisma } from "@prisma/client"
import { getRagEmbeddingProvider, setRagEmbeddingProvider } from "./embedding-provider"

// DocumentChunk model exists in schema — typed access used directly

/** @deprecated Use setRagEmbeddingProvider from embedding-provider.ts */
export function setEmbeddingProvider(provider: EmbeddingProvider): void {
  setRagEmbeddingProvider(provider)
}

export async function embedAndStore(
  documentId: string,
  organizationId: string,
  content: string,
  metadata: Record<string, unknown> = {},
  userId?: string,
): Promise<{ chunkCount: number; tokenCount: number }> {
  const provider = getRagEmbeddingProvider()

  const enrichedMetadata = buildChunkGovernanceMetadata(documentId, organizationId, metadata)
  const chunks = chunkText(content, documentId, organizationId, enrichedMetadata)
  if (chunks.length === 0) {
    return { chunkCount: 0, tokenCount: 0 }
  }

  const textsToEmbed = chunks.map((c) => c.content)
  const embedResponse = await provider.embed({ input: textsToEmbed })
  const totalTokenCount = embedResponse.usage?.totalTokens ?? 0

  let savedCount = 0
  const createdRows = await prisma.documentChunk.createManyAndReturn({
    data: chunks.map((chunk) => ({
      documentId: chunk.documentId,
      organizationId: chunk.organizationId,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      tokenCount: chunk.tokenCount,
      metadata: chunk.metadata as Prisma.InputJsonValue,
      createdBy: userId,
    })),
  })

  const rowsByIndex = new Map(createdRows.map((r) => [r.chunkIndex, r]))

  await Promise.allSettled(
    chunks.map((chunk, i) => {
      const embedding = embedResponse.embeddings[i]
      const row = rowsByIndex.get(chunk.chunkIndex)
      if (!embedding || !row) return Promise.resolve()
      return storeChunkEmbedding(row.id, embedding)
    }),
  )

  savedCount = createdRows.length

  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "embedding_created",
    platformOrganizationId: organizationId,
    severity: "info",
    status: "recorded",
    sourceSystem: "embedding_service",
    metadata: {
      documentId,
      chunkCount: savedCount,
      totalChunks: chunks.length,
      tokenCount: totalTokenCount,
    },
  })

  return { chunkCount: savedCount, tokenCount: totalTokenCount }
}

export async function deleteDocumentEmbeddings(
  documentId: string,
  organizationId: string,
  _userId?: string,
): Promise<number> {
  const result = await prisma.documentChunk.deleteMany({
    where: { documentId, organizationId },
  })

  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "embedding_deleted",
    platformOrganizationId: organizationId,
    severity: "info",
    status: "recorded",
    sourceSystem: "embedding_service",
    metadata: {
      documentId,
      deletedCount: result.count,
    },
  })

  return result.count
}
