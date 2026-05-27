// ─── Office AI Task Service ───
// Service-layer CRUD for Office AI Assistant tasks, files, and outputs.
// Emits PlatformAuditLog events for all lifecycle actions.
// Safe mode: never blocks on audit failure.

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  generateDeterministicOfficeAiOutput,
  type FileWithContent,
} from "./deterministic-generators";
import { extractAllTaskFiles } from "./file-extraction-service";

// ─── Module-level audit logger ───
// All calls share productKey + sourceSystem.
const alog = auditLogger({ productKey: Product.OFFICE_AI_ASSISTANT });

// ─── Types ───

export const VALID_TASK_TYPES = [
  "excel_analysis",
  "document_summary",
  "report_draft",
  "presentation_outline",
  "executive_summary",
  "meeting_notes",
] as const;

export type OfficeAiTaskType = (typeof VALID_TASK_TYPES)[number];

export const VALID_STATUSES = [
  "draft",
  "generated",
  "needs_review",
  "reviewed",
  "approved",
  "rejected",
  "archived",
] as const;

export type OfficeAiStatus = (typeof VALID_STATUSES)[number];

export const VALID_LANGUAGES = ["ar", "en"] as const;
export type OfficeAiLanguage = (typeof VALID_LANGUAGES)[number];

export interface CreateOfficeAiTaskInput {
  platformOrganizationId: string;
  clientWorkspaceId?: string;
  projectId?: string;
  taskType: string;
  language?: string;
  title?: string;
  instructions?: string;
  createdById?: string;
  createdByName?: string;
}

export interface AddOfficeAiFileInput {
  filename: string;
  fileType: string;
  mimeType?: string;
  storageKey?: string;
  fileHash?: string;
  sizeBytes?: number;
  uploadedById?: string;
  metadata?: Record<string, unknown>;
}

export interface AddOfficeAiOutputInput {
  content: string;
  format?: string;
  aiProvider?: string;
  aiModel?: string;
  aiPromptVersion?: string;
  confidenceScore?: number;
  metadata?: Record<string, unknown>;
}

// ─── Validation ───

function validateRequired(value: unknown, name: string): void {
  if (!value || (typeof value === "string" && value.trim().length === 0)) {
    throw new Error(`OfficeAiTask validation: ${name} is required`);
  }
}

function validateIn(
  value: string,
  valid: readonly string[],
  name: string,
): void {
  if (!valid.includes(value as never)) {
    throw new Error(
      `OfficeAiTask validation: ${name} must be one of: ${valid.join(", ")}`,
    );
  }
}

// ─── Core Service ───

export async function createOfficeAiTask(
  input: CreateOfficeAiTaskInput,
): Promise<OfficeAiTaskResult> {
  validateRequired(input.platformOrganizationId, "platformOrganizationId");
  validateRequired(input.taskType, "taskType");
  validateIn(input.taskType, VALID_TASK_TYPES, "taskType");
  if (input.language) validateIn(input.language, VALID_LANGUAGES, "language");

  const task = await prisma.officeAiTask.create({
    data: {
      platformOrganizationId: input.platformOrganizationId,
      clientWorkspaceId: input.clientWorkspaceId ?? null,
      projectId: input.projectId ?? null,
      taskType: input.taskType,
      language: input.language ?? "ar",
      title: input.title ?? null,
      instructions: input.instructions ?? null,
      createdById: input.createdById ?? null,
      createdByName: input.createdByName ?? null,
    },
  });

  // Audit event
  await alog.record(
    "office_ai.task.created",
    {
      type: "OfficeAiTask",
      id: task.id,
    },
    {
      platformOrganizationId: task.platformOrganizationId,
      clientWorkspaceId: task.clientWorkspaceId ?? undefined,
      projectId: task.projectId ?? undefined,
      actorId: input.createdById,
      actorName: input.createdByName,
      sourceModel: "OfficeAiTask",
      sourceId: task.id,
      metadata: {
        governedSharedApplication: true,
        taskType: task.taskType,
        status: task.status,
      },
    },
  );

  return { success: true, data: task };
}

