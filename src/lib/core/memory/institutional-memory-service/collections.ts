import "server-only"
import { prisma } from "@/lib/prisma"
import { writeEvent, auditLog, MUTATION_ACTIONS } from "./common"
import type { CollectionInput } from "./common"

// ─── Collection Management ───

export async function createCollection(input: CollectionInput): Promise<{ id: string }> {
  const collection = await prisma.institutionalMemoryCollection.create({
    data: {
      organizationId: input.organizationId ?? "",
      name: input.name,
      description: input.description ?? undefined,
      icon: input.icon ?? null,
      color: input.color ?? null,
      isActive: true,
      createdById: input.createdBy ?? null,
    },
    select: { id: true },
  })

  await writeEvent({
    organizationId: input.organizationId,
    action: MUTATION_ACTIONS.COLLECTION_CREATED,
    metadata: { collectionId: collection.id, name: input.name },
    performedBy: input.createdBy,
  })

  await auditLog("institutional_memory.collection_created", {
    organizationId: input.organizationId,
    actorId: input.createdBy,
    targetType: "institutional_memory_collection",
    targetId: collection.id,
    targetLabel: input.name,
  })

  return { id: collection.id }
}

export async function addNodeToCollection(
  collectionId: string,
  nodeId: string,
): Promise<void> {
  const [collection, node] = await Promise.all([
    prisma.institutionalMemoryCollection.findUnique({
      where: { id: collectionId },
      select: { id: true, organizationId: true },
    }),
    prisma.intelligenceGraphNode.findUnique({
      where: { id: nodeId },
      select: { id: true },
    }),
  ])
  if (!collection) {
    throw new Error(`Collection not found: ${collectionId}`)
  }
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  await writeEvent({
    organizationId: collection.organizationId,
    nodeId,
    action: MUTATION_ACTIONS.MEMORY_LINKED,
    metadata: { collectionId, action: "add" },
  })

  await auditLog("institutional_memory.node_added_to_collection", {
    organizationId: collection.organizationId ?? undefined,
    targetType: "intelligence_graph_node",
    targetId: nodeId,
    metadata: { collectionId },
  })
}

export async function removeNodeFromCollection(
  collectionId: string,
  nodeId: string,
): Promise<void> {
  const collection = await prisma.institutionalMemoryCollection.findUnique({
    where: { id: collectionId },
    select: { id: true, organizationId: true },
  })
  if (!collection) {
    throw new Error(`Collection not found: ${collectionId}`)
  }

  await writeEvent({
    organizationId: collection.organizationId,
    nodeId,
    action: "NODE_REMOVED_FROM_COLLECTION",
    metadata: { collectionId, action: "remove" },
  })
}

export async function getCollectionNodes(collectionId: string): Promise<unknown[]> {
  const collection = await prisma.institutionalMemoryCollection.findUnique({
    where: { id: collectionId },
    select: { id: true },
  })
  if (!collection) {
    throw new Error(`Collection not found: ${collectionId}`)
  }

  const rawEvents = await prisma.institutionalMemoryEvent.findMany({
    where: {
      nodeId: { not: null },
      action: { in: [MUTATION_ACTIONS.MEMORY_LINKED, "NODE_REMOVED_FROM_COLLECTION"] },
    },
    orderBy: { createdAt: "desc" },
  })
  const events = rawEvents.filter((e) => {
    const meta = e.metadata as Record<string, unknown> | null
    return meta?.collectionId === collectionId
  })

  const memberIds = new Set<string>()
  for (const event of events) {
    if (!event.nodeId) continue
    if (event.action === MUTATION_ACTIONS.MEMORY_LINKED) {
      memberIds.add(event.nodeId)
    } else if (event.action === "NODE_REMOVED_FROM_COLLECTION") {
      memberIds.delete(event.nodeId)
    }
  }

  if (memberIds.size === 0) return []

  return prisma.intelligenceGraphNode.findMany({
    where: { id: { in: Array.from(memberIds) } },
  })
}
