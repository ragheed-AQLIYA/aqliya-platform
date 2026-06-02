// @ts-nocheck
import {
  canonicalizeOpportunityStage,
  type SalesOpportunity,
} from "../../types";
import {
  contentRefId,
  graphEdgeId,
  graphNodeId,
  industryRefId,
} from "./ids";
import type {
  CommercialKnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeKind,
  KnowledgeGraphIndexes,
  KnowledgeGraphNode,
  KnowledgeGraphNodeKind,
  KnowledgeGraphStats,
  KnowledgeGraphStoreSnapshot,
} from "./types";
import { KNOWLEDGE_GRAPH_EDGE_KINDS, KNOWLEDGE_GRAPH_NODE_KINDS } from "./types";

function emptyStats(): KnowledgeGraphStats {
  const nodeCounts = Object.fromEntries(
    KNOWLEDGE_GRAPH_NODE_KINDS.map((k) => [k, 0]),
  ) as KnowledgeGraphStats["nodeCounts"];
  const edgeCounts = Object.fromEntries(
    KNOWLEDGE_GRAPH_EDGE_KINDS.map((k) => [k, 0]),
  ) as KnowledgeGraphStats["edgeCounts"];
  return { nodeCounts, edgeCounts };
}

function buildIndexes(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): KnowledgeGraphIndexes {
  const nodesById = new Map<string, KnowledgeGraphNode>();
  const nodesByKind = new Map<KnowledgeGraphNodeKind, KnowledgeGraphNode[]>();
  const outEdges = new Map<string, KnowledgeGraphEdge[]>();
  const inEdges = new Map<string, KnowledgeGraphEdge[]>();

  for (const kind of KNOWLEDGE_GRAPH_NODE_KINDS) {
    nodesByKind.set(kind, []);
  }

  for (const node of nodes) {
    nodesById.set(node.id, node);
    nodesByKind.get(node.kind)!.push(node);
  }

  for (const edge of edges) {
    const out = outEdges.get(edge.sourceId) ?? [];
    out.push(edge);
    outEdges.set(edge.sourceId, out);

    const inn = inEdges.get(edge.targetId) ?? [];
    inn.push(edge);
    inEdges.set(edge.targetId, inn);
  }

  return { nodesById, nodesByKind, outEdges, inEdges };
}

function computeStats(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): KnowledgeGraphStats {
  const stats = emptyStats();
  for (const node of nodes) {
    stats.nodeCounts[node.kind] += 1;
  }
  for (const edge of edges) {
    stats.edgeCounts[edge.kind] += 1;
  }
  return stats;
}

interface GraphBuilder {
  nodes: Map<string, KnowledgeGraphNode>;
  edges: Map<string, KnowledgeGraphEdge>;
  addNode(node: KnowledgeGraphNode): void;
  addEdge(edge: KnowledgeGraphEdge): void;
}

function createBuilder(): GraphBuilder {
  const nodes = new Map<string, KnowledgeGraphNode>();
  const edges = new Map<string, KnowledgeGraphEdge>();

  return {
    nodes,
    edges,
    addNode(node) {
      if (!nodes.has(node.id)) nodes.set(node.id, node);
    },
    addEdge(edge) {
      if (!edges.has(edge.id)) edges.set(edge.id, edge);
    },
  };
}

function isClosedWon(opp: SalesOpportunity): boolean {
  return canonicalizeOpportunityStage(opp.stage) === "closed_won";
}

function isClosedLost(opp: SalesOpportunity): boolean {
  return canonicalizeOpportunityStage(opp.stage) === "closed_lost";
}

function ensureIndustryNode(
  builder: GraphBuilder,
  industryLabel: string,
): string | undefined {
  const trimmed = industryLabel.trim();
  if (!trimmed) return undefined;
  const ref = industryRefId(trimmed);
  const id = graphNodeId("industry", ref);
  builder.addNode({
    id,
    kind: "industry",
    refId: ref,
    label: trimmed,
    meta: { normalized: ref },
  });
  return id;
}

function link(
  builder: GraphBuilder,
  kind: KnowledgeGraphEdgeKind,
  sourceId: string,
  targetId: string,
  meta?: Record<string, unknown>,
  suffix?: string,
): void {
  builder.addEdge({
    id: graphEdgeId(kind, sourceId, targetId, suffix),
    kind,
    sourceId,
    targetId,
    meta,
  });
}

/** Pure builder — graph is derived from snapshot only, no external graph DB. */
export function buildKnowledgeGraphFromSnapshot(
  snapshot: KnowledgeGraphStoreSnapshot,
): CommercialKnowledgeGraph {
  const builder = createBuilder();
  const oppById = new Map(snapshot.opportunities.map((o) => [o.id, o]));
  const accountIndustry = new Map<string, string>();

  for (const account of snapshot.accounts) {
    const accountNodeId = graphNodeId("account", account.id);
    builder.addNode({
      id: accountNodeId,
      kind: "account",
      refId: account.id,
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

  for (const opp of snapshot.opportunities) {
    const oppNodeId = graphNodeId("opp", opp.id);
    builder.addNode({
      id: oppNodeId,
      kind: "opp",
      refId: opp.id,
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

  for (const proof of snapshot.proofAssets) {
    const proofNodeId = graphNodeId("proof", proof.id);
    builder.addNode({
      id: proofNodeId,
      kind: "proof",
      refId: proof.id,
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

  for (const signal of snapshot.signals) {
    const signalNodeId = graphNodeId("signal", signal.id);
    builder.addNode({
      id: signalNodeId,
      kind: "signal",
      refId: signal.id,
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

  for (const insight of snapshot.icpInsights) {
    const contentNodeId = graphNodeId("content", insight.id);
    builder.addNode({
      id: contentNodeId,
      kind: "content",
      refId: insight.id,
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
      const account = snapshot.accounts.find((a) => a.id === insight.accountId);
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
  for (const interaction of snapshot.interactions) {
    if (!interaction.evidenceRef) continue;
    const ref = contentRefId(interaction.evidenceRef);
    if (contentFromEvidence.has(ref)) continue;
    contentFromEvidence.add(ref);

    const contentNodeId = graphNodeId("content", ref);
    builder.addNode({
      id: contentNodeId,
      kind: "content",
      refId: ref,
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

  for (const objection of snapshot.objections) {
    const findingNodeId = graphNodeId("finding", objection.id);
    builder.addNode({
      id: findingNodeId,
      kind: "finding",
      refId: objection.id,
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

  for (const wl of snapshot.winLossInsights) {
    const findingNodeId = graphNodeId("finding", wl.id);
    builder.addNode({
      id: findingNodeId,
      kind: "finding",
      refId: wl.id,
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

  for (const mention of snapshot.competitorMentions) {
    const findingNodeId = graphNodeId("finding", mention.id);
    builder.addNode({
      id: findingNodeId,
      kind: "finding",
      refId: mention.id,
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

  for (const activity of snapshot.activities) {
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

  const nodeList = [...builder.nodes.values()];
  const edgeList = [...builder.edges.values()];

  return {
    organizationId: snapshot.organizationId,
    builtAt: new Date().toISOString(),
    nodes: nodeList,
    edges: edgeList,
    indexes: buildIndexes(nodeList, edgeList),
    stats: computeStats(nodeList, edgeList),
  };
}
