"use server"

import {
  getEngagement,
  getTrialBalance,
  getMappings,
  getFinancialStatements,
  getDisclosureNotes,
  getEvidence,
  getEvidencePaginated,
  getMissingEvidence,
  getFindings,
  getFindingsPaginated,
  getRecommendations,
  getRecommendationsPaginated,
  getReviewComments,
  getOpenReviewCount,
  getApprovalRecords,
  getApprovalStatus,
  getAuditEvents,
  getPublicationPackage,
  getValidationRun,
  getEngagementWorkflowStatus,
  getCanonicalAccounts,
} from "@/lib/audit/services"
import type {
  Engagement, TrialBalance, AccountMapping, FinancialStatement,
  DisclosureNote, EvidenceObject, Finding, Recommendation, ReviewComment,
  ApprovalRecord, PublicationPackage, ValidationRun,
} from "@/types/audit"
import type { PaginatedResult } from "@/lib/audit/pagination"
import type { WorkflowContext } from "@/lib/audit/workflow-gating"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import { confirmMappingAction as _confirmMapping } from "./audit-actions"
import { runValidationAction as _runValidation } from "./audit-actions"

export async function getEngagementAction(id: string): Promise<Engagement | null> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  return getEngagement(actor.organizationId, id)
}

export async function getTrialBalanceAction(engagementId: string): Promise<TrialBalance | null> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getTrialBalance(engagementId)
}

export async function getMappingsAction(engagementId: string): Promise<AccountMapping[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getMappings(engagementId)
}

export async function getFinancialStatementsAction(engagementId: string): Promise<FinancialStatement[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getFinancialStatements(engagementId)
}

export async function getDisclosureNotesAction(engagementId: string): Promise<DisclosureNote[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getDisclosureNotes(engagementId)
}

export async function getEvidenceAction(engagementId: string): Promise<EvidenceObject[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getEvidence(engagementId)
}

export async function getEvidencePaginatedAction(engagementId: string, page = 1, pageSize = 20): Promise<PaginatedResult<EvidenceObject>> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getEvidencePaginated(engagementId, { page, pageSize })
}

export async function getMissingEvidenceAction(engagementId: string): Promise<EvidenceObject[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getMissingEvidence(engagementId)
}

export async function getOpenReviewCountAction(engagementId: string): Promise<number> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getOpenReviewCount(engagementId)
}

export async function getFindingsAction(engagementId: string): Promise<Finding[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getFindings(engagementId)
}

export async function getFindingsPaginatedAction(engagementId: string, page = 1, pageSize = 20): Promise<PaginatedResult<Finding>> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getFindingsPaginated(engagementId, { page, pageSize })
}

export async function getRecommendationsAction(engagementId: string): Promise<Recommendation[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getRecommendations(engagementId)
}

export async function getRecommendationsPaginatedAction(engagementId: string, page = 1, pageSize = 20): Promise<PaginatedResult<Recommendation>> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getRecommendationsPaginated(engagementId, { page, pageSize })
}

export async function getReviewCommentsAction(engagementId: string): Promise<ReviewComment[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getReviewComments(engagementId)
}

export async function getApprovalRecordsAction(engagementId: string): Promise<ApprovalRecord[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getApprovalRecords(engagementId)
}

export async function getApprovalStatusAction(engagementId: string): Promise<{
  status: string; blockingIssues: readonly string[]; checklist: Array<{ label: string; passed: boolean; detail: string }>;
}> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getApprovalStatus(engagementId)
}

export async function getAuditEventsAction(engagementId: string) {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getAuditEvents(engagementId)
}

export async function getPublicationPackageAction(engagementId: string): Promise<PublicationPackage | null> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getPublicationPackage(engagementId)
}

export async function getValidationRunAction(engagementId: string): Promise<ValidationRun | null> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getValidationRun(engagementId)
}

const APPROVED_STATUSES = ["approved", "published"]

export async function getWorkflowReadinessAction(engagementId: string): Promise<{
  context: WorkflowContext
  workflowStatus: { currentState: string; completionPercentage: number; blockingIssues: readonly string[] }
}> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)

  const [engagement, trialBalance, mappings, statements, notes, evidence, findings, recommendations, reviewComments, approvalRecords, workflowStatus] = await Promise.all([
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

export async function getCanonicalAccountsAction(limit?: number): Promise<Array<{ id: string; code: string; name: string }>> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  return getCanonicalAccounts(limit)
}

// Delegated to audit-actions.ts — imported statically
export async function confirmMappingAction(engagementId: string, mappingId: string) {
  return _confirmMapping(engagementId, mappingId)
}

export async function runValidationAction(engagementId: string) {
  return _runValidation(engagementId)
}
