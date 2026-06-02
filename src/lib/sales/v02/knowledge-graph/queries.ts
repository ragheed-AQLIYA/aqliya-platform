// @ts-nocheck
import { graphNodeId } from "./ids";
import type {
  CommercialKnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeKind,
  KnowledgeGraphNode,
  KnowledgeGraphNodeKind,
  NeighborQueryOptions,
  SubgraphResult,
} from "./types";

export function getNode(
  graph: CommercialKnowledgeGraph,
  nodeId: string,
): KnowledgeGraphNode | undefined {
  return graph.indexes.nodesById.get(nodeId);
}

export function getNodeByRef(
  graph: CommercialKnowledgeGraph,
  kind: KnowledgeGraphNodeKind,
  refId: string,
): KnowledgeGraphNode | undefined {
  return getNode(graph, graphNodeId(kind, refId));
}

export function getNodesByKind(
  graph: CommercialKnowledgeGraph,
  kind: KnowledgeGraphNodeKind,
): KnowledgeGraphNode[] {
  return graph.indexes.nodesByKind.get(kind) ?? [];
}

export function getOutgoingEdges(
  graph: CommercialKnowledgeGraph,
  nodeId: string,
  edgeKind?: KnowledgeGraphEdgeKind,
): KnowledgeGraphEdge[] {
  const edges = graph.indexes.outEdges.get(nodeId) ?? [];
  return edgeKind ? edges.filter((e) => e.kind === edgeKind) : edges;
}

export function getIncomingEdges(
  graph: CommercialKnowledgeGraph,
  nodeId: string,
  edgeKind?: KnowledgeGraphEdgeKind,
): KnowledgeGraphEdge[] {
  const edges = graph.indexes.inEdges.get(nodeId) ?? [];
  return edgeKind ? edges.filter((e) => e.kind === edgeKind) : edges;
}

export function getNeighbors(
  graph: CommercialKnowledgeGraph,
  nodeId: string,
  options: NeighborQueryOptions = {},
): KnowledgeGraphNode[] {
  const { edgeKind, direction = "both", nodeKind } = options;
  const neighborIds = new Set<string>();

  if (direction === "out" || direction === "both") {
    for (const edge of getOutgoingEdges(graph, nodeId, edgeKind)) {
      neighborIds.add(edge.targetId);
    }
  }
  if (direction === "in" || direction === "both") {
    for (const edge of getIncomingEdges(graph, nodeId, edgeKind)) {
      neighborIds.add(edge.sourceId);
    }
  }

  const nodes: KnowledgeGraphNode[] = [];
  for (const id of neighborIds) {
    const node = getNode(graph, id);
    if (!node) continue;
    if (nodeKind && node.kind !== nodeKind) continue;
    nodes.push(node);
  }
  return nodes;
}

export function findRelatedNodes(
  graph: CommercialKnowledgeGraph,
  startNodeId: string,
  maxDepth = 2,
  edgeKinds?: KnowledgeGraphEdgeKind[],
): KnowledgeGraphNode[] {
  const visited = new Set<string>([startNodeId]);
  let frontier = [startNodeId];

  for (let depth = 0; depth < maxDepth; depth++) {
    const next: string[] = [];
    for (const nodeId of frontier) {
      const out = getOutgoingEdges(graph, nodeId);
      const inn = getIncomingEdges(graph, nodeId);
      for (const edge of [...out, ...inn]) {
        if (edgeKinds && !edgeKinds.includes(edge.kind)) continue;
        const other =
          edge.sourceId === nodeId ? edge.targetId : edge.sourceId;
        if (visited.has(other)) continue;
        visited.add(other);
        next.push(other);
      }
    }
    frontier = next;
  }

  return [...visited]
    .filter((id) => id !== startNodeId)
    .map((id) => getNode(graph, id))
    .filter((n): n is KnowledgeGraphNode => n !== undefined);
}

