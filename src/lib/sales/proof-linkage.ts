// ─── SalesOS proof linkage (extends commercial-evidence patterns) ───

import {
  computeEvidenceCoverage,
  DEFAULT_COMMERCIAL_EVIDENCE_REQUIREMENTS,
  validateCommercialEvidence,
  type CommercialEvidenceCategory,
  type CommercialEvidenceRecord,
} from "./vnext/commercial-evidence";
import type { SalesProofAsset } from "./types";
import type { SalesEvidenceRef } from "./store";
import { linkEvidence, listEvidenceForOpportunity } from "./store";

export interface ProofLinkagePlan {
  opportunityId: string;
  evidenceCoverage: ReturnType<typeof computeEvidenceCoverage>;
  proofAssets: SalesProofAsset[];
  gaps: string[];
  recommendations: ProofLinkageRecommendation[];
}

export interface ProofLinkageRecommendation {
  type: "link_evidence" | "attach_proof_asset";
  category?: CommercialEvidenceCategory;
  label: string;
  outputStatus: "recommendation";
}

export function evidenceRefsToCommercialRecords(
  refs: SalesEvidenceRef[],
): CommercialEvidenceRecord[] {
  return refs.map((ref) => ({
    id: ref.id,
    organizationId: ref.organizationId,
    opportunityId: ref.opportunityId,
    category: ref.typeId as CommercialEvidenceCategory,
    typeId: ref.typeId,
    summary: ref.label,
    linkedAt: ref.linkedAt,
    linkedById: ref.linkedById,
  }));
}

export function buildProofLinkagePlan(input: {
  opportunityId: string;
  evidence: SalesEvidenceRef[];
  proofAssets: SalesProofAsset[];
  requiredCategories?: CommercialEvidenceCategory[];
}): ProofLinkagePlan {
  const required =
    input.requiredCategories ?? DEFAULT_COMMERCIAL_EVIDENCE_REQUIREMENTS;
  const records = evidenceRefsToCommercialRecords(input.evidence);
  const evidenceCoverage = computeEvidenceCoverage(records, required);
  const relevantProof = input.proofAssets.filter(
    (p) => p.opportunityId === input.opportunityId || !p.opportunityId,
  );

  const recommendations: ProofLinkageRecommendation[] = [];
  for (const missing of evidenceCoverage.missing) {
    recommendations.push({
      type: "link_evidence",
      category: missing,
      label: `Link ${missing} evidence before advancing deal`,
      outputStatus: "recommendation",
    });
  }
  if (relevantProof.length === 0) {
    recommendations.push({
      type: "attach_proof_asset",
      label: "No proof assets linked — attach case study or reference",
      outputStatus: "recommendation",
    });
  }

  const gaps = [
    ...evidenceCoverage.missing.map((m) => `missing_evidence:${m}`),
    ...(relevantProof.length === 0 ? ["missing_proof_asset"] : []),
  ];

  return {
    opportunityId: input.opportunityId,
    evidenceCoverage,
    proofAssets: relevantProof,
    gaps,
    recommendations,
  };
}

export function linkProofEvidence(input: {
  organizationId: string;
  opportunityId: string;
  typeId: string;
  label: string;
  linkedById: string;
}): SalesEvidenceRef {
  if (!validateCommercialEvidence(input.typeId)) {
    throw new Error("Invalid evidence type for SalesOS proof linkage");
  }
  return linkEvidence({
    organizationId: input.organizationId,
    opportunityId: input.opportunityId,
    typeId: input.typeId,
    label: input.label,
    linkedById: input.linkedById,
  });
}

export function getProofLinkageForOpportunity(
  organizationId: string,
  opportunityId: string,
  proofAssets: SalesProofAsset[],
): ProofLinkagePlan {
  const evidence = listEvidenceForOpportunity(organizationId, opportunityId);
  return buildProofLinkagePlan({ opportunityId, evidence, proofAssets });
}
