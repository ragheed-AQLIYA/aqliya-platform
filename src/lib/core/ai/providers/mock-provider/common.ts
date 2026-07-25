import type { AIRequest } from "@/lib/core/ai/types"

export const MOCK_LATENCY_MS = 800

export interface ExtractedContext {
  title: string
  instructions: string | undefined
  fileContent: string | undefined
  isArabic: boolean
  lang: "ar" | "en"
}

export function extractKeyContext(request: AIRequest): ExtractedContext {
  const prompt = request.assembledPrompt.fullPrompt

  const titleMatch = prompt.match(/عنوان المهمة: (.+)/i) || prompt.match(/(?:Title|عنوان):\s*(.+)/i)
  const title = titleMatch?.[1]?.trim() ?? "Task"
  const instructionsMatch = prompt.match(/تعليمات إضافية: (.+)/i) || prompt.match(/(?:Instructions|تعليمات):\s*(.+)/i)
  const instructions = instructionsMatch?.[1]?.trim()
  const fileMatch = prompt.match(/محتوى الملفات المستخرج[^]*?(?:$)/)
  const fileContent = fileMatch?.[0]?.slice(0, 500)

  const isArabic = prompt.includes("مساعد المهام المكتبية")
  const lang = isArabic ? "ar" : "en" as const

  return { title, instructions, fileContent, isArabic, lang }
}
