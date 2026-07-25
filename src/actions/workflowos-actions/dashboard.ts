"use server";

import { createLogger } from "@/lib/observability/logger";
import {
  getCurrentUser,
  enforce,
  prisma,
} from "./common";

const logger = createLogger({ product: "platform", action: "workflowos" });

export async function getWorkflowDashboardStats(organizationId: string) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "organization", id: organizationId, tenantId: organizationId }, "update");

    const [
      totalTemplates,
      totalRecords,
      activeRecords,
      completedToday,
      overdueRecords,
      statusDistribution,
      priorityDistribution,
      recentRecords,
    ] = await Promise.all([
      prisma.workflowTemplate.count({ where: { organizationId, status: "active" } }),
      prisma.workflowRecord.count({ where: { organizationId } }),
      prisma.workflowRecord.count({ where: { organizationId, status: { notIn: ["completed", "cancelled"] } } }),
      prisma.workflowRecord.count({
        where: {
          organizationId,
          status: "completed",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
      prisma.workflowRecord.count({
        where: {
          organizationId,
          dueDate: { lt: new Date() },
          status: { notIn: ["completed", "cancelled"] },
        },
      }),
      prisma.workflowRecord.groupBy({
        by: ["status"],
        where: { organizationId },
        _count: true,
      }),
      prisma.workflowRecord.groupBy({
        by: ["priority"],
        where: { organizationId },
        _count: true,
      }),
      prisma.workflowRecord.findMany({
        where: { organizationId },
        orderBy: { updatedAt: "desc" },
        take: 10,
        select: { id: true, title: true, status: true, priority: true, updatedAt: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalTemplates,
        totalRecords,
        activeRecords,
        completedToday,
        overdueRecords,
        statusDistribution,
        priorityDistribution,
        recentRecords,
      },
    };
  } catch (error) {
    logger.error("Error getting dashboard stats:", error instanceof Error ? error : undefined);
    return { success: false, error: "Failed to get dashboard stats" };
  }
}

export async function getWorkflowEvidenceAction(recordId: string, organizationId: string, offset?: number) {
  await getCurrentUser();
  const PAGE_SIZE = 50;
  const [evidence, totalCount] = await Promise.all([
    prisma.workflowEvidence.findMany({
      where: { organizationId, recordId },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: offset || 0,
    }),
    prisma.workflowEvidence.count({ where: { organizationId, recordId } }),
  ]);
  return { evidence, totalCount, hasMore: (offset || 0) + PAGE_SIZE < totalCount };
}

export async function getWorkflowAuditEventsAction(recordId: string, organizationId: string, offset?: number) {
  await getCurrentUser();
  const PAGE_SIZE = 50;
  // [MIGRATED] workflowAuditEvent → platformAuditLog (dual-write with productKey: "workflowos")
  // const [events, totalCount] = await Promise.all([
  //   prisma.workflowAuditEvent.findMany({
  //     where: { organizationId, recordId },
  //     orderBy: { createdAt: "desc" },
  //     take: PAGE_SIZE,
  //     skip: offset || 0,
  //   }),
  //   prisma.workflowAuditEvent.count({ where: { organizationId, recordId } }),
  // ]);
  const [events, totalCount] = await Promise.all([
    prisma.platformAuditLog.findMany({
      where: { productKey: "workflowos", organizationId, targetId: recordId },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: offset || 0,
    }),
    prisma.platformAuditLog.count({ where: { productKey: "workflowos", organizationId, targetId: recordId } }),
  ]);
  // Map PlatformAuditLog fields to expected AuditEventItem shape
  const mappedEvents = events.map((e) => ({
    id: e.id,
    organizationId: e.organizationId ?? "",
    recordId: e.targetId ?? recordId,
    actorId: e.actorId ?? "",
    actorName: e.actorName ?? null,
    action: e.action,
    fromStatus: (e.beforeState ?? (e.metadata as Record<string, unknown> | null)?.fromStatus ?? null) as string | null,
    toStatus: (e.afterState ?? (e.metadata as Record<string, unknown> | null)?.toStatus ?? null) as string | null,
    comment: ((e.metadata as Record<string, unknown> | null)?.comment ?? e.eventDescription ?? null) as string | null,
    createdAt: e.createdAt,
  }));
  return { events: mappedEvents, totalCount, hasMore: (offset || 0) + PAGE_SIZE < totalCount };
}
