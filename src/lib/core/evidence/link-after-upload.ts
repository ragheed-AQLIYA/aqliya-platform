import "server-only";

import { linkEvidenceToGraph } from "./graph";
import { syncAuditEvidenceToCore } from "./adapters/audit-adapter";
import { syncLocalContentEvidenceToCore } from "./adapters/local-content-adapter";

export async function linkLocalContentEvidenceAfterUpload(params: {
  organizationId: string;
  projectId: string;
  evidenceId: string;
  filename: string;
  actorId?: string;
}): Promise<void> {
  try {
    const graph = await linkEvidenceToGraph({
      organizationId: params.organizationId,
      resourceType: "LocalContentProject",
      resourceId: params.projectId,
      evidenceId: params.evidenceId,
      evidenceLabel: params.filename,
      productSlug: "local_content",
      createdById: params.actorId,
    });

    await syncLocalContentEvidenceToCore({
      evidenceId: params.evidenceId,
      actorId: params.actorId,
      graphNodeId: graph.evidenceNodeId,
    });
  } catch {
    // Best-effort: product flow must not fail on platform registration
  }
}

export async function linkAuditEvidenceAfterUpload(params: {
  organizationId: string;
  engagementId: string;
  evidenceId: string;
  filename: string;
  actorId?: string;
}): Promise<void> {
  try {
    const graph = await linkEvidenceToGraph({
      organizationId: params.organizationId,
      resourceType: "AuditEngagement",
      resourceId: params.engagementId,
      evidenceId: params.evidenceId,
      evidenceLabel: params.filename,
      productSlug: "audit",
      createdById: params.actorId,
    });

    await syncAuditEvidenceToCore({
      evidenceId: params.evidenceId,
      actorId: params.actorId,
      graphNodeId: graph.evidenceNodeId,
    });
  } catch {
    // Best-effort: product flow must not fail on platform registration
  }
}
