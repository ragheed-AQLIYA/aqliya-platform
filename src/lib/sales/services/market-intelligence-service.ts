import {
  buildWaveBMarketIntelligenceFromInput,
  buildWaveBMarketIntelligenceView,
  type BuildMarketIntelligenceSnapshotInput,
  type WaveBMarketIntelligenceView,
} from "../vnext/market-intelligence";
import type { MarketIntelligenceSnapshot } from "../v02/market-intelligence";
import { buildMarketIntelligenceSnapshot } from "../v02/market-intelligence";
import {
  listAccounts,
  listAllInteractions,
  listCompetitorMentions,
  listOpportunities,
  listSignals,
  listWinLossInsights,
} from "../store";

export type { WaveBMarketIntelligenceView, MarketIntelligenceSnapshot };

export {
  MARKET_INTELLIGENCE_WAVE_B_RECOMMENDATION_LABEL,
  MARKET_INTELLIGENCE_WAVE_B_DISCLAIMER_EN,
  MARKET_INTELLIGENCE_WAVE_B_DISCLAIMER_AR,
} from "../vnext/market-intelligence";

export function salesBuildMarketIntelligenceSnapshot(
  input: BuildMarketIntelligenceSnapshotInput,
): MarketIntelligenceSnapshot {
  return buildMarketIntelligenceSnapshot(input);
}

export function salesBuildMarketIntelligenceView(
  input: BuildMarketIntelligenceSnapshotInput,
  aggregatedAt?: string,
): WaveBMarketIntelligenceView {
  return buildWaveBMarketIntelligenceFromInput(input, aggregatedAt);
}

export function salesGetMarketIntelligenceForOrg(
  organizationId: string,
): WaveBMarketIntelligenceView {
  return salesBuildMarketIntelligenceView({
    organizationId,
    accounts: listAccounts(organizationId),
    opportunities: listOpportunities(organizationId),
    interactions: listAllInteractions(organizationId),
    storedSignals: listSignals(organizationId),
    competitorMentions: listCompetitorMentions(organizationId),
    winLossInsights: listWinLossInsights(organizationId),
  });
}

export function salesTransformSnapshotToWaveBView(
  snapshot: MarketIntelligenceSnapshot,
  aggregatedAt = new Date().toISOString(),
): WaveBMarketIntelligenceView {
  return buildWaveBMarketIntelligenceView(snapshot, aggregatedAt);
}
