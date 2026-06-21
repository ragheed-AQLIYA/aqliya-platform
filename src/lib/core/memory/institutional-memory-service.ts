import "server-only"
/* eslint-disable @typescript-eslint/no-explicit-any -- R-IM-01: graph memory vs InstitutionalMemoryEvent schema drift */
import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

// Cast for legacy collection/event APIs not aligned with current Prisma models (R-IM-01).
const p = prisma as any

// ─── Types ───

export interface CreateNodeInput {
  organizationId?: string
  type: string
  label: string
  metadata?: Record<string, unknown>
  tags?: string[]
  sourceId?: string
  createdBy?: string
}

export interface CreateEdgeInput {
  organizationId?: string
  sourceNodeId: string
  targetNodeId: string
  relationship: string
  weight?: number
  metadata?: Record<string, unknown>
  createdBy?: string
}

export interface SearchMemoryInput {
  organizationId?: string
  query: string
  nodeTypes?: string[]
  tags?: string[]
  maxResults?: number
  minConfidence?: number
  userId?: string
}

export interface CollectionInput {
  organizationId?: string
  name: string
  description?: string
  icon?: string
  color?: string
  createdBy?: string
}

export interface IngestDocumentInput {
  organizationId: string
  source?: string
  documents: {
    documentId: string
    title?: string
    sourceType?: string
    content?: string
    metadata?: Record<string, unknown>
    createdBy?: string
  }[]
}

export interface MemoryStats {
  totalNodes: number
  totalEdges: number
  totalCollections: number
  totalQueries: number
  nodesByType: Record<string, number>
  recentActivity: number
}

// ─── Internal Helpers ───

const VALID_NODE_TYPES = new Set([
  "DOCUMENT", "CONCEPT", "DECISION", "DECISION_OPTION", "FACT",
  "ENTITY", "METRIC", "POLICY", "WORKFLOW", "CONTACT", "CUSTOM",
])

const VALID_RELATIONSHIPS = new Set([
  "REFERENCES", "CAUSES", "DEPENDS_ON", "PART_OF", "RELATED_TO",
  "PRECEDES", "SUCCEEDS", "IMPLEMENTS", "CONTRADICTS", "CUSTOM",
])

const MUTATION_ACTIONS = {
  NODE_CREATED: "NODE_CREATED",
  NODE_UPDATED: "NODE_UPDATED",
  NODE_DELETED: "NODE_DELETED",
  EDGE_CREATED: "EDGE_CREATED",
  EDGE_DELETED: "EDGE_DELETED",
  QUERY_EXECUTED: "QUERY_EXECUTED",
  BATCH_INGESTED: "BATCH_INGESTED",
  MEMORY_LINKED: "MEMORY_LINKED",
  COLLECTION_CREATED: "COLLECTION_CREATED",
} as const

function normalizeType(t: string): string {
  const upper = t.toUpperCase()
  return VALID_NODE_TYPES.has(upper) ? upper : "CUSTOM"
}

function normalizeRelationship(r: string): string {
  const upper = r.toUpperCase()
  return VALID_RELATIONSHIPS.has(upper) ? upper : "CUSTOM"
}

function normalizeWeight(w: number | undefined): number {
  if (w === undefined || w === null) return 0.5
  return Math.max(0, Math.min(1, w))
}

function buildMetadata(
  input: Record<string, unknown> | undefined,
  extras?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const base = { ...(input ?? {}) }
  if (extras) {
    Object.assign(base, extras)
  }
  return Object.keys(base).length > 0 ? base : undefined
}

async function writeEvent(event: {
  organizationId?: string
  nodeId?: string
  action: string
  metadata?: Record<string, unknown>
  performedBy?: string
}): Promise<void> {
  try {
    await p.institutionalMemoryEvent.create({
      data: {
        organizationId: event.organizationId ?? null,
        nodeId: event.nodeId ?? null,
        action: event.action,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        performedBy: event.performedBy ?? null,
      },
    })
  } catch {
    // Non-blocking — must never break the calling operation
  }
}

async function auditLog(action: string, extra: {
  organizationId?: string
  actorId?: string
  targetType?: string
  targetId?: string
  targetLabel?: string
  metadata?: Record<string, unknown>
}): Promise<void> {
  try {
    await writePlatformAuditLog({
      productKey: "platform",
      sourceSystem: "institutional_memory",
      action,
      platformOrganizationId: extra.organizationId,
      actorId: extra.actorId,
      targetType: extra.targetType,
      targetId: extra.targetId,
      targetLabel: extra.targetLabel,
      metadata: extra.metadata as Record<string, unknown> | undefined,
    })
  } catch {
    // Non-blocking
  }
}

// ─── Node CRUD ───

