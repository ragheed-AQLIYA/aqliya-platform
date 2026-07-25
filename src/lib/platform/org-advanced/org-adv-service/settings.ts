import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { ORG_STRINGS } from '../org-strings'
import { KNOWN_SETTINGS } from '../constants'
import { OrgAdvError } from './common'
import type { OrgSetting } from './types'

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

export async function getOrgSetting(
  orgId: string,
  key: string,
): Promise<OrgSetting | null> {
  if (!orgId) throw new OrgAdvError(ORG_STRINGS.error.ORG_ID_REQUIRED)
  if (!key) throw new OrgAdvError(ORG_STRINGS.error.SETTING_KEY_REQUIRED)

  const setting = await prisma.orgSetting.findUnique({
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

  const setting = await prisma.orgSetting.upsert({
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

  const settings = await prisma.orgSetting.findMany({
    take: 100,
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

  const existing = await prisma.orgSetting.findUnique({
    where: { organizationId_key: { organizationId: orgId, key } },
  })
  if (!existing) return

  await prisma.orgSetting.delete({
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
