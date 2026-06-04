import { describe, expect, it } from "@jest/globals";
import { classifyTask, getCategoryLabel, TASK_CATEGORIES } from "@/lib/office-ai/taxonomy";

describe("Office AI taxonomy", () => {
  describe("classifyTask", () => {
    it("classifies summarization task types", () => {
      for (const t of TASK_CATEGORIES.summarization.taskTypes) {
        expect(classifyTask(t)).toBe("summarization");
      }
    });

    it("classifies content_creation task types", () => {
      for (const t of TASK_CATEGORIES.content_creation.taskTypes) {
        expect(classifyTask(t)).toBe("content_creation");
      }
    });

    it("classifies analysis task types", () => {
      for (const t of TASK_CATEGORIES.analysis.taskTypes) {
        expect(classifyTask(t)).toBe("analysis");
      }
    });

    it("falls back to analysis for unknown task type", () => {
      expect(classifyTask("unknown")).toBe("analysis");
    });
  });

  describe("getCategoryLabel", () => {
    it("returns Arabic label for summarization", () => {
      expect(getCategoryLabel("summarize", "ar")).toBe("تلخيص");
    });

    it("returns English label for summarization", () => {
      expect(getCategoryLabel("summarize", "en")).toBe("Summarization");
    });

    it("returns Arabic label for content_creation", () => {
      expect(getCategoryLabel("draft", "ar")).toBe("إنشاء محتوى");
    });

    it("returns Arabic label for analysis", () => {
      expect(getCategoryLabel("analyze", "ar")).toBe("تحليل");
    });

    it("defaults to Arabic when locale omitted", () => {
      expect(getCategoryLabel("summarize")).toBe("تلخيص");
    });
  });
});
