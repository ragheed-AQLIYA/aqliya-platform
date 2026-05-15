type DiffField =
  | "recommendedAction"
  | "rationale"
  | "expectedNextState"
  | "scopeExclusions"
  | "assumptionsUsed"
  | "risksAccepted"
  | "risksRejected"
  | "conditions"
  | "confidence"
  | "score"
  | "risks"
  | "nextActions"

const fieldLabels: Record<DiffField, string> = {
  recommendedAction: "Recommended Action",
  rationale: "Rationale",
  expectedNextState: "Expected Next State",
  scopeExclusions: "Scope Exclusions",
  assumptionsUsed: "Assumptions Used",
  risksAccepted: "Risks Accepted",
  risksRejected: "Risks Rejected",
  conditions: "Conditions",
  confidence: "Confidence",
  score: "Score",
  risks: "Risks",
  nextActions: "Next Actions",
}

export type FieldDiff = {
  field: DiffField
  label: string
  changed: boolean
  approvedValue: string | number | null
  currentValue: string | number | null
}

export type RecommendationDiff = {
  fields: FieldDiff[]
  changedFields: DiffField[]
  changeCount: number
  hasChanges: boolean
}

function normalizeValue(value: unknown): string | number | null {
  if (value === null || value === undefined) return null
  if (typeof value === "string") return value.trim()
  if (typeof value === "number") return value
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function compareField(
  field: DiffField,
  approved: Record<string, unknown>,
  current: Record<string, unknown>
): FieldDiff {
  const approvedValue = normalizeValue(approved[field])
  const currentValue = normalizeValue(current[field])
  const changed = approvedValue !== currentValue

  return {
    field,
    label: fieldLabels[field],
    changed,
    approvedValue,
    currentValue,
  }
}

export function buildRecommendationDiff(
  approvedSnapshot: Record<string, unknown>,
  currentRecommendation: Record<string, unknown>
): RecommendationDiff {
  const allFields: DiffField[] = [
    "recommendedAction",
    "rationale",
    "expectedNextState",
    "scopeExclusions",
    "assumptionsUsed",
    "risksAccepted",
    "risksRejected",
    "conditions",
    "confidence",
    "score",
    "risks",
    "nextActions",
  ]

  const fields = allFields.map((f) => compareField(f, approvedSnapshot, currentRecommendation))
  const changedFields = fields.filter((f) => f.changed).map((f) => f.field)

  return {
    fields,
    changedFields,
    changeCount: changedFields.length,
    hasChanges: changedFields.length > 0,
  }
}

export function getDiffSummary(diff: RecommendationDiff): string {
  if (!diff.hasChanges) return "No changes detected"

  const changedLabels = diff.changedFields.map((f) => fieldLabels[f])
  return `${diff.changeCount} field(s) changed: ${changedLabels.join(", ")}`
}
