import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
  assertLocalContentGovernanceTransition,
  type CreateProjectInput,
} from "./common";

export async function listProjectsByOrganization(
  organizationId: string,
): Promise<
  {
    id: string;
    name: string;
    reportingPeriod: string;
    status: string;
    localContentScore: number | null;
    createdAt: Date;
  }[]
> {
  return prisma.localContentProject.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      reportingPeriod: true,
      status: true,
      localContentScore: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getProjectById(projectId: string) {
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    include: {
      suppliers: true,
      spendRecords: true,
      classifications: true,
      evidence: true,
      findings: true,
      reviews: { orderBy: { createdAt: "desc" } },
      approvals: { orderBy: { createdAt: "desc" } },
      reports: { orderBy: { createdAt: "desc" } },
    },
  });
  return project;
}

export async function createProject(input: CreateProjectInput) {
  const project = await prisma.localContentProject.create({
    data: {
      organizationId: input.organizationId,
      name: input.name,
      reportingPeriod: input.reportingPeriod,
      scopeDescription: input.scopeDescription ?? null,
      platformOrganizationId: input.platformOrganizationId ?? null,
      clientWorkspaceId: input.clientWorkspaceId ?? null,
      projectId: input.projectId ?? null,
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });

  await createLocalContentAuditEvent({
    projectId: project.id,
    actorId: input.createdById ?? "system",
    actorName: input.createdByName ?? "System",
    action: AuditActions.PROJECT_CREATED,
    entityType: "LocalContentProject",
    entityId: project.id,
    after: JSON.stringify({
      name: project.name,
      reportingPeriod: project.reportingPeriod,
    }),
  });

  return project;
}

export async function updateProjectStatus(
  projectId: string,
  status: string,
  actor?: { id: string; name: string },
) {
  const old = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: { status: true, localContentScore: true, organizationId: true },
  });

  if (old?.status && old.status !== status) {
    assertLocalContentGovernanceTransition(old.status, status);
  }

  const project = await prisma.localContentProject.update({
    where: { id: projectId },
    data: { status },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: project.id,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.PROJECT_UPDATED,
      entityType: "LocalContentProject",
      entityId: project.id,
      before: JSON.stringify({ status: old?.status }),
      after: JSON.stringify({ status }),
    });
  }

  return project;
}
