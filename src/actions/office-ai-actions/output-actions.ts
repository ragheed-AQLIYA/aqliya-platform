"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { prisma } from "@/lib/prisma";
import { generateOfficeAiTaskOutput } from "@/lib/office-ai/office-ai-task-service";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import { auditLogger, Product } from "@/lib/platform/audit-logger";

export async function generateOfficeAiOutputAction(
  taskId: string,
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

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.output.generated",
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

export async function updateOfficeAiOutputAction(
  outputId: string,
  formData: FormData,
): Promise<void> {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) {
    throw new Error("Access denied: VIEWER role required");
  }
  await enforce(
    user,
    { type: "platform", id: outputId, tenantId: user.organizationId ?? "" },
    "update",
  );
  const { updateOfficeAiOutputContent } = await import(
    "@/lib/office-ai/office-ai-task-service"
  );

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

  try {
    const alog = auditLogger({
      productKey: Product.OFFICE_AI,
      sourceSystem: "office_ai",
      actor: { id: user.id, name: user.name, email: user.email },
    });
    await alog.record(
      "office_ai.output.updated",
      { type: "OfficeAiOutput", id: outputId },
      { severity: "info" },
    );
  } catch {
    /* audit failure non-blocking */
  }

  revalidatePath("/assistant");
  revalidatePath(`/assistant/${output.taskId}`);
  if (user.platformOrganizationId) {
    await invalidateCacheByPrefix(
      `dashboard:assistant:${user.platformOrganizationId}:stats`,
    );
  }
}
