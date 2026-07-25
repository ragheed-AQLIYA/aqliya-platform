import type {
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeGraphEdgeType,
  KnowledgeGraphNode,
  KnowledgeGraphNodeType,
  KnowledgeGraphStats,
} from "../types";

export interface BuilderContext {
  nodes: Map<string, KnowledgeGraphNode>;
  edges: Map<string, KnowledgeGraphEdge>;
  accountIds: Set<string>;
  oppIds: Set<string>;
  contentIds: Set<string>;
}

export function nodeId(type: KnowledgeGraphNodeType, sourceId: string): string {
  return `${type}:${sourceId}`;
}

export function industryKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "_");
}

export function edgeKey(
  type: KnowledgeGraphEdgeType,
  from: string,
  to: string,
): string {
  return `${type}:${from}->${to}`;
}

export function addNode(
  nodes: Map<string, KnowledgeGraphNode>,
  node: KnowledgeGraphNode,
): void {
  nodes.set(node.id, node);
}

export function addEdge(
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

export function buildIndexes(
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

export function buildStats(
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
