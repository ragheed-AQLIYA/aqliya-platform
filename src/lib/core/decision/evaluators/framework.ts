export type FrameworkField =
  | "context"
  | "purpose"
  | "options"
  | "criteria"
  | "values"
  | "informationGaps"
  | "certainty"
  | "assumptions"

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

export type NormalizedDecisionFrameworkInput = Record<FrameworkField, string>

const fieldLabels: Record<FrameworkField, string> = {
  context: "context",
  purpose: "purpose",
  options: "options",
  criteria: "criteria",
  values: "values",
  informationGaps: "information gaps",
  certainty: "certainty",
  assumptions: "assumptions",
}

function hasValue(value?: string | null) {
  return Boolean(value?.trim())
}

export function normalizeDecisionFramework(input: DecisionFrameworkInput): NormalizedDecisionFrameworkInput {
  return {
    context: input.context?.trim() ?? "",
    purpose: input.purpose?.trim() ?? "",
    options: input.options?.trim() ?? "",
    criteria: input.criteria?.trim() ?? "",
    values: input.values?.trim() ?? "",
    informationGaps: input.informationGaps?.trim() ?? "",
    certainty: input.certainty?.trim() ?? "",
    assumptions: input.assumptions?.trim() ?? "",
  }
}

export function evaluateDecisionFramework(input?: DecisionFrameworkInput | null): DecisionFrameworkState {
  const framework = normalizeDecisionFramework(input ?? {})
  const missingFields = (Object.keys(fieldLabels) as FrameworkField[]).filter((field) => !hasValue(framework[field]))

  if (missingFields.length > 0) {
    return {
      isComplete: false,
      missingFields,
      nextSteps: missingFields.map((field) => `Define ${fieldLabels[field]} before moving to scenarios or risk analysis.`),
    }
  }

  return {
    isComplete: true,
    missingFields: [],
    nextSteps: ["Proceed to A-1.2 Scenarios & Optionality."],
  }
}
