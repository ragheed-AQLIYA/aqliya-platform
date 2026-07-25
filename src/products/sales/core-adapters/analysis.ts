import {
  ensureSalesSeed,
  listProofAssets,
} from "@/lib/sales/store";
import type { SalesProofAsset } from "@/lib/sales/types";

import type { EvidenceBackedRecommendationCheck, ProofUsageTraceEntry } from "./types";
import { coreEvidenceIdForProofAsset } from "./store";

export async function traceProofUsage(
  organizationId: string,
  ownerId = "system",
): Promise<ProofUsageTraceEntry[]> {
  await ensureSalesSeed(organizationId, ownerId);
  const proofAssets = listProofAssets(organizationId);
  return proofAssets.map((asset) => {
    const linkedOpportunityIds = [
      ...new Set([
        ...(asset.linkedOpportunityIds ?? []),
        ...(asset.opportunityId ? [asset.opportunityId] : []),
      ]),
    ];
    const linkedAccountIds = [
      ...new Set([
        ...(asset.linkedAccountIds ?? []),
        ...(asset.accountId ? [asset.accountId] : []),
      ]),
    ];
    const usageScore =
      linkedOpportunityIds.length * 2 +
      linkedAccountIds.length +
      (asset.evidenceRef ? 1 : 0) +
      (asset.status === "active" ? 0.5 : 0);
    return {
      proofAssetId: asset.id,
      title: asset.title,
      coreEvidenceId: coreEvidenceIdForProofAsset(asset.id),
      evidenceRef: asset.evidenceRef,
      linkedOpportunityIds,
      linkedAccountIds,
      usageScore,
    };
  });
}

export function checkEvidenceBackedRecommendation(input: {
  evidence: Array<{ source?: string; refId?: string }>;
  requireProof?: boolean;
}): EvidenceBackedRecommendationCheck {
  const missingProofRefs: string[] = [];
  const missingEvidenceRefs: string[] = [];
  for (const item of input.evidence) {
    if (!item.refId) {
      missingEvidenceRefs.push("unknown");
      continue;
    }
    if (item.source === "proof" && !item.refId.startsWith("sales-proof")) {
      missingProofRefs.push(item.refId);
    }
    if (
      item.source === "objection" ||
      item.source === "opportunity" ||
      item.source === "evidence"
    ) {
      if (!item.refId) missingEvidenceRefs.push(item.refId);
    }
  }
  const hasProof =
    !input.requireProof ||
    input.evidence.some((e) => e.source === "proof" && e.refId);
  const ok =
    missingProofRefs.length === 0 &&
    missingEvidenceRefs.length === 0 &&
    hasProof;
  return { ok, missingProofRefs, missingEvidenceRefs };
}
