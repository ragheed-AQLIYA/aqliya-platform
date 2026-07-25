import type {
  SalesAccount,
  SalesICPInsight,
  SalesInteractionLog,
} from "../../types";
import { contentRefId, graphNodeId } from "./ids";
import type { GraphBuilder } from "./build-helpers";
import { ensureIndustryNode, link } from "./build-helpers";

export function addContentNodes(
  builder: GraphBuilder,
  icpInsights: SalesICPInsight[],
  interactions: SalesInteractionLog[],
  accounts: SalesAccount[],
): void {
  for (const insight of icpInsights) {
    const contentNodeId = graphNodeId("content", insight.id);
    builder.addNode({
      id: contentNodeId,
      type: "content",
      sourceId: insight.id,
      label: insight.hypothesis,
      meta: {
        contentType: "icp_insight",
        dimension: insight.dimension,
        status: insight.status,
      },
    });

    if (insight.accountId) {
      link(
        builder,
        "related_to",
        contentNodeId,
        graphNodeId("account", insight.accountId),
        { relation: "content_account" },
      );
      const account = accounts.find((a) => a.id === insight.accountId);
      if (account?.industry) {
        const industryNodeId = ensureIndustryNode(builder, account.industry);
        if (industryNodeId) {
          link(builder, "related_to", contentNodeId, industryNodeId, {
            relation: "content_industry",
          });
        }
      }
    }

    if (insight.dimension === "industry" && insight.hypothesis) {
      const match = insight.hypothesis.match(
        /([A-Za-z][A-Za-z\s&]+?)\s+accounts/i,
      );
      if (match?.[1]) {
        const industryNodeId = ensureIndustryNode(builder, match[1].trim());
        if (industryNodeId) {
          link(builder, "related_to", contentNodeId, industryNodeId, {
            relation: "icp_industry_hypothesis",
          });
        }
      }
    }
  }

  const contentFromEvidence = new Set<string>();
  for (const interaction of interactions) {
    if (!interaction.evidenceRef) continue;
    const ref = contentRefId(interaction.evidenceRef);
    if (contentFromEvidence.has(ref)) continue;
    contentFromEvidence.add(ref);

    const contentNodeId = graphNodeId("content", ref);
    builder.addNode({
      id: contentNodeId,
      type: "content",
      sourceId: ref,
      label: interaction.evidenceRef,
      meta: {
        contentType: "evidence_ref",
        sourceInteractionId: interaction.id,
      },
    });

    link(
      builder,
      "related_to",
      contentNodeId,
      graphNodeId("account", interaction.accountId),
      { relation: "content_account" },
    );

    if (interaction.opportunityId) {
      link(
        builder,
        "related_to",
        contentNodeId,
        graphNodeId("opp", interaction.opportunityId),
        { relation: "content_opp" },
      );
    }
  }
}
