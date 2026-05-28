// LocalContentOS domain services
// Stateless service functions for all CRUD operations.
// Audit events are emitted for every mutation.
// Tenant scoping is enforced via project-level organizationId checks.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { createLocalContentAuditEvent, AuditActions } from "./audit-events";
import type { ScoringResult } from "./types";
import { calculateFullScoring } from "./scoring";
import type {
  CreateProjectInput,
  CreateSupplierInput,
  CreateSpendRecordInput,
  CreateClassificationInput,
  CreateFindingInput,
} from "./types";

// ─── Project CRUD ───

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
    select: { status: true, localContentScore: true },
  });

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

// ─── Supplier CRUD ───

export async function listSuppliers(projectId: string) {
  return prisma.localContentSupplier.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSupplier(
  input: CreateSupplierInput,
  actor?: { id: string; name: string },
) {
  const supplier = await prisma.localContentSupplier.create({
    data: {
      projectId: input.projectId,
      name: input.name,
      crNumber: input.crNumber ?? null,
      localityClassification: input.localityClassification ?? null,
      localContentPercentage: input.localContentPercentage ?? null,
      ownershipType: input.ownershipType ?? null,
      workforceLocalPct: input.workforceLocalPct ?? null,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: supplier.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SUPPLIER_CREATED,
      entityType: "LocalContentSupplier",
      entityId: supplier.id,
      after: JSON.stringify({
        name: supplier.name,
        localityClassification: supplier.localityClassification,
      }),
    });
  }

  return supplier;
}

export async function deleteSupplier(
  projectId: string,
  supplierId: string,
  actor?: { id: string; name: string },
) {
  const supplier = await prisma.localContentSupplier.findUnique({
    where: { id: supplierId },
    select: { projectId: true, name: true },
  });
  if (!supplier || supplier.projectId !== projectId) {
    throw new Error("Supplier not found");
  }

  await prisma.localContentSupplier.delete({
    where: { id: supplierId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SUPPLIER_DELETED,
      entityType: "LocalContentSupplier",
      entityId: supplierId,
      before: JSON.stringify({ name: supplier.name }),
    });
  }
}

// ─── Spend Record CRUD ───

export async function listSpendRecords(projectId: string) {
  return prisma.localContentSpendRecord.findMany({
    where: { projectId },
    include: {
      supplier: {
        select: {
          id: true,
          name: true,
          localityClassification: true,
          localContentPercentage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createSpendRecord(
  input: CreateSpendRecordInput,
  actor?: { id: string; name: string },
) {
  const record = await prisma.localContentSpendRecord.create({
    data: {
      projectId: input.projectId,
      supplierId: input.supplierId,
      amount: input.amount,
      currency: input.currency ?? "SAR",
      category: input.category,
      contractReference: input.contractReference ?? null,
      period: input.period,
      description: input.description ?? null,
    },
    include: { supplier: { select: { name: true } } },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: record.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SPEND_CREATED,
      entityType: "LocalContentSpendRecord",
      entityId: record.id,
      after: JSON.stringify({
        amount: record.amount,
        category: record.category,
        supplier: record.supplier.name,
      }),
    });
  }

  return record;
}

export async function deleteSpendRecord(
  projectId: string,
  recordId: string,
  actor?: { id: string; name: string },
) {
  const record = await prisma.localContentSpendRecord.findUnique({
    where: { id: recordId },
    select: { projectId: true, amount: true, category: true },
  });
  if (!record || record.projectId !== projectId) {
    throw new Error("Spend record not found");
  }

  await prisma.localContentSpendRecord.delete({
    where: { id: recordId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.SPEND_DELETED,
      entityType: "LocalContentSpendRecord",
      entityId: recordId,
      before: JSON.stringify({
        amount: record.amount,
        category: record.category,
      }),
    });
  }
}

// ─── Classification CRUD ───

export async function listClassifications(projectId: string) {
  return prisma.localContentClassification.findMany({
    where: { projectId },
    include: {
      supplier: { select: { id: true, name: true } },
      spendRecord: { select: { id: true, amount: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createClassification(
  input: CreateClassificationInput,
  actor?: { id: string; name: string },
) {
  const classification = await prisma.localContentClassification.create({
    data: {
      projectId: input.projectId,
      supplierId: input.supplierId ?? null,
      spendRecordId: input.spendRecordId ?? null,
      classifiedBy: input.classifiedBy ?? actor?.id ?? null,
      localPercentage: input.localPercentage,
      classificationBasis: input.classificationBasis,
      confidence: input.confidence ?? "unverified",
      notes: input.notes ?? null,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: classification.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.CLASSIFICATION_CREATED,
      entityType: "LocalContentClassification",
      entityId: classification.id,
      after: JSON.stringify({
        localPercentage: classification.localPercentage,
        basis: classification.classificationBasis,
      }),
    });
  }

  return classification;
}

// ─── Evidence CRUD ───

export async function listEvidence(projectId: string) {
  return prisma.localContentEvidence.findMany({
    where: { projectId },
    include: {
      supplier: { select: { id: true, name: true } },
      spendRecord: { select: { id: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createEvidenceEntry(
  input: {
    projectId: string;
    supplierId?: string;
    spendRecordId?: string;
    filename: string;
    fileType: string;
    mimeType?: string;
    storageKey?: string;
    fileHash?: string;
    sizeBytes?: number;
    evidenceType: string;
  },
  actor?: { id: string; name: string },
) {
  const evidence = await prisma.localContentEvidence.create({
    data: {
      projectId: input.projectId,
      supplierId: input.supplierId ?? null,
      spendRecordId: input.spendRecordId ?? null,
      filename: input.filename,
      fileType: input.fileType,
      mimeType: input.mimeType ?? null,
      storageKey: input.storageKey ?? null,
      fileHash: input.fileHash ?? null,
      sizeBytes: input.sizeBytes ?? null,
      evidenceType: input.evidenceType,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: evidence.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.EVIDENCE_UPLOADED,
      entityType: "LocalContentEvidence",
      entityId: evidence.id,
      after: JSON.stringify({
        filename: evidence.filename,
        evidenceType: evidence.evidenceType,
      }),
    });
  }

  return evidence;
}

export async function deleteEvidence(
  projectId: string,
  evidenceId: string,
  actor?: { id: string; name: string },
) {
  const ev = await prisma.localContentEvidence.findUnique({
    where: { id: evidenceId },
    select: { projectId: true, filename: true, evidenceType: true },
  });
  if (!ev || ev.projectId !== projectId) {
    throw new Error("Evidence not found");
  }

  await prisma.localContentEvidence.delete({
    where: { id: evidenceId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.EVIDENCE_DELETED,
      entityType: "LocalContentEvidence",
      entityId: evidenceId,
      before: JSON.stringify({
        filename: ev.filename,
        evidenceType: ev.evidenceType,
      }),
    });
  }
}

// ─── Finding CRUD ───

export async function listFindings(projectId: string) {
  return prisma.localContentFinding.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteFinding(
  projectId: string,
  findingId: string,
  actor?: { id: string; name: string },
) {
  const finding = await prisma.localContentFinding.findUnique({
    where: { id: findingId },
    select: { projectId: true, title: true, type: true },
  });
  if (!finding || finding.projectId !== projectId) {
    throw new Error("Finding not found");
  }

  await prisma.localContentFinding.delete({
    where: { id: findingId },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.FINDING_DELETED,
      entityType: "LocalContentFinding",
      entityId: findingId,
      before: JSON.stringify({
        title: finding.title,
        type: finding.type,
      }),
    });
  }
}

export async function createFinding(
  input: CreateFindingInput,
  actor?: { id: string; name: string },
) {
  const finding = await prisma.localContentFinding.create({
    data: {
      projectId: input.projectId,
      type: input.type,
      severity: input.severity ?? "medium",
      title: input.title,
      description: input.description,
      linkedSupplierId: input.linkedSupplierId ?? null,
      linkedSpendRecordId: input.linkedSpendRecordId ?? null,
      createdById: input.createdById ?? actor?.id ?? null,
      createdByName: input.createdByName ?? actor?.name ?? null,
    },
  });

  if (actor) {
    await createLocalContentAuditEvent({
      projectId: finding.projectId,
      actorId: actor.id,
      actorName: actor.name,
      action: AuditActions.FINDING_CREATED,
      entityType: "LocalContentFinding",
      entityId: finding.id,
      after: JSON.stringify({
        title: finding.title,
        type: finding.type,
        severity: finding.severity,
      }),
    });
  }

  return finding;
}

// ─── Review CRUD ───

export async function listReviews(projectId: string) {
  return prisma.localContentReview.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(input: {
  projectId: string;
  reviewerId: string;
  reviewerName: string;
  action: string;
  comments?: string;
}) {
  const review = await prisma.localContentReview.create({
    data: {
      projectId: input.projectId,
      reviewerId: input.reviewerId,
      reviewerName: input.reviewerName,
      action: input.action,
      comments: input.comments ?? null,
    },
  });

  await createLocalContentAuditEvent({
    projectId: review.projectId,
    actorId: input.reviewerId,
    actorName: input.reviewerName,
    action: AuditActions.REVIEW_SUBMITTED,
    entityType: "LocalContentReview",
    entityId: review.id,
    metadata: { action: input.action },
  });

  return review;
}

// ─── Approval CRUD ───

export async function listApprovals(projectId: string) {
  return prisma.localContentApproval.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function createApproval(input: {
  projectId: string;
  approverId: string;
  approverName: string;
  decision: string;
  comments?: string;
  snapshot?: Record<string, unknown>;
}) {
  const approval = await prisma.localContentApproval.create({
    data: {
      projectId: input.projectId,
      approverId: input.approverId,
      approverName: input.approverName,
      decision: input.decision,
      comments: input.comments ?? null,
      approvalSnapshot: (input.snapshot ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  await createLocalContentAuditEvent({
    projectId: approval.projectId,
    actorId: input.approverId,
    actorName: input.approverName,
    action: AuditActions.APPROVAL_DECIDED,
    entityType: "LocalContentApproval",
    entityId: approval.id,
    after: JSON.stringify({ decision: approval.decision }),
  });

  return approval;
}

// ─── Audit Trail ───

export async function listAuditEvents(projectId: string) {
  return prisma.localContentAuditEvent.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Scoring ───

export async function calculateProjectScore(
  projectId: string,
): Promise<ScoringResult> {
  const [
    project,
    suppliers,
    spendRecords,
    classifications,
    evidence,
    findings,
  ] = await Promise.all([
    prisma.localContentProject.findUnique({
      where: { id: projectId },
      select: { id: true },
    }),
    prisma.localContentSupplier.findMany({
      where: { projectId },
      select: {
        localityClassification: true,
        localContentPercentage: true,
        ownershipType: true,
      },
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
    }),
    prisma.localContentClassification.findMany({
      where: { projectId },
      select: {
        localPercentage: true,
        reviewStatus: true,
        classificationBasis: true,
      },
    }),
    prisma.localContentEvidence.findMany({
      where: { projectId },
      select: { status: true },
    }),
    prisma.localContentFinding.findMany({
      where: { projectId },
      select: { severity: true, status: true },
    }),
  ]);

  if (!project) throw new Error("Project not found");

  return calculateFullScoring({
    suppliers: suppliers.map((s) => ({
      localityClassification: s.localityClassification,
      localContentPercentage: s.localContentPercentage,
      ownershipType: s.ownershipType,
    })),
    spendRecords: spendRecords.map((sr) => ({
      amount: sr.amount,
      category: sr.category,
      supplier: {
        localityClassification: sr.supplier.localityClassification,
        localContentPercentage: sr.supplier.localContentPercentage,
        ownershipType: sr.supplier.ownershipType,
      },
    })),
    classifications: classifications.map((c) => ({
      localPercentage: c.localPercentage,
      reviewStatus: c.reviewStatus,
      classificationBasis: c.classificationBasis,
    })),
    evidence: evidence.map((e) => ({ status: e.status })),
    findings: findings.map((f) => ({ severity: f.severity, status: f.status })),
  });
}

// ─── Report CRUD ───

export async function listReports(projectId: string) {
  return prisma.localContentReport.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
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
