import type { CommercialProofNetworkBundle } from "./commercial-proof-network";
import {
  PROOF_NETWORK_DISCLAIMER_AR,
  PROOF_NETWORK_DISCLAIMER_EN,
} from "../v02/proof-network/types";
import type {
  SalesObjection,
  SalesOpportunity,
  SalesProofAsset,
} from "../types";

export const PROOF_NETWORK_PANEL_LABEL = "مسودة — شبكة إثبات";

export type ProofNetworkNodeKind = "proof_asset" | "opportunity" | "objection";

export type ProofNetworkEdgeKind =
  | "supports"
  | "has_objection"
  | "addresses";

export interface ProofNetworkGraphNode {
  id: string;
  kind: ProofNetworkNodeKind;
  refId: string;
  label: string;
  meta?: {
    assetType?: string;
    stage?: string;
    category?: string;
    linkageStatus?: string;
    relevanceScore?: number;
    coveragePct?: number;
  };
}

export interface ProofNetworkGraphEdge {
  id: string;
  kind: ProofNetworkEdgeKind;
  sourceId: string;
  targetId: string;
  labelAr: string;
}

export interface CommercialProofNetworkOverview {
  organizationId: string;
  generatedAt: string;
  disclaimerEn: string;
  disclaimerAr: string;
  focusOpportunityId?: string;
  nodes: ProofNetworkGraphNode[];
  edges: ProofNetworkGraphEdge[];
  summary: {
    assetCount: number;
    opportunityCount: number;
    objectionCount: number;
    edgeCount: number;
    linkedAssetCount: number;
    avgCoveragePct: number;
    recommendationCount: number;
  };
}

const NODE_KIND_LABELS_AR: Record<ProofNetworkNodeKind, string> = {
  proof_asset: "أصل إثبات",
  opportunity: "فرصة",
  objection: "اعتراض",
};

const EDGE_KIND_LABELS_AR: Record<ProofNetworkEdgeKind, string> = {
  supports: "يدعم",
  has_objection: "اعتراض مرتبط",
  addresses: "يعالج",
};

export function proofNetworkNodeKindLabelAr(kind: ProofNetworkNodeKind): string {
  return NODE_KIND_LABELS_AR[kind];
}

export function proofNetworkEdgeKindLabelAr(kind: ProofNetworkEdgeKind): string {
  return EDGE_KIND_LABELS_AR[kind];
}

function assetNodeId(assetId: string): string {
  return `asset:${assetId}`;
}

function oppNodeId(opportunityId: string): string {
  return `opp:${opportunityId}`;
}

function objectionNodeId(objectionId: string): string {
  return `objection:${objectionId}`;
}

function upsertNode(
  map: Map<string, ProofNetworkGraphNode>,
  node: ProofNetworkGraphNode,
): void {
  if (!map.has(node.id)) map.set(node.id, node);
}

function addEdge(
  edges: ProofNetworkGraphEdge[],
  seen: Set<string>,
  edge: ProofNetworkGraphEdge,
): void {
  if (seen.has(edge.id)) return;
  seen.add(edge.id);
  edges.push(edge);
}

export interface BuildCommercialProofNetworkOverviewInput {
  organizationId: string;
  proofAssets: SalesProofAsset[];
  opportunities: SalesOpportunity[];
  objections: SalesObjection[];
  opportunityBundles?: CommercialProofNetworkBundle[];
  focusOpportunityId?: string;
}

