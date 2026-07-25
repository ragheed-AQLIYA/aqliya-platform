import "server-only"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { writeEvent, auditLog, MUTATION_ACTIONS } from "./common"
import type { IngestDocumentInput } from "./common"

// ─── Ingestion ───

export async function ingestDocument(input: IngestDocumentInput): Promise<{ batchId: string }> {
  const batch = await prisma.ingestionBatch.create({
    data: {
      organizationId: input.organizationId,
      status: "pending",
      source: input.source ?? "manual_upload",
      totalDocuments: input.documents.length,
      createdById: input.documents[0]?.createdBy ?? null,
    },
    select: { id: true },
  })

  if (input.documents.length > 0) {
    await prisma.ingestionDocument.createMany({
      data: input.documents.map(doc => ({
        organizationId: input.organizationId,
        batchId: batch.id,
        documentId: doc.documentId,
        title: doc.title ?? null,
        sourceType: doc.sourceType ?? null,
        status: "pending",
        metadata: (doc.metadata ?? undefined) as Prisma.InputJsonValue,
        createdById: doc.createdBy ?? null,
      })),
    })
  }

  await prisma.ingestionBatch.update({
    where: { id: batch.id },
    data: {
      status: "completed",
      processedCount: input.documents.length,
      completedAt: new Date(),
    },
  })

  await writeEvent({
    organizationId: input.organizationId,
    action: MUTATION_ACTIONS.BATCH_INGESTED,
    metadata: { batchId: batch.id, documentCount: input.documents.length, source: input.source },
    performedBy: input.documents[0]?.createdBy,
  })

  await auditLog("institutional_memory.batch_ingested", {
    organizationId: input.organizationId,
    actorId: input.documents[0]?.createdBy,
    targetType: "ingestion_batch",
    targetId: batch.id,
    metadata: { documentCount: input.documents.length, source: input.source },
  })

  return { batchId: batch.id }
}

export async function getIngestionStatus(batchId: string): Promise<unknown> {
  const batch = await prisma.ingestionBatch.findUnique({
    where: { id: batchId },
    include: {
      documents: {
        select: {
          id: true,
          documentId: true,
          title: true,
          status: true,
          totalChunks: true,
          errorMessage: true,
          createdAt: true,
        },
      },
    },
  })
  if (!batch) {
    throw new Error(`Ingestion batch not found: ${batchId}`)
  }
  return batch
}
