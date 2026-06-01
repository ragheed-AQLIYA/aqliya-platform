/**
 * SalesOS vNext — Institutional Learning (Wave C facade over v0.2).
 */

import "server-only";

import { learningEvidence } from "@/lib/sales/v02/institutional-learning/evidence";
import {
  buildInstitutionalLearningSnapshot,
  INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
  INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
  INSTITUTIONAL_LEARNING_LABEL,
  type ContentAssetRef,
  type InstitutionalLearningEvidence,
  type InstitutionalLearningInput,
  type InstitutionalLearningInsight,
  type InstitutionalLearningPattern,
  type InstitutionalLearningRecommendation,
  type InstitutionalLearningSnapshot,
  type InstitutionalLearningTrend,
} from "@/lib/sales/v02/institutional-learning";
import type { WaveBMarketIntelligenceView } from "@/lib/sales/vnext/market-intelligence";

export const INSTITUTIONAL_LEARNING_WAVE_C_RECOMMENDATION_LABEL =
  INSTITUTIONAL_LEARNING_LABEL;

export const INSTITUTIONAL_LEARNING_WAVE_C_DISCLAIMER_EN =
  INSTITUTIONAL_LEARNING_DISCLAIMER_EN;

export const INSTITUTIONAL_LEARNING_WAVE_C_DISCLAIMER_AR =
  INSTITUTIONAL_LEARNING_DISCLAIMER_AR;

export type InstitutionalLearningEvidenceMap = Record<string, string[]>;

export interface WaveCInstitutionalLearningInput extends InstitutionalLearningInput {
  marketIntelligence?: WaveBMarketIntelligenceView;
}

export interface WaveCInstitutionalLearningView extends InstitutionalLearningSnapshot {
  evidenceMap: InstitutionalLearningEvidenceMap;
  aggregateConfidence: number;
  marketIntelligenceIncluded: boolean;
}

function uniqueEvidence(items: Array<string | undefined>): string[] {
  return [...new Set(items.filter((item): item is string => Boolean(item?.trim())))];
}

function rowEvidenceStrings(
  evidence: InstitutionalLearningEvidence[],
): string[] {
  return uniqueEvidence(evidence.map((e) => e.summary));
}

export function buildInstitutionalLearningEvidenceMap(
  snapshot: InstitutionalLearningSnapshot,
): InstitutionalLearningEvidenceMap {
  const map: InstitutionalLearningEvidenceMap = {};

  for (const row of snapshot.insights) {
    map[row.id] = rowEvidenceStrings(row.evidence);
  }
  for (const row of snapshot.patterns) {
    map[row.id] = rowEvidenceStrings(row.evidence);
  }
  for (const row of snapshot.trends) {
    map[row.id] = rowEvidenceStrings(row.evidence);
  }
  for (const row of snapshot.recommendations) {
    map[row.id] = rowEvidenceStrings(row.evidence);
  }

  return map;
}

export function computeAggregateInstitutionalConfidence(
  snapshot: Pick<
    InstitutionalLearningSnapshot,
    "insights" | "patterns" | "trends" | "recommendations"
  >,
): number {
  const scores = [
    ...snapshot.insights.map((row) => row.confidence),
    ...snapshot.patterns.map((row) => row.confidence),
    ...snapshot.trends.map((row) => row.confidence),
    ...snapshot.recommendations.map((row) => row.confidence),
  ];
  if (!scores.length) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
}

