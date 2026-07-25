import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { ORG_STRINGS } from '../org-strings'
import type { LifecycleEventType } from '../constants'
import { OrgAdvError } from './common'
import type { OrgLifecycleEvent, LifecycleEventFilter } from './types'

function mapLifecycleEvent(event: any): OrgLifecycleEvent {
  return {
    id: event.id,
    organizationId: event.organizationId,
    eventType: event.eventType,
    description: event.description,
    metadata: (event.metadata ?? null) as Record<string, unknown> | null,
    actorId: event.actorId ?? null,
    createdAt: event.createdAt,
  }
}

export async function recordLifecycleEvent(
  orgId: string,
  eventType: LifecycleEventType | string,
  description: string,
  userId: string,
  data?: Record<string, unknown>,
): Promise<OrgLifecycleEvent> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)
  if (!eventType) throw new OrgAdvError(ORG_STRINGS.error.EVENT_TYPE_REQUIRED)
  if (!description) throw new OrgAdvError(ORG_STRINGS.error.DESCRIPTION_REQUIRED)

  const event = await prisma.orgLifecycleEvent.create({
    data: {
      organizationId: orgId,
      eventType,
      description,
      metadata: (data ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
      actorId: userId || null,
    },
  })

  await writePlatformAuditLog({
    productKey: 'org-advanced',
    action: 'LIFECYCLE_EVENT_RECORDED',
    targetType: 'orgLifecycleEvent',
    targetId: event.id,
    actorId: userId || 'system',
    platformOrganizationId: orgId,
    metadata: { eventType, description, ...data },
  })

  return mapLifecycleEvent(event)
}

export async function getLifecycleEvents(
  orgId: string,
  filter?: LifecycleEventFilter,
): Promise<OrgLifecycleEvent[]> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic where builder
  const where: Record<string, any> = { organizationId: orgId }

  if (filter?.eventType) {
    where.eventType = filter.eventType
  }

  if (filter?.fromDate || filter?.toDate) {
    const createdAt: Record<string, Date> = {}
    if (filter.fromDate) createdAt.gte = filter.fromDate
    if (filter.toDate) createdAt.lte = filter.toDate
    where.createdAt = createdAt
  }

  const events = await prisma.orgLifecycleEvent.findMany({
    take: 100,
    where,
    orderBy: { createdAt: 'desc' },
  })

  return events.map(mapLifecycleEvent)
}
