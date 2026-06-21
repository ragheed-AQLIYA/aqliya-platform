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

  const evidenceNode = await prisma.intelligenceGraphNode.create({
    data: {
      organizationId: params.organizationId,
      name: params.evidenceLabel,
      type: "document",
      metadata: {
        evidenceId: params.evidenceId,
        productSlug: params.productSlug,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
      },
      createdById: params.createdById ?? null,
    },
  });

  const edgeId = await createEdge({
    organizationId: params.organizationId,
    sourceId: parentNodeId,
    targetId: evidenceNode.id,
    relationType: "has_evidence",
    createdById: params.createdById,
  });

  return {
    parentNodeId,
    evidenceNodeId: evidenceNode.id,
    edgeId,
  };
}

export const EvidenceGraph = {
  ensureResourceGraphNode,
  createEdge,
  linkEvidenceToGraph,
};
