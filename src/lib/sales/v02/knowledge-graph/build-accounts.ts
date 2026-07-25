import type { SalesAccount } from "../../types";
import { graphNodeId } from "./ids";
import type { GraphBuilder } from "./build-helpers";
import { ensureIndustryNode, link } from "./build-helpers";

export function addAccountNodes(
  builder: GraphBuilder,
  accounts: SalesAccount[],
): Map<string, string> {
  const accountIndustry = new Map<string, string>();

  for (const account of accounts) {
    const accountNodeId = graphNodeId("account", account.id);
    builder.addNode({
      id: accountNodeId,
      type: "account",
      sourceId: account.id,
      label: account.name,
      meta: {
        status: account.status,
        industry: account.industry,
        icpFitScore: account.icpFitScore,
      },
    });

    if (account.industry) {
      const industryNodeId = ensureIndustryNode(builder, account.industry);
      if (industryNodeId) {
        accountIndustry.set(account.id, industryNodeId);
        link(builder, "related_to", accountNodeId, industryNodeId, {
          relation: "account_industry",
        });
      }
    }
  }

  return accountIndustry;
}
