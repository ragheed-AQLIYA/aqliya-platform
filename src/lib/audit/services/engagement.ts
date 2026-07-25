/**
 * Audit Services — Engagement domain
 *
 * Engagement CRUD, workflow status, presentation profile, archive/restore.
 */

import type { Engagement, WorkflowStatus, DashboardSummary } from "@/types/audit";
import * as mock from "../mock-data";
import { getDb, tryDb } from "./common";

export async function getDashboardSummary(organizationId?: string): Promise<DashboardSummary> {
  return tryDb(
    () => Promise.resolve(mock.mockDashboardSummary),
    (db) => db.getDashboardSummary(organizationId),
    "dashboard summary",
  );
}

export async function getEngagements(
  organizationId?: string,
): Promise<Engagement[]> {
  return tryDb(
    () => Promise.resolve(mock.mockDashboardSummary.engagements),
    (db) => db.getEngagements(organizationId),
    "engagement list",
  );
}

export async function getEngagement(
  organizationId: string | undefined,
  id: string,
): Promise<Engagement | null> {
  return tryDb(
    () => {
      const e = mock.mockDashboardSummary.engagements.find((e) => e.id === id);
      return Promise.resolve(e ?? null);
    },
    (db) => db.getEngagement(organizationId, id),
    `engagement ${id}`,
  );
}

export async function getEngagementWorkflowStatus(
  engagementId: string,
): Promise<WorkflowStatus> {
  return tryDb(
    async () => {
      const e = mock.mockDashboardSummary.engagements.find(
        (e) => e.id === engagementId,
      );
      return {
        currentState: e?.status ?? "setup",
        availableTransitions: ["in_progress"],
        blockingIssues: [],
        completionPercentage: 10,
      };
    },
    (db) => db.getEngagementWorkflowStatus(engagementId),
    `workflow status for ${engagementId}`,
  );
}

export async function publishEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<{ package: import("@/types/audit").PublicationPackage | null }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.publishEngagement(engagementId, actorId, actorName);
}

export async function createEngagement(params: {
  organizationId: string;
  clientName: string;
  fiscalPeriod: string;
  engagementType: string;
  teamMemberIds: string[];
  actorId?: string;
  actorName?: string;
}): Promise<{ engagement: Engagement }> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for write operations");
  });
  const client = await db.createClient({
    organizationId: params.organizationId,
    name: params.clientName,
    industry: "Other",
  });
  const team = params.teamMemberIds.map((uid) => ({
    userId: uid,
    userName: "",
    role: "operator",
    assignedAt: new Date().toISOString(),
  }));
  const engagement = await db.createEngagement({
    organizationId: params.organizationId,
    clientId: client.id,
    fiscalPeriod: params.fiscalPeriod,
    engagementType: params.engagementType,
    team,
  });
  await db.recordAuditEvent({
    engagementId: engagement.id,
    eventType: "engagement.created",
    actorId: params.actorId ?? "system",
    actorName: params.actorName ?? "System",
    actorRole: "operator",
    targetType: "engagement",
    targetId: engagement.id,
    newState: "setup",
    description: `Engagement created for ${params.clientName} ${params.fiscalPeriod}`,
  });
  return { engagement };
}

export async function updateEngagementPresentationProfile(params: {
  organizationId: string;
  engagementId: string;
  presentationProfile: string;
  actorId: string;
  actorName: string;
  actorRole: string;
}): Promise<{
  engagement: Engagement;
  fsRebuild: import("@/lib/audit/presentation/presentation-profile-rebuild").PresentationProfileRebuildResult;
}> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available for write operations");
  });

  const existing = await db.getEngagement(params.organizationId, params.engagementId);
  if (!existing) {
    throw new Error("Engagement not found");
  }

  const { resolvePresentationProfile, presentationProfileVersionFor } =
    await import("@/lib/audit/presentation/presentation-profile");
  const { policyIdForProfile } = await import(
    "@/lib/audit/presentation/presentation-policy-resolver"
  );
  const profile = resolvePresentationProfile(params.presentationProfile);
  const version = presentationProfileVersionFor(profile);
  const policyId = policyIdForProfile(profile);

  const engagement = await db.updateEngagementPresentationProfile(
    params.engagementId,
    {
      presentationProfile: profile,
      presentationProfileVersion: version,
      presentationPolicyId: policyId,
    },
  );

  await db.recordAuditEvent({
    engagementId: params.engagementId,
    eventType: "engagement.presentation_profile_updated",
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetType: "engagement",
    targetId: params.engagementId,
    previousState: existing.presentationProfile ?? "generic",
    newState: profile,
    description: `Presentation profile updated to ${profile} (${version})`,
    metadata: {
      presentationProfile: profile,
      presentationProfileVersion: version,
      presentationPolicyId: policyId,
    },
  });

  const { rebuildFinancialStatementsAfterProfileChange } = await import(
    "@/lib/audit/presentation/presentation-profile-rebuild"
  );
  const fsRebuild = await rebuildFinancialStatementsAfterProfileChange(
    params.engagementId,
  );

  if (fsRebuild.status === "rebuilt") {
    await db.recordAuditEvent({
      engagementId: params.engagementId,
      eventType: "engagement.presentation_profile_fs_rebuilt",
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      targetType: "engagement",
      targetId: params.engagementId,
      description: `Financial statements rebuilt after presentation profile change (${fsRebuild.method})`,
      metadata: {
        presentationProfile: profile,
        rebuildMethod: fsRebuild.method,
        statementCount: fsRebuild.statementCount,
      },
    });
  }

  return { engagement, fsRebuild };
}

export async function archiveEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<void> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  await db.archiveEngagement(engagementId, actorId, actorName);
}

export async function restoreEngagement(
  engagementId: string,
  actorId: string,
  actorName: string,
): Promise<string> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.restoreEngagement(engagementId, actorId, actorName);
}
