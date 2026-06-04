"use server"

import { requireUserContext } from "@/lib/auth"
import { IngestionPipeline, chunkText } from "@/lib/ai/ingestion/ingestion-pipeline"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { prisma } from "@/lib/prisma"

const pipeline = new IngestionPipeline()

export async function ingestDocumentAction(
  documentId: string,
  content: string,
  metadata?: Record<string, unknown>,
) {
  const user = await requireUserContext("OPERATOR")

  const result = await pipeline.processDocument(
    documentId,
    user.organizationId,
    content,
    { ...metadata, title: metadata?.title ?? documentId },
    user.id,
  )

  return { success: result.status === "completed", data: result }
}

export async function batchIngestAction(
  documents: Array<{ documentId: string; content: string; metadata?: Record<string, unknown> }>,
  source?: string,
) {
  const user = await requireUserContext("OPERATOR")

  const result = await pipeline.batchProcess(documents, user.organizationId, user.id, source)

  return { success: true, data: result }
}

export async function getIngestionStatusAction(batchId: string) {
  const user = await requireUserContext("VIEWER")

  const status = await pipeline.getStatus(batchId)

  if (status.batch && typeof status.batch === "object" && "organizationId" in (status.batch as Record<string, unknown>)) {
    const b = status.batch as { organizationId: string }
    if (b.organizationId !== user.organizationId) {
      return { success: false, error: "Access denied" }
    }
  }

  return { success: true, data: status }
}

export async function listIngestedDocumentsAction(engagementId?: string) {
  const user = await requireUserContext("VIEWER")

  const where: Record<string, unknown> = { organizationId: user.organizationId }
  if (engagementId) {
    where.documentId = { startsWith: engagementId }
  }

  const docs = await prisma.documentChunk.groupBy({
    by: ["documentId", "organizationId"],
    where: where as never,
    _count: { id: true },
    _max: { createdAt: true },
  })

  return {
    success: true,
    data: docs.map((d) => ({
      documentId: d.documentId,
      organizationId: d.organizationId,
      chunkCount: d._count.id,
      lastIngestedAt: d._max.createdAt,
    })),
  }
}

export async function deleteIngestedDocumentAction(documentId: string) {
  const user = await requireUserContext("OPERATOR")

  const result = await prisma.documentChunk.deleteMany({
    where: { documentId, organizationId: user.organizationId },
  })

  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "ingestion_document_deleted",
    platformOrganizationId: user.organizationId,
    actorId: user.id,
    severity: "info",
    status: "recorded",
    sourceSystem: "ingestion_actions",
    metadata: { documentId, deletedCount: result.count },
  })

  return { success: true, data: { deletedCount: result.count } }
}

export { chunkText }
