import type { Chunk } from "@/lib/ai/types"

export interface ChunkingOptions {
  chunkSize: number
  chunkOverlap: number
  minChunkSize: number
}

const DEFAULT_OPTIONS: ChunkingOptions = {
  chunkSize: 1024,
  chunkOverlap: 128,
  minChunkSize: 10,
}

function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4)
}

function splitParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
  return paragraphs.length > 0 ? paragraphs : [text]
}

export function chunkText(
  text: string,
  documentId: string,
  organizationId: string,
  metadata: Record<string, unknown> = {},
  options: Partial<ChunkingOptions> = {},
): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const chunks: Chunk[] = []

  if (!text || text.trim().length === 0) {
    return chunks
  }

  const paragraphs = splitParagraphs(text)

  for (const para of paragraphs) {
    if (para.length <= opts.chunkSize) {
      chunks.push({
        documentId,
        organizationId,
        chunkIndex: chunks.length,
        content: para.trim(),
        tokenCount: estimateTokenCount(para),
        metadata,
      })
    } else {
      const sentences = para.match(/[^.!?\n]+[.!?]*\s*/g) || [para]
      let batch = ""
      for (const sentence of sentences) {
        if ((batch + sentence).length > opts.chunkSize && batch.length > 0) {
          if (batch.trim().length >= opts.minChunkSize) {
            chunks.push({
              documentId,
              organizationId,
              chunkIndex: chunks.length,
              content: batch.trim(),
              tokenCount: estimateTokenCount(batch),
              metadata,
            })
          }
          const overlap = batch.slice(-opts.chunkOverlap)
          batch = overlap + sentence
        } else {
          batch += sentence
        }
      }
      if (batch.trim().length >= opts.minChunkSize || chunks.length === 0) {
        chunks.push({
          documentId,
          organizationId,
          chunkIndex: chunks.length,
          content: batch.trim(),
          tokenCount: estimateTokenCount(batch),
          metadata,
        })
      }
    }
  }

  return chunks
}

export function chunkTextByTokens(
  text: string,
  documentId: string,
  organizationId: string,
  metadata: Record<string, unknown> = {},
  options: Partial<ChunkingOptions> = {},
): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const chunks: Chunk[] = []
  const tokens = text.split(/\s+/)
  let currentBatch: string[] = []
  let currentLength = 0

  for (const token of tokens) {
    if (currentLength + token.length + 1 > opts.chunkSize && currentBatch.length > 0) {
      const content = currentBatch.join(" ")
      if (content.length >= opts.minChunkSize || chunks.length === 0) {
        chunks.push({
          documentId,
          organizationId,
          chunkIndex: chunks.length,
          content,
          tokenCount: currentBatch.length,
          metadata,
        })
      }
      const overlap = currentBatch.slice(-Math.floor(opts.chunkOverlap / 4))
      currentBatch = [...overlap, token]
      currentLength = currentBatch.join(" ").length
    } else {
      currentBatch.push(token)
      currentLength += token.length + 1
    }
  }

  if (currentBatch.length > 0) {
    const content = currentBatch.join(" ")
    if (content.length >= opts.minChunkSize || chunks.length === 0) {
      chunks.push({
        documentId,
        organizationId,
        chunkIndex: chunks.length,
        content,
        tokenCount: currentBatch.length,
        metadata,
      })
    }
  }

  return chunks
}
