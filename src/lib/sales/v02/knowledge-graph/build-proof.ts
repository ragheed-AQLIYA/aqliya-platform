import type { SalesOpportunity, SalesProofAsset } from "../../types";
import { graphNodeId } from "./ids";
import type { GraphBuilder } from "./build-helpers";
import { isClosedLost, isClosedWon, link } from "./build-helpers";

export function addProofNodes(
  builder: GraphBuilder,
  proofAssets: SalesProofAsset[],
  oppById: Map<string, SalesOpportunity>,
): void {
  for (const proof of proofAssets) {
    const proofNodeId = graphNodeId("proof", proof.id);
    builder.addNode({
      id: proofNodeId,
      type: "proof",
      sourceId: proof.id,
      label: proof.title,
      meta: {
        assetType: proof.assetType,
        status: proof.status,
        externalRef: proof.externalRef,
      },
    });

    const linkedOppIds = new Set<string>();
    if (proof.opportunityId) linkedOppIds.add(proof.opportunityId);
    for (const id of proof.linkedOpportunityIds ?? []) linkedOppIds.add(id);

    for (const oppId of linkedOppIds) {
      const oppNodeId = graphNodeId("opp", oppId);
      link(builder, "uses", proofNodeId, oppNodeId, { relation: "proof_opp" });

      const opp = oppById.get(oppId);
      if (opp && isClosedWon(opp)) {
        link(builder, "wins_with", proofNodeId, oppNodeId, {
          relation: "proof_closed_won",
        });
      } else if (opp && isClosedLost(opp)) {
        link(builder, "loses_with", proofNodeId, oppNodeId, {
          relation: "proof_closed_lost",
        });
      }
    }

    const linkedAccountIds = new Set<string>();
    if (proof.accountId) linkedAccountIds.add(proof.accountId);
    for (const id of proof.linkedAccountIds ?? []) linkedAccountIds.add(id);

    for (const accountId of linkedAccountIds) {
      const accountNodeId = graphNodeId("account", accountId);
      link(builder, "related_to", proofNodeId, accountNodeId, {
        relation: "proof_account",
      });
      link(builder, "uses", graphNodeId("account", accountId), proofNodeId, {
        relation: "account_uses_proof",
      });
    }
  }
}
