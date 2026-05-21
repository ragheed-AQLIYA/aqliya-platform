"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { getStorageProvider } from "@/lib/platform/storage";
import {
  createOfficeAiTask,
  updateOfficeAiTaskStatus,
  generateOfficeAiTaskOutput,
  addOfficeAiFile,
} from "@/lib/office-ai/office-ai-task-service";

// ─── File validation ───

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "csv", "txt"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "text/plain",
];

function sanitizeFilename(name: string): string {
  // Remove path traversal, unsafe chars, limit length
  const safe = name
    .replace(/\.\./g, "")
    .replace(/[/\\:<>"|?*]/g, "_")
    .trim();
  return safe.length > 200 ? safe.slice(0, 200) : safe;
}

function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot + 1).toLowerCase() : "";
}

function formatFileError(msg: string): never {
  throw new Error(msg);
}

// ─── Actions ───

export async function createOfficeAiTaskAction(
  formData: FormData,
): Promise<void> {
  const user = await requireUserContext("VIEWER");

  const platformOrganizationId = user.platformOrganizationId;
  if (!platformOrganizationId) {
    throw new Error("Platform organization context required");
  }

  const taskType = formData.get("taskType") as string;
  const language = formData.get("language") as string;
  const title = formData.get("title") as string;
  const instructions = formData.get("instructions") as string;
  const clientWorkspaceId = formData.get("clientWorkspaceId") as string;
  const projectId = formData.get("projectId") as string;

  const result = await createOfficeAiTask({
    platformOrganizationId,
    clientWorkspaceId: clientWorkspaceId || undefined,
    projectId: projectId || undefined,
    taskType,
    language: language || "ar",
    title: title || undefined,
    instructions: instructions || undefined,
    createdById: user.id,
    createdByName: user.name,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to create task");
  }

  revalidatePath("/assistant");
}

export async function updateOfficeAiTaskStatusAction(
  taskId: string,
  status: string,
): Promise<void> {
  const user = await requireUserContext("VIEWER");
  const result = await updateOfficeAiTaskStatus(taskId, status, {
    id: user.id,
    name: user.name,
  });
  if (!result.success) {
    throw new Error(result.error || "Failed to update status");
  }
  revalidatePath("/assistant");
  revalidatePath(`/assistant/${taskId}`);
}

export async function submitOfficeAiTaskForReviewAction(
  taskId: string,
): Promise<void> {
  return updateOfficeAiTaskStatusAction(taskId, "needs_review");
}

export async function approveOfficeAiTaskAction(taskId: string): Promise<void> {
  return updateOfficeAiTaskStatusAction(taskId, "approved");
}

export async function rejectOfficeAiTaskAction(taskId: string): Promise<void> {
  return updateOfficeAiTaskStatusAction(taskId, "rejected");
}

export async function generateOfficeAiOutputAction(
  taskId: string,
): Promise<void> {
  const user = await requireUserContext("VIEWER");

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    select: { platformOrganizationId: true },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (
    user.platformOrganizationId &&
    task.platformOrganizationId !== user.platformOrganizationId
  ) {
    throw new Error("Access denied");
  }

  const result = await generateOfficeAiTaskOutput(taskId, {
    id: user.id,
    name: user.name,
  });
  if (!result.success) {
    throw new Error(result.error || "Failed to generate output");
  }

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${taskId}`);
}

export async function addOfficeAiFileAction(
  taskId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUserContext("VIEWER");

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

  // Determine filename and source
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
    // Validate extension for metadata too if it maps to known types
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

  // Upload if real file
  let storageKey: string | undefined;
  let fileHash: string | undefined;
  let finalSize: number | undefined;

  if (!fromMetadata) {
    try {
      const buffer = Buffer.from(await fileField!.arrayBuffer());
      fileHash = createHash("sha256").update(buffer).digest("hex");
      finalSize = buffer.length;
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

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${taskId}`);
}

export async function removeOfficeAiFileAction(fileId: string): Promise<void> {
  const user = await requireUserContext("VIEWER");

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

  // Try storage deletion (best-effort)
  if (file.storageKey) {
    try {
      const provider = getStorageProvider();
      await provider.delete(file.storageKey);
    } catch {
      // Non-blocking
    }
  }

  await prisma.officeAiFile.delete({ where: { id: fileId } });
  revalidatePath("/assistant");
  revalidatePath(`/assistant/${file.taskId}`);
}

// ─── Safe Action Results ───

export interface SafeActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

// ─── New Actions ───

export async function updateOfficeAiTaskAction(
  taskId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUserContext("VIEWER");
  const { updateOfficeAiTaskDetails } =
    await import("@/lib/office-ai/office-ai-task-service");

  const title = formData.get("title") as string;
  const instructions = formData.get("instructions") as string;
  const language = formData.get("language") as string;
  const clientWorkspaceId = formData.get("clientWorkspaceId") as string;
  const projectId = formData.get("projectId") as string;

  const result = await updateOfficeAiTaskDetails(
    taskId,
    {
      title: title || undefined,
      instructions: instructions || undefined,
      language: language || undefined,
      clientWorkspaceId: clientWorkspaceId || null,
      projectId: projectId || null,
    },
    { id: user.id, name: user.name },
  );

  if (!result.success) throw new Error(result.error || "Failed to update task");

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${taskId}`);
}

export async function updateOfficeAiOutputAction(
  outputId: string,
  formData: FormData,
): Promise<void> {
  const user = await requireUserContext("VIEWER");
  const { updateOfficeAiOutputContent } =
    await import("@/lib/office-ai/office-ai-task-service");

  const content = formData.get("content") as string;
  if (!content || content.trim().length === 0) {
    throw new Error("Content is required");
  }

  const output = await prisma.officeAiOutput.findUnique({
    where: { id: outputId },
    include: { task: { select: { platformOrganizationId: true } } },
  });
  if (!output) throw new Error("Output not found");
  if (
    user.platformOrganizationId &&
    output.task.platformOrganizationId !== user.platformOrganizationId
  ) {
    throw new Error("Access denied");
  }

  const result = await updateOfficeAiOutputContent(outputId, content, {
    id: user.id,
    name: user.name,
  });
  if (!result.success)
    throw new Error(result.error || "Failed to update output");

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${output.taskId}`);
}

export async function archiveOfficeAiTaskAction(taskId: string): Promise<void> {
  const user = await requireUserContext("VIEWER");
  const { archiveOfficeAiTask } =
    await import("@/lib/office-ai/office-ai-task-service");

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    select: { platformOrganizationId: true },
  });
  if (!task) throw new Error("Task not found");
  if (
    user.platformOrganizationId &&
    task.platformOrganizationId !== user.platformOrganizationId
  ) {
    throw new Error("Access denied");
  }

  const result = await archiveOfficeAiTask(taskId, {
    id: user.id,
    name: user.name,
  });
  if (!result.success)
    throw new Error(result.error || "Failed to archive task");

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${taskId}`);
}

export async function reExtractFileAction(fileId: string): Promise<void> {
  const user = await requireUserContext("VIEWER");
  const { reExtractFileContent } =
    await import("@/lib/office-ai/file-extraction-service");

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

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${file.task.id}`);
}
