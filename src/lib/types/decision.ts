export type UserRole = "ADMIN" | "MEMBER" | "VIEWER"

export type DecisionStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED"

export type DecisionType = "TENDER"

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export type ScenarioType = "BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE"

export type RecommendationType = "GO" | "GO_WITH_CONDITIONS" | "NO_GO"

export interface Decision {
  id: string
  title: string
  type: DecisionType
  ownerId: string
  reviewerId?: string
  approverId?: string
  organizationId: string
  status: DecisionStatus
  objectives?: string
  constraints?: string
  assumptions?: string
  alternatives?: string
  risks?: string
  createdAt: Date
  updatedAt: Date
}

export interface Tender {
  id: string
  decisionId: string
  clientName: string
  estimatedContractValue: number
  estimatedCost: number
  durationMonths: number
  requiredCapacity: number
  internalAvailableCapacity: number
  strategicFitScore: number
  riskLevel: RiskLevel
  marginEstimate: number
  createdAt: Date
  updatedAt: Date
}

export interface Simulation {
  id: string
  decisionId: string
  scenarioType: ScenarioType
  feasibilityScore: number
  financialScore: number
  capacityScore: number
  riskScore: number
  strategicFitScore: number
  overallScore: number
  createdAt: Date
  updatedAt: Date
}

export interface Recommendation {
  id: string
  decisionId: string
  type: RecommendationType
  conditions?: string
  createdAt: Date
  updatedAt: Date
}
