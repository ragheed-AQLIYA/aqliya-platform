// LocalContentOS Content Studio — repository contract (persistence boundary)

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
} from "./types";
import type {
  CreateCampaignInput,
  CreateContentItemInput,
  CreateContentProjectInput,
  CreateOutputPackageInput,
  CreateSourceInput,
  SubmitApprovalInput,
  SubmitReviewInput,
} from "./contracts";

export interface ContentStudioRepository {
  createProject(input: CreateContentProjectInput): Promise<ContentProject>;
  listProjects(organizationId: string): Promise<ContentProject[]>;
  getProject(id: string, organizationId: string): Promise<ContentProject | null>;

  createCampaign(input: CreateCampaignInput): Promise<Campaign>;
  listCampaigns(organizationId: string): Promise<Campaign[]>;
  getCampaign(id: string, organizationId: string): Promise<Campaign | null>;
  updateCampaignState(
    id: string,
    organizationId: string,
    status: CampaignStatus,
  ): Promise<Campaign>;

  createSource(input: CreateSourceInput): Promise<ContentSource>;
  listSources(organizationId: string): Promise<ContentSource[]>;
  listSourcesForCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentSource[]>;
  getSource(id: string, organizationId: string): Promise<ContentSource | null>;
  verifySource(
    sourceId: string,
    organizationId: string,
    actor?: { id?: string; name?: string },
  ): Promise<ContentSource>;
  rejectSource(
    sourceId: string,
    organizationId: string,
    reason?: string,
  ): Promise<ContentSource>;
  updateSourceStatus(
    sourceId: string,
    organizationId: string,
    status: SourceStatus,
  ): Promise<ContentSource>;

  createContentItem(input: CreateContentItemInput): Promise<ContentItem>;
  listContentItems(organizationId: string): Promise<ContentItem[]>;
  listContentItemsByCampaign(
    campaignId: string,
    organizationId: string,
  ): Promise<ContentItem[]>;
  getContentItem(
    id: string,
    organizationId: string,
  ): Promise<ContentItem | null>;
  updateContentItemStatus(
    id: string,
    organizationId: string,
    status: ContentItemStatus,
  ): Promise<ContentItem>;
  updateContentItem(
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
  ): Promise<ContentItem>;

  createReview(input: SubmitReviewInput): Promise<ContentReviewRecord>;
  listReviews(organizationId: string): Promise<ContentReviewRecord[]>;
  listReviewsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentReviewRecord[]>;

  createApproval(
    input: SubmitApprovalInput,
  ): Promise<{ approval: ContentApprovalRecord; item: ContentItem }>;
  listApprovals(organizationId: string): Promise<ContentApprovalRecord[]>;
  listApprovalsForItem(
    contentItemId: string,
    organizationId: string,
  ): Promise<ContentApprovalRecord[]>;

  createOutput(input: CreateOutputPackageInput): Promise<OutputPackage>;
  listOutputs(organizationId: string): Promise<OutputPackage[]>;
  getOutput(id: string, organizationId: string): Promise<OutputPackage | null>;
  updateOutput(
    id: string,
    organizationId: string,
    patch: Partial<
      Pick<OutputPackage, "status" | "exportMetadata" | "exportedAt">
    >,
  ): Promise<OutputPackage>;

  listReviewQueue(organizationId: string): Promise<ContentItem[]>;
  listApprovalQueue(organizationId: string): Promise<ContentItem[]>;
}
