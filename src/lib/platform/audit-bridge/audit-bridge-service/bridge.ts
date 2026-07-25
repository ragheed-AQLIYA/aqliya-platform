import 'server-only'

import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { BRIDGE_STRINGS } from '../bridge-strings'
import { getAdapter } from './adapters'
import { writeBridgeLogEntry } from './common'
import type { BridgeEventData, BridgeResult, BulkBridgeResult } from './types'

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
