import type { KnowledgeGraphStoreSnapshot } from "../store-reader";
import { addNode, nodeId, type BuilderContext } from "./common";

export function buildContentPhase(
  ctx: BuilderContext,
  snapshot: KnowledgeGraphStoreSnapshot,
): void {
  for (const interaction of snapshot.interactions) {
    ctx.contentIds.add(interaction.id);
    addNode(ctx.nodes, {
      id: nodeId("content", interaction.id),
      type: "content",
      label: interaction.summary.slice(0, 80),
      sourceId: interaction.id,
      meta: {
        contentKind: "interaction",
        interactionType: interaction.type,
        accountId: interaction.accountId,
        opportunityId: interaction.opportunityId,
      },
    });
  }

  for (const activity of snapshot.activities) {
    if (ctx.contentIds.has(activity.id)) continue;
    addNode(ctx.nodes, {
      id: nodeId("content", activity.id),
      type: "content",
      label: activity.summary.slice(0, 80),
      sourceId: activity.id,
      meta: {
        contentKind: "activity",
        activityType: activity.type,
        accountId: activity.accountId,
        opportunityId: activity.opportunityId,
      },
    });
    ctx.contentIds.add(activity.id);
  }
}