export async function getOfficeAiTaskById(
  taskId: string,
): Promise<OfficeAiTaskResult> {
  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    include: { outputs: true, sourceFiles: true },
  });

  if (!task) {
    return { success: false, error: "OfficeAiTask not found" };
  }

  return { success: true, data: task };
}

export async function listOfficeAiTasksByProject(
  projectId: string,
  opts?: { status?: string; limit?: number },
): Promise<OfficeAiTaskListResult> {
  const where: Record<string, unknown> = { projectId };
  if (opts?.status) where.status = opts.status;

  const tasks = await prisma.officeAiTask.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 20,
  });

  return { success: true, data: tasks };
}

export async function listOfficeAiTasksByWorkspace(
  clientWorkspaceId: string,
  opts?: { status?: string; limit?: number },
): Promise<OfficeAiTaskListResult> {
  const where: Record<string, unknown> = { clientWorkspaceId };
  if (opts?.status) where.status = opts.status;

  const tasks = await prisma.officeAiTask.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: opts?.limit ?? 20,
  });

  return { success: true, data: tasks };
}

export async function addOfficeAiFile(
  taskId: string,
  input: AddOfficeAiFileInput,
): Promise<OfficeAiFileResult> {
  validateRequired(input.filename, "filename");
  validateRequired(input.fileType, "fileType");

  const file = await prisma.officeAiFile.create({
    data: {
      taskId,
      filename: input.filename,
      fileType: input.fileType,
      mimeType: input.mimeType ?? null,
      storageKey: input.storageKey ?? null,
      fileHash: input.fileHash ?? null,
      sizeBytes: input.sizeBytes ?? null,
      uploadedById: input.uploadedById ?? null,
      metadata: (input.metadata ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  // Audit event
  await alog.record(
    "office_ai.file.attached",
    {
      type: "OfficeAiFile",
      id: file.id,
    },
    {
      actorId: input.uploadedById,
      severity: "info",
      sourceModel: "OfficeAiFile",
      sourceId: file.id,
      metadata: {
        governedSharedApplication: true,
        taskId,
        filename: input.filename,
        fileType: input.fileType,
      },
    },
  );

  return { success: true, data: file };
}

export async function addOfficeAiOutput(
  taskId: string,
  input: AddOfficeAiOutputInput,
): Promise<OfficeAiOutputResult> {
  validateRequired(input.content, "content");

  const output = await prisma.officeAiOutput.create({
    data: {
      taskId,
      content: input.content,
      format: input.format ?? "markdown",
      aiProvider: input.aiProvider ?? "deterministic",
      aiModel: input.aiModel ?? null,
      aiPromptVersion: input.aiPromptVersion ?? null,
      confidenceScore: input.confidenceScore ?? null,
      metadata: (input.metadata ?? undefined) as unknown as
        | Prisma.InputJsonValue
        | undefined,
    },
  });

  // Update task status
  await prisma.officeAiTask.update({
    where: { id: taskId },
    data: { status: "generated" },
  });

  // Audit event
  await alog.record(
    "office_ai.output.created",
    {
      type: "OfficeAiOutput",
      id: output.id,
    },
    {
      severity: "info",
      sourceModel: "OfficeAiOutput",
      sourceId: output.id,
      aiProvider: input.aiProvider,
      aiModel: input.aiModel,
      aiPromptVersion: input.aiPromptVersion,
      metadata: {
        governedSharedApplication: true,
        taskId,
        format: output.format,
        status: output.status,
      },
    },
  );

  return { success: true, data: output };
}

export async function updateOfficeAiTaskStatus(
  taskId: string,
  status: string,
  actor?: { id?: string; name?: string },
): Promise<OfficeAiTaskResult> {
  validateIn(status, VALID_STATUSES, "status");

  const old = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    select: { status: true },
  });
  const previousStatus = old?.status;

  const task = await prisma.officeAiTask.update({
    where: { id: taskId },
    data: {
      status,
      reviewedById:
        status === "approved" || status === "rejected"
          ? (actor?.id ?? null)
          : undefined,
      reviewedAt:
        status === "approved" || status === "rejected" ? new Date() : undefined,
      approvedById: status === "approved" ? (actor?.id ?? null) : undefined,
      approvedAt: status === "approved" ? new Date() : undefined,
    },
  });

  await alog.record(
    "office_ai.task.status_changed",
    {
      type: "OfficeAiTask",
      id: task.id,
    },
    {
      platformOrganizationId: task.platformOrganizationId,
      clientWorkspaceId: task.clientWorkspaceId ?? undefined,
      projectId: task.projectId ?? undefined,
      actorId: actor?.id,
      actorName: actor?.name,
      severity: status === "rejected" ? "warning" : "info",
      sourceModel: "OfficeAiTask",
      sourceId: task.id,
      metadata: {
        governedSharedApplication: true,
        previousStatus,
        newStatus: status,
        taskType: task.taskType,
      },
    },
  );

  return { success: true, data: task };
}

export async function updateOfficeAiTaskDetails(
  taskId: string,
  input: {
    title?: string;
    instructions?: string;
    language?: string;
    clientWorkspaceId?: string | null;
    projectId?: string | null;
  },
  actor?: { id?: string; name?: string },
): Promise<OfficeAiTaskResult> {
  const existing = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
  });
  if (!existing) return { success: false, error: "OfficeAiTask not found" };

  const data: Record<string, unknown> = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.instructions !== undefined) data.instructions = input.instructions;
  if (input.language !== undefined) {
    validateIn(input.language, VALID_LANGUAGES, "language");
    data.language = input.language;
  }
  if (input.clientWorkspaceId !== undefined)
    data.clientWorkspaceId = input.clientWorkspaceId;
  if (input.projectId !== undefined) data.projectId = input.projectId;

  const task = await prisma.officeAiTask.update({
    where: { id: taskId },
    data: data as never,
  });

  await alog.record(
    "office_ai.task.updated",
    {
      type: "OfficeAiTask",
      id: task.id,
    },
    {
      platformOrganizationId: task.platformOrganizationId,
      clientWorkspaceId: task.clientWorkspaceId ?? undefined,
      projectId: task.projectId ?? undefined,
      actorId: actor?.id,
      actorName: actor?.name,
      severity: "info",
      sourceModel: "OfficeAiTask",
      sourceId: task.id,
      metadata: {
        governedSharedApplication: true,
        updatedFields: Object.keys(data),
        taskType: task.taskType,
      },
    },
  );

  return { success: true, data: task };
}

