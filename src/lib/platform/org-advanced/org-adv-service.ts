/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { ORG_STRINGS } from './org-strings'
import { KNOWN_SETTINGS, LIFECYCLE_EVENT_TYPES } from './constants'
import type { LifecycleEventType } from './constants'

// ─── Types ───

export interface OrgHierarchyNode {
  id: string
  organizationId: string
  parentOrgId: string | null
  level: number
  sortOrder: number
  metadata: Record<string, unknown> | null
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface OrgSetting {
  id: string
  organizationId: string
  key: string
  value: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface OrgLifecycleEvent {
  id: string
  organizationId: string
  eventType: string
  description: string
  metadata: Record<string, unknown> | null
  actorId: string | null
  createdAt: Date
}

export interface OrgHealth {
  score: number
  breakdown: {
    hasSettings: { score: number; max: number; detail: string }
    hasActiveUsers: { score: number; max: number; detail: string }
    hasHierarchy: { score: number; max: number; detail: string }
    recentActivity: { score: number; max: number; detail: string }
    noCriticalEvents: { score: number; max: number; detail: string }
  }
}

export interface CreateOrgNodeData {
  sortOrder?: number
  metadata?: Record<string, unknown>
}

export interface LifecycleEventFilter {
  eventType?: LifecycleEventType | string
  fromDate?: Date
  toDate?: Date
}

// ─── Error Class ───

export class OrgAdvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrgAdvError'
  }
}

// ─── Prisma helper — models defined as text-only, not in generated client yet ───

const db = prisma as any

// ─── Hierarchy Methods ───

export async function createOrgNode(
  orgId: string,
  parentOrgId: string | null,
  userId: string,
  data: CreateOrgNodeData = {},
): Promise<OrgHierarchyNode> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)
  if (!userId) throw new OrgAdvError(ORG_STRINGS.error.USER_ID_REQUIRED)
  if (parentOrgId === orgId) throw new OrgAdvError(ORG_STRINGS.error.SELF_PARENT)

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) throw new OrgAdvError(ORG_STRINGS.error.ORG_NOT_FOUND)

  const existing = await db.orgHierarchyNode.findUnique({
    where: { organizationId: orgId },
  })
  if (existing) {
    throw new OrgAdvError(ORG_STRINGS.error.HIERARCHY_NODE_EXISTS)
  }

  let level = 0
  if (parentOrgId) {
    const parentNode = await db.orgHierarchyNode.findUnique({
      where: { organizationId: parentOrgId },
    })
    if (!parentNode) {
      throw new OrgAdvError(ORG_STRINGS.error.PARENT_ORG_NOT_FOUND)
    }
    if (await wouldCreateCycle(orgId, parentOrgId)) {
      throw new OrgAdvError(ORG_STRINGS.error.CIRCULAR_HIERARCHY)
    }
    level = parentNode.level + 1
  }

  const node = await db.orgHierarchyNode.create({
    data: {
      organizationId: orgId,
      parentOrgId: parentOrgId ?? null,
      level,
      sortOrder: data.sortOrder ?? 0,
      metadata: (data.metadata ?? undefined) as any,
      createdById: userId,
    },
  })

  await writePlatformAuditLog({
    productKey: 'org-advanced',
    action: 'HIERARCHY_NODE_CREATED',
    targetType: 'orgHierarchyNode',
    targetId: node.id,
    actorId: userId,
    platformOrganizationId: orgId,
    metadata: { parentOrgId, level, ...data },
  })

  return mapHierarchyNode(node)
}

export async function getOrgTree(orgId: string): Promise<OrgHierarchyNode[]> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  const node = await db.orgHierarchyNode.findUnique({
    where: { organizationId: orgId },
  })
  if (!node) return []

  const allNodes = await db.orgHierarchyNode.findMany({
    orderBy: { sortOrder: 'asc' },
  })

  const descendants: OrgHierarchyNode[] = []
  const idsToCollect = [node.organizationId]

  while (idsToCollect.length > 0) {
    const currentId = idsToCollect.shift()!
    for (const n of allNodes) {
      if (n.parentOrgId === currentId) {
        descendants.push(mapHierarchyNode(n))
        idsToCollect.push(n.organizationId)
      }
    }
  }

  return descendants
}

