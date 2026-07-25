import { prisma } from "@/lib/prisma";
import {
  alog,
  validateRequired,
  validateIn,
  VALID_TASK_TYPES,
  VALID_LANGUAGES,
  type CreateOfficeAiTaskInput,
  type OfficeAiTaskResult,
  type OfficeAiTaskListResult,
} from "./common";

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
