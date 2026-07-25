import { prisma } from "@/lib/prisma";
import {
  generateDeterministicOfficeAiOutput,
  type FileWithContent,
} from "../deterministic-generators";
import { addOfficeAiOutput } from "./output-operations";
import { updateOfficeAiTaskStatus } from "./task-status";
import {
  alog,
  type OfficeAiTaskType,
  type OfficeAiOutputResult,
} from "./common";

export async function generateOfficeAiTaskOutput(
  taskId: string,
  actor?: { id?: string; name?: string },
): Promise<OfficeAiOutputResult> {
  const generationStart = Date.now();

  const { extractAllTaskFiles } = await import("../file-extraction-service");
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

  const fileContext = files
    .map((f) => f.extractedContent)
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 8000);

  const { runGovernedOfficeAI } = await import(
    "../office-ai-orchestrator-bridge"
  );
  const governed = await runGovernedOfficeAI({
    taskId: task.id,
    title: task.title ?? "Office AI task",
    taskType: task.taskType as OfficeAiTaskType,
    instructions: task.instructions,
    language: task.language,
    organizationId: task.platformOrganizationId,
    userId: actor?.id,
    fileContext,
    fileNames: files.map((f) => f.filename),
  }).catch(() => null);

  let content: string;
  let format = "markdown";
  let aiProvider = "deterministic";
  let aiPromptVersion = "office-ai-deterministic-v1";

  if (governed?.content) {
    content = governed.content;
    format = governed.format;
    aiProvider = governed.aiProvider;
    aiPromptVersion = governed.aiPromptVersion;
  } else {
    const deterministic = generateDeterministicOfficeAiOutput(
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
    content = deterministic.content;
    format = deterministic.format;
  }

  const outputResult = await addOfficeAiOutput(taskId, {
    content,
    format,
    aiProvider,
    aiPromptVersion,
  });

  if (!outputResult.success) {
    return outputResult;
  }

  await updateOfficeAiTaskStatus(taskId, "generated", actor);

  const latencyMs = Date.now() - generationStart;
  await alog.record(
    "ai_generation",
    {
      type: "OfficeAiOutput",
      id: (outputResult.data as { id?: string } | null)?.id ?? taskId,
    },
    {
      severity: "info",
      status: "recorded",
      aiProvider,
      aiPromptVersion,
      aiOutputReviewStatus: "pending",
      platformOrganizationId: task.platformOrganizationId,
      clientWorkspaceId: task.clientWorkspaceId ?? undefined,
      projectId: task.projectId ?? undefined,
      metadata: {
        governedSharedApplication: true,
        taskType: task.taskType,
        taskId: task.id,
        generationMethod: governed?.content ? "governed" : "deterministic",
        latencyMs,
        confidence: 0.85,
        totalCost: 0,
        fileCount: files.length,
        format,
      },
    },
  ).catch(() => {});

  return outputResult;
}
