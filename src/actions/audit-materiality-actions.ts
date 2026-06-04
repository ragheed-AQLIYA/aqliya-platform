"use server"

import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import { calculateMateriality as svcCalculateMateriality } from "@/lib/audit/materiality-service"
import { recordAuditEvent } from "@/lib/audit/services"
import type { MaterialityBasis, MaterialityResult } from "@/lib/audit/materiality-service"

export async function calculateMaterialityAction(
  engagementId: string,
  options: {
    basis: MaterialityBasis
    customPercentage?: number
    customBasisAmount?: number
    overrideThreshold?: number
  },
): Promise<MaterialityResult> {
  const actor = await getAuditActor()
  requireRole(actor, ["admin", "operator", "reviewer", "partner"])
  await assertEngagementAccess(engagementId, actor)

  const result = await svcCalculateMateriality(engagementId, options)

  await recordAuditEvent({
    engagementId,
    eventType: "materiality.calculated",
    actorId: actor.actorId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    targetType: "engagement",
    targetId: engagementId,
    newState: "materiality_calculated",
    description: `Materiality calculated: basis=${options.basis}, overall=${result.overallMateriality}`,
    aiRelated: false,
    metadata: {
      basis: options.basis,
      overallMateriality: result.overallMateriality,
      performanceMateriality: result.performanceMateriality,
    },
  })

  return result
}
