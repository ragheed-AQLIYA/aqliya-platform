import type { SalesProofAsset, SalesProofAssetType } from "../../types";

export type ProofCommercialCategory =
  | "roi_outcomes"
  | "security_compliance"
  | "pilot_execution"
  | "customer_validation"
  | "competitive_positioning"
  | "objection_handling"
  | "general";

export type ProofNetworkScope =
  | "account"
  | "opportunity"
  | "objection"
  | "industry";

export interface ProofSearchQuery {
  organizationId: string;
  text?: string;
  assetTypes?: SalesProofAssetType[];
  accountId?: string;
  opportunityId?: string;
  industry?: string;
  objectionCategory?: string;
  limit?: number;
}

export interface ProofSearchHit {
  asset: SalesProofAsset;
  relevanceScore: number;
  matchReasons: string[];
}

export interface ProofRelevanceContext {
  organizationId: string;
  accountId?: string;
  opportunityId?: string;
  stage?: string;
  industry?: string;
  objectionCategory?: string;
}

export interface ProofRecommendation {
  assetId: string;
  title: string;
  assetType: SalesProofAssetType;
  relevanceScore: number;
  rationale: string;
  recommendationOnly: true;
}

export interface ProofLinkageGap {
  missingAssetTypes: SalesProofAssetType[];
  stage?: string;
  coveragePct: number;
  recommendations: string[];
}

export interface ProofNetworkSlice {
  scope: ProofNetworkScope;
  scopeId: string;
  label: string;
  linkedCount: number;
  searchHits: ProofSearchHit[];
  recommendations: ProofRecommendation[];
  linkage: ProofLinkageGap;
}

export interface ProofNetworkSnapshot {
  organizationId: string;
  generatedAt: string;
  totalAssets: number;
  activeAssets: number;
  byAccount: ProofNetworkSlice[];
  byOpportunity: ProofNetworkSlice[];
  byObjection: ProofNetworkSlice[];
  byIndustry: ProofNetworkSlice[];
  crossProductCandidateCount: number;
}

export interface ProofNetworkBuildInput {
  organizationId: string;
  proofAssets: SalesProofAsset[];
  accountIds: string[];
  accountIndustryById: Record<string, string | undefined>;
  opportunityIds: string[];
  opportunityStageById: Record<string, string | undefined>;
  opportunityAccountById: Record<string, string | undefined>;
  objections: Array<{ id: string; category: string; accountId?: string; opportunityId?: string }>;
  industries: string[];
}
