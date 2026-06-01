/**
 * SalesOS vNext — Market Intelligence (Wave B facade over v0.2).
 * Collect → categorize → score → summarize via v02 primitives; adds evidence map
 * and aggregate confidence for UI without duplicating rule logic.
 */

import "server-only";

import { countSignalsByCategory } from "@/lib/sales/v02/market-intelligence/categorize";
import {
  buildMarketIntelligenceSnapshot,
  type BuildMarketIntelligenceSnapshotInput,
} from "@/lib/sales/v02/market-intelligence";
import type {
  CompetitorSignal,
  IndustrySignal,
  MarketInsight,
  MarketIntelligenceSnapshot,
  MarketSignal,
  MarketSignalCategory,
} from "@/lib/sales/v02/market-intelligence/types";

export const MARKET_INTELLIGENCE_WAVE_B_RECOMMENDATION_LABEL =
  "AI-assisted / evidence-based recommendation";

export const MARKET_INTELLIGENCE_WAVE_B_DISCLAIMER_EN =
  "Market signals are evidence-derived from logged SalesOS activity — not external market data. Human review required.";

export const MARKET_INTELLIGENCE_WAVE_B_DISCLAIMER_AR =
  "إشارات السوق مستخرجة من النشاط المسجل — ليست بيانات سوق خارجية. المراجعة البشرية مطلوبة.";

export type MarketIntelligenceEvidenceMap = Record<string, string[]>;

export interface WaveBMarketIntelligenceView {
  organizationId: string;
  aggregatedAt: string;
  overallScore: number;
  aggregateConfidence: number;
  topMarketSignals: MarketSignal[];
  topIndustrySignals: IndustrySignal[];
  topCompetitorSignals: CompetitorSignal[];
  insights: MarketInsight[];
  evidenceMap: MarketIntelligenceEvidenceMap;
  byCategory: Record<MarketSignalCategory, number>;
  disclaimerEn: string;
  disclaimerAr: string;
  recommendationLabel: typeof MARKET_INTELLIGENCE_WAVE_B_RECOMMENDATION_LABEL;
}

function uniqueEvidence(items: Array<string | undefined>): string[] {
  return [...new Set(items.filter((item): item is string => Boolean(item?.trim())))];
}

/** Map entity ids to human-readable evidence strings for UI surfacing. */
export function buildMarketIntelligenceEvidenceMap(
  snapshot: MarketIntelligenceSnapshot,
): MarketIntelligenceEvidenceMap {
  const map: MarketIntelligenceEvidenceMap = {};

  for (const signal of snapshot.marketSignals) {
    map[signal.id] = uniqueEvidence([
      signal.evidenceRef,
      signal.rawText,
      signal.label,
      `${signal.category} · ${signal.source}`,
    ]);
  }

  for (const industry of snapshot.industrySignals) {
    map[industry.id] = uniqueEvidence([
      ...industry.evidence,
      `${industry.accountCount} accounts · ${industry.activeOpportunityCount} opps`,
    ]);
  }

  for (const competitor of snapshot.competitorSignals) {
    map[competitor.id] = uniqueEvidence([
      ...competitor.contexts,
      `${competitor.mentionCount} mentions · ${competitor.threatLevel} threat`,
    ]);
  }

  for (const insight of snapshot.insights) {
    map[insight.id] = uniqueEvidence(insight.evidence);
  }

  return map;
}

export function computeAggregateMarketConfidence(insights: MarketInsight[]): number {
  if (insights.length === 0) return 0.45;
  const total = insights.reduce((sum, row) => sum + row.confidence, 0);
  return Math.round((total / insights.length) * 100) / 100;
}

export function buildWaveBMarketIntelligenceView(
  snapshot: MarketIntelligenceSnapshot,
  aggregatedAt = new Date().toISOString(),
): WaveBMarketIntelligenceView {
  const evidenceMap = buildMarketIntelligenceEvidenceMap(snapshot);
  const byCategory = countSignalsByCategory(snapshot.marketSignals);

  return {
    organizationId: snapshot.organizationId,
    aggregatedAt,
    overallScore: snapshot.overallScore,
    aggregateConfidence: computeAggregateMarketConfidence(snapshot.insights),
    topMarketSignals: snapshot.marketSignals.slice(0, 8),
    topIndustrySignals: snapshot.industrySignals.slice(0, 6),
    topCompetitorSignals: snapshot.competitorSignals.slice(0, 6),
    insights: snapshot.insights,
    evidenceMap,
    byCategory,
    disclaimerEn: MARKET_INTELLIGENCE_WAVE_B_DISCLAIMER_EN,
    disclaimerAr: MARKET_INTELLIGENCE_WAVE_B_DISCLAIMER_AR,
    recommendationLabel: MARKET_INTELLIGENCE_WAVE_B_RECOMMENDATION_LABEL,
  };
}

export function buildWaveBMarketIntelligenceFromInput(
  input: BuildMarketIntelligenceSnapshotInput,
  aggregatedAt = new Date().toISOString(),
): WaveBMarketIntelligenceView {
  return buildWaveBMarketIntelligenceView(
    buildMarketIntelligenceSnapshot(input),
    aggregatedAt,
  );
}

export {
  buildMarketIntelligenceSnapshot,
  collectMarketSignals,
  dedupeCollectedSignals,
  categorizeMarketSignals,
  scoreMarketSignals,
  scoreIndustrySignals,
  scoreCompetitorSignals,
  computeOverallMarketScore,
  summarizeMarketIntelligence,
  MARKET_SIGNAL_CATEGORIES,
  MARKET_INTELLIGENCE_DISCLAIMER_EN,
  MARKET_INTELLIGENCE_DISCLAIMER_AR,
  MARKET_INTELLIGENCE_RECOMMENDATION_LABEL,
} from "@/lib/sales/v02/market-intelligence";

export type {
  BuildMarketIntelligenceSnapshotInput,
  CompetitorSignal,
  IndustrySignal,
  MarketInsight,
  MarketInsightType,
  MarketIntelligenceSnapshot,
  MarketSignal,
  MarketSignalCategory,
  MarketSignalSource,
} from "@/lib/sales/v02/market-intelligence";
