"use server"

import { getCurrentUser } from "@/lib/auth"
import { enforce } from "@/lib/kernel"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import type { Prisma } from "@prisma/client"
import { auditLogger, Product } from "@/lib/platform/audit-logger"

async function assertUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error("Authentication required")
  return user
}

export async function createNotification(params: {
  organizationId: string
  userId: string
  type: string
  title: string
  body?: string
  link?: string
  metadata?: Record<string, unknown>
}) {
  return prisma.notification.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link,
      metadata: (params.metadata ?? {}) as Prisma.InputJsonValue,
    },
  }).then(async (notification) => {
    try {
      const alog = auditLogger({
        productKey: Product.PLATFORM,
        sourceSystem: "notifications",
        actor: { id: params.userId },
      });
      await alog.record("notification.created", { type: "Notification", id: notification.id }, { severity: "info" });
    } catch { /* audit must not block */ }
    return notification;
  })
}

export async function getUnreadNotifications(limit = 20) {
  const user = await assertUser()
  return prisma.notification.findMany({
    where: { userId: user.id, read: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
}

export async function getNotifications(limit = 50, offset = 0) {
  const user = await assertUser()
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where: { userId: user.id } }),
  ])
  return { notifications, total }
}

export async function markAsRead(notificationId: string) {
  const user = await assertUser()
  await enforce(user, { type: "organization", id: notificationId, tenantId: user.organizationId }, "update")
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { read: true, readAt: new Date() },
  })

  try {
    const alog = auditLogger({
      productKey: Product.PLATFORM,
      sourceSystem: "notifications",
      actor: { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined },
    });
    await alog.record("notification.read", { type: "Notification", id: notificationId }, { severity: "info" });
  } catch { /* audit must not block */ }

  revalidatePath("/notifications")
  return { success: true }
}

export async function markAllAsRead() {
  const user = await assertUser()
  await enforce(user, { type: "organization", id: user.id, tenantId: user.organizationId }, "update")
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true, readAt: new Date() },
  })

  try {
    const alog = auditLogger({
      productKey: Product.PLATFORM,
      sourceSystem: "notifications",
      actor: { id: user.id, name: user.name ?? undefined, email: user.email ?? undefined },
    });
    await alog.record("notification.all_read", { type: "Notification", id: user.id }, { severity: "info" });
  } catch { /* audit must not block */ }

  revalidatePath("/notifications")
  return { success: true }
}

export async function getUnreadCount() {
  const user = await assertUser().catch(() => null)
  if (!user) return 0
  return prisma.notification.count({
    where: { userId: user.id, read: false },
  })
}
