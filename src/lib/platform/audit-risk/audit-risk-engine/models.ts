import 'server-only'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { AuditRiskError, DEFAULT_THRESHOLDS } from './types'
import type { AuditRiskModel, CreateRiskModelData, RiskThresholds } from './types'
import { validateWeights, mapModel } from './common'
import { RISK_STRINGS } from '../risk-strings'

export async function createRiskModel(
  orgId: string,
  data: CreateRiskModelData,
  userId: string,
): Promise<AuditRiskModel> {
  if (!orgId) throw new AuditRiskError(RISK_STRINGS.error.ORG_ID_REQUIRED)
  if (!data.name) throw new AuditRiskError(RISK_STRINGS.error.MODEL_NAME_REQUIRED)
  validateWeights(data.categories)

  const thresholds: RiskThresholds = { ...DEFAULT_THRESHOLDS, ...data.thresholds }

  const model = await prisma.auditRiskModel.create({
    data: {
      organizationId: orgId,
      name: data.name,
      description: data.description ?? null,
      categories: data.categories as unknown as Prisma.InputJsonValue,
      thresholds: thresholds as unknown as Prisma.InputJsonValue,
      version: 1,
      isActive: true,
      createdById: userId,
    },
  })

  await writePlatformAuditLog({
    productKey: 'audit',
    action: 'RISK_MODEL_CREATED',
    targetType: 'auditRiskModel',
    targetId: model.id,
    actorId: userId,
    metadata: { name: data.name, categoriesCount: data.categories.length },
  })

  return mapModel(model)
}

export async function getRiskModel(modelId: string): Promise<AuditRiskModel | null> {
  const model = await prisma.auditRiskModel.findUnique({ where: { id: modelId } })
  return model ? mapModel(model) : null
}

export async function listRiskModels(orgId: string): Promise<AuditRiskModel[]> {
  const models = await prisma.auditRiskModel.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return models.map(mapModel)
}
