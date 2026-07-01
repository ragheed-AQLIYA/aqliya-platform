import "server-only";

import { prisma } from "@/lib/prisma";
import {
  registerCoreEvidence,
  transitionEvidenceLifecycle,
  createPlatformEvidenceLink,
  getCoreEvidenceByProductRef,
} from "../core-evidence-service";
import { mapProductStateToLifecycle } from "../lifecycle";

async function resolveAuditPlatformOrgId(
  auditOrganizationId: string,
): Promise<string | null> {
  const auditOrg = await prisma.auditOrganization.findUnique({
    where: { id: auditOrganizationId },
    select: { platformOrganizationId: true },
  });
  return auditOrg?.platformOrganizationId ?? null;
}

export async function syncAuditEvidenceToCore(params: {
  evidenceId: string;
  actorId?: string;
  graphNodeId?: string;
}): Promise<{ coreEvidenceId: string } | null> {
  const row = await prisma.auditEvidence.findUnique({
    where: { id: params.evidenceId },
    include: {
      engagement: {
        select: { organizationId: true },
      },
    },
  });
  if (!row) return null;

  const platformOrganizationId = await resolveAuditPlatformOrgId(
    row.engagement.organizationId,
  );

  const core = await registerCoreEvidence({
    organizationId: row.engagement.organizationId,
    platformOrganizationId,
    productSlug: "audit",
    productEvidenceId: row.id,
    resourceType: "AuditEngagement",
    resourceId: row.engagementId,
    filename: row.filename,
    fileType: row.fileType,
    storageKey: row.storageKey,
    fileHash: row.fileHash,
    productState: row.state,
    uploadedById: row.uploadedById,
    graphNodeId: params.graphNodeId,
    actorId: params.actorId,
    metadata: { fileSize: row.fileSize },
  });

  return { coreEvidenceId: core.id };
}

export async function syncAuditEvidenceStateToCore(params: {
  evidenceId: string;
  newState: string;
  actorId?: string;
  reason?: string;
}): Promise<void> {
  let core = await getCoreEvidenceByProductRef({
    productSlug: "audit",
    productEvidenceId: params.evidenceId,
  });
  if (!core) {
    await syncAuditEvidenceToCore({
      evidenceId: params.evidenceId,
      actorId: params.actorId,
    });
    core = await getCoreEvidenceByProductRef({
      productSlug: "audit",
      productEvidenceId: params.evidenceId,
    });
  }
  if (!core) return;

  const { inferWorkflowActionFromAuditState, applyWorkflowEvidenceTransition } =
    await import("../workflow-bridge");
  const workflowAction = inferWorkflowActionFromAuditState(params.newState);

  if (workflowAction) {
    await applyWorkflowEvidenceTransition({
      productSlug: "audit",
      productEvidenceId: params.evidenceId,
      workflowAction,
      actorId: params.actorId,
      reason: params.reason,
    });
    return;
  }

  const toStatus = mapProductStateToLifecycle("audit", params.newState);
  if (core.lifecycleStatus === toStatus) return;

  await transitionEvidenceLifecycle({
    coreEvidenceId: core.id,
    toStatus,
    actorId: params.actorId,
    reason: params.reason,
    syncProductState: params.newState,
    provenance: { source: "audit_state_sync", productState: params.newState },
  });
}

export async function syncAuditEvidenceLinkToCore(params: {
  evidenceId: string;
  targetType: string;
  targetId: string;
  linkType?: string;
  context?: string;
  createdBy?: string;
}): Promise<void> {
  let core = await getCoreEvidenceByProductRef({
    productSlug: "audit",
    productEvidenceId: params.evidenceId,
  });
  if (!core) {
    const synced = await syncAuditEvidenceToCore({
      evidenceId: params.evidenceId,
      actorId: params.createdBy,
    });
    if (!synced) return;
    core = await getCoreEvidenceByProductRef({
      productSlug: "audit",
      productEvidenceId: params.evidenceId,
    });
  }
  if (!core) return;

  await createPlatformEvidenceLink({
    coreEvidenceId: core.id,
    targetType: params.targetType,
    targetId: params.targetId,
    productSlug: "audit",
    linkType:
      (params.linkType as
        | "supports"
        | "contradicts"
        | "references"
        | "evidence_for") ?? "supports",
    context: params.context,
    createdById: params.createdBy,
  });
}
