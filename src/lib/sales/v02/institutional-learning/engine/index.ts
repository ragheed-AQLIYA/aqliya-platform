// SalesOS v0.2 Institutional Learning — engine barrel

import { deriveWinLossPatterns } from "./patterns";
import { deriveTrends } from "./trends";
import { deriveInsights } from "./insights";
import { deriveRecommendations } from "./recommendations";
import {
  INSTITUTIONAL_LEARNING_LABEL,
  INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
  INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
  overallConfidence,
} from "./common";
import type { InstitutionalLearningInput, InstitutionalLearningSnapshot } from "../types";

export { deriveWinLossPatterns } from "./patterns";
export { deriveTrends } from "./trends";
export { deriveInsights } from "./insights";
export { deriveRecommendations } from "./recommendations";
export {
  INSTITUTIONAL_LEARNING_LABEL,
  INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
  INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
  PATTERN_MIN_COUNT,
  MS_30_DAYS,
  evidence,
  patternConfidence,
  reasonLabelAr,
  bucketReasons,
  overallConfidence,
} from "./common";

export function buildInstitutionalLearningSnapshot(
  input: InstitutionalLearningInput,
): InstitutionalLearningSnapshot {
  const patterns = deriveWinLossPatterns(input);
  const trends = deriveTrends(input);
  const insights = deriveInsights(patterns, trends, input);
  const recommendations = deriveRecommendations(patterns, insights, input);

  return {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    disclaimer: INSTITUTIONAL_LEARNING_DISCLAIMER_EN,
    disclaimerAr: INSTITUTIONAL_LEARNING_DISCLAIMER_AR,
    recommendationLabel: INSTITUTIONAL_LEARNING_LABEL,
    overallConfidence: overallConfidence(patterns, insights),
    closedWonCount: (input.wonDeals ?? []).length,
    closedLostCount: (input.lostDeals ?? []).length,
    contentAssetRefs: input.contentAssetRefs ?? [],
    insights,
    patterns,
    trends,
    recommendations,
  };
}
