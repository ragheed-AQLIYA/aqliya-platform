'use server'

import { getCurrentUser } from '@/lib/auth'
import {
  createBridgeRule,
  listBridgeRules,
  updateBridgeRule,
  deleteBridgeRule,
  getBridgeLog,
  retryFailed,
  verifyBridgeRuleAccess,
  bridgeGenericEvent,
} from '@/lib/platform/audit-bridge'
import type {
  CreateBridgeRuleData,
  UpdateBridgeRuleData,
} from '@/lib/platform/audit-bridge'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'

export type ActionResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

export async function listBridgeRulesAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const rules = await listBridgeRules(user.organizationId)
    return { ok: true, data: rules }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function createBridgeRuleAction(data: Omit<CreateBridgeRuleData, 'createdById'>): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const rule = await createBridgeRule(user.organizationId, { ...data, createdById: user.id })
    return { ok: true, data: rule }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function updateBridgeRuleAction(ruleId: string, data: UpdateBridgeRuleData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const hasAccess = await verifyBridgeRuleAccess(ruleId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    const updated = await updateBridgeRule(ruleId, data)
    return { ok: true, data: updated }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function deleteBridgeRuleAction(ruleId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const hasAccess = await verifyBridgeRuleAccess(ruleId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    await deleteBridgeRule(ruleId)
    return { ok: true, data: null }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function getBridgeLogsAction(status?: string, source?: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const logs = await getBridgeLog(user.organizationId, { status, source })
    return { ok: true, data: logs }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}

export async function retryFailedAction(ruleId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const hasAccess = await verifyBridgeRuleAccess(ruleId, user.organizationId)
    if (!hasAccess) return { ok: false, error: 'وصول مرفوض' }
    const count = await retryFailed(ruleId)
    return { ok: true, data: { retriedCount: count } }
  } catch (e) {
    return { ok: false, error: (e as Error).message }
  }
}
