import {
  buildAccountProofNetwork,
  buildIndustryProofNetwork,
  buildObjectionProofNetwork,
  buildOpportunityProofNetwork,
  evidenceRecordsFromRefs,
  searchProofAssets,
  type ProofNetworkBundle,
  type ProofSearchQuery,
} from "../vnext/commercial-proof-network";
import { buildCommercialProofNetworkOverview } from "../vnext/commercial-proof-network-overview";
import {
  getAccount,
  getOpportunity,
  listAccounts,
  listEvidenceForOpportunity,
  listObjections,
  listOpportunities,
  listProofAssets,
} from "../store";

function loadCommercialProofNetworkBase(organizationId: string) {
  return {
    organizationId,
    proofAssets: listProofAssets(organizationId),
    accounts: listAccounts(organizationId),
    objections: listObjections(organizationId),
  };
}

export function salesGetCommercialProofNetworkForAccount(
  organizationId: string,
  accountId: string,
): ProofNetworkBundle | undefined {
  const account = getAccount(organizationId, accountId);
  if (!account) return undefined;
  return buildAccountProofNetwork(
    loadCommercialProofNetworkBase(organizationId),
    account,
  );
}

export function salesGetCommercialProofNetworkForOpportunity(
  organizationId: string,
  opportunityId: string,
): ProofNetworkBundle | undefined {
  const opportunity = getOpportunity(organizationId, opportunityId);
  if (!opportunity) return undefined;
  const account = getAccount(organizationId, opportunity.accountId);
  const base = loadCommercialProofNetworkBase(organizationId);
  return buildOpportunityProofNetwork(
    {
      ...base,
      commercialEvidence: evidenceRecordsFromRefs(
        listEvidenceForOpportunity(organizationId, opportunityId),
      ),
    },
    opportunity,
    account,
  );
}

export function salesGetCommercialProofNetworkForObjection(
  organizationId: string,
  objectionId: string,
): ProofNetworkBundle | undefined {
  const base = loadCommercialProofNetworkBase(organizationId);
  const objection = base.objections.find((o) => o.id === objectionId);
  if (!objection) return undefined;
  return buildObjectionProofNetwork(base, objection);
}

export function salesGetCommercialProofNetworkForIndustry(
  organizationId: string,
  industry: string,
): ProofNetworkBundle {
  return buildIndustryProofNetwork(
    loadCommercialProofNetworkBase(organizationId),
    industry,
  );
}

export function salesSearchCommercialProofNetwork(
  organizationId: string,
  query: Omit<ProofSearchQuery, "organizationId">,
) {
  return searchProofAssets(listProofAssets(organizationId), {
    organizationId,
    ...query,
  });
}

export function salesBuildCommercialProofNetworkOverview(
  organizationId: string,
  options?: { focusOpportunityId?: string },
) {
  const opportunities = listOpportunities(organizationId);
  const proofAssets = listProofAssets(organizationId);
  const objections = listObjections(organizationId);
  const opportunityBundles = opportunities
    .map((opp) =>
      salesGetCommercialProofNetworkForOpportunity(organizationId, opp.id),
    )
    .filter((bundle): bundle is ProofNetworkBundle => Boolean(bundle));

  return buildCommercialProofNetworkOverview({
    organizationId,
    proofAssets,
    opportunities,
    objections,
    opportunityBundles,
    focusOpportunityId: options?.focusOpportunityId,
  });
}
