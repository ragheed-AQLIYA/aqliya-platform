// LocalContentOS Content Studio — repository facade (delegates to active adapter)

import { getContentRepository } from "./repository-instance";
import type { ContentStudioRepository } from "./repository-interface";

export type { ContentStudioRepository } from "./repository-interface";
export {
  getContentRepository,
  resetContentRepositoryForTests,
  configureContentRepositoryBackend,
  getContentRepositoryBackend,
} from "./repository-instance";

function repo(): ContentStudioRepository {
  return getContentRepository();
}

export const createContentProject = (input: Parameters<ContentStudioRepository["createProject"]>[0]) =>
  repo().createProject(input);
export const listContentProjects = (organizationId: string) =>
  repo().listProjects(organizationId);
export const getContentProject = (id: string, organizationId: string) =>
  repo().getProject(id, organizationId);

export const createContentCampaign = (input: Parameters<ContentStudioRepository["createCampaign"]>[0]) =>
  repo().createCampaign(input);
export const listContentCampaigns = (organizationId: string) =>
  repo().listCampaigns(organizationId);
export const getContentCampaign = (id: string, organizationId: string) =>
  repo().getCampaign(id, organizationId);
export const updateCampaignStatus = (
  id: string,
  organizationId: string,
  status: Parameters<ContentStudioRepository["updateCampaignState"]>[2],
) => repo().updateCampaignState(id, organizationId, status);

export const createContentSource = (input: Parameters<ContentStudioRepository["createSource"]>[0]) =>
  repo().createSource(input);
export const listContentSources = (organizationId: string) =>
  repo().listSources(organizationId);

export const createContentItem = (input: Parameters<ContentStudioRepository["createContentItem"]>[0]) =>
  repo().createContentItem(input);
export const listContentItems = (organizationId: string) =>
  repo().listContentItems(organizationId);
export const listContentItemsByCampaign = (campaignId: string, organizationId: string) =>
  repo().listContentItemsByCampaign(campaignId, organizationId);
export const getContentItem = (id: string, organizationId: string) =>
  repo().getContentItem(id, organizationId);
export const updateContentItemStatus = (
  id: string,
  organizationId: string,
  status: Parameters<ContentStudioRepository["updateContentItemStatus"]>[2],
) => repo().updateContentItemStatus(id, organizationId, status);
export const submitContentItemForReview = (id: string, organizationId: string) =>
  repo().updateContentItemStatus(id, organizationId, "in_review");

export const createContentReview = (input: Parameters<ContentStudioRepository["createReview"]>[0]) =>
  repo().createReview(input);
export const createContentApproval = (input: Parameters<ContentStudioRepository["createApproval"]>[0]) =>
  repo().createApproval(input);
