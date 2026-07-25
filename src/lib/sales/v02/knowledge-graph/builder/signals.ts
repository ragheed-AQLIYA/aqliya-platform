import type { KnowledgeGraphStoreSnapshot } from "../store-reader";
import { addEdge, addNode, nodeId, type BuilderContext } from "./common";

export function buildSignalsPhase(
  ctx: BuilderContext,
  snapshot: KnowledgeGraphStoreSnapshot,
): void {
  for (const signal of snapshot.signals) {
    addNode(ctx.nodes, {
      id: nodeId("signal", signal.id),
      type: "signal",
      label: signal.description.slice(0, 80),
      sourceId: signal.id,
      meta: {
        signalType: signal.signalType,
        strength: signal.strength,
        accountId: signal.accountId,
        opportunityId: signal.opportunityId,
      },
    });

    if (signal.accountId && ctx.accountIds.has(signal.accountId)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("signal", signal.id),
        nodeId("account", signal.accountId),
      );
    }
    if (signal.opportunityId && ctx.oppIds.has(signal.opportunityId)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("signal", signal.id),
        nodeId("opp", signal.opportunityId),
      );
    }
    if (signal.evidenceRef && ctx.contentIds.has(signal.evidenceRef)) {
      addEdge(
        ctx.edges,
        "mentions",
        nodeId("signal", signal.id),
        nodeId("content", signal.evidenceRef),
      );
    }
  }
}
