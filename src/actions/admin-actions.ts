"use server"

import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { $Enums } from "@/generated/prisma/client"
import { createNotification } from "./notification-actions"

async function assertAdmin(_organizationId?: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")
  if (user.role !== "ADMIN") throw new Error("Admin access required")
  return user
}

const PAGE_SIZE = 50;

export async function listUsers(organizationId: string, offset?: number) {
  await assertAdmin(organizationId)
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: offset || 0,
    }),
    prisma.user.count({ where: { organizationId } }),
  ])
  return { users, totalCount, hasMore: (offset || 0) + PAGE_SIZE < totalCount }
}

export async function updateUserRole(
  userId: string,
  newRole: string,
  organizationId: string,
) {
  await assertAdmin(organizationId)
  const validRoles = ["ADMIN", "OPERATOR", "VIEWER"]
  if (!validRoles.includes(newRole)) throw new Error(`Invalid role: ${newRole}`)

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")
  if (user.organizationId !== organizationId) {
    throw new Error("Access denied: user belongs to another organization")
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole as $Enums.UserRole },
  })

  await createNotification({
    organizationId,
    userId,
    type: "system",
    title: "تم تحديث صلاحياتك",
    body: `تم تغيير دورك في المنصة إلى ${newRole === "ADMIN" ? "مدير" : newRole === "OPERATOR" ? "مشغل" : "مشاهد"}`,
    link: "/settings",
  })

  revalidatePath("/admin")
  return { success: true, userId, newRole }
}

export async function getSystemConfig(organizationId: string) {
  await assertAdmin(organizationId)
  return {
    environment: process.env.NODE_ENV ?? "development",
    storageProvider: process.env.STORAGE_PROVIDER ?? "local",
    scannerProvider: process.env.SCANNER_PROVIDER ?? "none",
    rateLimiter: process.env.RATE_LIMITER ?? "memory",
    cachePrefix: process.env.CACHE_PREFIX ?? "aqliya:cache:",
    tracing: process.env.ENABLE_TRACING === "true",
    features: {
      abacEnforce: process.env.FF_ABAC_ENFORCE === "true",
      abacShadow: process.env.FF_ABAC_SHADOW === "true",
      eventOutbox: process.env.FF_EVENT_OUTBOX === "true",
      schemaRegistry: process.env.FF_EVENT_SCHEMA_REGISTRY === "true",
      aiProviders: process.env.FF_AI_REAL_PROVIDERS === "true",
    },
  }
}

export async function getPlatformStats(organizationId: string) {
  await assertAdmin(organizationId)
  const [
    userCount,
    orgCount,
    engagementCount,
    decisionCount,
    auditEventCount,
    evidenceCount,
  ] = await Promise.all([
    prisma.user.count({ where: { organizationId } }),
    prisma.organization.count(),
    prisma.auditEngagement.count({ where: { organizationId } }),
    prisma.decision.count({ where: { organizationId } }),
    prisma.auditEvent.count(),
    prisma.auditEvidence.count(),
  ])

  return {
    users: userCount,
    organizations: orgCount,
    engagements: engagementCount,
    decisions: decisionCount,
    auditEvents: auditEventCount,
    evidenceFiles: evidenceCount,
  }
}

export async function listAuditEvents(organizationId: string, limit = 50, offset = 0) {
  await assertAdmin(organizationId)

  try {
    const [events, total] = await Promise.all([
      prisma.platformAuditLog.findMany({
        where: { platformOrganizationId: organizationId },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        select: {
          id: true,
          action: true,
          targetType: true,
          targetId: true,
          actorId: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.platformAuditLog.count({
        where: { platformOrganizationId: organizationId },
      }),
    ])

    return { events, total, limit, offset }
  } catch {
    return { events: [], total: 0, limit, offset }
  }
}

export async function checkDatabaseHealth() {
  await assertAdmin();
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latency: Date.now() - dbStart };
  } catch {
    return { ok: false, latency: Date.now() - dbStart };
  }
}

export async function getSunbulStats() {
  await assertAdmin();
  const allUsers = await prisma.user.findMany({
    select: { role: true },
  });

  const [sunbulClientCount, sunbulMembershipCount, sunbulRecordCount] = await Promise.all([
    prisma.sunbulClient.count(),
    prisma.sunbulUserMembership.count(),
    prisma.sunbulRecord.count(),
  ]);

  return {
    adminCount: allUsers.filter((u) => u.role === "ADMIN").length,
    operatorCount: allUsers.filter((u) => u.role === "OPERATOR").length,
    viewerCount: allUsers.filter((u) => u.role === "VIEWER").length,
    totalUsers: allUsers.length,
    sunbulClientCount,
    sunbulMembershipCount,
    sunbulRecordCount,
    sunbulStatus: sunbulRecordCount > 0 ? "جاهز للتشغيل" : "نموذج أولي",
  };
}

export async function getSystemHealthSummary(organizationId: string) {
  await assertAdmin(organizationId)

  try {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const [totalEvents, recentErrors, activeUsers] = await Promise.all([
      prisma.platformAuditLog.count({ where: { platformOrganizationId: organizationId } }),
      prisma.platformAuditLog.count({
        where: {
          platformOrganizationId: organizationId,
          createdAt: { gte: last24h },
          severity: "error",
        },
      }),
      prisma.user.count({ where: { organizationId } }),
    ])

    return {
      totalEvents,
      recentErrors24h: recentErrors,
      activeUsers,
      last24hEvents: await prisma.platformAuditLog.count({
        where: {
          platformOrganizationId: organizationId,
          createdAt: { gte: last24h },
        },
      }),
    }
  } catch {
    return { totalEvents: 0, recentErrors24h: 0, activeUsers: 0, last24hEvents: 0 }
  }
}
