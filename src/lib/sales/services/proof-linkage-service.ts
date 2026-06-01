export {
  buildProofLinkageSummary,
  linkProofAssetToAccount,
  linkProofAssetToOpportunity,
  listProofAssetsForAccount,
  listProofAssetsForOpportunity,
  suggestProofAssetsForObjection,
} from "../proof-linkage-service";

import { buildProofLinkageSummary } from "../proof-linkage-service";
import type { CommercialEvidenceRecord } from "../vnext/commercial-evidence";
import { listEvidenceForOpportunity, listProofAssets } from "../store";

function evidenceRefsToCommercialRecords(
  refs: ReturnType<typeof listEvidenceForOpportunity>,
): CommercialEvidenceRecord[] {
  return refs.map((ref) => ({
    id: ref.id,
    organizationId: ref.organizationId,
    opportunityId: ref.opportunityId,
    category: ref.typeId as CommercialEvidenceRecord["category"],
    typeId: ref.typeId,
    summary: ref.label,
    linkedAt: ref.linkedAt,
    linkedById: ref.linkedById,
  }));
}

export function salesGetProofLinkagePlan(
  organizationId: string,
  opportunityId: string,
  stage?: string,
) {
  return buildProofLinkageSummary(
    {
      organizationId,
      opportunityId,
      proofAssets: listProofAssets(organizationId),
      commercialEvidence: evidenceRefsToCommercialRecords(
        listEvidenceForOpportunity(organizationId, opportunityId),
      ),
    },
    stage,
  );
}
