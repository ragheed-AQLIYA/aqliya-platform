// ─── Office AI Prompt Builder Tests ───

import {
  buildOfficeAiPrompt,
  taskTypeToUseCase,
  getOfficeAiPromptVersion,
  type OfficeAiTaskType,
} from "../prompts"

const baseInput = {
  taskType: "document_summary" as OfficeAiTaskType,
  language: "ar" as const,
  title: "ملخص التقرير السنوي",
  instructions: "ركز على البيانات المالية",
  fileContext: "بلغت الإيرادات 5 ملايين ريال في 2024",
  fileNames: ["تقرير-2024.pdf", "ميزانية-2024.xlsx"],
}

describe("buildOfficeAiPrompt", () => {
  describe("Arabic prompts", () => {
    it("includes task role header", () => {
      const prompt = buildOfficeAiPrompt(baseInput)
      expect(prompt).toContain("مساعد المهام المكتبية")
      expect(prompt).toContain("تلخيص المستندات")
    })

    it("includes task metadata", () => {
      const prompt = buildOfficeAiPrompt(baseInput)
      expect(prompt).toContain("ملخص التقرير السنوي")
      expect(prompt).toContain("ركز على البيانات المالية")
    })

    it("includes file names and content", () => {
      const prompt = buildOfficeAiPrompt(baseInput)
      expect(prompt).toContain("تقرير-2024.pdf")
      expect(prompt).toContain("ميزانية-2024.xlsx")
      expect(prompt).toContain("5 ملايين ريال")
    })

    it("includes trust principle", () => {
      const prompt = buildOfficeAiPrompt(baseInput)
      expect(prompt).toContain("الذكاء يساعد")
      expect(prompt).toContain("الإنسان يقرر")
    })

    it("includes output format instructions", () => {
      const prompt = buildOfficeAiPrompt(baseInput)
      expect(prompt).toContain("صيغة المخرجات")
      expect(prompt).toContain("الفكرة الرئيسية")
    })

    it("includes conversation snippet when provided", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        conversationSnippet: "[مخرجات سابقة: تحليل الإيرادات]",
      })
      expect(prompt).toContain("سياق المهام السابقة")
      expect(prompt).toContain("تحليل الإيرادات")
    })

    it("generates type-specific instructions for excel_analysis", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        taskType: "excel_analysis",
        title: "تحليل المبيعات",
      })
      expect(prompt).toContain("تحليل بيانات الجداول")
      expect(prompt).toContain("رؤى رئيسية")
      expect(prompt).toContain("أرقام بارزة")
    })

    it("generates type-specific instructions for report_draft", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        taskType: "report_draft",
        title: "تقرير المراجعة",
      })
      expect(prompt).toContain("مسودة تقرير")
      expect(prompt).toContain("ملخص تنفيذي")
      expect(prompt).toContain("نتائج وتحليل")
    })

    it("generates type-specific instructions for meeting_notes", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        taskType: "meeting_notes",
        title: "محضر الاجتماع",
      })
      expect(prompt).toContain("محضر اجتماع")
      expect(prompt).toContain("الحضور")
      expect(prompt).toContain("الموضوعات")
      expect(prompt).toContain("جدول")
    })

    it("handles empty instructions gracefully", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        instructions: null,
      })
      expect(prompt).toContain("ملخص التقرير السنوي")
      expect(prompt).not.toContain("تعليمات إضافية")
    })

    it("handles empty files gracefully", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        fileNames: [],
        fileContext: undefined,
      })
      expect(prompt).toContain("ملخص التقرير السنوي")
      expect(prompt).not.toContain("الملفات المرفقة")
    })
  })

  describe("English prompts", () => {
    it("produces English content", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        language: "en",
        title: "Annual Report Summary",
      })
      expect(prompt).toContain("Office AI Assistant")
      expect(prompt).toContain("Document Summary")
      expect(prompt).toContain("Annual Report Summary")
      expect(prompt).toContain("AI assists. Humans decide.")
    })

    it("generates type-specific English instructions", () => {
      const prompt = buildOfficeAiPrompt({
        ...baseInput,
        language: "en",
        taskType: "presentation_outline",
        title: "Sales Deck",
      })
      expect(prompt).toContain("Presentation Outline")
      expect(prompt).toContain("title slide")
      expect(prompt).toContain("agenda")
    })
  })

  describe("taskTypeToUseCase", () => {
    it("maps all 6 task types to use case keys", () => {
      const types: OfficeAiTaskType[] = [
        "excel_analysis",
        "document_summary",
        "report_draft",
        "presentation_outline",
        "executive_summary",
        "meeting_notes",
      ]
      for (const t of types) {
        const key = taskTypeToUseCase(t)
        expect(key).toContain("office_ai_")
        expect(key).toContain(t)
      }
    })
  })

  describe("getOfficeAiPromptVersion", () => {
    it("returns a version string", () => {
      expect(getOfficeAiPromptVersion()).toBe("office-ai-prompts-v1")
    })
  })
})
