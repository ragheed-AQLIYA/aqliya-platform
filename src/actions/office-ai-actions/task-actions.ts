"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { prisma } from "@/lib/prisma";
import {
  createOfficeAiTask,
  updateOfficeAiTaskStatus,
} from "@/lib/office-ai/office-ai-task-service";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import { auditLogger, Product } from "@/lib/platform/audit-logger";
import {
  getTaskDetail,
  getWorkspaceNameById,
  getProjectNameById,
} from "../office-ai-workspace-actions";
import type { TaskDetail } from "../office-ai-workspace-actions";

export async function createOfficeAiTaskAction(
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }
  await enforce(
    user,
    {
      type: "platform",
      id: user.organizationId,
      tenantId: user.organizationId,
    },
    "create",
  );

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

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.task.created",
      { type: "OfficeAiTask", id: (result.data as { id: string })?.id ?? "unknown" },
      { severity: "info" },
    );
  } catch {
    /* audit failure non-blocking */
  }

  revalidatePath("/assistant");
  if (platformOrganizationId) {
    await invalidateCacheByPrefix(
      `dashboard:assistant:${platformOrganizationId}:stats`,
    );
  }
}

export async function updateOfficeAiTaskStatusAction(
  taskId: string,
  status: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }
  await enforce(
    user,
    { type: "platform", id: taskId, tenantId: user.organizationId ?? "" },
    "update",
  );

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    select: { platformOrganizationId: true },
  });
  if (!task) throw new Error("OfficeAiTask not found");
  if (
    user.platformOrganizationId &&
    task.platformOrganizationId !== user.platformOrganizationId
  ) {
    throw new Error("Access denied");
  }

  const result = await updateOfficeAiTaskStatus(taskId, status, {
    id: user.id,
    name: user.name,
  });
  if (!result.success) {
    throw new Error(result.error || "Failed to update status");
  }

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      `office_ai.task.${status}`,
      { type: "OfficeAiTask", id: taskId },
      { severity: "info" },
    );
  } catch {
    /* audit failure non-blocking */
  }

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${taskId}`);
  if (task.platformOrganizationId) {
    await invalidateCacheByPrefix(
      `dashboard:assistant:${task.platformOrganizationId}:stats`,
    );
  }
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

export async function updateOfficeAiTaskAction(
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
    "update",
  );

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    select: { platformOrganizationId: true },
  });
  if (!task) throw new Error("OfficeAiTask not found");
  if (
    user.platformOrganizationId &&
    task.platformOrganizationId !== user.platformOrganizationId
  ) {
    throw new Error("Access denied");
  }

  const { updateOfficeAiTaskDetails } = await import(
    "@/lib/office-ai/office-ai-task-service"
  );

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

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.task.updated",
      { type: "OfficeAiTask", id: taskId },
      { severity: "info" },
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

export async function archiveOfficeAiTaskAction(taskId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }
  await enforce(
    user,
    { type: "platform", id: taskId, tenantId: user.organizationId ?? "" },
    "update",
  );
  const { archiveOfficeAiTask } = await import(
    "@/lib/office-ai/office-ai-task-service"
  );

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

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.task.archived",
      { type: "OfficeAiTask", id: taskId },
      { severity: "info" },
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

export interface FetchTaskDetailResult {
  task: TaskDetail;
  workspaceName: string | null;
  projectName: string | null;
}

export async function fetchTaskDetailAction(
  taskId: string,
): Promise<FetchTaskDetailResult | null> {
  const task = await getTaskDetail(taskId);
  if (!task) return null;

  let workspaceName: string | null = null;
  let projectName: string | null = null;
  if (task.clientWorkspaceId) {
    workspaceName = await getWorkspaceNameById(task.clientWorkspaceId);
  }
  if (task.projectId) {
    projectName = await getProjectNameById(task.projectId);
  }

  return { task, workspaceName, projectName };
}
