// ─── Office AI Assistant — Task-Specific Prompt Templates ───
// Arabic-first bilingual prompts for each of the 6 task types.
// Used by the governed AI bridge when a real LLM provider is active.

export type OfficeAiTaskType =
  | "excel_analysis"
  | "document_summary"
  | "report_draft"
  | "presentation_outline"
  | "executive_summary"
  | "meeting_notes"

export interface PromptInput {
  taskType: OfficeAiTaskType
  language: "ar" | "en"
  title: string
  instructions?: string | null
  fileContext?: string
  fileNames: string[]
  conversationSnippet?: string
}

const TASK_LABELS_AR: Record<OfficeAiTaskType, string> = {
  excel_analysis: "تحليل بيانات الجداول",
  document_summary: "تلخيص المستندات",
  report_draft: "مسودة تقرير",
  presentation_outline: "هيكل عرض تقديمي",
  executive_summary: "ملخص تنفيذي",
  meeting_notes: "محضر اجتماع",
}

const TASK_LABELS_EN: Record<OfficeAiTaskType, string> = {
  excel_analysis: "Data Analysis",
  document_summary: "Document Summary",
  report_draft: "Report Draft",
  presentation_outline: "Presentation Outline",
  executive_summary: "Executive Summary",
  meeting_notes: "Meeting Notes",
}

function buildArabicPrompt(input: PromptInput): string {
  const taskLabel = TASK_LABELS_AR[input.taskType]

  let prompt = `# مساعد المهام المكتبية — ${taskLabel}

## الدور
أنت مساعد مهام مكتبية حوكمي في منصة AQLIYA. مهمتك هي ${input.taskType === "excel_analysis" ? "تحليل البيانات الجدولية واستخراج الرؤى والأرقام الرئيسية" : input.taskType === "document_summary" ? "تلخيص المستندات المرفقة مع استخراج النقاط الرئيسية" : input.taskType === "report_draft" ? "كتابة مسودة تقرير مهني منظم باللغة العربية" : input.taskType === "presentation_outline" ? "إنشاء هيكل عرض تقديمي منظم" : input.taskType === "executive_summary" ? "كتابة ملخص تنفيذي شامل" : "تنظيم ملاحظات الاجتماع في محضر منظم"}.

## المبادئ
- الذكاء يساعد. الإنسان يقرر. الدليل يحكم.
- المخرجات هي مسودة أولية — تتطلب مراجعة بشرية قبل الاعتماد.
- استخدم المعلومات المقدمة فقط. لا تخترع بيانات أو أرقام.
- قدم التحليل بلغة واضحة ومهنية.

## المهمة
- عنوان المهمة: ${input.title}
- نوع المهمة: ${taskLabel}
${input.instructions ? `- تعليمات إضافية: ${input.instructions}` : ""}
`

  if (input.fileNames.length > 0) {
    prompt += `\n## الملفات المرفقة\n`
    for (const f of input.fileNames) {
      prompt += `- ${f}\n`
    }
  }

  if (input.fileContext) {
    prompt += `\n## محتوى الملفات المستخرج\n\n${input.fileContext.slice(0, 4000)}\n`
  }

  if (input.conversationSnippet) {
    prompt += `\n## سياق المهام السابقة (مساعدة فقط)\n${input.conversationSnippet}\n`
  }

  prompt += `\n## صيغة المخرجات
قدم النتيجة بتنسيق Markdown منظم.
ابدأ مباشرة بالمحتوى — لا حاجة لمقدمة عن المهمة.
${input.taskType === "excel_analysis" ? "ضمن التحليل: ملخص عام، رؤى رئيسية، أرقام بارزة، توصيات إن وجدت." : input.taskType === "document_summary" ? "ضمن الملخص: الفكرة الرئيسية، النقاط الرئيسية (نقطة لكل فقرة)، الخلاصة." : input.taskType === "report_draft" ? "ضمن التقرير: ملخص تنفيذي، مقدمة، نتائج وتحليل، توصيات، خاتمة." : input.taskType === "presentation_outline" ? "ضمن الهيكل: شريحة عنوان، جدول أعمال، محتوى رئيسي (3-4 شرائح)، تحليل، توصيات، أسئلة." : input.taskType === "executive_summary" ? "ضمن الملخص: نظرة عامة، نتائج رئيسية، توصيات، خطوات تالية." : "ضمن المحضر: الحضور، الموضوعات، القرارات، العناصر القابلة للتنفيذ بجدول."}
`

  return prompt
}

