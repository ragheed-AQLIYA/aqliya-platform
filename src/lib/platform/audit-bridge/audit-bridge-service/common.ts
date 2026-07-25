import 'server-only'

import { prisma } from '@/lib/prisma'
import type { BridgeEventData, AuditBridgeRule, BridgeLogEntry } from './types'

export function applyFieldMappings(
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

export function matchesEventTypeFilter(eventType: string, filter: string): boolean {
  if (filter === '*') return true
  const types = filter.split(',').map((t) => t.trim())
  return types.includes(eventType)
}

export function now(): Date {
  return new Date()
}

export async function writeBridgeLogEntry(
  ruleId: string,
  organizationId: string,
  sourceEventId: string,
  source: string,
  eventType: string,
  status: string,
  targetLogId?: string,
  errorMessage?: string,
): Promise<void> {
  await prisma.bridgeLogEntry.create({
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

export async function updateBridgeLogRetry(
  logId: string,
  retryCount: number,
  status: string,
  targetLogId?: string,
  errorMessage?: string,
): Promise<void> {
  await prisma.bridgeLogEntry.update({
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

export function mapRule(record: {
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

export function mapLogEntry(record: {
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
