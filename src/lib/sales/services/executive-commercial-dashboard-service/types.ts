import type { CommercialRecommendation } from "@/lib/sales/vnext/commercial-recommendations";
import type { RevenueIntelligenceSnapshot } from "@/lib/sales/vnext/revenue-intelligence";
import type { ExecutiveSectionStatus, ExecutiveCommercialSection } from "./common";

export interface ExecutiveCommercialRevenue {
  totalPipeline: number;
  weightedForecast: number;
  forecastConfidence: RevenueIntelligenceSnapshot["forecastConfidence"];
  pipelineCoverageLevel: RevenueIntelligenceSnapshot["pipelineCoverage"]["level"];
  pipelineCoverageLabelAr: string;
  coverageRatioPct: number;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  lostValue: number;
  riskFlagCount: number;
  noteCount: number;
}

export interface ExecutiveCommercialPipeline {
  totalValue: number;
  weightedValue: number;
  activeOpportunityCount: number;
  stalledCount: number;
  dealsRequiringReview: number;
  avgQualificationScore: number;
  topStages: Array<{ stage: string; count: number; pct: number }>;
}

export interface ExecutiveCommercialIcp {
  hypothesisAr: string;
  overallConfidencePct: number;
  topFitSegments: Array<{ labelAr: string; pct: number }>;
  reviewQueueCount: number;
}

export interface ExecutiveCommercialProof {
  activeAssetCount: number;
  linkedOpportunityCount: number;
  assetTypes: Array<{ type: string; count: number }>;
  coverageGapHintAr: string | null;
  topEffectiveAssets: Array<{ title: string; score: number; linkedCount: number }>;
}

export interface ExecutiveCommercialSignal {
  label: string;
  count: number;
  source: string;
}

export interface ExecutiveCommercialRecommendationRow {
  id: string;
  titleAr: string;
  priority: CommercialRecommendation["priority"];
  reasoningAr: string;
  category: CommercialRecommendation["category"];
  confidencePct: number;
  href?: string;
}

export interface ExecutiveCommercialLearningTrend {
  id: string;
  labelAr: string;
  direction: "up" | "down" | "stable" | "insufficient_data";
  confidencePct: number;
  summaryAr: string;
}

export interface ExecutiveCommercialRisk {
  id: string;
  labelAr: string;
  severity: "high" | "medium" | "low";
  source: string;
  href?: string;
}

export interface ExecutiveCommercialSnapshot {
  organizationId: string;
  generatedAt: string;
  disclaimerAr: string;
  revenue: ExecutiveCommercialSection<ExecutiveCommercialRevenue>;
  pipeline: ExecutiveCommercialSection<ExecutiveCommercialPipeline>;
  icp: ExecutiveCommercialSection<ExecutiveCommercialIcp>;
  proof: ExecutiveCommercialSection<ExecutiveCommercialProof>;
  signals: ExecutiveCommercialSection<ExecutiveCommercialSignal[]>;
  recommendations: ExecutiveCommercialSection<ExecutiveCommercialRecommendationRow[]>;
  learningTrends: ExecutiveCommercialSection<ExecutiveCommercialLearningTrend[]>;
  executiveRisks: ExecutiveCommercialSection<ExecutiveCommercialRisk[]>;
}
