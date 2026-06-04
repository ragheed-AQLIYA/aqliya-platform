import "server-only";
import { prisma } from "@/lib/prisma";

export interface ConversationContext {
  taskId: string;
  previousOutputs: Array<{ content: string; format: string; status: string; createdAt: Date }>;
  recentTasks: Array<{ taskType: string; title: string | null; status: string; createdAt: Date }>;
  totalTasks: number;
  totalOutputs: number;
}

/**
 * Load conversation context for a specific task — previous outputs and
 * recent task history from the same org/user.
 */
export async function loadConversationContext(
  taskId: string,
  organizationId: string,
  userId?: string,
): Promise<ConversationContext> {
  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    select: {
      outputs: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { content: true, format: true, status: true, createdAt: true },
      },
    },
  });

  const recentTasks = await prisma.officeAiTask.findMany({
    where: { 
      platformOrganizationId: organizationId,
      ...(userId ? { createdById: userId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { taskType: true, title: true, status: true, createdAt: true },
  });

  const [totalTasks, totalOutputs] = await Promise.all([
    prisma.officeAiTask.count({ where: { platformOrganizationId: organizationId } }),
    prisma.officeAiOutput.count({
      where: { task: { platformOrganizationId: organizationId } },
    }),
  ]);

  return {
    taskId,
    previousOutputs: task?.outputs ?? [],
    recentTasks,
    totalTasks,
    totalOutputs,
  };
}
