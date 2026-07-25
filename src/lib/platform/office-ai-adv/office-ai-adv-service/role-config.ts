import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import {
  OfficeAiAdvError,
  type OfficeAiRoleConfig,
  type CreateRoleConfigData,
  validateOrgId,
  validateUserId,
  mapRoleConfig,
} from './common'
import { ADV_STRINGS } from '../adv-strings'

export async function createRoleConfig(
  orgId: string,
  data: CreateRoleConfigData,
  userId: string,
): Promise<OfficeAiRoleConfig> {
  validateOrgId(orgId)
  validateUserId(userId)
  if (!data.roleSlug) throw new OfficeAiAdvError(ADV_STRINGS.error.ROLE_SLUG_REQUIRED)
  if (data.confidenceThreshold !== undefined && (data.confidenceThreshold < 0 || data.confidenceThreshold > 1)) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.CONFIDENCE_THRESHOLD_INVALID)
  }
  if (data.autoAssignThreshold !== undefined && data.autoAssignThreshold < 0) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.AUTO_ASSIGN_INVALID)
  }
  if (data.maxTasksPerDay !== undefined && data.maxTasksPerDay <= 0) {
    throw new OfficeAiAdvError(ADV_STRINGS.error.MAX_TASKS_INVALID)
  }

  const validStyles = ['CONCISE', 'DETAILED', 'BALANCED']
  const responseStyle = data.responseStyle ?? 'BALANCED'
  if (!validStyles.includes(responseStyle)) {
    throw new OfficeAiAdvError('responseStyle must be CONCISE, DETAILED, or BALANCED')
  }

  const record = await prisma.officeAiRoleConfig.create({
    data: {
      organizationId: orgId,
      roleSlug: data.roleSlug,
      maxTasksPerDay: data.maxTasksPerDay ?? 10,
      allowedTaskTypes: data.allowedTaskTypes ?? [],
      requireApproval: data.requireApproval ?? false,
      autoAssignThreshold: data.autoAssignThreshold ?? 5,
      responseStyle,
      confidenceThreshold: data.confidenceThreshold ?? 0.7,
      createdById: userId,
    },
  }).catch(() => { throw new OfficeAiAdvError(ADV_STRINGS.error.CREATE_ROLE_CONFIG_FAILED) })

  await writePlatformAuditLog({
    productKey: 'office_ai_assistant',
    action: 'ROLE_CONFIG_CREATED',
    targetType: 'officeAiRoleConfig',
    targetId: record.id,
    actorId: userId,
    metadata: { roleSlug: data.roleSlug },
  })

  return mapRoleConfig(record)
}

export async function getRoleConfig(
  orgId: string,
  roleSlug: string,
): Promise<OfficeAiRoleConfig | null> {
  validateOrgId(orgId)
  if (!roleSlug) throw new OfficeAiAdvError(ADV_STRINGS.error.ROLE_SLUG_REQUIRED)
  const record = await prisma.officeAiRoleConfig.findFirst({
    where: { organizationId: orgId, roleSlug },
  }).catch(() => null)
  return record ? mapRoleConfig(record) : null
}

export async function listRoleConfigs(
  orgId: string,
): Promise<OfficeAiRoleConfig[]> {
  validateOrgId(orgId)
  const records = await prisma.officeAiRoleConfig.findMany({
    take: 100,
    where: { organizationId: orgId },
    orderBy: { roleSlug: 'asc' },
  }).catch(() => [])
  return records.map(mapRoleConfig)
}
