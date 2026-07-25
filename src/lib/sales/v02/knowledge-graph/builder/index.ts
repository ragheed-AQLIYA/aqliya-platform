import type { KnowledgeGraphStoreSnapshot } from "../store-reader";
import type { KnowledgeGraph } from "../types";
import { buildIndexes, buildStats, type BuilderContext } from "./common";
import { buildContentPhase } from "./content";
import { buildAccountsPhase } from "./accounts";
import { buildOpportunitiesPhase } from "./opportunities";
import { buildProofsPhase } from "./proofs";
import { buildSignalsPhase } from "./signals";
import { buildFindingsPhase } from "./findings";

export function buildKnowledgeGraphFromSnapshot(
  snapshot: KnowledgeGraphStoreSnapshot,
  builtAt = new Date().toISOString(),
): KnowledgeGraph {
  const ctx: BuilderContext = {
    nodes: new Map(),
    edges: new Map(),
    accountIds: new Set(snapshot.accounts.map((a) => a.id)),
    oppIds: new Set(snapshot.opportunities.map((o) => o.id)),
    contentIds: new Set(),
  };

  buildContentPhase(ctx, snapshot);
  buildAccountsPhase(ctx, snapshot);
  buildOpportunitiesPhase(ctx, snapshot);
  buildProofsPhase(ctx, snapshot);
  buildSignalsPhase(ctx, snapshot);
  buildFindingsPhase(ctx, snapshot);

  const nodeList = [...ctx.nodes.values()];
  const edgeList = [...ctx.edges.values()];

  return {
    organizationId: snapshot.organizationId,
    builtAt,
    nodes: nodeList,
    edges: edgeList,
    indexes: buildIndexes(nodeList, edgeList),
    stats: buildStats(nodeList, edgeList),
  };
}

export function buildKnowledgeGraphFromStore(
  organizationId: string,
  readSnapshot: (orgId: string) => KnowledgeGraphStoreSnapshot,
): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(readSnapshot(organizationId));
}