export function buildCommercialProofNetworkOverview(
  input: BuildCommercialProofNetworkOverviewInput,
): CommercialProofNetworkOverview {
  const nodeMap = new Map<string, ProofNetworkGraphNode>();
  const edges: ProofNetworkGraphEdge[] = [];
  const edgeSeen = new Set<string>();

  const focusOppId = input.focusOpportunityId;
  const opportunities = focusOppId
    ? input.opportunities.filter((o) => o.id === focusOppId)
    : input.opportunities;

  for (const asset of input.proofAssets) {
    upsertNode(nodeMap, {
      id: assetNodeId(asset.id),
      kind: "proof_asset",
      refId: asset.id,
      label: asset.title,
      meta: { assetType: asset.assetType },
    });
  }

  for (const opp of opportunities) {
    upsertNode(nodeMap, {
      id: oppNodeId(opp.id),
      kind: "opportunity",
      refId: opp.id,
      label: opp.name,
      meta: { stage: opp.stage },
    });
  }

  const objections = focusOppId
    ? input.objections.filter((o) => o.opportunityId === focusOppId)
    : input.objections;

  for (const objection of objections) {
    upsertNode(nodeMap, {
      id: objectionNodeId(objection.id),
      kind: "objection",
      refId: objection.id,
      label: objection.category,
      meta: { category: objection.category },
    });
  }

  for (const asset of input.proofAssets) {
    const sourceId = assetNodeId(asset.id);
    const linkedOppIds = asset.linkedOpportunityIds ?? [];
    for (const oppId of linkedOppIds) {
      if (focusOppId && oppId !== focusOppId) continue;
      const targetId = oppNodeId(oppId);
      if (!nodeMap.has(targetId)) continue;
      addEdge(edges, edgeSeen, {
        id: `${sourceId}->${targetId}`,
        kind: "supports",
        sourceId,
        targetId,
        labelAr: EDGE_KIND_LABELS_AR.supports,
      });
    }
  }

  for (const objection of objections) {
    if (!objection.opportunityId) continue;
    const oppId = objection.opportunityId;
    if (focusOppId && oppId !== focusOppId) continue;
    const sourceId = oppNodeId(oppId);
    const targetId = objectionNodeId(objection.id);
    if (!nodeMap.has(sourceId) || !nodeMap.has(targetId)) continue;
    addEdge(edges, edgeSeen, {
      id: `${sourceId}->${targetId}`,
      kind: "has_objection",
      sourceId,
      targetId,
      labelAr: EDGE_KIND_LABELS_AR.has_objection,
    });
  }

  for (const asset of input.proofAssets) {
    const sourceId = assetNodeId(asset.id);
    const linkedOppIds = new Set(asset.linkedOpportunityIds ?? []);
    for (const objection of objections) {
      if (!objection.opportunityId) continue;
      if (focusOppId && objection.opportunityId !== focusOppId) continue;
      const onLinkedOpp = linkedOppIds.has(objection.opportunityId);
      const addressesObjection =
        asset.assetType === "objection_response" && onLinkedOpp;
      if (!addressesObjection) continue;
      const targetId = objectionNodeId(objection.id);
      if (!nodeMap.has(targetId)) continue;
      addEdge(edges, edgeSeen, {
        id: `${sourceId}->${targetId}`,
        kind: "addresses",
        sourceId,
        targetId,
        labelAr: EDGE_KIND_LABELS_AR.addresses,
      });
    }
  }

  for (const bundle of input.opportunityBundles ?? []) {
    for (const hit of bundle.searchHits) {
      const node = nodeMap.get(assetNodeId(hit.asset.id));
      if (!node) continue;
      node.meta = {
        ...node.meta,
        linkageStatus: hit.linkageStatus,
        relevanceScore: hit.relevance.score,
      };
    }
    const oppNode = nodeMap.get(oppNodeId(bundle.scopeId));
    if (oppNode) {
      oppNode.meta = {
        ...oppNode.meta,
        coveragePct: bundle.coveragePct,
      };
    }
  }

  const linkedAssetCount = input.proofAssets.filter(
    (a) => (a.linkedOpportunityIds?.length ?? 0) > 0,
  ).length;

  const bundles = input.opportunityBundles ?? [];
  const avgCoveragePct =
    bundles.length > 0
      ? Math.round(
          bundles.reduce((sum, b) => sum + b.coveragePct, 0) / bundles.length,
        )
      : 0;

  const recommendationCount = bundles.reduce(
    (sum, b) => sum + b.recommendations.length + b.linkage.length,
    0,
  );

  return {
    organizationId: input.organizationId,
    generatedAt: new Date().toISOString(),
    disclaimerEn: PROOF_NETWORK_DISCLAIMER_EN,
    disclaimerAr: PROOF_NETWORK_DISCLAIMER_AR,
    focusOpportunityId: focusOppId,
    nodes: [...nodeMap.values()],
    edges,
    summary: {
      assetCount: [...nodeMap.values()].filter((n) => n.kind === "proof_asset")
        .length,
      opportunityCount: [...nodeMap.values()].filter(
        (n) => n.kind === "opportunity",
      ).length,
      objectionCount: [...nodeMap.values()].filter(
        (n) => n.kind === "objection",
      ).length,
      edgeCount: edges.length,
      linkedAssetCount,
      avgCoveragePct,
      recommendationCount,
    },
  };
}
