// @ts-nocheck
import {
  listAccounts,
  listActivities,
  listAllInteractions,
  listCompetitorMentions,
  listICPInsights,
  listObjections,
  listOpportunities,
  listProofAssets,
  listSignals,
  listWinLossInsights,
} from "../../store";
import type {
  SalesAccount,
  SalesActivity,
  SalesCompetitorMention,
  SalesICPInsight,
  SalesInteractionLog,
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
  SalesSignal,
  SalesWinLossInsight,
} from "../../types";

/** Read-only store slice used to materialize the commercial knowledge graph. */
export interface KnowledgeGraphStoreSnapshot {
  organizationId: string;
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  proofAssets: SalesProofAsset[];
  signals: SalesSignal[];
  activities: SalesActivity[];
  interactions: SalesInteractionLog[];
  objections: SalesObjection[];
  winLossInsights: SalesWinLossInsight[];
  icpInsights: SalesICPInsight[];
  competitorMentions: SalesCompetitorMention[];
}

export function readKnowledgeGraphStoreSnapshot(
  organizationId: string,
): KnowledgeGraphStoreSnapshot {
  return {
    organizationId,
    accounts: listAccounts(organizationId),
    opportunities: listOpportunities(organizationId),
    proofAssets: listProofAssets(organizationId),
    signals: listSignals(organizationId),
    activities: listActivities(organizationId),
    interactions: listAllInteractions(organizationId),
    objections: listObjections(organizationId),
    winLossInsights: listWinLossInsights(organizationId),
    icpInsights: listICPInsights(organizationId),
    competitorMentions: listCompetitorMentions(organizationId),
  };
}
