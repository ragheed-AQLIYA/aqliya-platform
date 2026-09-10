import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import type { EvidenceProductSlug, EvidenceSensitivity } from "./evidence-service";
import {
  type EvidenceLifecycleStatus,
  type EvidenceLinkType,
  type EvidenceRelationType,
  isValidLifecycleTransition,
  mapProductStateToLifecycle,
} from "./lifecycle";

export interface RegisterCoreEvidenceInput {
  organizationId: string;
  platformOrganizationId?: string | null;
  productSlug: EvidenceProductSlug;
  productEvidenceId: string;
  resourceType: string;
  resourceId: string;
  filename: string;
  fileType: string;
  storageKey?: string | null;
  fileHash?: string | null;
  evidenceType?: string | null;
  productState?: string;
  sensitivity?: EvidenceSensitivity;
  uploadedById?: string | null;
  graphNodeId?: string | null;
  metadata?: Record<string, unknown>;
  actorId?: string;
}

export interface CoreEvidenceRecord {
  id: string;
  organizationId: string;
  platformOrganizationId: string | null;
  productSlug: EvidenceProductSlug;
  productEvidenceId: string;
  resourceType: string;
  resourceId: string;
  filename: string;
  fileType: string;
  storageKey: string | null;
  fileHash: string | null;
  evidenceType: string | null;
  lifecycleStatus: EvidenceLifecycleStatus;
  sensitivity: EvidenceSensitivity;
  uploadedById: string | null;
  graphNodeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function toRecord(row: {
  id: string;
  organizationId: string;
  platformOrganizationId: string | null;
  productSlug: string;
  productEvidenceId: string;
  resourceType: string;
  resourceId: string;
  filename: string;
  fileType: string;
  storageKey: string | null;
  fileHash: string | null;
  evidenceType: string | null;
  lifecycleStatus: string;
  sensitivity: string;
  uploadedById: string | null;
  graphNodeId: string | null;
  createdAt: Date;
  updatedAt: Date;
}): CoreEvidenceRecord {
  return {
    ...row,
    productSlug: row.productSlug as EvidenceProductSlug,
    lifecycleStatus: row.lifecycleStatus as EvidenceLifecycleStatus,
    sensitivity: row.sensitivity as EvidenceSensitivity,
  };
}

/** Register or upsert a CoreEvidence mirror for a product evidence record. */
export async function registerCoreEvidence(
  input: RegisterCoreEvidenceInput,
): Promise<CoreEvidenceRecord> {
  const lifecycleStatus = input.productState
    ? mapProductStateToLifecycle(input.productSlug, input.productState)
    : "created";

  const existing = await prisma.coreEvidence.findUnique({
    where: {
      productSlug_productEvidenceId: {
        productSlug: input.productSlug,
        productEvidenceId: input.productEvidenceId,
      },
    },
  });

  if (existing) {
    const row = await prisma.coreEvidence.update({
      where: { id: existing.id },
      data: {
        filename: input.filename,
        fileType: input.fileType,
        storageKey: input.storageKey ?? existing.storageKey,
        fileHash: input.fileHash ?? existing.fileHash,
        evidenceType: input.evidenceType ?? existing.evidenceType,
        lifecycleStatus,
        sensitivity: input.sensitivity ?? existing.sensitivity,
        graphNodeId: input.graphNodeId ?? existing.graphNodeId,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        updatedAt: new Date(),
      },
    });
    return toRecord(row);
  }

  const row = await prisma.coreEvidence.create({
    data: {
      organizationId: input.organizationId,
      platformOrganizationId: input.platformOrganizationId ?? null,
      productSlug: input.productSlug,
      productEvidenceId: input.productEvidenceId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      filename: input.filename,
      fileType: input.fileType,
      storageKey: input.storageKey ?? null,
      fileHash: input.fileHash ?? null,
      evidenceType: input.evidenceType ?? null,
      lifecycleStatus,
      sensitivity: input.sensitivity ?? "standard",
      uploadedById: input.uploadedById ?? null,
      graphNodeId: input.graphNodeId ?? null,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });

  await prisma.evidenceLifecycle.create({
    data: {
      coreEvidenceId: row.id,
      fromStatus: null,
      toStatus: lifecycleStatus,
      actorId: input.actorId ?? input.uploadedById ?? null,
      provenance: {
        source: "registerCoreEvidence",
        productSlug: input.productSlug,
        productEvidenceId: input.productEvidenceId,
        productState: input.productState ?? null,
      },
    },
  });

  await writePlatformAuditLog({
    productKey: input.productSlug,
    action: "evidence.registered",
    platformOrganizationId:
      input.platformOrganizationId ?? input.organizationId,
    actorId: input.actorId ?? input.uploadedById ?? "system",
    targetType: "CoreEvidence",
    targetId: row.id,
    sourceSystem: "core_evidence_platform",
    severity: "info",
    status: "recorded",
    metadata: {
      productEvidenceId: input.productEvidenceId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      lifecycleStatus,
    },
  }).catch(() => {});

  return toRecord(row);
}

export async function getCoreEvidenceByProductRef(params: {
  productSlug: EvidenceProductSlug;
  productEvidenceId: string;
}): Promise<CoreEvidenceRecord | null> {
  const row = await prisma.coreEvidence.findUnique({
    where: {
      productSlug_productEvidenceId: {
        productSlug: params.productSlug,
        productEvidenceId: params.productEvidenceId,
      },
    },
  });
  return row ? toRecord(row) : null;
}

export async function getCoreEvidenceById(
  id: string,
): Promise<CoreEvidenceRecord | null> {
  const row = await prisma.coreEvidence.findUnique({ where: { id } });
  return row ? toRecord(row) : null;
}

export async function transitionEvidenceLifecycle(params: {
  coreEvidenceId: string;
  toStatus: EvidenceLifecycleStatus;
  actorId?: string;
  reason?: string;
  provenance?: Record<string, unknown>;
  syncProductState?: string;
}): Promise<CoreEvidenceRecord> {
  const existing = await prisma.coreEvidence.findUnique({
    where: { id: params.coreEvidenceId },
  });
  if (!existing) {
    throw new Error("CoreEvidence not found");
  }

  const fromStatus = existing.lifecycleStatus as EvidenceLifecycleStatus;
  const toStatus = params.toStatus;

  if (!isValidLifecycleTransition(fromStatus, toStatus)) {
    throw new Error(
      `Invalid lifecycle transition: ${fromStatus} → ${toStatus}`,
    );
  }

  const [row] = await prisma.$transaction([
    prisma.coreEvidence.update({
      where: { id: params.coreEvidenceId },
      data: { lifecycleStatus: toStatus },
    }),
    prisma.evidenceLifecycle.create({
      data: {
        coreEvidenceId: params.coreEvidenceId,
        fromStatus,
        toStatus,
        actorId: params.actorId ?? null,
        reason: params.reason ?? null,
        provenance: {
          ...params.provenance,
          syncProductState: params.syncProductState ?? null,
        },
      },
    }),
  ]);

  await writePlatformAuditLog({
    productKey: existing.productSlug,
    action: "evidence.lifecycle.transition",
    platformOrganizationId:
      existing.platformOrganizationId ?? existing.organizationId,
    actorId: params.actorId ?? "system",
    targetType: "CoreEvidence",
    targetId: existing.id,
    sourceSystem: "core_evidence_platform",
    severity: "info",
    status: "recorded",
    metadata: { fromStatus, toStatus, reason: params.reason ?? null },
  }).catch(() => {});

  return toRecord(row);
}

export async function createPlatformEvidenceLink(params: {
  coreEvidenceId: string;
  targetType: string;
  targetId: string;
  productSlug: EvidenceProductSlug;
  linkType?: EvidenceLinkType;
  context?: string;
  createdById?: string;
}): Promise<{ id: string }> {
  const link = await prisma.evidenceLink.findFirst({
    where: {
      coreEvidenceId: params.coreEvidenceId,
      targetType: params.targetType,
      targetId: params.targetId,
      linkType: params.linkType ?? "supports",
    },
  });
  if (link) return { id: link.id };

  const created = await prisma.evidenceLink.create({
    data: {
      coreEvidenceId: params.coreEvidenceId,
      targetType: params.targetType,
      targetId: params.targetId,
      productSlug: params.productSlug,
      linkType: params.linkType ?? "supports",
      context: params.context ?? null,
      createdById: params.createdById ?? null,
    },
  });
  return { id: created.id };
}

export async function createEvidenceRelation(params: {
  organizationId: string;
  sourceEvidenceId: string;
  targetEvidenceId: string;
  relationType: EvidenceRelationType;
  metadata?: Record<string, unknown>;
  createdById?: string;
}): Promise<{ id: string }> {
  const relation = await prisma.evidenceRelation.upsert({
    where: {
      sourceEvidenceId_targetEvidenceId_relationType: {
        sourceEvidenceId: params.sourceEvidenceId,
        targetEvidenceId: params.targetEvidenceId,
        relationType: params.relationType,
      },
    },
    create: {
      organizationId: params.organizationId,
      sourceEvidenceId: params.sourceEvidenceId,
      targetEvidenceId: params.targetEvidenceId,
      relationType: params.relationType,
      metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      createdById: params.createdById ?? null,
    },
    update: {
      metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  return { id: relation.id };
}

export async function getEvidenceLifecycleHistory(
  coreEvidenceId: string,
): Promise<
  Array<{
    id: string;
    fromStatus: string | null;
    toStatus: string;
    actorId: string | null;
    reason: string | null;
    provenance: unknown;
    createdAt: Date;
  }>
> {
  return prisma.evidenceLifecycle.findMany({
    where: { coreEvidenceId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fromStatus: true,
      toStatus: true,
      actorId: true,
      reason: true,
      provenance: true,
      createdAt: true,
    },
  });
}

export async function getRelatedEvidence(params: {
  coreEvidenceId: string;
  relationTypes?: EvidenceRelationType[];
}): Promise<CoreEvidenceRecord[]> {
  const types = params.relationTypes ?? [
    "derives_from",
    "related_to",
    "lineage",
    "supersedes",
  ];

  const relations = await prisma.evidenceRelation.findMany({
    where: {
      OR: [
        {
          sourceEvidenceId: params.coreEvidenceId,
          relationType: { in: types },
        },
        {
          targetEvidenceId: params.coreEvidenceId,
          relationType: { in: types },
        },
      ],
    },
    include: {
      sourceEvidence: true,
      targetEvidence: true,
    },
  });

  const relatedIds = new Set<string>();
  for (const rel of relations) {
    if (rel.sourceEvidenceId !== params.coreEvidenceId) {
      relatedIds.add(rel.sourceEvidenceId);
    }
    if (rel.targetEvidenceId !== params.coreEvidenceId) {
      relatedIds.add(rel.targetEvidenceId);
    }
  }

  const rows = await prisma.coreEvidence.findMany({
    where: { id: { in: [...relatedIds] } },
  });
  return rows.map(toRecord);
}

export async function listEvidenceForResource(params: {
  organizationId: string;
  resourceType: string;
  resourceId: string;
}): Promise<CoreEvidenceRecord[]> {
  const rows = await prisma.coreEvidence.findMany({
    where: {
      organizationId: params.organizationId,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toRecord);
}
