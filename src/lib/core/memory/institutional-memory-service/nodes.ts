import "server-only"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"
import { normalizeType, buildMetadata, writeEvent, auditLog, MUTATION_ACTIONS } from "./common"
import type { CreateNodeInput } from "./common"

// ─── Node CRUD ───

export async function createNode(input: CreateNodeInput): Promise<{ id: string }> {
  const type = normalizeType(input.type)
  const metadata = buildMetadata(input.metadata, input.tags ? { tags: input.tags } : undefined)

  if (input.organizationId) {
    const existing = await prisma.intelligenceGraphNode.findFirst({
      where: {
        organizationId: input.organizationId,
        type,
        name: input.label,
      },
      select: { id: true },
    })
    if (existing) {
      return { id: existing.id }
    }
  }

  const node = await prisma.intelligenceGraphNode.create({
    data: {
      organizationId: input.organizationId ?? "",
      name: input.label,
      type,
      metadata: metadata as Prisma.InputJsonValue,
      createdById: input.createdBy ?? null,
    },
    select: { id: true },
  })

  await writeEvent({
    organizationId: input.organizationId,
    nodeId: node.id,
    action: MUTATION_ACTIONS.NODE_CREATED,
    metadata: { type, label: input.label },
    performedBy: input.createdBy,
  })

  await auditLog("institutional_memory.node_created", {
    organizationId: input.organizationId,
    actorId: input.createdBy,
    targetType: "intelligence_graph_node",
    targetId: node.id,
    targetLabel: input.label,
    metadata: { type },
  })

  return { id: node.id }
}

export async function getNode(id: string): Promise<unknown> {
  const node = await prisma.intelligenceGraphNode.findUnique({
    where: { id },
  })
  if (!node) {
    throw new Error(`Node not found: ${id}`)
  }
  return node
}

export async function updateNode(
  id: string,
  data: Partial<CreateNodeInput>,
): Promise<void> {
  const existing = await prisma.intelligenceGraphNode.findUnique({
    where: { id },
    select: { id: true, organizationId: true },
  })
  if (!existing) {
    throw new Error(`Node not found: ${id}`)
  }

  const updateData: Record<string, unknown> = {}

  if (data.label !== undefined) {
    updateData.name = data.label
  }
  if (data.type !== undefined) {
    updateData.type = normalizeType(data.type)
  }
  if (data.metadata !== undefined || data.tags !== undefined) {
    const merged = { ...(data.metadata ?? {}) }
    if (data.tags) {
      merged.tags = data.tags
    }
    updateData.metadata = buildMetadata(merged)
  }

  await prisma.intelligenceGraphNode.update({
    where: { id },
    data: updateData as Prisma.IntelligenceGraphNodeUpdateInput,
  })

  await writeEvent({
    organizationId: existing.organizationId,
    nodeId: id,
    action: MUTATION_ACTIONS.NODE_UPDATED,
    metadata: { updatedFields: Object.keys(updateData) },
    performedBy: data.createdBy,
  })

  await auditLog("institutional_memory.node_updated", {
    organizationId: existing.organizationId,
    actorId: data.createdBy,
    targetType: "intelligence_graph_node",
    targetId: id,
    metadata: { updatedFields: Object.keys(updateData) },
  })
}

export async function deleteNode(id: string): Promise<void> {
  const existing = await prisma.intelligenceGraphNode.findUnique({
    where: { id },
    select: { id: true, organizationId: true, name: true },
  })
  if (!existing) {
    throw new Error(`Node not found: ${id}`)
  }

  await prisma.intelligenceGraphNode.delete({
    where: { id },
  })

  await writeEvent({
    organizationId: existing.organizationId,
    nodeId: id,
    action: MUTATION_ACTIONS.NODE_DELETED,
    metadata: { name: existing.name },
  })

  await auditLog("institutional_memory.node_deleted", {
    organizationId: existing.organizationId,
    targetType: "intelligence_graph_node",
    targetId: id,
    targetLabel: existing.name,
  })
}
