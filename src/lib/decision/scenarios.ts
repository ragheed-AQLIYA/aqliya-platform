export type ScenarioField =
  | "name"
  | "description"
  | "assumptions"
  | "expectedOutcome"
  | "affectedStakeholders"
  | "requiredConditions"

export interface DecisionScenarioInput {
  id?: string
  name?: string | null
  description?: string | null
  assumptions?: string | null
  expectedOutcome?: string | null
  affectedStakeholders?: string | null
  requiredConditions?: string | null
}

export type NormalizedDecisionScenarioInput = Record<ScenarioField, string> & {
  id?: string
}

export interface DecisionScenariosState {
  isComplete: boolean
  missingDefaultScenarios: string[]
  incompleteScenarios: Array<{
    name: string
    missingFields: ScenarioField[]
  }>
  nextSteps: string[]
}

export const requiredDefaultScenarioNames = ["Base case", "Upside case", "Downside case"] as const

const fieldLabels: Record<ScenarioField, string> = {
  name: "name",
  description: "description",
  assumptions: "assumptions",
  expectedOutcome: "expected outcome",
  affectedStakeholders: "affected stakeholders",
  requiredConditions: "required conditions",
}

function normalizeName(value?: string | null) {
  return value?.trim().toLowerCase() ?? ""
}

function hasValue(value?: string | null) {
  return Boolean(value?.trim())
}

export function normalizeDecisionScenario(input: DecisionScenarioInput): NormalizedDecisionScenarioInput {
  return {
    id: input.id,
    name: input.name?.trim() ?? "",
    description: input.description?.trim() ?? "",
    assumptions: input.assumptions?.trim() ?? "",
    expectedOutcome: input.expectedOutcome?.trim() ?? "",
    affectedStakeholders: input.affectedStakeholders?.trim() ?? "",
    requiredConditions: input.requiredConditions?.trim() ?? "",
  }
}

export function createDefaultDecisionScenarios(existing: DecisionScenarioInput[] = []): NormalizedDecisionScenarioInput[] {
  const normalizedExisting = existing.map(normalizeDecisionScenario)
  const existingNames = new Set(normalizedExisting.map((scenario) => normalizeName(scenario.name)))
  const defaults = requiredDefaultScenarioNames
    .filter((name) => !existingNames.has(normalizeName(name)))
    .map((name) => normalizeDecisionScenario({ name }))

  return [...normalizedExisting, ...defaults]
}

export function evaluateDecisionScenarios(scenarios: DecisionScenarioInput[]): DecisionScenariosState {
  const normalizedScenarios = scenarios.map(normalizeDecisionScenario)
  const scenarioNames = new Set(normalizedScenarios.map((scenario) => normalizeName(scenario.name)))
  const missingDefaultScenarios = requiredDefaultScenarioNames.filter((name) => !scenarioNames.has(normalizeName(name)))
  const incompleteScenarios = normalizedScenarios
    .map((scenario) => ({
      name: scenario.name || "Unnamed scenario",
      missingFields: (Object.keys(fieldLabels) as ScenarioField[]).filter((field) => !hasValue(scenario[field])),
    }))
    .filter((scenario) => scenario.missingFields.length > 0)

  const nextSteps = [
    ...missingDefaultScenarios.map((name) => `Add the required default scenario: ${name}.`),
    ...incompleteScenarios.flatMap((scenario) =>
      scenario.missingFields.map((field) => `Define ${fieldLabels[field]} for ${scenario.name}.`)
    ),
  ]

  if (nextSteps.length > 0) {
    return {
      isComplete: false,
      missingDefaultScenarios,
      incompleteScenarios,
      nextSteps,
    }
  }

  return {
    isComplete: true,
    missingDefaultScenarios: [],
    incompleteScenarios: [],
    nextSteps: ["Proceed to A-1.3 Risk & Trade-offs without ranking, evaluating, or recommending scenarios."],
  }
}
