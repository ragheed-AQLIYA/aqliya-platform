import { cosineSimilarity } from "../retrieval/similarity-search"

describe("SimilaritySearch", () => {
  describe("cosineSimilarity", () => {
    it("returns 1 for identical vectors", () => {
      const a = [1, 0, 0]
      const b = [1, 0, 0]
      expect(cosineSimilarity(a, b)).toBeCloseTo(1, 10)
    })

    it("returns 0 for orthogonal vectors", () => {
      const a = [1, 0, 0]
      const b = [0, 1, 0]
      expect(cosineSimilarity(a, b)).toBeCloseTo(0, 10)
    })

    it("returns -1 for opposite vectors", () => {
      const a = [1, 0, 0]
      const b = [-1, 0, 0]
      expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 10)
    })

    it("handles vectors with different dimensions", () => {
      const a = [1, 2, 3]
      const b = [1, 2]
      expect(cosineSimilarity(a, b)).toBe(0)
    })

    it("handles zero vectors", () => {
      const a = [0, 0, 0]
      const b = [1, 0, 0]
      expect(cosineSimilarity(a, b)).toBe(0)
    })

    it("computes correct similarity for non-trivial vectors", () => {
      const a = [1, 2, 3]
      const b = [4, 5, 6]
      const dot = 1 * 4 + 2 * 5 + 3 * 6
      const normA = Math.sqrt(1 + 4 + 9)
      const normB = Math.sqrt(16 + 25 + 36)
      const expected = dot / (normA * normB)
      expect(cosineSimilarity(a, b)).toBeCloseTo(expected, 10)
    })

    it("handles 1536-dimensional mock embeddings", () => {
      const dims = 1536
      const a = Array.from({ length: dims }, (_, i) => Math.sin(i))
      const b = Array.from({ length: dims }, (_, i) => Math.cos(i))
      const result = cosineSimilarity(a, b)
      expect(result).toBeGreaterThanOrEqual(-1)
      expect(result).toBeLessThanOrEqual(1)
    })

    it("symmetric (cosine(a,b) === cosine(b,a))", () => {
      const a = [1, 2, 3, 4, 5]
      const b = [5, 4, 3, 2, 1]
      expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a), 10)
    })

    it("returns scores in expected range for mock-like vectors", () => {
      const a = [0.1, 0.2, -0.3, 0.4]
      const b = [0.15, 0.25, -0.25, 0.35]
      const score = cosineSimilarity(a, b)
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(1)
    })
  })
})
