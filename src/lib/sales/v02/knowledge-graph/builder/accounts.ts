import type { KnowledgeGraphStoreSnapshot } from "../store-reader";
import { addEdge, addNode, industryKey, nodeId, type BuilderContext } from "./common";

export function buildAccountsPhase(
  ctx: BuilderContext,
  snapshot: KnowledgeGraphStoreSnapshot,
): void {
  for (const account of snapshot.accounts) {
    addNode(ctx.nodes, {
      id: nodeId("account", account.id),
      type: "account",
      label: account.name,
      sourceId: account.id,
      meta: {
        status: account.status,
        industry: account.industry,
        icpFitScore: account.icpFitScore,
      },
    });

    if (account.industry?.trim()) {
      const id = industryKey(account.industry);
      addNode(ctx.nodes, {
        id: nodeId("industry", id),
        type: "industry",
        label: account.industry,
        sourceId: id,
      });
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("account", account.id),
        nodeId("industry", id),
      );
    }
  }
}
