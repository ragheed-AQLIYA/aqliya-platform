import {
  STAGE_PROOF_REQUIREMENTS,
} from "../../proof-linkage-service";
import type { SalesProofAsset } from "../../types";
import {
  industryKeywordHints,
  preferredAssetTypesForIndustry,
  preferredAssetTypesForObjection,
} from "./categorization";
import type { ProofRelevanceContext } from "./types";

export function scoreProofRelevance(
  asset: SalesProofAsset,
  context: ProofRelevanceContext,
): number {
  if (asset.organizationId !== context.organizationId) return 0;

  let score = asset.status === "active" ? 20 : 5;

  if (context.opportunityId) {
    if (
      asset.opportunityId === context.opportunityId ||
      asset.linkedOpportunityIds?.includes(context.opportunityId)
    ) {
      score += 30;
    }
  }

  if (context.accountId) {
    if (
      asset.accountId === context.accountId ||
      asset.linkedAccountIds?.includes(context.accountId)
    ) {
      score += 25;
    }
  }

  if (context.stage) {
    const required = STAGE_PROOF_REQUIREMENTS[context.stage] ?? [];
    if (required.includes(asset.assetType)) score += 20;
  }

  if (context.objectionCategory) {
    const preferred = preferredAssetTypesForObjection(context.objectionCategory);
    if (preferred.includes(asset.assetType)) score += 18;
    const cat = context.objectionCategory.toLowerCase();
    const blob = `${asset.title} ${asset.description ?? ""}`.toLowerCase();
    if (blob.includes(cat)) score += 10;
  }

  if (context.industry) {
    const preferred = preferredAssetTypesForIndustry(context.industry);
    if (preferred.includes(asset.assetType)) score += 12;
    const hints = industryKeywordHints(context.industry);
    const blob = `${asset.title} ${asset.description ?? ""}`.toLowerCase();
    if (hints.some((h) => blob.includes(h))) score += 8;
  }

  if (asset.externalRef) score += 8;
  if (asset.source === "ai_draft" || asset.status === "draft") score -= 12;

  return Math.max(0, Math.min(100, score));
}
