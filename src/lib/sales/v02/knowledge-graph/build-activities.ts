import type { SalesActivity } from "../../types";
import { graphNodeId } from "./ids";
import type { GraphBuilder } from "./build-helpers";
import { link } from "./build-helpers";

export function addActivityEdges(
  builder: GraphBuilder,
  activities: SalesActivity[],
): void {
  for (const activity of activities) {
    for (const proofId of activity.evidenceLinkage?.proofAssetIds ?? []) {
      const proofNodeId = graphNodeId("proof", proofId);
      if (!builder.nodes.has(proofNodeId)) continue;
      if (activity.opportunityId) {
        link(
          builder,
          "uses",
          graphNodeId("opp", activity.opportunityId),
          proofNodeId,
          { relation: "activity_proof", activityId: activity.id },
        );
      }
    }
  }
}
