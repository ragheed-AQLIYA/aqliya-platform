import "server-only"
import { prisma } from "@/lib/prisma"
import { getDefaultEmbeddingProvider } from "@/lib/ai/embedding/embedding-provider"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { isPgvectorAvailable } from "@/lib/platform/pgvector-compat"
import { chunkText as ragChunkText } from "@/lib/rag/chunking-engine"

export interface ChunkOptions {
  chunkSize: number
  chunkOverlap: number
  strategy: "fixed" | "sentence" | "paragraph"
}

export interface TextChunk {
  documentId: string
  organizationId: string
  chunkIndex: number
  content: string
  tokenCount?: number
  metadata: Record<string, unknown>
}

export interface IngestionResult {
  batchId: string
  documentId: string
  chunkCount: number
  status: "completed" | "failed"
  error?: string
}

const DEFAULT_CHUNK_OPTIONS: ChunkOptions = {
  chunkSize: 1024,
  chunkOverlap: 128,
  strategy: "paragraph",
}

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

function splitBySentences(text: string): string[] {
  return text.match(/[^.!?\n]+[.!?]*\s*/g) || [text]
}

function splitByParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  return paragraphs.length > 0 ? paragraphs : [text]
}

export function chunkText(text: string, options: Partial<ChunkOptions> = {}): string[] {
  const opts = { ...DEFAULT_CHUNK_OPTIONS, ...options }
  if (!text || text.trim().length === 0) return []

  if (opts.strategy === "sentence") {
    const sentences = splitBySentences(text)
    const chunks: string[] = []
    let current = ""
    for (const sentence of sentences) {
      if ((current + sentence).length > opts.chunkSize && current.length > 0) {
        chunks.push(current.trim())
        const overlap = current.slice(-opts.chunkOverlap)
        current = overlap + sentence
      } else {
        current += sentence
      }
    }
    if (current.trim()) chunks.push(current.trim())
    return chunks
  }

  if (opts.strategy === "fixed") {
    const chunks: string[] = []
    let pos = 0
    while (pos < text.length) {
      const end = Math.min(pos + opts.chunkSize, text.length)
      chunks.push(text.slice(pos, end).trim())
      pos = end - (end < text.length ? opts.chunkOverlap : 0)
      if (pos >= text.length) break
    }
    return chunks.filter((c) => c.length > 0)
  }

  const paragraphs = splitByParagraphs(text)
  const chunks: string[] = []
  for (const para of paragraphs) {
    if (para.length <= opts.chunkSize) {
      chunks.push(para.trim())
    } else {
      const sentences = splitBySentences(para)
      let current = ""
      for (const sentence of sentences) {
        if ((current + sentence).length > opts.chunkSize && current.length > 0) {
          chunks.push(current.trim())
          const overlap = current.slice(-opts.chunkOverlap)
          current = overlap + sentence
        } else {
          current += sentence
        }
      }
      if (current.trim()) chunks.push(current.trim())
    }
  }
  return chunks
}

export class IngestionPipeline {
  private provider = getDefaultEmbeddingProvider()

