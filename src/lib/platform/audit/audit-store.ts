// ─── Immutable Audit Store ───
// مخزن التدقيق غير القابل للتعديل - يكتب و يتحقق من سلسلة التجزئة

import "server-only"

import { prisma } from "@/lib/prisma"
import { computeHash, findNonce, verifyChain } from "./hash-chain"
import type { HashChainProof, ChainVerificationResult } from "./types"
import type { ChainEntryData } from "./hash-chain"

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
