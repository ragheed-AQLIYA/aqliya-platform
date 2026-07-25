import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
  type CreateSupplierInput,
} from "./common";

export async function listSuppliers(projectId: string) {
  return prisma.localContentSupplier.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createSupplier(
  input: CreateSupplierInput,
  actor?: { id: string; name: string },
) {
  const supplier = await prisma.localContentSupplier.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      crNumber: input.crNumber ?? null,
      localityClassification: input.localityClassification ?? null,
      localContentPercentage: input.localContentPercentage ?? null,
      ownershipType: input.ownershipType ?? null,
      workforceLocalPct: input.workforceLocalPct ?? null,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: supplier.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SUPPLIER_CREATED,
      entityType: "LocalContentSupplier",
      entityId: supplier.id,
      after: JSON.stringify({
        name: supplier.name,
        localityClassification: supplier.localityClassification,
      }),
    });
  }

  return supplier;
}

export async function deleteSupplier(
  projectId: string,
  supplierId: string,
  actor?: { id: string; name: string },
) {
  const supplier = await prisma.localContentSupplier.findUnique({
    where: { id: supplierId },
    select: { projectId: true, name: true },
  });
  if (!supplier || supplier.projectId !== projectId) {
    throw new Error("Supplier not found");
  }

  await prisma.localContentSupplier.delete({
    where: { id: supplierId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SUPPLIER_DELETED,
      entityType: "LocalContentSupplier",
      entityId: supplierId,
      before: JSON.stringify({ name: supplier.name }),
    });
  }
}
