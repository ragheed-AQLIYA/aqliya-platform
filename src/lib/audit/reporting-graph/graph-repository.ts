import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function ensureReportingGraph(engagementId: string) {
  return prisma.reportingGraph.upsert({
    where: { engagementId },
    create: { engagementId },
    update: {},
  });
}

export async function clearReportingGraphContent(graphId: string) {
  await prisma.reportingGraphEdge.deleteMany({ where: { graphId } });
  await prisma.reportingGraphNode.deleteMany({ where: { graphId } });
}

export async function bumpReportingGraphVersion(graphId: string) {
  return prisma.reportingGraph.update({
    where: { id: graphId },
    data: { version: { increment: 1 } },
  });
}

export type UpsertGraphNodeInput = {
  graphId: string;
  nodeType: string;
  entityType: string;
  entityId: string;
  label: string;
  metadata?: Record<string, unknown>;
};

export async function upsertGraphNode(
  input: UpsertGraphNodeInput,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.reportingGraphNode.upsert({
    where: {
      graphId_entityType_entityId: {
        graphId: input.graphId,
        entityType: input.entityType,
        entityId: input.entityId,
      },
    },
    create: {
      graphId: input.graphId,
      nodeType: input.nodeType,
      entityType: input.entityType,
      entityId: input.entityId,
      label: input.label,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue,
    },
    update: {
      nodeType: input.nodeType,
      label: input.label,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue,
    },
  });
}

export async function upsertGraphEdge(
  input: {
    graphId: string;
    edgeType: string;
    sourceNodeId: string;
    targetNodeId: string;
    metadata?: Record<string, unknown>;
  },
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? prisma;
  return client.reportingGraphEdge.upsert({
    where: {
      graphId_edgeType_sourceNodeId_targetNodeId: {
        graphId: input.graphId,
        edgeType: input.edgeType,
        sourceNodeId: input.sourceNodeId,
        targetNodeId: input.targetNodeId,
      },
    },
    create: {
      graphId: input.graphId,
      edgeType: input.edgeType,
      sourceNodeId: input.sourceNodeId,
      targetNodeId: input.targetNodeId,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue,
    },
    update: {
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue,
    },
  });
}

export async function createPersistedGraphSnapshot(params: {
  graphId: string;
  milestone: string;
  nodeCount: number;
  edgeCount: number;
  payload: Record<string, unknown>;
}) {
  return prisma.reportingGraphSnapshot.create({
    data: {
      graphId: params.graphId,
      milestone: params.milestone,
      nodeCount: params.nodeCount,
      edgeCount: params.edgeCount,
      payload: params.payload as Prisma.InputJsonValue,
    },
  });
}

export async function loadPersistedGraphWithRelations(engagementId: string) {
  return prisma.reportingGraph.findUnique({
    where: { engagementId },
    include: {
      nodes: true,
      edges: true,
    },
  });
}
