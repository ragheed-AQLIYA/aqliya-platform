"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { getStorageProvider } from "@/lib/platform/storage";
import { notifyOnEvent } from "@/lib/platform/notification/integration";
import {
  listProjectsByOrganization,
  getProjectById,
  createProject,
  updateProjectStatus,
  listSuppliers,
  createSupplier,
  deleteSupplier,
  listSpendRecords,
  createSpendRecord,
  deleteSpendRecord,
  createClassification,
  listEvidence,
  createEvidenceEntry,
  deleteEvidence,
  listFindings,
  createFinding,
  deleteFinding,
  listReviews,
  createReview,
  listApprovals,
  createApproval,
  getProjectApprovalRoutingState,
  listAuditEvents,
  calculateProjectScore,
  getOrganizationSpendAnalytics,
  getProjectTenderMatchReport,
  getOrganizationClassificationRules,
  getProjectVerificationChecklistReport,
  updateVerificationChecklistItem,
  listReports,
  createReport,
} from "@/lib/local-content/services";
import {
  assertProjectAccess,
  resolveProjectContext,
  ProjectAccessError,
} from "@/lib/local-content/guards";
import {
  extractLocalContentSignalsFromEngagement,
  summarizeLocalContentSignals,
  estimateLocalContentPercent,
} from "@/lib/local-content-intelligence";
import { resolveAuditEngagementIdForLcProject } from "@/lib/local-content-intelligence/audit-engagement-bridge";
import { parseLocalContentCSV } from "@/lib/local-content/import";
import { parseOrError } from "@/lib/local-content/schemas/common";
import {
  createEvidenceSchema,
  updateEvidenceStatusSchema,
  uploadEvidenceFileSchema,
} from "@/lib/local-content/schemas/evidence";
import {
  createFindingSchema,
  updateFindingSchema,
} from "@/lib/local-content/schemas/finding";
import {
  submitReviewSchema,
  submitApprovalSchema,
} from "@/lib/local-content/schemas/review";
import {
  createSpendRecordSchema,
  classifySpendRecordSchema,
  importSpendCsvSchema,
} from "@/lib/local-content/schemas/spend";
import { createProjectSchema, updateVerificationItemSchema } from "@/lib/local-content/schemas/project";
import {
  createSupplierSchema,
  updateSupplierSchema,
} from "@/lib/local-content/schemas/supplier";
import { generateReportSchema } from "@/lib/local-content/schemas/report";

// ─── Result types ───

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ProjectAccessError) {
      return { ok: false, error: error.message, code: error.code };
    }
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "Access denied", code: "FORBIDDEN" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[LocalContentOS Action]", message);
    return { ok: false, error: message };
  }
}

// ─── Platform audit helper ───

async function logToPlatform(params: {
  projectId: string;
  user: { id: string; name: string; email: string };
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const context = await resolveProjectContext(params.projectId);
    const alog = auditLogger({
      productKey: Product.LOCAL_CONTENT,
      sourceSystem: "localcontent_compliance",
      organization: {
        platformOrganizationId: context?.platformOrganizationId ?? undefined,
        clientWorkspaceId: context?.clientWorkspaceId ?? undefined,
        projectId: context?.projectId ?? undefined,
      },
      actor: {
        id: params.user.id,
        name: params.user.name,
        email: params.user.email,
        type: "user",
      },
    });
    await alog.record(
      params.action,
      {
        type: params.targetType,
        id: params.targetId,
      },
      {
        severity: "info",
        status: "recorded",
        sourceModel: params.targetType,
        sourceId: params.targetId,
        metadata: params.metadata,
      },
    );
  } catch {
    // Dual-write must not block the primary action
  }
}

// ─── Project Actions ───

export async function listLocalContentProjectsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listProjectsByOrganization>>>
> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return listProjectsByOrganization(user.organizationId);
  });
}

export async function getLocalContentSpendAnalyticsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getOrganizationSpendAnalytics>>>
> {
  return safe(async () => {
    const user = await requireUserContext("VIEWER");
    return getOrganizationSpendAnalytics(user.organizationId);
  });
}

export async function getLocalContentClassificationRulesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getOrganizationClassificationRules>>>
> {
  return safe(async () => {
    const user = await requireUserContext("OPERATOR");
    return getOrganizationClassificationRules(user.organizationId);
  });
}

export async function getLocalContentTenderMatchAction(
  projectId: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getProjectTenderMatchReport>>>
> {
  return safe(async () => {
    const _user = await requireUserContext("VIEWER");
    await assertProjectAccess(projectId, "view");
    return getProjectTenderMatchReport(projectId);
  });
}

export async function getLocalContentVerificationChecklistAction(
  projectId: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getProjectVerificationChecklistReport>>>
> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return getProjectVerificationChecklistReport(projectId);
  });
}

export async function getLocalContentTbSignalsAction(projectId: string): Promise<
  ActionResult<{
    engagementId: string;
    signalCount: number;
    totalAmount: number;
    estimatedLocalContentPct: number;
    byCategory: Record<string, { count: number; amount: number }>;
    mappingUrl: string;
  } | null>
> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    const engagementId = await resolveAuditEngagementIdForLcProject(projectId);
    if (!engagementId) return null;

    const signals = await extractLocalContentSignalsFromEngagement(engagementId);
    const summary = summarizeLocalContentSignals(signals);

    return {
      engagementId,
      signalCount: signals.length,
      totalAmount: summary.totalAmount,
      estimatedLocalContentPct: estimateLocalContentPercent(signals),
      byCategory: summary.byCategory,
      mappingUrl: `/audit/engagements/${engagementId}/mapping`,
    };
  });
}

export async function updateLocalContentVerificationItemAction(
  projectId: string,
  itemId: string,
  formData: FormData,
): Promise<ActionResult<{ itemId: string; scale: string }>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(updateVerificationItemSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { scale, workingPaperRef } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");

    await updateVerificationChecklistItem(
      projectId,
      itemId,
      { scale, workingPaperRef: workingPaperRef || undefined },
      { id: user.id, name: user.name ?? user.email ?? "User" },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.verification.updated",
      targetType: "LocalContentProject",
      targetId: projectId,
      metadata: { itemId, scale },
    });

    revalidateLocalContentPaths(projectId, ["verification"]);
    return { itemId, scale };
  });
}

export async function getLocalContentProjectAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof getProjectById>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return getProjectById(projectId);
  });
}

export async function createLocalContentProjectAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createProject>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createProjectSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { name, reportingPeriod, scopeDescription } = parsed.data;

  return safe(async () => {
    const user = await requireUserContext("ADMIN");

    const project = await createProject({
      organizationId: user.organizationId,
      name,
      reportingPeriod,
      scopeDescription: scopeDescription || undefined,
      platformOrganizationId: user.platformOrganizationId,
      createdById: user.id,
      createdByName: user.name,
    });

    await logToPlatform({
      projectId: project.id,
      user,
      action: "localcontent.project.created",
      targetType: "LocalContentProject",
      targetId: project.id,
      metadata: {
        name: project.name,
        reportingPeriod: project.reportingPeriod,
      },
    });

    revalidateLocalContentPaths(project.id);
    return project;
  });
}

export async function updateLocalContentProjectAction(
  projectId: string,
  status: string,
): Promise<ActionResult<Awaited<ReturnType<typeof updateProjectStatus>>>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");
    const project = await updateProjectStatus(projectId, status, {
      id: user.id,
      name: user.name,
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.project.updated",
      targetType: "LocalContentProject",
      targetId: projectId,
      metadata: { newStatus: status },
    });
    revalidateLocalContentPaths(projectId, [
      "review",
      "approval",
      "audit-trail",
    ]);
    return project;
  });
}

// ─── Supplier Actions ───

export async function listLocalContentSuppliersAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listSuppliers>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return listSuppliers(projectId);
  });
}

