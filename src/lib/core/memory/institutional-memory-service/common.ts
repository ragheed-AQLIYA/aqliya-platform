import "server-only"
import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import type { Prisma } from "@prisma/client"

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

// ─── Constants ───

export const VALID_NODE_TYPES = new Set([
  "DOCUMENT", "CONCEPT", "DECISION", "DECISION_OPTION", "FACT",
  "ENTITY", "METRIC", "POLICY", "WORKFLOW", "CONTACT", "CUSTOM",
])

export const VALID_RELATIONSHIPS = new Set([
  "REFERENCES", "CAUSES", "DEPENDS_ON", "PART_OF", "RELATED_TO",
  "PRECEDES", "SUCCEEDS", "IMPLEMENTS", "CONTRADICTS", "CUSTOM",
])

export const MUTATION_ACTIONS = {
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

// ─── Pure Helpers ───

export function normalizeType(t: string): string {
  const upper = t.toUpperCase()
  return VALID_NODE_TYPES.has(upper) ? upper : "CUSTOM"
}

export function normalizeRelationship(r: string): string {
  const upper = r.toUpperCase()
  return VALID_RELATIONSHIPS.has(upper) ? upper : "CUSTOM"
}

export function normalizeWeight(w: number | undefined): number {
  if (w === undefined || w === null) return 0.5
  return Math.max(0, Math.min(1, w))
}

export function buildMetadata(
  input: Record<string, unknown> | undefined,
  extras?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const base = { ...(input ?? {}) }
  if (extras) {
    Object.assign(base, extras)
  }
  return Object.keys(base).length > 0 ? base : undefined
}

// ─── Side-effect Helpers ───

export async function writeEvent(event: {
  organizationId?: string
  nodeId?: string
  action: string
  metadata?: Record<string, unknown>
  performedBy?: string
}): Promise<void> {
  try {
    await prisma.institutionalMemoryEvent.create({
      data: {
        organizationId: event.organizationId ?? "",
        sourceProduct: event.action,
        sourceEntityId: event.nodeId ?? "unknown",
        sourceEntityType: "Event",
        targetProduct: event.action,
        targetEntityId: event.nodeId ?? "unknown",
        targetEntityType: "Event",
        eventType: event.action,
        description: "",
        nodeId: event.nodeId ?? null,
        action: event.action,
        metadata: (event.metadata ?? {}) as Prisma.InputJsonValue,
        performedBy: event.performedBy ?? null,
        createdById: event.performedBy ?? "system",
      },
    })
  } catch {
    // Non-blocking — must never break the calling operation
  }
}

export async function auditLog(action: string, extra: {
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
