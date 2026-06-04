// @ts-nocheck
import {
  buildProofLinkageSummary,
  listProofAssetsForAccount,
  listProofAssetsForOpportunity,
  STAGE_PROOF_REQUIREMENTS,
} from "../../proof-linkage-service";
import type { SalesProofAsset } from "../../types";
import type { ProofLinkageGap } from "./types";

export function computeProofLinkageGap(
  proofAssets: SalesProofAsset[],
  organizationId: string,
  opts: { accountId?: string; opportunityId?: string; stage?: string },
): ProofLinkageGap {
  const summary = buildProofLinkageSummary(
    {
      organizationId,
      accountId: opts.accountId,
      opportunityId: opts.opportunityId,
      proofAssets,
    },
    opts.stage,
  );

  const required = opts.stage ? (STAGE_PROOF_REQUIREMENTS[opts.stage] ?? []) : [];
  const present = new Set(summary.linkedAssets.map((a) => a.assetType));
  const requiredCount = required.length || 1;
  const covered = required.filter((t) => present.has(t)).length;
  const coveragePct =
    required.length === 0
      ? summary.linkedAssets.length > 0
        ? 100
        : 0
      : Math.round((covered / requiredCount) * 100);

  return {
    missingAssetTypes: summary.missingAssetTypes,
    stage: opts.stage,
    coveragePct,
    recommendations: summary.recommendations,
  };
}

export function countLinkedProofAssets(
  proofAssets: SalesProofAsset[],
  organizationId: string,
  opts: { accountId?: string; opportunityId?: string },
): number {
  if (opts.opportunityId) {
    return listProofAssetsForOpportunity(
      proofAssets,
      organizationId,
      opts.opportunityId,
    ).length;
  }
  if (opts.accountId) {
    return listProofAssetsForAccount(
      proofAssets,
      organizationId,
      opts.accountId,
    ).length;
  }
  return proofAssets.filter(
    (p) => p.organizationId === organizationId && p.status === "active",
  ).length;
}
