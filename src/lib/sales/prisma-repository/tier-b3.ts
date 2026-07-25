// ─── Tier B3 intelligence (knowledge graph) ───

import { getPrismaAny } from "./common";

interface TierB3NodeRow {
  id: string;
  organizationId: string;
  kind: string;
  refId: string | null;
  label: string | null;
  graphBuildId: string | null;
  builtAt: Date | null;
  source: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
}

interface TierB3EdgeRow {
  id: string;
  organizationId: string;
  kind: string;
  sourceNodeId: string | null;
  targetNodeId: string | null;
  graphBuildId: string | null;
  builtAt: Date | null;
  source: string | null;
  status: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
}

function toTierB3Node(row: TierB3NodeRow) {
  const ts = row.createdAt.toISOString();
  return {
    id: row.id,
    organizationId: row.organizationId,
    kind: row.kind,
    refId: row.refId ?? "",
    label: row.label ?? "",
    graphBuildId: row.graphBuildId ?? "",
    builtAt: row.builtAt?.toISOString() ?? ts,
    source: row.source ?? "",
    status: row.status ?? "active",
    createdAt: ts,
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById ?? "",
  };
}

function toTierB3Edge(row: TierB3EdgeRow) {
  const ts = row.createdAt.toISOString();
  return {
    id: row.id,
    organizationId: row.organizationId,
    kind: row.kind,
    sourceNodeId: row.sourceNodeId ?? "",
    targetNodeId: row.targetNodeId ?? "",
    graphBuildId: row.graphBuildId ?? "",
    builtAt: row.builtAt?.toISOString() ?? ts,
    source: row.source ?? "",
    status: row.status ?? "active",
    createdAt: ts,
    updatedAt: row.updatedAt.toISOString(),
    createdById: row.createdById ?? "",
  };
}

export function isTierB3PrismaReady(): boolean {
  return !!getPrismaAny().salesKnowledgeGraphNode;
}

export async function prismaLoadTierB3Intelligence(
  organizationId: string,
): Promise<{
  knowledgeGraphNodes: Map<string, ReturnType<typeof toTierB3Node>>;
  knowledgeGraphEdges: Map<string, ReturnType<typeof toTierB3Edge>>;
} | null> {
  try {
    const db = getPrismaAny();
    if (!db.salesKnowledgeGraphNode || !db.salesKnowledgeGraphEdge) return null;

    const [nodes, edges] = await Promise.all([
      db.salesKnowledgeGraphNode.findMany({ where: { organizationId }, take: 10000 }),
      db.salesKnowledgeGraphEdge.findMany({ where: { organizationId }, take: 10000 }),
    ]);

    return {
      knowledgeGraphNodes: new Map(
        nodes.map((row: TierB3NodeRow) => [row.id, toTierB3Node(row)]),
      ),
      knowledgeGraphEdges: new Map(
        edges.map((row: TierB3EdgeRow) => [row.id, toTierB3Edge(row)]),
      ),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateKnowledgeGraphNode(node: {
  id: string;
  organizationId: string;
  kind: string;
  refId: string;
  label: string;
  graphBuildId: string;
  builtAt: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesKnowledgeGraphNode.create({
      data: {
        id: node.id,
        organizationId: node.organizationId,
        kind: node.kind,
        refId: node.refId,
        label: node.label,
        graphBuildId: node.graphBuildId,
        builtAt: new Date(node.builtAt),
        source: node.source,
        status: node.status,
        createdAt: new Date(node.createdAt),
        updatedAt: new Date(node.updatedAt),
        createdById: node.createdById,
      },
    });
  } catch {
    // fail-soft
  }
}

export async function prismaCreateKnowledgeGraphEdge(edge: {
  id: string;
  organizationId: string;
  kind: string;
  sourceNodeId: string;
  targetNodeId: string;
  graphBuildId: string;
  builtAt: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesKnowledgeGraphEdge.create({
      data: {
        id: edge.id,
        organizationId: edge.organizationId,
        kind: edge.kind,
        sourceNodeId: edge.sourceNodeId,
        targetNodeId: edge.targetNodeId,
        graphBuildId: edge.graphBuildId,
        builtAt: new Date(edge.builtAt),
        source: edge.source,
        status: edge.status,
        createdAt: new Date(edge.createdAt),
        updatedAt: new Date(edge.updatedAt),
        createdById: edge.createdById,
      },
    });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateKnowledgeGraphNode(
  organizationId: string,
  nodeId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesKnowledgeGraphNode.updateMany({
      where: { id: nodeId, organizationId },
      data: patch,
    });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteKnowledgeGraphEdge(
  organizationId: string,
  edgeId: string,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesKnowledgeGraphEdge.deleteMany({
      where: { id: edgeId, organizationId },
    });
  } catch {
    // fail-soft
  }
}
