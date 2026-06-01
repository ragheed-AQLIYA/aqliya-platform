import type { ProofAssetEffectiveness } from "./types";

export function rankProofAssetsByEffectiveness(
  assets: ProofAssetEffectiveness[],
): ProofAssetEffectiveness[] {
  return [...assets].sort((a, b) => {
    if (b.effectivenessScore !== a.effectivenessScore) {
      return b.effectivenessScore - a.effectivenessScore;
    }
    if (b.usage.score !== a.usage.score) {
      return b.usage.score - a.usage.score;
    }
    return a.title.localeCompare(b.title);
  });
}

export function getTopProofAssets(
  assets: ProofAssetEffectiveness[],
  limit = 5,
): ProofAssetEffectiveness[] {
  return rankProofAssetsByEffectiveness(assets).slice(0, limit);
}
