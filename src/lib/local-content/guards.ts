// LocalContentOS project access guards
// Verifies authenticated user has access to the target project.
// Uses existing AQLIYA auth layer — no new auth system.

import "server-only";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, type CurrentUser } from "@/lib/auth";

export interface ProjectAccessContext {
  user: CurrentUser;
  project: {
    id: string;
    organizationId: string;
    name: string;
    status: string;
    platformOrganizationId: string | null;
    clientWorkspaceId: string | null;
    projectId: string | null;
  };
}

export type ProjectAction =
  | "view"
  | "create_supplier"
  | "create_spend"
  | "classify"
  | "create_evidence"
  | "review_evidence"
  | "manage_findings"
  | "review"
  | "approve"
  | "admin";

export function canPerformAction(
  user: CurrentUser,
  action: ProjectAction,
): boolean {
  const role = user.role;
  switch (action) {
    case "view":
      return true;
    case "create_supplier":
    case "create_spend":
    case "create_evidence":
      return role === "ADMIN" || role === "OPERATOR";
    case "classify":
    case "review_evidence":
    case "manage_findings":
    case "review":
      return role === "ADMIN" || role === "OPERATOR";
    case "approve":
    case "admin":
      return role === "ADMIN";
    default:
      return false;
  }
}

export class ProjectAccessError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "ProjectAccessError";
    this.code = code;
  }
}

export async function assertProjectAccess(
  projectId: string,
  action: ProjectAction,
): Promise<ProjectAccessContext> {
  const user = await getCurrentUser();

  if (!canPerformAction(user, action)) {
    throw new ProjectAccessError(
      "Access denied: insufficient role for this action",
      "FORBIDDEN",
    );
  }

  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      organizationId: true,
      name: true,
      status: true,
      platformOrganizationId: true,
      clientWorkspaceId: true,
      projectId: true,
    },
  });

  if (!project) {
    throw new ProjectAccessError("Project not found", "NOT_FOUND");
  }

  if (project.organizationId !== user.organizationId) {
    throw new ProjectAccessError(
      "Access denied: project belongs to another organization",
      "FORBIDDEN",
    );
  }

  return { user, project };
}

export async function resolveProjectContext(projectId: string): Promise<{
  platformOrganizationId: string | null;
  clientWorkspaceId: string | null;
  projectId: string | null;
} | null> {
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: {
      platformOrganizationId: true,
      clientWorkspaceId: true,
      projectId: true,
    },
  });
  return project ?? null;
}
