import 'server-only'
import { AuditRiskError, DEFAULT_THRESHOLDS } from './types'
import type { RiskCategory, RiskLevel, RiskResponse, RiskThresholds, RiskScore } from './types'
import type { AuditRiskModel, AuditRiskAssessment, AuditRiskProcedure, ProcedureStep } from './types'
import { RISK_STRINGS } from '../risk-strings'

export function mapRiskLevel(score: number, thresholds: RiskThresholds = DEFAULT_THRESHOLDS): RiskLevel {
  if (score <= thresholds.low) return 'LOW'
  if (score <= thresholds.medium) return 'MEDIUM'
  if (score <= thresholds.high) return 'HIGH'
  return 'CRITICAL'
}

export function validateWeights(categories: RiskCategory[]): void {
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

export function validateAnswers(
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

export function generateProcedureCode(index: number): string {
  return `RP-${String(index + 1).padStart(3, '0')}`
}

export function mapModel(record: {
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
    createdById: record.createdById ?? '',
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export function mapAssessment(record: {
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
    assessedById: record.assessedById ?? '',
    reviewedById: record.reviewedById,
    approvedById: record.approvedById,
    assessedAt: record.assessedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export function mapProcedure(record: {
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
