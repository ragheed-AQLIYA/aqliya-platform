import { getEmbeddingType, getFallbackEmbeddingType, resetPgvectorCache } from "../pgvector-compat"

describe("pgvector-compat", () => {
  beforeEach(() => {
    resetPgvectorCache()
    delete process.env.DATABASE_URL
  })

  describe("getEmbeddingType", () => {
    it("returns vector(1536)", () => {
      expect(getEmbeddingType()).toBe("vector(1536)")
    })
  })

  describe("getFallbackEmbeddingType", () => {
    it("returns JSON", () => {
      expect(getFallbackEmbeddingType()).toBe("JSON")
    })
  })

  describe("isPgvectorAvailable (no DATABASE_URL)", () => {
    it("returns false when DATABASE_URL is not set", async () => {
      const { isPgvectorAvailable } = await import("../pgvector-compat")
      const available = await isPgvectorAvailable()
      expect(available).toBe(false)
    })
  })
})
