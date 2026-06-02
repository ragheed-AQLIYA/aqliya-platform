// @ts-nocheck
import type { SalesProofAssetType } from "../../types";

export const PROOF_EFFECTIVENESS_DISCLAIMER_EN =
  "Evidence-based proof effectiveness ranking - recommendation only. Correlation does not imply causation. Human review required before changing proof strategy.";

export const PROOF_EFFECTIVENESS_DISCLAIMER_AR =
  "Proof effectiveness ranking - recommendation only. Human review required before changing proof strategy.";

export interface ProofEffectivenessEvidenceItem {
  text: string;
  textAr: string;
  source:
    | "proof_asset"
    | "objection"
    | "opportunity"
    | "win_loss"
    | "interaction";
}

export interface ProofUsageMetrics {
  linkedOpportunityCount: number;
  linkedAccountCount: number;
  hasEvidenceRef: boolean;
  usageScore: number;
}

export interface WinContributionMetrics {
  linkedWonCount: number;
  linkedLostCount: number;
  linkedOpenCount: number;
  winRate: number | null;
  attributedWonValue: number;
  winContributionScore: number;
}

export interface ObjectionResolutionMetrics {
  linkedObjectionCount: number;
  resolvedObjectionCount: number;
  resolutionRate: number | null;
  categoriesAddressed: string[];
  objectionResolutionScore: number;
}

export interface OppInfluenceMetrics {
  lateStageOpportunityCount: number;
  influencedPipelineValue: number;
  stageAdvancementSignals: number;
  oppInfluenceScore: number;
}

export interface ProofAssetEffectivenessRow {
  assetId: string;
  title: string;
  assetType: SalesProofAssetType;
  status: string;
  usage: ProofUsageMetrics;
  winContribution: WinContributionMetrics;
  objectionResolution: ObjectionResolutionMetrics;
  oppInfluence: OppInfluenceMetrics;
  effectivenessScore: number;
  rank: number;
  evidence: ProofEffectivenessEvidenceItem[];
  outputStatus: "recommendation";
}

export interface ProofEffectivenessSummary {
  totalAssets: number;
  activeAssets: number;
  topAssetId: string | null;
  topAssetTitle: string | null;
  aggregateAttributedWonValue: number;
  aggregateResolvedObjections: number;
}

export interface ProofEffectivenessSnapshot {
  organizationId: string;
  generatedAt: string;
  rankedAssets: ProofAssetEffectivenessRow[];
  summary: ProofEffectivenessSummary;
  disclaimerEn: string;
  disclaimerAr: string;
}

export interface ProofEffectivenessWidgetSummary {
  organizationId: string;
  generatedAt: string;
  topAssets: Array<{
    rank: number;
    assetId: string;
    title: string;
    assetType: SalesProofAssetType;
    effectivenessScore: number;
    winRate: number | null;
    linkedOpportunityCount: number;
  }>;
  disclaimerEn: string;
  disclaimerAr: string;
  outputStatus: "recommendation";
}
