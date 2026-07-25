"use server"

import {
  getAuditEvents,
  getPublicationPackage,
  getValidationRun,
} from "@/lib/audit/services"
import type { PublicationPackage, ValidationRun } from "@/types/audit"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"

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
