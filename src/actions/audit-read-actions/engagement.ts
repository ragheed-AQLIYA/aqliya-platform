"use server"

import {
  getEngagement,
  getCanonicalAccounts,
} from "@/lib/audit/services"
import type { Engagement } from "@/types/audit"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import {
  getEngagementRollforward,
  type EngagementRollforwardResult,
} from "@/lib/audit/rollforward-service"
import { listArchivedEngagements } from "@/lib/audit/engagement-archival-service"
import type { ArchivedEngagementRow } from "@/lib/audit/engagement-archival"

export async function getEngagementAction(id: string): Promise<Engagement | null> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  return getEngagement(actor.organizationId, id)
}

export async function getEngagementRollforwardAction(
  engagementId: string,
): Promise<
  | { success: true; data: EngagementRollforwardResult }
  | { success: false; error: string }
> {
  try {
    const actor = await getAuditActor()
    requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
    await assertEngagementAccess(engagementId, actor)
    const data = await getEngagementRollforward(engagementId)
    return { success: true, data }
  } catch {
    return { success: false, error: "تعذر تحميل مقارنة الفترات" }
  }
}

export async function getArchivedEngagementsAction(): Promise<
  | { success: true; data: ArchivedEngagementRow[] }
  | { success: false; error: string }
> {
  try {
    const actor = await getAuditActor()
    requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
    const data = await listArchivedEngagements(actor.organizationId)
    return { success: true, data }
  } catch {
    return { success: false, error: "تعذر تحميل التكليفات المؤرشفة" }
  }
}

export async function getCanonicalAccountsAction(limit?: number): Promise<Array<{ id: string; code: string; name: string }>> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
  return getCanonicalAccounts(limit)
}
