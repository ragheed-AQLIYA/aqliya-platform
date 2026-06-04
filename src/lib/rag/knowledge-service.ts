import "server-only"
import { prisma } from "@/lib/prisma"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import { embedAndStore, deleteDocumentEmbeddings } from "./embedding-service"
import { hybridSearchChunks } from "./hybrid-search"
import {
  retrieveGovernedContext,
  toGovernedRAGPayload,
  type GovernedRAGContext,
} from "./intelligence-core-rag"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import type { CurrentUser } from "@/lib/auth"
import type { HybridRetrievalMode } from "./hybrid-search"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any

export function resolveKnowledgeOrganizationId(
  user: CurrentUser,
  requested?: string | null,
): string {
  const orgId = requested?.trim() || user.organizationId
  if (orgId !== user.organizationId && user.role !== "ADMIN") {
    throw new Error("Access denied: organization scope mismatch")
  }
  return orgId
}

function assertKnowledgeEnabled(): void {
  if (!isEnabled("ai.rag")) {
    throw new Error("KNOWLEDGE_DISABLED: Enable FF_AI_RAG for knowledge APIs")
  }
}

export interface KnowledgeIngestInput {
  documentId: string
  content: string
  metadata?: Record<string, unknown>
  productKey?: string
  sourceType?: string
  sensitivity?: string
}

export interface KnowledgeIngestResult {
  documentId: string
  organizationId: string
  chunkCount: number
  tokenCount: number
}

export async function ingestKnowledgeDocument(
  organizationId: string,
  input: KnowledgeIngestInput,
  userId?: string,
): Promise<KnowledgeIngestResult> {
  assertKnowledgeEnabled()

  if (!input.documentId?.trim()) {
    throw new Error("documentId is required")
  }
  if (!input.content?.trim()) {
    throw new Error("content is required")
  }

  const metadata = {
    ...input.metadata,
    productKey: input.productKey ?? "ai_core",
    sourceType: input.sourceType ?? "knowledge_api",
    sensitivity: input.sensitivity ?? "internal",
  }

  const stored = await embedAndStore(
    input.documentId.trim(),
    organizationId,
    input.content,
    metadata,
    userId,
  )

  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "knowledge_ingest",
    platformOrganizationId: organizationId,
    actorId: userId,
    severity: "info",
    status: "recorded",
    sourceSystem: "knowledge_api",
    metadata: {
      documentId: input.documentId,
      chunkCount: stored.chunkCount,
      tokenCount: stored.tokenCount,
    },
  })

  return {
    documentId: input.documentId.trim(),
    organizationId,
    chunkCount: stored.chunkCount,
    tokenCount: stored.tokenCount,
  }
}

export interface KnowledgeSearchInput {
  query: string
  limit?: number
  minSimilarity?: number
  documentId?: string
  governed?: boolean
}

export interface KnowledgeSearchResult {
  query: string
  organizationId: string
  mode: HybridRetrievalMode
  governed?: GovernedRAGContext
  payload?: Record<string, unknown>
  resultCount: number
}

export async function searchKnowledge(
  organizationId: string,
  input: KnowledgeSearchInput,
): Promise<KnowledgeSearchResult> {
  assertKnowledgeEnabled()

  if (!input.query?.trim()) {
    throw new Error("query is required")
  }

  const query = input.query.trim()
  const limit = input.limit ?? 10
  const minSimilarity = input.minSimilarity ?? 0.25

  if (input.governed !== false) {
    const governed = await retrieveGovernedContext(query, {
      organizationId,
      limit,
      minSimilarity,
      documentId: input.documentId,
    })
    const hybrid = await hybridSearchChunks(query, {
      organizationId,
      limit,
      minSimilarity,
      documentId: input.documentId,
    })

    return {
      query,
      organizationId,
      mode: hybrid.mode,
      governed,
      payload: toGovernedRAGPayload(governed),
      resultCount: governed.chunks.length,
    }
  }

  const hybrid = await hybridSearchChunks(query, {
    organizationId,
    limit,
    minSimilarity,
    documentId: input.documentId,
  })

  return {
    query,
    organizationId,
    mode: hybrid.mode,
    resultCount: hybrid.results.length,
  }
}

export interface KnowledgeDocumentMetadata {
  documentId: string
  organizationId: string
  chunkCount: number
  totalTokens: number
  productKeys: string[]
  sensitivities: string[]
  lastIngestedAt: string | null
}

export async function getKnowledgeDocumentMetadata(
  organizationId: string,
  documentId: string,
): Promise<KnowledgeDocumentMetadata | null> {
  assertKnowledgeEnabled()

  const chunks = await db.documentChunk.findMany({
    where: { organizationId, documentId },
    select: { metadata: true, tokenCount: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  if (chunks.length === 0) return null

  const productKeys = new Set<string>()
  const sensitivities = new Set<string>()
  let totalTokens = 0

  for (const c of chunks) {
    totalTokens += c.tokenCount ?? 0
    const meta = (c.metadata ?? {}) as Record<string, unknown>
    const gov = meta.governance as Record<string, unknown> | undefined
    if (typeof gov?.productKey === "string") productKeys.add(gov.productKey)
    if (typeof meta.productKey === "string") productKeys.add(meta.productKey)
    if (typeof gov?.sensitivity === "string") sensitivities.add(gov.sensitivity)
  }

  return {
    documentId,
    organizationId,
    chunkCount: chunks.length,
    totalTokens,
    productKeys: [...productKeys],
    sensitivities: [...sensitivities],
    lastIngestedAt: chunks[0]?.createdAt?.toISOString?.() ?? null,
  }
}

export async function deleteKnowledgeDocument(
  organizationId: string,
  documentId: string,
  userId?: string,
): Promise<{ deletedCount: number }> {
  assertKnowledgeEnabled()
  const deletedCount = await deleteDocumentEmbeddings(documentId, organizationId, userId)

  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "knowledge_delete",
    platformOrganizationId: organizationId,
    actorId: userId,
    severity: "info",
    status: "recorded",
    sourceSystem: "knowledge_api",
    metadata: { documentId, deletedCount },
  })

  return { deletedCount }
}
