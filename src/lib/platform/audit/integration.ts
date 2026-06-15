// ─── Integration with Existing Audit System ───
// دمج سلسلة التجزئة مع نظام التدقيق الحالي

import "server-only"

import { writePlatformAuditLog } from "../audit-log"
import type {
  PlatformAuditLogInput,
  PlatformAuditLogWriteResult,
} from "../audit-log"
import { appendToAuditChain } from "./audit-store"
import type { AuditLoggerContext, AuditLoggerInstance } from "../audit-logger"

export interface EnhancedAuditResult {
  auditLogId: string
  chainEntry: {
    id: string
    chainHash: string
    nonce: number
    previousHash: string | null
    createdAt: Date
  } | null
}

/**
 * Write audit log and append to hash chain in a transaction-like pattern.
 * If chain append fails, still returns the audit log (degraded mode).
 * يكتب سجل التدقيق ويُلحقه بسلسلة التجزئة
 */
export async function enhanceAuditLog(
  input: PlatformAuditLogInput,
): Promise<EnhancedAuditResult> {
  const result = await writePlatformAuditLog(input)

  if (!result.ok || !result.id) {
    throw new Error(result.error ?? "Failed to write audit log")
  }

  const chainEntry = await appendToAuditChain(
    result.id,
    input.action,
    input.actorId ?? "system",
  )

  return {
    auditLogId: result.id,
    chainEntry: chainEntry
      ? {
          id: chainEntry.id,
          chainHash: chainEntry.chainHash,
          nonce: chainEntry.nonce,
          previousHash: chainEntry.previousHash,
          createdAt: chainEntry.createdAt,
        }
      : null,
  }
}

/**
 * Create an audit logger that auto-appends to the hash chain.
 * ينشئ مسجل تدقيق يلحق تلقائيًا بسلسلة التجزئة
 */
export function auditLoggerWithChain(
  context: AuditLoggerContext,
): AuditLoggerInstance {
  const sourceSystem = context.sourceSystem ?? context.productKey

  return {
    async record(action, target?, extra?): Promise<PlatformAuditLogWriteResult> {
      const input: PlatformAuditLogInput = {
        productKey: context.productKey,
        sourceSystem,
        ...context.organization,
        ...(context.actor
          ? {
              actorId: context.actor.id,
              actorName: context.actor.name,
              actorType: context.actor.type,
              actorEmail: context.actor.email,
            }
          : {}),
        action,
        ...(target
          ? {
              targetType: target.type,
              targetId: target.id,
              targetLabel: target.label,
            }
          : {}),
        ...extra,
      }

      const writeResult = await writePlatformAuditLog(input)

      if (writeResult.ok && writeResult.id) {
        await appendToAuditChain(
          writeResult.id,
          action,
          context.actor?.id ?? "system",
        )
      }

      return writeResult
    },
  }
}
