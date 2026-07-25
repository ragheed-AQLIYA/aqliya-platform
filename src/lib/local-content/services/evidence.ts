import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
} from "./common";

export async function listEvidence(projectId: string) {
  return prisma.localContentEvidence.findMany({
    where: { projectId },
    include: {
      supplier: { select: { id: true, name: true } },
      spendRecord: { select: { id: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createEvidenceEntry(
  input: {
    projectId: string;
    supplierId?: string;
    spendRecordId?: string;
    filename: string;
    fileType: string;
    mimeType?: string;
    storageKey?: string;
    fileHash?: string;
    sizeBytes?: number;
    evidenceType: string;
  },
  actor?: { id: string; name: string },
) {
  const evidence = await prisma.localContentEvidence.create({
    data: {
      projectId: input.projectId,
      supplierId: input.supplierId ?? null,
      spendRecordId: input.spendRecordId ?? null,
      filename: input.filename,
      fileType: input.fileType,
      mimeType: input.mimeType ?? null,
      storageKey: input.storageKey ?? null,
      fileHash: input.fileHash ?? null,
      sizeBytes: input.sizeBytes ?? null,
      evidenceType: input.evidenceType,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: evidence.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.EVIDENCE_UPLOADED,
      entityType: "LocalContentEvidence",
      entityId: evidence.id,
      after: JSON.stringify({
        filename: evidence.filename,
        evidenceType: evidence.evidenceType,
      }),
    });
  }

  const project = await prisma.localContentProject.findUnique({
    where: { id: evidence.projectId },
    select: { organizationId: true },
  });
  if (project?.organizationId) {
    const { linkLocalContentEvidenceAfterUpload } = await import(
      "@/lib/core/evidence/link-after-upload"
    );
    await linkLocalContentEvidenceAfterUpload({
      organizationId: project.organizationId,
      projectId: evidence.projectId,
      evidenceId: evidence.id,
      filename: evidence.filename,
      actorId: actor?.id,
    });
  }

  return evidence;
}

export async function deleteEvidence(
  projectId: string,
  evidenceId: string,
  actor?: { id: string; name: string },
) {
  const ev = await prisma.localContentEvidence.findUnique({
    where: { id: evidenceId },
    select: {
      projectId: true,
      filename: true,
      evidenceType: true,
      storageKey: true,
    },
  });
  if (!ev || ev.projectId !== projectId) {
    throw new Error("Evidence not found");
  }

  await prisma.localContentEvidence.delete({
    where: { id: evidenceId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.EVIDENCE_DELETED,
      entityType: "LocalContentEvidence",
      entityId: evidenceId,
      before: JSON.stringify({
        filename: ev.filename,
        evidenceType: ev.evidenceType,
      }),
    });
  }

  return ev;
}
