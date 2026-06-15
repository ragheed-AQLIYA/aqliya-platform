import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { BRIDGE_STRINGS } from './bridge-strings'

// ─── Types ───

export interface BridgeEventData {
  sourceId: string
  source: string
  eventType: string
  actorId: string
  action: string
  resourceType: string
  resourceId: string
  details: Record<string, unknown>
  organizationId: string
  timestamp: Date
}

export interface BridgeAdapter {
  source: string
  fetchEvent(eventId: string): Promise<BridgeEventData | null>
  listEvents(filter?: Record<string, unknown>): Promise<BridgeEventData[]>
}

export interface BridgeResult {
  ok: boolean
  targetLogId?: string
  error?: string
  sourceEventId: string
}

export interface BulkBridgeResult {
  totalProcessed: number
  succeeded: number
  failed: number
  results: BridgeResult[]
}

export interface CreateBridgeRuleData {
  name: string
  source: string
  eventTypeFilter?: string
  fieldMappings?: Record<string, string>
  maxRetries?: number
  retryIntervalMs?: number
  createdById: string
}

export interface UpdateBridgeRuleData {
  name?: string
  source?: string
  eventTypeFilter?: string
  fieldMappings?: Record<string, string>
  isActive?: boolean
  maxRetries?: number
  retryIntervalMs?: number
}

export interface AuditBridgeRule {
  id: string
  organizationId: string
  name: string
  source: string
  eventTypeFilter: string
  fieldMappings: Record<string, string> | null
  isActive: boolean
  maxRetries: number
  retryIntervalMs: number
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface BridgeLogEntry {
  id: string
  ruleId: string
  organizationId: string
  sourceEventId: string
  source: string
  eventType: string
  targetLogId: string | null
  status: string
  errorMessage: string | null
  retryCount: number
  createdAt: Date
  lastRetryAt: Date | null
}

export interface BridgeLogFilter {
  status?: string
  source?: string
  ruleId?: string
  limit?: number
  offset?: number
}

// ─── Error ───

export class AuditBridgeError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuditBridgeError'
  }
}

// ─── Bridge Adapter Registry ───

const adapters = new Map<string, BridgeAdapter>()

export function registerAdapter(adapter: BridgeAdapter): void {
  adapters.set(adapter.source, adapter)
}

export function getAdapter(source: string): BridgeAdapter | undefined {
  return adapters.get(source)
}

// ─── Built-in: AuditOS adapter ───

registerAdapter({
  source: 'auditos',
  async fetchEvent(eventId: string): Promise<BridgeEventData | null> {
    const event = await prisma.auditEvent.findUnique({ where: { id: eventId } })
    if (!event) return null
    return {
      sourceId: event.id,
      source: 'auditos',
      eventType: event.eventType,
      actorId: event.actorId,
      action: event.eventType,
      resourceType: event.targetType,
      resourceId: event.targetId,
      details: (event.metadata as Record<string, unknown>) ?? {},
      organizationId: event.engagementId,
      timestamp: event.timestamp,
    }
  },
  async listEvents(filter?: Record<string, unknown>): Promise<BridgeEventData[]> {
    const where: Record<string, unknown> = {}
    if (filter?.eventType) where.eventType = filter.eventType
    if (filter?.engagementId) where.engagementId = filter.engagementId
    if (filter?.actorId) where.actorId = filter.actorId

    const events = await prisma.auditEvent.findMany({
      where: where as never,
      orderBy: { timestamp: 'desc' },
      take: (filter?.limit as number) ?? 100,
    })
    return events.map((event) => ({
      sourceId: event.id,
      source: 'auditos',
      eventType: event.eventType,
      actorId: event.actorId,
      action: event.eventType,
      resourceType: event.targetType,
      resourceId: event.targetId,
      details: (event.metadata as Record<string, unknown>) ?? {},
      organizationId: event.engagementId,
      timestamp: event.timestamp,
    }))
  },
})

// ─── Built-in: DecisionOS adapter ───

