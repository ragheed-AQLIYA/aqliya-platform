import "server-only";

import { prisma } from "@/lib/prisma";

export async function ensureResourceGraphNode(params: {
  organizationId: string;
  resourceType: string;
  resourceId: string;
  name?: string;
  createdById?: string;
}): Promise<string> {
  const nodeName =
    params.name ?? `${params.resourceType}:${params.resourceId}`;

  const existing = await prisma.intelligenceGraphNode.findFirst({
    where: {
      organizationId: params.organizationId,
      name: nodeName,
      type: "entity",
    },
  });
  if (existing) return existing.id;

  const node = await prisma.intelligenceGraphNode.create({
    data: {
      organizationId: params.organizationId,
      name: nodeName,
      type: "entity",
      metadata: {
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        productSlug: params.resourceType,
      },
      createdById: params.createdById ?? null,
    },
  });

  return node.id;
}

export async function createEdge(params: {
  organizationId: string;
  sourceId: string;
  targetId: string;
  relationType?: string;
  createdById?: string;
}): Promise<string> {
  const existing = await prisma.intelligenceGraphEdge.findFirst({
    where: {
      organizationId: params.organizationId,
      sourceId: params.sourceId,
      targetId: params.targetId,
      relationType: params.relationType ?? "has_evidence",
    },
  });
  if (existing) return existing.id;

  const edge = await prisma.intelligenceGraphEdge.create({
    data: {
      organizationId: params.organizationId,
      sourceId: params.sourceId,
      targetId: params.targetId,
      relationType: params.relationType ?? "has_evidence",
      createdById: params.createdById ?? null,
    },
  });

  return edge.id;
}

export async function linkEvidenceToGraph(params: {
  organizationId: string;
  resourceType: string;
  resourceId: string;
  evidenceId: string;
  evidenceLabel: string;
  productSlug: string;
  createdById?: string;
}): Promise<{ parentNodeId: string; evidenceNodeId: string; edgeId: string }> {
  const parentNodeId = await ensureResourceGraphNode({
    organizationId: params.organizationId,
    resourceType: params.resourceType,
    resourceId: params.resourceId,
    createdById: params.createdById,
  });

  const evidenceNodeName = `evidence:${params.productSlug}:${params.evidenceId}`;
  const existingEvidenceNode = await prisma.intelligenceGraphNode.findFirst({
    where: {
      organizationId: params.organizationId,
      name: evidenceNodeName,
      type: "document",
    },
  });

  const evidenceNodeId =
    existingEvidenceNode?.id ??
    (
      await prisma.intelligenceGraphNode.create({
        data: {
          organizationId: params.organizationId,
          name: evidenceNodeName,
          type: "document",
          metadata: {
            evidenceId: params.evidenceId,
            productSlug: params.productSlug,
            resourceType: params.resourceType,
            resourceId: params.resourceId,
            label: params.evidenceLabel,
          },
          createdById: params.createdById ?? null,
        },
      })
    ).id;

  const edgeId = await createEdge({
    organizationId: params.organizationId,
    sourceId: parentNodeId,
    targetId: evidenceNodeId,
    relationType: "has_evidence",
    createdById: params.createdById,
  });

  return {
    parentNodeId,
    evidenceNodeId,
    edgeId,
  };
}

/** Link evidence node to a domain entity node (cross-product entity relationships). */
export async function linkEvidenceToEntityInGraph(params: {
  organizationId: string;
  evidenceNodeId: string;
  entityType: string;
  entityId: string;
  productSlug: string;
  relationType?: string;
  createdById?: string;
}): Promise<string> {
  const entityNodeId = await ensureResourceGraphNode({
    organizationId: params.organizationId,
    resourceType: params.entityType,
    resourceId: params.entityId,
    name: `${params.entityType}:${params.entityId}`,
    createdById: params.createdById,
  });

  return createEdge({
    organizationId: params.organizationId,
    sourceId: entityNodeId,
    targetId: params.evidenceNodeId,
    relationType: params.relationType ?? "evidence_for",
    createdById: params.createdById,
  });
}

/** Create lineage edge between two evidence graph nodes (provenance chain). */
export async function linkEvidenceLineageInGraph(params: {
  organizationId: string;
  sourceEvidenceNodeId: string;
  targetEvidenceNodeId: string;
  relationType?: string;
  createdById?: string;
}): Promise<string> {
  return createEdge({
    organizationId: params.organizationId,
    sourceId: params.sourceEvidenceNodeId,
    targetId: params.targetEvidenceNodeId,
    relationType: params.relationType ?? "derives_from",
    createdById: params.createdById,
  });
}

/** Traverse evidence lineage via graph edges from an evidence node. */
export async function getEvidenceLineageFromGraph(params: {
  organizationId: string;
  evidenceNodeId: string;
  maxDepth?: number;
}): Promise<
  Array<{
    nodeId: string;
    name: string;
    metadata: unknown;
    relationType: string;
    depth: number;
  }>
> {
  const maxDepth = params.maxDepth ?? 3;
  const visited = new Set<string>();
  const results: Array<{
    nodeId: string;
    name: string;
    metadata: unknown;
    relationType: string;
    depth: number;
  }> = [];

  async function walk(nodeId: string, depth: number): Promise<void> {
    if (depth > maxDepth || visited.has(nodeId)) return;
    visited.add(nodeId);

    const edges = await prisma.intelligenceGraphEdge.findMany({
      where: {
        organizationId: params.organizationId,
        OR: [
          { sourceId: nodeId, relationType: { in: ["derives_from", "supersedes", "has_evidence"] } },
          { targetId: nodeId, relationType: { in: ["derives_from", "supersedes", "has_evidence"] } },
        ],
      },
      include: {
        source: { select: { id: true, name: true, type: true, metadata: true } },
        target: { select: { id: true, name: true, type: true, metadata: true } },
      },
    });

    for (const edge of edges) {
      const neighbor =
        edge.sourceId === nodeId ? edge.target : edge.source;
      if (neighbor.type !== "document") continue;

      results.push({
        nodeId: neighbor.id,
        name: neighbor.name,
        metadata: neighbor.metadata,
        relationType: edge.relationType,
        depth,
      });

      await walk(neighbor.id, depth + 1);
    }
  }

  await walk(params.evidenceNodeId, 1);
  return results;
}

export const EvidenceGraph = {
  ensureResourceGraphNode,
  createEdge,
  linkEvidenceToGraph,
  linkEvidenceToEntityInGraph,
  linkEvidenceLineageInGraph,
  getEvidenceLineageFromGraph,
};
