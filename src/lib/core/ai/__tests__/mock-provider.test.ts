// ─── MockAIProvider Tests ───

import { mockProvider } from "../providers/mock-provider"
import type { AIRequest } from "../types"

function makeRequest(overrides: Partial<AIRequest> = {}): AIRequest {
  return {
    taskType: "office_ai_document_summary" as never,
    taskInput: {},
    governanceContext: { organizationId: "org-1" } as never,
    assembledPrompt: {
      layers: [],
      fullPrompt: overrides.assembledPrompt?.fullPrompt ?? "# مساعد المهام المكتبية — تلخيص المستندات\n## المهمة\n- عنوان المهمة: تقرير سنوي\n- نوع المهمة: تلخيص المستندات\n- تعليمات إضافية: ركز على الإيرادات",
    },
    organizationId: "org-1",
    ...overrides,
  }
}

describe("MockAIProvider", () => {
  describe("provider identity", () => {
    it("has providerId 'mock'", () => {
      expect(mockProvider.providerId).toBe("mock")
    })

    it("is always available", async () => {
      expect(await mockProvider.isAvailable()).toBe(true)
    })

    it("returns available status", () => {
      const status = mockProvider.getStatus()
      expect(status.available).toBe(true)
      expect(status.providerId).toBe("mock")
      expect(status.configured).toBe(true)
    })
  })

  describe("execute", () => {
    it("returns a valid AIResponse", async () => {
      const response = await mockProvider.execute(makeRequest())
      expect(response).toHaveProperty("output")
      expect(response).toHaveProperty("confidence")
      expect(response).toHaveProperty("providerId", "mock")
      expect(response).toHaveProperty("modelVersion")
      expect(response).toHaveProperty("warnings")
      expect(typeof response.output).toBe("string")
      expect(response.output.length).toBeGreaterThan(0)
    })

    it("includes a trust disclaimer warning", async () => {
      const response = await mockProvider.execute(makeRequest())
      expect(response.warnings.some((w) => w.includes("محاكاة") || w.includes("simulated"))).toBe(true)
    })

    it("produces Arabic document summary", async () => {
      const response = await mockProvider.execute(
        makeRequest({
          assembledPrompt: {
            layers: [],
            fullPrompt: "# مساعد المهام المكتبية — تلخيص المستندات\n## المهمة\n- عنوان المهمة: تقرير سنوي\n- نوع المهمة: تلخيص المستندات",
          },
        }),
      )
      expect(response.output).toContain("ملخص المستند")
      expect(response.output).toContain("النقاط الرئيسية")
    })

    it("produces English document summary", async () => {
      const response = await mockProvider.execute(
        makeRequest({
          assembledPrompt: {
            layers: [],
            fullPrompt: "# Office AI Assistant — Document Summary\n## Task\n- Title: Annual Report\n- Type: Document Summary",
          },
        }),
      )
      expect(response.output).toContain("Document Summary")
      expect(response.output).toContain("Key Points")
    })

    it("produces data analysis for excel_analysis task", async () => {
      const response = await mockProvider.execute(
        makeRequest({
          taskType: "office_ai_excel_analysis" as never,
          assembledPrompt: {
            layers: [],
            fullPrompt: "# مساعد المهام المكتبية — تحليل بيانات الجداول\n## المهمة\n- عنوان المهمة: تحليل مبيعات\n- نوع المهمة: تحليل بيانات الجداول",
          },
        }),
      )
      // Should contain Arabic analysis keywords
      expect(response.output).toContain("تحليل")
    })

    it("produces report structure for report_draft task", async () => {
      const response = await mockProvider.execute(
        makeRequest({
          taskType: "office_ai_report_draft" as never,
          assembledPrompt: {
            layers: [],
            fullPrompt: "# Office AI Assistant — Report Draft\n## Task\n- Title: Q4 Report\n- Type: Report Draft",
          },
        }),
      )
      expect(response.output).toContain("Executive Summary")
      expect(response.output).toContain("Introduction")
    })

    it("produces presentation outline", async () => {
      const response = await mockProvider.execute(
        makeRequest({
          taskType: "office_ai_presentation_outline" as never,
          assembledPrompt: {
            layers: [],
            fullPrompt: "# مساعد المهام المكتبية — هيكل عرض تقديمي\n## المهمة\n- عنوان المهمة: عرض استراتيجي",
          },
        }),
      )
      expect(response.output).toContain("الشريحة 1")
    })

    it("produces meeting notes", async () => {
      const response = await mockProvider.execute(
        makeRequest({
          taskType: "office_ai_meeting_notes" as never,
          assembledPrompt: {
            layers: [],
            fullPrompt: "# Office AI Assistant — Meeting Notes\n## Task\n- Title: Board Meeting\n- Type: Meeting Notes",
          },
        }),
      )
      expect(response.output).toContain("Meeting Notes")
      expect(response.output).toContain("Attendees")
    })

    it("produces executive summary", async () => {
      const response = await mockProvider.execute(
        makeRequest({
          taskType: "office_ai_executive_summary" as never,
          assembledPrompt: {
            layers: [],
            fullPrompt: "# مساعد المهام المكتبية — ملخص تنفيذي\n## المهمة\n- عنوان المهمة: ملخص ربع سنوي",
          },
        }),
      )
      expect(response.output).toContain("الملخص التنفيذي")
      expect(response.output).toContain("النتائج الرئيسية")
    })

    it("simulates realistic latency", async () => {
      const start = Date.now()
      await mockProvider.execute(makeRequest())
      const elapsed = Date.now() - start
      // Should be >= 800ms (mock latency) but allow some tolerance
      expect(elapsed).toBeGreaterThanOrEqual(700)
    })

    it("includes token usage metadata", async () => {
      const response = await mockProvider.execute(makeRequest())
      expect(response.tokenUsage).toBeDefined()
      expect(response.tokenUsage!.input).toBeGreaterThan(0)
      expect(response.tokenUsage!.output).toBeGreaterThan(0)
      expect(response.metadata.simulated).toBe(true)
    })
  })

  describe("stream", () => {
    it("returns a readable stream", async () => {
      const stream = await mockProvider.stream(makeRequest())
      expect(stream).toBeInstanceOf(ReadableStream)

      const reader = stream.getReader()
      const result = await reader.read()
      expect(result.done).toBe(false)
      expect(result.value).toBeInstanceOf(Uint8Array)
    })
  })
})