export async function archiveOfficeAiTask(
  taskId: string,
  actor?: { id?: string; name?: string },
): Promise<OfficeAiTaskResult> {
  const existing = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
  });
  if (!existing) return { success: false, error: "OfficeAiTask not found" };
  if (existing.status === "archived")
    return { success: false, error: "Task already archived" };

  const task = await prisma.officeAiTask.update({
    where: { id: taskId },
    data: { status: "archived" },
  });

  await alog.record(
    "office_ai.task.archived",
    {
      type: "OfficeAiTask",
      id: task.id,
    },
    {
      platformOrganizationId: task.platformOrganizationId,
      clientWorkspaceId: task.clientWorkspaceId ?? undefined,
      projectId: task.projectId ?? undefined,
      actorId: actor?.id,
      actorName: actor?.name,
      severity: "info",
      sourceModel: "OfficeAiTask",
      sourceId: task.id,
      metadata: {
        governedSharedApplication: true,
        previousStatus: existing.status,
        taskType: task.taskType,
      },
    },
  );

  return { success: true, data: task };
}

export async function updateOfficeAiOutputContent(
  outputId: string,
  content: string,
  actor?: { id?: string; name?: string },
): Promise<OfficeAiOutputResult> {
  const existing = await prisma.officeAiOutput.findUnique({
    where: { id: outputId },
  });
  if (!existing) return { success: false, error: "OfficeAiOutput not found" };

  const output = await prisma.officeAiOutput.update({
    where: { id: outputId },
    data: {
      content,
      status: "draft",
      metadata: {
        ...(existing.metadata as Record<string, unknown> | undefined),
        previousContent: existing.content.slice(0, 500),
        editedAt: new Date().toISOString(),
        editedBy: actor?.name ?? "unknown",
      } as never,
    },
  });

  await alog.record(
    "office_ai.output.edited",
    {
      type: "OfficeAiOutput",
      id: output.id,
    },
    {
      actorId: actor?.id,
      actorName: actor?.name,
      severity: "info",
      sourceModel: "OfficeAiOutput",
      sourceId: output.id,
      metadata: {
        governedSharedApplication: true,
        taskId: output.taskId,
        format: output.format,
      },
    },
  );

  return { success: true, data: output };
}

