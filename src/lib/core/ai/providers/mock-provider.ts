// ─── MockAIProvider ───
// Simulates real LLM responses for Office AI tasks when no real provider is configured.
// Produces task-type-aware, realistic markdown output based on the prompt content.
// Used when FF_AI_REAL_PROVIDERS=true but no API keys are set.

import type { AIProvider, AIRequest, AIResponse, AIProviderStatus } from "@/lib/core/ai/types"

const MOCK_LATENCY_MS = 800

/**
 * Generate a realistic mock response based on task type and prompt content.
 * Extracts key context from the assembled prompt for plausible output.
 */
function generateMockResponse(request: AIRequest): string {
  const prompt = request.assembledPrompt.fullPrompt
  const taskType = request.taskType

  // Extract key context from prompt
  const titleMatch = prompt.match(/عنوان المهمة: (.+)/i) || prompt.match(/(?:Title|عنوان):\s*(.+)/i)
  const title = titleMatch?.[1]?.trim() ?? "Task"
  const instructionsMatch = prompt.match(/تعليمات إضافية: (.+)/i) || prompt.match(/(?:Instructions|تعليمات):\s*(.+)/i)
  const instructions = instructionsMatch?.[1]?.trim()
  const fileMatch = prompt.match(/محتوى الملفات المستخرج[^]*?(?:$)/)
  const fileContent = fileMatch?.[0]?.slice(0, 500)

  const isArabic = prompt.includes("مساعد المهام المكتبية")
  const lang = isArabic ? "ar" : "en"

  if (taskType.includes("document_summary")) {
    if (isArabic) {
      return `## ملخص المستند

**الملخص التنفيذي:**
${instructions ? `بناءً على التعليمات: ${instructions}` : "تم تحليل المستندات المرفقة واستخراج النقاط الرئيسية."}

**النقاط الرئيسية:**
1. تحليل شامل للبيانات المتاحة يظهر اتجاهاً إيجابياً في المؤشرات الرئيسية
2.存在 فرص للتحسين في عمليات المراجعة الداخلية
3. التوافق مع المعايير التنظيمية في مستوى مقبول
${fileContent ? `\n**مقتطفات من المحتوى:**\n${fileContent.slice(0, 300)}` : ""}

**الخلاصة:**
المستند يقدم معلومات قيمة تتطلب مراجعة بشرية للتأكد من دقة الاستنتاجات.
`
    }
    return `## Document Summary

**Executive Summary:**
${instructions ? `Based on instructions: ${instructions}` : "The attached documents have been analyzed and key points extracted."}

**Key Points:**
1. Overall analysis shows positive trends in key indicators
2. Improvement opportunities identified in internal review processes
3. Regulatory compliance at acceptable levels
${fileContent ? `\n**Content Excerpts:**\n${fileContent.slice(0, 300)}` : ""}

**Conclusion:**
The document provides valuable information requiring human review for accuracy.
`
  }

  if (taskType.includes("excel_analysis")) {
    if (isArabic) {
      return `## تحليل البيانات

**ملخص عام:**
تم تحليل البيانات الجدولية واستخراج المؤشرات الرئيسية.${instructions ? `\n\n**التعليمات:** ${instructions}` : ""}

**الرؤى الرئيسية:**
- إجمالي الإيرادات المقدرة يظهر نمواً مستمراً
-存在 بعض التباين في الأداء بين الفترات المختلفة
- تكاليف التشغيل ضمن الحدود المتوقعة

**الأرقام البارزة:**
- القيمة الإجمالية المقدرة: [تعتمد على البيانات]
- متوسط النمو: [بحسب البيانات]

**التوصيات:**
1. مراجعة البيانات بشكل تفصيلي
2. مقارنة النتائج مع الفترات السابقة
`
    }
    return `## Data Analysis

**Overview:**
Tabular data has been analyzed and key indicators extracted.${instructions ? `\n\n**Instructions:** ${instructions}` : ""}

**Key Insights:**
- Estimated revenue shows consistent growth
- Some variance in performance across periods
- Operating costs within expected ranges

**Notable Figures:**
- Estimated total value: [data-dependent]
- Average growth: [data-dependent]

**Recommendations:**
1. Conduct detailed data review
2. Compare results with prior periods
`
  }

  if (taskType.includes("report_draft")) {
    if (isArabic) {
      return `## الملخص التنفيذي

${instructions || "مسودة تقرير مهني تستعرض النتائج والتوصيات الرئيسية."}

## المقدمة
يهدف هذا التقرير إلى تقديم تحليل شامل للبيانات المتاحة واستخلاص النتائج والتوصيات المناسبة.

## النتائج والتحليل
${fileContent ? `بناءً على تحليل الملفات المرفقة:\n\n${fileContent.slice(0, 400)}` : "تم جمع البيانات وتحليلها وفقاً للمنهجية المعتمدة."}

## التوصيات
1. اعتماد النتائج بعد المراجعة البشرية
2. متابعة العناصر القابلة للتنفيذ
3. توثيق القرارات في سجل التدقيق

## الخاتمة
التقرير يمثل مسودة أولية تتطلب اعتماد الجهة المختصة.
`
    }
    return `## Executive Summary

${instructions || "Professional report draft presenting key findings and recommendations."}

## Introduction
This report aims to provide a comprehensive analysis of available data and draw appropriate conclusions.

## Findings & Analysis
${fileContent ? `Based on analysis of attached files:\n\n${fileContent.slice(0, 400)}` : "Data has been collected and analyzed according to the approved methodology."}

## Recommendations
1. Adopt findings after human review
2. Follow up on actionable items
3. Document decisions in audit trail

## Conclusion
This report is an initial draft requiring approval by the responsible authority.
`
  }

  if (taskType.includes("presentation_outline")) {
    if (isArabic) {
      return `## هيكل العرض التقديمي

**الشريحة 1: العنوان** — ${title}
**الشريحة 2: جدول الأعمال** — النقاط الرئيسية والمحاور
**الشريحة 3: المقدمة** — سياق العرض وأهدافه
${fileContent ? `**الشريحة 4: تحليل المحتوى** — ${fileContent.slice(0, 200)}` : "**الشريحة 4: المحتوى الرئيسي** — النتائج والتحليل"}
**الشريحة 5: النتائج** — أبرز الاستنتاجات
**الشريحة 6: التوصيات** — الإجراءات المقترحة
**الشريحة 7: الخطوات التالية** — الجدول الزمني والمسؤوليات
**الشريحة 8: الأسئلة** — نقاش مفتوح
`
    }
    return `## Presentation Structure

**Slide 1: Title** — ${title}
**Slide 2: Agenda** — Key topics and themes
**Slide 3: Introduction** — Context and objectives
${fileContent ? `**Slide 4: Content Analysis** — ${fileContent.slice(0, 200)}` : "**Slide 4: Main Content** — Findings and analysis"}
**Slide 5: Results** — Key conclusions
**Slide 6: Recommendations** — Proposed actions
**Slide 7: Next Steps** — Timeline and responsibilities
**Slide 8: Q&A** — Open discussion
`
  }

  if (taskType.includes("executive_summary")) {
    if (isArabic) {
      return `## الملخص التنفيذي

**نظرة عامة:**
${instructions || "ملخص تنفيذي شامل يغطي الجوانب الرئيسية للموضوع."}

**النتائج الرئيسية:**
1. تحليل البيانات يظهر مؤشرات إيجابية
2. وجود فرص للتحسين في بعض المجالات
3. التوافق مع المتطلبات التنظيمية

**التوصيات:**
1. اعتماد النتائج بعد المراجعة البشرية
2. وضع خطة عمل للمتابعة
3. توثيق القرارات

**الخطوات التالية:**
- مراجعة وتقييم من قبل الجهة المختصة
- اعتماد أو طلب تعديلات
- توثيق القرار النهائي في سجل التدقيق
`
    }
    return `## Executive Summary

**Overview:**
${instructions || "Comprehensive executive summary covering key aspects of the subject."}

**Key Findings:**
1. Data analysis shows positive indicators
2. Improvement opportunities identified in some areas
3. Regulatory requirements compliance

**Recommendations:**
1. Adopt findings after human review
2. Develop action plan for follow-up
3. Document decisions

**Next Steps:**
- Review and assessment by responsible authority
- Approve or request modifications
- Document final decision in audit trail
`
  }

  if (taskType.includes("meeting_notes")) {
    if (isArabic) {
      return `## محضر الاجتماع

**الحضور:**
- [قائمة الحضور]

**الموضوعات التي تمت مناقشتها:**
${instructions ? `- ${instructions}` : "- مناقشة البنود المدرجة على جدول الأعمال"}
- استعراض التقارير والمؤشرات
- مناقشة التوصيات والمقترحات

**القرارات:**
- اعتماد المحضر بعد المراجعة

**العناصر القابلة للتنفيذ:**
| المسؤول | العنصر | الموعد |
|---|---|---|
| [المسؤول] | [العنصر] | [الموعد] |
| [المسؤول] | [العنصر] | [الموعد] |
`
    }
    return `## Meeting Notes

**Attendees:**
- [List of attendees]

**Topics Discussed:**
${instructions ? `- ${instructions}` : "- Discussion of agenda items"}
- Review of reports and indicators
- Discussion of recommendations

**Decisions:**
- Approve minutes after review

**Action Items:**
| Owner | Action | Due |
|---|---|---|
| [Owner] | [Action] | [Due] |
| [Owner] | [Action] | [Due] |
`
  }

  // Fallback
  if (isArabic) {
    return `## نتيجة المهمة

تمت معالجة طلب "${title}" بنجاح.${instructions ? `\n\n**التعليمات:** ${instructions}` : ""}\n\nهذه مسودة أولية تحتاج مراجعة بشرية قبل الاعتماد.\n`
  }
  return `## Task Result\n\nRequest "${title}" processed successfully.${instructions ? `\n\n**Instructions:** ${instructions}` : ""}\n\nThis is an initial draft requiring human review before approval.\n`
}

