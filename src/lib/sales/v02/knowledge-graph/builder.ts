import { canonicalizeOpportunityStage } from "../../types";
import type { KnowledgeGraphStoreSnapshot } from "./store-reader";
import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
  KnowledgeGraphStats,
} from "./types";

function nodeId(type: KnowledgeGraphNodeType, sourceId: string): string {
  return `${type}:${sourceId}`;
}

function industryKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

function edgeKey(
  type: KnowledgeGraphEdgeType,
  from: string,
  to: string,
): string {
  return `${type}:${from}->${to}`;
}

function addNode(
  nodes: Map<string, KnowledgeGraphNode>,
  node: KnowledgeGraphNode,
): void {
  nodes.set(node.id, node);
}

function addEdge(
  edges: Map<string, KnowledgeGraphEdge>,
  type: KnowledgeGraphEdgeType,
  from: string,
  to: string,
  meta?: Record<string, unknown>,
): void {
  if (from === to) return;
  const id = edgeKey(type, from, to);
  if (edges.has(id)) return;
  edges.set(id, { id, type, from, to, meta });
}

function buildIndexes(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): KnowledgeGraph["indexes"] {
  const nodesById = new Map<string, KnowledgeGraphNode>();
  const edgesByFrom = new Map<string, KnowledgeGraphEdge[]>();
  const edgesByTo = new Map<string, KnowledgeGraphEdge[]>();
  const nodesByType = new Map<KnowledgeGraphNodeType, KnowledgeGraphNode[]>();

  for (const node of nodes) {
    nodesById.set(node.id, node);
    const bucket = nodesByType.get(node.type) ?? [];
    bucket.push(node);
    nodesByType.set(node.type, bucket);
  }

  for (const edge of edges) {
    const fromBucket = edgesByFrom.get(edge.from) ?? [];
    fromBucket.push(edge);
    edgesByFrom.set(edge.from, fromBucket);

    const toBucket = edgesByTo.get(edge.to) ?? [];
    toBucket.push(edge);
    edgesByTo.set(edge.to, toBucket);
  }

  return { nodesById, edgesByFrom, edgesByTo, nodesByType };
}

function buildStats(
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
): KnowledgeGraphStats {
  const nodeCounts = Object.fromEntries(
    (["account", "industry", "proof", "signal", "opp", "content", "finding"] as const).map(
      (t) => [t, 0],
    ),
  ) as Record<KnowledgeGraphNodeType, number>;

  const edgeCounts = Object.fromEntries(
    (["uses", "mentions", "wins_with", "loses_with", "related_to"] as const).map(
      (t) => [t, 0],
    ),
  ) as Record<KnowledgeGraphEdgeType, number>;

  for (const node of nodes) nodeCounts[node.type] += 1;
  for (const edge of edges) edgeCounts[edge.type] += 1;

  return { nodeCounts, edgeCounts };
}

