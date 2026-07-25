import { canonicalizeOpportunityStage } from "../../../types";
import type { KnowledgeGraphStoreSnapshot } from "../store-reader";
import { addEdge, addNode, industryKey, nodeId, type BuilderContext } from "./common";

export function buildFindingsPhase(
  ctx: BuilderContext,
  snapshot: KnowledgeGraphStoreSnapshot,
): void {
  for (const objection of snapshot.objections) {
    addNode(ctx.nodes, {
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

    if (objection.opportunityId && ctx.oppIds.has(objection.opportunityId)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("finding", objection.id),
        nodeId("opp", objection.opportunityId),
      );
    }
    if (objection.accountId && ctx.accountIds.has(objection.accountId)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("finding", objection.id),
        nodeId("account", objection.accountId),
      );
    }
    if (objection.evidenceRef && ctx.contentIds.has(objection.evidenceRef)) {
      addEdge(
        ctx.edges,
        "mentions",
        nodeId("finding", objection.id),
        nodeId("content", objection.evidenceRef),
      );
    }
  }

  for (const mention of snapshot.competitorMentions) {
    addNode(ctx.nodes, {
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

    if (mention.opportunityId && ctx.oppIds.has(mention.opportunityId)) {
      addEdge(
        ctx.edges,
        "mentions",
        nodeId("finding", mention.id),
        nodeId("opp", mention.opportunityId),
        { competitorName: mention.competitorName },
      );
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("finding", mention.id),
        nodeId("opp", mention.opportunityId),
      );
    }
    if (mention.accountId && ctx.accountIds.has(mention.accountId)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("finding", mention.id),
        nodeId("account", mention.accountId),
      );
    }
    if (mention.evidenceRef && ctx.contentIds.has(mention.evidenceRef)) {
      addEdge(
        ctx.edges,
        "mentions",
        nodeId("finding", mention.id),
        nodeId("content", mention.evidenceRef),
        { competitorName: mention.competitorName },
      );
    }
  }

  for (const insight of snapshot.icpInsights) {
    addNode(ctx.nodes, {
      id: nodeId("finding", insight.id),
      type: "finding",
      label: insight.hypothesis.slice(0, 80),
      sourceId: insight.id,
      meta: {
        findingKind: "icp",
        dimension: insight.dimension,
      },
    });

    if (insight.accountId && ctx.accountIds.has(insight.accountId)) {
      addEdge(
        ctx.edges,
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
          ctx.edges,
          "related_to",
          nodeId("finding", insight.id),
          nodeId("industry", industryKey(match.industry)),
        );
      }
    }
    if (insight.evidenceRef && ctx.contentIds.has(insight.evidenceRef)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("finding", insight.id),
        nodeId("content", insight.evidenceRef),
      );
    }
  }

  for (const wl of snapshot.winLossInsights) {
    addNode(ctx.nodes, {
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

    if (ctx.oppIds.has(wl.opportunityId)) {
      addEdge(
        ctx.edges,
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
            ctx.edges,
            "wins_with",
            nodeId("opp", wl.opportunityId),
            nodeId("proof", proof.id),
          );
          addEdge(
            ctx.edges,
            "wins_with",
            nodeId("finding", wl.id),
            nodeId("proof", proof.id),
          );
        } else {
          addEdge(
            ctx.edges,
            "loses_with",
            nodeId("opp", wl.opportunityId),
            nodeId("proof", proof.id),
          );
          addEdge(
            ctx.edges,
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
          ctx.edges,
          "wins_with",
          nodeId("opp", wl.opportunityId),
          nodeId("finding", wl.id),
        );
      }
      if (wl.outcome === "lost" || canonical === "closed_lost") {
        addEdge(
          ctx.edges,
          "loses_with",
          nodeId("opp", wl.opportunityId),
          nodeId("finding", wl.id),
        );
      }
    }

    if (wl.accountId && ctx.accountIds.has(wl.accountId)) {
      addEdge(
        ctx.edges,
        "related_to",
        nodeId("finding", wl.id),
        nodeId("account", wl.accountId),
      );
    }
    if (wl.evidenceRef && ctx.contentIds.has(wl.evidenceRef)) {
      addEdge(
        ctx.edges,
        "mentions",
        nodeId("finding", wl.id),
        nodeId("content", wl.evidenceRef),
      );
    }
  }
}
