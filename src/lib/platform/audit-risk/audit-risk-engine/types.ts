import 'server-only'

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

// ─── Constants ───

export const DEFAULT_THRESHOLDS: RiskThresholds = {
  low: 30,
  medium: 60,
  high: 80,
  critical: 100,
}

export const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['REVIEWED'],
  REVIEWED: ['APPROVED'],
  APPROVED: [],
}

// ─── Error ───

export class AuditRiskError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuditRiskError'
  }
}
