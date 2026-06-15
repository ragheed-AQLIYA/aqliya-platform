import "server-only"

import { prisma } from "@/lib/prisma"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"

// ─── Types ───

export interface AiSessionRequest {
  organizationId?: string
  userId: string
  productContext: string
  sourceAction: string
  sourceRecordId?: string
  sourceRecordType?: string
  requestText: string
  metadata?: Record<string, any>
}

export interface AiSessionResult {
  sessionId: string
  responseText: string
  modelUsed: string
  tokensUsed: number
  confidenceScore: number
  requiresReview: boolean
}

export interface SessionFilter {
  organizationId?: string
  productContext?: string
  userId?: string
  status?: string
  limit?: number
  offset?: number
}

export interface ActionRegistrationInput {
  actionKey: string
  productKey: string
  name: string
  description?: string
  promptTemplate: string
  inputSchema?: string
  outputSchema?: string
  requiredContext?: string
  riskLevel?: string
  requiresReview?: boolean
  requiresApproval?: boolean
  createdBy?: string
}

export interface BridgeInput {
  organizationId?: string
  sourceProduct: string
  targetProduct: string
  mappingName: string
  mappingConfig: Record<string, any>
  description?: string
  createdBy?: string
}

export interface ActionDefinition {
  actionKey: string
  productKey: string
  name: string
  description?: string
  promptTemplate: string
  riskLevel: string
  requiresReview: boolean
  requiresApproval: boolean
}

export interface CrossProductStats {
  totalSessions: number
  sessionsByProduct: Record<string, number>
  sessionsByStatus: Record<string, number>
  pendingReviewCount: number
  totalActions: number
  activeActions: number
  totalBridges: number
}

// ─── Helpers ───

const RISK_REQUIRES_REVIEW: Record<string, boolean> = {
  LOW: false,
  MEDIUM: true,
  HIGH: true,
  CRITICAL: true,
}

function renderTemplate(template: string, context: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    const value = context[key]
    return value !== undefined ? String(value) : `{{${key}}}`
  })
}

function productModelName(productContext: string): string {
  const map: Record<string, string> = {
    audit: "auditEngagement",
    decision: "decision",
    "local-content": "localContentProject",
    sales: "salesDeal",
    "office-ai": "officeAiTask",
    workflowos: "clientWorkspace",
  }
  return map[productContext] || productContext
}

// ─── Session Management ───

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

// ─── Action Registry ───

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

// ─── Context Bridging ───

async function resolveSourceRecord(sourceProduct: string, sourceRecordId: string): Promise<Record<string, any> | null> {
  const modelName = productModelName(sourceProduct)
  const model = (prisma as any)[modelName]
  if (!model || typeof model.findUnique !== "function") return null

  try {
    const record = await model.findUnique({ where: { id: sourceRecordId } })
    return record || null
  } catch {
    return null
  }
}

function applyFieldMapping(
  sourceRecord: Record<string, any>,
  mappingConfig: Record<string, any>,
): Record<string, any> {
  const fieldMappings: Array<{ sourceField: string; targetField: string; default?: any }> =
    mappingConfig.fieldMappings ?? []

  const transformed: Record<string, any> = {}

  for (const mapping of fieldMappings) {
    const value = sourceRecord[mapping.sourceField]
    transformed[mapping.targetField] = value !== undefined ? value : (mapping.default ?? null)
  }

  if (mappingConfig.enrichment?.includeSourceMetadata) {
    transformed._source = {
      id: sourceRecord.id,
      type: sourceRecord.constructor?.name ?? "unknown",
      createdAt: sourceRecord.createdAt,
    }
  }

  return transformed
}

