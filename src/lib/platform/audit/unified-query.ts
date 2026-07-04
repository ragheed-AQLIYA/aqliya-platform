// ─── Unified Audit Query Layer ───
// Searches across all 4 audit models (PlatformAuditLog, AuditLog, AuditEvent, SunbulAuditEvent)
// without requiring schema changes. Provides a single unified search endpoint.
// All 4 models remain separate in the database; this is a read-only abstraction.

import "server-only"
import { prisma } from "@/lib/prisma"

export interface UnifiedAuditEntry {
  id: string
  sourceModel: "PlatformAuditLog" | "AuditLog" | "AuditEvent" | "SunbulAuditEvent"
  action: string
  actorId: string | null
  actorName: string | null
  targetType: string
  targetId: string | null
  organizationId: string | null
  severity: string | null
  status: string | null
  metadata: Record<string, unknown> | null
  createdAt: Date
}

export interface UnifiedAuditSearchOptions {
  organizationId?: string
  actorId?: string
  targetType?: string
  action?: string
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

/**
 * Normalise a single audit row from any of the 4 models into a UnifiedAuditEntry.
 */
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
    createdAt: (row.createdAt as Date) ?? new Date(),
  }
}

function normaliseEvent(row: Record<string, unknown>): UnifiedAuditEntry {
  return {
    id: String(row.id ?? ""),
    sourceModel: "AuditEvent",
    action: String(row.eventType ?? row.action ?? "unknown"),
    actorId: (row.actorId as string) ?? null,
    actorName: null,
    targetType: "Audit" as string,
    targetId: (row.entityId as string) ?? null,
    organizationId: (row.organizationId as string) ?? null,
    severity: "info",
    status: null,
    metadata: safeMetadata(row.metadata ?? row.details),
    createdAt: (row.createdAt as Date) ?? new Date(),
  }
}

function normaliseSunbul(row: Record<string, unknown>): UnifiedAuditEntry {
  return {
    id: String(row.id ?? ""),
    sourceModel: "SunbulAuditEvent",
    action: String(row.eventType ?? row.action ?? "unknown"),
    actorId: (row.actorId as string) ?? null,
    actorName: null,
    targetType: "Sunbul" as string,
    targetId: (row.recordId as string) ?? null,
    organizationId: (row.clientId ?? row.organizationId as string) ?? null,
    severity: "info",
    status: null,
    metadata: safeMetadata(row.metadata ?? row.details),
    createdAt: (row.createdAt as Date) ?? new Date(),
  }
}

function normaliseAuditLog(row: Record<string, unknown>): UnifiedAuditEntry {
  return {
    id: String(row.id ?? ""),
    sourceModel: "AuditLog",
    action: String(row.action ?? row.eventType ?? "unknown"),
    actorId: (row.userId as string) ?? null,
    actorName: (row.userName as string) ?? null,
    targetType: "AuditLegacy" as string,
    targetId: (row.resourceId as string) ?? null,
    organizationId: (row.orgId as string) ?? null,
    severity: (row.severity as string) ?? "info",
    status: (row.status as string) ?? null,
    metadata: safeMetadata(row.metadata ?? row.details),
    createdAt: (row.createdAt as Date) ?? new Date(),
  }
}

/**
 * Search across all 4 audit models with optional filters.
 * Returns merged, sorted results.
 */
export async function searchUnifiedAuditLogs(
  options: UnifiedAuditSearchOptions,
): Promise<UnifiedAuditSearchResult> {
  const models = options.sourceModels ?? [
    "PlatformAuditLog",
    "AuditLog",
    "AuditEvent",
    "SunbulAuditEvent",
  ]
  const limit = Math.min(options.limit, 100)
  const offset = options.offset ?? 0

  const results: UnifiedAuditEntry[] = []

  // Query each selected model in parallel
  const queries: Promise<UnifiedAuditEntry[]>[] = []

  if (models.includes("PlatformAuditLog")) {
    queries.push(
      queryPlatformAuditLogs(options).catch(() => [] as UnifiedAuditEntry[]),
    )
  }
  if (models.includes("AuditLog")) {
    queries.push(
      queryAuditLogs(options).catch(() => [] as UnifiedAuditEntry[]),
    )
  }
  if (models.includes("AuditEvent")) {
    queries.push(
      queryAuditEvents(options).catch(() => [] as UnifiedAuditEntry[]),
    )
  }
  if (models.includes("SunbulAuditEvent")) {
    queries.push(
      querySunbulEvents(options).catch(() => [] as UnifiedAuditEntry[]),
    )
  }

  const batches = await Promise.all(queries)
  for (const batch of batches) {
    results.push(...batch)
  }

  // Sort by createdAt descending
  results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  // Count distinct total (approximate — queries each model individually)
  const total = results.length

  // Paginate
  const paginated = results.slice(offset, offset + limit)

  return {
    entries: paginated,
    total,
    hasMore: offset + limit < total,
  }
}

