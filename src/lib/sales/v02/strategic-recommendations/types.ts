// @ts-nocheck
import type { STRATEGIC_RECOMMENDATION_LABEL } from "./disclaimers";

export const STRATEGIC_RECOMMENDATION_CATEGORIES = [
  "industry_priority",
  "proof_to_use",
  "account_revisit",
  "opp_at_risk",
  "icp_drift",
] as const;

export type StrategicRecommendationCategory =
  (typeof STRATEGIC_RECOMMENDATION_CATEGORIES)[number];

export interface StrategicEvidenceItem {
  text: string;
  textAr: string;
  source:
    | "account"
    | "opportunity"
    | "interaction"
    | "stored"
    | "proof"
    | "icp"
    | "objection"
    | "win_loss"
    | "derived";
  refId?: string;
}

export interface StrategicRecommendation {
  id: string;
  category: StrategicRecommendationCategory;
  ruleId: string;
  title: string;
  titleAr: string;
  reasoning: string;
  reasoningAr: string;
  confidence: number;
  evidence: StrategicEvidenceItem[];
  accountId?: string;
  opportunityId?: string;
  industry?: string;
  proofAssetId?: string;
  href?: string;
  priority: "high" | "medium" | "low";
}

export interface StrategicRecommendationsSnapshot {
  organizationId: string;
  recommendations: StrategicRecommendation[];
  byCategory: Record<
    StrategicRecommendationCategory,
    StrategicRecommendation[]
  >;
  overallConfidence: number;
  disclaimer: string;
  disclaimerAr: string;
  recommendationLabel: typeof STRATEGIC_RECOMMENDATION_LABEL;
}
