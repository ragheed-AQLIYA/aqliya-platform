import type {
  SalesCompetitorMention,
  SalesObjection,
  SalesOpportunity,
  SalesWinLossInsight,
} from "../../types";
import { graphNodeId } from "./ids";
import type { GraphBuilder } from "./build-helpers";
import { isClosedLost, link } from "./build-helpers";

export function addFindingNodes(
  builder: GraphBuilder,
  objections: SalesObjection[],
  winLossInsights: SalesWinLossInsight[],
  competitorMentions: SalesCompetitorMention[],
  oppById: Map<string, SalesOpportunity>,
): void {
  for (const objection of objections) {
    const findingNodeId = graphNodeId("finding", objection.id);
    builder.addNode({
      id: findingNodeId,
      type: "finding",
      sourceId: objection.id,
      label: objection.description,
      meta: {
        findingType: "objection",
        category: objection.category,
        resolved: objection.resolved,
      },
    });

    if (objection.opportunityId) {
      link(
        builder,
        "mentions",
        findingNodeId,
        graphNodeId("opp", objection.opportunityId),
        { relation: "objection_opp" },
      );
    }
    if (objection.accountId) {
      link(
        builder,
        "related_to",
        findingNodeId,
        graphNodeId("account", objection.accountId),
        { relation: "objection_account" },
      );
    }
  }

  for (const wl of winLossInsights) {
    const findingNodeId = graphNodeId("finding", wl.id);
    builder.addNode({
      id: findingNodeId,
      type: "finding",
      sourceId: wl.id,
      label: wl.primaryReason,
      meta: {
        findingType: "win_loss",
        outcome: wl.outcome,
        competitorInvolved: wl.competitorInvolved,
      },
    });

    const oppNodeId = graphNodeId("opp", wl.opportunityId);
    link(builder, "related_to", findingNodeId, oppNodeId, {
      relation: "win_loss_opp",
    });

    if (wl.outcome === "won") {
      link(builder, "wins_with", findingNodeId, oppNodeId, {
        relation: "finding_won_opp",
      });
    } else {
      link(builder, "loses_with", findingNodeId, oppNodeId, {
        relation: "finding_lost_opp",
      });
    }

    if (wl.accountId) {
      link(
        builder,
        "related_to",
        findingNodeId,
        graphNodeId("account", wl.accountId),
        { relation: "win_loss_account" },
      );
    }
  }

  for (const mention of competitorMentions) {
    const findingNodeId = graphNodeId("finding", mention.id);
    builder.addNode({
      id: findingNodeId,
      type: "finding",
      sourceId: mention.id,
      label: mention.competitorName,
      meta: {
        findingType: "competitor",
        context: mention.context,
        threatLevel: mention.threatLevel,
      },
    });

    if (mention.opportunityId) {
      const oppNodeId = graphNodeId("opp", mention.opportunityId);
      link(builder, "mentions", findingNodeId, oppNodeId, {
        relation: "competitor_opp",
      });
      const opp = oppById.get(mention.opportunityId);
      if (opp && isClosedLost(opp)) {
        link(builder, "loses_with", findingNodeId, oppNodeId, {
          relation: "competitor_lost_opp",
        });
      }
    }
  }
}
