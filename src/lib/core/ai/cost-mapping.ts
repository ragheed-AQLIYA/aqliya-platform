import "server-only"

export interface ModelCostEntry {
  provider: string
  model: string
  inputCostPer1K: number
  outputCostPer1K: number
  currency: string
}

const MODEL_COST_MAP: Record<string, ModelCostEntry[]> = {
  "gpt-4o": [
    { provider: "openai", model: "gpt-4o", inputCostPer1K: 0.0025, outputCostPer1K: 0.01, currency: "USD" },
  ],
  "gpt-4o-mini": [
    { provider: "openai", model: "gpt-4o-mini", inputCostPer1K: 0.00015, outputCostPer1K: 0.0006, currency: "USD" },
  ],
  "claude-sonnet-4-20250514": [
    { provider: "anthropic", model: "claude-sonnet-4-20250514", inputCostPer1K: 0.003, outputCostPer1K: 0.015, currency: "USD" },
  ],
  "claude-haiku-3-5": [
    { provider: "anthropic", model: "claude-haiku-3-5", inputCostPer1K: 0.0008, outputCostPer1K: 0.004, currency: "USD" },
  ],
}

export function getModelCost(modelVersion: string): ModelCostEntry | null {
  const entries = MODEL_COST_MAP[modelVersion]
  if (!entries || entries.length === 0) return null
  return entries[0]
}

export function calculateCost(inputTokens: number, outputTokens: number, modelVersion: string): {
  inputCost: number
  outputCost: number
  totalCost: number
  currency: string
  model: string
} {
  const costEntry = getModelCost(modelVersion)
  if (!costEntry) {
    return { inputCost: 0, outputCost: 0, totalCost: 0, currency: "USD", model: modelVersion }
  }

  const inputCost = (inputTokens / 1000) * costEntry.inputCostPer1K
  const outputCost = (outputTokens / 1000) * costEntry.outputCostPer1K
  return {
    inputCost: Math.round(inputCost * 100000) / 100000,
    outputCost: Math.round(outputCost * 100000) / 100000,
    totalCost: Math.round((inputCost + outputCost) * 100000) / 100000,
    currency: costEntry.currency,
    model: costEntry.model,
  }
}

export function getSupportedModels(): string[] {
  return Object.keys(MODEL_COST_MAP)
}
