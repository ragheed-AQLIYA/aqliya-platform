import 'server-only'

import { prisma } from '@/lib/prisma'
import { writePlatformAuditLog } from '@/lib/platform/audit-log'
import { RISK_STRINGS } from './risk-strings'

// ─── Types ───

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RiskResponse = 'ACCEPT' | 'MITIGATE' | 'TRANSFER' | 'AVOID'

export interface RiskCategory {
  name: string
  weight: number
  questions: { id: string; text: string; weight: number; type: string }[]
}

export interface RiskThresholds {
  low: number
  medium: number
  high: number
  critical: number
}

export interface RiskScore {
  overallScore: number
  overallLevel: RiskLevel
  categoryScores: { name: string; score: number; level: RiskLevel }[]
}

export interface CreateRiskModelData {
  name: string
  description?: string
  categories: RiskCategory[]
  thresholds?: Partial<RiskThresholds>
}

export interface AuditRiskModel {
  id: string
  organizationId: string
  name: string
  description: string | null
  version: number
  categories: RiskCategory[]
  thresholds: RiskThresholds
  isActive: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateAssessmentData {
  title: string
  answers: Record<string, { inherent: number; residual?: number }>
  riskResponse?: RiskResponse
  responseNotes?: string
}

export interface AuditRiskAssessment {
  id: string
  modelId: string
  organizationId: string
  engagementId: string
  title: string
  inherentScore: number
  inherentLevel: RiskLevel
  residualScore: number | null
  residualLevel: RiskLevel | null
  riskResponse: RiskResponse | null
  responseNotes: string | null
  answers: Record<string, { inherent: number; residual?: number }>
  categoryScores: { name: string; score: number; level: RiskLevel }[]
  status: string
  assessedById: string
  reviewedById: string | null
  approvedById: string | null
  assessedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface ProcedureStep {
  stepNumber: number
  instruction: string
  completed?: boolean
}

export interface AuditRiskProcedure {
  id: string
  assessmentId: string
  organizationId: string
  procedureCode: string
  description: string
  riskCategory: string
  procedureSteps: ProcedureStep[]
  evidenceRequired: boolean
  status: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface UpdateProcedureData {
  description?: string
  procedureSteps?: ProcedureStep[]
  evidenceRequired?: boolean
  status?: string
}

// ─── Error ───

export class AuditRiskError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuditRiskError'
  }
}

// ─── Helpers ───

const DEFAULT_THRESHOLDS: RiskThresholds = {
  low: 30,
  medium: 60,
  high: 80,
  critical: 100,
}

function mapRiskLevel(score: number, thresholds: RiskThresholds): RiskLevel {
  if (score <= thresholds.low) return 'LOW'
  if (score <= thresholds.medium) return 'MEDIUM'
  if (score <= thresholds.high) return 'HIGH'
  return 'CRITICAL'
}

function validateWeights(categories: RiskCategory[]): void {
  if (!categories.length) throw new AuditRiskError(RISK_STRINGS.error.CATEGORIES_REQUIRED)
  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
  if (Math.abs(totalWeight - 100) > 0.01) {
    throw new AuditRiskError(RISK_STRINGS.error.WEIGHTS_MUST_SUM_100)
  }
  for (const cat of categories) {
    if (!cat.questions.length) {
      throw new AuditRiskError(RISK_STRINGS.error.CATEGORY_QUESTIONS_REQUIRED)
    }
  }
}

function validateAnswers(
  categories: RiskCategory[],
  answers: Record<string, { inherent: number; residual?: number }>,
): void {
  const questionIds = new Set(categories.flatMap((c) => c.questions.map((q) => q.id)))
  for (const qId of questionIds) {
    const answer = answers[qId]
    if (!answer) {
      throw new AuditRiskError(RISK_STRINGS.error.MISSING_ANSWERS)
    }
    if (answer.inherent < 0 || answer.inherent > 100) {
      throw new AuditRiskError(RISK_STRINGS.error.INVALID_ANSWER_VALUE)
    }
    if (answer.residual !== undefined && (answer.residual < 0 || answer.residual > 100)) {
      throw new AuditRiskError(RISK_STRINGS.error.INVALID_ANSWER_VALUE)
    }
  }
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['REVIEWED'],
  REVIEWED: ['APPROVED'],
  APPROVED: [],
}

// ─── Pure Math: calculateRiskScore ───

export function calculateRiskScore(
  categories: RiskCategory[],
  answers: Record<string, number>,
  thresholds: RiskThresholds = DEFAULT_THRESHOLDS,
): RiskScore {
  const categoryScores = categories.map((cat) => {
    const totalQuestionWeight = cat.questions.reduce((sum, q) => sum + q.weight, 0)
    if (totalQuestionWeight === 0) {
      return { name: cat.name, score: 0, level: 'LOW' as RiskLevel }
    }
    const weightedSum = cat.questions.reduce((sum, q) => {
      const answer = answers[q.id] ?? 0
      return sum + answer * q.weight
    }, 0)
    const catScore = weightedSum / totalQuestionWeight
    return {
      name: cat.name,
      score: Math.round(catScore * 100) / 100,
      level: mapRiskLevel(catScore, thresholds),
    }
  })

  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0)
  if (totalWeight === 0) {
    return { overallScore: 0, overallLevel: 'LOW', categoryScores }
  }