export function buildKnowledgeGraphFromSnapshot(
  snapshot: KnowledgeGraphStoreSnapshot,
  builtAt = new Date().toISOString(),
): KnowledgeGraph {
  const nodes = new Map<string, KnowledgeGraphNode>();
  const edges = new Map<string, KnowledgeGraphEdge>();

  const accountIds = new Set(snapshot.accounts.map((a) => a.id));
  const oppIds = new Set(snapshot.opportunities.map((o) => o.id));
  const contentIds = new Set<string>();

  for (const interaction of snapshot.interactions) {
    contentIds.add(interaction.id);
    addNode(nodes, {
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
    if (contentIds.has(activity.id)) continue;
    addNode(nodes, {
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
    contentIds.add(activity.id);
  }

  for (const account of snapshot.accounts) {
    addNode(nodes, {
      id: nodeId("account", account.id),
      type: "account",
      label: account.name,
      sourceId: account.id,
      meta: {
        status: account.status,
        industry: account.industry,
        icpFitScore: account.icpFitScore,
      },
    });

    if (account.industry?.trim()) {
      const industryId = industryKey(account.industry);
      addNode(nodes, {
        id: nodeId("industry", industryId),
        type: "industry",
        label: account.industry,
        sourceId: industryId,
      });
      addEdge(
        edges,
        "related_to",
        nodeId("account", account.id),
        nodeId("industry", industryId),
      );
    }
  }

  for (const opp of snapshot.opportunities) {
    addNode(nodes, {
      id: nodeId("opp", opp.id),
      type: "opp",
      label: opp.name,
      sourceId: opp.id,
      meta: {
        stage: opp.stage,
        canonicalStage: canonicalizeOpportunityStage(opp.stage),
        accountId: opp.accountId,
        valueEstimate: opp.valueEstimate,
      },
    });

    if (accountIds.has(opp.accountId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("opp", opp.id),
        nodeId("account", opp.accountId),
      );
    }
  }

  for (const proof of snapshot.proofAssets) {
    addNode(nodes, {
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
      if (!oppIds.has(oppId)) continue;
      addEdge(edges, "uses", nodeId("opp", oppId), nodeId("proof", proof.id));
      addEdge(edges, "related_to", nodeId("proof", proof.id), nodeId("opp", oppId));
    }

    const linkedAccounts = new Set<string>();
    if (proof.accountId) linkedAccounts.add(proof.accountId);
    for (const accountId of proof.linkedAccountIds ?? []) linkedAccounts.add(accountId);

    for (const accountId of linkedAccounts) {
      if (!accountIds.has(accountId)) continue;
      addEdge(
        edges,
        "uses",
        nodeId("account", accountId),
        nodeId("proof", proof.id),
      );
      addEdge(
        edges,
        "related_to",
        nodeId("proof", proof.id),
        nodeId("account", accountId),
      );
    }

    if (proof.evidenceRef && contentIds.has(proof.evidenceRef)) {
      addEdge(
        edges,
        "related_to",
        nodeId("proof", proof.id),
        nodeId("content", proof.evidenceRef),
      );
    }
  }

  for (const signal of snapshot.signals) {
    addNode(nodes, {
      id: nodeId("signal", signal.id),
      type: "signal",
      label: signal.description.slice(0, 80),
      sourceId: signal.id,
      meta: {
        signalType: signal.signalType,
        strength: signal.strength,
        accountId: signal.accountId,
        opportunityId: signal.opportunityId,
      },
    });

    if (signal.accountId && accountIds.has(signal.accountId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("signal", signal.id),
        nodeId("account", signal.accountId),
      );
    }
    if (signal.opportunityId && oppIds.has(signal.opportunityId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("signal", signal.id),
        nodeId("opp", signal.opportunityId),
      );
    }
    if (signal.evidenceRef && contentIds.has(signal.evidenceRef)) {
      addEdge(
        edges,
        "mentions",
        nodeId("signal", signal.id),
        nodeId("content", signal.evidenceRef),
      );
    }
  }

  for (const objection of snapshot.objections) {
    addNode(nodes, {
      id: nodeId("finding", objection.id),
      type: "finding",
      label: objection.description.slice(0, 80),
      sourceId: objection.id,
      meta: {
        findingKind: "objection",
        category: objection.category,
        resolved: objection.resolved,
      },
    });

    if (objection.opportunityId && oppIds.has(objection.opportunityId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("finding", objection.id),
        nodeId("opp", objection.opportunityId),
      );
    }
    if (objection.accountId && accountIds.has(objection.accountId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("finding", objection.id),
        nodeId("account", objection.accountId),
      );
    }
    if (objection.evidenceRef && contentIds.has(objection.evidenceRef)) {
      addEdge(
        edges,
        "mentions",
        nodeId("finding", objection.id),
        nodeId("content", objection.evidenceRef),
      );
    }
  }

  for (const mention of snapshot.competitorMentions) {
    addNode(nodes, {
      id: nodeId("finding", mention.id),
      type: "finding",
      label: mention.competitorName,
      sourceId: mention.id,
      meta: {
        findingKind: "competitor",
        context: mention.context,
        threatLevel: mention.threatLevel,
      },
    });

    if (mention.opportunityId && oppIds.has(mention.opportunityId)) {
      addEdge(
        edges,
        "mentions",
        nodeId("finding", mention.id),
        nodeId("opp", mention.opportunityId),
        { competitorName: mention.competitorName },
      );
      addEdge(
        edges,
        "related_to",
        nodeId("finding", mention.id),
        nodeId("opp", mention.opportunityId),
      );
    }
    if (mention.accountId && accountIds.has(mention.accountId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("finding", mention.id),
        nodeId("account", mention.accountId),
      );
    }
    if (mention.evidenceRef && contentIds.has(mention.evidenceRef)) {
      addEdge(
        edges,
        "mentions",
        nodeId("finding", mention.id),
        nodeId("content", mention.evidenceRef),
        { competitorName: mention.competitorName },
      );
    }
  }

  for (const insight of snapshot.icpInsights) {
    addNode(nodes, {
      id: nodeId("finding", insight.id),
      type: "finding",
      label: insight.hypothesis.slice(0, 80),
      sourceId: insight.id,
      meta: {
        findingKind: "icp",
        dimension: insight.dimension,
      },
    });

    if (insight.accountId && accountIds.has(insight.accountId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("finding", insight.id),
        nodeId("account", insight.accountId),
      );
    }
    if (insight.dimension === "industry" && insight.evidenceSummary) {
      const match = snapshot.accounts.find(
        (a) =>
          insight.accountId === a.id ||
          insight.evidenceSummary.toLowerCase().includes(a.industry?.toLowerCase() ?? ""),
      );
      if (match?.industry) {
        addEdge(
          edges,
          "related_to",
          nodeId("finding", insight.id),
          nodeId("industry", industryKey(match.industry)),
        );
      }
    }
    if (insight.evidenceRef && contentIds.has(insight.evidenceRef)) {
      addEdge(
        edges,
        "related_to",
        nodeId("finding", insight.id),
        nodeId("content", insight.evidenceRef),
      );
    }
  }

  for (const wl of snapshot.winLossInsights) {
    addNode(nodes, {
      id: nodeId("finding", wl.id),
      type: "finding",
      label: wl.primaryReason,
      sourceId: wl.id,
      meta: {
        findingKind: "win_loss",
        outcome: wl.outcome,
        competitorInvolved: wl.competitorInvolved,
      },
    });

    if (oppIds.has(wl.opportunityId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("finding", wl.id),
        nodeId("opp", wl.opportunityId),
      );

      const linkedProof = snapshot.proofAssets.filter(
        (p) =>
          p.opportunityId === wl.opportunityId ||
          p.linkedOpportunityIds?.includes(wl.opportunityId),
      );

      for (const proof of linkedProof) {
        if (wl.outcome === "won") {
          addEdge(
            edges,
            "wins_with",
            nodeId("opp", wl.opportunityId),
            nodeId("proof", proof.id),
          );
          addEdge(
            edges,
            "wins_with",
            nodeId("finding", wl.id),
            nodeId("proof", proof.id),
          );
        } else {
          addEdge(
            edges,
            "loses_with",
            nodeId("opp", wl.opportunityId),
            nodeId("proof", proof.id),
          );
          addEdge(
            edges,
            "loses_with",
            nodeId("finding", wl.id),
            nodeId("proof", proof.id),
          );
        }
      }

      const canonical = canonicalizeOpportunityStage(
        snapshot.opportunities.find((o) => o.id === wl.opportunityId)?.stage ??
          "New",
      );
      if (wl.outcome === "won" || canonical === "closed_won") {
        addEdge(
          edges,
          "wins_with",
          nodeId("opp", wl.opportunityId),
          nodeId("finding", wl.id),
        );
      }
      if (wl.outcome === "lost" || canonical === "closed_lost") {
        addEdge(
          edges,
          "loses_with",
          nodeId("opp", wl.opportunityId),
          nodeId("finding", wl.id),
        );
      }
    }

    if (wl.accountId && accountIds.has(wl.accountId)) {
      addEdge(
        edges,
        "related_to",
        nodeId("finding", wl.id),
        nodeId("account", wl.accountId),
      );
    }
    if (wl.evidenceRef && contentIds.has(wl.evidenceRef)) {
      addEdge(
        edges,
        "mentions",
        nodeId("finding", wl.id),
        nodeId("content", wl.evidenceRef),
      );
    }
  }

  const nodeList = [...nodes.values()];
  const edgeList = [...edges.values()];

  return {
    organizationId: snapshot.organizationId,
    builtAt,
    nodes: nodeList,
    edges: edgeList,
    indexes: buildIndexes(nodeList, edgeList),
    stats: buildStats(nodeList, edgeList),
  };
}

export function buildKnowledgeGraphFromStore(
  organizationId: string,
  readSnapshot: (orgId: string) => KnowledgeGraphStoreSnapshot,
): KnowledgeGraph {
  return buildKnowledgeGraphFromSnapshot(readSnapshot(organizationId));
}
