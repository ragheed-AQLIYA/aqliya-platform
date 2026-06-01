import type {
  SalesEntityStatus,
  SalesProofAssetType,
} from "../../types";

export interface ProofUsageMetrics {
  /** Distinct opportunities where the asset is linked or referenced. */
  opportunityLinkCount: number;
  /** Distinct accounts where the asset is linked. */
  accountLinkCount: number;
  /** Activity rows referencing the asset via evidence linkage. */
  activityReferenceCount: number;
  opportunityIds: string[];
  accountIds: string[];
  /** 0–100 normalized usage score for ranking. */
  score: number;
}

export interface ProofWinContribution {
  wonOpportunityIds: string[];
  wonDealCount: number;
  wonValueTotal: number;
  lostOpportunityIds: string[];
  /** Wins / (wins + losses) among linked closed opps; null when no closed deals. */
  winRate: number | null;
  /** 0–100 normalized win contribution score. */
  score: number;
}

export interface ProofObjectionResolution {
  addressableObjectionIds: string[];
  resolvedObjectionIds: string[];
  unresolvedObjectionIds: string[];
  resolutionRate: number | null;
  categories: string[];
  /** 0–100 normalized objection-resolution score. */
  score: number;
}

export interface ProofOpportunityInfluence {
  influencedOpportunityIds: string[];
  openInfluenceCount: number;
  advancedStageCount: number;
  totalPipelineValue: number;
  /** 0–100 normalized influence score. */
  score: number;
}

export interface ProofAssetEffectiveness {
  assetId: string;
  title: string;
  assetType: SalesProofAssetType;
  status: SalesEntityStatus;
  usage: ProofUsageMetrics;
  winContribution: ProofWinContribution;
  objectionResolution: ProofObjectionResolution;
  opportunityInfluence: ProofOpportunityInfluence;
  /** Weighted composite score used for ranking (0–100). */
  effectivenessScore: number;
  rank: number;
}

export interface ProofEffectivenessReport {
  organizationId: string;
  generatedAt: string;
  outputStatus: "draft" | "recommendation";
  disclaimer: string;
  assetCount: number;
  rankedAssets: ProofAssetEffectiveness[];
  topAssetIds: string[];
}

export const PROOF_EFFECTIVENESS_DISCLAIMER =
  "Proof effectiveness rankings are draft analytics derived from linked store entities — not causal win predictions.";
