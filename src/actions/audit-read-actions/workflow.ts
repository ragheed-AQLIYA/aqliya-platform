"use server"

import {
  getEngagement,
  getTrialBalance,
  getMappings,
  getFinancialStatements,
  getDisclosureNotes,
  getEvidence,
  getFindings,
  getRecommendations,
  getReviewComments,
  getApprovalRecords,
  getEngagementWorkflowStatus,
} from "@/lib/audit/services"
import type { WorkflowContext } from "@/lib/audit/workflow-gating"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import { APPROVED_STATUSES } from "./common"

export async function getWorkflowReadinessAction(engagementId: string): Promise<{
  context: WorkflowContext
  workflowStatus: { currentState: string; completionPercentage: number; blockingIssues: readonly string[] }
}> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)

  const [engagement, trialBalance, mappings, statements, notes, evidence, findings, recommendations, reviewComments, _approvalRecords, workflowStatus] = await Promise.all([
    getEngagement(actor.organizationId, engagementId),
    getTrialBalance(engagementId),
    getMappings(engagementId),
    getFinancialStatements(engagementId),
    getDisclosureNotes(engagementId),
    getEvidence(engagementId),
    getFindings(engagementId),
    getRecommendations(engagementId),
    getReviewComments(engagementId),
    getApprovalRecords(engagementId),
    getEngagementWorkflowStatus(engagementId),
  ])

  const status = engagement?.status ?? 'setup'

  const context: WorkflowContext = {
    engagementStatus: status,
    hasTrialBalance: trialBalance !== null && trialBalance.lines.length > 0,
    hasMappings: mappings.length > 0,
    hasConfirmedMappings: mappings.some(m => m.status === 'confirmed'),
    hasFinancialStatements: statements.length > 0,
    hasNotes: notes.length > 0,
    hasEvidence: evidence.length > 0,
    hasFindings: findings.length > 0,
    hasRecommendations: recommendations.length > 0,
    hasReviewActivity: reviewComments.length > 0,
    isApproved: status === 'approved',
    isPublished: status === 'published',
    governanceFinalizationAllowed: APPROVED_STATUSES.includes(status),
  }

  return {
    context,
    workflowStatus: {
      currentState: workflowStatus.currentState,
      completionPercentage: workflowStatus.completionPercentage,
      blockingIssues: workflowStatus.blockingIssues,
    },
  }
}
