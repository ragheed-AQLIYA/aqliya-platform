import type {
  SalesAccount,
  SalesCompetitorMention,
  SalesInteractionLog,
  SalesOpportunity,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";
import { collectMarketSignals, dedupeCollectedSignals } from "./collect";
import { categorizeMarketSignals, countSignalsByCategory } from "./categorize";
import {
  computeOverallMarketScore,
  scoreCompetitorSignals,
  scoreIndustrySignals,
  scoreMarketSignals,
} from "./score";
import { summarizeMarketIntelligence } from "./summarize";
import type { MarketIntelligenceSnapshot } from "./types";
import {
  MARKET_INTELLIGENCE_DISCLAIMER_AR,
  MARKET_INTELLIGENCE_DISCLAIMER_EN,
  MARKET_INTELLIGENCE_RECOMMENDATION_LABEL,
  MARKET_SIGNAL_CATEGORIES,
} from "./types";

export interface BuildMarketIntelligenceSnapshotInput {
  organizationId: string;
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  storedSignals?: SalesSignal[];
  competitorMentions?: SalesCompetitorMention[];
  winLossInsights?: SalesWinLossInsight[];
}

export function buildMarketIntelligenceSnapshot(
  input: BuildMarketIntelligenceSnapshotInput,
): MarketIntelligenceSnapshot {
  const collected = dedupeCollectedSignals(
    collectMarketSignals({
      organizationId: input.organizationId,
      storedSignals: input.storedSignals,
      interactions: input.interactions,
      opportunities: input.opportunities,
      winLossInsights: input.winLossInsights,
      competitorMentions: input.competitorMentions,
    }),
  );

  const marketSignals = scoreMarketSignals(
    categorizeMarketSignals(collected),
  );

  const industrySignals = scoreIndustrySignals({
    organizationId: input.organizationId,
    accounts: input.accounts,
    opportunities: input.opportunities,
    winLossInsights: input.winLossInsights ?? [],
    marketSignals,
  });

  const competitorSignals = scoreCompetitorSignals({
    organizationId: input.organizationId,
    competitorMentions: input.competitorMentions ?? [],
    interactions: input.interactions,
    marketSignals,
  });

  const insights = summarizeMarketIntelligence({
    organizationId: input.organizationId,
    marketSignals,
    industrySignals,
    competitorSignals,
  });

  const overallScore = computeOverallMarketScore(
    marketSignals,
    industrySignals,
    competitorSignals,
  );

  return {
    organizationId: input.organizationId,
    marketSignals: marketSignals.sort((a, b) => b.score - a.score).slice(0, 12),
    industrySignals: industrySignals.slice(0, 6),
    competitorSignals: competitorSignals.slice(0, 6),
    insights,
    overallScore,
    disclaimer: MARKET_INTELLIGENCE_DISCLAIMER_EN,
    disclaimerAr: MARKET_INTELLIGENCE_DISCLAIMER_AR,
  };
}

export { collectMarketSignals, dedupeCollectedSignals } from "./collect";
export { categorizeMarketSignals, countSignalsByCategory } from "./categorize";
export {
  computeOverallMarketScore,
  scoreCompetitorSignals,
  scoreIndustrySignals,
  scoreMarketSignals,
} from "./score";
export { summarizeMarketIntelligence } from "./summarize";
export * from "./types";
export { MARKET_INTELLIGENCE_RECOMMENDATION_LABEL, MARKET_SIGNAL_CATEGORIES };
