import {
  listActivities,
  listObjections,
  listOpportunities,
  listProofAssets,
  listWinLossInsights,
} from "../../store";
import type {
  SalesActivity,
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
  SalesWinLossInsight,
} from "../../types";

/** Read-only snapshot of store entities used for proof analytics. */
export interface ProofEffectivenessStoreSnapshot {
  organizationId: string;
  proofAssets: SalesProofAsset[];
  opportunities: SalesOpportunity[];
  objections: SalesObjection[];
  winLossInsights: SalesWinLossInsight[];
  activities: SalesActivity[];
}

export function readProofEffectivenessSnapshot(
  organizationId: string,
): ProofEffectivenessStoreSnapshot {
  return {
    organizationId,
    proofAssets: listProofAssets(organizationId),
    opportunities: listOpportunities(organizationId),
    objections: listObjections(organizationId),
    winLossInsights: listWinLossInsights(organizationId),
    activities: listActivities(organizationId),
  };
}
