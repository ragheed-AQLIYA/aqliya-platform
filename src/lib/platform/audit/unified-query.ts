// ─── Unified Audit Query Layer ───
// PlatformAuditLog is the single source of truth after audit log merge Phase 1-2.
// All product writes go to PlatformAuditLog with productKey + sourceModel for traceability.

import "server-only"
import { prisma } from "@/lib/prisma"

/** Supported product keys matching the dual-write productKey values */
export type ProductKey =
  | "audit_os"
  | "decision_os"
  | "salesos"
  | "sales_os"
  | "workflowos"
  | "local_content"
  | "sunbul"
  | "office_ai"

export interface UnifiedAuditEntry {
  id: string
  sourceModel: "PlatformAuditLog"
  action: string
  actorId: string | null
  actorName: string | null
  targetType: string
  targetId: string | null
  organizationId: string | null
  severity: string | null
  status: string | null
  metadata: Record<string, unknown> | null
  beforeState: string | null
  afterState: string | null
  eventDescription: string | null
  aiRelated: boolean
  aiConfidence: number | null
  createdAt: Date
}

export interface UnifiedAuditSearchOptions {
  organizationId?: string
  actorId?: string
  targetType?: string
  action?: string
  productKey?: ProductKey
  sourceModels?: UnifiedAuditEntry["sourceModel"][]
  fromDate?: Date
  toDate?: Date
  limit: number
  offset: number
}

export interface UnifiedAuditSearchResult {
  entries: UnifiedAuditEntry[]
  total: number
  hasMore: boolean
}

/**
 * Extract JSON metadata safely from a Prisma model field.
 */
function safeMetadata(
  val: unknown,
): Record<string, unknown> | null {
  if (!val) return null
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as Record<string, unknown>
    } catch {
      return { raw: val.slice(0, 200) }
    }
  }
  if (typeof val === "object") return val as Record<string, unknown>
  return null
}

/** Normalise a PlatformAuditLog row into a UnifiedAuditEntry. */
function normalisePlatformLog(row: Record<string, unknown>): UnifiedAuditEntry {
  return {
    id: String(row.id ?? ""),
    sourceModel: "PlatformAuditLog",
    action: String(row.action ?? row.eventType ?? row.type ?? "unknown"),
    actorId: (row.actorId as string) ?? null,
    actorName: (row.actorName as string) ?? null,
    targetType: String(row.targetType ?? row.sourceModel ?? row.resourceType ?? "unknown"),
    targetId: (row.targetId ?? row.sourceId ?? null) as string | null,
    organizationId: (row.organizationId ?? row.platformOrganizationId ?? row.orgId ?? null) as string | null,
    severity: (row.severity as string) ?? "info",
    status: (row.status as string) ?? null,
    metadata: safeMetadata(row.metadata),
    beforeState: (row.beforeState as string) ?? null,
    afterState: (row.afterState as string) ?? null,
    eventDescription: (row.eventDescription as string) ?? null,
    aiRelated: (row.aiRelated as boolean) ?? false,
    aiConfidence: (row.aiConfidence as number) ?? null,
    createdAt: (row.createdAt as Date) ?? new Date(),
  }
}



/**
 * Search PlatformAuditLog with optional productKey filter.
 */
export async function searchUnifiedAuditLogs(
  options: UnifiedAuditSearchOptions,
): Promise<UnifiedAuditSearchResult> {
  const limit = Math.min(options.limit, 100)
  const offset = options.offset ?? 0

  const rows = await queryPlatformAuditLogs(options)
  const total = rows.length
  return {
    entries: rows.slice(offset, offset + limit),
    total,
    hasMore: offset + limit < total,
  }
}

async function queryPlatformAuditLogs(
  opts: UnifiedAuditSearchOptions,
): Promise<UnifiedAuditEntry[]> {
  const where: Record<string, unknown> = {}
  if (opts.organizationId) {
    // Prefer organizationId (new field), fall back to platformOrganizationId
    where.OR = [
      { organizationId: opts.organizationId },
      { platformOrganizationId: opts.organizationId },
    ]
  }
  if (opts.productKey) where.productKey = opts.productKey
  if (opts.actorId) where.actorId = opts.actorId
  if (opts.targetType) where.targetType = opts.targetType
  if (opts.action) where.action = opts.action
  if (opts.fromDate || opts.toDate) {
    const createdAt: Record<string, Date> = {}
    if (opts.fromDate) createdAt.gte = opts.fromDate
    if (opts.toDate) createdAt.lte = opts.toDate
    where.createdAt = createdAt
  }

  const rows = await prisma.platformAuditLog.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: opts.limit,
  })

  return rows.map((r) =>
    normalisePlatformLog(r as unknown as Record<string, unknown>),
  )
}

/**
 * Get a summary of audit entries per product from PlatformAuditLog.
 */
export async function getUnifiedAuditSummary(): Promise<
  Record<string, { total: number; lastEvent: Date | null }>
> {
  const safeCount = async (where?: Record<string, unknown>): Promise<number> => {
    try {
      return await prisma.platformAuditLog.count({ where: where as never })
    } catch {
      return 0
    }
  }

  const safeLast = async (where?: Record<string, unknown>): Promise<{ createdAt: Date } | null> => {
    try {
      return await prisma.platformAuditLog.findFirst({
        where: where as never,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })
    } catch {
      return null
    }
  }

  const [palCount, palLast] = await Promise.all([
    safeCount(),
    safeLast(),
  ])

  return {
    PlatformAuditLog: { total: palCount, lastEvent: palLast?.createdAt ?? null },
  }
}
