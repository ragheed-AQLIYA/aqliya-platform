import { prisma } from "@/lib/prisma";
import {
  alog,
  validateIn,
  VALID_STATUSES,
  VALID_LANGUAGES,
  type OfficeAiTaskResult,
} from "./common";

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
