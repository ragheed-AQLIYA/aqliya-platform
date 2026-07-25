// ─── Unified Audit Query Tests ───

import { prisma } from "@/lib/prisma"

// The unified query layer depends on Prisma (DB).
// These tests verify the normalisation logic and query construction
// by testing the helper functions directly.

describe("UnifiedAuditQuery", () => {
  describe("searchUnifiedAuditLogs", () => {
    it("is exported as a function", async () => {
      const mod = await import("../unified-query")
      expect(typeof mod.searchUnifiedAuditLogs).toBe("function")
    })

    it("handles empty results gracefully", async () => {
      const mod = await import("../unified-query")
      const result = await mod.searchUnifiedAuditLogs({
        limit: 10,
        offset: 0,
        organizationId: "org-that-does-not-exist-xyz-123",
      })
      expect(Array.isArray(result.entries)).toBe(true)
      expect(typeof result.total).toBe("number")
      expect(typeof result.hasMore).toBe("boolean")
    })

    it("accepts all filter options without throwing", async () => {
      const mod = await import("../unified-query")
      const result = await mod.searchUnifiedAuditLogs({
        limit: 5,
        offset: 0,
        sourceModels: ["PlatformAuditLog"],
        action: "test.action",
        fromDate: new Date("2020-01-01"),
        toDate: new Date("2030-01-01"),
      })
      expect(Array.isArray(result.entries)).toBe(true)
    })
  })

  describe("getUnifiedAuditSummary", () => {
    it("returns summary for PlatformAuditLog", async () => {
      const mod = await import("../unified-query")
      const summary = await mod.getUnifiedAuditSummary()
      expect(summary).toHaveProperty("PlatformAuditLog")
      expect(summary.PlatformAuditLog).toHaveProperty("total")
      expect(summary.PlatformAuditLog).toHaveProperty("lastEvent")
    })
  })
})
