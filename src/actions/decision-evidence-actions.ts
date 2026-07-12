"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/authorization";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import { getStorageProvider } from "@/lib/platform/storage";
import { createHash } from "crypto";
import { validateFileContent } from "@/lib/security/file-validation";

const ALLOWED_FILE_TYPES = [
  "pdf",
  "xlsx",
  "xls",
  "docx",
  "doc",
  "jpg",
  "jpeg",
  "png",
  "csv",
  "txt",
];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_EVIDENCE_PER_DECISION = 50;

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  csv: "text/csv",
  txt: "text/plain",
};

function sanitizeStoredFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_");
}

function mimeTypeForFileType(fileType: string): string {
  return MIME_TYPES[fileType.toLowerCase()] ?? "application/octet-stream";
}

export async function getDecisionEvidenceAction(decisionId: string, offset?: number) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "read");
    const PAGE_SIZE = 50;
    const skip = offset || 0;
    const [evidence, totalCount] = await Promise.all([
      prisma.decisionEvidence.findMany({
        where: { decisionId },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip,
      }),
      prisma.decisionEvidence.count({ where: { decisionId } }),
    ]);
    return { success: true, data: evidence, totalCount, hasMore: skip + PAGE_SIZE < totalCount };
  } catch {
    return { success: false, error: "Failed to fetch evidence" };
  }
}

