// ─── Immutable Audit Store ───
// مخزن التدقيق غير القابل للتعديل - يكتب و يتحقق من سلسلة التجزئة

import "server-only"

import { prisma } from "@/lib/prisma"
import { computeHash, findNonce, verifyChain } from "./hash-chain"
import type { HashChainProof, ChainVerificationResult } from "./types"
import type { ChainEntryData } from "./hash-chain"
import type { Prisma } from "@prisma/client"

async function loadEntryData(
  auditLogId: string,
  includeAction = true,
): Promise<{
  action: string
  actorId: string
  createdAt: Date
} | null> {
  try {
    const auditLog = await prisma.platformAuditLog.findUnique({
      where: { id: auditLogId },
      select: { action: true, actorId: true, createdAt: true },
    })
    if (!auditLog) return null
    return {
      action: includeAction ? auditLog.action : "",
      actorId: auditLog.actorId ?? "",
      createdAt: auditLog.createdAt,
    }
  } catch {
    return null
  }
}

/**
 * Append a new entry to the hash chain for a given audit log.
 * يُلحق إدخال جديد في سلسلة التجزئة لسجل تدقيق معين
 */
export async function appendToAuditChain(
  auditLogId: string,
  action: string,
  actorId: string,
  timestamp?: Date,
) {
  try {
    const ts = timestamp ?? new Date()

    const lastEntry = await prisma.hashChainEntry.findFirst({
      orderBy: { createdAt: "desc" },
    })

    const previousHash = lastEntry?.chainHash ?? null

    const { nonce, hash } = findNonce({
      auditLogId,
      action,
      actorId,
      timestamp: ts,
      previousHash,
    })

    const entry = await prisma.hashChainEntry.create({
      data: {
        auditLogId,
        previousHash,
        chainHash: hash,
        nonce,
        createdAt: ts,
      },
    })

    return entry
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.warn(`[AuditChain] Append failed: ${message}`)
    return null
  }
}

/**
 * Verify all chain entries within an optional date range.
 * يتحقق من جميع إدخالات السلسلة في نطاق تاريخي اختياري
 */
