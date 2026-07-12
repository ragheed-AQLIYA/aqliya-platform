// LocalContentOS — Content Studio domain types (interim store, no Prisma migration)

export const CONTENT_PROJECT_STATUSES = [
  "draft",
  "active",
  "archived",
] as const;
export type ContentProjectStatus = (typeof CONTENT_PROJECT_STATUSES)[number];

export const CAMPAIGN_STATUSES = [
  "draft",
  "active",
  "in_review",
  "approved",
  "completed",
  "archived",
] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CONTENT_ITEM_STATUSES = [
  "idea",
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "ready_to_publish",
  "published",
  "archived",
] as const;
export type ContentItemStatus = (typeof CONTENT_ITEM_STATUSES)[number];

export const SOURCE_STATUSES = [
  "proposed",
  "verified",
  "rejected",
  "expired",
] as const;
export type SourceStatus = (typeof SOURCE_STATUSES)[number];

export const REVIEW_STATUSES = [
  "pending",
  "approved",
  "changes_requested",
  "rejected",
] as const;
export type ContentReviewStatus = (typeof REVIEW_STATUSES)[number];

export const OUTPUT_STATUSES = [
  "draft",
  "ready",
  "approved",
  "exported",
] as const;
export type OutputPackageStatus = (typeof OUTPUT_STATUSES)[number];

export const SOURCE_TYPES = [
  "url",
  "file",
  "note",
  "reference",
  "internal_doc",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const CONTENT_FORMATS = [
  "article",
  "social_post",
  "newsletter",
  "script",
  "brief",
  "other",
] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export const CREDIBILITY_LEVELS = [
  "high",
  "medium",
  "low",
  "unverified",
] as const;
export type CredibilityLevel = (typeof CREDIBILITY_LEVELS)[number];

export interface ContentProject {
  id: string;
  organizationId: string;
  platformOrganizationId?: string;
  title: string;
  objective?: string;
  audience?: string;
  language: string;
  status: ContentProjectStatus;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  contentProjectId: string;
  organizationId: string;
  name: string;
  objective?: string;
  audience?: string;
  channels: string[];
  startDate?: string;
  endDate?: string;
  status: CampaignStatus;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentSource {
  id: string;
  organizationId: string;
  campaignId?: string;
  contentItemId?: string;
  title: string;
  type: SourceType;
  url?: string;
  note?: string;
  fileRef?: string;
  credibility: CredibilityLevel;
  status: SourceStatus;
  evidenceMetadata?: Record<string, unknown>;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  campaignId: string;
  organizationId: string;
  title: string;
  format: ContentFormat;
  body?: string;
  sourceRefIds: string[];
  status: ContentItemStatus;
  aiGenerated?: boolean;
  reviewRequired?: boolean;
  draftAssistMetadata?: {
    promptHash?: string;
    generatedAt?: string;
    reviewRequired: boolean;
    productId: "localcontentos";
    actorId?: string;
    actorName?: string;
  };
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentGovernanceAudit {
  productId: "localcontentos";
  action: "review" | "approval" | "source_verify" | "ai_draft_assist" | "output_export";
  recordedAt: string;
  actorId?: string;
  actorName?: string;
}

export interface ContentReviewRecord {
  id: string;
  contentItemId: string;
  organizationId: string;
  status: ContentReviewStatus;
  dimensions: {
    sourceGrounding?: boolean;
    brand?: boolean;
    compliance?: boolean;
    factualClaims?: boolean;
    languageQuality?: boolean;
    governance?: ContentGovernanceAudit;
  };
  notes?: string;
  reviewerId?: string;
  reviewerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentApprovalRecord {
  id: string;
  contentItemId: string;
  organizationId: string;
  approved: boolean;
  notes?: string;
  approverId?: string;
  approverName?: string;
  governance?: ContentGovernanceAudit;
  createdAt: string;
}

export interface OutputPackage {
  id: string;
  campaignId: string;
  organizationId: string;
  title: string;
  status: OutputPackageStatus;
  includes: {
    campaignSummary: boolean;
    contentCalendar: boolean;
    approvedContent: boolean;
    complianceMemo: boolean;
  };
  exportMetadata?: Record<string, unknown>;
  exportedAt?: string;
  createdById?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentStudioStore {
  projects: ContentProject[];
  campaigns: Campaign[];
  sources: ContentSource[];
  contentItems: ContentItem[];
  reviews: ContentReviewRecord[];
  approvals: ContentApprovalRecord[];
  outputs: OutputPackage[];
}
