// ─── Unit Test: Eval Gate (content-based) ───
// Tests evalGate() — the content-based quality gate function.
// The module has server-side imports but evalGate() itself is pure logic.

import { describe, expect, it } from "@jest/globals"
import { evalGate } from "@/lib/core/ai/eval-gate"

describe("Eval Gate — content-based evalGate()", () => {
  it("passes when all requirements met", async () => {
    const result = await evalGate({
      content: "This is a long enough response with the right keyword.",
      minLength: 20,
      requiredKeywords: ["keyword"],
    })
    expect(result.passed).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it("fails when content too short", async () => {
    const result = await evalGate({
      content: "Short",
      minLength: 20,
    })
    expect(result.passed).toBe(false)
    expect(result.reasons[0]).toContain("too short")
  })

  it("warns about missing keywords", async () => {
    const result = await evalGate({
      content: "Some content without the right words",
      requiredKeywords: ["budget", "approval"],
    })
    // Missing keywords is a warning, not a failure
    expect(result.passed).toBe(true)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain("Missing keywords")
  })

  it("warns about forbidden patterns", async () => {
    const result = await evalGate({
      content: "This has a confidential pattern",
      forbiddenPatterns: [/confidential/i],
    })
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain("forbidden pattern")
  })

  it("fails when content too short AND warns about missing keywords", async () => {
    const result = await evalGate({
      content: "Hi",
      minLength: 100,
      requiredKeywords: ["analysis", "review"],
    })
    expect(result.passed).toBe(false)
    expect(result.reasons.length).toBeGreaterThanOrEqual(1)
    expect(result.warnings.length).toBeGreaterThanOrEqual(1)
  })

  it("handles empty content gracefully", async () => {
    const result = await evalGate({
      content: "",
      minLength: 1,
    })
    expect(result.passed).toBe(false)
    expect(result.reasons[0]).toContain("too short")
  })

  it("handles no constraints passed", async () => {
    const result = await evalGate({ content: "Some content" })
    expect(result.passed).toBe(true)
    expect(result.reasons).toHaveLength(0)
    expect(result.warnings).toHaveLength(0)
  })

  it("checks required fields with regex pattern", async () => {
    const result = await evalGate({
      content: JSON.stringify({ title: "Test", amount: 100 }),
      requiredFields: ["amount"],
    })
    expect(result.passed).toBe(true)
    expect(result.warnings).toHaveLength(0)

    const missing = await evalGate({
      content: JSON.stringify({ title: "Test" }),
      requiredFields: ["amount"],
    })
    expect(missing.warnings.length).toBeGreaterThan(0)
    expect(missing.warnings[0]).toContain("amount")
  })

  it("performs case-insensitive keyword matching", async () => {
    const result = await evalGate({
      content: "BUDGET approval required",
      requiredKeywords: ["budget", "Approval"],
    })
    expect(result.passed).toBe(true)
    expect(result.warnings).toHaveLength(0)
  })

  it("checks multiple forbidden patterns", async () => {
    const result = await evalGate({
      content: "Secret confidential data here",
      forbiddenPatterns: [/secret/i, /confidential/i, /private/i],
    })
    expect(result.warnings.length).toBe(2)
  })
})
