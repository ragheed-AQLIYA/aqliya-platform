import type { KnowledgeGraphStoreSnapshot } from "../store-reader";
import { addEdge, addNode, nodeId, type BuilderContext } from "./common";

export function buildProofsPhase(
  ctx: BuilderContext,
  snapshot: KnowledgeGraphStoreSnapshot,
): void {
  for (const proof of snapshot.proofAssets) {
    addNode(ctx.nodes, {
      id: nodeId("proof", proof.id),
      type: "proof",
      label: proof.title,
      sourceId: proof.id,
      meta: {
        assetType: proof.assetType,
        status: proof.status,
      },
    });

    const linkedOpps = new Set<string>();
    if (proof.opportunityId) linkedOpps.add(proof.opportunityId);
    for (const oppId of proof.linkedOpportunityIds ?? []) linkedOpps.add(oppId);

    for (const oppId of linkedOpps) {
      if (!ctx.oppIds.has(oppId)) continue;
      addEdge(ctx.edges, "uses", nodeId("opp", oppId), nodeId("proof", proof.id));
      addEdge(ctx.edges, "related_to", nodeId("proof", proof.id), nodeId("opp", oppId));
    }

    const linkedAccounts = new Set<string>();
    if (proof.accountId) linkedAccounts.add(proof.accountId);
    for (const accountId of proof.linkedAccountIds ?? []) linkedAccounts.add(accountId);

    for (const accountId of linkedAccounts) {
      if (!ctx.accountIds.has(accountId)) continue;
      addEdge(
        ctx.edges,
        "uses",
        nodeId("account", accountId),
        nodeId("proof", proof.id),
      );
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("proof", proof.id),
        nodeId("account", accountId),
      );
    }

    if (proof.evidenceRef && ctx.contentIds.has(proof.evidenceRef)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("proof", proof.id),
        nodeId("content", proof.evidenceRef),
      );
    }
  }
}