export class MockAIProvider implements AIProvider {
  readonly providerId = 'mock' as const

  async isAvailable(): Promise<boolean> {
    return true
  }

  async execute(request: AIRequest): Promise<AIResponse> {
    // Simulate realistic latency
    await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS))
    const output = generateMockResponse(request)

    return {
      output,
      confidence: 0.88,
      providerId: 'mock',
      modelVersion: 'mock-v1.0',
      tokenUsage: {
        input: request.assembledPrompt.fullPrompt.length,
        output: output.length,
      },
      metadata: {
        simulated: true,
        latencyMs: MOCK_LATENCY_MS,
      },
      warnings: [
        "هذا الرد تم إنشاؤه بواسطة المحاكاة التجريبية — يتطلب مراجعة بشرية.",
      ],
    }
  }

  async stream(request: AIRequest): Promise<ReadableStream<Uint8Array>> {
    const response = await this.execute(request)
    const encoder = new TextEncoder()
    const encoded = encoder.encode(JSON.stringify({ type: "chunk", content: response.output }) + "\n")
    return new ReadableStream({
      start(controller) {
        controller.enqueue(encoded)
        controller.close()
      },
    })
  }

  getStatus(): AIProviderStatus {
    return {
      providerId: 'mock',
      available: true,
      modelVersion: 'mock-v1.0',
      latency: MOCK_LATENCY_MS,
      configured: true,
    }
  }
}

export const mockProvider = new MockAIProvider()
