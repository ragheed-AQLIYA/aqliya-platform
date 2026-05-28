"use server";

import { prisma } from "@/lib/prisma";
import { requireDecisionAccess } from "@/lib/auth";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
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

export async function getDecisionEvidenceAction(decisionId: string) {
  try {
    await requireDecisionAccess(decisionId, "VIEWER");
    const evidence = await prisma.decisionEvidence.findMany({
      where: { decisionId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: evidence };
  } catch (error) {
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
    const { user } = await requireDecisionAccess(params.decisionId, "OPERATOR");

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
    } catch (error) {
      await provider.delete(storageKey);
      throw error;
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
  } catch (error) {
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

    const { user } = await requireDecisionAccess(
      evidence.decisionId,
      "OPERATOR",
    );

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
  } catch (error) {
    return { success: false, error: "فشل حذف المستند" };
  }
}
