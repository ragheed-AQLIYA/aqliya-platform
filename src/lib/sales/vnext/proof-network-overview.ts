/**
 * Org-wide proof network overview — nodes/edges for intelligence hub UI.
 * Derived from store-backed proof assets, opportunities, and objections.
 */

import {
  PROOF_NETWORK_DISCLAIMER_AR,
  PROOF_NETWORK_DISCLAIMER_EN,
} from "../v02/proof-network/types";
import { listCrossProductProofCandidates } from "../v02/proof-network/adapters";
import type {
  SalesAccount,
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
} from "../types";

export const PROOF_NETWORK_PANEL_LABEL = "مسودة — شبكة إثبات";

export type ProofNetworkNodeKind =
  | "asset"
  | "opportunity"
  | "objection"
  | "account";

export interface ProofNetworkNode {
  id: string;
  kind: ProofNetworkNodeKind;
  label: string;
  subtitle?: string;
  /** 0 = objections, 1 = opportunities, 2 = assets */
  layer: number;
}

export type ProofNetworkEdgeKind =
  | "proves"
  | "raised_on"
  | "belongs_to"
  | "linked_account";

export interface ProofNetworkEdge {
  id: string;
  fromId: string;
  toId: string;
  labelAr: string;
  kind: ProofNetworkEdgeKind;
}

export interface CommercialProofNetworkOverview {
  organizationId: string;
  generatedAt: string;
  disclaimerEn: string;
  disclaimerAr: string;
  nodes: ProofNetworkNode[];
  edges: ProofNetworkEdge[];
  stats: {
    assetCount: number;
    opportunityCount: number;
    objectionCount: number;
    accountCount: number;
    edgeCount: number;
    linkedAssetCount: number;
    coveragePct: number;
    crossProductCandidateCount: number;
  };
}

export interface ProofNetworkOverviewInput {
  organizationId: string;
  proofAssets: SalesProofAsset[];
  opportunities: SalesOpportunity[];
  objections: SalesObjection[];
  accounts: SalesAccount[];
}

function nodeId(kind: ProofNetworkNodeKind, id: string): string {
  return `${kind}:${id}`;
}

export function buildCommercialProofNetworkOverview(
  input: ProofNetworkOverviewInput,
): CommercialProofNetworkOverview {
  const nodes: ProofNetworkNode[] = [];
  const edges: ProofNetworkEdge[] = [];
  const nodeKeys = new Set<string>();

  function addNode(node: ProofNetworkNode) {
    if (nodeKeys.has(node.id)) return;
    nodeKeys.add(node.id);
    nodes.push(node);
  }

  function addEdge(edge: ProofNetworkEdge) {
    edges.push(edge);
  }

  const accountById = new Map(input.accounts.map((a) => [a.id, a]));
  const oppById = new Map(input.opportunities.map((o) => [o.id, o]));

  for (const opp of input.opportunities) {
    const account = accountById.get(opp.accountId);
    addNode({
      id: nodeId("opportunity", opp.id),
      kind: "opportunity",
      label: opp.name,
      subtitle: opp.stage,
      layer: 1,
    });
    if (account) {
      addNode({
        id: nodeId("account", account.id),
        kind: "account",
        label: account.nameAr ?? account.name,
        subtitle: account.industry,
        layer: 1,
      });
      addEdge({
        id: `belongs:${opp.id}:${account.id}`,
        fromId: nodeId("opportunity", opp.id),
        toId: nodeId("account", account.id),
        labelAr: "تابعة للحساب",
        kind: "belongs_to",
      });
    }
  }

  for (const objection of input.objections) {
    addNode({
      id: nodeId("objection", objection.id),
      kind: "objection",
      label: objection.category,
      subtitle: objection.description.slice(0, 60),
      layer: 0,
    });
    if (objection.opportunityId && oppById.has(objection.opportunityId)) {
      addEdge({
        id: `raised:${objection.id}:${objection.opportunityId}`,
        fromId: nodeId("objection", objection.id),
        toId: nodeId("opportunity", objection.opportunityId),
        labelAr: "اعتراض على الفرصة",
        kind: "raised_on",
      });
    }
  }

  let linkedAssetCount = 0;
  for (const asset of input.proofAssets) {
    addNode({
      id: nodeId("asset", asset.id),
      kind: "asset",
      label: asset.title,
      subtitle: asset.assetType,
      layer: 2,
    });

    const linkedOppIds = asset.linkedOpportunityIds ?? [];
    const linkedAccountIds = asset.linkedAccountIds ?? [];
    const hasLinks =
      linkedOppIds.length > 0 || linkedAccountIds.length > 0;
    if (hasLinks) linkedAssetCount += 1;

    for (const oppId of linkedOppIds) {
      if (!oppById.has(oppId)) continue;
      addEdge({
        id: `proves:${asset.id}:${oppId}`,
        fromId: nodeId("asset", asset.id),
        toId: nodeId("opportunity", oppId),
        labelAr: "يدعم الفرصة",
        kind: "proves",
      });
    }

    for (const accountId of linkedAccountIds) {
      if (!accountById.has(accountId)) continue;
      addEdge({
        id: `linked-acct:${asset.id}:${accountId}`,
        fromId: nodeId("asset", asset.id),
        toId: nodeId("account", accountId),
        labelAr: "مرتبط بالحساب",
        kind: "linked_account",
      });
    }
  }

  const assetCount = input.proofAssets.length;
  const coveragePct =
    assetCount === 0
      ? 0
      : Math.round((linkedAssetCount / assetCount) * 100);

  return {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    disclaimerEn: PROOF_NETWORK_DISCLAIMER_EN,
    disclaimerAr: PROOF_NETWORK_DISCLAIMER_AR,
    nodes,
    edges,
    stats: {
      assetCount,
      opportunityCount: input.opportunities.length,
      objectionCount: input.objections.length,
      accountCount: input.accounts.length,
      edgeCount: edges.length,
      linkedAssetCount,
      coveragePct,
      crossProductCandidateCount: listCrossProductProofCandidates(
        input.organizationId,
        {},
      ).length,
    },
  };
}
