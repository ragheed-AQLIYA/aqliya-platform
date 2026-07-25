import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
  type ClassificationBasis,
  type ClassificationConfidence,
  type CreateClassificationInput,
} from "./common";

export async function listClassifications(projectId: string) {
  return prisma.localContentClassification.findMany({
    where: { projectId },
    include: {
      supplier: { select: { id: true, name: true } },
      spendRecord: { select: { id: true, amount: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createClassification(
  input: CreateClassificationInput,
  actor?: { id: string; name: string },
) {
  const classification = await prisma.localContentClassification.create({
    data: {
      projectId: input.projectId,
      supplierId: input.supplierId ?? null,
      spendRecordId: input.spendRecordId ?? null,
      classifiedBy: input.classifiedBy ?? actor?.id ?? null,
      localPercentage: input.localPercentage,
      classificationBasis: input.classificationBasis as ClassificationBasis,
      confidence: (input.confidence as ClassificationConfidence) ?? "unverified",
      notes: input.notes ?? null,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: classification.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.CLASSIFICATION_CREATED,
      entityType: "LocalContentClassification",
      entityId: classification.id,
      after: JSON.stringify({
        localPercentage: classification.localPercentage,
        basis: classification.classificationBasis,
      }),
    });
  }

  return classification;
}