export function getAccountSubgraph(
  graph: CommercialKnowledgeGraph,
  accountRefId: string,
): SubgraphResult | undefined {
  const root = getNodeByRef(graph, "account", accountRefId);
  if (!root) return undefined;

  const related = findRelatedNodes(graph, root.id, 2);
  const nodeIds = new Set([root.id, ...related.map((n) => n.id)]);
  const edges = graph.edges.filter(
    (e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId),
  );

  return {
    nodes: [root, ...related],
    edges,
  };
}

export function getIndustrySubgraph(
  graph: CommercialKnowledgeGraph,
  industryRefId: string,
): SubgraphResult | undefined {
  const root = getNodeByRef(graph, "industry", industryRefId);
  if (!root) return undefined;

  const related = findRelatedNodes(graph, root.id, 2);
  const nodeIds = new Set([root.id, ...related.map((n) => n.id)]);
  const edges = graph.edges.filter(
    (e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId),
  );

  return {
    nodes: [root, ...related],
    edges,
  };
}

export function getProofUsageNetwork(
  graph: CommercialKnowledgeGraph,
  proofRefId: string,
): SubgraphResult | undefined {
  const root = getNodeByRef(graph, "proof", proofRefId);
  if (!root) return undefined;

  const opps = getNeighbors(graph, root.id, {
    edgeKind: "uses",
    direction: "out",
    nodeKind: "opp",
  });
  const accounts = getNeighbors(graph, root.id, {
    edgeKind: "related_to",
    direction: "both",
    nodeKind: "account",
  });

  const nodeIds = new Set([
    root.id,
    ...opps.map((n) => n.id),
    ...accounts.map((n) => n.id),
  ]);
  const edges = graph.edges.filter(
    (e) => nodeIds.has(e.sourceId) && nodeIds.has(e.targetId),
  );

  return {
    nodes: [root, ...opps, ...accounts],
    edges,
  };
}

export function listWinningProofForAccount(
  graph: CommercialKnowledgeGraph,
  accountRefId: string,
): KnowledgeGraphNode[] {
  const accountNode = getNodeByRef(graph, "account", accountRefId);
  if (!accountNode) return [];

  const proofNodes = getNeighbors(graph, accountNode.id, {
    edgeKind: "uses",
    direction: "out",
    nodeKind: "proof",
  });

  return proofNodes.filter((proof) =>
    getOutgoingEdges(graph, proof.id, "wins_with").some((edge) => {
      const opp = getNode(graph, edge.targetId);
      return opp?.kind === "opp";
    }),
  );
}

export function listFindingsForOpportunity(
  graph: CommercialKnowledgeGraph,
  oppRefId: string,
): KnowledgeGraphNode[] {
  const oppNode = getNodeByRef(graph, "opp", oppRefId);
  if (!oppNode) return [];

  const viaMentions = getIncomingEdges(graph, oppNode.id, "mentions")
    .map((e) => getNode(graph, e.sourceId))
    .filter((n): n is KnowledgeGraphNode => n?.kind === "finding");

  const viaWinLoss = getNeighbors(graph, oppNode.id, {
    edgeKind: "related_to",
    direction: "both",
    nodeKind: "finding",
  });

  const seen = new Set<string>();
  const out: KnowledgeGraphNode[] = [];
  for (const node of [...viaMentions, ...viaWinLoss]) {
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    out.push(node);
  }
  return out;
}

export function summarizeGraph(graph: CommercialKnowledgeGraph): {
  totalNodes: number;
  totalEdges: number;
  nodeCounts: CommercialKnowledgeGraph["stats"]["nodeCounts"];
  edgeCounts: CommercialKnowledgeGraph["stats"]["edgeCounts"];
} {
  return {
    totalNodes: graph.nodes.length,
    totalEdges: graph.edges.length,
    nodeCounts: graph.stats.nodeCounts,
    edgeCounts: graph.stats.edgeCounts,
  };
}
