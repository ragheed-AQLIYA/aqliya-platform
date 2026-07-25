import "server-only"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { normalizeRelationship, normalizeWeight, buildMetadata, writeEvent, auditLog, MUTATION_ACTIONS } from "./common"
import type { CreateEdgeInput } from "./common"

// ─── Edge CRUD ───

export async function createEdge(input: CreateEdgeInput): Promise<{ id: string }> {
  const [source, target] = await Promise.all([
    prisma.intelligenceGraphNode.findUnique({ where: { id: input.sourceNodeId }, select: { id: true } }),
    prisma.intelligenceGraphNode.findUnique({ where: { id: input.targetNodeId }, select: { id: true } }),
  ])
  if (!source) {
    throw new Error(`Source node not found: ${input.sourceNodeId}`)
  }
  if (!target) {
    throw new Error(`Target node not found: ${input.targetNodeId}`)
  }

  if (input.sourceNodeId === input.targetNodeId) {
    throw new Error("Cannot create a self-referencing edge")
  }

  const relationship = normalizeRelationship(input.relationship)
  const weight = normalizeWeight(input.weight)
  const metadata = buildMetadata(input.metadata)

  const edge = await prisma.intelligenceGraphEdge.create({
    data: {
      organizationId: input.organizationId ?? "",
      sourceId: input.sourceNodeId,
      targetId: input.targetNodeId,
      relationType: relationship,
      weight,
      metadata: metadata as Prisma.InputJsonValue,
      createdById: input.createdBy ?? null,
    },
    select: { id: true },
  })

  await writeEvent({
    organizationId: input.organizationId,
    nodeId: input.sourceNodeId,
    action: MUTATION_ACTIONS.EDGE_CREATED,
    metadata: { edgeId: edge.id, sourceId: input.sourceNodeId, targetId: input.targetNodeId, relationship },
    performedBy: input.createdBy,
  })

  await auditLog("institutional_memory.edge_created", {
    organizationId: input.organizationId,
    actorId: input.createdBy,
    targetType: "intelligence_graph_edge",
    targetId: edge.id,
    metadata: { sourceId: input.sourceNodeId, targetId: input.targetNodeId, relationship },
  })

  return { id: edge.id }
}

export async function getEdge(id: string): Promise<unknown> {
  const edge = await prisma.intelligenceGraphEdge.findUnique({
    where: { id },
  })
  if (!edge) {
    throw new Error(`Edge not found: ${id}`)
  }
  return edge
}

export async function deleteEdge(id: string): Promise<void> {
  const existing = await prisma.intelligenceGraphEdge.findUnique({
    where: { id },
    select: { id: true, organizationId: true, sourceId: true, targetId: true, relationType: true },
  })
  if (!existing) {
    throw new Error(`Edge not found: ${id}`)
  }

  await prisma.intelligenceGraphEdge.delete({
    where: { id },
  })

  await writeEvent({
    organizationId: existing.organizationId,
    nodeId: existing.sourceId,
    action: MUTATION_ACTIONS.EDGE_DELETED,
    metadata: { edgeId: id, sourceId: existing.sourceId, targetId: existing.targetId, relationship: existing.relationType },
  })

  await auditLog("institutional_memory.edge_deleted", {
    organizationId: existing.organizationId,
    targetType: "intelligence_graph_edge",
    targetId: id,
    metadata: { sourceId: existing.sourceId, targetId: existing.targetId, relationship: existing.relationType },
  })
}
