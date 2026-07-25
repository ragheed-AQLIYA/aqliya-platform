"use server"

import {
  getFindings,
  getFindingsPaginated,
  getRecommendations,
  getRecommendationsPaginated,
} from "@/lib/audit/services"
import type { Finding, Recommendation } from "@/types/audit"
import type { PaginatedResult } from "@/lib/audit/pagination"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"

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
