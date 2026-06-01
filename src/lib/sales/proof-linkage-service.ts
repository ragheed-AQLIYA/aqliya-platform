import {
  computeEvidenceCoverage,
  DEFAULT_COMMERCIAL_EVIDENCE_REQUIREMENTS,
  type CommercialEvidenceRecord,
} from "./vnext/commercial-evidence";
import type { SalesProofAsset, SalesProofAssetType } from "./types";

export interface ProofLinkageInput {
  organizationId: string;
  accountId?: string;
  opportunityId?: string;
  proofAssets: SalesProofAsset[];
  commercialEvidence?: CommercialEvidenceRecord[];
}

export interface ProofLinkageSummary {
  linkedAssets: SalesProofAsset[];
  missingAssetTypes: SalesProofAssetType[];
  evidenceCoverage: ReturnType<typeof computeEvidenceCoverage>;
  recommendations: string[];
}

export const STAGE_PROOF_REQUIREMENTS: Partial<
  Record<string, SalesProofAssetType[]>
> = {
  Proposal: ["proposal", "case_study"],
  Pilot: ["pilot_result", "demo_recording"],
  Negotiation: ["customer_quote", "benchmark"],
};

export function listProofAssetsForOpportunity(
  proofAssets: SalesProofAsset[],
  organizationId: string,
  opportunityId: string,
): SalesProofAsset[] {
  return proofAssets.filter(
    (p) =>
      p.organizationId === organizationId &&
      p.status === "active" &&
      (p.linkedOpportunityIds?.includes(opportunityId) ||
        p.opportunityId === opportunityId),
  );
}

export function listProofAssetsForAccount(
  proofAssets: SalesProofAsset[],
  organizationId: string,
  accountId: string,
): SalesProofAsset[] {
  return proofAssets.filter(
    (p) =>
      p.organizationId === organizationId &&
      p.status === "active" &&
      (p.linkedAccountIds?.includes(accountId) ?? false),
  );
}

export function linkProofAssetToOpportunity(
  asset: SalesProofAsset,
  opportunityId: string,
): SalesProofAsset {
  const linked = new Set(asset.linkedOpportunityIds ?? []);
  linked.add(opportunityId);
  return {
    ...asset,
    linkedOpportunityIds: [...linked],
    updatedAt: new Date().toISOString(),
  };
}

export function linkProofAssetToAccount(
  asset: SalesProofAsset,
  accountId: string,
): SalesProofAsset {
  const linked = new Set(asset.linkedAccountIds ?? []);
  linked.add(accountId);
  return {
    ...asset,
    linkedAccountIds: [...linked],
    updatedAt: new Date().toISOString(),
  };
}

export function buildProofLinkageSummary(
  input: ProofLinkageInput,
  stage?: string,
): ProofLinkageSummary {
  const linkedAssets = input.opportunityId
    ? listProofAssetsForOpportunity(
        input.proofAssets,
        input.organizationId,
        input.opportunityId,
      )
    : input.accountId
      ? listProofAssetsForAccount(
          input.proofAssets,
          input.organizationId,
          input.accountId,
        )
      : input.proofAssets.filter(
          (p) => p.organizationId === input.organizationId,
        );

  const presentTypes = new Set(linkedAssets.map((a) => a.assetType));
  const requiredForStage = stage ? (STAGE_PROOF_REQUIREMENTS[stage] ?? []) : [];
  const missingAssetTypes = requiredForStage.filter(
    (t) => !presentTypes.has(t),
  );

  const evidenceCoverage = computeEvidenceCoverage(
    input.commercialEvidence ?? [],
    DEFAULT_COMMERCIAL_EVIDENCE_REQUIREMENTS,
  );

  const recommendations: string[] = [];
  if (missingAssetTypes.length > 0) {
    recommendations.push(
      `Consider linking proof assets: ${missingAssetTypes.join(", ")} — recommendation only`,
    );
  }
  if (evidenceCoverage.missing.length > 0) {
    recommendations.push(
      `Commercial evidence gaps: ${evidenceCoverage.missing.join(", ")}`,
    );
  }

  return {
    linkedAssets,
    missingAssetTypes,
    evidenceCoverage,
    recommendations,
  };
}

export function suggestProofAssetsForObjection(
  proofAssets: SalesProofAsset[],
  objectionCategory: string,
): SalesProofAsset[] {
  const categoryLower = objectionCategory.toLowerCase();
  return proofAssets.filter(
    (p) =>
      p.assetType === "objection_response" ||
      p.title.toLowerCase().includes(categoryLower) ||
      (p.description?.toLowerCase().includes(categoryLower) ?? false),
  );
}
