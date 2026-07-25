import "server-only";

import type { ContentStudioRepository } from "../repository-interface";
import type {
  Campaign,
  CampaignStatus,
  ContentApprovalRecord,
  ContentItem,
  ContentItemStatus,
  ContentProject,
  ContentReviewRecord,
  ContentSource,
  OutputPackage,
  SourceStatus,
} from "../types";
import type {
  CreateCampaignInput,
  CreateContentItemInput,
  CreateContentProjectInput,
  CreateOutputPackageInput,
  CreateSourceInput,
  SubmitApprovalInput,
  SubmitReviewInput,
} from "../contracts";

import * as projects from "./projects";
import * as campaigns from "./campaigns";
import * as sources from "./sources";
import * as contentItems from "./content-items";
import * as reviews from "./reviews";
import * as approvals from "./approvals";
import * as outputs from "./outputs";

export class PrismaContentStudioRepository implements ContentStudioRepository {
  async createProject(
    input: CreateContentProjectInput,
  ): Promise<ContentProject> {
    return projects.createProject(input);
  }

  async listProjects(organizationId: string): Promise<ContentProject[]> {
    return projects.listProjects(organizationId);
  }

  async getProject(
    id: string,
    organizationId: string,
  ): Promise<ContentProject | null> {
    return projects.getProject(id, organizationId);
  }

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    return campaigns.createCampaign(input);
  }

  async listCampaigns(organizationId: string): Promise<Campaign[]> {
    return campaigns.listCampaigns(organizationId);
  }

  async getCampaign(
    id: string,
    organizationId: string,
  ): Promise<Campaign | null> {
    return campaigns.getCampaign(id, organizationId);
  }

  async updateCampaignState(
    id: string,
    organizationId: string,
    status: CampaignStatus,
  ): Promise<Campaign> {
    return campaigns.updateCampaignState(id, organizationId, status);
  }

  async createSource(input: CreateSourceInput): Promise<ContentSource> {
    return sources.createSource(input);
  }

  async listSources(organizationId: string): Promise<ContentSource[]> {
    return sources.listSources(organizationId);
  }

  async listSourcesForCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentSource[]> {
    return sources.listSourcesForCampaign(campaignId, organizationId);
  }

  async getSource(
    id: string,
    organizationId: string,
  ): Promise<ContentSource | null> {
    return sources.getSource(id, organizationId);
  }

  async verifySource(
    sourceId: string,
    organizationId: string,
    actor?: { id?: string; name?: string },
  ): Promise<ContentSource> {
    return sources.verifySource(sourceId, organizationId, actor);
  }

  async rejectSource(
    sourceId: string,
    organizationId: string,
    reason?: string,
  ): Promise<ContentSource> {
    return sources.rejectSource(sourceId, organizationId, reason);
  }

  async updateSourceStatus(
    sourceId: string,
    organizationId: string,
    status: SourceStatus,
  ): Promise<ContentSource> {
    return sources.updateSourceStatus(sourceId, organizationId, status);
  }

  async createContentItem(
    input: CreateContentItemInput,
  ): Promise<ContentItem> {
    return contentItems.createContentItem(input);
  }

  async listContentItems(organizationId: string): Promise<ContentItem[]> {
    return contentItems.listContentItems(organizationId);
  }

  async listContentItemsByCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentItem[]> {
    return contentItems.listContentItemsByCampaign(campaignId, organizationId);
  }

  async getContentItem(
    id: string,
    organizationId: string,
  ): Promise<ContentItem | null> {
    return contentItems.getContentItem(id, organizationId);
  }

  async updateContentItemStatus(
    id: string,
    organizationId: string,
    status: ContentItemStatus,
  ): Promise<ContentItem> {
    return contentItems.updateContentItemStatus(id, organizationId, status);
  }

  async updateContentItem(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<
        ContentItem,
        | "body"
        | "status"
        | "draftAssistMetadata"
        | "sourceRefIds"
        | "aiGenerated"
        | "reviewRequired"
      >
    >,
  ): Promise<ContentItem> {
    return contentItems.updateContentItem(id, organizationId, patch);
  }

  async createReview(
    input: SubmitReviewInput,
  ): Promise<ContentReviewRecord> {
    return reviews.createReview(input);
  }

  async listReviews(organizationId: string): Promise<ContentReviewRecord[]> {
    return reviews.listReviews(organizationId);
  }

  async listReviewsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentReviewRecord[]> {
    return reviews.listReviewsForItem(contentItemId, organizationId);
  }

  async createApproval(
    input: SubmitApprovalInput,
  ): Promise<{ approval: ContentApprovalRecord; item: ContentItem }> {
    return approvals.createApproval(input);
  }

  async listApprovals(
    organizationId: string,
  ): Promise<ContentApprovalRecord[]> {
    return approvals.listApprovals(organizationId);
  }

  async listApprovalsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentApprovalRecord[]> {
    return approvals.listApprovalsForItem(contentItemId, organizationId);
  }

  async createOutput(
    input: CreateOutputPackageInput,
  ): Promise<OutputPackage> {
    return outputs.createOutput(input);
  }

  async listOutputs(organizationId: string): Promise<OutputPackage[]> {
    return outputs.listOutputs(organizationId);
  }

  async getOutput(
    id: string,
    organizationId: string,
  ): Promise<OutputPackage | null> {
    return outputs.getOutput(id, organizationId);
  }

  async updateOutput(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<OutputPackage, "status" | "exportMetadata" | "exportedAt">
    >,
  ): Promise<OutputPackage> {
    return outputs.updateOutput(id, organizationId, patch);
  }

  async listReviewQueue(organizationId: string): Promise<ContentItem[]> {
    return reviews.listReviewQueue(organizationId);
  }

  async listApprovalQueue(organizationId: string): Promise<ContentItem[]> {
    return approvals.listApprovalQueue(organizationId);
  }
}
