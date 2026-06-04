"use server";

import { requireUserContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { classifyTask, type TaskCategory } from "@/lib/office-ai/taxonomy";

export interface AssistantStats {
  totalTasks: number;
  totalOutputs: number;
  totalFiles: number;
  tasksByType: Record<TaskCategory, number>;
  tasksByStatus: Record<string, number>;
  recentTasks: Array<{
    id: string;
    taskType: string;
    title: string | null;
    status: string;
    createdAt: Date;
  }>;
  averageOutputsPerTask: number;
}

export async function getAssistantStats(
  organizationId: string,
): Promise<AssistantStats> {
  const user = await requireUserContext("VIEWER");

  const orgId = organizationId || user.platformOrganizationId;
  if (!orgId) throw new Error("Organization ID required");

  const [allTasks, totalOutputs, totalFiles] = await Promise.all([
    prisma.officeAiTask.findMany({
      where: { platformOrganizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 1000,
      select: {
        id: true,
        taskType: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.officeAiOutput.count({
      where: { task: { platformOrganizationId: orgId } },
    }),
    prisma.officeAiFile.count({
      where: { task: { platformOrganizationId: orgId } },
    }),
  ]);

  const totalTasks = allTasks.length;

  const tasksByType: Record<string, number> = {};
  const tasksByStatus: Record<string, number> = {};

  for (const t of allTasks) {
    const cat = classifyTask(t.taskType);
    tasksByType[cat] = (tasksByType[cat] || 0) + 1;
    tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
  }

  const averageOutputsPerTask = totalTasks > 0 ? totalOutputs / totalTasks : 0;

  return {
    totalTasks,
    totalOutputs,
    totalFiles,
    tasksByType: tasksByType as Record<TaskCategory, number>,
    tasksByStatus,
    recentTasks: allTasks.slice(0, 10),
    averageOutputsPerTask,
  };
}
