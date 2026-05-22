import { describe, it, expect } from "@jest/globals"

describe("Engagement Tabs", () => {
  it("should export EngagementTabs", async () => {
    const mod = await import("@/components/audit/engagement/engagement-tabs")
    expect(mod.EngagementTabs).toBeDefined()
  })
})
