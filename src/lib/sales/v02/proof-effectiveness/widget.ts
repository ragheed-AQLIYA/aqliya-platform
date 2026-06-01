import type { ProofEffectivenessReport } from "./types";

/** Compact DTO for Agent 6 command-center / NBA surfaces. */
export interface ProofEffectivenessWidgetSummary {
  outputStatus: "draft";
  disclaimer: string;
  topAssets: Array<{
    id: string;
    title: string;
    assetType: string;
    effectivenessScore: number;
    rank: number;
  }>;
}

export function toProofEffectivenessWidgetSummary(
  report: ProofEffectivenessReport,
  limit = 3,
): ProofEffectivenessWidgetSummary {
  return {
    outputStatus: "draft",
    disclaimer: report.disclaimer,
    topAssets: report.rankedAssets.slice(0, limit).map((asset) => ({
      id: asset.assetId,
      title: asset.title,
      assetType: asset.assetType,
      effectivenessScore: asset.effectivenessScore,
      rank: asset.rank,
    })),
  };
}
