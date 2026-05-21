// ─── Workspace Guard (Report-Only Mode) ───
// Diagnoses workspace and project consistency without enforcing access globally.
// Default mode is report-only / non-blocking.

import type { CurrentUser } from "@/lib/auth";
import {
  getClientWorkspaceByAuditClientId,
  getClientWorkspaceById,
  ClientWorkspaceNotFoundError,
  ClientWorkspaceUnlinkedError,
} from "@/lib/platform/client-workspace-context";
import {
  getProjectByEngagementId,
  ProjectNotFoundError,
  ProjectUnlinkedError,
} from "@/lib/platform/project-context";

// ─── Types ───

export interface WorkspaceGuardReport {
  ok: boolean;
  severity: "ok" | "warning" | "error";
  workspaceId: string | null;
  workspaceName: string | null;
  platformOrganizationId: string | null;
  warnings: string[];
  errors: string[];
}

export interface WorkspaceGuardOptions {
  throwOnError?: boolean;
  requireActive?: boolean;
  expectedPlatformOrganizationId?: string;
}

export interface WorkspaceGuardInput {
  workspaceId?: string;
  auditClientId?: string;
  auditEngagementId?: string;
}

// ─── Guard Report ───

export async function getWorkspaceGuardReport(
  input: WorkspaceGuardInput,
  options?: WorkspaceGuardOptions,
): Promise<WorkspaceGuardReport> {
  const report: WorkspaceGuardReport = {
    ok: true,
    severity: "ok",
    workspaceId: null,
    workspaceName: null,
    platformOrganizationId: null,
    warnings: [],
    errors: [],
  };

  // Resolve workspace from any available identifier
  let workspace = null;

  if (input.workspaceId) {
    try {
      workspace = await getClientWorkspaceById(input.workspaceId);
    } catch (e) {
      if (e instanceof ClientWorkspaceNotFoundError) {
        report.errors.push(`Workspace not found: ${input.workspaceId}`);
      } else {
        report.errors.push(
          `Error resolving workspace: ${e instanceof Error ? e.message : "Unknown"}`,
        );
      }
    }
  } else if (input.auditClientId) {
    try {
      workspace = await getClientWorkspaceByAuditClientId(input.auditClientId);
    } catch (e) {
      if (e instanceof ClientWorkspaceUnlinkedError) {
        report.warnings.push(
          `AuditClient ${input.auditClientId} is not linked to any workspace`,
        );
      } else if (e instanceof ClientWorkspaceNotFoundError) {
        report.errors.push(`AuditClient not found: ${input.auditClientId}`);
      } else {
        report.errors.push(
          `Error resolving workspace from audit client: ${e instanceof Error ? e.message : "Unknown"}`,
        );
      }
    }
  }

  if (workspace) {
    report.workspaceId = workspace.clientWorkspaceId;
    report.workspaceName = workspace.name;
    report.platformOrganizationId = workspace.platformOrganizationId;

    // Check workspace status
    if (options?.requireActive && workspace.status !== "active") {
      report.ok = false;
      report.severity = "warning";
      report.warnings.push(
        `Workspace "${workspace.name}" has status "${workspace.status}"`,
      );
    }

    // Check platform org match
    if (
      options?.expectedPlatformOrganizationId &&
      workspace.platformOrganizationId !==
        options.expectedPlatformOrganizationId
    ) {
      report.ok = false;
      report.severity = "error";
      report.errors.push(
        `Workspace "${workspace.name}" belongs to org ${workspace.platformOrganizationId}, expected ${options.expectedPlatformOrganizationId}`,
      );
    }

    // Check engagement link if provided
    if (input.auditEngagementId) {
      try {
        const project = await getProjectByEngagementId(input.auditEngagementId);
        if (project.workspaceId !== workspace.clientWorkspaceId) {
          report.ok = false;
          report.severity = "error";
          report.errors.push(
            `Engagement ${input.auditEngagementId} project belongs to workspace ${project.workspaceId}, not ${workspace.clientWorkspaceId}`,
          );
        }
      } catch (e) {
        if (e instanceof ProjectUnlinkedError) {
          report.warnings.push(
            `Engagement ${input.auditEngagementId} is not linked to any project`,
          );
        } else if (e instanceof ProjectNotFoundError) {
          report.errors.push(
            `Engagement not found: ${input.auditEngagementId}`,
          );
        } else {
          report.errors.push(
            `Error resolving project from engagement: ${e instanceof Error ? e.message : "Unknown"}`,
          );
        }
      }
    }
  }

  if (report.errors.length > 0) {
    report.ok = false;
    report.severity = "error";
  }

  if (options?.throwOnError && !report.ok) {
    const messages = [...report.errors, ...report.warnings];
    throw new Error(`Workspace guard failed: ${messages.join("; ")}`);
  }

  return report;
}

export async function assertWorkspaceContext(
  input: WorkspaceGuardInput,
  options?: WorkspaceGuardOptions,
): Promise<WorkspaceGuardReport> {
  return getWorkspaceGuardReport(input, options);
}

export async function requireWorkspace(
  input: WorkspaceGuardInput,
  options?: Omit<WorkspaceGuardOptions, "throwOnError">,
): Promise<WorkspaceGuardReport> {
  return getWorkspaceGuardReport(input, { ...options, throwOnError: true });
}
