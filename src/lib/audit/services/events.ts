/**
 * Audit Services — Events domain
 *
 * Audit events, traceability, users.
 */

import type { AuditEvent } from "@/types/audit";
import * as mock from "../mock-data";
import { getDb, tryDb } from "./common";

export async function getAuditEvents(
  engagementId: string,
): Promise<AuditEvent[]> {
  return tryDb(
    () =>
      engagementId === mock.mockEngagement.id
        ? Promise.resolve(mock.mockAuditEvents)
        : Promise.resolve([]),
    (db) => db.getAuditEvents(engagementId),
  );
}

export async function recordAuditEvent(params: {
  engagementId: string;
  eventType: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  previousState?: string;
  newState?: string;
  description: string;
  aiRelated?: boolean;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const db = await getDb();
  const event = await db.recordAuditEvent(params);

  // Dual-write to PlatformAuditLog (safe mode — never blocks)
  try {
    const { writePlatformAuditLog } = await import("@/lib/platform/audit-log");
    const { appendToAuditChain } = await import("@/lib/platform/audit/audit-store");
    const { getProjectByEngagementId } =
      await import("@/lib/platform/project-context");
    const { getClientWorkspaceById } =
      await import("@/lib/platform/client-workspace-context");
    const { getPlatformOrganizationById } =
      await import("@/lib/platform/platform-organization-context");

    let projectId: string | undefined;
    let workspaceId: string | undefined;
    let platformOrgId: string | undefined;

    try {
      const project = await getProjectByEngagementId(params.engagementId);
      projectId = project.projectId;
      workspaceId = project.workspaceId;
      const workspace = await getClientWorkspaceById(workspaceId);
      const platformOrg = await getPlatformOrganizationById(
        workspace.platformOrganizationId,
      );
      platformOrgId = platformOrg.platformOrganizationId;
    } catch {
      // Context resolution is best-effort
    }

    await writePlatformAuditLog({
      productKey: "audit_os",
      action: params.eventType,
      platformOrganizationId: platformOrgId,
      clientWorkspaceId: workspaceId,
      projectId,
      actorId: params.actorId,
      actorType: "user",
      actorName: params.actorName,
      targetType: params.targetType,
      targetId: params.targetId,
      severity: params.aiRelated ? "info" : "info",
      status: "recorded",
      sourceSystem: "audit_os",
      sourceModel: "AuditEvent",
      sourceId: event.id,
      metadata: {
        originalId: event.id,
        dualWrite: true,
        engagementId: params.engagementId,
        previousState: params.previousState,
        newState: params.newState,
        aiRelated: params.aiRelated,
      },
    }).then(async (platformResult) => {
      if (platformResult?.ok && platformResult?.id) {
        await appendToAuditChain(
          platformResult.id,
          params.eventType,
          params.actorId,
        );
      }
    });
  } catch {
    // Dual-write failure must never affect the primary action
  }
}

export async function getTraceability(
  engagementId: string,
  targetType: string,
  targetId: string,
) {
  return tryDb(
    () =>
      Promise.resolve({
        targetType,
        targetId,
        forwardTrace: [
          {
            type: "source_data",
            label: "Trial Balance Entry",
            status: "imported",
          },
          { type: "account", label: "Mapped Account", status: "mapped" },
          { type: "evidence", label: "Linked Evidence", status: "accepted" },
          { type: "finding", label: "Related Finding", status: "open" },
          {
            type: "recommendation",
            label: "Recommendation",
            status: "under_review",
          },
        ],
        backwardTrace: [
          { type: "publication", label: "Published Output", status: "draft" },
          { type: "approval", label: "Approval Record", status: "pending" },
        ],
      }),
    (db) => db.getTraceability(engagementId, targetType, targetId),
  );
}

export async function getFullTraceability(
  engagementId: string,
  statementLineLabel: string,
) {
  return tryDb(
    () =>
      Promise.resolve({
        targetLabel: statementLineLabel,
        nodes: [],
        message: "No traceability data available",
      }),
    (db) => db.getFullTraceability(engagementId, statementLineLabel),
  );
}

export async function getAuditUsers(organizationId?: string) {
  return tryDb(
    () => Promise.resolve(mock.mockUsers),
    (db) => db.getAuditUsers(organizationId),
  );
}