  async processDocument(
    documentId: string,
    organizationId: string,
    content: string,
    metadata: Record<string, unknown> = {},
    userId?: string,
    batchId?: string,
  ): Promise<IngestionResult> {
    try {
      const chunkTexts = chunkText(content)
      if (chunkTexts.length === 0) {
        return { batchId: batchId ?? "", documentId, chunkCount: 0, status: "completed" }
      }

      const embeddings = await this.provider.embedBatch(chunkTexts)
      const pgvectorAvail = await isPgvectorAvailable()

      let savedCount = 0
      for (let i = 0; i < chunkTexts.length; i++) {
        const text = chunkTexts[i]
        const embedding = embeddings[i]
        if (!embedding) continue

        const data: Record<string, unknown> = {
          documentId,
          organizationId,
          chunkIndex: i,
          content: text,
          tokenCount: estimateTokenCount(text),
          metadata,
          createdBy: userId,
        }

        const row = await prisma.documentChunk.create({ data: data as never })

        if (pgvectorAvail && embedding) {
          try {
            const vectorStr = JSON.stringify(embedding)
            await prisma.$executeRawUnsafe(
              `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
              vectorStr,
              row.id,
            )
          } catch {
            // pgvector write failed — skip vector storage, JSON fallback still works
          }
        }

        if (!pgvectorAvail && embedding) {
          await prisma.documentChunk.update({
            where: { id: row.id },
            data: { embeddingJson: embedding as never },
          })
        }

        savedCount++
      }

      if (batchId) {
        await prisma.ingestionDocument.updateMany({
          where: { batchId, documentId },
          data: { status: "completed", totalChunks: savedCount, tokenCount: chunkTexts.reduce((s, t) => s + estimateTokenCount(t), 0), completedAt: new Date() },
        })
      }

      await writePlatformAuditLog({
        productKey: "ai_core",
        action: "ingestion_document_processed",
        platformOrganizationId: organizationId,
        actorId: userId,
        severity: "info",
        status: "recorded",
        sourceSystem: "ingestion_pipeline",
        metadata: { documentId, chunkCount: savedCount, totalChunks: chunkTexts.length },
      })

      return { batchId: batchId ?? "", documentId, chunkCount: savedCount, status: "completed" }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error"

      if (batchId) {
        await prisma.ingestionDocument.updateMany({
          where: { batchId, documentId },
          data: { status: "failed", errorMessage: message },
        })
      }

      await writePlatformAuditLog({
        productKey: "ai_core",
        action: "ingestion_document_failed",
        platformOrganizationId: organizationId,
        actorId: userId,
        severity: "error",
        status: "failure",
        sourceSystem: "ingestion_pipeline",
        metadata: { documentId, error: message },
      })

      return { batchId: batchId ?? "", documentId, chunkCount: 0, status: "failed", error: message }
    }
  }

  async batchProcess(
    documents: Array<{ documentId: string; content: string; metadata?: Record<string, unknown> }>,
    organizationId: string,
    userId?: string,
    source?: string,
  ): Promise<{ batchId: string; results: IngestionResult[] }> {
    const batch = await prisma.ingestionBatch.create({
      data: {
        organizationId,
        status: "processing",
        source: source ?? "api",
        totalDocuments: documents.length,
        createdById: userId,
        documents: {
          create: documents.map((d) => ({
            organizationId,
            documentId: d.documentId,
            title: (d.metadata?.title as string) ?? d.documentId,
            sourceType: (d.metadata?.sourceType as string) ?? "text",
            status: "pending",
            createdById: userId,
          })),
        },
      },
      include: { documents: true },
    })

    const results: IngestionResult[] = []
    for (const doc of documents) {
      const result = await this.processDocument(
        doc.documentId,
        organizationId,
        doc.content,
        doc.metadata,
        userId,
        batch.id,
      )
      results.push(result)
    }

    const failedCount = results.filter((r) => r.status === "failed").length
    const finalStatus = failedCount === 0 ? "completed" : failedCount < documents.length ? "partial" : "failed"

    await prisma.ingestionBatch.update({
      where: { id: batch.id },
      data: {
        status: finalStatus,
        processedCount: results.filter((r) => r.status === "completed").length,
        failedCount,
        completedAt: new Date(),
      },
    })

    await writePlatformAuditLog({
      productKey: "ai_core",
      action: "ingestion_batch_completed",
      platformOrganizationId: organizationId,
      actorId: userId,
      severity: failedCount > 0 ? "warning" : "info",
      status: "recorded",
      sourceSystem: "ingestion_pipeline",
      metadata: { batchId: batch.id, totalDocuments: documents.length, failedCount, status: finalStatus },
    })

    return { batchId: batch.id, results }
  }

  async embedChunk(text: string): Promise<number[]> {
    return this.provider.embed(text)
  }

  async storeChunk(
    engagementId: string,
    chunk: TextChunk,
    embedding: number[],
  ): Promise<string> {
    const pgvectorAvail = await isPgvectorAvailable()
    const data: Record<string, unknown> = {
      documentId: chunk.documentId,
      organizationId: chunk.organizationId,
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      tokenCount: chunk.tokenCount ?? estimateTokenCount(chunk.content),
      metadata: chunk.metadata,
      createdBy: engagementId,
    }

    const row = await prisma.documentChunk.create({ data: data as never })

    if (pgvectorAvail) {
      try {
        const vectorStr = JSON.stringify(embedding)
        await prisma.$executeRawUnsafe(
          `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
          vectorStr,
          row.id,
        )
      } catch {
        // fallback to JSON
        await prisma.documentChunk.update({
          where: { id: row.id },
          data: { embeddingJson: embedding as never },
        })
      }
    } else {
      await prisma.documentChunk.update({
        where: { id: row.id },
        data: { embeddingJson: embedding as never },
      })
    }

    return row.id
  }

  async getStatus(batchId: string): Promise<{
    batch: unknown
    documents: unknown[]
    status: string
  }> {
    const batch = await prisma.ingestionBatch.findUnique({
      where: { id: batchId },
      include: { documents: true },
    })

    if (!batch) {
      return { batch: null, documents: [], status: "not_found" }
    }

    return {
      batch,
      documents: batch.documents,
      status: batch.status,
    }
  }
}
