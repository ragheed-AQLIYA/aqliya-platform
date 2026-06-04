import { chunkText } from "../ingestion/ingestion-pipeline"

describe("IngestionPipeline", () => {
  describe("chunkText", () => {
    it("returns empty array for empty text", () => {
      expect(chunkText("")).toEqual([])
      expect(chunkText("   ")).toEqual([])
    })

    it("returns single chunk for short text", () => {
      const result = chunkText("Short text.")
      expect(result).toHaveLength(1)
      expect(result[0]).toBe("Short text.")
    })

    it("splits text at paragraph boundaries (paragraph strategy)", () => {
      const text = "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
      const result = chunkText(text)
      expect(result.length).toBeGreaterThanOrEqual(3)
      expect(result[0]).toContain("First")
      expect(result[1]).toContain("Second")
    })

    it("respects chunk size with sentence strategy", () => {
      const sentences = Array.from({ length: 50 }, (_, i) => `Sentence number ${i + 1} has some words.`)
      const text = sentences.join(" ")
      const result = chunkText(text, { strategy: "sentence", chunkSize: 200, chunkOverlap: 20 })
      expect(result.length).toBeGreaterThan(1)
      for (const chunk of result) {
        expect(chunk.length).toBeLessThanOrEqual(220)
      }
    })

    it("applies chunk overlap correctly", () => {
      const text = "A long text that should be split into multiple chunks with overlap between them. " +
        "This is the second part of the text that continues the discussion about overlap. " +
        "Finally this is a third section that rounds out the text with additional content."
      const result = chunkText(text, { strategy: "sentence", chunkSize: 150, chunkOverlap: 30 })
      if (result.length > 1) {
        const overlapText = result[0].slice(-20).trim()
        const hasOverlap = result[1].includes(overlapText)
        expect(hasOverlap).toBe(true)
      }
    })

    it("works with fixed strategy", () => {
      const text = "A".repeat(500)
      const result = chunkText(text, { strategy: "fixed", chunkSize: 100, chunkOverlap: 10 })
      expect(result.length).toBeGreaterThanOrEqual(5)
      for (const chunk of result) {
        expect(chunk.length).toBeLessThanOrEqual(100)
      }
    })

    it("produces consistent results for same input", () => {
      const text = "This is a test document.\n\nIt has multiple paragraphs.\n\nEach should become a chunk."
      const result1 = chunkText(text)
      const result2 = chunkText(text)
      expect(result1).toEqual(result2)
    })
  })
})
