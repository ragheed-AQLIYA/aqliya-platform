import "server-only";

import { listProjectsByOrganization } from "@/lib/local-content/services";
import {
  orchestrateCampaignTransition,
  type CampaignOrchestrationState,
} from "@/lib/local-content/vnext/campaign-helpers";
import { buildContentGovernanceLifecycle } from "@/lib/local-content/vnext/content-governance-runtime";
import { notifyPlatformWorkflowMutation } from "@/lib/platform/operations/platform-mutation-hooks";

export interface CampaignOperationRow {
  projectId: string;
  projectName: string;
  status: string;
  orchestration: CampaignOrchestrationState;
  governanceStage: string;
  href: string;
}

export async function listCampaignOperations(
  organizationId: string,
): Promise<CampaignOperationRow[]> {
  const projects = await listProjectsByOrganization(organizationId);

  return projects.map((p) => {
    const orchestration = orchestrateCampaignTransition({
      campaignId: `camp-${p.id}`,
      projectId: p.id,
      currentStatus: p.status,
      evidenceVerifiedPct: 75,
    });
    const lifecycle = buildContentGovernanceLifecycle({
      projectId: p.id,
      organizationId,
      ownerId: "system",
      projectStatus: p.status,
      sourceCount: 0,
      evidenceCompletePct: 75,
    });

    return {
      projectId: p.id,
      projectName: p.name,
      status: p.status,
      orchestration,
      governanceStage: lifecycle.editorial.stage,
      href: `/local-content/projects/${p.id}`,
    };
  });
}

export async function notifyCampaignStatusTransition(input: {
  organizationId: string;
  actorId: string;
  projectId: string;
  projectName: string;
  previousStatus: string;
  nextStatus: string;
  governanceStage: string;
}) {
  const kind =
    input.nextStatus === "InReview"
      ? ("review" as const)
      : input.nextStatus === "Approved"
        ? ("approval" as const)
        : input.nextStatus === "Published"
          ? ("output" as const)
          : ("workflow" as const);

  await notifyPlatformWorkflowMutation({
    organizationId: input.organizationId,
    productSlug: "local_content",
    kind,
    action: "local_content.campaign.status_changed",
    actorId: input.actorId,
    resourceType: "LocalContentProject",
    resourceId: input.projectId,
    href: `/local-content/projects/${input.projectId}?panel=${input.governanceStage}`,
    titleAr: `حملة: ${input.projectName} — ${input.nextStatus}`,
    titleEn: `Campaign: ${input.projectName} — ${input.nextStatus}`,
    metadata: {
      previousStatus: input.previousStatus,
      nextStatus: input.nextStatus,
      governanceStage: input.governanceStage,
    },
  });
}
