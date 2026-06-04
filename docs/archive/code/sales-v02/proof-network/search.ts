// @ts-nocheck
import type { SalesProofAsset } from "../../types";
import { categorizeProofAsset } from "./categorization";
import { scoreProofRelevance } from "./relevance";
import type { ProofSearchHit, ProofSearchQuery } from "./types";

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function assetMatchesText(asset: SalesProofAsset, text: string): string[] {
  const q = normalize(text);
  const reasons: string[] = [];
  if (normalize(asset.title).includes(q)) reasons.push("title_match");
  if (asset.description && normalize(asset.description).includes(q)) {
    reasons.push("description_match");
  }
  if (asset.externalRef && normalize(asset.externalRef).includes(q)) {
    reasons.push("external_ref_match");
  }
  if (normalize(asset.assetType).includes(q)) reasons.push("asset_type_match");
  const category = categorizeProofAsset(asset);
  if (normalize(category).includes(q)) reasons.push("category_match");
  return reasons;
}

export function searchProofAssets(
  proofAssets: SalesProofAsset[],
  query: ProofSearchQuery,
): ProofSearchHit[] {
  const limit = query.limit ?? 20;
  let pool = proofAssets.filter(
    (p) => p.organizationId === query.organizationId && p.status === "active",
  );

  if (query.assetTypes?.length) {
    const types = new Set(query.assetTypes);
    pool = pool.filter((p) => types.has(p.assetType));
  }

  if (query.accountId) {
    pool = pool.filter(
      (p) =>
        p.accountId === query.accountId ||
        p.linkedAccountIds?.includes(query.accountId!),
    );
  }

  if (query.opportunityId) {
    pool = pool.filter(
      (p) =>
        p.opportunityId === query.opportunityId ||
        p.linkedOpportunityIds?.includes(query.opportunityId!),
    );
  }

  const hits: ProofSearchHit[] = [];

  for (const asset of pool) {
    const matchReasons: string[] = [];
    if (query.text) {
      const textReasons = assetMatchesText(asset, query.text);
      if (textReasons.length === 0) continue;
      matchReasons.push(...textReasons);
    }

    const relevanceScore = scoreProofRelevance(asset, {
      organizationId: query.organizationId,
      accountId: query.accountId,
      opportunityId: query.opportunityId,
      industry: query.industry,
      objectionCategory: query.objectionCategory,
    });

    if (query.industry) {
      const industryLower = normalize(query.industry);
      const blob = `${asset.title} ${asset.description ?? ""}`.toLowerCase();
      if (blob.includes(industryLower)) matchReasons.push("industry_text_match");
    }

    hits.push({
      asset,
      relevanceScore,
      matchReasons: matchReasons.length ? matchReasons : ["context_match"],
    });
  }

  return hits
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}