export async function createNode(input: CreateNodeInput): Promise<{ id: string }> {
  const type = normalizeType(input.type)
  const metadata = buildMetadata(input.metadata, input.tags ? { tags: input.tags } : undefined)

  // Duplicate detection: same type + label + org → return existing
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
      metadata: metadata as any,
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
    data: updateData as any,
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

  // Cascade: edges are deleted via onDelete: Cascade in schema
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

// ─── Edge CRUD ───

export async function createEdge(input: CreateEdgeInput): Promise<{ id: string }> {
  // Validate both nodes exist
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

  // Prevent self-referencing edges
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
      metadata: metadata as any,
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

// ─── Graph Operations ───

export async function getNodeNeighbors(
  nodeId: string,
  depth: number = 1,
): Promise<{ node: unknown; edges: unknown[] }> {
  const node = await prisma.intelligenceGraphNode.findUnique({
    where: { id: nodeId },
  })
  if (!node) {
    throw new Error(`Node not found: ${nodeId}`)
  }

  if (depth < 1) {
    return { node, edges: [] }
  }

  // BFS: collect edges at each depth level
  const visited = new Set<string>()
  const edges: unknown[] = []
  let currentLevel = [nodeId]
  visited.add(nodeId)

  for (let d = 0; d < depth; d++) {
    if (currentLevel.length === 0) break

    const foundEdges = await prisma.intelligenceGraphEdge.findMany({
      where: {
        OR: [
          { sourceId: { in: currentLevel } },
          { targetId: { in: currentLevel } },
        ],
      },
    })

    const nextLevel: string[] = []
    for (const e of foundEdges) {
      edges.push(e)
      if (!visited.has(e.sourceId)) {
        visited.add(e.sourceId)
        nextLevel.push(e.sourceId)
      }
      if (!visited.has(e.targetId)) {
        visited.add(e.targetId)
        nextLevel.push(e.targetId)
      }
    }

    currentLevel = nextLevel
  }

  return { node, edges }
}

export async function findPath(
  sourceId: string,
  targetId: string,
): Promise<unknown[]> {
  if (sourceId === targetId) {
    return []
  }

  // BFS shortest path
  const visited = new Set<string>()
  const parent = new Map<string, { node: string; edge: string }>()
  const queue: string[] = [sourceId]
  visited.add(sourceId)

  while (queue.length > 0) {
    const current = queue.shift()!

    const outgoingEdges = await prisma.intelligenceGraphEdge.findMany({
      where: { sourceId: current },
    })

    for (const e of outgoingEdges) {
      if (!visited.has(e.targetId)) {
        visited.add(e.targetId)
        parent.set(e.targetId, { node: current, edge: e.id })
        queue.push(e.targetId)

        if (e.targetId === targetId) {
          // Reconstruct path
          const path: { nodeId: string; edgeId?: string }[] = []
          let step: string | undefined = targetId
          while (step && step !== sourceId) {
            const stepData: { node: string; edge: string } = parent.get(step)!
            path.unshift({ nodeId: step, edgeId: stepData.edge })
            step = stepData.node
          }
          path.unshift({ nodeId: sourceId })

          // Fetch full node and edge data for path
          const nodeIds = path.map((x: { nodeId: string }) => x.nodeId)
          const edgeIds = path.filter((x: { edgeId?: string }): x is { nodeId: string; edgeId: string } => !!x.edgeId).map((x) => x.edgeId)
          const [nodes, pathEdges] = await Promise.all([
            prisma.intelligenceGraphNode.findMany({
              where: { id: { in: nodeIds } },
            }),
            prisma.intelligenceGraphEdge.findMany({
              where: { id: { in: edgeIds } },
            }),
          ])
          const nodeMap = new Map(nodes.map(n => [n.id, n]))
          const edgeMap = new Map(pathEdges.map(e => [e.id, e]))

          return path.map(p => ({
            node: nodeMap.get(p.nodeId) ?? null,
            edge: p.edgeId ? (edgeMap.get(p.edgeId) ?? null) : null,
          }))
        }
      }
    }
  }

  return [] // No path found
}

export async function getSubgraph(nodeIds: string[]): Promise<{ nodes: unknown[]; edges: unknown[] }> {
  const [nodes, edges] = await Promise.all([
    prisma.intelligenceGraphNode.findMany({
      where: { id: { in: nodeIds } },
    }),
    prisma.intelligenceGraphEdge.findMany({
      where: {
        OR: [
          { sourceId: { in: nodeIds } },
          { targetId: { in: nodeIds } },
        ],
      },
    }),
  ])
  return { nodes, edges }
}

// ─── Search and Query ───

export async function searchMemory(input: SearchMemoryInput): Promise<unknown[]> {
  const maxResults = input.maxResults ?? 20
  const where: Record<string, unknown> = {}

  if (input.organizationId) {
    where.organizationId = input.organizationId
  }

  if (input.query) {
    where.OR = [
      { name: { contains: input.query, mode: "insensitive" } },
    ]
  }

  if (input.nodeTypes && input.nodeTypes.length > 0) {
    where.type = { in: input.nodeTypes.map(t => normalizeType(t)) }
  }

  const results = await prisma.intelligenceGraphNode.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: maxResults,
  })

  await logQuery(input.query, results.length, input.userId, input.organizationId)

  return results
}

