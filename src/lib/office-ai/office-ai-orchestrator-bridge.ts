import "server-only"

import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge"
import type { OfficeAiTaskType } from "./office-ai-task-service"

const TASK_USE_CASE = "commercial_claim_review" as const

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
}

export interface GovernedOfficeAIResult {
  content: string
  format: "markdown"
  aiProvider: string
  aiModel: string
  aiPromptVersion: string
  warnings: string[]
}

export async function runGovernedOfficeAI(
  input: GovernedOfficeAIInput,
): Promise<GovernedOfficeAIResult | null> {
  const query = [
    "Office AI Assistant",
    input.taskType,
    input.title,
    input.instructions ?? "",
    input.fileContext?.slice(0, 1500) ?? "",
  ]
    .filter(Boolean)
    .join(" ")

  const result = await runGovernedProductAI({
    productKey: "office_ai_assistant",
    useCase: TASK_USE_CASE,
    organizationId: input.organizationId,
    userId: input.userId,
    userRole: input.userRole,
    resourceId: input.taskId,
    query,
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

  return {
    content: result.output,
    format: "markdown",
    aiProvider: result.providerId,
    aiModel: result.providerId,
    aiPromptVersion: "office-ai-orchestrator-v1",
    warnings: result.warnings,
  }
}
