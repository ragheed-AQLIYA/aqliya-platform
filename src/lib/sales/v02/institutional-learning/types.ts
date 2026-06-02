// @ts-nocheck
// SalesOS v0.2 — Institutional Learning types

import type {
  SalesActivity,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";

export const INSTITUTIONAL_LEARNING_LABEL =
  "AI-assisted / evidence-based recommendation";

export type InstitutionalEvidenceSource =
  | "won_deal"
  | "lost_deal"
  | "activity"
  | "interaction"
  | "signal"
  | "proof_asset"
  | "content_asset"
  | "win_loss_insight"
  | "objection";

export interface InstitutionalLearningEvidence {
  source: InstitutionalEvidenceSource;
  refId: string;
  summary: string;
  summaryAr: string;
}

export interface ContentAssetRef {
  id: string;
  title: string;
  category?: string;
  externalUri?: string;
  stub?: boolean;
}

export interface InstitutionalLearningInput {
  organizationId: string;
  winLossInsights: SalesWinLossInsight[];
  opportunities: SalesOpportunity[];
  activities: SalesActivity[];
  interactions: SalesInteractionLog[];
  signals: SalesSignal[];
  proofAssets: SalesProofAsset[];
  objections: SalesObjection[];
  contentAssetRefs?: ContentAssetRef[];
}

export interface InstitutionalLearningPattern {
  id: string;
  patternType:
    | "win_theme"
    | "loss_theme"
    | "signal_cluster"
    | "proof_correlation"
    | "activity_theme";
  label: string;
  labelAr: string;
  count: number;
  confidence: number;
  recommendation: string;
  recommendationAr: string;
  evidence: InstitutionalLearningEvidence[];
  insightLabel: typeof INSTITUTIONAL_LEARNING_LABEL;
  outputStatus: "recommendation";
}

export interface InstitutionalLearningTrend {
  id: string;
  trendType: "win_rate" | "activity_volume" | "signal_strength";
  metric: string;
  metricAr: string;
  direction: "up" | "down" | "stable" | "insufficient_data";
  currentValue: number;
  priorValue?: number;
  confidence: number;
  evidence: InstitutionalLearningEvidence[];
  insightLabel: typeof INSTITUTIONAL_LEARNING_LABEL;
  outputStatus: "recommendation";
}

export interface InstitutionalLearningInsight {
  id: string;
  dimension: "win_loss" | "engagement" | "proof" | "market" | "content";
  title: string;
  titleAr: string;
  narrative: string;
  narrativeAr: string;
  confidence: number;
  evidence: InstitutionalLearningEvidence[];
  insightLabel: typeof INSTITUTIONAL_LEARNING_LABEL;
  outputStatus: "recommendation";
}

export interface InstitutionalLearningRecommendation {
  id: string;
  ruleId: string;
  priority: "high" | "medium" | "low";
  title: string;
  titleAr: string;
  reasoning: string;
  reasoningAr: string;
  confidence: number;
  evidence: InstitutionalLearningEvidence[];
  insightLabel: typeof INSTITUTIONAL_LEARNING_LABEL;
  outputStatus: "recommendation";
}

export interface InstitutionalLearningSnapshot {
  organizationId: string;
  generatedAt: string;
  disclaimer: string;
  disclaimerAr: string;
  recommendationLabel: typeof INSTITUTIONAL_LEARNING_LABEL;
  overallConfidence: number;
  closedWonCount: number;
  closedLostCount: number;
  contentAssetRefs: ContentAssetRef[];
  insights: InstitutionalLearningInsight[];
  patterns: InstitutionalLearningPattern[];
  trends: InstitutionalLearningTrend[];
  recommendations: InstitutionalLearningRecommendation[];
}
