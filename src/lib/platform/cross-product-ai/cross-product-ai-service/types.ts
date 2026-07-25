import "server-only"

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