export async function getChildOrgs(orgId: string): Promise<OrgHierarchyNode[]> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  const node = await db.orgHierarchyNode.findUnique({
    where: { organizationId: orgId },
  })
  if (!node) return []

  const children = await db.orgHierarchyNode.findMany({
    where: { parentOrgId: orgId },
    orderBy: { sortOrder: 'asc' },
  })

  return children.map(mapHierarchyNode)
}

export async function getParentChain(orgId: string): Promise<OrgHierarchyNode[]> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  const allNodes: any[] = await db.orgHierarchyNode.findMany({})
  const nodeMap = new Map(allNodes.map((n: any) => [n.organizationId, n]))

  const chain: OrgHierarchyNode[] = []
  let current = nodeMap.get(orgId)

  while (current) {
    chain.push(mapHierarchyNode(current))
    current = current.parentOrgId ? nodeMap.get(current.parentOrgId) ?? undefined : undefined
  }

  return chain
}

// ─── Settings Methods ───

export async function getOrgSetting(
  orgId: string,
  key: string,
): Promise<OrgSetting | null> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)
  if (!key) throw new OrgAdvError(ORG_STRINGS.error.SETTING_KEY_REQUIRED)

  const setting = await db.orgSetting.findUnique({
    where: { organizationId_key: { organizationId: orgId, key } },
  })

  return setting ? mapSetting(setting) : null
}

export async function setOrgSetting(
  orgId: string,
  key: string,
  value: string,
  userId: string,
): Promise<OrgSetting> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)
  if (!key) throw new OrgAdvError(ORG_STRINGS.error.SETTING_KEY_REQUIRED)
  if (value === undefined || value === null || value.trim() === '') {
    throw new OrgAdvError(ORG_STRINGS.error.SETTING_VALUE_REQUIRED)
  }
  if (!userId) throw new OrgAdvError(ORG_STRINGS.error.USER_ID_REQUIRED)

  const org = await prisma.organization.findUnique({ where: { id: orgId } })
  if (!org) throw new OrgAdvError(ORG_STRINGS.error.ORG_NOT_FOUND)

  const setting = await db.orgSetting.upsert({
    where: { organizationId_key: { organizationId: orgId, key } },
    create: {
      organizationId: orgId,
      key,
      value,
      createdById: userId,
    },
    update: {
      value,
      updatedAt: new Date(),
    },
  })

  await writePlatformAuditLog({
    productKey: 'org-advanced',
    action: 'SETTING_UPDATED',
    targetType: 'orgSetting',
    targetId: setting.id,
    actorId: userId,
    platformOrganizationId: orgId,
    metadata: { key, value },
  })

  return mapSetting(setting)
}

export async function getOrgSettings(
  orgId: string,
): Promise<Record<string, string>> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  const settings = await db.orgSetting.findMany({
    where: { organizationId: orgId },
  })

  const result: Record<string, string> = {}
  for (const s of settings) {
    result[s.key] = s.value
  }

  for (const [key, defaultValue] of Object.entries(KNOWN_SETTINGS)) {
    if (!(key in result)) {
      result[key] = defaultValue
    }
  }

  return result
}

export async function deleteOrgSetting(orgId: string, key: string): Promise<void> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)
  if (!key) throw new OrgAdvError(ORG_STRINGS.error.SETTING_KEY_REQUIRED)

  const existing = await db.orgSetting.findUnique({
    where: { organizationId_key: { organizationId: orgId, key } },
  })
  if (!existing) return

  await db.orgSetting.delete({
    where: { organizationId_key: { organizationId: orgId, key } },
  })

  await writePlatformAuditLog({
    productKey: 'org-advanced',
    action: 'SETTING_DELETED',
    targetType: 'orgSetting',
    targetId: existing.id,
    actorId: 'system',
    platformOrganizationId: orgId,
    metadata: { key },
  })
}

