// ─── Verification API ───
// واجهة التحقق من سلسلة التدقيق بالكامل

import "server-only"

import { prisma } from "@/lib/prisma"
import { computeHash, verifyChain } from "./hash-chain"
import type { ChainEntryData } from "./hash-chain"
import type {
  ChainVerificationResult,
  ChainStatus,
  HashChainProof,
} from "./types"

/**
 * Verify ALL hash chain entries across the entire system.
 * يتحقق من جميع إدخالات سلسلة التجزئة في النظام بأكمله
 */
export async function verifyAllChains(): Promise<ChainVerificationResult> {
  const entries = await prisma.hashChainEntry.findMany({
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
 * Get overall health status of the hash chain.
 * يحصل على حالة الصحة العامة لسلسلة التجزئة
 */
export async function getChainHealth(): Promise<ChainStatus> {
  const [totalEntries, lastEntry, firstEntry] = await Promise.all([
    prisma.hashChainEntry.count(),
    prisma.hashChainEntry.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true, chainVerified: true, verifiedAt: true },
    }),
    prisma.hashChainEntry.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
  ])

  if (totalEntries === 0) {
    return {
      healthy: true,
      totalEntries: 0,
      lastVerifiedAt: null,
      coverageStart: null,
      coverageEnd: null,
      tamperCount: 0,
    }
  }

  const verificationResult = await verifyAllChains()

  return {
    healthy: verificationResult.verified,
    totalEntries,
    lastVerifiedAt: lastEntry?.verifiedAt ?? null,
    coverageStart: firstEntry?.createdAt ?? null,
    coverageEnd: lastEntry?.createdAt ?? null,
    tamperCount: verificationResult.tamperedEntries,
  }
}

/**
 * Export cryptographic proof for a specific audit log entry.
 * يُصدر إثباتًا تشفيريًا لسجل تدقيق معين
 */
export async function exportChainProof(
  auditLogId: string,
): Promise<HashChainProof> {
  const entry = await prisma.hashChainEntry.findUnique({
    where: { auditLogId },
    include: {
      platformAuditLog: {
        select: { action: true, actorId: true },
      },
    },
  })

  if (!entry) {
    throw new Error(`No chain entry found for auditLogId: ${auditLogId}`)
  }

  return {
    entryId: entry.id,
    auditLogId: entry.auditLogId,
    previousHash: entry.previousHash,
    chainHash: entry.chainHash,
    nonce: entry.nonce,
    timestamp: entry.createdAt,
    action: entry.platformAuditLog?.action ?? "",
    actorId: entry.platformAuditLog?.actorId ?? "",
  }
}

/**
 * Verify a single cryptographic proof (offline verification).
 * يتحقق من إثبات تشفيري واحد (تحقق غير متصل)
 */
export function verifyExportProof(proof: HashChainProof): boolean {
  const recomputed = computeHash({
    auditLogId: proof.auditLogId,
    action: proof.action,
    actorId: proof.actorId,
    timestamp: proof.timestamp,
    previousHash: proof.previousHash,
    nonce: proof.nonce,
  })

  return recomputed === proof.chainHash
}
