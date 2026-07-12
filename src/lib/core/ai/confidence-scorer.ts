import "server-only"

export interface ConfidenceInput {
  modelProvider?: string
  responseTimeMs: number
  sourceCount: number
  hasAllRequiredFields: boolean
  responseLength: number
  expectedMinLength: number
}

export interface ConfidenceScore {
  score: number
  level: "low" | "medium" | "high" | "very_high"
  factors: ConfidenceFactor[]
}

interface ConfidenceFactor {
  name: string
  weight: number
  score: number
  reason: string
}

export function calculateConfidence(input: ConfidenceInput): ConfidenceScore {
  const factors: ConfidenceFactor[] = []

  const completenessScore = input.hasAllRequiredFields ? 1.0 : 0.3
  factors.push({
    name: "completeness",
    weight: 0.4,
    score: completenessScore,
    reason: input.hasAllRequiredFields
      ? "All required fields present"
      : "Missing required fields",
  })

  const sourceScore = Math.min(input.sourceCount / 5, 1.0)
  factors.push({
    name: "sources",
    weight: 0.2,
    score: sourceScore,
    reason: `${input.sourceCount} source references`,
  })

  const lengthRatio = Math.min(input.responseLength / input.expectedMinLength, 1.0)
  const lengthScore = lengthRatio >= 1 ? 1.0 : lengthRatio
  factors.push({
    name: "length",
    weight: 0.2,
    score: lengthScore,
    reason: `${input.responseLength}/${input.expectedMinLength} chars`,
  })

  const timeScore = input.responseTimeMs > 5000 ? 1.0 : input.responseTimeMs > 2000 ? 0.7 : 0.4
  factors.push({
    name: "response_time",
    weight: 0.1,
    score: timeScore,
    reason: `${input.responseTimeMs}ms response time`,
  })

  let providerScore = 0.7
  if (input.modelProvider?.includes("claude-4") || input.modelProvider?.includes("claude-opus")) {
    providerScore = 0.95
  } else if (input.modelProvider?.includes("claude-sonnet") || input.modelProvider?.includes("gpt-4")) {
    providerScore = 0.85
  } else if (input.modelProvider?.includes("gemini")) {
    providerScore = 0.75
  }
  factors.push({
    name: "provider",
    weight: 0.1,
    score: providerScore,
    reason: input.modelProvider ?? "unknown provider",
  })

  const totalScore = factors.reduce((sum, f) => sum + f.weight * f.score, 0)

  let level: ConfidenceScore["level"]
  if (totalScore >= 0.9) level = "very_high"
  else if (totalScore >= 0.7) level = "high"
  else if (totalScore >= 0.4) level = "medium"
  else level = "low"

  return {
    score: Math.round(totalScore * 100) / 100,
    level,
    factors,
  }
}

export function confidenceLabel(level: ConfidenceScore["level"]): string {
  const labels: Record<ConfidenceScore["level"], { ar: string; en: string }> = {
    low: { ar: "منخفضة", en: "Low" },
    medium: { ar: "متوسطة", en: "Medium" },
    high: { ar: "عالية", en: "High" },
    very_high: { ar: "عالية جداً", en: "Very High" },
  }
  return labels[level].ar
}