  const overallScore = Math.round(
    categoryScores.reduce((sum, cs) => {
      const cat = categories.find((c) => c.name === cs.name)
      return sum + cs.score * (cat?.weight ?? 0) / totalWeight
    }, 0) * 100,
  ) / 100

  return {
    overallScore,
    overallLevel: mapRiskLevel(overallScore, thresholds),
    categoryScores,
  }
}

// ─── Procedure Generation ───

function generateProcedureCode(index: number): string {
  return `RP-${String(index + 1).padStart(3, '0')}`
}

function generateProcedures(
  riskLevel: RiskLevel,
  categoryScores: { name: string; score: number; level: RiskLevel }[],
  userId: string,
  assessmentId: string,
  organizationId: string,
): Omit<AuditRiskProcedure, 'id' | 'createdAt' | 'updatedAt'>[] {
  const topCategories = [...categoryScores]
    .sort((a, b) => b.score - a.score)
    .filter((c) => c.level === 'HIGH' || c.level === 'CRITICAL' || c.score > 30)

  if (!topCategories.length) {
    topCategories.push(categoryScores[0])
  }

  const stepsByLevel: Record<RiskLevel, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  }

  const procedureCount = riskLevel === 'CRITICAL' ? topCategories.length : Math.min(topCategories.length, 2)

  const procedures: Omit<AuditRiskProcedure, 'id' | 'createdAt' | 'updatedAt'>[] = []

  for (let i = 0; i < procedureCount; i++) {
    const cat = topCategories[i]
    const stepsCount = stepsByLevel[riskLevel] ?? 2
    const steps: ProcedureStep[] = []

    switch (riskLevel) {
      case 'CRITICAL':
      case 'HIGH': {
        steps.push({ stepNumber: 1, instruction: `Review all documentation and evidence for ${cat.name}` })
        steps.push({ stepNumber: 2, instruction: `Perform detailed testing on high-risk areas within ${cat.name}` })
        steps.push({ stepNumber: 3, instruction: `Document findings and obtain management representation for ${cat.name}` })
        if (riskLevel === 'CRITICAL') {
          steps.push({ stepNumber: 4, instruction: `Escalate to senior review committee for ${cat.name}` })
        }
        break
      }
      case 'MEDIUM': {
        steps.push({ stepNumber: 1, instruction: `Review process documentation and perform walkthrough for ${cat.name}` })
        steps.push({ stepNumber: 2, instruction: `Perform substantive testing on sample transactions in ${cat.name}` })
        break
      }
      case 'LOW': {
        steps.push({ stepNumber: 1, instruction: `Perform limited review and analytical procedures for ${cat.name}` })
        break
      }
    }

    procedures.push({
      assessmentId,
      organizationId,
      procedureCode: generateProcedureCode(i),
      description: `Risk procedure for ${cat.name} (${riskLevel} risk)`,
      riskCategory: cat.name,
      procedureSteps: steps,
      evidenceRequired: riskLevel === 'LOW' ? false : true,
      status: 'DRAFT',
      createdById: userId,
    })
  }

  return procedures
}

// ─── Model CRUD ───

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
      categories: data.categories as any,
      thresholds: thresholds as any,
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
  })
  return models.map(mapModel)
}

// ─── Assessment ───

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
      answers: data.answers as any,
      categoryScores: inherentResult.categoryScores as any,
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

  for (const proc of procedures) {
    await prisma.auditRiskProcedure.create({
      data: {
        assessmentId: proc.assessmentId,
        organizationId: proc.organizationId,
        procedureCode: proc.procedureCode,
        description: proc.description,
        riskCategory: proc.riskCategory,
        procedureSteps: proc.procedureSteps as any,
        evidenceRequired: proc.evidenceRequired,
        status: proc.status,
        createdById: proc.createdById,
      },
    })
  }

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
  })
  return assessments.map(mapAssessment)
}

// ─── Status Transitions ───

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

// ─── Procedures ───

