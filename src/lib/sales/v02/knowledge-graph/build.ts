import type { KnowledgeGraphStoreSnapshot } from "./store-reader";
import type { KnowledgeGraph } from "./types";
import { createBuilder, buildIndexes, computeStats } from "./build-helpers";
import { addAccountNodes } from "./build-accounts";
import { addOpportunityNodes } from "./build-opportunities";
import { addProofNodes } from "./build-proof";
import { addSignalNodes } from "./build-signals";
import { addContentNodes } from "./build-content";
import { addFindingNodes } from "./build-findings";
import { addActivityEdges } from "./build-activities";

export {
  createBuilder,
  buildIndexes,
  computeStats,
  emptyStats,
  isClosedWon,
  isClosedLost,
  ensureIndustryNode,
  link,
} from "./build-helpers";
export type { GraphBuilder } from "./build-helpers";

export { addAccountNodes } from "./build-accounts";
export { addOpportunityNodes } from "./build-opportunities";
export { addProofNodes } from "./build-proof";
export { addSignalNodes } from "./build-signals";
export { addContentNodes } from "./build-content";
export { addFindingNodes } from "./build-findings";
export { addActivityEdges } from "./build-activities";

/** Pure builder — graph is derived from snapshot only, no external graph DB. */
export function buildKnowledgeGraphFromSnapshot(
  snapshot: KnowledgeGraphStoreSnapshot,
): KnowledgeGraph {
  const builder = createBuilder();
  const oppById = new Map(snapshot.opportunities.map((o) => [o.id, o]));

  const accountIndustry = addAccountNodes(builder, snapshot.accounts);
  addOpportunityNodes(builder, snapshot.opportunities, accountIndustry);
  addProofNodes(builder, snapshot.proofAssets, oppById);
  addSignalNodes(builder, snapshot.signals);
  addContentNodes(
    builder,
    snapshot.icpInsights,
    snapshot.interactions,
    snapshot.accounts,
  );
  addFindingNodes(
    builder,
    snapshot.objections,
    snapshot.winLossInsights,
    snapshot.competitorMentions,
    oppById,
  );
  addActivityEdges(builder, snapshot.activities);

  const nodeList = [...builder.nodes.values()];
  const edgeList = [...builder.edges.values()];

  return {
    organizationId: snapshot.organizationId,
    builtAt: new Date().toISOString(),
    nodes: nodeList,
    edges: edgeList,
    indexes: buildIndexes(nodeList, edgeList),
    stats: computeStats(nodeList, edgeList),
  };
}
