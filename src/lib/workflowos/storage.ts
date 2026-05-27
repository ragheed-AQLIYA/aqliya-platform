import "server-only";

import { prisma } from "@/lib/prisma";
import { getStorageProvider } from "@/lib/platform/storage";
import { requireClientAccess } from "@/lib/workflowos/tenant-guard";
import { createWorkflowAuditEvent } from "@/lib/workflowos/audit";

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".xlsx",
  ".xls",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".csv",
]);

export function buildWorkflowStorageKey(
  clientId: string,
  recordId: string,
  documentId: string,
  fileName: string,
): string {
  const safe = fileName
    .replace(/[/\\:*?"<>|\x00-\x1f]/g, "_")
    .replace(/\.\./g, "_");
  return `workflowos/clients/${clientId}/records/${recordId}/documents/${documentId}/${safe}`;
}

function getExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot).toLowerCase();
}

export interface UploadDocumentInput {
  clientId: string;
  recordId: string;
  fileName: string;
  fileType: string;
  content: Buffer;
}

export async function uploadWorkflowDocument(input: UploadDocumentInput) {
  const ctx = await requireClientAccess(input.clientId, "Operator");

  const record = await prisma.sunbulRecord.findFirst({
    where: { id: input.recordId, clientId: input.clientId },
  });
  if (!record) throw new Error("Record not found");
  if (record.status !== "Draft") {
    if (
      ctx.workflowRole !== "PlatformAdmin" ||
      record.status !== "UnderReview"
    ) {
      throw new Error("Documents can only be added to Draft records");
    }
  }

  if (!input.fileName || input.fileName.trim().length === 0) {
    throw new Error("File name is required");
  }

  const ext = getExtension(input.fileName);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error(
      `File type "${ext}" is not allowed. Allowed: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`,
    );
  }

  if (input.content.length > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
    );
  }

  const doc = await prisma.sunbulDocument.create({
    data: {
      clientId: input.clientId,
      recordId: input.recordId,
      fileName: input.fileName.trim(),
      fileType: input.fileType || "application/octet-stream",
      fileSize: input.content.length,
      storageKey: "pending",
      uploadedById: ctx.id,
    },
  });

  const storageKey = buildWorkflowStorageKey(
    input.clientId,
    input.recordId,
    doc.id,
    input.fileName,
  );

  const storage = getStorageProvider();
  await storage.store(storageKey, {
    filename: input.fileName.trim(),
    mimeType: input.fileType || "application/octet-stream",
    content: input.content,
  });

  await prisma.sunbulDocument.update({
    where: { id: doc.id },
    data: { storageKey },
  });

  await createWorkflowAuditEvent({
    clientId: input.clientId,
    recordId: input.recordId,
    actorId: ctx.id,
    action: "DOCUMENT_CREATED",
    entityType: "SunbulDocument",
    entityId: doc.id,
    metadata: { fileName: input.fileName, fileSize: input.content.length },
  });

  return { ...doc, storageKey };
}

export async function deleteStoredWorkflowDocument(
  clientId: string,
  recordId: string,
  documentId: string,
) {
  const ctx = await requireClientAccess(clientId, "Reviewer");
  if (ctx.workflowRole !== "PlatformAdmin") {
    throw new Error("Access denied: only PlatformAdmin can delete documents");
  }

  const doc = await prisma.sunbulDocument.findFirst({
    where: { id: documentId, clientId, recordId },
  });
  if (!doc) throw new Error("Document not found");

  if (doc.storageKey && !doc.storageKey.startsWith("metadata-only:")) {
    const storage = getStorageProvider();
    await storage.delete(doc.storageKey);
  }

  await prisma.sunbulDocument.delete({ where: { id: documentId } });

  await createWorkflowAuditEvent({
    clientId,
    recordId,
    actorId: ctx.id,
    action: "DOCUMENT_DELETED",
    entityType: "SunbulDocument",
    entityId: documentId,
    metadata: { action: "deleted", fileName: doc.fileName },
  });
}

export async function retrieveWorkflowDocument(
  clientId: string,
  recordId: string,
  documentId: string,
) {
  await requireClientAccess(clientId);

  const doc = await prisma.sunbulDocument.findFirst({
    where: { id: documentId, clientId, recordId },
  });
  if (!doc) throw new Error("Document not found");
  if (!doc.storageKey || doc.storageKey.startsWith("metadata-only:")) {
    throw new Error("File not stored yet");
  }

  const storage = getStorageProvider();
  const file = await storage.retrieve(doc.storageKey);
  if (!file) throw new Error("File not found in storage");

  return { document: doc, file };
}
