"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { validateFileContent } from "@/lib/security/file-validation";
import { getStorageProvider } from "@/lib/platform/storage";
import { addOfficeAiFile } from "@/lib/office-ai/office-ai-task-service";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  MAX_FILE_SIZE_BYTES,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  sanitizeFilename,
  getExtension,
  formatFileError,
} from "./common";

export async function addOfficeAiFileAction(
  taskId: string,
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }
  await enforce(
    user,
    { type: "platform", id: taskId, tenantId: user.organizationId ?? "" },
    "create",
  );

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    select: { platformOrganizationId: true },
  });
  if (!task) formatFileError("Task not found");
  if (
    user.platformOrganizationId &&
    task.platformOrganizationId !== user.platformOrganizationId
  ) {
    formatFileError("Access denied");
  }

  const fileField = formData.get("file") as File | null;

  let filename: string;
  let fileType: string;
  let mimeType: string | undefined;
  let sizeBytes: number | undefined;
  let fromMetadata = false;

  if (fileField && fileField.size > 0) {
    fromMetadata = false;
    filename = sanitizeFilename(fileField.name);
    if (!filename) formatFileError("Invalid or empty filename");
    fileType = getExtension(filename);
    if (!fileType) formatFileError("File must have an extension");
    if (!ALLOWED_EXTENSIONS.includes(fileType)) {
      formatFileError(
        `File type ".${fileType}" is not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(", ")}`,
      );
    }
    if (fileField.size > MAX_FILE_SIZE_BYTES) {
      formatFileError(
        `File is too large (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)`,
      );
    }
    mimeType = fileField.type || undefined;
    if (
      mimeType &&
      !ALLOWED_MIME_TYPES.includes(mimeType) &&
      !mimeType.startsWith("text/")
    ) {
      // Unknown MIME but extension matches — allow (user may be on a system with non-standard MIME)
    }
    sizeBytes = fileField.size;
  } else {
    fromMetadata = true;
    filename = sanitizeFilename((formData.get("filename") as string) || "");
    if (!filename)
      formatFileError("Filename is required when not uploading a file");
    fileType =
      (formData.get("fileType") as string) ||
      getExtension(filename) ||
      "unknown";
    const ext = getExtension(filename);
    if (ext && !ALLOWED_EXTENSIONS.includes(ext)) {
      formatFileError(
        `File type ".${ext}" is not allowed. Accepted: ${ALLOWED_EXTENSIONS.join(", ")}`,
      );
    }
    sizeBytes = Number(formData.get("sizeBytes")) || undefined;
    if (sizeBytes && sizeBytes > MAX_FILE_SIZE_BYTES) {
      formatFileError(
        `File size exceeds max (${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB)`,
      );
    }
  }

  let storageKey: string | undefined;
  let fileHash: string | undefined;
  let finalSize: number | undefined;

  if (!fromMetadata) {
    try {
      const buffer = Buffer.from(await fileField!.arrayBuffer());
      fileHash = createHash("sha256").update(buffer).digest("hex");
      finalSize = buffer.length;

      const oaiExtension = filename.split(".").pop()?.toLowerCase() || "";
      const oaiMagicValidation = validateFileContent(buffer, oaiExtension);
      if (!oaiMagicValidation.valid) {
        formatFileError(
          oaiMagicValidation.error ||
            "File content does not match its claimed extension",
        );
      }

      storageKey = `office-ai/${taskId}/${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const provider = getStorageProvider();
      await provider.store(storageKey, {
        filename,
        mimeType: mimeType || "application/octet-stream",
        content: buffer,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown storage error";
      formatFileError(`Failed to upload file: ${msg}`);
    }
  } else {
    finalSize = sizeBytes;
  }

  const result = await addOfficeAiFile(taskId, {
    filename,
    fileType,
    mimeType,
    storageKey,
    fileHash,
    sizeBytes: finalSize,
    uploadedById: user.id,
    metadata: { test: false, fromMetadata },
  });

  if (!result.success) formatFileError(result.error || "Failed to attach file");

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.file.uploaded",
      { type: "OfficeAiFile", id: taskId },
      { severity: "info", metadata: { filename, fileType } },
    );
  } catch {
    /* audit failure non-blocking */
  }

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${taskId}`);
  if (user.platformOrganizationId) {
    await invalidateCacheByPrefix(
      `dashboard:assistant:${user.platformOrganizationId}:stats`,
    );
  }
}

export async function removeOfficeAiFileAction(fileId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }
  await enforce(
    user,
    { type: "platform", id: fileId, tenantId: user.organizationId ?? "" },
    "delete",
  );

  const file = await prisma.officeAiFile.findUnique({
    where: { id: fileId },
    include: { task: { select: { platformOrganizationId: true } } },
  });
  if (!file) formatFileError("File not found");
  if (
    user.platformOrganizationId &&
    file.task.platformOrganizationId !== user.platformOrganizationId
  ) {
    formatFileError("Access denied");
  }

  if (file.storageKey) {
    try {
      const provider = getStorageProvider();
      await provider.delete(file.storageKey);
    } catch {
      // Non-blocking
    }
  }

  await prisma.officeAiFile.delete({ where: { id: fileId } });

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.file.removed",
      { type: "OfficeAiFile", id: fileId },
      { severity: "info" },
    );
  } catch {
    /* audit failure non-blocking */
  }

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${file.taskId}`);
  if (user.platformOrganizationId) {
    await invalidateCacheByPrefix(
      `dashboard:assistant:${user.platformOrganizationId}:stats`,
    );
  }
}

export async function reExtractFileAction(fileId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }
  await enforce(
    user,
    { type: "platform", id: fileId, tenantId: user.organizationId ?? "" },
    "update",
  );
  const { reExtractFileContent } = await import(
    "@/lib/office-ai/file-extraction-service"
  );

  const file = await prisma.officeAiFile.findUnique({
    where: { id: fileId },
    include: { task: { select: { platformOrganizationId: true, id: true } } },
  });
  if (!file) throw new Error("File not found");
  if (
    user.platformOrganizationId &&
    file.task.platformOrganizationId !== user.platformOrganizationId
  ) {
    throw new Error("Access denied");
  }

  const result = await reExtractFileContent(fileId, {
    id: user.id,
    name: user.name,
  });
  if (!result.success) throw new Error(result.error || "Failed to re-extract");

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.file.re_extracted",
      { type: "OfficeAiFile", id: fileId },
      { severity: "info" },
    );
  } catch {
    /* audit failure non-blocking */
  }

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${file.task.id}`);
}
