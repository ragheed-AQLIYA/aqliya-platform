// @ts-nocheck
import { listCrossProductProofCandidates } from "./adapters";
import { categorizeProofAsset } from "./categorization";
import { computeProofLinkageGap, countLinkedProofAssets } from "./linkage";
import {
  recommendProofForContext,
  recommendProofForIndustry,
  recommendProofForObjection,
} from "./recommendations";
import { scoreProofRelevance } from "./relevance";
import { searchProofAssets } from "./search";
import type {
  ProofNetworkBuildInput,
  ProofNetworkSlice,
  ProofNetworkSnapshot,
  ProofSearchQuery,
} from "./types";

function buildAccountSlice(
  input: ProofNetworkBuildInput,
  accountId: string,
): ProofNetworkSlice {
  const industry = input.accountIndustryById[accountId];
  const label = industry ? `Account ${accountId} (${industry})` : `Account ${accountId}`;
  return {
    scope: "account",
    scopeId: accountId,
    label,
    linkedCount: countLinkedProofAssets(input.proofAssets, input.organizationId, {
      accountId,
    }),
    searchHits: searchProofAssets(input.proofAssets, {
      organizationId: input.organizationId,
      accountId,
      industry,
      limit: 8,
    }),
    recommendations: recommendProofForContext(input.proofAssets, {
      organizationId: input.organizationId,
      accountId,
      industry,
    }),
    linkage: computeProofLinkageGap(input.proofAssets, input.organizationId, {
      accountId,
    }),
  };
}

function buildOpportunitySlice(
  input: ProofNetworkBuildInput,
  opportunityId: string,
): ProofNetworkSlice {
  const stage = input.opportunityStageById[opportunityId];
  const accountId = input.opportunityAccountById[opportunityId];
  const industry = accountId ? input.accountIndustryById[accountId] : undefined;
  return {
    scope: "opportunity",
    scopeId: opportunityId,
    label: stage ? `Opportunity ${opportunityId} (${stage})` : `Opportunity ${opportunityId}`,
    linkedCount: countLinkedProofAssets(input.proofAssets, input.organizationId, {
      opportunityId,
    }),
    searchHits: searchProofAssets(input.proofAssets, {
      organizationId: input.organizationId,
      opportunityId,
      accountId,
      industry,
      limit: 8,
    }),
    recommendations: recommendProofForContext(input.proofAssets, {
      organizationId: input.organizationId,
      opportunityId,
      accountId,
      stage,
      industry,
    }),
    linkage: computeProofLinkageGap(input.proofAssets, input.organizationId, {
      opportunityId,
      stage,
    }),
  };
}

function buildObjectionSlice(
  input: ProofNetworkBuildInput,
  objection: ProofNetworkBuildInput["objections"][number],
): ProofNetworkSlice {
  const accountId = objection.accountId;
  const industry = accountId ? input.accountIndustryById[accountId] : undefined;
  return {
    scope: "objection",
    scopeId: objection.id,
    label: `Objection ${objection.category}`,
    linkedCount: countLinkedProofAssets(input.proofAssets, input.organizationId, {
      accountId,
      opportunityId: objection.opportunityId,
    }),
    searchHits: searchProofAssets(input.proofAssets, {
      organizationId: input.organizationId,
      objectionCategory: objection.category,
      accountId,
      opportunityId: objection.opportunityId,
      limit: 6,
    }),
    recommendations: recommendProofForObjection(
      input.proofAssets,
      input.organizationId,
      objection.category,
    ),
    linkage: computeProofLinkageGap(input.proofAssets, input.organizationId, {
      opportunityId: objection.opportunityId,
      accountId,
    }),
  };
}

function buildIndustrySlice(
  input: ProofNetworkBuildInput,
  industry: string,
): ProofNetworkSlice {
  const industryAssets = input.proofAssets.filter((p) => {
    const score = scoreProofRelevance(p, {
      organizationId: input.organizationId,
      industry,
    });
    return score >= 25;
  });

  return {
    scope: "industry",
    scopeId: industry,
    label: `Industry ${industry}`,
    linkedCount: industryAssets.length,
    searchHits: searchProofAssets(input.proofAssets, {
      organizationId: input.organizationId,
      industry,
      limit: 10,
    }),
    recommendations: recommendProofForIndustry(
      input.proofAssets,
      input.organizationId,
      industry,
    ),
    linkage: {
      missingAssetTypes: [],
      coveragePct: industryAssets.length > 0 ? 100 : 0,
      recommendations:
        industryAssets.length === 0
          ? [`No active proof assets strongly match ${industry} — recommendation only`]
          : [],
    },
  };
}

export function buildProofNetworkSnapshot(
  input: ProofNetworkBuildInput,
  crossProductCandidateCount = 0,
): ProofNetworkSnapshot {
  const activeAssets = input.proofAssets.filter((p) => p.status === "active").length;
  return {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    totalAssets: input.proofAssets.length,
    activeAssets,
    byAccount: input.accountIds.map((id) => buildAccountSlice(input, id)),
    byOpportunity: input.opportunityIds.map((id) =>
      buildOpportunitySlice(input, id),
    ),
    byObjection: input.objections.map((o) => buildObjectionSlice(input, o)),
    byIndustry: input.industries.map((ind) => buildIndustrySlice(input, ind)),
    crossProductCandidateCount,
  };
}

export async function buildProofNetworkSnapshotWithAdapters(
  input: ProofNetworkBuildInput,
): Promise<ProofNetworkSnapshot> {
  const external = await listCrossProductProofCandidates(input.organizationId);
  return buildProofNetworkSnapshot(input, external.length);
}

export function searchProofNetwork(
  proofAssets: Parameters<typeof searchProofAssets>[0],
  query: ProofSearchQuery,
) {
  return searchProofAssets(proofAssets, query);
}

export { categorizeProofAsset };
