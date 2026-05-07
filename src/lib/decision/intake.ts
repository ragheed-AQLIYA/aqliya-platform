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

export interface IntakeItem {
  description: string
}

export interface DecisionIntakeInput {
  title?: string | null
  objectives?: IntakeItem[]
  alternatives?: IntakeItem[]
  risks?: IntakeItem[]
}

export interface DecisionIntakeResult {
  status: IntakeStatus
  readyForFramework: boolean
  reasonCodes: IntakeReasonCode[]
  reasons: string[]
  requiredNextSteps: string[]
}

const rejectionRules: Array<{
  code: IntakeReasonCode
  reason: string
  pattern: RegExp
}> = [
  {
    code: "information_request",
    reason: "The request appears to ask for information rather than a choice between action paths.",
    pattern: /\b(what is|what are|explain|summari[sz]e|list|show me|tell me|report on)\b/i,
  },
  {
    code: "routine_action",
    reason: "The request appears to be routine execution rather than a governed decision.",
    pattern: /\b(schedule|send|upload|download|format|rename|copy|fix typo|book|email)\b/i,
  },
  {
    code: "already_decided",
    reason: "The request appears to describe an already-made decision rather than an open decision.",
    pattern: /\b(already decided|decision has been made|approved to|we will|we have chosen)\b/i,
  },
]

function hasContent(items?: IntakeItem[]) {
  return Boolean(items?.some((item) => item.description.trim().length > 0))
}

function countContent(items?: IntakeItem[]) {
  return items?.filter((item) => item.description.trim().length > 0).length ?? 0
}

export function evaluateDecisionIntake(input: DecisionIntakeInput): DecisionIntakeResult {
  const title = input.title?.trim() ?? ""
  const reasonCodes: IntakeReasonCode[] = []
  const reasons: string[] = []
  const requiredNextSteps: string[] = []

  if (!title) {
    reasonCodes.push("missing_title")
    reasons.push("Decision title is required.")
    requiredNextSteps.push("Name the decision as a clear choice to be made.")
  }

  for (const rule of rejectionRules) {
    if (rule.pattern.test(title)) {
      reasonCodes.push(rule.code)
      reasons.push(rule.reason)
    }
  }

  if (reasonCodes.some((code) => ["information_request", "routine_action", "already_decided"].includes(code))) {
    return {
      status: "rejected",
      readyForFramework: false,
      reasonCodes,
      reasons,
      requiredNextSteps: ["Reframe the input as an unresolved decision with multiple viable action paths."],
    }
  }

  if (!hasContent(input.objectives)) {
    reasonCodes.push("missing_objective")
    reasons.push("At least one objective is required to establish decision purpose and impact.")
    requiredNextSteps.push("Add the objective or business outcome this decision is meant to achieve.")
  }

  if (countContent(input.alternatives) < 2) {
    reasonCodes.push("missing_alternatives")
    reasons.push("At least two alternatives are required for a real decision.")
    requiredNextSteps.push("Add two or more viable options, including a do-nothing or defer option when appropriate.")
  }

  if (!hasContent(input.risks)) {
    reasonCodes.push("missing_uncertainty")
    reasons.push("At least one risk or uncertainty is required before framework analysis.")
    requiredNextSteps.push("Add the key uncertainty, risk, trade-off, or opportunity cost.")
  }

  if (reasonCodes.length > 0) {
    return {
      status: "reframe_required",
      readyForFramework: false,
      reasonCodes,
      reasons,
      requiredNextSteps,
    }
  }

  return {
    status: "accepted",
    readyForFramework: true,
    reasonCodes: [],
    reasons: ["Decision intake passed. The decision can proceed to framework analysis."],
    requiredNextSteps: ["Proceed to A-1.1 Decision Frameworks."],
  }
}
