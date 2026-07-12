// ─── Unit Test: Confidence Scorer ───
// Tests calculateConfidence() logic — all pure functions, no mocking needed.

import { describe, expect, it } from "@jest/globals"
import { calculateConfidence, confidenceLabel } from "@/lib/core/ai/confidence-scorer"

describe("Confidence Scorer", () => {
  it("returns high confidence for complete responses with many sources", () => {
    const result = calculateConfidence({
      modelProvider: "claude-4",
      responseTimeMs: 8000,
      sourceCount: 5,
      hasAllRequiredFields: true,
      responseLength: 2000,
      expectedMinLength: 500,
    })
    expect(result.score).toBeGreaterThanOrEqual(0.85)
    expect(["high", "very_high"]).toContain(result.level)
  })

  it("returns low confidence for incomplete responses with no sources", () => {
    const result = calculateConfidence({
      modelProvider: "unknown",
      responseTimeMs: 500,
      sourceCount: 0,
      hasAllRequiredFields: false,
      responseLength: 100,
      expectedMinLength: 1000,
    })
    expect(result.score).toBeLessThan(0.5)
    expect(result.level).toBe("low")
  })

  it("returns 5 factors in result", () => {
    const result = calculateConfidence({
      modelProvider: "gpt-4",
      responseTimeMs: 3000,
      sourceCount: 2,
      hasAllRequiredFields: true,
      responseLength: 1000,
      expectedMinLength: 800,
    })
    expect(result.factors).toHaveLength(5)
    expect(result.factors.map(f => f.name)).toEqual([
      "completeness", "sources", "length", "response_time", "provider",
    ])
  })

  it("weights completeness most heavily (weight 0.4)", () => {
    // Same input except completeness toggle
    const base = {
      modelProvider: "claude-sonnet",
      responseTimeMs: 3000,
      sourceCount: 2,
      responseLength: 1000,
      expectedMinLength: 800,
    }
    const complete = calculateConfidence({ ...base, hasAllRequiredFields: true })
    const incomplete = calculateConfidence({ ...base, hasAllRequiredFields: false })
    expect(complete.score).toBeGreaterThan(incomplete.score)
    // Completeness alone (0.4 * 0.7 swing) should create at least 0.28 difference
    expect(complete.score - incomplete.score).toBeGreaterThan(0.25)
  })

  it("returns very_high level at score >= 0.9", () => {
    const result = calculateConfidence({
      modelProvider: "claude-4",
      responseTimeMs: 10000,
      sourceCount: 10,
      hasAllRequiredFields: true,
      responseLength: 5000,
      expectedMinLength: 100,
    })
    expect(result.level).toBe("very_high")
    expect(result.score).toBeGreaterThanOrEqual(0.9)
  })

  it("returns high level at score >= 0.7", () => {
    const result = calculateConfidence({
      modelProvider: "gpt-4",
      responseTimeMs: 3000,
      sourceCount: 3,
      hasAllRequiredFields: true,
      responseLength: 1000,
      expectedMinLength: 800,
    })
    expect(result.level).toBe("high")
    expect(result.score).toBeGreaterThanOrEqual(0.7)
    expect(result.score).toBeLessThan(0.9)
  })

  it("returns medium level at score >= 0.4", () => {
    const result = calculateConfidence({
      modelProvider: "gemini",
      responseTimeMs: 3000,
      sourceCount: 1,
      hasAllRequiredFields: false,
      responseLength: 300,
      expectedMinLength: 500,
    })
    expect(result.level).toBe("medium")
    expect(result.score).toBeGreaterThanOrEqual(0.4)
    expect(result.score).toBeLessThan(0.7)
  })

  it("assigns provider scores correctly", () => {
    const high = calculateConfidence({
      modelProvider: "claude-opus-4", responseTimeMs: 10000, sourceCount: 5,
      hasAllRequiredFields: true, responseLength: 2000, expectedMinLength: 500,
    })
    const mid = calculateConfidence({
      modelProvider: "gpt-4", responseTimeMs: 10000, sourceCount: 5,
      hasAllRequiredFields: true, responseLength: 2000, expectedMinLength: 500,
    })
    const low = calculateConfidence({
      modelProvider: "unknown", responseTimeMs: 10000, sourceCount: 5,
      hasAllRequiredFields: true, responseLength: 2000, expectedMinLength: 500,
    })
    // claude-opus should score higher than unknown
    const claudeFactor = high.factors.find(f => f.name === "provider")!
    const unknownFactor = low.factors.find(f => f.name === "provider")!
    expect(claudeFactor.score).toBeGreaterThan(unknownFactor.score)
  })

  describe("confidenceLabel", () => {
    it("returns Arabic label for each level", () => {
      expect(confidenceLabel("low")).toBe("منخفضة")
      expect(confidenceLabel("medium")).toBe("متوسطة")
      expect(confidenceLabel("high")).toBe("عالية")
      expect(confidenceLabel("very_high")).toBe("عالية جداً")
    })
  })
})
