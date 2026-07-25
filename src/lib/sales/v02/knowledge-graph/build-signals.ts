import type { SalesSignal } from "../../types";
import { graphNodeId } from "./ids";
import type { GraphBuilder } from "./build-helpers";
import { link } from "./build-helpers";

export function addSignalNodes(
  builder: GraphBuilder,
  signals: SalesSignal[],
): void {
  for (const signal of signals) {
    const signalNodeId = graphNodeId("signal", signal.id);
    builder.addNode({
      id: signalNodeId,
      type: "signal",
      sourceId: signal.id,
      label: signal.description,
      meta: {
        signalType: signal.signalType,
        strength: signal.strength,
        status: signal.status,
      },
    });

    if (signal.opportunityId) {
      link(
        builder,
        "mentions",
        signalNodeId,
        graphNodeId("opp", signal.opportunityId),
        { relation: "signal_opp" },
      );
    }
    if (signal.accountId) {
      link(
        builder,
        "related_to",
        signalNodeId,
        graphNodeId("account", signal.accountId),
        { relation: "signal_account" },
      );
    }
  }
}
