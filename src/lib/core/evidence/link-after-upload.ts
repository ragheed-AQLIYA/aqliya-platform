import "server-only";

import { linkEvidenceToGraph } from "./graph";

export async function linkLocalContentEvidenceAfterUpload(params: {
  organizationId: string;
  projectId: string;
  evidenceId: string;
  filename: string;
  actorId?: string;
}): Promise<void> {
  await linkEvidenceToGraph({
    organizationId: params.organizationId,
    resourceType: "LocalContentProject",
    resourceId: params.projectId,
    evidenceId: params.evidenceId,
    evidenceLabel: params.filename,
    productSlug: "local_content",
    createdById: params.actorId,
  }).catch(() => {});
}

export async function linkAuditEvidenceAfterUpload(params: {
  organizationId: string;
  engagementId: string;
  evidenceId: string;
  filename: string;
  actorId?: string;
}): Promise<void> {
  await linkEvidenceToGraph({
    organizationId: params.organizationId,
    resourceType: "AuditEngagement",
    resourceId: params.engagementId,
    evidenceId: params.evidenceId,
    evidenceLabel: params.filename,
    productSlug: "audit",
    createdById: params.actorId,
  }).catch(() => {});
}
