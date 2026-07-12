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
  _count?: { outputs: number; sourceFiles: number };
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
    metadata: Record<string, unknown> | null;
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
    extractedAt: Date | null;
    extractionMeta: Record<string, unknown> | null;
    storageKey: string | null;
    fileHash: string | null;
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

export async function getUserTaskList(userId: string, filters?: {
  status?: string;
  search?: string;
  workspaceId?: string;
  projectId?: string;
  taskType?: string;
}) {
  const user = await getCurrentUser();
  const platformOrgId = user.platformOrganizationId;
  if (!platformOrgId) return { workspaces: [], projects: [], tasks: [], taskCounts: [], recentActivity: [] };

  const [workspaces, projects] = await Promise.all([
    prisma.clientWorkspace.findMany({
      where: { platformOrganizationId: platformOrgId, status: "active" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { status: "active" },
      select: { id: true, name: true, workspaceId: true },
      orderBy: { name: "asc" },
      take: 50,
    }),
  ]);

  const where: Record<string, unknown> = { createdById: userId };
  if (filters?.status) where.status = filters.status;
  if (filters?.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { instructions: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters?.workspaceId) where.clientWorkspaceId = filters.workspaceId;
  if (filters?.projectId) where.projectId = filters.projectId;
  if (filters?.taskType) where.taskType = filters.taskType;

  const tasks = await prisma.officeAiTask.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      _count: { select: { outputs: true, sourceFiles: true } },
    },
  });

  const counts = await prisma.officeAiTask.groupBy({
    by: ["status"],
    where: { createdById: userId },
    _count: true,
  });

  const recentActivity = await prisma.officeAiTask.findMany({
    where: { createdById: userId },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      taskType: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    workspaces,
    projects,
    tasks: tasks as unknown as WorkspaceTaskItem[],
    taskCounts: counts.map((c) => ({ status: c.status, _count: c._count })),
    recentActivity,
  };
}

export async function getWorkspaceNameById(workspaceId: string) {
  const ws = await prisma.clientWorkspace.findUnique({
    where: { id: workspaceId },
    select: { name: true },
  });
  return ws?.name ?? null;
}

export async function getProjectNameById(projectId: string) {
  const proj = await prisma.project.findUnique({
    where: { id: projectId },
    select: { name: true },
  });
  return proj?.name ?? null;
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
