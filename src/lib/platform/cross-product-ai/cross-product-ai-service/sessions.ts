import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { RISK_REQUIRES_REVIEW, renderTemplate } from "./common"
import type { AiSessionRequest, AiSessionResult, SessionFilter, ActionDefinition } from "./types"

export async function createAiSession(input: AiSessionRequest): Promise<AiSessionResult> {
  const modelUsed = "deterministic"
  const tokensUsed = 0
  const confidenceScore = 0.5

  let requiresReview = true
  let actionDefinition: ActionDefinition | null = null

  if (input.metadata?.actionKey) {
    const action = await prisma.aiActionRegistry.findUnique({
      where: { actionKey: input.metadata.actionKey },
    })
    if (action) {
      actionDefinition = {
        actionKey: action.actionKey,
        productKey: action.productKey,
        name: action.name,
        description: action.description ?? undefined,
        promptTemplate: action.promptTemplate,
        riskLevel: action.riskLevel,
        requiresReview: action.requiresReview,
        requiresApproval: action.requiresApproval,
      }
      requiresReview = RISK_REQUIRES_REVIEW[action.riskLevel] ?? true
    }
  }

  const contextForTemplate: Record<string, any> = {
    ...(input.metadata || {}),
    requestText: input.requestText,
    productContext: input.productContext,
    sourceAction: input.sourceAction,
  }

  let responseText = input.metadata?.responseText as string | undefined

  if (!responseText && actionDefinition) {
    responseText = renderTemplate(actionDefinition.promptTemplate, contextForTemplate)
  }

  const session = await prisma.aiCrossProductSession.create({
    data: {
      organizationId: input.organizationId ?? null,
      userId: input.userId,
      productContext: input.productContext,
      sourceAction: input.sourceAction,
      sourceRecordId: input.sourceRecordId ?? null,
      sourceRecordType: input.sourceRecordType ?? null,
      relatedProducts: input.metadata?.relatedProducts
        ? JSON.stringify(input.metadata.relatedProducts)
        : null,
      requestText: input.requestText,
      responseText: responseText ?? null,
      modelUsed: modelUsed,
      tokensUsed: tokensUsed,
      confidenceScore: confidenceScore,
      requiresReview: requiresReview,
      status: requiresReview ? "PENDING_REVIEW" : "COMPLETED",
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  })

  try {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "ai_session_created",
      platformOrganizationId: input.organizationId,
      actorId: input.userId,
      targetType: "ai_cross_product_session",
      targetId: session.id,
      severity: requiresReview ? "warning" : "info",
      status: "recorded",
      sourceSystem: "cross_product_ai",
      metadata: {
        productContext: input.productContext,
        sourceAction: input.sourceAction,
        actionKey: input.metadata?.actionKey,
        requiresReview,
      } as Record<string, unknown>,
    })
  } catch {
    /* non-blocking */
  }

  return {
    sessionId: session.id,
    responseText: responseText ?? "",
    modelUsed,
    tokensUsed,
    confidenceScore,
    requiresReview,
  }
}

export async function getSession(id: string): Promise<any> {
  const session = await prisma.aiCrossProductSession.findUnique({ where: { id } })
  if (!session) return null
  return {
    ...session,
    metadata: session.metadata ? JSON.parse(session.metadata) : null,
  }
}

export async function listSessions(filter: SessionFilter): Promise<any[]> {
  const where: Record<string, any> = {}
  if (filter.organizationId) where.organizationId = filter.organizationId
  if (filter.productContext) where.productContext = filter.productContext
  if (filter.userId) where.userId = filter.userId
  if (filter.status) where.status = filter.status

  const sessions = await prisma.aiCrossProductSession.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: filter.limit ?? 50,
    skip: filter.offset ?? 0,
  })

  return sessions.map((s: any) => ({
    ...s,
    metadata: s.metadata ? JSON.parse(s.metadata) : null,
  }))
}

export async function reviewSession(
  id: string,
  reviewedBy: string,
  notes?: string,
): Promise<void> {
  const session = await prisma.aiCrossProductSession.findUnique({ where: { id } })
  if (!session) {
    throw new Error(`Session ${id} not found`)
  }

  await prisma.aiCrossProductSession.update({
    where: { id },
    data: {
      status: "REVIEWED",
      reviewedAt: new Date(),
      reviewNotes: notes ?? null,
    },
  })

  try {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "ai_session_reviewed",
      actorId: reviewedBy,
      targetType: "ai_cross_product_session",
      targetId: id,
      severity: "info",
      status: "recorded",
      sourceSystem: "cross_product_ai",
    })
  } catch {
    /* non-blocking */
  }
}
