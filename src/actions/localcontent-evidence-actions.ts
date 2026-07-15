"use server";

import crypto from "crypto";
import { validateFileContent } from "@/lib/security/file-validation";
import { prisma } from "@/lib/prisma";
import { isScanRejected, scanEvidenceFile } from "@/lib/kernel";
import {
  listEvidence,
  createEvidenceEntry,
  deleteEvidence,
} from "@/lib/local-content/services";
import {
  assertProjectAccess,
  ProjectAccessError,
} from "@/lib/local-content/guards";
import { getStorageProvider } from "@/lib/platform/storage";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_PRESETS } from "@/lib/platform/rate-limiter/presets";
import { parseOrError } from "@/lib/local-content/schemas/common";
import {
  createEvidenceSchema,
  updateEvidenceStatusSchema,
  uploadEvidenceFileSchema,
  validateEvidenceFile,
  computeFileChecksum,
} from "@/lib/local-content/schemas/evidence";
import {
  requirePermission,
  Permission,
  ResourceType,
} from "@/actions/localcontent-rbac";
import { type ActionResult } from "@/lib/platform/action-result";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import {
  safe,
  logToPlatform,
  revalidateLocalContentPaths,
} from "@/actions/localcontent-shared";
import { publishDomainEvent } from "@/lib/kernel/publish";
import {
  publishLocalContentOSEvent,
  LOCAL_CONTENT_OS_EVENTS,
} from "@/lib/kernel/events/lcos-events";

// ─── Evidence Actions ───

export async function listLocalContentEvidenceAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listEvidence>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.EVIDENCE_READ, ResourceType.EVIDENCE);
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
    await requirePermission(Permission.EVIDENCE_UPLOAD, ResourceType.EVIDENCE);

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
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);

    try {
      await publishDomainEvent(
        publishLocalContentOSEvent(LOCAL_CONTENT_OS_EVENTS.EVIDENCE_UPLOADED, {
          actorId: user.id,
          resourceId: evidence.id,
          resourceType: "LocalContentEvidence",
          metadata: {
            filename: evidence.filename,
            evidenceType: evidence.evidenceType,
          },
        }),
      );
    } catch {
      // Event publishing is fire-and-forget
    }

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
    await requirePermission(Permission.REVIEW_MANAGEMENT, ResourceType.REVIEW);
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
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return { id: updated.id, status: updated.status };
  });
}

export async function deleteLocalContentEvidenceAction(
  projectId: string,
  evidenceId: string,
): Promise<ActionResult<void>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_evidence");
    await requirePermission(Permission.EVIDENCE_DELETION, ResourceType.EVIDENCE);
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
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
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
    await requirePermission(Permission.EVIDENCE_UPLOAD, ResourceType.EVIDENCE);
    // Rate limit: file upload + scan is I/O heavy
    const { allowed } = await checkRateLimit(`lcos:upload:${user.id}`, RATE_LIMIT_PRESETS.LCOS_EXPORT);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please wait before uploading more files.");
    }
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
    let scanStatus: string = "skipped";
    let scanProvider: string = "none";
    let scannedAt: string | null = null;

    if (file && file.size > 0) {
      // SC-02: centralized file validation
      const fileError = validateEvidenceFile(file);
      if (fileError) throw new Error(fileError);

      const fileChecksum = await computeFileChecksum(file);
      fileHash = fileChecksum;
      sizeBytes = file.size;

      const buffer = Buffer.from(await file.arrayBuffer());
      fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
      sizeBytes = buffer.length;
      mimeType = file.type || "application/octet-stream";

      // Validate file content matches its claimed extension (magic bytes check)
      const lcosExtension = resolvedFilename.split(".").pop()?.toLowerCase() || "pdf";
      const lcosMagicValidation = validateFileContent(buffer, lcosExtension);
      if (!lcosMagicValidation.valid) {
        throw new Error(lcosMagicValidation.error || "File content does not match its claimed extension");
      }

      // SC-02: file scanning — infrastructure exists, now wired for LCOS
      const scanResult = await scanEvidenceFile({
        filename: resolvedFilename,
        fileType: resolvedFilename.split(".").pop()?.toLowerCase() || "pdf",
        fileSize: sizeBytes,
        content: buffer,
      });
      if (isScanRejected(scanResult)) {
        throw new Error(scanResult.details || "File rejected by security scanner");
      }
      scanStatus = scanResult.status;
      scanProvider = scanResult.provider;
      scannedAt = scanResult.scannedAt;

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
      metadata: {
        filename: resolvedFilename,
        storageKey,
        sizeBytes,
        scanStatus,
        scanProvider,
        scannedAt,
      },
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
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);

    try {
      await publishDomainEvent(
        publishLocalContentOSEvent(LOCAL_CONTENT_OS_EVENTS.EVIDENCE_UPLOADED, {
          actorId: user.id,
          resourceId: evidence.id,
          resourceType: "LocalContentEvidence",
          metadata: {
            filename: resolvedFilename,
            evidenceType: (formData.get("evidenceType") as string) || "other",
          },
        }),
      );
    } catch {
      // Event publishing is fire-and-forget
    }

    return {
      id: evidence.id,
      filename: evidence.filename,
      storageKey: storageKey || "",
    };
  });
}
