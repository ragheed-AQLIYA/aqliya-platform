export * from "./types";
export * from "./adapters";
export * from "./categorization";
export * from "./search";
export * from "./relevance";
export * from "./linkage";
export * from "./recommendations";
export * from "./network";

import { computeProofLinkageGap } from "./linkage";
import {
  recommendProofForContext,
  recommendProofForIndustry,
  recommendProofForObjection,
} from "./recommendations";
import { searchProofAssets } from "./search";
import {
  PROOF_NETWORK_DISCLAIMER_AR,
  PROOF_NETWORK_DISCLAIMER_EN,
  type ProofRecommendation,
  type ProofSearchHit,
} from "./types";
import type {
  SalesAccount,
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
} from "../../types";
import type { SalesEvidenceRef } from "../../store";

export const COMMERCIAL_PROOF_NETWORK_DISCLAIMER_EN = PROOF_NETWORK_DISCLAIMER_EN;
export const COMMERCIAL_PROOF_NETWORK_DISCLAIMER_AR = PROOF_NETWORK_DISCLAIMER_AR;

export interface ProofNetworkBundleSearchHit {
  asset: SalesProofAsset;
  linkageStatus: string;
  relevance: { score: number; reasons: string[] };
}

export interface ProofNetworkBundle {
  scope: "account" | "opportunity" | "objection" | "industry";
  scopeId: string;
  coveragePct: number;
  searchHits: ProofNetworkBundleSearchHit[];
  recommendations: ProofRecommendation[];
  linkage: string[];
}

export type CommercialProofNetworkBundle = ProofNetworkBundle;

interface BaseInput {
  organizationId: string;
  proofAssets: SalesProofAsset[];
  accounts: SalesAccount[];
  objections: SalesObjection[];
}

function mapSearchHits(hits: ProofSearchHit[]): ProofNetworkBundleSearchHit[] {
  return hits.map((hit) => ({
    asset: hit.asset,
    linkageStatus: hit.asset.status ?? "active",
    relevance: { score: hit.relevanceScore, reasons: hit.matchReasons },
  }));
}

function buildBundle(
  scope: ProofNetworkBundle["scope"],
  scopeId: string,
  input: BaseInput,
  query: Parameters<typeof searchProofAssets>[1],
): ProofNetworkBundle {
  const hits = searchProofAssets(input.proofAssets, query);
  const recommendations = recommendProofForContext(input.proofAssets, {
    organizationId: input.organizationId,
    accountId: query.accountId,
    opportunityId: query.opportunityId,
    industry: query.industry,
  });
  const linkageGap = computeProofLinkageGap(input.proofAssets, input.organizationId, {
    accountId: query.accountId,
    opportunityId: query.opportunityId,
  });
  return {
    scope,
    scopeId,
    coveragePct: linkageGap.coveragePct,
    searchHits: mapSearchHits(hits),
    recommendations,
    linkage: linkageGap.recommendations,
  };
}

export function buildAccountProofNetwork(
  input: BaseInput,
  account: SalesAccount,
): ProofNetworkBundle {
  return buildBundle("account", account.id, input, {
    organizationId: input.organizationId,
    accountId: account.id,
    industry: account.industry,
    limit: 8,
  });
}

export function evidenceRecordsFromRefs(
  refs: SalesEvidenceRef[],
): Array<{ id: string; label: string }> {
  return refs.map((ref) => ({ id: ref.id, label: ref.label }));
}

export function buildOpportunityProofNetwork(
  input: BaseInput & { commercialEvidence?: Array<{ id: string; label: string }> },
  opportunity: SalesOpportunity,
  account?: SalesAccount | null,
): ProofNetworkBundle {
  return buildBundle("opportunity", opportunity.id, input, {
    organizationId: input.organizationId,
    opportunityId: opportunity.id,
    accountId: account?.id ?? opportunity.accountId,
    industry: account?.industry,
    limit: 8,
  });
}

export function buildObjectionProofNetwork(
  input: BaseInput,
  objection: SalesObjection,
): ProofNetworkBundle {
  const recommendations = recommendProofForObjection(
    input.proofAssets,
    input.organizationId,
    objection.category,
  );
  const hits = searchProofAssets(input.proofAssets, {
    organizationId: input.organizationId,
    objectionCategory: objection.category,
    accountId: objection.accountId,
    opportunityId: objection.opportunityId,
    limit: 6,
  });
  return {
    scope: "objection",
    scopeId: objection.id,
    coveragePct: hits.length > 0 ? 100 : 0,
    searchHits: mapSearchHits(hits),
    recommendations,
    linkage: [],
  };
}

export function buildIndustryProofNetwork(
  input: BaseInput,
  industry: string,
): ProofNetworkBundle {
  const recommendations = recommendProofForIndustry(
    input.proofAssets,
    input.organizationId,
    industry,
  );
  const hits = searchProofAssets(input.proofAssets, {
    organizationId: input.organizationId,
    industry,
    limit: 10,
  });
  return {
    scope: "industry",
    scopeId: industry,
    coveragePct: hits.length > 0 ? 100 : 0,
    searchHits: mapSearchHits(hits),
    recommendations,
    linkage: [],
  };
}
