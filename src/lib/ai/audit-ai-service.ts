import "server-only"
import { generateAiQualityReport } from "@/lib/core/ai/quality-report"
import { getPromptTemplate } from "./prompt-templates"

export interface AiAuditRequest {
  templateId: string
  inputData: Record<string, unknown>
  modelProvider?: string
}

export interface AiAuditResponse {
  content: string
  confidenceScore: number
  confidenceLevel: string
  evalPassed: boolean
  evalWarnings: string[]
  recommendations: string[]
  modelProvider?: string
  generatedAt: string
}

export async function generateAuditContent(request: AiAuditRequest): Promise<AiAuditResponse> {
  const template = getPromptTemplate(request.templateId)
  if (!template) {
    throw new Error(`Unknown template: ${request.templateId}`)
  }

  const startTime = Date.now()

  // WORKAROUND: Mock AI response for quality pipeline — real provider call planned for v0.2 (see docs/strategy/AQLIYA_STRATEGIC_ROADMAP.md)
  const mockContent = JSON.stringify({
    summary: "تم تحليل البيانات المالية بنجاح",
    ratios: { liquidity: 2.5, profitability: 0.15 },
    findings: ["وجدت بعض الملاحظات على الإفصاحات"],
    recommendations: ["تحسين الإفصاح عن الأطراف ذات العلاقة"],
  })

  const responseTimeMs = Date.now() - startTime

  const qualityReport = await generateAiQualityReport(mockContent, {
    modelProvider: request.modelProvider ?? "claude-4",
    responseTimeMs,
    sourceCount: Object.keys(request.inputData).length,
    expectedMinLength: template.expectedMinLength,
    requiredFields: template.requiredFields,
    requiredKeywords: template.requiredKeywords,
    forbiddenPatterns: template.forbiddenPatterns,
  })

  return {
    content: mockContent,
    confidenceScore: qualityReport.confidenceScore,
    confidenceLevel: qualityReport.confidenceLevel,
    evalPassed: qualityReport.evalPassed,
    evalWarnings: qualityReport.evalWarnings,
    recommendations: qualityReport.recommendations,
    modelProvider: request.modelProvider ?? "claude-4",
    generatedAt: new Date().toISOString(),
  }
}
