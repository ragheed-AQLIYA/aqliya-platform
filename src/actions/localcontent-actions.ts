"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { auditLogger } from "@/lib/platform/audit-logger";
import { getStorageProvider } from "@/lib/platform/storage";
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
  listAuditEvents,
  calculateProjectScore,
  listReports,
  createReport,
} from "@/lib/local-content/services";
import {
  assertProjectAccess,
  resolveProjectContext,
  ProjectAccessError,
} from "@/lib/local-content/guards";
import { parseLocalContentCSV } from "@/lib/local-content/import";
import {
  validateRequired,
  validatePositiveNumber,
  validatePercentage,
  validateSupplierLocality,
  validateOwnershipType,
  validateFindingType,
  validateFindingSeverity,
} from "@/lib/local-content/validation";

// ─── Result types ───

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

const VALID_FINDING_STATUSES = [
  "draft",
  "submitted",
  "reviewed",
  "resolved",
  "dismissed",
] as const;

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

function getOptionalTrimmedValue(
  formData: FormData,
  key: string,
): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalPercentageField(
  formData: FormData,
  key: string,
): number | null {
  const raw = getOptionalTrimmedValue(formData, key);
  if (raw === null) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`LocalContentOS validation: ${key} must be a valid number`);
  }
  validatePercentage(value, key);
  return value;
}