export async function logQuery(
  query: string,
  resultCount: number,
  userId?: string,
  organizationId?: string,
): Promise<void> {
  try {
    await prisma.intelligenceQuery.create({
      data: {
        organizationId: organizationId ?? "",
        query,
        resultCount,
        userId: userId ?? null,
        results: [],
      },
    })

    await writeEvent({
      organizationId,
      action: MUTATION_ACTIONS.QUERY_EXECUTED,
      metadata: { query, resultCount },
      performedBy: userId,
    })
  } catch {
    // Non-blocking
  }
}

// ─── Collection Management ───

export async function createCollection(input: CollectionInput): Promise<{ id: string }> {
  const collection = await p.institutionalMemoryCollection.create({
    data: {
      organizationId: input.organizationId ?? null,
      name: input.name,
      description: input.description ?? null,
      icon: input.icon ?? null,
      color: input.color ?? null,
      isActive: true,
      createdBy: input.createdBy ?? null,
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
    p.institutionalMemoryCollection.findUnique({
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
  const collection = await p.institutionalMemoryCollection.findUnique({
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
  const collection = await p.institutionalMemoryCollection.findUnique({
    where: { id: collectionId },
    select: { id: true },
  })
  if (!collection) {
    throw new Error(`Collection not found: ${collectionId}`)
  }

  // Fetch nodes linked to this collection via events
  const events = await p.institutionalMemoryEvent.findMany({
    where: {
      nodeId: { not: null },
      action: { in: [MUTATION_ACTIONS.MEMORY_LINKED, "NODE_REMOVED_FROM_COLLECTION"] },
      metadata: { contains: `"collectionId":"${collectionId}"` },
    },
    orderBy: { createdAt: "desc" },
  })

  // Reconstruct membership from event log
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

// ─── Ingestion ───

export async function ingestDocument(input: IngestDocumentInput): Promise<{ batchId: string }> {
  const batch = await prisma.ingestionBatch.create({
    data: {
      organizationId: input.organizationId,
      status: "pending",
      source: input.source ?? "manual_upload",
      totalDocuments: input.documents.length,
      createdById: input.documents[0]?.createdBy ?? null,
    },
    select: { id: true },
  })

  if (input.documents.length > 0) {
    await prisma.ingestionDocument.createMany({
      data: input.documents.map(doc => ({
        organizationId: input.organizationId,
        batchId: batch.id,
        documentId: doc.documentId,
        title: doc.title ?? null,
        sourceType: doc.sourceType ?? null,
        status: "pending",
        metadata: (doc.metadata ?? undefined) as any,
        createdById: doc.createdBy ?? null,
      })),
    })
  }

  // Update batch status
  await prisma.ingestionBatch.update({
    where: { id: batch.id },
    data: {
      status: "completed",
      processedCount: input.documents.length,
      completedAt: new Date(),
    },
  })

  await writeEvent({
    organizationId: input.organizationId,
    action: MUTATION_ACTIONS.BATCH_INGESTED,
    metadata: { batchId: batch.id, documentCount: input.documents.length, source: input.source },
    performedBy: input.documents[0]?.createdBy,
  })

  await auditLog("institutional_memory.batch_ingested", {
    organizationId: input.organizationId,
    actorId: input.documents[0]?.createdBy,
    targetType: "ingestion_batch",
    targetId: batch.id,
    metadata: { documentCount: input.documents.length, source: input.source },
  })

  return { batchId: batch.id }
}

export async function getIngestionStatus(batchId: string): Promise<unknown> {
  const batch = await prisma.ingestionBatch.findUnique({
    where: { id: batchId },
    include: {
      documents: {
        select: {
          id: true,
          documentId: true,
          title: true,
          status: true,
          totalChunks: true,
          errorMessage: true,
          createdAt: true,
        },
      },
    },
  })
  if (!batch) {
    throw new Error(`Ingestion batch not found: ${batchId}`)
  }
  return batch
}

// ─── Dashboard ───

export async function getMemoryStats(organizationId?: string): Promise<MemoryStats> {
  const orgFilter = organizationId ? { organizationId } : {}
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [totalNodes, totalEdges, totalCollections, totalQueries, nodesByType, recentEvents] =
    await Promise.all([
      prisma.intelligenceGraphNode.count({ where: orgFilter }),
      prisma.intelligenceGraphEdge.count({ where: orgFilter }),
      p.institutionalMemoryCollection.count({
        where: { ...orgFilter, isActive: true } as Record<string, unknown>,
      }),
      prisma.intelligenceQuery.count({ where: orgFilter }),
      prisma.intelligenceGraphNode.groupBy({
        by: ["type"],
        where: orgFilter,
        _count: { id: true },
      }),
      p.institutionalMemoryEvent.count({
        where: {
          ...orgFilter,
          createdAt: { gte: thirtyDaysAgo },
        } as Record<string, unknown>,
      }),
    ])

  return {
    totalNodes,
    totalEdges,
    totalCollections,
    totalQueries,
    nodesByType: Object.fromEntries(
      nodesByType.map((n: { type: string; _count: { id: number } }) => [n.type, n._count.id]),
    ),
    recentActivity: recentEvents,
  }
}
