import {
  prisma,
  createLocalContentAuditEvent,
  AuditActions,
  buildOrganizationSpendAnalytics,
  buildTenderMatchReport,
  DEFAULT_TENDER_SPEC,
  parseTenderSpecFromMetadata,
  parseClassificationRulesFromMetadata,
  resolveClassificationRules,
  buildVerificationChecklistReport,
  mergeVerificationChecklistUpdate,
  type VerificationChecklistReport,
  type Prisma,
} from "./common";

export async function listReports(projectId: string) {
  return prisma.localContentReport.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createReport(input: {
  projectId: string;
  reportType: string;
  format: string;
  generatedById?: string;
  generatedByName?: string;
  disclaimer?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.localContentReport.create({
    data: {
      projectId: input.projectId,
      reportType: input.reportType,
      format: input.format,
      generatedById: input.generatedById ?? null,
      generatedByName: input.generatedByName ?? null,
      disclaimer: input.disclaimer ?? null,
      metadata: (input.metadata ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
    },
  });
}

/** LC-06 — org-wide spend analytics dashboard data */
export async function getOrganizationSpendAnalytics(organizationId: string) {
  const projects = await prisma.localContentProject.findMany({
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
  const enriched = await Promise.all(
    projects.map(async (p) => {
      const spendRecords = await prisma.localContentSpendRecord.findMany({
        where: { projectId: p.id },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              localityClassification: true,
              localContentPercentage: true,
              ownershipType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      return {
        id: p.id,
        name: p.name,
        reportingPeriod: p.reportingPeriod,
        status: p.status,
        spendRecords: spendRecords.map((sr) => ({
          amount: sr.amount,
          category: sr.category,
          period: sr.period,
          recordCreatedAt: sr.createdAt.toISOString(),
          supplier: {
            localityClassification:
              sr.supplier?.localityClassification ?? null,
            localContentPercentage:
              sr.supplier?.localContentPercentage ?? null,
            ownershipType: sr.supplier?.ownershipType ?? null,
          },
        })),
      };
    }),
  );
  return buildOrganizationSpendAnalytics({ projects: enriched });
}

/** LC-02 — tender requirement matching for a project */
export async function getProjectTenderMatchReport(projectId: string) {
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      metadata: true,
    },
  });
  if (!project) {
    throw new Error("Project not found");
  }

  const [suppliers, spendRecords] = await Promise.all([
    prisma.localContentSupplier.findMany({
      where: { projectId },
      select: { localityClassification: true },
      take: 100,
    }),
    prisma.localContentSpendRecord.findMany({
      where: { projectId },
      select: {
        amount: true,
        category: true,
        supplier: {
          select: {
            localityClassification: true,
            localContentPercentage: true,
            ownershipType: true,
          },
        },
      },
      take: 100,
    }),
  ]);

  const tender =
    parseTenderSpecFromMetadata(project.metadata) ?? DEFAULT_TENDER_SPEC;

  return buildTenderMatchReport({
    projectName: project.name,
    tender,
    suppliers,
    spendRecords: spendRecords.map((sr) => ({
      amount: sr.amount,
      category: sr.category,
      supplier: sr.supplier,
    })),
  });
}

/** LC-04 — org classification rules (project metadata override or defaults) */
export async function getOrganizationClassificationRules(
  organizationId: string,
) {
  const project = await prisma.localContentProject.findFirst({
    where: { organizationId },
    orderBy: { updatedAt: "desc" },
    select: { metadata: true },
  });
  const fromMeta = parseClassificationRulesFromMetadata(project?.metadata);
  return {
    rules: resolveClassificationRules(project?.metadata),
    source: fromMeta ? ("metadata" as const) : ("default" as const),
  };
}

/** LC verification matrix checklist (knowledge JSON + project metadata progress) */
export async function getProjectVerificationChecklistReport(
  projectId: string,
): Promise<VerificationChecklistReport> {
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: { metadata: true },
  });
  if (!project) {
    throw new Error("Project not found");
  }
  return buildVerificationChecklistReport(project.metadata);
}

export async function updateVerificationChecklistItem(
  projectId: string,
  itemId: string,
  input: { scale: string; workingPaperRef?: string },
  actor: { id: string; name: string },
) {
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    select: { metadata: true, name: true },
  });
  if (!project) {
    throw new Error("Project not found");
  }

  const nextMetadata = mergeVerificationChecklistUpdate(
    project.metadata,
    itemId,
    {
      scale: input.scale.trim(),
      workingPaperRef: input.workingPaperRef?.trim() || undefined,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.name,
    },
  );

  const updated = await prisma.localContentProject.update({
    where: { id: projectId },
    data: { metadata: nextMetadata as Prisma.InputJsonValue },
  });

  await createLocalContentAuditEvent({
    projectId,
    actorId: actor.id,
    actorName: actor.name,
    action: AuditActions.PROJECT_UPDATED,
    entityType: "LocalContentProject",
    entityId: projectId,
    after: JSON.stringify({
      verificationItemId: itemId,
      scale: input.scale,
      workingPaperRef: input.workingPaperRef ?? "",
    }),
    metadata: { verificationChecklistItem: itemId },
  });

  return updated;
}
