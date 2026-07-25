import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
  type CreateFindingInput,
} from "./common";

export async function listFindings(projectId: string) {
  return prisma.localContentFinding.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function deleteFinding(
  projectId: string,
  findingId: string,
  actor?: { id: string; name: string },
) {
  const finding = await prisma.localContentFinding.findUnique({
    where: { id: findingId },
    select: { projectId: true, title: true, type: true },
  });
  if (!finding || finding.projectId !== projectId) {
    throw new Error("Finding not found");
  }

  await prisma.localContentFinding.delete({
    where: { id: findingId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.FINDING_DELETED,
      entityType: "LocalContentFinding",
      entityId: findingId,
      before: JSON.stringify({
        title: finding.title,
        type: finding.type,
      }),
    });
  }
}

export async function createFinding(
  input: CreateFindingInput,
  actor?: { id: string; name: string },
) {
  const finding = await prisma.localContentFinding.create({
    data: {
      projectId: input.projectId,
      type: input.type,
      severity: input.severity ?? "medium",
      title: input.title,
      description: input.description,
      linkedSupplierId: input.linkedSupplierId ?? null,
      linkedSpendRecordId: input.linkedSpendRecordId ?? null,
      createdById: input.createdById ?? actor?.id ?? null,
      createdByName: input.createdByName ?? actor?.name ?? null,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: finding.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.FINDING_CREATED,
      entityType: "LocalContentFinding",
      entityId: finding.id,
      after: JSON.stringify({
        title: finding.title,
        type: finding.type,
        severity: finding.severity,
      }),
    });
  }

  return finding;
}
