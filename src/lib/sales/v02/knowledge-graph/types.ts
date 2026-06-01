export const KG_NODE_TYPES = [
  "account",
  "industry",
  "proof",
  "signal",
  "opp",
  "content",
  "finding",
] as const;

export type KnowledgeGraphNodeType = (typeof KG_NODE_TYPES)[number];

export const KG_EDGE_TYPES = [
  "uses",
  "mentions",
  "wins_with",
  "loses_with",
  "related_to",
] as const;

export type KnowledgeGraphEdgeType = (typeof KG_EDGE_TYPES)[number];

/** UI alias for KG_NODE_TYPES */
export const KNOWLEDGE_GRAPH_NODE_KINDS = KG_NODE_TYPES;

/** UI alias for KG_EDGE_TYPES */
export const KNOWLEDGE_GRAPH_EDGE_KINDS = KG_EDGE_TYPES;

export interface KnowledgeGraphNode {
  id: string;
  type: KnowledgeGraphNodeType;
  label: string;
  sourceId: string;
  meta?: Record<string, unknown>;
}

export interface KnowledgeGraphEdge {
  id: string;
  type: KnowledgeGraphEdgeType;
  from: string;
  to: string;
  meta?: Record<string, unknown>;
}

export interface KnowledgeGraphIndexes {
  nodesById: Map<string, KnowledgeGraphNode>;
  edgesByFrom: Map<string, KnowledgeGraphEdge[]>;
  edgesByTo: Map<string, KnowledgeGraphEdge[]>;
  nodesByType: Map<KnowledgeGraphNodeType, KnowledgeGraphNode[]>;
}

export interface KnowledgeGraph {
  organizationId: string;
  builtAt: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  indexes: KnowledgeGraphIndexes;
  stats: KnowledgeGraphStats;
}

export interface KnowledgeGraphStats {
  nodeCounts: Record<KnowledgeGraphNodeType, number>;
  edgeCounts: Record<KnowledgeGraphEdgeType, number>;
}

export type KnowledgeGraphFindingKind =
  | "objection"
  | "win_loss"
  | "icp"
  | "competitor";
