import {
  canGenerateRecommendation,
  getRecommendationAdapter,
  generateGenericRecommendation,
  RecommendationOutcome,
} from "../recommendation-engine"
import type {
  RecommendationInput,
  RecommendationResult,
  RecommendationPrerequisites,
  RecommendationAdapter,
  ScenarioScores,
} from "../recommendation-types"

// ─── Factory helpers ──────────────────────────────────────

function makeScenario(type: string, score: number): ScenarioScores {
  return {
    scenarioType: type,
    feasibilityScore: score,
    financialScore: score,
    capacityScore: score,
    riskScore: 100 - score,
    strategicFitScore: score,
    overallDecisionScore: score,
  }
}

function makeInput(overrides: Partial<RecommendationInput> = {}): RecommendationInput {
  return {
    decisionId: "test-decision-1",
    decisionType: "TENDER" as any,
    scenarioScores: [
      makeScenario("EXPECTED_CASE", 82),
      makeScenario("BEST_CASE", 95),
      makeScenario("WORST_CASE", 45),
    ],
    riskLevel: "LOW" as any,
    strategicFitScore: 75,
    ...overrides,
  }
}

// ─── Tests ────────────────────────────────────────────────

describe("recommendation-engine", () => {
  // ─── canGenerateRecommendation ─────────────────────────

  describe("canGenerateRecommendation", () => {
    it("returns canRun=true when scenario scores exist", () => {
      const input = makeInput()
      const result: RecommendationPrerequisites = canGenerateRecommendation(input)
      expect(result.canRun).toBe(true)
      expect(result.missingInputs).toEqual([])
      expect(result.recommendedNextStep).toContain("ready")
    })

    it("returns canRun=false when scenario scores are empty", () => {
      const input = makeInput({ scenarioScores: [] })
      const result: RecommendationPrerequisites = canGenerateRecommendation(input)
      expect(result.canRun).toBe(false)
      expect(result.missingInputs).toContain("Simulation results required")
      expect(result.recommendedNextStep).toContain("simulation")
    })

    it("works with INVESTMENT decision type", () => {
      const input = makeInput({ decisionType: "INVESTMENT" as any })
      const result: RecommendationPrerequisites = canGenerateRecommendation(input)
      expect(result.canRun).toBe(true)
    })

    it("reports missing strategicFitScore for INVESTMENT type", () => {
      const input = makeInput({ decisionType: "INVESTMENT" as any, strategicFitScore: undefined as any })
      const result: RecommendationPrerequisites = canGenerateRecommendation(input)
      // strategicFitScore is 0 which is falsy, so it reports missing
      expect(result.missingInputs).toContain("Strategic fit score")
      expect(result.canRun).toBe(false)
    })
  })

  // ─── getRecommendationAdapter ──────────────────────────

  describe("getRecommendationAdapter", () => {
    it("returns tender adapter for TENDER type", () => {
      const adapter: RecommendationAdapter = getRecommendationAdapter("TENDER")
      expect(adapter.name).toBe("Tender Recommendation")
    })

    it("returns investment adapter for INVESTMENT type", () => {
      const adapter: RecommendationAdapter = getRecommendationAdapter("INVESTMENT")
      expect(adapter.name).toBe("Investment Recommendation")
    })

    it("returns strategic adapter for STRATEGIC type", () => {
      const adapter: RecommendationAdapter = getRecommendationAdapter("STRATEGIC")
      expect(adapter.name).toBe("Strategic Recommendation")
    })

    it("returns hiring adapter for HIRING type", () => {
      const adapter: RecommendationAdapter = getRecommendationAdapter("HIRING")
      expect(adapter.name).toBe("Hiring Recommendation")
    })

    it("returns generic adapter for unknown decision type", () => {
      const adapter: RecommendationAdapter = getRecommendationAdapter("CUSTOM")
      expect(adapter.name).toBe("Generic Recommendation")
    })

    it("returns generic adapter for EXTENSION type", () => {
      const adapter: RecommendationAdapter = getRecommendationAdapter("EXPANSION")
      expect(adapter.name).toBe("Generic Recommendation")
    })
  })

  // ─── generateGenericRecommendation ─────────────────────

  describe("generateGenericRecommendation", () => {
    it("returns full RecommendationResult structure", () => {
      const input = makeInput()
      const result: RecommendationResult = generateGenericRecommendation(input)

      expect(result).toHaveProperty("outcome")
      expect(result).toHaveProperty("confidence")
      expect(result).toHaveProperty("recommendedAction")
      expect(result).toHaveProperty("rationale")
      expect(result).toHaveProperty("expectedNextState")
      expect(result).toHaveProperty("scopeExclusions")
      expect(result).toHaveProperty("assumptionsUsed")
      expect(result).toHaveProperty("risksAccepted")
      expect(result).toHaveProperty("risksRejected")
      expect(result).toHaveProperty("humanReviewRequired")
      expect(result).toHaveProperty("nextActions")
      expect(Array.isArray(result.nextActions)).toBe(true)
    })

    it("returns GO outcome for high score", () => {
      const input = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 90),
          makeScenario("BEST_CASE", 98),
          makeScenario("WORST_CASE", 60),
        ],
        riskLevel: "LOW" as any,
      })
      const result = generateGenericRecommendation(input)
      expect(result.outcome).toBe(RecommendationOutcome.GO)
    })

    it("returns NO_GO outcome for low score", () => {
      const input = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 25),
          makeScenario("BEST_CASE", 40),
          makeScenario("WORST_CASE", 10),
        ],
        riskLevel: "HIGH" as any,
      })
      const result = generateGenericRecommendation(input)
      expect(result.outcome).toBe(RecommendationOutcome.NO_GO)
    })

    it("returns GO_WITH_CONDITIONS for medium score", () => {
      const input = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 60),
          makeScenario("BEST_CASE", 80),
          makeScenario("WORST_CASE", 35),
        ],
        riskLevel: "MEDIUM" as any,
      })
      const result = generateGenericRecommendation(input)
      expect(result.outcome).toBe(RecommendationOutcome.GO_WITH_CONDITIONS)
    })

    it("returns DEFER for moderate low score", () => {
      const input = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 45),
          makeScenario("BEST_CASE", 65),
          makeScenario("WORST_CASE", 20),
        ],
        riskLevel: "MEDIUM" as any,
      })
      const result = generateGenericRecommendation(input)
      expect(result.outcome).toBe(RecommendationOutcome.DEFER)
    })

    it("returns NEEDS_MORE_DATA when missing inputs present", () => {
      const input = makeInput({
        decisionType: "CUSTOM" as any,
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 90),
          makeScenario("BEST_CASE", 95),
          makeScenario("WORST_CASE", 80),
        ],
        riskLevel: "LOW" as any,
        missingInputs: ["Budget approval"],
      })
      const result = generateGenericRecommendation(input)
      expect(result.outcome).toBe(RecommendationOutcome.NEEDS_MORE_DATA)
    })

    it("computes confidence from scenario variance", () => {
      // Low variance → high confidence
      const lowVarianceInput = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 85),
          makeScenario("BEST_CASE", 88),
          makeScenario("WORST_CASE", 80),
        ],
      })
      const lowResult = generateGenericRecommendation(lowVarianceInput)
      expect(lowResult.confidence).toBeGreaterThanOrEqual(70)

      // High variance → lower confidence
      const highVarianceInput = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 60),
          makeScenario("BEST_CASE", 95),
          makeScenario("WORST_CASE", 20),
        ],
      })
      const highResult = generateGenericRecommendation(highVarianceInput)
      expect(highResult.confidence).toBeLessThan(70)
    })
  })

  // ─── Each adapter returns expected structure ───────────

  describe("adapter output structures", () => {
    const adapters: { type: string; expectedName: string }[] = [
      { type: "TENDER", expectedName: "Tender" },
      { type: "INVESTMENT", expectedName: "Investment" },
      { type: "STRATEGIC", expectedName: "Strategic" },
      { type: "HIRING", expectedName: "Hiring" },
      { type: "CUSTOM", expectedName: "Generic" },
    ]

    it.each(adapters)(" adapter returns full RecommendationResult", ({ type }) => {
      const input = makeInput({ decisionType: type as any })
      const result = generateGenericRecommendation(input)
      expect(result.outcome).toBeDefined()
      expect(typeof result.confidence).toBe("number")
      expect(typeof result.recommendedAction).toBe("string")
      expect(result.recommendedAction.length).toBeGreaterThan(0)
      expect(typeof result.rationale).toBe("string")
      expect(result.rationale.length).toBeGreaterThan(0)
      expect(typeof result.expectedNextState).toBe("string")
      expect(result.expectedNextState.length).toBeGreaterThan(0)
      expect(typeof result.scopeExclusions).toBe("string")
      expect(typeof result.assumptionsUsed).toBe("string")
      expect(typeof result.risksAccepted).toBe("string")
      expect(typeof result.risksRejected).toBe("string")
      expect(typeof result.humanReviewRequired).toBe("boolean")
      expect(Array.isArray(result.nextActions)).toBe(true)
      expect(result.nextActions.length).toBeGreaterThan(0)
    })

    it("tender adapter recommendedAction mentions tender", () => {
      const input = makeInput({ decisionType: "TENDER" as any })
      const result = generateGenericRecommendation(input)
      expect(result.recommendedAction.toLowerCase()).toContain("tender")
    })

    it("investment adapter recommendedAction mentions investment", () => {
      const input = makeInput({ decisionType: "INVESTMENT" as any })
      const result = generateGenericRecommendation(input)
      expect(result.recommendedAction.toLowerCase()).toContain("investment")
    })

    it("strategic adapter recommendedAction mentions strategic", () => {
      const input = makeInput({ decisionType: "STRATEGIC" as any })
      const result = generateGenericRecommendation(input)
      expect(result.recommendedAction.toLowerCase()).toContain("strategic")
    })

    it("hiring adapter recommendedAction mentions hiring", () => {
      const input = makeInput({ decisionType: "HIRING" as any })
      const result = generateGenericRecommendation(input)
      expect(result.recommendedAction.toLowerCase()).toContain("hiring")
    })
  })

  // ─── Edge cases ────────────────────────────────────────

  describe("edge cases", () => {
    it("handles missing scenarioScores gracefully via generic adapter fallback", () => {
      const input = makeInput({ decisionType: "CUSTOM" as any, scenarioScores: [] })
      const result = generateGenericRecommendation(input)
      // Generic adapter does not throw on empty scenarioScores
      expect(result).toBeDefined()
      expect(typeof result.outcome).toBe("string")
    })

    it("handles all Prisma DecisionType enum values without throwing", () => {
      const types = ["TENDER", "INVESTMENT", "EXPANSION", "PROCUREMENT", "HIRING", "PARTNERSHIP", "PRICING", "STRATEGIC", "OPERATIONS", "CUSTOM"]
      for (const type of types) {
        const input = makeInput({ decisionType: type as any })
        expect(() => generateGenericRecommendation(input)).not.toThrow()
      }
    })

    it("confidence is 50 when scenarioTypes are missing", () => {
      const input = makeInput({
        scenarioScores: [
          // Only EXPECTED_CASE — confidenceFromScores won't find BEST / WORST
          makeScenario("EXPECTED_CASE", 75),
        ],
      })
      const result = generateGenericRecommendation(input)
      expect(result.confidence).toBe(50)
    })

    it("humanReviewRequired is false for GO outcome, true otherwise", () => {
      const goInput = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 90),
          makeScenario("BEST_CASE", 95),
          makeScenario("WORST_CASE", 80),
        ],
      })
      expect(generateGenericRecommendation(goInput).humanReviewRequired).toBe(false)

      const noGoInput = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 30),
          makeScenario("BEST_CASE", 50),
          makeScenario("WORST_CASE", 10),
        ],
      })
      expect(generateGenericRecommendation(noGoInput).humanReviewRequired).toBe(true)
    })

    it("nextActions adapt to outcome and risk level", () => {
      const goLowRisk = makeInput({
        scenarioScores: [
          makeScenario("EXPECTED_CASE", 90),
          makeScenario("BEST_CASE", 95),
          makeScenario("WORST_CASE", 80),
        ],
        riskLevel: "LOW" as any,
      })
      const goResult = generateGenericRecommendation(goLowRisk)
      expect(goResult.nextActions).toContain("Proceed with execution plan")

      const noGoResult = generateGenericRecommendation(
        makeInput({
          scenarioScores: [
            makeScenario("EXPECTED_CASE", 20),
            makeScenario("BEST_CASE", 30),
            makeScenario("WORST_CASE", 5),
          ],
        })
      )
      expect(noGoResult.nextActions).toContain("Do not proceed at this time")
    })
  })
})

