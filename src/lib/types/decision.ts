export type UserRole = "ADMIN" | "MEMBER" | "VIEWER"

export type DecisionStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "ARCHIVED"

export type DecisionType = "TENDER"

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export type ScenarioType = "BEST_CASE" | "EXPECTED_CASE" | "WORST_CASE"

export type RecommendationType = "GO" | "GO_WITH_CONDITIONS" | "NO_GO"

export type IntakeStatus = "accepted" | "rejected" | "reframe_required"

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

export interface DecisionIntake {
  status: IntakeStatus
  readyForFramework: boolean
  reasonCodes: string[]
  reasons: string[]
  requiredNextSteps: string[]
}

export interface DecisionFramework {
  id: string
  decisionId: string
  context: string
  purpose: string
  options: string
  criteria: string
  values: string
  informationGaps: string
  certainty: string
  assumptions: string
  createdAt: Date
  updatedAt: Date
}

export interface DecisionFrameworkState {
  isComplete: boolean
  missingFields: string[]
  nextSteps: string[]
}

export interface DecisionScenario {
  id: string
  decisionId: string
  name: string
  description: string
  assumptions: string
  expectedOutcome: string
  affectedStakeholders: string
  requiredConditions: string
  createdAt: Date
  updatedAt: Date
}

export interface DecisionScenariosState {
  isComplete: boolean
  missingDefaultScenarios: string[]
  incompleteScenarios: Array<{
    name: string
    missingFields: string[]
  }>
  nextSteps: string[]
}

export interface DecisionRiskAnalysis {
  id: string
  decisionId: string
  scenarioId: string
  risks: string
  tradeoffs: string
  sacrifices: string
  opportunityCosts: string
  stakeholderRisks: string
  operationalRisks: string
  strategicRisks: string
  knowledgeRisks: string
  uncertaintyLevel: string
  createdAt: Date
  updatedAt: Date
}

export interface DecisionRiskAnalysisState {
  isComplete: boolean
  missingScenarioAnalyses: string[]
  incompleteAnalyses: Array<{
    scenarioName: string
    missingFields: string[]
  }>
  nextSteps: string[]
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
  recommendedAction: string
  rationale: string
  expectedNextState: string
  scopeExclusions: string
  assumptionsUsed: string
  risksAccepted: string
  risksRejected: string
  humanReviewRequired: boolean
  type: RecommendationType
  confidenceScore?: number
  reasoning?: string
  conditions?: string
  createdAt: Date
  updatedAt: Date
}

export interface RecommendationState {
  isComplete: boolean
  missingFields: string[]
  nextSteps: string[]
}