function buildEnglishPrompt(input: PromptInput): string {
  const taskLabel = TASK_LABELS_EN[input.taskType]

  let prompt = `# Office AI Assistant — ${taskLabel}

## Role
You are a governed office assistant on the AQLIYA platform. Your task is to ${input.taskType === "excel_analysis" ? "analyze tabular data and extract key insights and figures" : input.taskType === "document_summary" ? "summarize attached documents and extract key points" : input.taskType === "report_draft" ? "write a structured professional report draft" : input.taskType === "presentation_outline" ? "create a structured presentation outline" : input.taskType === "executive_summary" ? "write a comprehensive executive summary" : "organize meeting notes into a structured minutes document"}.

## Principles
- AI assists. Humans decide. Evidence governs.
- Outputs are initial drafts — require human review before use.
- Use only the provided information. Do not fabricate data.
- Provide analysis in clear, professional language.

## Task
- Title: ${input.title}
- Type: ${taskLabel}
${input.instructions ? `- Instructions: ${input.instructions}` : ""}
`

  if (input.fileNames.length > 0) {
    prompt += `\n## Attached Files\n`
    for (const f of input.fileNames) {
      prompt += `- ${f}\n`
    }
  }

  if (input.fileContext) {
    prompt += `\n## Extracted File Content\n\n${input.fileContext.slice(0, 4000)}\n`
  }

  if (input.conversationSnippet) {
    prompt += `\n## Previous Task Context (assistance only)\n${input.conversationSnippet}\n`
  }

  prompt += `\n## Output Format
Provide the result in structured Markdown.
Start directly with the content — no introduction about the task.
${input.taskType === "excel_analysis" ? "Include: executive summary, key insights, notable figures, recommendations if any." : input.taskType === "document_summary" ? "Include: main idea, key points (one per paragraph), conclusion." : input.taskType === "report_draft" ? "Include: executive summary, introduction, findings & analysis, recommendations, conclusion." : input.taskType === "presentation_outline" ? "Include: title slide, agenda, main content (3-4 slides), analysis, recommendations, Q&A." : input.taskType === "executive_summary" ? "Include: overview, key findings, recommendations, next steps." : "Include: attendees, topics discussed, decisions, action items table."}
`

  return prompt
}

/**
 * Assemble a task-specific prompt for the governed AI pipeline.
 * Returns the prompt string in the task's language (Arabic-first).
 */
export function buildOfficeAiPrompt(input: PromptInput): string {
  if (input.language === "en") {
    return buildEnglishPrompt(input)
  }
  return buildArabicPrompt(input)
}

/**
 * Map an Office AI task type to a product AI use case key.
 */
export function taskTypeToUseCase(taskType: OfficeAiTaskType): string {
  const map: Record<OfficeAiTaskType, string> = {
    excel_analysis: "office_ai_excel_analysis",
    document_summary: "office_ai_document_summary",
    report_draft: "office_ai_report_draft",
    presentation_outline: "office_ai_presentation_outline",
    executive_summary: "office_ai_executive_summary",
    meeting_notes: "office_ai_meeting_notes",
  }
  return map[taskType]
}

/**
 * Get the prompt version identifier.
 */
export function getOfficeAiPromptVersion(): string {
  return "office-ai-prompts-v1"
}
