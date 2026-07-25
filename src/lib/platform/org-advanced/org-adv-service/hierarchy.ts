import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { ORG_STRINGS } from '../org-strings'
import { OrgAdvError } from './common'
import type { OrgHierarchyNode, CreateOrgNodeData } from './types'

async function wouldCreateCycle(
  orgId: string,
  parentOrgId: string,
): Promise<boolean> {
  const allNodes: any[] = await prisma.orgHierarchyNode.findMany({ take: 10000 })
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

  const existing = await prisma.orgHierarchyNode.findFirst({
    where: { organizationId: orgId },
  })
  if (existing) {
    throw new OrgAdvError(ORG_STRINGS.error.HIERARCHY_NODE_EXISTS)
  }

  let level = 0
  if (parentOrgId) {
    const parentNode = await prisma.orgHierarchyNode.findFirst({
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

  const node = await prisma.orgHierarchyNode.create({
    data: {
      organizationId: orgId,
      parentOrgId: parentOrgId ?? null,
      level,
      sortOrder: data.sortOrder ?? 0,
      metadata: (data.metadata ?? undefined) as unknown as Prisma.InputJsonValue | undefined,
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

  const node = await prisma.orgHierarchyNode.findFirst({
    where: { organizationId: orgId },
  })
  if (!node) return []

  const allNodes = await prisma.orgHierarchyNode.findMany({
    orderBy: { sortOrder: 'asc' },
    take: 10000,
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

  const node = await prisma.orgHierarchyNode.findFirst({
    where: { organizationId: orgId },
  })
  if (!node) return []

  const children = await prisma.orgHierarchyNode.findMany({
    where: { parentOrgId: orgId },
    orderBy: { sortOrder: 'asc' },
  })

  return children.map(mapHierarchyNode)
}

export async function getParentChain(orgId: string): Promise<OrgHierarchyNode[]> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)

  const allNodes: any[] = await prisma.orgHierarchyNode.findMany({ take: 10000 })
  const nodeMap = new Map(allNodes.map((n: any) => [n.organizationId, n]))

  const chain: OrgHierarchyNode[] = []
  let current = nodeMap.get(orgId)

  while (current) {
    chain.push(mapHierarchyNode(current))
    current = current.parentOrgId ? nodeMap.get(current.parentOrgId) ?? undefined : undefined
  }

  return chain
}