export async function createLocalContentSupplierAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createSupplier>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createSupplierSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { name, crNumber, localityClassification, localContentPercentage, ownershipType, workforceLocalPct } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");

    const supplier = await createSupplier(
      {
        projectId,
        name,
        crNumber: crNumber || undefined,
        localityClassification: localityClassification || undefined,
        localContentPercentage: localContentPercentage ?? undefined,
        ownershipType: ownershipType || undefined,
        workforceLocalPct: workforceLocalPct ?? undefined,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.supplier.created",
      targetType: "LocalContentSupplier",
      targetId: supplier.id,
      metadata: { supplierName: supplier.name },
    });

    revalidateLocalContentPaths(projectId, ["suppliers", "classification"]);
    return supplier;
  });
}

export async function updateLocalContentSupplierAction(
  projectId: string,
  supplierId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createSupplier>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(updateSupplierSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { name, crNumber, localityClassification, localContentPercentage, ownershipType, workforceLocalPct } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    const existing = await prisma.localContentSupplier.findUnique({
      where: { id: supplierId },
    });
    if (!existing || existing.projectId !== projectId) {
      throw new ProjectAccessError("Supplier not found", "NOT_FOUND");
    }

    const supplier = await prisma.localContentSupplier.update({
      where: { id: supplierId },
      data: {
        name,
        crNumber: formData.has("crNumber")
          ? (crNumber ?? null)
          : existing.crNumber,
        localityClassification: formData.has("localityClassification")
          ? (localityClassification ?? null)
          : existing.localityClassification,
        localContentPercentage: formData.has("localContentPercentage")
          ? (localContentPercentage ?? null)
          : existing.localContentPercentage,
        ownershipType: formData.has("ownershipType")
          ? (ownershipType ?? null)
          : existing.ownershipType,
        workforceLocalPct: formData.has("workforceLocalPct")
          ? (workforceLocalPct ?? null)
          : existing.workforceLocalPct,
      },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.supplier.updated",
      targetType: "LocalContentSupplier",
      targetId: supplierId,
      metadata: { supplierName: supplier.name },
    });

    revalidateLocalContentPaths(projectId, ["suppliers", "classification"]);
    return supplier;
  });
}

export async function deleteLocalContentSupplierAction(
  projectId: string,
  supplierId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    await deleteSupplier(projectId, supplierId, {
      id: user.id,
      name: user.name ?? "",
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.supplier.deleted",
      targetType: "LocalContentSupplier",
      targetId: supplierId,
    });
    revalidateLocalContentPaths(projectId, [
      "suppliers",
      "classification",
      "spend",
    ]);
  });
}

// ─── Spend Actions ───

export async function listLocalContentSpendRecordsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listSpendRecords>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return listSpendRecords(projectId);
  });
}

export async function createLocalContentSpendRecordAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createSpendRecord>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createSpendRecordSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { supplierId, amount, category, currency, contractReference, period, description } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_spend");

    const record = await createSpendRecord(
      {
        projectId,
        supplierId,
        amount,
        category,
        currency: currency || undefined,
        contractReference: contractReference || undefined,
        period,
        description: description || undefined,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.spend.created",
      targetType: "LocalContentSpendRecord",
      targetId: record.id,
      metadata: { amount: record.amount, category: record.category },
    });

    revalidateLocalContentPaths(projectId, ["spend", "classification"]);
    return record;
  });
}

export async function importLocalContentSpendCsvAction(
  projectId: string,
  csvText: string,
): Promise<
  ActionResult<{ created: number; rejected: number; errors: string[] }>
