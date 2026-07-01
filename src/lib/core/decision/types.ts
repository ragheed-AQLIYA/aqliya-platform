// ─── Decision Engine Shared Types ───
// Reusable across all products that need governed multi-criteria evaluation.

// ─── Stage / Workflow Types ───

export interface DecisionStageState {
  id: string
  label: string
  href: string
  status: "complete" | "incomplete" | "blocked" | "not_started" | "optional"
  description: string
}

export interface DecisionCompletionState {
  stages: DecisionStageState[]
  overallProgress: number
  nextStep: DecisionModuleConfig | null
  isComplete: boolean
  blockedStages: string[]
}

export interface DecisionModuleConfig {
  id: string
  label: string
  href: string
  description: string
  required: boolean
}

export interface DecisionForEngine {
  id: string
  type: string
  title: string
  status: string
  objectives?: Array<{ description: string }> | null
  alternatives?: Array<{ description: string }> | null
  risks?: Array<{ description: string; level?: string }> | null
  framework?: Record<string, string | null> | null
  decisionScenarios?: Array<{ id: string; name: string; description?: string | null }> | null
  riskAnalyses?: Array<{ scenarioId: string; risks?: string | null; tradeoffs?: string | null }> | null
  recommendation?: DecisionRecommendationInput | null
  tenderProfile?: unknown | null
}

// ─── Intake Types ───

export type IntakeStatus = "accepted" | "rejected" | "reframe_required"

export type IntakeReasonCode =
  | "missing_title"
  | "missing_objective"
  | "missing_alternatives"
  | "missing_uncertainty"
  | "non_decision"
  | "routine_action"
  | "information_request"
  | "already_decided"

export interface DecisionIntakeInput {
  title?: string | null
  objectives?: Array<{ description: string }>
  alternatives?: Array<{ description: string }>
  risks?: Array<{ description: string }>
}

export interface DecisionIntakeResult {
  status: IntakeStatus
  readyForFramework: boolean
  reasonCodes: IntakeReasonCode[]
  reasons: string[]
  requiredNextSteps: string[]
}

// ─── Framework Types ───

export type FrameworkField =
  | "context" | "purpose" | "options" | "criteria"
  | "values" | "informationGaps" | "certainty" | "assumptions"

export interface DecisionFrameworkInput {
  context?: string | null
  purpose?: string | null
  options?: string | null
  criteria?: string | null
  values?: string | null
  informationGaps?: string | null
  certainty?: string | null
  assumptions?: string | null
}

export interface DecisionFrameworkState {
  isComplete: boolean
  missingFields: FrameworkField[]
  nextSteps: string[]
}

// ─── Scenario Types ───

export type ScenarioField =
  | "name" | "description" | "assumptions" | "expectedOutcome"
  | "affectedStakeholders" | "requiredConditions"

export interface DecisionScenarioInput {
  id?: string
  name?: string | null
  description?: string | null
  assumptions?: string | null
  expectedOutcome?: string | null
  affectedStakeholders?: string | null
  requiredConditions?: string | null
}

export interface DecisionScenariosState {
  isComplete: boolean
  missingDefaultScenarios: string[]
  incompleteScenarios: Array<{ name: string; missingFields: ScenarioField[] }>
  nextSteps: string[]
}

// ─── Risk Analysis Types ───

export type RiskAnalysisField =
  | "scenarioId" | "risks" | "tradeoffs" | "sacrifices" | "opportunityCosts"
  | "stakeholderRisks" | "operationalRisks" | "strategicRisks"
  | "knowledgeRisks" | "uncertaintyLevel"

export interface DecisionRiskAnalysisInput {
  id?: string
  scenarioId?: string | null
  risks?: string | null
  tradeoffs?: string | null
  sacrifices?: string | null
  opportunityCosts?: string | null
  stakeholderRisks?: string | null
  operationalRisks?: string | null
  strategicRisks?: string | null
  knowledgeRisks?: string | null
  uncertaintyLevel?: string | null
}

export interface DecisionRiskAnalysisState {
  isComplete: boolean
  missingScenarioAnalyses: string[]
  incompleteAnalyses: Array<{ scenarioName: string; missingFields: RiskAnalysisField[] }>
  nextSteps: string[]
}

export interface RiskAnalysisScenarioRef {
  id: string
  name: string
}

// ─── Recommendation Types ───

export type RecommendationField =
  | "recommendedAction" | "rationale" | "expectedNextState"
  | "scopeExclusions" | "assumptionsUsed" | "risksAccepted"
  | "risksRejected" | "humanReviewRequired"

export interface DecisionRecommendationInput {
  id?: string
  recommendedAction?: string | null
  rationale?: string | null
  expectedNextState?: string | null
  scopeExclusions?: string | null
  assumptionsUsed?: string | null
  risksAccepted?: string | null
  risksRejected?: string | null
  humanReviewRequired?: boolean | null
}

// ─── Engine Interface ───

export interface StageEvaluator {
  evaluate(decision: DecisionForEngine): DecisionStageState
}

export interface DecisionEngineConfig {
  modules: DecisionModuleConfig[]
  getStageEvaluator(moduleId: string): StageEvaluator | null
}