registerAdapter({
  source: 'decisionos',
  async fetchEvent(eventId: string): Promise<BridgeEventData | null> {
    const event = await prisma.auditLog.findUnique({ where: { id: eventId } })
    if (!event) return null
    return {
      sourceId: event.id,
      source: 'decisionos',
      eventType: event.action,
      actorId: event.userId,
      action: event.action,
      resourceType: event.entity ?? 'decision',
      resourceId: event.decisionId,
      details: {
        before: event.before,
        after: event.after,
      },
      organizationId: event.organizationId,
      timestamp: event.createdAt,
    }
  },
  async listEvents(filter?: Record<string, unknown>): Promise<BridgeEventData[]> {
    const where: Record<string, unknown> = {}
    if (filter?.eventType) where.action = filter.eventType
    if (filter?.organizationId) where.organizationId = filter.organizationId
    if (filter?.userId) where.userId = filter.userId

    const events = await prisma.auditLog.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: (filter?.limit as number) ?? 100,
    })
    return events.map((event) => ({
      sourceId: event.id,
      source: 'decisionos',
      eventType: event.action,
      actorId: event.userId,
      action: event.action,
      resourceType: event.entity ?? 'decision',
      resourceId: event.decisionId,
      details: {
        before: event.before,
        after: event.after,
      },
      organizationId: event.organizationId,
      timestamp: event.createdAt,
    }))
  },
})

// ─── Helpers ───

function applyFieldMappings(
  data: BridgeEventData,
  mappings: Record<string, string> | null,
): Record<string, unknown> {
  if (!mappings || Object.keys(mappings).length === 0) return {}

  const result: Record<string, unknown> = {}
  const sourceMap: Record<string, unknown> = {
    sourceId: data.sourceId,
    source: data.source,
    eventType: data.eventType,
    actorId: data.actorId,
    action: data.action,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    organizationId: data.organizationId,
    timestamp: data.timestamp.toISOString(),
  }

  for (const [sourceField, targetField] of Object.entries(mappings)) {
    if (Object.prototype.hasOwnProperty.call(sourceMap, sourceField)) {
      result[targetField] = sourceMap[sourceField]
    }
  }
  return result
}

function matchesEventTypeFilter(eventType: string, filter: string): boolean {
  if (filter === '*') return true
  const types = filter.split(',').map((t) => t.trim())
  return types.includes(eventType)
}

function now(): Date {
  return new Date()
}

async function writeBridgeLogEntry(
  ruleId: string,
  organizationId: string,
  sourceEventId: string,
  source: string,
  eventType: string,
  status: string,
  targetLogId?: string,
  errorMessage?: string,
): Promise<void> {
  await (prisma as any).bridgeLogEntry.create({
    data: {
      ruleId,
      organizationId,
      sourceEventId,
      source,
      eventType,
      targetLogId: targetLogId ?? null,
      status,
      errorMessage: errorMessage ?? null,
      retryCount: 0,
    },
  })
}

async function updateBridgeLogRetry(
  logId: string,
  retryCount: number,
  status: string,
  targetLogId?: string,
  errorMessage?: string,
): Promise<void> {
  await (prisma as any).bridgeLogEntry.update({
    where: { id: logId },
    data: {
      retryCount,
      status,
      targetLogId: targetLogId ?? null,
      errorMessage: errorMessage ?? null,
      lastRetryAt: now(),
    },
  })
}

// ─── Core: bridgeAuditEvent ───