export async function buildCrossProductContext(
  sourceProduct: string,
  sourceRecordId: string,
  targetProduct: string,
): Promise<any> {
  const bridges = await prisma.aiContextBridge.findMany({
    where: {
      sourceProduct,
      targetProduct,
      isActive: true,
    },
  })

  if (bridges.length === 0) {
    throw new Error(
      `No active context bridge from "${sourceProduct}" to "${targetProduct}"`,
    )
  }

  const sourceRecord = await resolveSourceRecord(sourceProduct, sourceRecordId)
  if (!sourceRecord) {
    throw new Error(
      `Source record not found: ${sourceProduct}/${sourceRecordId}`,
    )
  }

  const contexts: Record<string, any>[] = []

  for (const bridge of bridges) {
    let mappingConfig: Record<string, any>
    try {
      mappingConfig = JSON.parse(bridge.mappingConfig ?? '{}')
    } catch {
      mappingConfig = {}
    }

    const transformed = applyFieldMapping(sourceRecord, mappingConfig)

    contexts.push({
      bridgeId: bridge.id,
      mappingName: bridge.mappingName,
      sourceProduct: bridge.sourceProduct,
      targetProduct: bridge.targetProduct,
      sourceRecordId,
      transformed,
    })
  }

  return {
    sourceProduct,
    targetProduct,
    sourceRecordId,
    bridgeCount: contexts.length,
    contexts,
  }
}

export async function registerContextBridge(input: BridgeInput): Promise<{ id: string }> {
  const bridge = await prisma.aiContextBridge.create({
    data: {
      organizationId: input.organizationId ?? null,
      sourceProduct: input.sourceProduct,
      targetProduct: input.targetProduct,
      mappingName: input.mappingName,
      mappingConfig: JSON.stringify(input.mappingConfig),
      description: input.description ?? null,
      isActive: true,
      createdBy: input.createdBy ?? null,
    },
  })

  try {
    await writePlatformAuditLog({
      productKey: "platform",
      action: "ai_context_bridge_registered",
      actorId: input.createdBy,
      targetType: "ai_context_bridge",
      targetId: bridge.id,
      severity: "info",
      status: "recorded",
      sourceSystem: "cross_product_ai",
      metadata: {
        sourceProduct: input.sourceProduct,
        targetProduct: input.targetProduct,
        mappingName: input.mappingName,
      } as Record<string, unknown>,
    })
  } catch {
    /* non-blocking */
  }

  return { id: bridge.id }
}

export async function getContextBridges(sourceProduct?: string): Promise<any[]> {
  const where: Record<string, any> = {}
  if (sourceProduct) where.sourceProduct = sourceProduct

  const bridges = await prisma.aiContextBridge.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  return bridges.map((b: any) => ({
    ...b,
    mappingConfig: typeof b.mappingConfig === "string" ? JSON.parse(b.mappingConfig) : b.mappingConfig,
  }))
}

// ─── Dashboard ───

export async function getCrossProductStats(organizationId?: string): Promise<CrossProductStats> {
  const sessionWhere: Record<string, any> = {}
  if (organizationId) sessionWhere.organizationId = organizationId

  const totalSessions = await prisma.aiCrossProductSession.count({
    where: sessionWhere,
  })

  const pendingReviewCount = await prisma.aiCrossProductSession.count({
    where: { ...sessionWhere, status: "PENDING_REVIEW" },
  })

  const sessionsByProductRaw: Array<{ productContext: string; _count: { productContext: number } }> =
    await prisma.aiCrossProductSession.groupBy({
      by: ["productContext"],
      where: sessionWhere,
      _count: { productContext: true },
    }) as any

  const sessionsByProduct: Record<string, number> = {}
  for (const row of sessionsByProductRaw) {
    sessionsByProduct[row.productContext] = (row._count as any).productContext ?? 0
  }

  const sessionsByStatusRaw: Array<{ status: string; _count: { status: number } }> =
    await prisma.aiCrossProductSession.groupBy({
      by: ["status"],
      where: sessionWhere,
      _count: { status: true },
    }) as any

  const sessionsByStatus: Record<string, number> = {}
  for (const row of sessionsByStatusRaw) {
    sessionsByStatus[row.status] = (row._count as any).status ?? 0
  }

  const totalActions = await prisma.aiActionRegistry.count()
  const activeActions = await prisma.aiActionRegistry.count({
    where: { isActive: true },
  })

  const totalBridges = await prisma.aiContextBridge.count()

  return {
    totalSessions,
    sessionsByProduct,
    sessionsByStatus,
    pendingReviewCount,
    totalActions,
    activeActions,
    totalBridges,
  }
}
