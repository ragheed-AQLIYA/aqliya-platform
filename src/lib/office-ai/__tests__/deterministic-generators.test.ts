// ─── Deterministic Generator Tests ───
// Covers all 6 task type generators and the router function.

import {
  generateDeterministicOfficeAiOutput,
  type FileWithContent,
} from "../deterministic-generators"

const baseTask = {
  id: "test-task-001",
  title: "مهمة اختبار",
  taskType: "document_summary",
  instructions: "يرجى تلخيص المستند",
  language: "ar",
  createdByName: "مستخدم اختبار",
}

const sampleFiles: FileWithContent[] = [
  {
    filename: "تقرير-2024.pdf",
    fileType: "pdf",
    extractedContent:
      "هذا نص تجريبي من ملف التقرير السنوي للعام 2024 يحتوي على بيانات مالية وإحصاءات.",
    extractionStatus: "completed",
  },
  {
    filename: "data.csv",
    fileType: "csv",
    extractedContent: "السنة,الإيرادات,الأرباح\n2024,5000000,1200000",
    extractionStatus: "completed",
  },
]

describe("DeterministicOfficeAiOutput", () => {
  describe("generateDocumentSummary", () => {
    it("produces Arabic markdown with header and file content", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, title: "ملخص التقرير السنوي" },
        sampleFiles,
      )
      expect(result.format).toBe("markdown")
      expect(result.content).toContain("ملخص التقرير السنوي")
      expect(result.content).toContain("ملخص المستند")
      expect(result.content).toContain("تقرير-2024.pdf")
      expect(result.content).toContain("مسودة أولية تحتاج مراجعة بشرية")
    })

    it("works with English language", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, language: "en", title: "Annual Report Summary" },
        sampleFiles,
      )
      expect(result.content).toContain("Annual Report Summary")
      expect(result.content).toContain("Document Summary")
      expect(result.content).toContain("Initial draft requiring human review")
    })

    it("handles no files gracefully", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, title: "ملخص" },
        [],
      )
      expect(result.content).toContain("ملخص")
      expect(result.content).toContain("لا توجد ملفات مصدر مرفقة بعد")
    })
  })

  describe("generateExcelAnalysis", () => {
    it("produces Arabic data analysis with CSV content", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "excel_analysis", title: "تحليل الإيرادات" },
        sampleFiles,
      )
      expect(result.content).toContain("تحليل الإيرادات")
      expect(result.content).toContain("تحليل البيانات")
      expect(result.content).toContain("data.csv")
    })

    it("shows no-CSV message when no CSV files", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "excel_analysis" },
        [{ filename: "report.pdf", fileType: "pdf" }],
      )
      expect(result.content).toContain("لم يتم العثور على ملف CSV")
    })

    it("works in English", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "excel_analysis", language: "en", title: "Revenue Analysis" },
        sampleFiles,
      )
      expect(result.content).toContain("Revenue Analysis")
      expect(result.content).toContain("Data Analysis")
    })
  })

  describe("generateReportDraft", () => {
    it("produces full report structure in Arabic", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "report_draft", title: "تقرير الأداء" },
        sampleFiles,
      )
      expect(result.content).toContain("تقرير الأداء")
      expect(result.content).toContain("الملخص التنفيذي")
      expect(result.content).toContain("المقدمة")
      expect(result.content).toContain("النتائج")
      expect(result.content).toContain("التوصيات")
      expect(result.content).toContain("الخاتمة")
    })

    it("includes file content when available", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "report_draft" },
        sampleFiles,
      )
      expect(result.content).toContain("تقرير-2024.pdf")
      expect(result.content).toContain("بيانات مالية")
    })
  })

  describe("generatePresentationOutline", () => {
    it("produces slide structure in Arabic", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "presentation_outline", title: "عرض المبيعات" },
        sampleFiles,
      )
      expect(result.content).toContain("عرض المبيعات")
      expect(result.content).toContain("هيكل العرض التقديمي")
      expect(result.content).toContain("الشريحة 1")
      expect(result.content).toContain("الشريحة 9")
    })

    it("works in English", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "presentation_outline", language: "en", title: "Sales Deck" },
        [],
      )
      expect(result.content).toContain("Sales Deck")
      expect(result.content).toContain("Slide 1")
      expect(result.content).toContain("Slide 9")
    })
  })

  describe("generateExecutiveSummary", () => {
    it("produces executive summary in Arabic", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "executive_summary", title: "ملخص تنفيذي للمشروع" },
        sampleFiles,
      )
      expect(result.content).toContain("ملخص تنفيذي للمشروع")
      expect(result.content).toContain("الملخص التنفيذي")
      expect(result.content).toContain("نظرة عامة")
      expect(result.content).toContain("النتائج الرئيسية")
      expect(result.content).toContain("التوصيات")
    })
  })

  describe("generateMeetingNotes", () => {
    it("produces meeting notes in Arabic", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "meeting_notes", title: "محضر اجتماع الإدارة" },
        [],
      )
      expect(result.content).toContain("محضر اجتماع الإدارة")
      expect(result.content).toContain("ملخص الاجتماع")
      expect(result.content).toContain("الحضور")
      expect(result.content).toContain("الموضوعات")
      expect(result.content).toContain("القرارات")
      expect(result.content).toContain("العناصر القابلة للتنفيذ")
    })

    it("includes instructions when provided", () => {
      const result = generateDeterministicOfficeAiOutput(
        {
          ...baseTask,
          taskType: "meeting_notes",
          instructions: "مناقشة ميزانية الربع الرابع",
        },
        [],
      )
      expect(result.content).toContain("مناقشة ميزانية الربع الرابع")
    })

    it("works in English", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, taskType: "meeting_notes", language: "en", title: "Board Meeting" },
        [],
      )
      expect(result.content).toContain("Board Meeting")
      expect(result.content).toContain("Meeting Notes Summary")
      expect(result.content).toContain("Attendees")
      expect(result.content).toContain("Action Items")
    })
  })

  describe("router — generateDeterministicOfficeAiOutput", () => {
    it("throws for unsupported task type", () => {
      expect(() =>
        generateDeterministicOfficeAiOutput(
          { ...baseTask, taskType: "unsupported_type" as string },
          [],
        ),
      ).toThrow("Unsupported task type")
    })

    it("supports all 6 valid task types", () => {
      const types = [
        "document_summary",
        "excel_analysis",
        "report_draft",
        "presentation_outline",
        "executive_summary",
        "meeting_notes",
      ]
      for (const taskType of types) {
        const result = generateDeterministicOfficeAiOutput(
          { ...baseTask, taskType, title: `Test ${taskType}` },
          [],
        )
        expect(result.content).toContain(`Test ${taskType}`)
        expect(result.format).toBe("markdown")
      }
    })

    it("always includes the trust disclaimer", () => {
      const result = generateDeterministicOfficeAiOutput(
        { ...baseTask, language: "ar" },
        [],
      )
      expect(result.content).toContain("مسودة أولية تحتاج مراجعة بشرية")
    })
  })
})