export async function bridgeAuditEvent(
  source: string,
  eventId: string,
  organizationId: string,
  ruleId?: string,
): Promise<BridgeResult> {
  if (!source) {
    return { ok: false, error: BRIDGE_STRINGS.error.SOURCE_REQUIRED, sourceEventId: eventId }
  }
  if (!eventId) {
    return { ok: false, error: BRIDGE_STRINGS.error.EVENT_ID_REQUIRED, sourceEventId: eventId }
  }
  if (!organizationId) {
    return { ok: false, error: BRIDGE_STRINGS.error.ORG_ID_REQUIRED, sourceEventId: eventId }
  }

  const adapter = getAdapter(source)
  if (!adapter) {
    return { ok: false, error: BRIDGE_STRINGS.error.ADAPTER_NOT_FOUND, sourceEventId: eventId }
  }

  let eventData: BridgeEventData | null
  try {
    eventData = await adapter.fetchEvent(eventId)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown fetch error'
    return { ok: false, error: message, sourceEventId: eventId }
  }

  if (!eventData) {
    if (ruleId) {
      await writeBridgeLogEntry(
        ruleId, organizationId, eventId, source, 'unknown',
        'FAILED', undefined, BRIDGE_STRINGS.error.EVENT_NOT_FOUND,
      )
    }
    return { ok: false, error: BRIDGE_STRINGS.error.EVENT_NOT_FOUND, sourceEventId: eventId }
  }

  try {
    const result = await writePlatformAuditLog({
      productKey: 'platform',
      action: `bridge:${eventData.action}`,
      platformOrganizationId: organizationId,
      actorId: eventData.actorId,
      targetType: eventData.resourceType,
      targetId: eventData.resourceId,
      severity: 'info',
      status: 'recorded',
      sourceSystem: source,
      sourceModel: 'audit_bridge',
      sourceId: eventData.sourceId,
      metadata: {
        sourceEventId: eventData.sourceId,
        sourceEventType: eventData.eventType,
        sourceTimestamp: eventData.timestamp.toISOString(),
        details: eventData.details,
      } as Record<string, unknown>,
    })

    if (!result.ok) {
      if (ruleId) {
        await writeBridgeLogEntry(
          ruleId, organizationId, eventId, source, eventData.eventType,
          'FAILED', undefined, result.error ?? BRIDGE_STRINGS.error.BRIDGE_FAILED,
        )
      }
      return { ok: false, error: result.error ?? BRIDGE_STRINGS.error.BRIDGE_FAILED, sourceEventId: eventId }
    }

    if (ruleId) {
      await writeBridgeLogEntry(
        ruleId, organizationId, eventId, source, eventData.eventType,
        'SUCCESS', result.id,
      )
    }

    return { ok: true, targetLogId: result.id, sourceEventId: eventId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown bridge error'
    if (ruleId) {
      await writeBridgeLogEntry(
        ruleId, organizationId, eventId, source, eventData.eventType,
        'FAILED', undefined, message,
      )
    }
    return { ok: false, error: message, sourceEventId: eventId }
  }
}

// ─── Bulk Bridge ───

export async function bulkBridge(
  source: string,
  organizationId: string,
  eventIds: string[],
  ruleId?: string,
): Promise<BulkBridgeResult> {
  if (!eventIds.length) {
    return { totalProcessed: 0, succeeded: 0, failed: 0, results: [] }
  }

  const results = await Promise.allSettled(
    eventIds.map((eventId) => bridgeAuditEvent(source, eventId, organizationId, ruleId)),
  )

  const bridgeResults: BridgeResult[] = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return { ok: false, error: r.reason?.message ?? 'Unknown error', sourceEventId: eventIds[i] }
  })

  const succeeded = bridgeResults.filter((r) => r.ok).length
  const failed = bridgeResults.filter((r) => !r.ok).length

  return {
    totalProcessed: bridgeResults.length,
    succeeded,
    failed,
    results: bridgeResults,
  }
}

// ─── Bridge Rule CRUD ───

export async function createBridgeRule(
  orgId: string,
  data: CreateBridgeRuleData,
): Promise<AuditBridgeRule> {
  if (!orgId) throw new AuditBridgeError(BRIDGE_STRINGS.error.ORG_ID_REQUIRED)
  if (!data.name) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NAME_REQUIRED)
  if (!data.source) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_SOURCE_REQUIRED)

  const eventTypeFilter = data.eventTypeFilter ?? '*'
  if (eventTypeFilter !== '*' && !eventTypeFilter.split(',').every((t) => t.trim())) {
    throw new AuditBridgeError(BRIDGE_STRINGS.error.INVALID_EVENT_TYPE_FILTER)
  }

  const rule = await (prisma as any).auditBridgeRule.create({
    data: {
      organizationId: orgId,
      name: data.name,
      source: data.source,
      eventTypeFilter,
      fieldMappings: data.fieldMappings
        ? (data.fieldMappings as Record<string, unknown>)
        : undefined,
      isActive: true,
      maxRetries: data.maxRetries ?? 3,
      retryIntervalMs: data.retryIntervalMs ?? 60000,
      createdById: data.createdById,
    },
  })

  await writePlatformAuditLog({
    productKey: 'platform',
    action: 'BRIDGE_RULE_CREATED',
    targetType: 'auditBridgeRule',
    targetId: rule.id,
    actorId: data.createdById,
    platformOrganizationId: orgId,
    metadata: {
      name: data.name,
      source: data.source,
      eventTypeFilter,
    } as Record<string, unknown>,
  })

  return mapRule(rule)
}

