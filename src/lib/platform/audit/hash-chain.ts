// ─── Core Hash Chain Logic ───
// منطق سلسلة التجزئة الأساسي للتدقيق غير القابل للتعديل

import { createHash } from "crypto"
import type { ChainVerificationResult } from "./types"

export interface HashInput {
  auditLogId: string
  action: string
  actorId: string
  timestamp: Date
  previousHash?: string | null
  nonce?: number
}

/**
 * Full chain entry data needed for verification.
 * Includes action/actorId from the linked PlatformAuditLog.
 * يشمل بيانات إدخال السلسلة الكاملة للتحقق
 */
export interface ChainEntryData {
  id: string
  auditLogId: string
  previousHash: string | null
  chainHash: string
  nonce: number
  createdAt: Date
  action: string
  actorId: string
}

/**
 * Compute SHA-256 hash for an audit chain entry.
 * يحسب تجزئة SHA-256 لإدخال سلسلة التدقيق
 */
export function computeHash(input: HashInput): string {
  const data = [
    input.previousHash || "",
    input.auditLogId,
    input.action,
    input.actorId,
    String(input.timestamp.getTime()),
    String(input.nonce ?? 0),
  ].join("|")

  return createHash("sha256").update(data, "utf-8").digest("hex")
}

/**
 * Find nonce that produces a hash starting with targetPrefix (proof-of-work).
 * يبحث عن nonce ينتج تجزئة تبدأ بالبادئة المستهدفة (إثبات العمل)
 */
export function findNonce(
  baseInput: HashInput,
  targetPrefix = "00",
): { nonce: number; hash: string } {
  let nonce = 0
  while (true) {
    const hash = computeHash({ ...baseInput, nonce })
    if (hash.startsWith(targetPrefix)) {
      return { nonce, hash }
    }
    nonce++
  }
}

/**
 * Verify a single chain entry by recomputing its hash.
 * يتحقق من إدخال سلسلة واحد بإعادة حساب تجزئته
 */
export function verifySingle(entry: ChainEntryData): boolean {
  const recomputed = computeHash({
    auditLogId: entry.auditLogId,
    action: entry.action,
    actorId: entry.actorId,
    timestamp: entry.createdAt,
    previousHash: entry.previousHash,
    nonce: entry.nonce,
  })
  return recomputed === entry.chainHash
}

/**
 * Verify entire chain sequentially.
 * يتحقق من السلسلة بأكملها بالتسلسل
 */
export function verifyChain(entries: ChainEntryData[]): ChainVerificationResult {
  const sorted = [...entries].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )

  let validEntries = 0
  let tamperedEntries = 0
  let firstTamperedId: string | undefined
  let lastValidHash: string | null = null

  const details: ChainVerificationResult["details"] = []

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]

    if (i > 0 && entry.previousHash !== lastValidHash) {
      tamperedEntries++
      firstTamperedId = firstTamperedId ?? entry.id
      details.push({
        entryId: entry.id,
        auditLogId: entry.auditLogId,
        position: i,
        valid: false,
        reason: `previousHash mismatch: expected ${lastValidHash}, got ${entry.previousHash}`,
      })
      continue
    }

    const recomputed = computeHash({
      auditLogId: entry.auditLogId,
      action: entry.action,
      actorId: entry.actorId,
      timestamp: entry.createdAt,
      previousHash: entry.previousHash,
      nonce: entry.nonce,
    })

    if (recomputed !== entry.chainHash) {
      tamperedEntries++
      firstTamperedId = firstTamperedId ?? entry.id
      details.push({
        entryId: entry.id,
        auditLogId: entry.auditLogId,
        position: i,
        valid: false,
        reason: `chainHash mismatch: expected ${recomputed}, got ${entry.chainHash}`,
      })
      continue
    }

    validEntries++
    lastValidHash = entry.chainHash
    details.push({
      entryId: entry.id,
      auditLogId: entry.auditLogId,
      position: i,
      valid: true,
    })
  }

  return {
    verified: tamperedEntries === 0,
    totalEntries: sorted.length,
    validEntries,
    tamperedEntries,
    firstTamperedId,
    details,
  }
}

/**
 * Detect where chain breaks due to tampering.
 * يكتشف أين تنقطع السلسلة بسبب العبث
 */
export function detectTampering(
  entries: ChainEntryData[],
): { tampered: boolean; firstBrokenIndex?: number } {
  const sorted = [...entries].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  )

  let lastValidHash: string | null = null

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]

    const recomputed = computeHash({
      auditLogId: entry.auditLogId,
      action: entry.action,
      actorId: entry.actorId,
      timestamp: entry.createdAt,
      previousHash: entry.previousHash,
      nonce: entry.nonce,
    })

    if (recomputed !== entry.chainHash) {
      return { tampered: true, firstBrokenIndex: i }
    }

    if (i > 0 && entry.previousHash !== lastValidHash) {
      return { tampered: true, firstBrokenIndex: i }
    }

    lastValidHash = entry.chainHash
  }

  return { tampered: false }
}
