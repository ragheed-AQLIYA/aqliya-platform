import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
} from "./types";
import {
  getEdgesForNode,
  getNeighbors,
  getNode,
  getNodesByType,
} from "./traversal";

export function getAccountSubgraph(
  graph: KnowledgeGraph,
  accountSourceId: string,
): { account: KnowledgeGraphNode; nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } | null {
  const account = getNode(graph, `account:${accountSourceId}`);
  if (!account) return null;

  const visited = new Set<string>([account.id]);
  const queue = [account.id];
  const collectedEdges: KnowledgeGraphEdge[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const edges = getEdgesForNode(graph, current, "both");
    for (const edge of edges) {
      collectedEdges.push(edge);
      const other = edge.from === current ? edge.to : edge.from;
      if (!visited.has(other)) {
        visited.add(other);
        queue.push(other);
      }
    }
  }

  const nodes = [...visited]
    .map((id) => getNode(graph, id))
    .filter((node): node is KnowledgeGraphNode => Boolean(node));

  return { account, nodes, edges: collectedEdges };
}

export function getIndustryCluster(
  graph: KnowledgeGraph,
  industryLabel: string,
): KnowledgeGraphNode[] {
  const industryNode = getNodesByType(graph, "industry").find(
    (node) => node.label.toLowerCase() === industryLabel.toLowerCase(),
  );
  if (!industryNode) return [];

  const accounts = getNeighbors(graph, industryNode.id, {
    nodeType: "account",
    edgeType: "related_to",
  });

  const cluster = new Map<string, KnowledgeGraphNode>();
  cluster.set(industryNode.id, industryNode);

  for (const account of accounts) {
    cluster.set(account.id, account);
    const subgraph = getAccountSubgraph(graph, account.sourceId);
    if (!subgraph) continue;
    for (const node of subgraph.nodes) cluster.set(node.id, node);
  }

  return [...cluster.values()];
}

export function getIndustrySubgraph(
  graph: KnowledgeGraph,
  industryLabel: string,
): { nodes: KnowledgeGraphNode[]; edges: KnowledgeGraphEdge[] } | null {
  const industryNode = getNodesByType(graph, "industry").find(
    (node) => node.label.toLowerCase() === industryLabel.toLowerCase(),
  );
  if (!industryNode) return null;
  const cluster = getIndustryCluster(graph, industryLabel);
  const edges = graph.edges.filter(
    (e) => cluster.some((n) => n.id === e.from) || cluster.some((n) => n.id === e.to),
  );
  return { nodes: cluster, edges };
}

export function getProofUsagePaths(
  graph: KnowledgeGraph,
  proofSourceId: string,
): KnowledgeGraphEdge[] {
  const proofNodeId = `proof:${proofSourceId}`;
  return getEdgesForNode(graph, proofNodeId, "both").filter(
    (edge) => edge.type === "uses" || edge.type === "wins_with" || edge.type === "loses_with",
  );
}

export function getProofUsageNetwork(
  graph: KnowledgeGraph,
  proofSourceId: string,
): { edges: KnowledgeGraphEdge[] } | null {
  const edges = getProofUsagePaths(graph, proofSourceId);
  return edges.length > 0 ? { edges } : null;
}

export function listFindingsForOpportunity(
  graph: KnowledgeGraph,
  oppId: string,
): KnowledgeGraphNode[] {
  const oppNodeId = `opp:${oppId}`;
  return graph.nodes.filter(
    (n) => n.type === "finding" && getEdgesForNode(graph, oppNodeId, "both").some(
      (e) => e.from === n.id || e.to === n.id,
    ),
  );
}