export async function getBridgeRule(ruleId: string): Promise<AuditBridgeRule | null> {
  const rule = await (prisma as any).auditBridgeRule.findUnique({ where: { id: ruleId } })
  return rule ? mapRule(rule) : null
}

export async function listBridgeRules(orgId: string): Promise<AuditBridgeRule[]> {
  const rules = await (prisma as any).auditBridgeRule.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  })
  return rules.map(mapRule)
}

export async function updateBridgeRule(
  ruleId: string,
  data: UpdateBridgeRuleData,
): Promise<AuditBridgeRule> {
  const existing = await (prisma as any).auditBridgeRule.findUnique({ where: { id: ruleId } })
  if (!existing) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NOT_FOUND)

  const updatePayload: Record<string, unknown> = {}
  if (data.name !== undefined) updatePayload.name = data.name
  if (data.source !== undefined) updatePayload.source = data.source
  if (data.eventTypeFilter !== undefined) {
    const filter = data.eventTypeFilter
    if (filter !== '*' && !filter.split(',').every((t) => t.trim())) {
      throw new AuditBridgeError(BRIDGE_STRINGS.error.INVALID_EVENT_TYPE_FILTER)
    }
    updatePayload.eventTypeFilter = filter
  }
  if (data.fieldMappings !== undefined) {
    updatePayload.fieldMappings = data.fieldMappings as Record<string, unknown>
  }
  if (data.isActive !== undefined) updatePayload.isActive = data.isActive
  if (data.maxRetries !== undefined) updatePayload.maxRetries = data.maxRetries
  if (data.retryIntervalMs !== undefined) updatePayload.retryIntervalMs = data.retryIntervalMs

  const updated = await (prisma as any).auditBridgeRule.update({
    where: { id: ruleId },
    data: updatePayload,
  })

  await writePlatformAuditLog({
    productKey: 'platform',
    action: 'BRIDGE_RULE_UPDATED',
    targetType: 'auditBridgeRule',
    targetId: ruleId,
    metadata: { updatedFields: Object.keys(updatePayload) } as Record<string, unknown>,
  })

  return mapRule(updated)
}

export async function deleteBridgeRule(ruleId: string): Promise<void> {
  const existing = await (prisma as any).auditBridgeRule.findUnique({ where: { id: ruleId } })
  if (!existing) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NOT_FOUND)

  await (prisma as any).auditBridgeRule.delete({ where: { id: ruleId } })

  await writePlatformAuditLog({
    productKey: 'platform',
    action: 'BRIDGE_RULE_DELETED',
    targetType: 'auditBridgeRule',
    targetId: ruleId,
    platformOrganizationId: existing.organizationId,
    metadata: { name: existing.name, source: existing.source } as Record<string, unknown>,
  })
}

// ─── Bridge Log ───

export async function getBridgeLog(
  orgId: string,
  filter?: BridgeLogFilter,
): Promise<BridgeLogEntry[]> {
  const where: Record<string, unknown> = { organizationId: orgId }
  if (filter?.status) where.status = filter.status
  if (filter?.source) where.source = filter.source
  if (filter?.ruleId) where.ruleId = filter.ruleId

  const logs = await (prisma as any).bridgeLogEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filter?.limit ?? 100,
    skip: filter?.offset ?? 0,
  })
  return logs.map(mapLogEntry)
}

// ─── Retry Failed ───

