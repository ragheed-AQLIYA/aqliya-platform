import {
  buildProofNetworkSnapshot,
  buildProofNetworkSnapshotWithAdapters,
  searchProofNetwork,
  type ProofNetworkBuildInput,
  type ProofNetworkSnapshot,
  type ProofSearchQuery,
} from "../v02/proof-network";
import type { ProofSearchHit } from "../v02/proof-network/types";
import {
  listAccounts,
  listObjections,
  listOpportunities,
  listProofAssets,
} from "../store";

function loadProofNetworkInput(organizationId: string): ProofNetworkBuildInput {
  const accounts = listAccounts(organizationId);
  const opportunities = listOpportunities(organizationId);
  const objections = listObjections(organizationId);

  return {
    organizationId,
    proofAssets: listProofAssets(organizationId),
    accountIds: accounts.map((a) => a.id),
    accountIndustryById: Object.fromEntries(
      accounts.map((a) => [a.id, a.industry]),
    ),
    opportunityIds: opportunities.map((o) => o.id),
    opportunityStageById: Object.fromEntries(
      opportunities.map((o) => [o.id, o.stage]),
    ),
    opportunityAccountById: Object.fromEntries(
      opportunities.map((o) => [o.id, o.accountId]),
    ),
    objections: objections.map((o) => ({
      id: o.id,
      category: o.category,
      accountId: o.accountId,
      opportunityId: o.opportunityId,
    })),
    industries: [
      ...new Set(
        accounts.map((a) => a.industry).filter((i): i is string => Boolean(i)),
      ),
    ],
  };
}

export function salesSearchProofAssets(
  organizationId: string,
  query: Omit<ProofSearchQuery, "organizationId">,
): ProofSearchHit[] {
  const input = loadProofNetworkInput(organizationId);
  return searchProofNetwork(input.proofAssets, {
    organizationId,
    ...query,
  });
}

export function salesBuildProofNetworkSnapshot(
  organizationId: string,
): ProofNetworkSnapshot {
  return buildProofNetworkSnapshot(loadProofNetworkInput(organizationId));
}

export async function salesBuildProofNetworkSnapshotAsync(
  organizationId: string,
): Promise<ProofNetworkSnapshot> {
  return buildProofNetworkSnapshotWithAdapters(
    loadProofNetworkInput(organizationId),
  );
}

export function salesGetProofNetworkForAccount(
  organizationId: string,
  accountId: string,
) {
  const snapshot = salesBuildProofNetworkSnapshot(organizationId);
  return snapshot.byAccount.find((s) => s.scopeId === accountId);
}

export function salesGetProofNetworkForOpportunity(
  organizationId: string,
  opportunityId: string,
) {
  const snapshot = salesBuildProofNetworkSnapshot(organizationId);
  return snapshot.byOpportunity.find((s) => s.scopeId === opportunityId);
}

export function salesGetProofNetworkForObjection(
  organizationId: string,
  objectionId: string,
) {
  const snapshot = salesBuildProofNetworkSnapshot(organizationId);
  return snapshot.byObjection.find((s) => s.scopeId === objectionId);
}

export function salesGetProofNetworkForIndustry(
  organizationId: string,
  industry: string,
) {
  const snapshot = salesBuildProofNetworkSnapshot(organizationId);
  return snapshot.byIndustry.find((s) => s.scopeId === industry);
}