> {
  const parsed = parseOrError(importSpendCsvSchema, { csvText });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { csvText: validatedCsv } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_spend");
    const result = parseLocalContentCSV(validatedCsv);

    if (result.rejectedRows.length > 0 && result.validRows.length === 0) {
      throw new Error("No valid rows to import");
    }

    let created = 0;
    const errors: string[] = [];

    for (const row of result.validRows) {
      try {
        let supplier = await prisma.localContentSupplier.findFirst({
          where: { projectId, name: row.supplierName },
        });

        if (!supplier && row.supplierRegistrationNumber) {
          supplier = await prisma.localContentSupplier.findFirst({
            where: { projectId, crNumber: row.supplierRegistrationNumber },
          });
        }

        if (!supplier) {
          supplier = await prisma.localContentSupplier.create({
            data: {
              projectId,
              name: row.supplierName,
              crNumber: row.supplierRegistrationNumber ?? null,
              localityClassification: "unclassified",
            },
          });
        }

        await createSpendRecord(
          {
            projectId,
            supplierId: supplier.id,
            amount: row.amount,
            category: row.category,
            currency: row.currency,
            contractReference: row.contractReference,
            period: row.period,
            description: row.description,
          },
          { id: user.id, name: user.name },
        );
        created++;
      } catch (e) {
        errors.push(
          `Row ${row.rowNumber}: ${e instanceof Error ? e.message : "unknown error"}`,
        );
      }
    }

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.spend.imported",
      targetType: "LocalContentSpendRecord",
      targetId: projectId,
      metadata: {
        createdCount: created,
        rejectedCount: result.rejectedRows.length + errors.length,
      },
    });

    try {
      const project = await prisma.localContentProject.findUnique({
        where: { id: projectId },
        select: { name: true, organizationId: true },
      });
      if (project) {
        await notifyOnEvent("on_sync_complete", project.organizationId, projectId, {
          productKey: "localcontentos",
          templateKey: "localcontent_batch_import_complete",
          recipientId: user.id,
          templateVars: {
            batchName: project.name,
            recordCount: String(created),
          },
        });
      }
    } catch {
      // Notification must not block the primary action
    }

    revalidateLocalContentPaths(projectId, [
      "spend",
      "suppliers",
      "classification",
    ]);
    return {
      created,
      rejected: result.rejectedRows.length + errors.length,
      errors,
    };
  });
}

// ─── Classification Action ───

export async function classifyLocalContentSpendRecordAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createClassification>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(classifySpendRecordSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { supplierId, spendRecordId, localPercentage, classificationBasis, confidence, notes } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "classify");

    const classification = await createClassification(
      {
        projectId,
        supplierId: supplierId || undefined,
        spendRecordId: spendRecordId || undefined,
        classifiedBy: user.id,
        localPercentage,
        classificationBasis,
        confidence: confidence || undefined,
        notes: notes || undefined,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.classification.created",
      targetType: "LocalContentClassification",
      targetId: classification.id,
      metadata: { localPercentage, basis: classification.classificationBasis },
    });

    revalidateLocalContentPaths(projectId, ["classification"]);
    return classification;
  });
}

export async function deleteLocalContentSpendRecordAction(
  projectId: string,
  recordId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_spend");
    await deleteSpendRecord(projectId, recordId, {
      id: user.id,
      name: user.name ?? "",
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.spend.deleted",
      targetType: "LocalContentSpendRecord",
      targetId: recordId,
    });
    revalidateLocalContentPaths(projectId, ["spend", "classification"]);
  });
}

// ─── Evidence Actions ───

export async function listLocalContentEvidenceAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listEvidence>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return listEvidence(projectId);
  });
}

export async function createLocalContentEvidenceAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createEvidenceEntry>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createEvidenceSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { filename, supplierId, spendRecordId, fileType, mimeType, evidenceType } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_evidence");

    const evidence = await createEvidenceEntry(
      {
        projectId,
        supplierId: supplierId || undefined,
        spendRecordId: spendRecordId || undefined,
        filename,
        fileType: fileType || "pdf",
        mimeType: mimeType || undefined,
        evidenceType: evidenceType || "other",
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.evidence.created",
      targetType: "LocalContentEvidence",
      targetId: evidence.id,
      metadata: { filename, evidenceType: evidence.evidenceType },
    });

    revalidateLocalContentPaths(projectId, ["evidence"]);
    return evidence;
  });
}

