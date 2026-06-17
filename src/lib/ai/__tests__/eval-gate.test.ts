import { evaluateWithGate, getGateThreshold, registerGateThreshold } from "../eval-gate"

describe("EvalGate", () => {
  describe("getGateThreshold", () => {
    it("returns default threshold for unknown suites", () => {
      const t = getGateThreshold("unknown-suite")
      expect(t).toBe(0.67)
    })

    it("returns configured threshold for known suites", () => {
      expect(getGateThreshold("finding-summary-v1")).toBe(1.0)
    })
  })

  describe("registerGateThreshold", () => {
    it("registers new threshold", () => {
      registerGateThreshold("custom-suite", 0.8)
      expect(getGateThreshold("custom-suite")).toBe(0.8)
    })

    it("throws on invalid threshold", () => {
      expect(() => registerGateThreshold("bad", 1.5)).toThrow("Invalid threshold")
      expect(() => registerGateThreshold("bad", -1)).toThrow("Invalid threshold")
    })
  })

  describe("evaluateWithGate", () => {
    it("passes when output matches expected", async () => {
      const result = await evaluateWithGate("fin-analysis-v1", "financial_analysis", "Revenue increased by 45% this year compared to a loss position last year", "org-1")
      expect(result.suiteId).toBe("fin-analysis-v1")
      expect(result.gate).toBe("eval_gate")
      expect(result.totalTests).toBeGreaterThan(0)
      expect(result.passed).toBeDefined()
    })

    it("returns pass-through for unknown suite", async () => {
      const result = await evaluateWithGate("nonexistent", "unknown", "output")
      expect(result.passed).toBe(true)
      expect(result.totalTests).toBe(0)
    })
  })
})
