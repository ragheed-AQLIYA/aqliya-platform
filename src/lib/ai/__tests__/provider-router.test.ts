import { selectOptimalProvider, invalidateHealthCache, getAllProviderHealth } from "../provider-router"

describe("ProviderRouter", () => {
  beforeEach(() => {
    invalidateHealthCache()
  })

  describe("selectOptimalProvider", () => {
    it("returns deterministic when ai.real-providers is off", async () => {
      const decision = await selectOptimalProvider("financial_analysis")
      expect(decision.selected).toBe("deterministic")
      expect(decision.reason).toContain("feature flag is off")
      expect(decision.costEstimate).toBe(0)
    })
  })

  describe("getAllProviderHealth", () => {
    it("returns health for all providers", async () => {
      const health = await getAllProviderHealth()
      expect(health.length).toBe(4)
      health.forEach(h => {
        expect(["openai", "anthropic", "cloud", "deterministic"]).toContain(h.providerId)
        expect(h.lastCheck).toBeDefined()
      })
      const det = health.find(h => h.providerId === "deterministic")
      expect(det).toBeDefined()
    })
  })
})