function mergeMarketIntelligence(
  snapshot: InstitutionalLearningSnapshot,
  market?: WaveBMarketIntelligenceView,
): InstitutionalLearningSnapshot {
  if (!market) return snapshot;

  const extraInsights: InstitutionalLearningInsight[] = [];
  const extraPatterns: InstitutionalLearningPattern[] = [];
  const extraRecommendations: InstitutionalLearningRecommendation[] = [];

  for (const insight of market.insights.slice(0, 3)) {
    const evidenceLines = uniqueEvidence([
      ...(market.evidenceMap[insight.id] ?? []),
      ...insight.evidence,
    ]);
    if (!evidenceLines.length) continue;

    extraInsights.push({
      id: `il-insight-market-${insight.id}`,
      dimension: "market",
      title: insight.title,
      titleAr: insight.titleAr,
      narrative: insight.summary,
      narrativeAr: insight.summaryAr,
      confidence: insight.confidence,
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: evidenceLines.slice(0, 4).map((line, idx) =>
        learningEvidence(
          "signal",
          `${insight.id}-${idx}`,
          line,
          line,
        ),
      ),
    });
  }

  for (const competitor of market.topCompetitorSignals.filter(
    (row) => row.mentionCount >= 2,
  )) {
    const evidenceLines = uniqueEvidence([
      ...(market.evidenceMap[competitor.id] ?? []),
      ...competitor.contexts,
    ]);
    if (!evidenceLines.length) continue;

    extraPatterns.push({
      id: `il-pattern-market-comp-${competitor.id}`,
      patternType: "signal_cluster",
      label: `Competitor pressure: ${competitor.competitorName}`,
      labelAr: `ضغط منافس: ${competitor.competitorName}`,
      count: competitor.mentionCount,
      recommendation:
        "Review proof and differentiation while competitor mentions cluster — draft only.",
      recommendationAr: "راجع الإثبات والتميز — مسودة فقط.",
      confidence: Math.min(0.88, 0.45 + competitor.mentionCount * 0.1),
      outputStatus: "recommendation",
      insightLabel: INSTITUTIONAL_LEARNING_LABEL,
      evidence: evidenceLines.slice(0, 4).map((line, idx) =>
        learningEvidence(
          "signal",
          `${competitor.id}-${idx}`,
          line,
          line,
        ),
      ),
    });
  }

  const topIndustry = market.topIndustrySignals[0];
  if (topIndustry) {
    const evidenceLines = uniqueEvidence([
      ...(market.evidenceMap[topIndustry.id] ?? []),
      ...topIndustry.evidence,
    ]);
    if (evidenceLines.length >= 1) {
      extraInsights.push({
        id: `il-insight-market-industry-${topIndustry.id}`,
        dimension: "market",
        title: topIndustry.label,
        titleAr: topIndustry.labelAr,
        narrative: `${topIndustry.accountCount} accounts · ${topIndustry.activeOpportunityCount} active opportunities`,
        narrativeAr: `${topIndustry.accountCount} حساب · ${topIndustry.activeOpportunityCount} فرص نشطة`,
        confidence: Math.min(0.85, 0.5 + topIndustry.score * 0.05),
        outputStatus: "recommendation",
        insightLabel: INSTITUTIONAL_LEARNING_LABEL,
        evidence: evidenceLines.slice(0, 4).map((line, idx) =>
          learningEvidence(
            "signal",
            `${topIndustry.id}-${idx}`,
            line,
            line,
          ),
        ),
      });
    }
  }

  const competitiveInsight = market.insights.find(
    (row) => row.insightType === "competitive_pressure",
  );
  if (competitiveInsight) {
    const evidenceLines = uniqueEvidence([
      ...(market.evidenceMap[competitiveInsight.id] ?? []),
      ...competitiveInsight.evidence,
    ]);
    if (evidenceLines.length >= 1) {
      extraRecommendations.push({
        id: `il-rec-market-competitive-${competitiveInsight.id}`,
        ruleId: "market_competitive_review",
        priority: "medium",
        title: "Review competitive positioning from market signals",
        titleAr: "راجع التموضع التنافسي من إشارات السوق",
        reasoning: competitiveInsight.summary,
        reasoningAr: competitiveInsight.summaryAr,
        confidence: competitiveInsight.confidence,
        outputStatus: "recommendation",
        insightLabel: INSTITUTIONAL_LEARNING_LABEL,
        evidence: evidenceLines.slice(0, 4).map((line, idx) =>
          learningEvidence(
            "signal",
            `${competitiveInsight.id}-${idx}`,
            line,
            line,
          ),
        ),
      });
    }
  }

  const merged: InstitutionalLearningSnapshot = {
    ...snapshot,
    insights: [...snapshot.insights, ...extraInsights].filter(
      (row) => row.evidence.length > 0,
    ),
    patterns: [...snapshot.patterns, ...extraPatterns].filter(
      (row) => row.evidence.length > 0,
    ),
    recommendations: [...snapshot.recommendations, ...extraRecommendations].filter(
      (row) => row.evidence.length > 0,
    ),
  };

  merged.overallConfidence = computeAggregateInstitutionalConfidence(merged);
  return merged;
}

export function buildWaveCInstitutionalLearningView(
  snapshot: InstitutionalLearningSnapshot,
  marketIntelligenceIncluded = false,
): WaveCInstitutionalLearningView {
  return {
    ...snapshot,
    evidenceMap: buildInstitutionalLearningEvidenceMap(snapshot),
    aggregateConfidence: computeAggregateInstitutionalConfidence(snapshot),
    marketIntelligenceIncluded,
  };
}

export function buildWaveCInstitutionalLearningSnapshot(
  input: WaveCInstitutionalLearningInput,
): WaveCInstitutionalLearningView {
  const base = buildInstitutionalLearningSnapshot(input);
  const merged = mergeMarketIntelligence(base, input.marketIntelligence);
  return buildWaveCInstitutionalLearningView(
    merged,
    Boolean(input.marketIntelligence),
  );
}

export function institutionalLearningRowElementId(rowId: string): string {
  return `institutional-learning-row-${rowId}`;
}

export {
  buildInstitutionalLearningSnapshot,
  INSTITUTIONAL_LEARNING_LABEL,
  INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
  INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
} from "@/lib/sales/v02/institutional-learning";

export type {
  ContentAssetRef,
  InstitutionalLearningEvidence,
  InstitutionalLearningInput,
  InstitutionalLearningInsight,
  InstitutionalLearningPattern,
  InstitutionalLearningRecommendation,
  InstitutionalLearningSnapshot,
  InstitutionalLearningTrend,
} from "@/lib/sales/v02/institutional-learning";
