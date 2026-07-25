import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { BRIDGE_STRINGS } from '../bridge-strings'
import { bridgeAuditEvent } from './bridge'
import { mapLogEntry, updateBridgeLogRetry } from './common'
import type { BridgeLogEntry, BridgeLogFilter } from './types'
import { AuditBridgeError } from './types'

export async function getBridgeLog(
  orgId: string,
  filter?: BridgeLogFilter,
): Promise<BridgeLogEntry[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic where builder
  const where: Record<string, any> = { organizationId: orgId }
  if (filter?.status) where.status = filter.status
  if (filter?.source) where.source = filter.source
  if (filter?.ruleId) where.ruleId = filter.ruleId

  const logs = await prisma.bridgeLogEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filter?.limit ?? 100,
    skip: filter?.offset ?? 0,
  })
  return logs.map(mapLogEntry)
}

export async function retryFailed(ruleId: string): Promise<number> {
  const rule = await prisma.auditBridgeRule.findUnique({ where: { id: ruleId } })
  if (!rule) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NOT_FOUND)
  if (!rule.isActive) throw new AuditBridgeError(BRIDGE_STRINGS.error.RULE_NOT_ACTIVE)

  const failedEntries = await prisma.bridgeLogEntry.findMany({
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
