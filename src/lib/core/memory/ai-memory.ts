import "server-only"
import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import type { Prisma } from "@prisma/client"

export interface HistoryOptions {
  organizationId: string
  userId?: string
  limit?: number
  days?: number
}

export interface QueryRecord {
  id: string
  query: string
  results: unknown
  resultCount: number
  userId: string | null
  metadata: unknown
  createdAt: Date
}

export async function storeQuery(
  query: string,
  results: Array<{ chunkId: string; documentId: string; score: number; contentPreview?: string }>,
  userId: string,
  organizationId: string,
  metadata?: Record<string, unknown>,
): Promise<string> {
  const record = await prisma.intelligenceQuery.create({
    data: {
      organizationId,
      query,
      results: results as Prisma.InputJsonValue,
      resultCount: results.length,
      userId,
      metadata: (metadata ?? {}) as Prisma.InputJsonValue,
    },
  })
  return record.id
}

export async function storeInsight(
  insight: string,
  sourceChunks: string[],
  userId: string,
  organizationId: string,
  metadata?: Record<string, unknown>,
): Promise<string> {
  const node = await prisma.intelligenceGraphNode.create({
    data: {
      organizationId,
      name: insight.length > 200 ? insight.slice(0, 200) + "..." : insight,
      type: "insight",
      metadata: {
        ...metadata,
        insight,
        sourceChunks,
        generatedById: userId,
      } as Prisma.InputJsonValue,
      createdById: userId,
    },
  })

  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "memory_insight_stored",
    platformOrganizationId: organizationId,
    actorId: userId,
    severity: "info",
    status: "recorded",
    sourceSystem: "institutional_memory",
    metadata: { nodeId: node.id, insightLength: insight.length, sourceChunkCount: sourceChunks.length },
  })

  return node.id
}

export async function getQueryHistory(
  options: HistoryOptions,
): Promise<QueryRecord[]> {
  const { organizationId, userId, limit = 20, days } = options
  const where: Record<string, unknown> = { organizationId }
  if (userId) where.userId = userId
  if (days) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    where.createdAt = { gte: cutoff }
  }

  const records = await prisma.intelligenceQuery.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return records as unknown as QueryRecord[]
}

export async function getRelatedInsights(
  topic: string,
  organizationId: string,
  limit: number = 10,
): Promise<Array<{ id: string; name: string; insight: string; createdAt: Date; score: number }>> {
  const terms = topic
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 3)
    .slice(0, 5)
  if (terms.length === 0) return []

  const nodes = await prisma.intelligenceGraphNode.findMany({
    where: {
      organizationId,
      type: "insight",
      OR: terms.map((term) => ({
        name: { contains: term, mode: "insensitive" },
      })),
    } as never,
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return nodes.map((n: { id: string; name: string; metadata: unknown; createdAt: Date }) => {
    const meta = (n.metadata ?? {}) as Record<string, unknown>
    return {
      id: n.id,
      name: n.name,
      insight: (meta.insight as string) ?? n.name,
      createdAt: n.createdAt,
      score: 0.5,
    }
  })
}

export async function createEntity(
  name: string,
  type: string,
  metadata: Record<string, unknown>,
  organizationId: string,
  userId?: string,
): Promise<string> {
  const node = await prisma.intelligenceGraphNode.create({
    data: {
      organizationId,
      name,
      type,
      metadata: metadata as Prisma.InputJsonValue,
      createdById: userId,
    },
  })
  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "memory_entity_created",
    platformOrganizationId: organizationId,
    actorId: userId,
    severity: "info",
    status: "recorded",
    sourceSystem: "institutional_memory",
    metadata: { nodeId: node.id, name, type },
  })
  return node.id
}

export async function createRelation(
  sourceId: string,
  targetId: string,
  relationType: string,
  organizationId: string,
  weight: number = 1.0,
  userId?: string,
): Promise<string> {
  const edge = await prisma.intelligenceGraphEdge.create({
    data: {
      organizationId,
      sourceId,
      targetId,
      relationType,
      weight,
      createdById: userId,
    },
  })
  await writePlatformAuditLog({
    productKey: "ai_core",
    action: "memory_relation_created",
    platformOrganizationId: organizationId,
    actorId: userId,
    severity: "info",
    status: "recorded",
    sourceSystem: "institutional_memory",
    metadata: { edgeId: edge.id, sourceId, targetId, relationType },
  })
  return edge.id
}

export async function findEntitiesByType(
  type: string,
  organizationId: string,
  limit: number = 50,
): Promise<Array<{ id: string; name: string; type: string; metadata: unknown; createdAt: Date }>> {
  const nodes = await prisma.intelligenceGraphNode.findMany({
    where: { organizationId, type } as never,
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return nodes.map((n) => ({
    id: n.id,
    name: n.name,
    type: n.type,
    metadata: n.metadata,
    createdAt: n.createdAt,
  }))
}

export async function getEntityRelations(
  nodeId: string,
  organizationId: string,
): Promise<{
  outgoing: Array<{ id: string; relationType: string; targetId: string; targetName: string; weight: number }>
  incoming: Array<{ id: string; relationType: string; sourceId: string; sourceName: string; weight: number }>
}> {
  const node = await prisma.intelligenceGraphNode.findFirst({
    where: { id: nodeId, organizationId },
  })
  if (!node) return { outgoing: [], incoming: [] }

  const edges = await prisma.intelligenceGraphEdge.findMany({
    where: {
      OR: [
        { sourceId: nodeId, organizationId },
        { targetId: nodeId, organizationId },
      ],
    },
    include: {
      source: { select: { id: true, name: true } },
      target: { select: { id: true, name: true } },
    },
  })

  const outgoing = edges
    .filter((e) => e.sourceId === nodeId)
    .map((e) => ({ id: e.id, relationType: e.relationType, targetId: e.targetId, targetName: e.target.name, weight: e.weight }))

  const incoming = edges
    .filter((e) => e.targetId === nodeId)
    .map((e) => ({ id: e.id, relationType: e.relationType, sourceId: e.sourceId, sourceName: e.source.name, weight: e.weight }))

  return { outgoing, incoming }
}
