import { canonicalizeOpportunityStage } from "../../../types";
import type { KnowledgeGraphStoreSnapshot } from "../store-reader";
import { addEdge, addNode, nodeId, type BuilderContext } from "./common";

export function buildOpportunitiesPhase(
  ctx: BuilderContext,
  snapshot: KnowledgeGraphStoreSnapshot,
): void {
  for (const opp of snapshot.opportunities) {
    addNode(ctx.nodes, {
      id: nodeId("opp", opp.id),
      type: "opp",
      label: opp.name,
      sourceId: opp.id,
      meta: {
        stage: opp.stage,
        canonicalStage: canonicalizeOpportunityStage(opp.stage),
        accountId: opp.accountId,
        valueEstimate: opp.valueEstimate,
      },
    });

    if (ctx.accountIds.has(opp.accountId)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("opp", opp.id),
        nodeId("account", opp.accountId),
      );
    }
  }
}
