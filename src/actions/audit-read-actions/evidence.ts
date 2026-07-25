"use server"

import {
  getEvidence,
  getEvidencePaginated,
  getMissingEvidence,
  recordAuditEvent as svcRecordAuditEvent,
} from "@/lib/audit/services"
import type { EvidenceObject } from "@/types/audit"
import type { PaginatedResult } from "@/lib/audit/pagination"
import { getAuditActor, requireRole } from "@/lib/audit/actor-context"
import { assertEngagementAccess } from "@/lib/audit/tenant-guard"
import {
  getEvidenceVersions,
  compareVersions,
  revertToVersion,
  type EvidenceVersion,
  type VersionDiff,
} from "@/lib/audit/evidence-versioning-service"
import { assertEvidenceInEngagement } from "./common"

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

export async function getEvidenceVersionsAction(
  evidenceId: string,
  engagementId: string,
): Promise<
  | { success: true; data: EvidenceVersion[] }
  | { success: false; error: string }
> {
  try {
    const actor = await getAuditActor();
    requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"]);
    await assertEngagementAccess(engagementId, actor);
    await assertEvidenceInEngagement(
      evidenceId,
      engagementId,
      actor.organizationId,
    );
    const data = await getEvidenceVersions(evidenceId);
    return { success: true, data };
  } catch {
    return { success: false, error: "تعذر تحميل سجل إصدارات الدليل" };
  }
}

export async function compareEvidenceVersionsAction(
  evidenceId: string,
  engagementId: string,
  versionId1: string,
  versionId2: string,
): Promise<
  | { success: true; data: VersionDiff[] }
  | { success: false; error: string }
> {
  try {
    const actor = await getAuditActor();
    requireRole(actor, ["admin", "operator", "reviewer", "partner", "viewer"]);
    await assertEngagementAccess(engagementId, actor);
    await assertEvidenceInEngagement(
      evidenceId,
      engagementId,
      actor.organizationId,
    );
    const data = await compareVersions(versionId1, versionId2);
    return { success: true, data };
  } catch {
    return { success: false, error: "تعذر مقارنة الإصدارات" };
  }
}

export async function revertEvidenceVersionAction(
  evidenceId: string,
  engagementId: string,
  versionNumber: number,
): Promise<
  | { success: true; data: EvidenceVersion }
  | { success: false; error: string }
> {
  try {
    const actor = await getAuditActor();
    requireRole(actor, ["admin", "operator", "reviewer"]);
    await assertEngagementAccess(engagementId, actor);
    await assertEvidenceInEngagement(
      evidenceId,
      engagementId,
      actor.organizationId,
    );
    const data = await revertToVersion(
      evidenceId,
      versionNumber,
      actor.actorId,
      actor.actorName,
    );
    await svcRecordAuditEvent({
      engagementId,
      eventType: "evidence.version_reverted",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "evidence",
      targetId: evidenceId,
      newState: String(
        (data.changes as Record<string, unknown>).state ?? "reverted",
      ),
      description: `استعادة الدليل إلى الإصدار ${versionNumber}`,
      metadata: { versionNumber, newVersionId: data.id },
    });
    return { success: true, data };
  } catch {
    return { success: false, error: "تعذر استعادة الإصدار" };
  }
}
