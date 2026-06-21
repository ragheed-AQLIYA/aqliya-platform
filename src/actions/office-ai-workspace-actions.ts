import "server-only";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface WorkspaceTaskItem {
  id: string;
  taskType: string;
  title: string | null;
  status: string;
  language: string;
  instructions: string | null;
  createdByName: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  outputs: Array<{
    id: string;
    status: string;
    format: string;
    confidenceScore: number | null;
    aiProvider: string | null;
    createdAt: Date;
  }>;
  sourceFiles: Array<{ id: string; filename: string; fileType: string }>;
}

export interface TaskDetail extends WorkspaceTaskItem {
  clientWorkspaceId: string | null;
  projectId: string | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  approvedById: string | null;
  approvedAt: Date | null;
  metadata: unknown;
  outputs: Array<{
    id: string;
    content: string;
    status: string;
    format: string;
    confidenceScore: number | null;
    aiProvider: string | null;
    aiModel: string | null;
    aiPromptVersion: string | null;
    reviewedById: string | null;
    reviewedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
  sourceFiles: Array<{
    id: string;
    filename: string;
    fileType: string;
    mimeType: string | null;
    sizeBytes: number | null;
    uploadedById: string | null;
    extractedContent: string | null;
    extractionStatus: string | null;
    createdAt: Date;
  }>;
}

export interface AuditEventEntry {
  id: string;
  action: string;
  actorName: string | null;
  severity: string;
  targetLabel: string | null;
  metadata: unknown;
  createdAt: Date;
}

export async function listOfficeAiWorkspaceTasks(): Promise<{
  tasks: WorkspaceTaskItem[];
  totalCount: number;
}> {
  const user = await getCurrentUser();
  const orgId = user.platformOrganizationId || user.organizationId;

  if (!orgId) {
    return { tasks: [], totalCount: 0 };
  }

  const tasks = await prisma.officeAiTask.findMany({
    where: { platformOrganizationId: orgId },
    orderBy: { createdAt: "desc" },
    include: {
      outputs: {
        select: {
          id: true,
          status: true,
          format: true,
          confidenceScore: true,
          aiProvider: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      sourceFiles: {
        select: { id: true, filename: true, fileType: true },
        take: 5,
      },
    },
  });

  const totalCount = await prisma.officeAiTask.count({
    where: { platformOrganizationId: orgId },
  });

  return {
    tasks: tasks as unknown as WorkspaceTaskItem[],
    totalCount,
  };
}

export async function getTaskDetail(taskId: string): Promise<TaskDetail | null> {
  const user = await getCurrentUser();
  const orgId = user.platformOrganizationId || user.organizationId;

  const task = await prisma.officeAiTask.findUnique({
    where: { id: taskId },
    include: {
      outputs: { orderBy: { createdAt: "desc" } },
      sourceFiles: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!task) return null;
  if (orgId && task.platformOrganizationId !== orgId) return null;

  return task as unknown as TaskDetail;
}

export async function getTaskAuditTrail(taskId: string): Promise<AuditEventEntry[]> {
  const user = await getCurrentUser();
  const orgId = user.platformOrganizationId || user.organizationId;

  const events = await prisma.platformAuditLog.findMany({
    where: {
      sourceModel: "OfficeAiTask",
      sourceId: taskId,
      platformOrganizationId: orgId || undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      action: true,
      actorName: true,
      severity: true,
      targetLabel: true,
      metadata: true,
      createdAt: true,
    },
  });

  return events as unknown as AuditEventEntry[];
}
