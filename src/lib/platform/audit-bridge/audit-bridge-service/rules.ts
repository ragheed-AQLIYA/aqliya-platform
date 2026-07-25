import 'server-only'

import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { BRIDGE_STRINGS } from '../bridge-strings'
import { mapRule } from './common'
import type { AuditBridgeRule, CreateBridgeRuleData, UpdateBridgeRuleData } from './types'
import { AuditBridgeError } from './types'

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

  const rule = await prisma.auditBridgeRule.create({
    data: {
      organizationId: orgId,
      name: data.name,
      source: data.source,
      eventTypeFilter,
      fieldMappings: data.fieldMappings
        ? (data.fieldMappings as Prisma.InputJsonValue)
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
  const rule = await prisma.auditBridgeRule.findUnique({ where: { id: ruleId } })
  return rule ? mapRule(rule) : null
}

export async function listBridgeRules(orgId: string): Promise<AuditBridgeRule[]> {
  const rules = await prisma.auditBridgeRule.findMany({
    take: 100,
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  })
  return rules.map(mapRule)
}

export async function updateBridgeRule(
  ruleId: string,
  data: UpdateBridgeRuleData,
): Promise<AuditBridgeRule> {
  const existing = await prisma.auditBridgeRule.findUnique({ where: { id: ruleId } })
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

  const updated = await prisma.auditBridgeRule.update({
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
  const existing = await prisma.auditBridgeRule.findUnique({ where: { id: ruleId } })
  if (!existing) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NOT_FOUND)

  await prisma.auditBridgeRule.delete({ where: { id: ruleId } })

  await writePlatformAuditLog({
    productKey: 'platform',
    action: 'BRIDGE_RULE_DELETED',
    targetType: 'auditBridgeRule',
    targetId: ruleId,
    platformOrganizationId: existing.organizationId,
    metadata: { name: existing.name, source: existing.source } as Record<string, unknown>,
  })
}

export async function verifyBridgeRuleAccess(ruleId: string, orgId: string): Promise<boolean> {
  const rule = await prisma.auditBridgeRule.findUnique({
    where: { id: ruleId },
    select: { organizationId: true },
  })
  if (!rule) return false
  return rule.organizationId === orgId
}
