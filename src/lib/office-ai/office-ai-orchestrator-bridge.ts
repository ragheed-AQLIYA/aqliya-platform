import "server-only"

import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge"
import { loadConversationContext } from "./conversation"
import {
  buildOfficeAiPrompt,
  taskTypeToUseCase,
  getOfficeAiPromptVersion,
} from "./prompts"
import type { OfficeAiTaskType } from "./office-ai-task-service"

export interface GovernedOfficeAIInput {
  taskId: string
  title: string
  taskType: OfficeAiTaskType
  instructions?: string | null
  language?: string | null
  organizationId: string
  userId?: string
  userRole?: string
  fileContext?: string
  fileNames?: string[]
}

export interface GovernedOfficeAIResult {
  content: string
  format: "markdown"
  aiProvider: string
  aiModel: string
  aiPromptVersion: string
  warnings: string[]
}

async function buildConversationSnippet(
  input: GovernedOfficeAIInput,
): Promise<string> {
  if (!input.userId) return ""
  try {
    const ctx = await loadConversationContext(
      input.taskId,
      input.organizationId,
      input.userId,
    )
    const prior = ctx.previousOutputs
      .slice(0, 2)
      .map((o) => o.content.trim().slice(0, 400))
      .filter(Boolean)
      .join("\n---\n")
    if (!prior) return ""
    return `\n[سياق مهام سابقة — مساعدة فقط، ليس قراراً نهائياً]\n${prior}`
  } catch {
    return ""
  }
}

export async function runGovernedOfficeAI(
  input: GovernedOfficeAIInput,
): Promise<GovernedOfficeAIResult | null> {
  const conversationSnippet = await buildConversationSnippet(input)
  const promptVersion = getOfficeAiPromptVersion()

  // Build task-specific structured prompt
  const prompt = buildOfficeAiPrompt({
    taskType: input.taskType,
    language: (input.language as "ar" | "en") ?? "ar",
    title: input.title,
    instructions: input.instructions,
    fileContext: input.fileContext,
    fileNames: input.fileNames ?? [],
    conversationSnippet,
  })

  const result = await runGovernedProductAI({
    productKey: "office_ai_assistant",
    useCase: taskTypeToUseCase(input.taskType),
    organizationId: input.organizationId,
    userId: input.userId,
    userRole: input.userRole,
    resourceId: input.taskId,
    query: prompt,
    evidenceComplete: Boolean(input.fileContext?.trim()),
    taskInput: {
      claimType: input.taskType,
      targetAudience: "internal",
      isPilotResult: true,
      hasEvidenceSupport: Boolean(input.fileContext?.trim()),
      instructions: input.instructions,
      language: input.language ?? "ar",
      officeTaskType: input.taskType,
    },
  })

  if (!result) return null

  const warnings = [...result.warnings]
  if (conversationSnippet) {
    warnings.push(
      "تمت إضافة سياق من مخرجات مهام سابقة كمساعدة فقط — يتطلب مراجعة بشرية.",
    )
  }

  return {
    content: result.output,
    format: "markdown",
    aiProvider: result.providerId,
    aiModel: result.providerId,
    aiPromptVersion: promptVersion,
    warnings,
  }
}
