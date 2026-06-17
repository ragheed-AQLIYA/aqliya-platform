import { getModelCost, calculateCost } from "../cost-mapping"

describe("SpendTracker", () => {
  describe("getModelCost", () => {
    it("returns cost for supported models", () => {
      const cost = getModelCost("gpt-4o")
      expect(cost).not.toBeNull()
      expect(cost!.inputCostPer1K).toBe(0.0025)
      expect(cost!.outputCostPer1K).toBe(0.01)
    })

    it("returns cost for claude-sonnet-4", () => {
      const cost = getModelCost("claude-sonnet-4-20250514")
      expect(cost).not.toBeNull()
      expect(cost!.inputCostPer1K).toBe(0.003)
    })

    it("returns null for unknown models", () => {
      const cost = getModelCost("unknown-model")
      expect(cost).toBeNull()
    })
  })

  describe("calculateCost", () => {
    it("calculates correct cost for gpt-4o", () => {
      const cost = calculateCost(1000, 500, "gpt-4o")
      expect(cost.inputCost).toBe(0.0025)
      expect(cost.outputCost).toBe(0.005)
      expect(cost.totalCost).toBe(0.0075)
    })

    it("returns 0 for unknown model", () => {
      const cost = calculateCost(1000, 500, "unknown")
      expect(cost.totalCost).toBe(0)
    })
  })
})