export async function getRiskProcedures(assessmentId: string): Promise<AuditRiskProcedure[]> {
  const procedures = await prisma.auditRiskProcedure.findMany({
    where: { assessmentId },
    orderBy: { createdAt: 'asc' },
  })
  return procedures.map(mapProcedure)
}

export async function updateProcedure(
  procedureId: string,
  data: UpdateProcedureData,
): Promise<AuditRiskProcedure> {
  const existing = await prisma.auditRiskProcedure.findUnique({ where: { id: procedureId } })
  if (!existing) throw new AuditRiskError(RISK_STRINGS.error.PROCEDURE_NOT_FOUND)

  const updatePayload: Record<string, unknown> = {}
  if (data.description !== undefined) updatePayload.description = data.description
  if (data.evidenceRequired !== undefined) updatePayload.evidenceRequired = data.evidenceRequired
  if (data.status !== undefined) updatePayload.status = data.status
  if (data.procedureSteps !== undefined) {
    updatePayload.procedureSteps = data.procedureSteps as unknown as Record<string, unknown>[]
  }

  const updated = await prisma.auditRiskProcedure.update({
    where: { id: procedureId },
    data: updatePayload,
  })

  return mapProcedure(updated)
}

// ─── Cross-Org Guard ───

export async function verifyOrgAccess(
  resourceType: 'model' | 'assessment' | 'procedure',
  resourceId: string,
  orgId: string,
): Promise<boolean> {
  let record: { organizationId: string } | null = null
  switch (resourceType) {
    case 'model':
      record = await prisma.auditRiskModel.findUnique({
        where: { id: resourceId },
        select: { organizationId: true },
      })
      break
    case 'assessment':
      record = await prisma.auditRiskAssessment.findUnique({
        where: { id: resourceId },
        select: { organizationId: true },
      })
      break
    case 'procedure':
      record = await prisma.auditRiskProcedure.findUnique({
        where: { id: resourceId },
        select: { organizationId: true },
      })
      break
  }
  if (!record) return false
  return record.organizationId === orgId
}

// ─── Mappers ───

function mapModel(record: {
  id: string
  organizationId: string
  name: string
  description: string | null
  version: number
  categories: unknown
  thresholds: unknown
  isActive: boolean
  createdById: string | null
  createdAt: Date
  updatedAt: Date
}): AuditRiskModel {
  return {
    id: record.id,
    organizationId: record.organizationId,
    name: record.name,
    description: record.description,
    version: record.version,
    categories: record.categories as RiskCategory[],
    thresholds: record.thresholds as RiskThresholds,
    isActive: record.isActive,
    createdById: record.createdById ?? "",
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapAssessment(record: {
  id: string
  modelId: string
  organizationId: string
  engagementId: string
  title: string
  inherentScore: number | null
  inherentLevel: string | null
  residualScore: number | null
  residualLevel: string | null
  riskResponse: string | null
  responseNotes: string | null
  answers: unknown
  categoryScores: unknown
  status: string
  assessedById: string | null
  reviewedById: string | null
  approvedById: string | null
  assessedAt: Date
  createdAt: Date
  updatedAt: Date
}): AuditRiskAssessment {
  return {
    id: record.id,
    modelId: record.modelId,
    organizationId: record.organizationId,
    engagementId: record.engagementId,
    title: record.title,
    inherentScore: record.inherentScore ?? 0,
    inherentLevel: (record.inherentLevel ?? 'LOW') as RiskLevel,
    residualScore: record.residualScore,
    residualLevel: record.residualLevel as RiskLevel | null,
    riskResponse: record.riskResponse as RiskResponse | null,
    responseNotes: record.responseNotes,
    answers: record.answers as Record<string, { inherent: number; residual?: number }>,
    categoryScores: record.categoryScores as { name: string; score: number; level: RiskLevel }[],
    status: record.status,
    assessedById: record.assessedById ?? "",
    reviewedById: record.reviewedById,
    approvedById: record.approvedById,
    assessedAt: record.assessedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function mapProcedure(record: {
  id: string
  assessmentId: string
  organizationId: string
  procedureCode: string
  description: string
  riskCategory: string
  procedureSteps: unknown
  evidenceRequired: boolean
  status: string
  createdById: string
  createdAt: Date
  updatedAt: Date
}): AuditRiskProcedure {
  return {
    id: record.id,
    assessmentId: record.assessmentId,
    organizationId: record.organizationId,
    procedureCode: record.procedureCode,
    description: record.description,
    riskCategory: record.riskCategory,
    procedureSteps: record.procedureSteps as ProcedureStep[],
    evidenceRequired: record.evidenceRequired,
    status: record.status,
    createdById: record.createdById,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}
