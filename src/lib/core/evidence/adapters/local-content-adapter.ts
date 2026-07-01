import "server-only";

import { prisma } from "@/lib/prisma";
import {
  registerCoreEvidence,
  transitionEvidenceLifecycle,
  createPlatformEvidenceLink,
  getCoreEvidenceByProductRef,
} from "../core-evidence-service";
import { mapProductStateToLifecycle } from "../lifecycle";

function mapLocalContentSensitivity(
  evidenceType: string,
  status: string,
): "standard" | "restricted" | "confidential" {
  if (status === "rejected" || status === "missing") return "restricted";
  if (evidenceType === "contract" || evidenceType === "attestation") {
    return "confidential";
  }
  return "standard";
}

export async function syncLocalContentEvidenceToCore(params: {
  evidenceId: string;
  actorId?: string;
  graphNodeId?: string;
}): Promise<{ coreEvidenceId: string } | null> {
  const row = await prisma.localContentEvidence.findUnique({
    where: { id: params.evidenceId },
    include: {
      project: {
        select: {
          organizationId: true,
          platformOrganizationId: true,
        },
      },
    },
  });
  if (!row) return null;

  const core = await registerCoreEvidence({
    organizationId: row.project.organizationId,
    platformOrganizationId: row.project.platformOrganizationId,
    productSlug: "local_content",
    productEvidenceId: row.id,
    resourceType: "LocalContentProject",
    resourceId: row.projectId,
    filename: row.filename,
    fileType: row.fileType,
    storageKey: row.storageKey,
    fileHash: row.fileHash,
    evidenceType: row.evidenceType,
    productState: row.status,
    sensitivity: mapLocalContentSensitivity(row.evidenceType, row.status),
    uploadedById: row.reviewedById,
    graphNodeId: params.graphNodeId,
    actorId: params.actorId,
    metadata: { sizeBytes: row.sizeBytes, mimeType: row.mimeType },
  });

  if (row.supplierId) {
    await createPlatformEvidenceLink({
      coreEvidenceId: core.id,
      targetType: "supplier",
      targetId: row.supplierId,
      productSlug: "local_content",
      linkType: "supports",
      createdById: params.actorId,
    }).catch(() => {});
  }
  if (row.spendRecordId) {
    await createPlatformEvidenceLink({
      coreEvidenceId: core.id,
      targetType: "spend_record",
      targetId: row.spendRecordId,
      productSlug: "local_content",
      linkType: "supports",
      createdById: params.actorId,
    }).catch(() => {});
  }
  if (row.findingId) {
    await createPlatformEvidenceLink({
      coreEvidenceId: core.id,
      targetType: "finding",
      targetId: row.findingId,
      productSlug: "local_content",
      linkType: "evidence_for",
      createdById: params.actorId,
    }).catch(() => {});
  }

  return { coreEvidenceId: core.id };
}

export async function syncLocalContentEvidenceStateToCore(params: {
  evidenceId: string;
  newStatus: string;
  actorId?: string;
  reason?: string;
}): Promise<void> {
  let core = await getCoreEvidenceByProductRef({
    productSlug: "local_content",
    productEvidenceId: params.evidenceId,
  });
  if (!core) {
    await syncLocalContentEvidenceToCore({
      evidenceId: params.evidenceId,
      actorId: params.actorId,
    });
    core = await getCoreEvidenceByProductRef({
      productSlug: "local_content",
      productEvidenceId: params.evidenceId,
    });
  }
  if (!core) return;

  const {
    inferWorkflowActionFromLocalContentStatus,
    applyWorkflowEvidenceTransition,
  } = await import("../workflow-bridge");
  const workflowAction = inferWorkflowActionFromLocalContentStatus(
    params.newStatus,
  );

  if (workflowAction) {
    await applyWorkflowEvidenceTransition({
      productSlug: "local_content",
      productEvidenceId: params.evidenceId,
      workflowAction,
      productWorkflowKey: "local_content",
      actorId: params.actorId,
      reason: params.reason,
    });
    return;
  }

  const toStatus = mapProductStateToLifecycle(
    "local_content",
    params.newStatus,
  );
  if (core.lifecycleStatus === toStatus) return;

  await transitionEvidenceLifecycle({
    coreEvidenceId: core.id,
    toStatus,
    actorId: params.actorId,
    reason: params.reason,
    syncProductState: params.newStatus,
    provenance: {
      source: "local_content_status_sync",
      productState: params.newStatus,
    },
  });
}
