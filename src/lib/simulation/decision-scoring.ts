import type { RiskLevel } from "@prisma/client"

export interface DecisionScoringData {
  objectives: Array<{ description: string }>
  constraints: Array<{ description: string }>
  assumptions: Array<{ description: string }>
  alternatives: Array<{ description: string }>
  risks: Array<{ description: string; level: RiskLevel }>
  framework: {
    context: string
    purpose: string
    options: string
    criteria: string
    values: string
    informationGaps: string
    certainty: string
    assumptions: string
  } | null
  businessScenarioCount: number
  businessScenariosComplete: boolean
  priority: string | null
  targetDate: Date | null
}

export interface DerivedScores {
  strategicFitScore: number
  feasibilityScore: number
  financialScore: number
  capacityScore: number
  riskScore: number
  confidenceScore: number
  missingInputs: string[]
  dataQuality: number
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value))
}

function scoreFromLength(count: number, ideal: number, weight = 1): number {
  if (count === 0) return 0
  const ratio = Math.min(count / ideal, 1)
  return clamp(ratio * 100 * weight)
}

function scoreFromContentQuality(text: string | undefined | null, maxScore: number): number {
  if (!text || text.trim().length === 0) return 0
  const length = text.trim().length
  if (length >= 200) return maxScore
  if (length >= 100) return maxScore * 0.8
  if (length >= 50) return maxScore * 0.5
  if (length >= 20) return maxScore * 0.3
  return maxScore * 0.1
}

function scoreFramework(framework: DecisionScoringData["framework"]): number {
  if (!framework) return 0
  const fields = [
    framework.context,
    framework.purpose,
    framework.options,
    framework.criteria,
    framework.values,
    framework.informationGaps,
    framework.certainty,
    framework.assumptions,
  ]
  const filled = fields.filter((f) => f && f.trim().length > 0).length
  return clamp((filled / fields.length) * 100)
}

function scoreRiskProfile(risks: DecisionScoringData["risks"]): number {
  if (risks.length === 0) return 50
  const levelScores = { LOW: 85, MEDIUM: 55, HIGH: 25 }
  const total = risks.reduce((sum, r) => sum + (levelScores[r.level] ?? 55), 0)
  const avg = total / risks.length
  const countPenalty = risks.length > 5 ? (risks.length - 5) * 3 : 0
  return clamp(avg - countPenalty)
}