export async function verifyAuditRange(
  fromDate?: Date,
  toDate?: Date,
): Promise<ChainVerificationResult> {
  const where: Record<string, unknown> = {}
  if (fromDate || toDate) {
    const createdAt: Record<string, Date> = {}
    if (fromDate) createdAt.gte = fromDate
    if (toDate) createdAt.lte = toDate
    where.createdAt = createdAt
  }

  const entries = await prisma.hashChainEntry.findMany({
    where,
    include: {
      platformAuditLog: {
        select: { action: true, actorId: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const chainData: ChainEntryData[] = entries.map((e) => ({
    id: e.id,
    auditLogId: e.auditLogId,
    previousHash: e.previousHash,
    chainHash: e.chainHash,
    nonce: e.nonce,
    createdAt: e.createdAt,
    action: e.platformAuditLog?.action ?? "",
    actorId: e.platformAuditLog?.actorId ?? "",
  }))

  return verifyChain(chainData)
}

/**
 * Get full audit trail for a specific resource including chain proofs.
 * يحصل على مسار التدقيق الكامل لمورد معين مع إثباتات السلسلة
 */
export async function getAuditTrailForResource(
  targetType: string,
  targetId: string,
): Promise<HashChainProof[]> {
  const auditLogs = await prisma.platformAuditLog.findMany({
    where: { targetType, targetId },
    orderBy: { createdAt: "asc" },
  })

  const auditLogIds = auditLogs.map((l) => l.id)
  const chainEntries = await prisma.hashChainEntry.findMany({
    where: { auditLogId: { in: auditLogIds } },
    orderBy: { createdAt: "asc" },
  })

  const chainMap = new Map(chainEntries.map((e) => [e.auditLogId, e]))

  return auditLogs.map((log) => {
    const chain = chainMap.get(log.id)
    return {
      entryId: chain?.id ?? "",
      auditLogId: log.id,
      previousHash: chain?.previousHash ?? null,
      chainHash: chain?.chainHash ?? "",
      nonce: chain?.nonce ?? 0,
      timestamp: log.createdAt,
      action: log.action,
      actorId: log.actorId ?? "",
    }
  })
}

/**
 * Get a single chain entry by auditLogId.
 * يحصل على إدخال سلسلة واحد بواسطة معرف سجل التدقيق
 */
export async function getChainEntry(
  auditLogId: string,
): Promise<{
  id: string
  auditLogId: string
  previousHash: string | null
  chainHash: string
  nonce: number
  createdAt: Date
} | null> {
  try {
    const entry = await prisma.hashChainEntry.findUnique({
      where: { auditLogId },
    })
    if (!entry) return null
    return {
      id: entry.id,
      auditLogId: entry.auditLogId,
      previousHash: entry.previousHash,
      chainHash: entry.chainHash,
      nonce: entry.nonce,
      createdAt: entry.createdAt,
    }
  } catch {
    return null
  }
}

// ─── Cross-Product Audit Log Search ───
// بحث موحد عبر جميع منتجات سجلات التدقيق

export interface AuditLogQuery {
  productKey?: string | string[]
  action?: string | string[]
  actorId?: string
  targetType?: string
  targetId?: string
  platformOrganizationId?: string
  clientWorkspaceId?: string
  projectId?: string
  severity?: string | string[]
  sourceSystem?: string
  sourceId?: string
  fromDate?: Date
  toDate?: Date
  limit?: number
  offset?: number
}

export interface AuditLogSearchResult {
  entries: Array<{
    id: string
    productKey: string
    action: string
    actorId: string | null
    actorType: string | null
    actorName: string | null
    actorEmail: string | null
    targetType: string | null
    targetId: string | null
    targetLabel: string | null
    severity: string
    status: string
    platformOrganizationId: string | null
    clientWorkspaceId: string | null
    projectId: string | null
    sourceSystem: string | null
    sourceId: string | null
    metadata: Prisma.JsonValue | null
    createdAt: Date
    chainVerified: boolean
  }>
  total: number
  hasMore: boolean
}

/**
 * Search platform audit logs across all products with flexible filtering.
 * يبحث في سجلات التدقيق عبر جميع المنتجات مع تصفية مرنة
 */
export async function searchAuditLogs(
  query: AuditLogQuery,
): Promise<AuditLogSearchResult> {
  const where: Prisma.PlatformAuditLogWhereInput = {}

  if (query.productKey) {
    where.productKey = Array.isArray(query.productKey)
      ? { in: query.productKey }
      : query.productKey
  }
  if (query.action) {
    where.action = Array.isArray(query.action)
      ? { in: query.action }
      : query.action
  }
  if (query.actorId) {
    where.actorId = query.actorId
  }
  if (query.targetType) {
    where.targetType = query.targetType
  }
  if (query.targetId) {
    where.targetId = query.targetId
  }
  if (query.platformOrganizationId) {
    where.platformOrganizationId = query.platformOrganizationId
  }
  if (query.clientWorkspaceId) {
    where.clientWorkspaceId = query.clientWorkspaceId
  }
  if (query.projectId) {
    where.projectId = query.projectId
  }
  if (query.severity) {
    where.severity = Array.isArray(query.severity)
      ? { in: query.severity }
      : query.severity
  }
  if (query.sourceSystem) {
    where.sourceSystem = query.sourceSystem
  }
  if (query.sourceId) {
    where.sourceId = query.sourceId
  }
  if (query.fromDate || query.toDate) {
    where.createdAt = {}
    if (query.fromDate) where.createdAt.gte = query.fromDate
    if (query.toDate) where.createdAt.lte = query.toDate
  }

  const limit = Math.min(query.limit ?? 50, 200)
  const offset = query.offset ?? 0

  try {
    const [rows, total] = await Promise.all([
      prisma.platformAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          hashChainEntry: {
            select: { id: true },
          },
        },
      }),
      prisma.platformAuditLog.count({ where }),
    ])

    const entries = rows.map((r) => ({
      id: r.id,
      productKey: r.productKey,
      action: r.action,
      actorId: r.actorId,
      actorType: r.actorType,
      actorName: r.actorName,
      actorEmail: r.actorEmail,
      targetType: r.targetType,
      targetId: r.targetId,
      targetLabel: r.targetLabel,
      severity: r.severity,
      status: r.status,
      platformOrganizationId: r.platformOrganizationId,
      clientWorkspaceId: r.clientWorkspaceId,
      projectId: r.projectId,
      sourceSystem: r.sourceSystem,
      sourceId: r.sourceId,
      metadata: r.metadata,
      createdAt: r.createdAt,
      chainVerified: r.hashChainEntry !== null,
    }))

    return {
      entries,
      total,
      hasMore: offset + entries.length < total,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.warn(`[AuditSearch] Query failed: ${message}`)
    return { entries: [], total: 0, hasMore: false }
  }
}
