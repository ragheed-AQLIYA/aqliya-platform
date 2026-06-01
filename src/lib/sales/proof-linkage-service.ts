// ─── SalesOS proof linkage service (extends commercial-evidence patterns) ───

import { validateProductEvidenceType } from "@/lib/platform/registry/runtime";
import { SALESOS_PRODUCT_KEY } from "./core-adoption";
import {
  computeEvidenceCoverage,
  DEFAULT_COMMERCIAL_EVIDENCE_REQUIREMENTS,
  type CommercialEvidenceCategory,
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

export function validateProofAssetRef(typeId: string): boolean {
  return validateProductEvidenceType(SALESOS_PRODUCT_KEY, typeId);
}

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
    : input.proofAssets.filter((p) => p.organizationId === input.organizationId);

  const presentTypes = new Set(linkedAssets.map((a) => a.assetType));
  const requiredForStage = stage ? (STAGE_PROOF_REQUIREMENTS[stage] ?? []) : [];
  const missingAssetTypes = requiredForStage.filter((t) => !presentTypes.has(t));

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

export type { CommercialEvidenceCategory };