export async function uploadDecisionEvidenceAction(params: {
  decisionId: string;
  filename: string;
  fileType: string;
  fileData: string;
  description?: string;
}) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id: params.decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id: params.decisionId, tenantId: decisionLookup.organizationId }, "update");

    const normalizedFileType = params.fileType.toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(normalizedFileType)) {
      return {
        success: false,
        error: `نوع الملف غير مدعوم: ${params.fileType}. الأنواع المسموحة: ${ALLOWED_FILE_TYPES.join(", ")}`,
      };
    }

    const content = Buffer.from(params.fileData, "base64");
    if (content.length > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `الملف كبير جداً: ${(content.length / 1024 / 1024).toFixed(1)}MB. الحد الأقصى: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
      };
    }

    // Validate file content matches its claimed extension (magic bytes check)
    const contentValidation = validateFileContent(content, normalizedFileType);
    if (!contentValidation.valid) {
      return {
        success: false,
        error: contentValidation.error || "نوع الملف لا يتطابق مع امتداده",
      };
    }

    const count = await prisma.decisionEvidence.count({
      where: { decisionId: params.decisionId },
    });
    if (count >= MAX_EVIDENCE_PER_DECISION) {
      return {
        success: false,
        error: `لا يمكن إضافة أكثر من ${MAX_EVIDENCE_PER_DECISION} مستند دعم للقرار`,
      };
    }

    const fileHash = createHash("sha256").update(content).digest("hex");
    const storageKey = `decisions/${params.decisionId}/evidence/${Date.now()}-${sanitizeStoredFilename(params.filename)}`;
    const provider = getStorageProvider();

    await provider.store(storageKey, {
      filename: params.filename,
      mimeType: mimeTypeForFileType(normalizedFileType),
      content,
    });

    let evidence;
    try {
      evidence = await prisma.decisionEvidence.create({
        data: {
          decisionId: params.decisionId,
          organizationId: user.organizationId,
          filename: params.filename,
          fileType: normalizedFileType,
          fileSize: content.length,
          fileHash,
          storageKey,
          uploadedById: user.id,
          description: params.description || null,
          metadata: {
            uploadedAt: new Date().toISOString(),
          },
        },
      });
    } catch (_error) {
      await provider.delete(storageKey);
      throw _error;
    }

    const alog = auditLogger({
      productKey: Product.DECISION_OS,
      sourceSystem: "decision_os",
      organization: {
        platformOrganizationId: user.platformOrganizationId ?? undefined,
      },
      actor: { id: user.id, type: "user", name: user.name || user.email },
    });
    await alog.record(
      "EVIDENCE_UPLOADED",
      {
        type: "decision_evidence",
        id: evidence.id,
        label: params.filename,
      },
      {
        severity: "info",
        status: "recorded",
        sourceModel: "DecisionEvidence",
        sourceId: evidence.id,
        metadata: {
          decisionId: params.decisionId,
          fileType: normalizedFileType,
          fileSize: content.length,
          fileHash: fileHash.substring(0, 12),
          storageKey,
        },
      },
    );

    return {
      success: true,
      data: {
        ...evidence,
        fileHash: fileHash.substring(0, 12),
      },
    };
  } catch {
    return { success: false, error: "فشل رفع المستند" };
  }
}

export async function deleteDecisionEvidenceAction(evidenceId: string) {
  try {
    const evidence = await prisma.decisionEvidence.findUnique({
      where: { id: evidenceId },
    });
    if (!evidence) {
      return { success: false, error: "المستند غير موجود" };
    }

    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id: evidence.decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id: evidence.decisionId, tenantId: decisionLookup.organizationId }, "update");

    await prisma.decisionEvidence.delete({
      where: { id: evidenceId },
    });

    let storageDeleted: boolean | null = null;
    if (evidence.storageKey) {
      try {
        storageDeleted = await getStorageProvider().delete(evidence.storageKey);
      } catch {
        storageDeleted = false;
      }
    }

    const alog = auditLogger({
      productKey: Product.DECISION_OS,
      sourceSystem: "decision_os",
      organization: {
        platformOrganizationId: user.platformOrganizationId ?? undefined,
      },
      actor: { id: user.id, type: "user", name: user.name || user.email },
    });
    await alog.record(
      "EVIDENCE_DELETED",
      {
        type: "decision_evidence",
        id: evidenceId,
        label: evidence.filename,
      },
      {
        severity: "info",
        status: "recorded",
        sourceModel: "DecisionEvidence",
        metadata: {
          decisionId: evidence.decisionId,
          filename: evidence.filename,
          fileType: evidence.fileType,
          storageCleanupAttempted: Boolean(evidence.storageKey),
          storageDeleted,
        },
      },
    );

    return { success: true };
  } catch {
    return { success: false, error: "فشل حذف المستند" };
  }
}

export async function reviewDecisionEvidenceAction(
  evidenceId: string,
  notes?: string,
) {
  try {
    const evidence = await prisma.decisionEvidence.findUnique({
      where: { id: evidenceId },
    });
    if (!evidence) {
      return { success: false, error: "المستند غير موجود" };
    }

    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id: evidence.decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id: evidence.decisionId, tenantId: decisionLookup.organizationId }, "update");

    const meta = (evidence.metadata as Record<string, unknown>) ?? {};
    const now = new Date().toISOString();

    const updated = await prisma.decisionEvidence.update({
      where: { id: evidenceId },
      data: {
        metadata: {
          ...meta,
          reviewedAt: now,
          reviewedById: user.id,
          reviewedByName: user.name || user.email,
          reviewNotes: notes || null,
        },
      },
    });

    const alog = auditLogger({
      productKey: Product.DECISION_OS,
      sourceSystem: "decision_os",
      organization: {
        platformOrganizationId: user.platformOrganizationId ?? undefined,
      },
      actor: { id: user.id, type: "user", name: user.name || user.email },
    });
    await alog.record(
      "EVIDENCE_REVIEWED",
      {
        type: "decision_evidence",
        id: evidenceId,
        label: evidence.filename,
      },
      {
        severity: "info",
        status: "recorded",
        sourceModel: "DecisionEvidence",
        metadata: {
          decisionId: evidence.decisionId,
          reviewed: true,
          hasNotes: !!notes,
        },
      },
    );

    return { success: true, data: updated };
  } catch {
    return { success: false, error: "فشل مراجعة المستند" };
  }
}

export async function getUnreviewedEvidenceCount(decisionId: string): Promise<{
  success: boolean;
  data?: { total: number; unreviewed: number };
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id: decisionId },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "read");

    const allEvidence = await prisma.decisionEvidence.findMany({
      where: { decisionId },
      select: { metadata: true },
    });

    const total = allEvidence.length;
    const unreviewed = allEvidence.filter((e) => {
      const meta = e.metadata as Record<string, unknown> | null;
      return !meta?.reviewedAt;
    }).length;

    return { success: true, data: { total, unreviewed } };
  } catch {
    return { success: false, error: "فشل في حساب المستندات غير المراجعة" };
  }
}
