export type RiskAnalysisField =
  | "scenarioId"
  | "risks"
  | "tradeoffs"
  | "sacrifices"
  | "opportunityCosts"
  | "stakeholderRisks"
  | "operationalRisks"
  | "strategicRisks"
  | "knowledgeRisks"
  | "uncertaintyLevel"

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

export type NormalizedDecisionRiskAnalysisInput = Record<RiskAnalysisField, string> & {
  id?: string
}

export interface DecisionRiskAnalysisState {
  isComplete: boolean
  missingScenarioAnalyses: string[]
  incompleteAnalyses: Array<{
    scenarioName: string
    missingFields: RiskAnalysisField[]
  }>
  nextSteps: string[]
}

export interface RiskAnalysisScenarioRef {
  id: string
  name: string
}

const fieldLabels: Record<RiskAnalysisField, string> = {
  scenarioId: "scenario",
  risks: "risks",
  tradeoffs: "trade-offs",
  sacrifices: "sacrifices",
  opportunityCosts: "opportunity costs",
  stakeholderRisks: "stakeholder risks",
  operationalRisks: "operational risks",
  strategicRisks: "strategic risks",
  knowledgeRisks: "knowledge risks",
  uncertaintyLevel: "uncertainty level",
}

function hasValue(value?: string | null) {
  return Boolean(value?.trim())
}

export function normalizeDecisionRiskAnalysis(input: DecisionRiskAnalysisInput): NormalizedDecisionRiskAnalysisInput {
  return {
    id: input.id,
    scenarioId: input.scenarioId?.trim() ?? "",
    risks: input.risks?.trim() ?? "",
    tradeoffs: input.tradeoffs?.trim() ?? "",
    sacrifices: input.sacrifices?.trim() ?? "",
    opportunityCosts: input.opportunityCosts?.trim() ?? "",
    stakeholderRisks: input.stakeholderRisks?.trim() ?? "",
    operationalRisks: input.operationalRisks?.trim() ?? "",
    strategicRisks: input.strategicRisks?.trim() ?? "",
    knowledgeRisks: input.knowledgeRisks?.trim() ?? "",
    uncertaintyLevel: input.uncertaintyLevel?.trim() ?? "",
  }
}

export function createDefaultRiskAnalyses(
  scenarios: RiskAnalysisScenarioRef[],
  existingAnalyses: DecisionRiskAnalysisInput[] = []
): NormalizedDecisionRiskAnalysisInput[] {
  const analysisByScenario = new Map(
    existingAnalyses.map((analysis) => [analysis.scenarioId ?? "", normalizeDecisionRiskAnalysis(analysis)])
  )

  return scenarios.map((scenario) => analysisByScenario.get(scenario.id) ?? normalizeDecisionRiskAnalysis({ scenarioId: scenario.id }))
}

export function evaluateDecisionRiskAnalysis(
  scenarios: RiskAnalysisScenarioRef[],
  analyses: DecisionRiskAnalysisInput[]
): DecisionRiskAnalysisState {
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario.name]))
  const normalizedAnalyses = analyses.map(normalizeDecisionRiskAnalysis)
  const analyzedScenarioIds = new Set(normalizedAnalyses.filter((analysis) => hasValue(analysis.scenarioId)).map((analysis) => analysis.scenarioId))
  const missingScenarioAnalyses = scenarios
    .filter((scenario) => !analyzedScenarioIds.has(scenario.id))
    .map((scenario) => scenario.name)

  const incompleteAnalyses = normalizedAnalyses
    .map((analysis) => ({
      scenarioName: scenarioById.get(analysis.scenarioId) ?? "Unknown scenario",
      missingFields: (Object.keys(fieldLabels) as RiskAnalysisField[]).filter((field) => !hasValue(analysis[field])),
    }))
    .filter((analysis) => analysis.missingFields.length > 0)

  const nextSteps = [
    ...missingScenarioAnalyses.map((scenarioName) => `Add risk and trade-off analysis for ${scenarioName}.`),
    ...incompleteAnalyses.flatMap((analysis) =>
      analysis.missingFields.map((field) => `Define ${fieldLabels[field]} for ${analysis.scenarioName}.`)
    ),
  ]

  if (nextSteps.length > 0) {
    return {
      isComplete: false,
      missingScenarioAnalyses,
      incompleteAnalyses,
      nextSteps,
    }
  }

  return {
    isComplete: true,
    missingScenarioAnalyses: [],
    incompleteAnalyses: [],
    nextSteps: ["Risk and trade-off analysis is complete. Do not recommend, rank, or choose a path in this stage."],
  }
}