export async function updateLocalContentEvidenceStatusAction(
  projectId: string,
  evidenceId: string,
  status: string,
): Promise<ActionResult<{ id: string; status: string }>> {
  const parsed = parseOrError(updateEvidenceStatusSchema, { status });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { status: validatedStatus } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "review_evidence");
    const existing = await prisma.localContentEvidence.findUnique({
      where: { id: evidenceId },
    });
    if (!existing || existing.projectId !== projectId) {
      throw new ProjectAccessError("Evidence not found", "NOT_FOUND");
    }

    const updated = await prisma.localContentEvidence.update({
      where: { id: evidenceId },
      data: { status: validatedStatus, reviewedById: user.id, reviewedAt: new Date() },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.evidence.status_updated",
      targetType: "LocalContentEvidence",
      targetId: evidenceId,
      metadata: { newStatus: validatedStatus },
    });

    try {
      const { syncLocalContentEvidenceStateToCore } = await import(
        "@/lib/core/evidence/adapters/local-content-adapter"
      );
      await syncLocalContentEvidenceStateToCore({
        evidenceId,
        newStatus: validatedStatus,
        actorId: user.id,
      });
    } catch {
      // Platform sync is best-effort
    }

    revalidateLocalContentPaths(projectId, ["evidence"]);
    return { id: updated.id, status: updated.status };
  });
}

export async function deleteLocalContentEvidenceAction(
  projectId: string,
  evidenceId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_evidence");
    const deletedEvidence = await deleteEvidence(projectId, evidenceId, {
      id: user.id,
      name: user.name ?? "",
    });

    let storageDeleted: boolean | null = null;
    if (deletedEvidence?.storageKey) {
      try {
        storageDeleted = await getStorageProvider().delete(
          deletedEvidence.storageKey,
        );
      } catch {
        storageDeleted = false;
      }
    }

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.evidence.deleted",
      targetType: "LocalContentEvidence",
      targetId: evidenceId,
      metadata: {
        filename: deletedEvidence?.filename,
        storageCleanupAttempted: Boolean(deletedEvidence?.storageKey),
        storageDeleted,
      },
    });
    revalidateLocalContentPaths(projectId, ["evidence"]);
  });
}

// ─── File Upload Action ───

export async function uploadLocalContentEvidenceFileAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string; filename: string; storageKey: string }>> {
  const parsed = parseOrError(uploadEvidenceFileSchema, {
    filename: formData.get("filename") as string | null,
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_evidence");
    const file = formData.get("file") as File | null;
    const filename = formData.get("filename") as string;

    if (!file && !filename) {
      throw new Error("File or filename is required");
    }

    const resolvedFilename = file ? file.name : filename;

    let storageKey: string | null = null;
    let fileHash: string | null = null;
    let sizeBytes: number | null = null;
    let mimeType: string | null = null;

    if (file && file.size > 0) {
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) throw new Error("File too large (max 10MB)");

      const ALLOWED_TYPES = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/csv",
        "text/plain",
      ];
      if (
        !ALLOWED_TYPES.includes(file.type) &&
        !file.type.startsWith("image/") &&
        !file.type.startsWith("text/")
      ) {
        // Allow but warn
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
      sizeBytes = buffer.length;
      mimeType = file.type || "application/octet-stream";

      const provider = getStorageProvider();
      storageKey = `localcontent/${projectId}/evidence/${Date.now()}-${resolvedFilename.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_")}`;
      await provider.store(storageKey, {
        filename: resolvedFilename,
        mimeType,
        content: buffer,
      });
    }

    const evidence = await prisma.localContentEvidence.create({
      data: {
        projectId,
        filename: resolvedFilename,
        fileType: resolvedFilename.split(".").pop()?.toLowerCase() || "pdf",
        mimeType,
        storageKey,
        fileHash,
        sizeBytes,
        evidenceType: (formData.get("evidenceType") as string) || "other",
        supplierId: (formData.get("supplierId") as string) || null,
        status: "uploaded",
      },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.evidence.uploaded",
      targetType: "LocalContentEvidence",
      targetId: evidence.id,
      metadata: { filename: resolvedFilename, storageKey, sizeBytes },
    });

    const project = await prisma.localContentProject.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    });
    if (project?.organizationId) {
      const { linkLocalContentEvidenceAfterUpload } = await import(
        "@/lib/core/evidence/link-after-upload"
      );
      await linkLocalContentEvidenceAfterUpload({
        organizationId: project.organizationId,
        projectId,
        evidenceId: evidence.id,
        filename: evidence.filename,
        actorId: user.id,
      });
    }

    revalidateLocalContentPaths(projectId, ["evidence"]);
    return {
      id: evidence.id,
      filename: evidence.filename,
      storageKey: storageKey || "",
    };
  });
}

