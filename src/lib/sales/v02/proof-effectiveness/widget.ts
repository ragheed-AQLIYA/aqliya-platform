import type {
  ProofEffectivenessSnapshot,
  ProofEffectivenessWidgetSummary,
} from "./types";
import {
  PROOF_EFFECTIVENESS_DISCLAIMER_AR,
  PROOF_EFFECTIVENESS_DISCLAIMER_EN,
} from "./types";

export function toProofEffectivenessWidgetSummary(
  snapshot: ProofEffectivenessSnapshot,
  limit = 5,
): ProofEffectivenessWidgetSummary {
  return {
    organizationId: snapshot.organizationId,
    generatedAt: snapshot.generatedAt,
    topAssets: snapshot.rankedAssets.slice(0, limit).map((row) => ({
      rank: row.rank,
      assetId: row.assetId,
      title: row.title,
      assetType: row.assetType,
      effectivenessScore: row.effectivenessScore,
      winRate: row.winContribution.winRate,
      linkedOpportunityCount: row.usage.linkedOpportunityCount,
    })),
    disclaimerEn: PROOF_EFFECTIVENESS_DISCLAIMER_EN,
    disclaimerAr: PROOF_EFFECTIVENESS_DISCLAIMER_AR,
    outputStatus: "recommendation",
  };
}
