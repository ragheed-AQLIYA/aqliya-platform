// LocalContentOS Content Studio — input/output contracts

import type {
  CampaignStatus,
  ContentFormat,
  ContentGovernanceAudit,
  ContentItemStatus,
  ContentProjectStatus,
  ContentReviewStatus,
  CredibilityLevel,
  OutputPackageStatus,
  SourceStatus,
  SourceType,
} from "./types";

export type LocalContentPermission =
  | "localcontentos:read"
  | "localcontentos:create"
  | "localcontentos:update"
  | "localcontentos:review"
  | "localcontentos:approve"
  | "localcontentos:export";

export interface CreateContentProjectInput {
  organizationId: string;
  platformOrganizationId?: string;
  title: string;
  objective?: string;
  audience?: string;
  language?: string;
  status?: ContentProjectStatus;
  createdById?: string;
  createdByName?: string;
}

export interface CreateCampaignInput {
  contentProjectId: string;
  organizationId: string;
  name: string;
  objective?: string;
  audience?: string;
  channels?: string[];
  startDate?: string;
  endDate?: string;
  status?: CampaignStatus;
  createdById?: string;
  createdByName?: string;
}

export interface CreateSourceInput {
  organizationId: string;
  campaignId?: string;
  contentItemId?: string;
  title: string;
  type: SourceType;
  url?: string;
  note?: string;
  fileRef?: string;
  credibility?: CredibilityLevel;
  status?: SourceStatus;
  evidenceMetadata?: Record<string, unknown>;
  createdById?: string;
  createdByName?: string;
}

export interface CreateContentItemInput {
  campaignId: string;
  organizationId: string;
  title: string;
  format: ContentFormat;
  body?: string;
  sourceRefIds?: string[];
  status?: ContentItemStatus;
  createdById?: string;
  createdByName?: string;
}

export interface SubmitReviewInput {
  contentItemId: string;
  organizationId: string;
  status: ContentReviewStatus;
  dimensions?: {
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
}

export interface SubmitApprovalInput {
  contentItemId: string;
  organizationId: string;
  approved: boolean;
  notes?: string;
  approverId?: string;
  approverName?: string;
}

export interface CreateOutputPackageInput {
  campaignId: string;
  organizationId: string;
  title: string;
  status?: OutputPackageStatus;
  includes?: {
    campaignSummary?: boolean;
    contentCalendar?: boolean;
    approvedContent?: boolean;
    complianceMemo?: boolean;
  };
  createdById?: string;
  createdByName?: string;
}

export interface DraftAssistInput {
  contentItemId: string;
  organizationId: string;
  instructions?: string;
  actorId?: string;
  actorName?: string;
}

export interface CommandCenterSummary {
  projectCount: number;
  campaignCount: number;
  contentItemCount: number;
  reviewQueueCount: number;
  approvalQueueCount: number;
  sourceCount: number;
  verifiedSourceCount: number;
  outputReadyCount: number;
}
