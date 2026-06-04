import "server-only"

import type { AIRequest, AIResponse, AIProvider } from "./types"
import { writePlatformAuditLog } from "@/lib/platform/audit-log"
import { calculateCost } from "./cost-mapping"
import { isEnabled } from "@/lib/platform/feature-flags/registry"
import { checkBudgetQuota, triggerBudgetAlerts } from "./budget-manager"

const GOV_PRODUCT = "ai_core"

export class BudgetQuotaExceededError extends Error {
  constructor(
    public readonly organizationId: string,
    public readonly reason: string,
  ) {
    super(`Budget quota exceeded for org ${organizationId}: ${reason}`)
    this.name = "BudgetQuotaExceededError"
  }
}

export interface GovernedAIExecuteResult {
  response: AIResponse
  auditId?: string
  requiresReview: boolean
  cost?: {
    inputCost: number
    outputCost: number
    totalCost: number
    currency: string
    model: string
  }
}

export async function governedAIExecute(
  provider: AIProvider,
  request: AIRequest,
): Promise<GovernedAIExecuteResult> {
  if (request.organizationId && isEnabled("ai.budget-quotas")) {
    const quota = await checkBudgetQuota(request.organizationId)
    if (!quota.allowed) {
      await writePlatformAuditLog({
        productKey: GOV_PRODUCT,
        action: "ai_budget_quota_blocked",
        platformOrganizationId: request.organizationId,
        severity: "warning",
        status: "blocked",
        sourceSystem: "governed_ai_executor",
        metadata: {
          reason: quota.reason,
          currentSpend: quota.status.currentSpendUsd,
          spendCap: quota.status.spendCapUsd,
        },
      })
      throw new BudgetQuotaExceededError(request.organizationId, quota.reason!)
    }
  }

  const response: AIResponse = await provider.execute(request)

  const requiresReview =
    request.governanceContext.humanApprovalRequired ||
    request.governanceContext.outputBoundary === "draft_only" ||
    request.governanceContext.outputBoundary === "review_required"

  const costTrackingEnabled = isEnabled("ai.cost-tracking")
  let cost

  if (costTrackingEnabled) {
    cost = calculateCost(
      response.tokenUsage?.input ?? 0,
      response.tokenUsage?.output ?? 0,
      response.modelVersion,
    )
  }

  const metadata: Record<string, unknown> = {
    taskType: request.taskType,
    confidence: response.confidence,
    tokenInput: response.tokenUsage?.input,
    tokenOutput: response.tokenUsage?.output,
  }

  if (cost) {
    metadata.inputCost = cost.inputCost
    metadata.outputCost = cost.outputCost
    metadata.totalCost = cost.totalCost
    metadata.costCurrency = cost.currency
  }

  const auditPayload = {
    productKey: GOV_PRODUCT,
    action: "ai_generation",
    aiProvider: response.providerId,
    aiModel: response.modelVersion,
    aiOutputReviewStatus: requiresReview ? "pending" : "auto_accepted",
    targetType: request.taskType,
    targetId: request.engagementId,
    actorId: request.userId,
    severity: requiresReview ? "info" : "info",
    status: requiresReview ? "pending_review" : "recorded",
    sourceSystem: "governed_ai_executor",
    metadata,
  }

  const auditResult = await writePlatformAuditLog(auditPayload)

  if (request.organizationId && isEnabled("ai.budget-alerts")) {
    void triggerBudgetAlerts(request.organizationId).catch(() => {})
  }

  return {
    response,
    auditId: auditResult.id,
    requiresReview,
    cost,
  }
}
