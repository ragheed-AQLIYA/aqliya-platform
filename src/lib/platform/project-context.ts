// ─── Project Context ───
// Read-only helpers for resolving Project from various identifiers.
// Does not modify database records, auth sessions, or tenant guards.

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface ProjectContext {
  projectId: string;
  workspaceId: string;
  name: string;
  projectType: string;
  status: string;
  source: "project_id" | "audit_engagement";
  auditEngagementId: string | null;
}

export type ProjectLookup =
  | { type: "project_id"; value: string }
  | { type: "audit_engagement_id"; value: string };

// ─── Error Classes ───

export class ProjectNotFoundError extends Error {
  constructor(lookup: string) {
    super(`Project not found: ${lookup}`);
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectUnlinkedError extends Error {
  constructor(entityType: string, entityId: string) {
    super(`${entityType} ${entityId} is not linked to any Project`);
    this.name = "ProjectUnlinkedError";
  }
}

// ─── Core Helpers ───

function toContext(
  p: {
    id: string;
    workspaceId: string;
    name: string;
    projectType: string;
    status: string;
  },
  source: ProjectContext["source"],
  auditEngagementId: string | null,
): ProjectContext {
  return {
    projectId: p.id,
    workspaceId: p.workspaceId,
    name: p.name,
    projectType: p.projectType,
    status: p.status,
    source,
    auditEngagementId,
  };
}

export async function getProjectById(
  projectId: string,
): Promise<ProjectContext> {
  const p = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!p) {
    throw new ProjectNotFoundError(`id="${projectId}"`);
  }

  return toContext(p, "project_id", null);
}

export async function getProjectByEngagementId(
  auditEngagementId: string,
): Promise<ProjectContext> {
  const eng = await prisma.auditEngagement.findUnique({
    where: { id: auditEngagementId },
    select: {
      projectId: true,
      project: {
        select: {
          id: true,
          workspaceId: true,
          name: true,
          projectType: true,
          status: true,
        },
      },
    },
  });

  if (!eng) {
    throw new ProjectNotFoundError(
      `auditEngagement id="${auditEngagementId}" not found`,
    );
  }

  if (!eng.project || !eng.projectId) {
    throw new ProjectUnlinkedError("AuditEngagement", auditEngagementId);
  }

  return toContext(eng.project, "audit_engagement", auditEngagementId);
}

export async function listProjectsForWorkspace(
  workspaceId: string,
): Promise<ProjectContext[]> {
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    orderBy: { name: "asc" },
  });

  return projects.map((p) => toContext(p, "project_id", null));
}

export async function resolveProjectContext(
  lookup: ProjectLookup,
): Promise<ProjectContext> {
  switch (lookup.type) {
    case "project_id":
      return getProjectById(lookup.value);
    case "audit_engagement_id":
      return getProjectByEngagementId(lookup.value);
  }
}

export async function assertProjectLinked(
  lookup: ProjectLookup,
  options?: { requireActive?: boolean },
): Promise<ProjectContext> {
  const ctx = await resolveProjectContext(lookup);

  if (options?.requireActive && ctx.status !== "active") {
    throw new Error(`Project ${ctx.projectId} has status "${ctx.status}"`);
  }

  return ctx;
}