function scoreUrgency(targetDate: Date | null, priority: string | null): number {
  if (!targetDate) return 50
  const now = new Date()
  const daysUntil = (targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (daysUntil < 0) return 20
  if (daysUntil < 7) {
    const priorityBoost = priority === "HIGH" ? 10 : priority === "LOW" ? -10 : 0
    return clamp(80 + priorityBoost)
  }
  if (daysUntil < 30) return 60
  if (daysUntil < 90) return 45
  return 30
}

function scoreConfidence(data: DecisionScoringData, scores: Omit<DerivedScores, "confidenceScore" | "missingInputs" | "dataQuality">): number {
  let base = 50
  const frameworkScore = scoreFramework(data.framework)
  base += (frameworkScore - 50) * 0.2
  base += (data.objectives.length > 0 ? 10 : -10)
  base += (data.alternatives.length > 0 ? 10 : -10)
  base += (data.risks.length > 0 ? 5 : -5)
  base += (data.businessScenarioCount >= 3 ? 10 : data.businessScenarioCount > 0 ? 5 : -5)
  const variance = Math.abs(scores.strategicFitScore - scores.riskScore)
  base -= (variance / 100) * 15
  return clamp(base)
}

function detectMissingInputs(data: DecisionScoringData): string[] {
  const missing: string[] = []
  if (!data.framework || scoreFramework(data.framework) < 50) {
    missing.push("Decision framework not completed")
  }
  if (data.objectives.length === 0) {
    missing.push("No objectives defined")
  }
  if (data.constraints.length === 0) {
    missing.push("No constraints identified")
  }
  if (data.alternatives.length === 0) {
    missing.push("No alternatives defined")
  }
  if (data.assumptions.length === 0) {
    missing.push("No assumptions documented")
  }
  if (data.risks.length === 0) {
    missing.push("No risks assessed")
  }
  if (data.businessScenarioCount === 0) {
    missing.push("No scenarios created")
  }
  return missing
}

export function deriveScores(data: DecisionScoringData): DerivedScores {
  const frameworkScore = scoreFramework(data.framework)
  const riskScore = scoreRiskProfile(data.risks)
  const urgencyScore = scoreUrgency(data.targetDate, data.priority)

  const objectivesScore = scoreFromLength(data.objectives.length, 5)
  const constraintsScore = scoreFromLength(data.constraints.length, 3)
  const assumptionsScore = scoreFromLength(data.assumptions.length, 4)
  const alternativesScore = scoreFromLength(data.alternatives.length, 3)
  const scenariosScore = scoreFromLength(data.businessScenarioCount, 3)

  const strategicFitScore = clamp(
    frameworkScore * 0.35 +
    objectivesScore * 0.25 +
    alternativesScore * 0.2 +
    scoreFromContentQuality(data.framework?.criteria, 20) * 0.2
  )

  const feasibilityScore = clamp(
    frameworkScore * 0.2 +
    objectivesScore * 0.2 +
    constraintsScore * 0.15 +
    assumptionsScore * 0.15 +
    scenariosScore * 0.3
  )

  const financialScore = clamp(
    objectivesScore * 0.3 +
    constraintsScore * 0.2 +
    alternativesScore * 0.25 +
    urgencyScore * 0.25
  )

  const capacityScore = clamp(
    objectivesScore * 0.2 +
    assumptionsScore * 0.2 +
    alternativesScore * 0.3 +
    (100 - constraintsScore) * 0.15 +
    frameworkScore * 0.15
  )

  const rawRiskScore = clamp(
    riskScore * 0.5 +
    assumptionsScore * 0.2 +
    (100 - constraintsScore) * 0.15 +
    frameworkScore * 0.15
  )

  const missingInputs = detectMissingInputs(data)
  const dataQuality = clamp(
    frameworkScore * 0.3 +
    (data.objectives.length > 0 ? 15 : 0) +
    (data.constraints.length > 0 ? 10 : 0) +
    (data.assumptions.length > 0 ? 10 : 0) +
    (data.alternatives.length > 0 ? 10 : 0) +
    (data.risks.length > 0 ? 15 : 0) +
    (data.businessScenarioCount >= 3 ? 30 : data.businessScenarioCount > 0 ? 15 : 0)
  )

  const partialScores = {
    strategicFitScore,
    feasibilityScore,
    financialScore,
    capacityScore,
    riskScore: rawRiskScore,
  }

  const confidenceScore = scoreConfidence(data, partialScores)

  return {
    ...partialScores,
    confidenceScore,
    missingInputs,
    dataQuality,
  }
}

export function getScoreDrivers(data: DecisionScoringData): Record<string, { score: number; label: string; impact: "positive" | "neutral" | "negative" }> {
  const scores = deriveScores(data)
  const drivers: Record<string, { score: number; label: string; impact: "positive" | "neutral" | "negative" }> = {}

  drivers.framework = {
    score: scoreFramework(data.framework),
    label: `Decision framework (${data.framework ? "completed" : "missing"})`,
    impact: scoreFramework(data.framework) >= 70 ? "positive" : scoreFramework(data.framework) >= 40 ? "neutral" : "negative",
  }

  drivers.objectives = {
    score: scoreFromLength(data.objectives.length, 5),
    label: `Objectives (${data.objectives.length} defined)`,
    impact: data.objectives.length >= 3 ? "positive" : data.objectives.length > 0 ? "neutral" : "negative",
  }

  drivers.constraints = {
    score: scoreFromLength(data.constraints.length, 3),
    label: `Constraints (${data.constraints.length} identified)`,
    impact: data.constraints.length >= 2 ? "positive" : data.constraints.length > 0 ? "neutral" : "negative",
  }

  drivers.alternatives = {
    score: scoreFromLength(data.alternatives.length, 3),
    label: `Alternatives (${data.alternatives.length} considered)`,
    impact: data.alternatives.length >= 2 ? "positive" : data.alternatives.length > 0 ? "neutral" : "negative",
  }

  drivers.risks = {
    score: scoreRiskProfile(data.risks),
    label: `Risk profile (${data.risks.length} assessed)`,
    impact: data.risks.length >= 3 ? "positive" : data.risks.length > 0 ? "neutral" : "negative",
  }

  drivers.scenarios = {
    score: scoreFromLength(data.businessScenarioCount, 3),
    label: `Scenarios (${data.businessScenarioCount} created)`,
    impact: data.businessScenarioCount >= 3 ? "positive" : data.businessScenarioCount > 0 ? "neutral" : "negative",
  }

  return drivers
}