// ─── Lifecycle Events ───

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

  const event = await db.orgLifecycleEvent.create({
    data: {
      organizationId: orgId,
      eventType,
      description,
      metadata: (data ?? undefined) as any,
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

  const where: Record<string, unknown> = { organizationId: orgId }

  if (filter?.eventType) {
    where.eventType = filter.eventType
  }

  if (filter?.fromDate || filter?.toDate) {
    const createdAt: Record<string, Date> = {}
    if (filter.fromDate) createdAt.gte = filter.fromDate
    if (filter.toDate) createdAt.lte = filter.toDate
    where.createdAt = createdAt
  }

  const events = await db.orgLifecycleEvent.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return events.map(mapLifecycleEvent)
}

// ─── Org Health ───

export async function getOrgHealth(orgId: string): Promise<OrgHealth> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  const [settings, users, hierarchyNode, recentEvents, criticalEvents] =
    await Promise.all([
      db.orgSetting.findMany({ where: { organizationId: orgId } }),
      prisma.user.findMany({
        where: { organizationId: orgId },
      }),
      db.orgHierarchyNode.findUnique({
        where: { organizationId: orgId },
      }),
      db.orgLifecycleEvent.findMany({
        where: {
          organizationId: orgId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      db.orgLifecycleEvent.findMany({
        where: {
          organizationId: orgId,
          eventType: { in: ['SUSPENDED', 'MERGED'] },
        },
      }),
    ])

  const hasSettings = settings.length > 0 ? 20 : 0
  const hasActiveUsers = users.length > 0 ? 25 : 0
  const hasHierarchy = hierarchyNode !== null ? 15 : 0
  const recentActivity = recentEvents.length > 0 ? 20 : 0
  const noCriticalEvents = criticalEvents.length === 0 ? 20 : 0

  const score = hasSettings + hasActiveUsers + hasHierarchy + recentActivity + noCriticalEvents

  return {
    score,
    breakdown: {
      hasSettings: {
        score: hasSettings,
        max: 20,
        detail: ORG_STRINGS.health.SETTINGS_CONFIGURED,
      },
      hasActiveUsers: {
        score: hasActiveUsers,
        max: 25,
        detail: ORG_STRINGS.health.ACTIVE_USERS,
      },
      hasHierarchy: {
        score: hasHierarchy,
        max: 15,
        detail: ORG_STRINGS.health.HAS_HIERARCHY,
      },
      recentActivity: {
        score: recentActivity,
        max: 20,
        detail: ORG_STRINGS.health.RECENT_ACTIVITY,
      },
      noCriticalEvents: {
        score: noCriticalEvents,
        max: 20,
        detail: ORG_STRINGS.health.NO_CRITICAL_EVENTS,
      },
    },
  }
}

// ─── Internal Helpers ───

async function wouldCreateCycle(
  orgId: string,
  parentOrgId: string,
): Promise<boolean> {
  const allNodes: any[] = await db.orgHierarchyNode.findMany({})
  const childMap = new Map<string, string[]>()
  for (const n of allNodes) {
    if (n.parentOrgId) {
      const children = childMap.get(n.parentOrgId) ?? []
      children.push(n.organizationId)
      childMap.set(n.parentOrgId, children)
    }
  }

  const visited = new Set<string>()
  const queue = [parentOrgId]
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current === orgId) return true
    if (visited.has(current)) continue
    visited.add(current)
    const children = childMap.get(current) ?? []
    for (const child of children) {
      queue.push(child)
    }
  }

  return false
}

function mapHierarchyNode(node: any): OrgHierarchyNode {
  return {
    id: node.id,
    organizationId: node.organizationId,
    parentOrgId: node.parentOrgId ?? null,
    level: node.level,
    sortOrder: node.sortOrder,
    metadata: (node.metadata ?? null) as Record<string, unknown> | null,
    createdById: node.createdById,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
  }
}

function mapSetting(setting: any): OrgSetting {
  return {
    id: setting.id,
    organizationId: setting.organizationId,
    key: setting.key,
    value: setting.value,
    createdById: setting.createdById,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt,
  }
}

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