// ─── Findings Actions ───

export async function listLocalContentFindingsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listFindings>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return listFindings(projectId);
  });
}

export async function createLocalContentFindingAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createFinding>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createFindingSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { type, title, description, severity, linkedSupplierId, linkedSpendRecordId } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "manage_findings");

    const finding = await createFinding(
      {
        projectId,
        type,
        severity: severity || undefined,
        title,
        description,
        linkedSupplierId: linkedSupplierId || undefined,
        linkedSpendRecordId: linkedSpendRecordId || undefined,
        createdById: user.id,
        createdByName: user.name,
      },
      { id: user.id, name: user.name },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.finding.created",
      targetType: "LocalContentFinding",
      targetId: finding.id,
      metadata: {
        title: finding.title,
        type: finding.type,
        severity: finding.severity,
      },
    });

    revalidateLocalContentPaths(projectId, ["findings"]);
    return finding;
  });
}

export async function updateLocalContentFindingAction(
  projectId: string,
  findingId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createFinding>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(updateFindingSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { type, title, description, severity, linkedSupplierId, linkedSpendRecordId } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "manage_findings");
    const existing = await prisma.localContentFinding.findUnique({
      where: { id: findingId },
    });

    if (!existing || existing.projectId !== projectId) {
      throw new ProjectAccessError("Finding not found", "NOT_FOUND");
    }

    const finding = await prisma.localContentFinding.update({
      where: { id: findingId },
      data: {
        type,
        title,
        description,
        severity: formData.has("severity")
          ? (severity ?? undefined)
          : (existing.severity ?? undefined),
        status: formData.has("status") ? raw.status as string : existing.status,
        linkedSupplierId: formData.has("linkedSupplierId")
          ? (linkedSupplierId ?? undefined)
          : (existing.linkedSupplierId ?? undefined),
        linkedSpendRecordId: formData.has("linkedSpendRecordId")
          ? (linkedSpendRecordId ?? undefined)
          : (existing.linkedSpendRecordId ?? undefined),
      },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.finding.updated",
      targetType: "LocalContentFinding",
      targetId: findingId,
      metadata: {
        title: finding.title,
        type: finding.type,
        severity: finding.severity,
        status: finding.status,
      },
    });

    revalidateLocalContentPaths(projectId, [
      "findings",
      "review",
      "approval",
      "audit-trail",
    ]);
    return finding;
  });
}

export async function deleteLocalContentFindingAction(
  projectId: string,
  findingId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "manage_findings");
    await deleteFinding(projectId, findingId, {
      id: user.id,
      name: user.name ?? "",
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.finding.deleted",
      targetType: "LocalContentFinding",
      targetId: findingId,
    });
    revalidateLocalContentPaths(projectId, [
      "findings",
      "review",
      "approval",
      "audit-trail",
    ]);
  });
}

// ─── Review Actions ───

export async function submitLocalContentReviewAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createReview>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(submitReviewSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { action, comments } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "review");
    const review = await createReview({
      projectId,
      reviewerId: user.id,
      reviewerName: user.name,
      action: action || "submitted",
      comments: comments || undefined,
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.review.submitted",
      targetType: "LocalContentReview",
      targetId: review.id,
      metadata: { action: review.action },
    });

    try {
      const project = await prisma.localContentProject.findUnique({
        where: { id: projectId },
        select: { name: true, organizationId: true },
      });
      if (project) {
        await notifyOnEvent("on_review", project.organizationId, projectId, {
          productKey: "localcontentos",
          templateKey: "localcontent_review_routing",
          recipientId: user.id,
          templateVars: {
            projectName: project.name,
            score: "0",
          },
        });
      }
    } catch {
      // Notification must not block the primary action
    }

    revalidateLocalContentPaths(projectId, [
      "review",
      "approval",
      "audit-trail",
    ]);
    return review;
  });
}

