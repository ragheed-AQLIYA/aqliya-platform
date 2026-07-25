import 'server-only'

import { prisma } from '@/lib/prisma'
import type { BridgeAdapter, BridgeEventData } from './types'

const adapters = new Map<string, BridgeAdapter>()

export function registerAdapter(adapter: BridgeAdapter): void {
  adapters.set(adapter.source, adapter)
}

export function getAdapter(source: string): BridgeAdapter | undefined {
  return adapters.get(source)
}

registerAdapter({
  source: 'auditos',
  async fetchEvent(eventId: string): Promise<BridgeEventData | null> {
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    const event = await prisma.platformAuditLog.findFirst({
      where: { productKey: "audit_os", sourceModel: "AuditEvent", sourceId: eventId },
    })
    if (!event) return null
    return {
      sourceId: event.id,
      source: "auditos" as const,
      eventType: event.action,
      actorId: event.actorId ?? "",
      action: event.action,
      resourceType: event.targetType ?? "",
      resourceId: event.targetId ?? "",
      details: (event.metadata as Record<string, unknown>) ?? {},
      organizationId: ((event.metadata as Record<string, unknown> | null)?.engagementId as string) ?? '',
      timestamp: event.createdAt,
    }
  },
  async listEvents(filter?: Record<string, unknown>): Promise<BridgeEventData[]> {
    // [MIGRATED] auditEvent → platformAuditLog (dual-write with productKey: "audit_os")
    const where: Record<string, unknown> = { productKey: "audit_os" }
    if (filter?.eventType) where.action = filter.eventType
    if (filter?.engagementId) where.sourceId = filter.engagementId
    if (filter?.actorId) where.actorId = filter.actorId

    const events = await prisma.platformAuditLog.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: (filter?.limit as number) ?? 100,
    })
    return events.map((event) => ({
      sourceId: event.id,
      source: "auditos" as const,
      eventType: event.action,
      actorId: event.actorId ?? "",
      action: event.action,
      resourceType: event.targetType ?? "",
      resourceId: event.targetId ?? "",
      details: (event.metadata as Record<string, unknown>) ?? {},
      organizationId: ((event.metadata as Record<string, unknown> | null)?.engagementId as string) ?? '',
      timestamp: event.createdAt,
    }))
  },
})

registerAdapter({
  source: 'decisionos',
  async fetchEvent(eventId: string): Promise<BridgeEventData | null> {
    // [MIGRATED] auditLog → platformAuditLog with productKey: "decision_os"
    // const event = await prisma.auditLog.findUnique({ where: { id: eventId } })
    const event = await prisma.platformAuditLog.findFirst({
      where: { productKey: "decision_os", sourceModel: "AuditLog", sourceId: eventId },
    })
    if (!event) return null
    return {
      sourceId: event.id,
      source: 'decisionos',
      eventType: event.action,
      actorId: event.actorId ?? '',
      action: event.action,
      resourceType: event.targetType ?? 'decision',
      resourceId: event.targetId ?? '',
      details: {
        before: event.beforeState,
        after: event.afterState,
      },
      organizationId: event.organizationId ?? '',
      timestamp: event.createdAt,
    }
  },
  async listEvents(filter?: Record<string, unknown>): Promise<BridgeEventData[]> {
    // [MIGRATED] auditLog → platformAuditLog with productKey: "decision_os"
    // const where: Record<string, unknown> = {}
    // if (filter?.eventType) where.action = filter.eventType
    // if (filter?.organizationId) where.organizationId = filter.organizationId
    // if (filter?.userId) where.userId = filter.userId
    //
    // const events = await prisma.auditLog.findMany({
    //   where: where as never,
    //   orderBy: { createdAt: 'desc' },
    //   take: (filter?.limit as number) ?? 100,
    // })
    const where: Record<string, unknown> = { productKey: "decision_os" }
    if (filter?.eventType) where.action = filter.eventType
    if (filter?.organizationId) where.organizationId = filter.organizationId
    if (filter?.userId) where.actorId = filter.userId

    const events = await prisma.platformAuditLog.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: (filter?.limit as number) ?? 100,
    })
    return events.map((event) => ({
      sourceId: event.id,
      source: 'decisionos',
      eventType: event.action,
      actorId: event.actorId ?? '',
      action: event.action,
      resourceType: event.targetType ?? 'decision',
      resourceId: event.targetId ?? '',
      details: {
        before: event.beforeState,
        after: event.afterState,
      },
      organizationId: event.organizationId ?? '',
      timestamp: event.createdAt,
    }))
  },
})