export async function updateOfficeAiOutputStatus(
  outputId: string,
  status: string,
  actor?: { id?: string; name?: string },
): Promise<OfficeAiOutputResult> {
  validateIn(status, VALID_STATUSES, "status");

  const output = await prisma.officeAiOutput.update({
    where: { id: outputId },
    data: {
      status,
      reviewedById: actor?.id ?? null,
      reviewedAt:
        status === "approved" || status === "rejected" ? new Date() : undefined,
    },
  });

  await alog.record(
    "office_ai.output.status_changed",
    {
      type: "OfficeAiOutput",
      id: output.id,
    },
    {
      actorId: actor?.id,
      actorName: actor?.name,
      severity: status === "rejected" ? "warning" : "info",
      sourceModel: "OfficeAiOutput",
      sourceId: output.id,
      metadata: {
        governedSharedApplication: true,
        newStatus: status,
        taskId: output.taskId,
      },
    },
  );

  return { success: true, data: output };
}

export async function generateOfficeAiTaskOutput(
  taskId: string,
  actor?: { id?: string; name?: string },
): Promise<OfficeAiOutputResult> {
  // Extract all task files first (safe mode — never blocks)
  await extractAllTaskFiles(taskId).catch(() => {});

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    include: {
      sourceFiles: {
        select: {
          filename: true,
          fileType: true,
          extractedContent: true,
          extractionStatus: true,
        },
      },
    },
  });

  if (!task) {
    return { success: false, error: "OfficeAiTask not found" };
  }

  const files: FileWithContent[] = task.sourceFiles.map((f) => ({
    filename: f.filename,
    fileType: f.fileType,
    extractedContent:
      f.extractionStatus === "completed"
        ? (f.extractedContent ?? undefined)
        : undefined,
    extractionStatus: f.extractionStatus ?? undefined,
  }));

  const { content, format } = generateDeterministicOfficeAiOutput(
    {
      id: task.id,
      title: task.title,
      taskType: task.taskType,
      instructions: task.instructions,
      language: task.language,
      createdByName: task.createdByName,
    },
    files,
  );

  // Create the output via existing service
  const outputResult = await addOfficeAiOutput(taskId, {
    content,
    format,
    aiProvider: "deterministic",
    aiPromptVersion: "office-ai-deterministic-v1",
  });

  if (!outputResult.success) {
    return outputResult;
  }

  // Update task status to generated
  await updateOfficeAiTaskStatus(taskId, "generated", actor);

  return outputResult;
}

// ─── Result Types ───

export interface OfficeAiTaskResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface OfficeAiTaskListResult {
  success: boolean;
  data?: unknown[];
  error?: string;
}

export interface OfficeAiFileResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface OfficeAiOutputResult {
  success: boolean;
  data?: unknown;
  error?: string;
}