export async function retryFailed(ruleId: string): Promise<number> {
  const rule = await (prisma as any).auditBridgeRule.findUnique({ where: { id: ruleId } })
  if (!rule) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NOT_FOUND)
  if (!rule.isActive) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NOT_ACTIVE)

  const failedEntries = await (prisma as any).bridgeLogEntry.findMany({
    where: {
      ruleId,
      status: 'FAILED',
      retryCount: { lt: rule.maxRetries },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!failedEntries.length) return 0

  let retriedCount = 0

  for (const entry of failedEntries) {
    try {
      const result = await bridgeAuditEvent(
        entry.source,
        entry.sourceEventId,
        entry.organizationId,
        ruleId,
      )

      if (result.ok) {
        retriedCount++
      } else {
        await updateBridgeLogRetry(
          entry.id,
          entry.retryCount + 1,
          'FAILED',
          undefined,
          result.error,
        )
      }
    } catch {
      await updateBridgeLogRetry(
        entry.id,
        entry.retryCount + 1,
        'FAILED',
        undefined,
        BRIDGE_STRINGS.error.RETRY_FAILED,
      )
    }
  }

  await writePlatformAuditLog({
    productKey: 'platform',
    action: 'BRIDGE_RETRY_ATTEMPTED',
    targetType: 'auditBridgeRule',
    targetId: ruleId,
    platformOrganizationId: rule.organizationId,
    metadata: {
      attemptedCount: failedEntries.length,
      succeededCount: retriedCount,
    } as Record<string, unknown>,
  })

  return retriedCount
}

// ─── Generic Bridge (direct data input) ───

export async function bridgeGenericEvent(
  data: BridgeEventData,
  organizationId: string,
  ruleId?: string,
): Promise<BridgeResult> {
  try {
    const result = await writePlatformAuditLog({
      productKey: 'platform',
      action: `bridge:${data.action}`,
      platformOrganizationId: organizationId,
      actorId: data.actorId,
      targetType: data.resourceType,
      targetId: data.resourceId,
      severity: 'info',
      status: 'recorded',
      sourceSystem: data.source,
      sourceModel: 'audit_bridge',
      sourceId: data.sourceId,
      metadata: {
        sourceEventId: data.sourceId,
        sourceEventType: data.eventType,
        sourceTimestamp: data.timestamp.toISOString(),
        details: data.details,
      } as Record<string, unknown>,
    })

    if (!result.ok) {
      return { ok: false, error: result.error, sourceEventId: data.sourceId }
    }

    if (ruleId) {
      await writeBridgeLogEntry(
        ruleId, organizationId, data.sourceId, data.source, data.eventType,
        'SUCCESS', result.id,
      )
    }

    return { ok: true, targetLogId: result.id, sourceEventId: data.sourceId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown bridge error'
    return { ok: false, error: message, sourceEventId: data.sourceId }
  }
}

// ─── Tenant Guard ───

export async function verifyBridgeRuleAccess(ruleId: string, orgId: string): Promise<boolean> {
  const rule = await (prisma as any).auditBridgeRule.findUnique({
    where: { id: ruleId },
    select: { organizationId: true },
  })
  if (!rule) return false
  return rule.organizationId === orgId
}

// ─── Mappers ───

function mapRule(record: {
  id: string
  organizationId: string
  name: string
  source: string
  eventTypeFilter: string
  fieldMappings: unknown
  isActive: boolean
  maxRetries: number
  retryIntervalMs: number
  createdById: string
  createdAt: Date
  updatedAt: Date
}): AuditBridgeRule {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    source: record.source,
    eventTypeFilter: record.eventTypeFilter,
    fieldMappings: record.fieldMappings as Record<string, string> | null,
    isActive: record.isActive,
    maxRetries: record.maxRetries,
    retryIntervalMs: record.retryIntervalMs,
    createdById: record.createdById,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapLogEntry(record: {
  id: string
  ruleId: string
  organizationId: string
  sourceEventId: string
  source: string
  eventType: string
  targetLogId: string | null
  status: string
  errorMessage: string | null
  retryCount: number
  createdAt: Date
  lastRetryAt: Date | null
}): BridgeLogEntry {
  return {
    id: record.id,
    ruleId: record.ruleId,
    organizationId: record.organizationId,
    sourceEventId: record.sourceEventId,
    source: record.source,
    eventType: record.eventType,
    targetLogId: record.targetLogId,
    status: record.status,
    errorMessage: record.errorMessage,
    retryCount: record.retryCount,
    createdAt: record.createdAt,
    lastRetryAt: record.lastRetryAt,
  }
}
