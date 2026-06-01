export const MARKET_INTEL_LABEL =
  "AI-assisted / evidence-based recommendation" as const;

export const MARKET_INTEL_DISCLAIMER_AR =
  "ذكاء السوق — مسودة مساعدة مبنية على قواعد وأدلة تشغيلية. المراجعة البشرية مطلوبة قبل أي قرار go-to-market.";

export const MARKET_INTEL_DISCLAIMER_EN =
  "Market intelligence — rule-based draft assistant grounded in operational evidence. Human review required before go-to-market decisions.";

export type MarketSignalCategory =
  | "industry"
  | "competitor"
  | "macro"
  | "buying"
  | "timing"
  | "regulatory";

export type MarketSignalSource =
  | "stored_signal"
  | "stored_competitor"
  | "interaction"
  | "icp_insight"
  | "win_loss"
  | "account_industry"
  | "opportunity";

export type MarketSignalSeverity = "low" | "medium" | "high";

export interface MarketSignal {
  id: string;
  category: MarketSignalCategory;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
  source: MarketSignalSource;
  sourceRef?: string;
  accountId?: string;
  opportunityId?: string;
  industry?: string;
  collectedAt: string;
}

export interface IndustrySignal extends MarketSignal {
  category: "industry";
  industry: string;
  accountCount: number;
  pipelineValue: number;
  wonCount: number;
  trend: "expanding" | "stable" | "contracting";
}

export interface CompetitorSignal extends MarketSignal {
  category: "competitor";
  competitorName: string;
  mentionCount: number;
  threatLevel: "low" | "medium" | "high";
  affectedOpportunityIds: string[];
}

export interface MarketInsight {
  id: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  category: MarketSignalCategory;
  score: number;
  confidence: number;
  severity: MarketSignalSeverity;
  signalIds: string[];
  recommendation: string;
  recommendationAr: string;
  insightLabel: typeof MARKET_INTEL_LABEL;
  outputStatus: "draft" | "recommendation";
}

export interface MarketIntelligenceSnapshot {
  organizationId: string;
  collectedAt: string;
  signals: MarketSignal[];
  industrySignals: IndustrySignal[];
  competitorSignals: CompetitorSignal[];
  insights: MarketInsight[];
  overallScore: number;
  topIndustry?: IndustrySignal;
  topCompetitor?: CompetitorSignal;
  disclaimerAr: string;
  disclaimerEn: string;
}

export interface MarketIntelligenceInput {
  organizationId: string;
  accounts: import("../../types").SalesAccount[];
  opportunities: import("../../types").SalesOpportunity[];
  interactions: import("../../types").SalesInteractionLog[];
  signals: import("../../types").SalesSignal[];
  competitorMentions: import("../../types").SalesCompetitorMention[];
  icpInsights: import("../../types").SalesICPInsight[];
  winLossInsights: import("../../types").SalesWinLossInsight[];
}
