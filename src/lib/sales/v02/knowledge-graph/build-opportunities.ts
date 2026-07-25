import { canonicalizeOpportunityStage } from "../../types";
import type { SalesOpportunity } from "../../types";
import { graphNodeId } from "./ids";
import type { GraphBuilder } from "./build-helpers";
import { link } from "./build-helpers";

export function addOpportunityNodes(
  builder: GraphBuilder,
  opportunities: SalesOpportunity[],
  accountIndustry: Map<string, string>,
): void {
  for (const opp of opportunities) {
    const oppNodeId = graphNodeId("opp", opp.id);
    builder.addNode({
      id: oppNodeId,
      type: "opp",
      sourceId: opp.id,
      label: opp.name,
      meta: {
        stage: opp.stage,
        canonicalStage: canonicalizeOpportunityStage(opp.stage),
        accountId: opp.accountId,
        valueEstimate: opp.valueEstimate,
      },
    });

    const accountNodeId = graphNodeId("account", opp.accountId);
    link(builder, "related_to", oppNodeId, accountNodeId, {
      relation: "opp_account",
    });

    const industryNodeId = accountIndustry.get(opp.accountId);
    if (industryNodeId) {
      link(builder, "related_to", oppNodeId, industryNodeId, {
        relation: "opp_industry",
      });
    }
  }
}