function validateFindingStatus(value: string): void {
  if (
    !VALID_FINDING_STATUSES.includes(
      value as (typeof VALID_FINDING_STATUSES)[number],
    )
  ) {
    throw new Error(
      `LocalContentOS validation: status must be one of: ${VALID_FINDING_STATUSES.join(", ")}`,
    );
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
      productKey: "localcontent",
      sourceSystem: "localcontent",
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
  return safe(async () => {
    const user = await requireUserContext("ADMIN");
    const name = formData.get("name") as string;
    const reportingPeriod = formData.get("reportingPeriod") as string;
    const scopeDescription = formData.get("scopeDescription") as string;

    validateRequired(name, "name");
    validateRequired(reportingPeriod, "reportingPeriod");

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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    const name = formData.get("name") as string;
    validateRequired(name, "name");

    const localityClassification = getOptionalTrimmedValue(
      formData,
      "localityClassification",
    );
    if (localityClassification) {
      validateSupplierLocality(localityClassification);
    }

    const ownershipType = getOptionalTrimmedValue(formData, "ownershipType");
    if (ownershipType) {
      validateOwnershipType(ownershipType);
    }

    const supplier = await createSupplier(
      {
        projectId,
        name,
        crNumber: getOptionalTrimmedValue(formData, "crNumber") || undefined,
        localityClassification: localityClassification || undefined,
        localContentPercentage:
          parseOptionalPercentageField(formData, "localContentPercentage") ??
          undefined,
        ownershipType: ownershipType || undefined,
        workforceLocalPct:
          parseOptionalPercentageField(formData, "workforceLocalPct") ??
          undefined,
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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_supplier");
    const existing = await prisma.localContentSupplier.findUnique({
      where: { id: supplierId },
    });
    if (!existing || existing.projectId !== projectId) {
      throw new ProjectAccessError("Supplier not found", "NOT_FOUND");
    }

    const name = (formData.get("name") as string | null)?.trim() || "";
    validateRequired(name, "name");

    const localityClassification = getOptionalTrimmedValue(
      formData,
      "localityClassification",
    );
    if (localityClassification) {
      validateSupplierLocality(localityClassification);
    }

    const ownershipType = getOptionalTrimmedValue(formData, "ownershipType");
    if (ownershipType) {
      validateOwnershipType(ownershipType);
    }

    const supplier = await prisma.localContentSupplier.update({
      where: { id: supplierId },
      data: {
        name,
        crNumber: formData.has("crNumber")
          ? getOptionalTrimmedValue(formData, "crNumber")
          : existing.crNumber,
        localityClassification: formData.has("localityClassification")
          ? localityClassification
          : existing.localityClassification,
        localContentPercentage: formData.has("localContentPercentage")
          ? parseOptionalPercentageField(formData, "localContentPercentage")
          : existing.localContentPercentage,
        ownershipType: formData.has("ownershipType")
          ? ownershipType
          : existing.ownershipType,
        workforceLocalPct: formData.has("workforceLocalPct")
          ? parseOptionalPercentageField(formData, "workforceLocalPct")
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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_spend");
    const amount = parseFloat(formData.get("amount") as string);
    validatePositiveNumber(amount, "amount");

    const record = await createSpendRecord(
      {
        projectId,
        supplierId: formData.get("supplierId") as string,
        amount,
        category: formData.get("category") as string,
        currency: (formData.get("currency") as string) || undefined,
        contractReference:
          (formData.get("contractReference") as string) || undefined,
        period: formData.get("period") as string,
        description: (formData.get("description") as string) || undefined,
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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_spend");
    const result = parseLocalContentCSV(csvText);

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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "classify");
    const localPercentage = parseFloat(
      formData.get("localPercentage") as string,
    );
    validatePercentage(localPercentage, "localPercentage");

    const classification = await createClassification(
      {
        projectId,
        supplierId: (formData.get("supplierId") as string) || undefined,
        spendRecordId: (formData.get("spendRecordId") as string) || undefined,
        classifiedBy: user.id,
        localPercentage,
        classificationBasis: formData.get("classificationBasis") as string,
        confidence: (formData.get("confidence") as string) || undefined,
        notes: (formData.get("notes") as string) || undefined,
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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_evidence");
    const filename = formData.get("filename") as string;
    validateRequired(filename, "filename");

    const evidence = await createEvidenceEntry(
      {
        projectId,
        supplierId: (formData.get("supplierId") as string) || undefined,
        spendRecordId: (formData.get("spendRecordId") as string) || undefined,
        filename,
        fileType: (formData.get("fileType") as string) || "pdf",
        mimeType: (formData.get("mimeType") as string) || undefined,
        evidenceType: (formData.get("evidenceType") as string) || "other",
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
      data: { status, reviewedById: user.id, reviewedAt: new Date() },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.evidence.status_updated",
      targetType: "LocalContentEvidence",
      targetId: evidenceId,
      metadata: { newStatus: status },
    });

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
    await deleteEvidence(projectId, evidenceId, {
      id: user.id,
      name: user.name ?? "",
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.evidence.deleted",
      targetType: "LocalContentEvidence",
      targetId: evidenceId,
    });
    revalidateLocalContentPaths(projectId, ["evidence"]);
  });
}

// ─── File Upload Action ───

export async function uploadLocalContentEvidenceFileAction(
  projectId: string,
  formData: FormData,
): Promise<ActionResult<{ id: string; filename: string; storageKey: string }>> {
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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "manage_findings");
    const type = (formData.get("type") as string | null)?.trim() || "";
    const title = (formData.get("title") as string | null)?.trim() || "";
    const description =
      (formData.get("description") as string | null)?.trim() || "";
    const severity = getOptionalTrimmedValue(formData, "severity");

    validateRequired(type, "type");
    validateRequired(title, "title");
    validateRequired(description, "description");
    validateFindingType(type);
    if (severity) {
      validateFindingSeverity(severity);
    }

    const finding = await createFinding(
      {
        projectId,
        type,
        severity: severity || undefined,
        title,
        description,
        linkedSupplierId:
          getOptionalTrimmedValue(formData, "linkedSupplierId") || undefined,
        linkedSpendRecordId:
          getOptionalTrimmedValue(formData, "linkedSpendRecordId") || undefined,
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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "manage_findings");
    const existing = await prisma.localContentFinding.findUnique({
      where: { id: findingId },
    });

    if (!existing || existing.projectId !== projectId) {
      throw new ProjectAccessError("Finding not found", "NOT_FOUND");
    }

    const type = (formData.get("type") as string | null)?.trim() || "";
    const title = (formData.get("title") as string | null)?.trim() || "";
    const description =
      (formData.get("description") as string | null)?.trim() || "";
    const severity = getOptionalTrimmedValue(formData, "severity");
    const status =
      getOptionalTrimmedValue(formData, "status") || existing.status;

    validateRequired(type, "type");
    validateRequired(title, "title");
    validateRequired(description, "description");
    validateFindingType(type);
    if (severity) {
      validateFindingSeverity(severity);
    }
    validateFindingStatus(status);

    const finding = await prisma.localContentFinding.update({
      where: { id: findingId },
      data: {
        type,
        title,
        description,
        severity: formData.has("severity")
          ? (severity ?? undefined)
          : (existing.severity ?? undefined),
        status,
        linkedSupplierId: formData.has("linkedSupplierId")
          ? (getOptionalTrimmedValue(formData, "linkedSupplierId") ?? undefined)
          : (existing.linkedSupplierId ?? undefined),
        linkedSpendRecordId: formData.has("linkedSpendRecordId")
          ? (getOptionalTrimmedValue(formData, "linkedSpendRecordId") ??
            undefined)
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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "review");
    const review = await createReview({
      projectId,
      reviewerId: user.id,
      reviewerName: user.name,
      action: (formData.get("action") as string) || "submitted",
      comments: (formData.get("comments") as string) || undefined,
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.review.submitted",
      targetType: "LocalContentReview",
      targetId: review.id,
      metadata: { action: review.action },
    });

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
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "approve");
    const approval = await createApproval({
      projectId,
      approverId: user.id,
      approverName: user.name,
      decision: formData.get("decision") as string,
      comments: (formData.get("comments") as string) || undefined,
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
      reportType,
      format,
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
      metadata: { reportType, format },
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
  | "audit-trail";

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
