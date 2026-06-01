// LocalContentOS Content Studio — domain services

import type { CommandCenterSummary } from "./contracts";
import { getContentRepository } from "./repository-instance";
import { executeGovernedAI } from "./ai";
import { buildOutputPackagePayload, getOutputReadiness } from "./outputs";

export {
  createContentProject,
  createContentCampaign,
  createContentItem,
  createContentSource,
  getContentCampaign,
  getContentItem,
  getContentProject,
  listContentCampaigns,
  listContentItems,
  listContentItemsByCampaign,
  listContentProjects,
  listContentSources,
  submitContentItemForReview,
  updateCampaignStatus,
  updateContentItemStatus,
} from "./repository";

export { executeGovernedAI, buildOutputPackagePayload, getOutputReadiness };

export async function getCommandCenterSummary(
  organizationId: string,
): Promise<CommandCenterSummary> {
  const repo = getContentRepository();
  const [
    projects,
    campaigns,
    items,
    reviewQueue,
    approvalQueue,
    sources,
    outputs,
  ] = await Promise.all([
    repo.listProjects(organizationId),
    repo.listCampaigns(organizationId),
    repo.listContentItems(organizationId),
    repo.listReviewQueue(organizationId),
    repo.listApprovalQueue(organizationId),
    repo.listSources(organizationId),
    repo.listOutputs(organizationId),
  ]);

  return {
    projectCount: projects.length,
    campaignCount: campaigns.length,
    contentItemCount: items.length,
    reviewQueueCount: reviewQueue.length,
    approvalQueueCount: approvalQueue.length,
    sourceCount: sources.length,
    verifiedSourceCount: sources.filter((s) => s.status === "verified").length,
    outputReadyCount: outputs.filter(
      (o) => o.status === "ready" || o.status === "approved",
    ).length,
  };
}
