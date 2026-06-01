/** SalesOS v0.2 - market intelligence entity contracts (rule-based, draft only). */

export const MARKET_SIGNAL_CATEGORIES = [
  "buying",
  "timing",
  "budget",
  "regulatory",
  "expansion",
  "risk",
] as const;

export type MarketSignalCategory = (typeof MARKET_SIGNAL_CATEGORIES)[number];

export type MarketSignalSource =
  | "stored"
  | "interaction"
  | "opportunity"
  | "win_loss";

export type MarketIntelligenceOutputStatus = "draft" | "recommendation";

export interface MarketSignal {
  id: string;
  organizationId: string;
  label: string;
  labelAr: string;
  category: MarketSignalCategory;
  source: MarketSignalSource;
  accountId?: string;
  opportunityId?: string;
  evidenceRef?: string;
  rawText?: string;
  score: number;
  outputStatus: MarketIntelligenceOutputStatus;
}

export interface IndustrySignal {
  id: string;
  organizationId: string;
  industry: string;
  label: string;
  labelAr: string;
  accountCount: number;
  activeOpportunityCount: number;
  pipelineValue: number;
  winCount: number;
  lossCount: number;
  score: number;
  outputStatus: MarketIntelligenceOutputStatus;
  evidence: string[];
}

export interface CompetitorSignal {
  id: string;
  organizationId: string;
  competitorName: string;
  mentionCount: number;
  threatLevel: "low" | "medium" | "high";
  contexts: string[];
  score: number;
  outputStatus: MarketIntelligenceOutputStatus;
  accountIds: string[];
}

export type MarketInsightType =
  | "industry_momentum"
  | "competitive_pressure"
  | "market_timing"
  | "sector_risk";

export interface MarketInsight {
  id: string;
  organizationId: string;
  insightType: MarketInsightType;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  score: number;
  confidence: number;
  outputStatus: MarketIntelligenceOutputStatus;
  evidence: string[];
}

export interface MarketIntelligenceSnapshot {
  organizationId: string;
  marketSignals: MarketSignal[];
  industrySignals: IndustrySignal[];
  competitorSignals: CompetitorSignal[];
  insights: MarketInsight[];
  overallScore: number;
  disclaimer: string;
  disclaimerAr: string;
}

export const MARKET_INTELLIGENCE_RECOMMENDATION_LABEL =
  "Rule-based market intelligence - draft recommendation";

export const MARKET_INTELLIGENCE_DISCLAIMER_EN =
  "Market signals are rule-derived from logged activity - not external market data or autonomous AI.";

export const MARKET_INTELLIGENCE_DISCLAIMER_AR =
  "\u0625\u0634\u0627\u0631\u0627\u062a \u0627\u0644\u0633\u0648\u0642 \u0645\u0633\u062a\u062e\u0631\u062c\u0629 \u0628\u0642\u0648\u0627\u0639\u062f \u0645\u0646 \u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0645\u0633\u062c\u0644 \u2014 \u0644\u064a\u0633\u062a \u0628\u064a\u0627\u0646\u0627\u062a \u0633\u0648\u0642 \u062e\u0627\u0631\u062c\u064a\u0629 \u0648\u0644\u0627 \u0630\u0643\u0627\u0621\u0627\u064b \u0645\u0633\u062a\u0642\u0644\u0627\u064b. \u0627\u0644\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0628\u0634\u0631\u064a\u0629 \u0645\u0637\u0644\u0648\u0628\u0629.";
