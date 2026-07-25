"use server"

import { getOrganizationPortfolioAnalytics } from "@/lib/audit/portfolio-analytics-service"
import type { AuditPortfolioSnapshot } from "@/lib/audit/portfolio-analytics"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"

export async function getAuditPortfolioAnalyticsAction(): Promise<
  | { success: true; data: AuditPortfolioSnapshot }
  | { success: false; error: string }
> {
  try {
    const actor = await getAuditActor()
    requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"])
    const data = await getOrganizationPortfolioAnalytics(actor.organizationId)
    return { success: true, data }
  } catch {
    return { success: false, error: "تعذر تحميل محفظة التدقيق" }
  }
}
