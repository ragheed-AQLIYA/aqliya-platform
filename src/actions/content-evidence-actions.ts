"use server";

import { prisma } from "@/lib/prisma";
import { requireUserContext, isExpectedAccessDeniedError } from "@/lib/auth";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { getStorageProvider } from "@/lib/platform/storage";
import { createHash } from "crypto";

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
  "pptx",
  "ppt",
];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_EVIDENCE_PER_CONTENT = 50;

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
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
};

function sanitizeStoredFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, "_");
}

function mimeTypeForFileType(fileType: string): string {
  return MIME_TYPES[fileType.toLowerCase()] ?? "application/octet-stream";
}

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

type ContentEvidence = {
  id: string;
  contentId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  fileHash: string | null;
  storageKey: string | null;
  uploadedById: string | null;
  description: string | null;
  evidenceType: string;
  createdAt: Date;
};

async function requireContentAccess(
  contentId: string,
  role: "VIEWER" | "OPERATOR" = "VIEWER",
) {
  const user = await requireUserContext(role);
  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
    select: { organizationId: true },
  });
  if (!content) {
    throw new Error("لم يتم العثور على المحتوى");
  }
  if (content.organizationId !== user.organizationId) {
    throw new Error("صلاحية غير كافية");
  }
  return { user, content };
}

export async function getContentEvidenceAction(
  contentId: string,
): Promise<ActionResult<ContentEvidence[]>> {
  try {
    await requireContentAccess(contentId, "VIEWER");
    const evidence = await prisma.contentEvidence.findMany({
      where: { contentId },
      orderBy: { createdAt: "desc" },
    });
    return { ok: true, data: evidence as ContentEvidence[] };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "صلاحية غير كافية", code: "FORBIDDEN" };
    }
    return { ok: false, error: "فشل تحميل المستندات" };
  }
}

export async function uploadContentEvidenceAction(params: {
  contentId: string;
  filename: string;
  fileType: string;
  fileData: string;
  description?: string;
  evidenceType?: string;
}): Promise<ActionResult<ContentEvidence>> {
  try {
    const ctx = await requireContentAccess(params.contentId, "OPERATOR");

    const normalizedFileType = params.fileType.toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(normalizedFileType)) {
      return {
        ok: false,
        error: `نوع الملف غير مدعوم: ${params.fileType}. الأنواع المسموحة: ${ALLOWED_FILE_TYPES.join(", ")}`,
      };
    }

    const content = Buffer.from(params.fileData, "base64");
    if (content.length > MAX_FILE_SIZE_BYTES) {
      return {
        ok: false,
        error: `الملف كبير جداً: ${(content.length / 1024 / 1024).toFixed(1)}MB. الحد الأقصى: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
      };
    }

    const count = await prisma.contentEvidence.count({
      where: { contentId: params.contentId },
    });
    if (count >= MAX_EVIDENCE_PER_CONTENT) {
      return {
        ok: false,
        error: `لا يمكن إضافة أكثر من ${MAX_EVIDENCE_PER_CONTENT} مستند`,
      };
    }

    const fileHash = createHash("sha256").update(content).digest("hex");
    const storageKey = `content-studio/${params.contentId}/evidence/${Date.now()}-${sanitizeStoredFilename(params.filename)}`;
    const provider = getStorageProvider();

    await provider.store(storageKey, {
      filename: params.filename,
      mimeType: mimeTypeForFileType(normalizedFileType),
      content,
    });

    let evidence;
    try {
      evidence = await prisma.contentEvidence.create({
        data: {
          contentId: params.contentId,
          organizationId: ctx.content.organizationId,
          filename: params.filename,
          fileType: normalizedFileType,
          fileSize: content.length,
          fileHash,
          storageKey,
          uploadedById: ctx.user.id,
          description: params.description || null,
          evidenceType: params.evidenceType || "attachment",
        },
      });
    } catch (_error) {
      await provider.delete(storageKey);
      throw _error;
    }

    await writePlatformAuditLog({
      productKey: "content_studio",
      action: "evidence_upload",
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      actorName: ctx.user.name,
      targetType: "content_evidence",
      targetId: evidence.id,
      targetLabel: params.filename,
      sourceSystem: "content_studio",
      sourceModel: "ContentEvidence",
      sourceId: evidence.id,
      metadata: {
        contentId: params.contentId,
        filename: params.filename,
        fileSize: content.length,
        fileHash: fileHash.substring(0, 12),
      } as Record<string, unknown>,
    });

    return {
      ok: true,
      data: { ...(evidence as ContentEvidence), fileHash: fileHash.substring(0, 12) },
    };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "صلاحية غير كافية", code: "FORBIDDEN" };
    }
    return { ok: false, error: "فشل رفع المستند" };
  }
}

export async function deleteContentEvidenceAction(
  evidenceId: string,
): Promise<ActionResult<void>> {
  try {
    const evidence = await prisma.contentEvidence.findUnique({
      where: { id: evidenceId },
    });
    if (!evidence) {
      return { ok: false, error: "المستند غير موجود" };
    }

    const ctx = await requireContentAccess(evidence.contentId, "OPERATOR");

    await prisma.contentEvidence.delete({
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

    await writePlatformAuditLog({
      productKey: "content_studio",
      action: "evidence_delete",
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      actorName: ctx.user.name,
      targetType: "content_evidence",
      targetId: evidenceId,
      targetLabel: evidence.filename,
      sourceSystem: "content_studio",
      sourceModel: "ContentEvidence",
      metadata: {
        contentId: evidence.contentId,
        filename: evidence.filename,
        fileType: evidence.fileType,
        storageCleanupAttempted: Boolean(evidence.storageKey),
        storageDeleted,
      } as Record<string, unknown>,
    });

    return { ok: true, data: undefined };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "صلاحية غير كافية", code: "FORBIDDEN" };
    }
    return { ok: false, error: "فشل حذف المستند" };
  }
}

export async function updateContentEvidenceDescriptionAction(
  evidenceId: string,
  description: string,
): Promise<ActionResult<ContentEvidence>> {
  try {
    const evidence = await prisma.contentEvidence.findUnique({
      where: { id: evidenceId },
    });
    if (!evidence) {
      return { ok: false, error: "المستند غير موجود" };
    }

    const ctx = await requireContentAccess(evidence.contentId, "OPERATOR");

    const updated = await prisma.contentEvidence.update({
      where: { id: evidenceId },
      data: { description },
    });

    await writePlatformAuditLog({
      productKey: "content_studio",
      action: "evidence_update_description",
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
      actorName: ctx.user.name,
      targetType: "content_evidence",
      targetId: evidenceId,
      targetLabel: evidence.filename,
      sourceSystem: "content_studio",
      sourceModel: "ContentEvidence",
      metadata: {
        contentId: evidence.contentId,
        filename: evidence.filename,
      } as Record<string, unknown>,
    });

    return { ok: true, data: updated as ContentEvidence };
  } catch (error) {
    if (isExpectedAccessDeniedError(error)) {
      return { ok: false, error: "صلاحية غير كافية", code: "FORBIDDEN" };
    }
    return { ok: false, error: "فشل تحديث الوصف" };
  }
}
