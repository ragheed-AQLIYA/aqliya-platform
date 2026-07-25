import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { RISK_REQUIRES_REVIEW } from "./common"
import type { ActionRegistrationInput } from "./types"

export async function registerAction(
  input: ActionRegistrationInput,
): Promise<{ id: string }> {
  const normalizedRiskLevel = (input.riskLevel ?? "LOW").toUpperCase()
  const validRiskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
  const riskLevel = validRiskLevels.includes(normalizedRiskLevel)
    ? normalizedRiskLevel
    : "LOW"

  const action = await prisma.aiActionRegistry.create({
    data: {
      actionKey: input.actionKey,
      productKey: input.productKey,
      name: input.name,
      description: input.description ?? null,
      promptTemplate: input.promptTemplate,
      inputSchema: input.inputSchema ?? null,
      outputSchema: input.outputSchema ?? null,
      requiredContext: input.requiredContext ?? null,
      riskLevel,
      requiresReview: input.requiresReview ?? RISK_REQUIRES_REVIEW[riskLevel],
      requiresApproval: input.requiresApproval ?? false,
      isActive: true,
      createdBy: input.createdBy ?? null,
    },
  })

  try {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "ai_action_registered",
      actorId: input.createdBy,
      targetType: "ai_action_registry",
      targetId: action.id,
      severity: "info",
      status: "recorded",
      sourceSystem: "cross_product_ai",
      metadata: {
        actionKey: input.actionKey,
        productKey: input.productKey,
        riskLevel,
      } as Record<string, unknown>,
    })
  } catch {
    /* non-blocking */
  }

  return { id: action.id }
}

export async function getAction(actionKey: string): Promise<any> {
  const action = await prisma.aiActionRegistry.findUnique({
    where: { actionKey },
  })
  if (!action) return null
  return action
}

export async function listActions(productKey?: string): Promise<any[]> {
  const where: Record<string, any> = {}
  if (productKey) where.productKey = productKey

  return prisma.aiActionRegistry.findMany({
    take: 100,
    where,
    orderBy: { createdAt: "desc" },
  })
}

export async function updateAction(
  id: string,
  data: Partial<ActionRegistrationInput> & { isActive?: boolean },
): Promise<void> {
  const existing = await prisma.aiActionRegistry.findUnique({ where: { id } })
  if (!existing) {
    throw new Error(`Action ${id} not found`)
  }

  const updateData: Record<string, any> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.promptTemplate !== undefined) updateData.promptTemplate = data.promptTemplate
  if (data.inputSchema !== undefined) updateData.inputSchema = data.inputSchema
  if (data.outputSchema !== undefined) updateData.outputSchema = data.outputSchema
  if (data.requiredContext !== undefined) updateData.requiredContext = data.requiredContext
  if (data.riskLevel !== undefined) {
    const normalizedRiskLevel = data.riskLevel.toUpperCase()
    const validRiskLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    updateData.riskLevel = validRiskLevels.includes(normalizedRiskLevel)
      ? normalizedRiskLevel
      : existing.riskLevel
    updateData.requiresReview = RISK_REQUIRES_REVIEW[updateData.riskLevel]
  }
  if (data.requiresApproval !== undefined) updateData.requiresApproval = data.requiresApproval
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.createdBy !== undefined) updateData.updatedBy = data.createdBy

  await prisma.aiActionRegistry.update({
    where: { id },
    data: updateData,
  })

  try {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "ai_action_updated",
      targetType: "ai_action_registry",
      targetId: id,
      severity: "info",
      status: "recorded",
      sourceSystem: "cross_product_ai",
      metadata: { updatedFields: Object.keys(updateData) } as Record<string, unknown>,
    })
  } catch {
    /* non-blocking */
  }
}

export async function deactivateAction(id: string): Promise<void> {
  const existing = await prisma.aiActionRegistry.findUnique({ where: { id } })
  if (!existing) {
    throw new Error(`Action ${id} not found`)
  }

  await prisma.aiActionRegistry.update({
    where: { id },
    data: { isActive: false },
  })

  try {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "ai_action_deactivated",
      targetType: "ai_action_registry",
      targetId: id,
      severity: "warning",
      status: "recorded",
      sourceSystem: "cross_product_ai",
    })
  } catch {
    /* non-blocking */
  }
}
