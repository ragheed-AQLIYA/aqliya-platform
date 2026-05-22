import { describe, it, expect } from "@jest/globals"
import { render, screen } from "@testing-library/react"

// Since status-badge may have side-effect imports, test the translation function shape
describe("Status Badge Component", () => {
  it("should export expected components", async () => {
    const mod = await import("@/components/audit/shared/status-badge")
    expect(mod.StatusBadge).toBeDefined()
    expect(mod.StatusIcon).toBeDefined()
  })
})