// ─── Approval Actions ───

export async function submitLocalContentApprovalAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createApproval>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(submitApprovalSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { decision, comments } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "approve");
    const approval = await createApproval({
      projectId,
      approverId: user.id,
      approverName: user.name,
      decision,
      comments: comments || undefined,
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.approval.decided",
      targetType: "LocalContentApproval",
      targetId: approval.id,
      metadata: { decision: approval.decision },
    });

    if (approval.decision === "approved" || approval.decision === "rejected") {
      await updateProjectStatus(
        projectId,
        approval.decision === "approved" ? "Approved" : "Rejected",
        { id: user.id, name: user.name },
      );
    }

    revalidateLocalContentPaths(projectId, [
      "approval",
      "review",
      "audit-trail",
    ]);
    return approval;
  });
}

// ─── Scoring Action ───

export async function getLocalContentScoreAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof calculateProjectScore>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return calculateProjectScore(projectId);
  });
}

// ─── Audit Events Action ───

export async function listLocalContentAuditEventsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listAuditEvents>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "review");
    return listAuditEvents(projectId);
  });
}

// ─── Review List Action ───

export async function listLocalContentReviewsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listReviews>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return listReviews(projectId);
  });
}

export async function getLocalContentApprovalRoutingAction(
  projectId: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getProjectApprovalRoutingState>>>
> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return getProjectApprovalRoutingState(projectId);
  });
}

// ─── Approval List Action ───

export async function listLocalContentApprovalsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listApprovals>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return listApprovals(projectId);
  });
}

// ─── Report Actions ───

export async function listLocalContentReportsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listReports>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    return listReports(projectId);
  });
}

export async function generateLocalContentReportAction(
  projectId: string,
  reportType: string,
  format: string,
): Promise<ActionResult<Awaited<ReturnType<typeof createReport>>>> {
  const parsed = parseOrError(generateReportSchema, { reportType, format });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { reportType: validatedType, format: validatedFormat } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_spend");
    const score = await calculateProjectScore(projectId);

    const disclaimer = [
      "───────────────────────────────────────────",
      "هذا التقرير مُولّد بواسطة LocalContentOS ولا يعد تقرير امتثال معتمد.",
      "تمت مراجعته واعتماده حسب الإجراءات الموثقة داخل النظام.",
      "AI assists. Humans decide. Evidence governs.",
      "───────────────────────────────────────────",
    ].join("\n");

    const report = await createReport({
      projectId,
      reportType: validatedType,
      format: validatedFormat,
      generatedById: user.id,
      generatedByName: user.name,
      disclaimer,
      metadata: {
        localContentPercentage: score.localContentPercentage,
        totalSpend: score.totalSpend,
        supplierCount: score.supplierCounts.total,
        evidenceCoverage: score.evidenceStats.coveragePercentage,
        findingCount: score.findingStats.total,
        generatedAt: new Date().toISOString(),
      },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.report.generated",
      targetType: "LocalContentReport",
      targetId: report.id,
      metadata: { reportType: validatedType, format: validatedFormat },
    });

    revalidateLocalContentPaths(projectId, ["reports"]);
    return report;
  });
}

// ─── Revalidation helper ───

type LocalContentPathSegment =
  | "suppliers"
  | "spend"
  | "classification"
  | "evidence"
  | "findings"
  | "review"
  | "approval"
  | "reports"
  | "audit-trail"
  | "verification"
  | "tender-match";

function revalidateLocalContentPaths(
  projectId: string,
  segments: LocalContentPathSegment[] = [],
) {
  revalidatePath("/local-content");
  revalidatePath("/local-content/projects");
  revalidatePath(`/local-content/projects/${projectId}`);
  for (const segment of segments) {
    revalidatePath(`/local-content/projects/${projectId}/${segment}`);
  }
}

/** @deprecated Prefer revalidateLocalContentPaths — kept for existing callers */
export async function revalidateLocalContentProject(projectId: string) {
  revalidateLocalContentPaths(projectId);
}
