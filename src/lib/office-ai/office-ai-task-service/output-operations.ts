import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  alog,
  validateRequired,
  validateIn,
  VALID_STATUSES,
  type AddOfficeAiOutputInput,
  type OfficeAiOutputResult,
} from "./common";

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

  await prisma.officeAiTask.update({
    where: { id: taskId },
    data: { status: "generated" },
  });

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
