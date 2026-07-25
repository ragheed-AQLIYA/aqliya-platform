import 'server-only'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { AuditRiskError, VALID_TRANSITIONS } from './types'
import type { AuditRiskAssessment, CreateAssessmentData, RiskCategory, RiskScore, RiskThresholds } from './types'
import { validateAnswers, mapAssessment } from './common'
import { calculateRiskScore } from './risk-scoring'
import { generateProcedures } from './procedures'
import { RISK_STRINGS } from '../risk-strings'

export async function assessRisk(
  modelId: string,
  engagementId: string,
  data: CreateAssessmentData,
  userId: string,
): Promise<AuditRiskAssessment> {
  const model = await prisma.auditRiskModel.findUnique({ where: { id: modelId } })
  if (!model) throw new AuditRiskError(RISK_STRINGS.error.MODEL_NOT_FOUND)
  if (!model.isActive) throw new AuditRiskError(RISK_STRINGS.error.MODEL_NOT_ACTIVE)

  const categories = model.categories as unknown as RiskCategory[]
  const thresholds = model.thresholds as unknown as RiskThresholds

  validateAnswers(categories, data.answers)

  const inherentAnswers: Record<string, number> = {}
  const residualAnswers: Record<string, number> = {}
  for (const [qId, ans] of Object.entries(data.answers)) {
    inherentAnswers[qId] = ans.inherent
    if (ans.residual !== undefined) {
      residualAnswers[qId] = ans.residual
    }
  }

  const inherentResult = calculateRiskScore(categories, inherentAnswers, thresholds)

  let residualResult: RiskScore | null = null
  if (Object.keys(residualAnswers).length > 0) {
    residualResult = calculateRiskScore(categories, residualAnswers, thresholds)
  }

  const assessment = await prisma.auditRiskAssessment.create({
    data: {
      modelId: model.id,
      organizationId: model.organizationId,
      engagementId,
      title: data.title,
      inherentScore: inherentResult.overallScore,
      inherentLevel: inherentResult.overallLevel,
      residualScore: residualResult?.overallScore ?? null,
      residualLevel: residualResult?.overallLevel ?? null,
      riskResponse: data.riskResponse ?? null,
      responseNotes: data.responseNotes ?? null,
      answers: data.answers as unknown as Prisma.InputJsonValue,
      categoryScores: inherentResult.categoryScores as unknown as Prisma.InputJsonValue,
      status: 'DRAFT',
      assessedById: userId,
    },
  })

  const procedures = generateProcedures(
    inherentResult.overallLevel,
    inherentResult.categoryScores,
    userId,
    assessment.id,
    model.organizationId,
  )

  await prisma.auditRiskProcedure.createMany({
    data: procedures.map((proc) => ({
      assessmentId: proc.assessmentId,
      organizationId: proc.organizationId,
      procedureCode: proc.procedureCode,
      description: proc.description,
      riskCategory: proc.riskCategory,
      procedureSteps: proc.procedureSteps as unknown as Prisma.InputJsonValue,
      evidenceRequired: proc.evidenceRequired,
      status: proc.status,
      createdById: proc.createdById,
    })),
  })

  await writePlatformAuditLog({
    productKey: 'audit',
    action: 'RISK_ASSESSMENT_CREATED',
    targetType: 'auditRiskAssessment',
    targetId: assessment.id,
    actorId: userId,
    metadata: {
      modelId,
      inherentScore: inherentResult.overallScore,
      inherentLevel: inherentResult.overallLevel,
      proceduresGenerated: procedures.length,
    },
  })

  return mapAssessment(assessment)
}

export async function getAssessment(assessmentId: string): Promise<AuditRiskAssessment | null> {
  const assessment = await prisma.auditRiskAssessment.findUnique({ where: { id: assessmentId } })
  return assessment ? mapAssessment(assessment) : null
}

export async function getAssessmentsByEngagement(engagementId: string): Promise<AuditRiskAssessment[]> {
  const assessments = await prisma.auditRiskAssessment.findMany({
    where: { engagementId },
    orderBy: { assessedAt: 'desc' },
    take: 100,
  })
  return assessments.map(mapAssessment)
}

export async function transitionAssessmentStatus(
  assessmentId: string,
  targetStatus: string,
  userId: string,
): Promise<AuditRiskAssessment> {
  const assessment = await prisma.auditRiskAssessment.findUnique({ where: { id: assessmentId } })
  if (!assessment) throw new AuditRiskError(RISK_STRINGS.error.ASSESSMENT_NOT_FOUND)

  const allowed = VALID_TRANSITIONS[assessment.status]
  if (!allowed || !allowed.includes(targetStatus)) {
    throw new AuditRiskError(RISK_STRINGS.error.INVALID_TRANSITION)
  }

  const updateData: Record<string, unknown> = { status: targetStatus }
  if (targetStatus === 'REVIEWED') updateData.reviewedById = userId
  if (targetStatus === 'APPROVED') updateData.approvedById = userId

  const updated = await prisma.auditRiskAssessment.update({
    where: { id: assessmentId },
    data: updateData,
  })

  const actionLabel = targetStatus === 'REVIEWED' ? 'RISK_ASSESSMENT_REVIEWED' : 'RISK_ASSESSMENT_APPROVED'

  await writePlatformAuditLog({
    productKey: 'audit',
    action: actionLabel,
    targetType: 'auditRiskAssessment',
    targetId: assessment.id,
    actorId: userId,
    metadata: { fromStatus: assessment.status, toStatus: targetStatus },
  })

  return mapAssessment(updated)
}
