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

import {
  createProject,
  listProjects,
  getProject,
} from "./projects";

import {
  createCampaign,
  listCampaigns,
  getCampaign,
  updateCampaignState,
} from "./campaigns";

import {
  createSource,
  listSources,
  listSourcesForCampaign,
  getSource,
  verifySource,
  rejectSource,
  updateSourceStatus,
} from "./sources";

import {
  createContentItem,
  listContentItems,
  listContentItemsByCampaign,
  getContentItem,
  updateContentItemStatus,
  updateContentItem,
} from "./content-items";

import {
  createReview,
  listReviews,
  listReviewsForItem,
} from "./reviews";

import {
  createApproval,
  listApprovals,
  listApprovalsForItem,
} from "./approvals";

import {
  createOutput,
  listOutputs,
  getOutput,
  updateOutput,
} from "./outputs";

import {
  listReviewQueue,
  listApprovalQueue,
} from "./queues";

export class PrismaContentStudioRepository implements ContentStudioRepository {
  async createProject(input: CreateContentProjectInput): Promise<ContentProject> {
    return createProject(input);
  }

  async listProjects(organizationId: string): Promise<ContentProject[]> {
    return listProjects(organizationId);
  }

  async getProject(id: string, organizationId: string): Promise<ContentProject | null> {
    return getProject(id, organizationId);
  }

  async createCampaign(input: CreateCampaignInput): Promise<Campaign> {
    return createCampaign(input);
  }

  async listCampaigns(organizationId: string): Promise<Campaign[]> {
    return listCampaigns(organizationId);
  }

  async getCampaign(id: string, organizationId: string): Promise<Campaign | null> {
    return getCampaign(id, organizationId);
  }

  async updateCampaignState(id: string, organizationId: string, status: CampaignStatus): Promise<Campaign> {
    return updateCampaignState(id, organizationId, status);
  }

  async createSource(input: CreateSourceInput): Promise<ContentSource> {
    return createSource(input);
  }

  async listSources(organizationId: string): Promise<ContentSource[]> {
    return listSources(organizationId);
  }

  async listSourcesForCampaign(campaignId: string, organizationId: string): Promise<ContentSource[]> {
    return listSourcesForCampaign(campaignId, organizationId);
  }

  async getSource(id: string, organizationId: string): Promise<ContentSource | null> {
    return getSource(id, organizationId);
  }

  async verifySource(sourceId: string, organizationId: string, actor?: { id?: string; name?: string }): Promise<ContentSource> {
    return verifySource(sourceId, organizationId, actor);
  }

  async rejectSource(sourceId: string, organizationId: string, reason?: string): Promise<ContentSource> {
    return rejectSource(sourceId, organizationId, reason);
  }

  async updateSourceStatus(sourceId: string, organizationId: string, status: SourceStatus): Promise<ContentSource> {
    return updateSourceStatus(sourceId, organizationId, status);
  }

  async createContentItem(input: CreateContentItemInput): Promise<ContentItem> {
    return createContentItem(input);
  }

  async listContentItems(organizationId: string): Promise<ContentItem[]> {
    return listContentItems(organizationId);
  }

  async listContentItemsByCampaign(campaignId: string, organizationId: string): Promise<ContentItem[]> {
    return listContentItemsByCampaign(campaignId, organizationId);
  }

  async getContentItem(id: string, organizationId: string): Promise<ContentItem | null> {
    return getContentItem(id, organizationId);
  }

  async updateContentItemStatus(id: string, organizationId: string, status: ContentItemStatus): Promise<ContentItem> {
    return updateContentItemStatus(id, organizationId, status);
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
    return updateContentItem(id, organizationId, patch);
  }

  async createReview(input: SubmitReviewInput): Promise<ContentReviewRecord> {
    return createReview(input);
  }

  async listReviews(organizationId: string): Promise<ContentReviewRecord[]> {
    return listReviews(organizationId);
  }

  async listReviewsForItem(contentItemId: string, organizationId: string): Promise<ContentReviewRecord[]> {
    return listReviewsForItem(contentItemId, organizationId);
  }

  async createApproval(input: SubmitApprovalInput): Promise<{ approval: ContentApprovalRecord; item: ContentItem }> {
    return createApproval(input);
  }

  async listApprovals(organizationId: string): Promise<ContentApprovalRecord[]> {
    return listApprovals(organizationId);
  }

  async listApprovalsForItem(contentItemId: string, organizationId: string): Promise<ContentApprovalRecord[]> {
    return listApprovalsForItem(contentItemId, organizationId);
  }

  async createOutput(input: CreateOutputPackageInput): Promise<OutputPackage> {
    return createOutput(input);
  }

  async listOutputs(organizationId: string): Promise<OutputPackage[]> {
    return listOutputs(organizationId);
  }

  async getOutput(id: string, organizationId: string): Promise<OutputPackage | null> {
    return getOutput(id, organizationId);
  }

  async updateOutput(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<OutputPackage, "status" | "exportMetadata" | "exportedAt">
    >,
  ): Promise<OutputPackage> {
    return updateOutput(id, organizationId, patch);
  }

  async listReviewQueue(organizationId: string): Promise<ContentItem[]> {
    return listReviewQueue(organizationId);
  }

  async listApprovalQueue(organizationId: string): Promise<ContentItem[]> {
    return listApprovalQueue(organizationId);
  }
}
