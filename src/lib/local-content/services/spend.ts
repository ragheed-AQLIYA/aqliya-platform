import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
  type CreateSpendRecordInput,
} from "./common";

export async function listSpendRecords(projectId: string) {
  return prisma.localContentSpendRecord.findMany({
    where: { projectId },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          localityClassification: true,
          localContentPercentage: true,
          ownershipType: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createSpendRecord(
  input: CreateSpendRecordInput,
  actor?: { id: string; name: string },
) {
  const code = input.lcgpaProductCode?.trim() || null;
  const record = await prisma.localContentSpendRecord.create({
    data: {
      projectId: input.projectId,
      supplierId: input.supplierId,
      amount: input.amount,
      currency: input.currency ?? "SAR",
      category: input.category,
      contractReference: input.contractReference ?? null,
      period: input.period,
      description: input.description ?? null,
      ...(code
        ? {
            metadata: {
              lcgpaProductCode: code,
              lcgpaCodeSource: "manual_entry" as const,
            },
          }
        : {}),
    },
    include: { supplier: { select: { name: true } } },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: record.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SPEND_CREATED,
      entityType: "LocalContentSpendRecord",
      entityId: record.id,
      after: JSON.stringify({
        amount: record.amount,
        category: record.category,
        supplier: record.supplier.name,
      }),
    });
  }

  return record;
}

export async function deleteSpendRecord(
  projectId: string,
  recordId: string,
  actor?: { id: string; name: string },
) {
  const record = await prisma.localContentSpendRecord.findUnique({
    where: { id: recordId },
    select: { projectId: true, amount: true, category: true },
  });
  if (!record || record.projectId !== projectId) {
    throw new Error("Spend record not found");
  }

  await prisma.localContentSpendRecord.delete({
    where: { id: recordId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SPEND_DELETED,
      entityType: "LocalContentSpendRecord",
      entityId: recordId,
      before: JSON.stringify({
        amount: record.amount,
        category: record.category,
      }),
    });
  }
}
