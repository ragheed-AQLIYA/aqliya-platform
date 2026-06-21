"use server"

/* eslint-disable @typescript-eslint/no-explicit-any */

import "server-only"
import {
  verifyAllChains,
  getChainHealth,
  exportChainProof,
} from "@/lib/platform/audit/verification"
import { verifyAuditRange, searchAuditLogs } from "@/lib/platform/audit/audit-store"
import type { AuditLogQuery } from "@/lib/platform/audit/audit-store"

/**
 * Verify the integrity of ALL hash chain entries across the system.
 * يتحقق من سلامة جميع إدخالات سلسلة التجزئة في النظام
 */
export async function verifyAllChainsAction() {
  try {
    const result = await verifyAllChains()
    return { ok: true, data: result }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { ok: false, error: message }
  }
}

/**
 * Get overall hash chain health status.
 * يحصل على حالة الصحة العامة لسلسلة التجزئة
 */
export async function getChainHealthAction() {
  try {
    const health = await getChainHealth()
    return { ok: true, data: health }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { ok: false, error: message }
  }
}

/**
 * Export cryptographic proof for a specific audit log entry.
 * يُصدر إثباتًا تشفيريًا لسجل تدقيق معين
 */
export async function exportChainProofAction(auditLogId: string) {
  try {
    const proof = await exportChainProof(auditLogId)
    return { ok: true, data: proof }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { ok: false, error: message }
  }
}

/**
 * Verify hash chain entries within a date range.
 * يتحقق من إدخالات سلسلة التجزئة في نطاق تاريخي
 */
export async function verifyAuditRangeAction(
  fromDate?: string,
  toDate?: string,
) {
  try {
    const result = await verifyAuditRange(
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
    )
    return { ok: true, data: result }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { ok: false, error: message }
  }
}

/**
 * Unified search across platform audit logs.
 * بحث موحد عبر سجلات تدقيق المنصة
 */
export async function searchAuditLogsAction(query: AuditLogQuery) {
  try {
    const result = await searchAuditLogs(query)
    return { ok: true, data: result }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return { ok: false, error: message }
  }
}
