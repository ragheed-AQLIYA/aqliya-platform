// @ts-nocheck
import { suggestProofAssetsForObjection } from "../../proof-linkage-service";
import type { SalesProofAsset } from "../../types";
import {
  preferredAssetTypesForIndustry,
  preferredAssetTypesForObjection,
} from "./categorization";
import { scoreProofRelevance } from "./relevance";
import type { ProofRecommendation, ProofRelevanceContext } from "./types";

function toRecommendation(
  asset: SalesProofAsset,
  score: number,
  rationale: string,
): ProofRecommendation {
  return {
    assetId: asset.id,
    title: asset.title,
    assetType: asset.assetType,
    relevanceScore: score,
    rationale,
    recommendationOnly: true,
  };
}

export function recommendProofForContext(
  proofAssets: SalesProofAsset[],
  context: ProofRelevanceContext,
  limit = 5,
): ProofRecommendation[] {
  const active = proofAssets.filter(
    (p) =>
      p.organizationId === context.organizationId &&
      (p.status === "active" || p.status === "draft"),
  );

  const scored = active
    .map((asset) => ({
      asset,
      score: scoreProofRelevance(asset, context),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ asset, score }) => {
    let rationale = "Relevant proof asset for current commercial context";
    if (context.objectionCategory) {
      rationale = `Supports ${context.objectionCategory} objection thread — recommendation only`;
    } else if (context.stage) {
      rationale = `Aligns with ${context.stage} stage proof needs — recommendation only`;
    } else if (context.industry) {
      rationale = `Fits ${context.industry} industry proof patterns — recommendation only`;
    }
    return toRecommendation(asset, score, rationale);
  });
}

export function recommendProofForObjection(
  proofAssets: SalesProofAsset[],
  organizationId: string,
  objectionCategory: string,
  limit = 5,
): ProofRecommendation[] {
  const suggested = suggestProofAssetsForObjection(
    proofAssets.filter((p) => p.organizationId === organizationId),
    objectionCategory,
  );
  const preferred = new Set(preferredAssetTypesForObjection(objectionCategory));
  const merged = [...suggested];
  for (const asset of proofAssets) {
    if (preferred.has(asset.assetType) && !merged.some((m) => m.id === asset.id)) {
      merged.push(asset);
    }
  }

  return recommendProofForContext(
    merged,
    { organizationId, objectionCategory },
    limit,
  );
}

export function recommendProofForIndustry(
  proofAssets: SalesProofAsset[],
  organizationId: string,
  industry: string,
  limit = 5,
): ProofRecommendation[] {
  const preferred = preferredAssetTypesForIndustry(industry);
  const pool = proofAssets.filter(
    (p) =>
      p.organizationId === organizationId &&
      preferred.includes(p.assetType),
  );
  return recommendProofForContext(
    pool.length ? pool : proofAssets,
    { organizationId, industry },
    limit,
  );
}
