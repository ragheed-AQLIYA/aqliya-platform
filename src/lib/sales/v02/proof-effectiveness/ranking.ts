import type { ProofAssetEffectivenessRow } from "./types";

export function rankProofAssetsByEffectiveness(
  assets: ProofAssetEffectivenessRow[],
): ProofAssetEffectivenessRow[] {
  return [...assets].sort((a, b) => {
    if (b.effectivenessScore !== a.effectivenessScore) {
      return b.effectivenessScore - a.effectivenessScore;
    }
    if (b.usage.usageScore !== a.usage.usageScore) {
      return b.usage.usageScore - a.usage.usageScore;
    }
    return a.title.localeCompare(b.title);
  });
}

export function getTopProofAssets(
  assets: ProofAssetEffectivenessRow[],
  limit = 5,
): ProofAssetEffectivenessRow[] {
  return rankProofAssetsByEffectiveness(assets).slice(0, limit);
}