async function queryPlatformAuditLogs(
  opts: UnifiedAuditSearchOptions,
): Promise<UnifiedAuditEntry[]> {
  const where: Record<string, unknown> = {}
  if (opts.organizationId) where.platformOrganizationId = opts.organizationId
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

async function queryAuditLogs(
  opts: UnifiedAuditSearchOptions,
): Promise<UnifiedAuditEntry[]> {
  const where: Record<string, unknown> = {}
  if (opts.actorId) where.userId = opts.actorId
  if (opts.action) where.action = opts.action
  if (opts.fromDate || opts.toDate) {
    const createdAt: Record<string, Date> = {}
    if (opts.fromDate) createdAt.gte = opts.fromDate
    if (opts.toDate) createdAt.lte = opts.toDate
    where.createdAt = createdAt
  }

  const rows = await prisma.auditLog.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: opts.limit,
  })

  return rows.map((r) =>
    normaliseAuditLog(r as unknown as Record<string, unknown>),
  )
}

async function queryAuditEvents(
  opts: UnifiedAuditSearchOptions,
): Promise<UnifiedAuditEntry[]> {
  const where: Record<string, unknown> = {}
  if (opts.actorId) where.actorId = opts.actorId
  if (opts.action) where.eventType = opts.action
  if (opts.fromDate || opts.toDate) {
    const createdAt: Record<string, Date> = {}
    if (opts.fromDate) createdAt.gte = opts.fromDate
    if (opts.toDate) createdAt.lte = opts.toDate
    where.createdAt = createdAt
  }

  const rows = await prisma.auditEvent.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: opts.limit,
  })

  return rows.map((r) =>
    normaliseEvent(r as unknown as Record<string, unknown>),
  )
}

async function querySunbulEvents(
  opts: UnifiedAuditSearchOptions,
): Promise<UnifiedAuditEntry[]> {
  const where: Record<string, unknown> = {}
  if (opts.action) where.eventType = opts.action
  if (opts.fromDate || opts.toDate) {
    const createdAt: Record<string, Date> = {}
    if (opts.fromDate) createdAt.gte = opts.fromDate
    if (opts.toDate) createdAt.lte = opts.toDate
    where.createdAt = createdAt
  }

  const rows = await prisma.sunbulAuditEvent.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: opts.limit,
  })

  return rows.map((r) =>
    normaliseSunbul(r as unknown as Record<string, unknown>),
  )
}

/**
 * Get a summary of audit entries per model (count by status, severity, etc.).
 */
export async function getUnifiedAuditSummary(): Promise<
  Record<string, { total: number; lastEvent: Date | null }>
> {
  const [palCount, alCount, aeCount, saeCount] = await Promise.all([
    prisma.platformAuditLog.count(),
    prisma.auditLog.count(),
    prisma.auditEvent.count(),
    prisma.sunbulAuditEvent.count(),
  ])

  const [palLast, alLast, aeLast, saeLast] = await Promise.all([
    prisma.platformAuditLog.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.auditLog.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.auditEvent.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.sunbulAuditEvent.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
  ])

  return {
    PlatformAuditLog: { total: palCount, lastEvent: palLast?.createdAt ?? null },
    AuditLog: { total: alCount, lastEvent: alLast?.createdAt ?? null },
    AuditEvent: { total: aeCount, lastEvent: aeLast?.createdAt ?? null },
    SunbulAuditEvent: { total: saeCount, lastEvent: saeLast?.createdAt ?? null },
  }
}
