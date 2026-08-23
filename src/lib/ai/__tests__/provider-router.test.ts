import { selectOptimalProvider, invalidateHealthCache, getAllProviderHealth } from "@/lib/core/ai/provider-router"

describe("ProviderRouter", () => {
  const savedEnv = process.env.FF_AI_REAL_PROVIDERS

  beforeEach(() => {
    invalidateHealthCache()
    // Explicitly disable real providers to test deterministic fallback
    process.env.FF_AI_REAL_PROVIDERS = "false"
  })

  afterEach(() => {
    if (savedEnv === undefined) delete process.env.FF_AI_REAL_PROVIDERS
    else process.env.FF_AI_REAL_PROVIDERS = savedEnv
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
      expect(health.length).toBe(6)
      health.forEach(h => {
        expect(["openai", "anthropic", "local", "cloud", "mock", "deterministic"]).toContain(h.providerId)
        expect(h.lastCheck).toBeDefined()
      })
      const det = health.find(h => h.providerId === "deterministic")
      expect(det).toBeDefined()
    })
  })
})
