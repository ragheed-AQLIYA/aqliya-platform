// @ts-nocheck
import {
  listAccounts,
  listAllInteractions,
  listICPInsights,
  listObjections,
  listOpportunities,
  listProofAssets,
  listWinLossInsights,
} from "../../store";
import type {
  SalesAccount,
  SalesICPInsight,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
  SalesWinLossInsight,
} from "../../types";
import { deriveAccountRevisit } from "./account-rules";
import {
  STRATEGIC_DISCLAIMER_AR,
  STRATEGIC_DISCLAIMER_EN,
  STRATEGIC_RECOMMENDATION_LABEL,
} from "./disclaimers";
import { groupByCategory } from "./helpers";
import { deriveIcpDriftWarnings } from "./icp-drift-rules";
import { deriveIndustryPriorities } from "./industry-rules";
import { deriveOppsAtRisk } from "./opp-rules";
import { deriveProofRecommendations } from "./proof-rules";
import type { StrategicRecommendationsSnapshot } from "./types";

export interface StrategicRecommendationsInput {
  organizationId: string;
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  objections: SalesObjection[];
  proofAssets: SalesProofAsset[];
  icpInsights: SalesICPInsight[];
  winLossInsights: SalesWinLossInsight[];
  interactions: SalesInteractionLog[];
  now?: Date;
}

export function buildStrategicRecommendationsSnapshot(
  input: StrategicRecommendationsInput,
): StrategicRecommendationsSnapshot {
  const now = input.now ?? new Date();
  const all = [
    ...deriveIndustryPriorities(input),
    ...deriveProofRecommendations(input),
    ...deriveAccountRevisit({ ...input, now }),
    ...deriveOppsAtRisk({ ...input, now }),
    ...deriveIcpDriftWarnings(input),
  ];

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const recommendations = all.sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      b.confidence - a.confidence,
  );

  const overallConfidence =
    recommendations.length > 0
      ? recommendations.reduce((s, r) => s + r.confidence, 0) /
        recommendations.length
      : 0.35;

  return {
    organizationId: input.organizationId,
    recommendations,
    byCategory: groupByCategory(recommendations),
    overallConfidence,
    disclaimer: STRATEGIC_DISCLAIMER_EN,
    disclaimerAr: STRATEGIC_DISCLAIMER_AR,
    recommendationLabel: STRATEGIC_RECOMMENDATION_LABEL,
  };
}

export function loadStrategicRecommendationsFromStore(
  organizationId: string,
  now?: Date,
): StrategicRecommendationsSnapshot {
  return buildStrategicRecommendationsSnapshot({
    organizationId,
    accounts: listAccounts(organizationId),
    opportunities: listOpportunities(organizationId),
    objections: listObjections(organizationId),
    proofAssets: listProofAssets(organizationId),
    icpInsights: listICPInsights(organizationId),
    winLossInsights: listWinLossInsights(organizationId),
    interactions: listAllInteractions(organizationId),
    now,
  });
}
