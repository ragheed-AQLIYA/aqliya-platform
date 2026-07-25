"use server"

import {
  getReviewComments,
  getOpenReviewCount,
  getApprovalRecords,
  getApprovalStatus,
} from "@/lib/audit/services"
import type { ReviewComment, ApprovalRecord } from "@/types/audit"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import { getEngagementReviewerSignoffChain } from "@/lib/audit/reviewer-signoff-chain-service"
import type { ReviewerSignoffChainSnapshot } from "@/lib/audit/reviewer-signoff-chain"

export async function getReviewCommentsAction(engagementId: string): Promise<ReviewComment[]> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getReviewComments(engagementId)
}

export async function getOpenReviewCountAction(engagementId: string): Promise<number> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  await assertEngagementAccess(engagementId, actor)
  return getOpenReviewCount(engagementId)
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

export async function getReviewerSignoffChainAction(
  engagementId: string,
): Promise<
  | { success: true; data: ReviewerSignoffChainSnapshot }
  | { success: false; error: string }
> {
  try {
    const actor = await getAuditActor()
    requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
    await assertEngagementAccess(engagementId, actor)
    const data = await getEngagementReviewerSignoffChain(engagementId)
    return { success: true, data }
  } catch {
    return { success: false, error: "تعذر تحميل سلسلة الاعتماد" }
  }
}
